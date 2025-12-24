import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { campaignId, items } = body;

    if (!campaignId || !items || items.length === 0) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select(`
        *,
        need_campaigns(*),
        campaign_items(*)
      `)
      .eq('id', campaignId)
      .eq('kind', 'need')
      .maybeSingle();

    if (campaignError || !campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    if (campaign.status_need !== 'live') {
      return NextResponse.json({ error: 'Campaign is not open for commitments' }, { status: 400 });
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { data: pledge, error: pledgeError } = await supabase
      .from('need_pledges')
      .insert({
        campaign_id: campaignId,
        backer_id: user.id,
        status: 'active',
      })
      .select()
      .single();

    if (pledgeError || !pledge) {
      return NextResponse.json({ error: 'Failed to create pledge' }, { status: 500 });
    }

    const pledgeRows = items.map((item: any) => ({
      pledge_id: pledge.id,
      campaign_item_id: item.itemId,
      quantity: item.quantity,
    }));

    const { error: rowsError } = await supabase
      .from('need_pledge_rows')
      .insert(pledgeRows);

    if (rowsError) {
      await supabase.from('need_pledges').delete().eq('id', pledge.id);
      return NextResponse.json({ error: 'Failed to create pledge rows' }, { status: 500 });
    }

    const itemsData = items.map((item: any) => {
      const campaignItem = campaign.campaign_items.find((ci: any) => ci.id === item.itemId);
      return {
        id: item.itemId,
        title: campaignItem?.title || '',
        description: campaignItem?.description || '',
        unit: campaignItem?.unit || 'unit',
        quantity: item.quantity,
        unitPrice: campaignItem?.variant_json?.unit_price || 0,
        rowTotal: (campaignItem?.variant_json?.unit_price || 0) * item.quantity,
      };
    });

    const totalValue = itemsData.reduce((sum: number, item: any) => sum + item.rowTotal, 0);

    const deedDocument: any = {
      deed: {
        id: '',
        status: 'signed',
        version: 1,
        signed_at: new Date().toISOString(),
        doc_hash: '',
        verify_url: '',
      },
      campaign: {
        id: campaign.id,
        title: campaign.title,
        description: campaign.description,
      },
      backer: {
        id: user.id,
        full_name: userData.full_name || 'Unknown',
        email: userData.email || '',
        phone: userData.phone || 'Not provided',
      },
      platform: {
        legal_name: 'MishMeshMosh Ltd.',
        company_number: 'TBD',
        address: 'TBD',
        master_terms_ref: 'v1.0',
      },
      items: itemsData,
      totals: {
        currency: campaign.need_campaigns?.[0]?.currency || 'USD',
        total_value: totalValue.toFixed(2),
      },
      delivery: {
        address: 'To be determined upon assignment',
        window: campaign.need_campaigns?.[0]?.delivery_terms_json?.window || 'TBD',
        packaging_requirements: campaign.need_campaigns?.[0]?.delivery_terms_json?.packaging || 'Standard',
        services_included: campaign.need_campaigns?.[0]?.delivery_terms_json?.services || 'None',
      },
      payment: {
        deposit_rule: campaign.need_campaigns?.[0]?.deposit_policy_json?.rule || 'No deposit required',
        balance_rule: campaign.need_campaigns?.[0]?.payment_structure_json?.balance || 'Payment on delivery',
        method: campaign.need_campaigns?.[0]?.payment_structure_json?.method || 'Bank transfer',
      },
      signature: {
        method: 'Digital consent',
        record_ref: pledge.id,
      },
    };

    const docString = JSON.stringify(deedDocument);
    const docHash = crypto.createHash('sha256').update(docString).digest('hex');

    deedDocument.deed.doc_hash = docHash;

    const { data: deed, error: deedError } = await supabase
      .from('deeds')
      .insert({
        deed_kind: 'need_deed',
        status: 'signed',
        campaign_id: campaignId,
        version: 1,
        doc_json: deedDocument,
        doc_hash: docHash,
        created_by: user.id,
        opened_for_signature_at: new Date().toISOString(),
        executed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (deedError || !deed) {
      await supabase.from('need_pledges').delete().eq('id', pledge.id);
      return NextResponse.json({ error: 'Failed to create deed' }, { status: 500 });
    }

    deedDocument.deed.id = deed.id;
    deedDocument.deed.verify_url = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/deed/${deed.id}/verify`;

    await supabase
      .from('deeds')
      .update({ doc_json: deedDocument })
      .eq('id', deed.id);

    await supabase
      .from('deed_signers')
      .insert({
        deed_id: deed.id,
        user_id: user.id,
        signer_kind: 'backer',
        status: 'signed',
        signed_at: new Date().toISOString(),
        signature_meta_json: {
          method: 'digital_consent',
          ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
          user_agent: request.headers.get('user-agent') || 'unknown',
        },
      });

    await supabase
      .from('participations')
      .insert({
        user_id: user.id,
        context_type: 'campaign',
        context_id: campaignId,
        participation_kind: 'backer',
      });

    return NextResponse.json({
      success: true,
      deedId: deed.id,
      pledgeId: pledge.id,
    });
  } catch (error: any) {
    console.error('Error creating need deed:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
