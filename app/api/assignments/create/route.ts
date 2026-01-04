import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { calculateWEEDFee } from '@/lib/assignment-helpers';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { campaign_need_id, campaign_feed_id, selected_offer_id } = body;

    if (!campaign_need_id || !campaign_feed_id || !selected_offer_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data: needCampaign } = await supabase
      .from('campaigns')
      .select('*, need_campaigns(*)')
      .eq('id', campaign_need_id)
      .eq('kind', 'need')
      .maybeSingle();

    if (!needCampaign || needCampaign.created_by !== user.id) {
      return NextResponse.json(
        { error: 'Need campaign not found or unauthorized' },
        { status: 404 }
      );
    }

    const { data: feedCampaign } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', campaign_feed_id)
      .eq('kind', 'feed')
      .maybeSingle();

    if (!feedCampaign || feedCampaign.created_by !== user.id) {
      return NextResponse.json(
        { error: 'Feed campaign not found or unauthorized' },
        { status: 404 }
      );
    }

    if (feedCampaign.status_feed !== 'supplier_selected') {
      return NextResponse.json(
        { error: 'Supplier must be selected before creating assignment' },
        { status: 400 }
      );
    }

    const { data: selectedOffer } = await supabase
      .from('supplier_offers')
      .select(`
        *,
        supplier_offer_rows(
          *,
          campaign_items(*)
        )
      `)
      .eq('id', selected_offer_id)
      .eq('status', 'selected')
      .maybeSingle();

    if (!selectedOffer) {
      return NextResponse.json(
        { error: 'Selected offer not found' },
        { status: 404 }
      );
    }

    const { data: existingAssignment } = await supabase
      .from('assignments')
      .select('id')
      .eq('campaign_feed_id', campaign_feed_id)
      .maybeSingle();

    if (existingAssignment) {
      return NextResponse.json(
        { error: 'Assignment already exists for this campaign', assignment_id: existingAssignment.id },
        { status: 400 }
      );
    }

    const { data: needDeeds } = await supabase
      .from('deeds')
      .select(`
        *,
        deed_signers(*)
      `)
      .eq('campaign_id', campaign_need_id)
      .eq('deed_kind', 'need_deed')
      .eq('status', 'signed');

    if (!needDeeds || needDeeds.length === 0) {
      return NextResponse.json(
        { error: 'No signed Need Deeds found for this campaign' },
        { status: 400 }
      );
    }

    const totalValue = selectedOffer.supplier_offer_rows.reduce(
      (sum: number, row: any) => sum + row.unit_price * row.min_qty,
      0
    );

    const weedFee = calculateWEEDFee(totalValue);

    const reedDocJson = {
      title: `Assignment (Reed) Deed - ${needCampaign.title}`,
      type: 'assignment_deed',
      created_at: new Date().toISOString(),
      parties: {
        initiator: {
          user_id: user.id,
          role: 'campaign_creator',
        },
        supplier: {
          user_id: selectedOffer.supplier_id,
          offer_id: selected_offer_id,
        },
        backers: needDeeds.map((deed: any) => {
          const backerSigner = deed.deed_signers.find((s: any) => s.signer_kind === 'backer');
          return {
            user_id: backerSigner?.user_id,
            need_deed_id: deed.id,
          };
        }),
      },
      financial_summary: {
        total_order_value: totalValue,
        weed_fee: weedFee,
        weed_fee_percentage: 0.03,
        currency: needCampaign.need_campaigns?.[0]?.currency || 'USD',
      },
      terms: {
        payment_terms: selectedOffer.terms_json?.payment_terms || '',
        delivery_terms: selectedOffer.terms_json?.delivery_terms || '',
        warranty: selectedOffer.terms_json?.warranty || '',
      },
      items: selectedOffer.supplier_offer_rows.map((row: any) => ({
        item_code: row.campaign_items.item_code,
        title: row.campaign_items.title,
        unit_price: row.unit_price,
        quantity: row.min_qty,
        lead_time_days: row.lead_time_days,
        total: row.unit_price * row.min_qty,
      })),
      linked_deeds: {
        need_campaign_id: campaign_need_id,
        feed_campaign_id: campaign_feed_id,
        need_deed_ids: needDeeds.map((d: any) => d.id),
      },
    };

    const docHash = crypto
      .createHash('sha256')
      .update(JSON.stringify(reedDocJson))
      .digest('hex');

    const { data: reedDeed, error: deedError } = await supabase
      .from('deeds')
      .insert({
        deed_kind: 'assignment_deed',
        status: 'draft',
        campaign_id: campaign_need_id,
        doc_json: reedDocJson,
        doc_hash: docHash,
        created_by: user.id,
      })
      .select()
      .single();

    if (deedError || !reedDeed) {
      throw new Error('Failed to create assignment deed');
    }

    const { data: assignment, error: assignmentError } = await supabase
      .from('assignments')
      .insert({
        campaign_need_id,
        campaign_feed_id,
        selected_offer_id,
        assignment_deed_id: reedDeed.id,
        status: 'draft',
      })
      .select()
      .single();

    if (assignmentError || !assignment) {
      throw new Error('Failed to create assignment');
    }

    const assignmentNeedDeedLinks = needDeeds.map((deed: any) => ({
      assignment_id: assignment.id,
      need_deed_id: deed.id,
    }));

    await supabase.from('assignment_need_deeds').insert(assignmentNeedDeedLinks);

    const backerSigners = needDeeds
      .map((deed: any) => {
        const backerSigner = deed.deed_signers.find((s: any) => s.signer_kind === 'backer');
        return backerSigner
          ? {
              deed_id: reedDeed.id,
              user_id: backerSigner.user_id,
              signer_kind: 'backer',
              status: 'invited',
            }
          : null;
      })
      .filter(Boolean);

    const supplierSigner = {
      deed_id: reedDeed.id,
      user_id: selectedOffer.supplier_id,
      signer_kind: 'supplier',
      status: 'invited',
    };

    const initiatorSigner = {
      deed_id: reedDeed.id,
      user_id: user.id,
      signer_kind: 'initiator',
      status: 'invited',
    };

    await supabase
      .from('deed_signers')
      .insert([...backerSigners, supplierSigner, initiatorSigner]);

    await supabase.from('audit_logs').insert({
      actor_user_id: user.id,
      action: 'assignment_created',
      entity_type: 'assignment',
      entity_id: assignment.id,
      payload_json: {
        campaign_need_id,
        campaign_feed_id,
        selected_offer_id,
        assignment_deed_id: reedDeed.id,
        total_value: totalValue,
        weed_fee: weedFee,
        backer_count: backerSigners.length,
      },
    });

    const backerNotifications = backerSigners.map((signer: any) => ({
      user_id: signer.user_id,
      type: 'assignment_created',
      title: 'Assignment Deed Ready',
      message: `An Assignment (Reed) Deed has been created for "${needCampaign.title}". Please review and sign.`,
      link: `/workspace/assignments/${assignment.id}`,
      read: false,
    }));

    const supplierNotification = {
      user_id: selectedOffer.supplier_id,
      type: 'assignment_created',
      title: 'Assignment Deed Ready',
      message: `An Assignment (Reed) Deed has been created for your selected offer on "${needCampaign.title}". Please review and sign.`,
      link: `/workspace/assignments/${assignment.id}`,
      read: false,
    };

    await supabase
      .from('notifications')
      .insert([...backerNotifications, supplierNotification]);

    return NextResponse.json({
      success: true,
      assignment_id: assignment.id,
      assignment_deed_id: reedDeed.id,
    });
  } catch (error: any) {
    console.error('Failed to create assignment:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create assignment' },
      { status: 500 }
    );
  }
}
