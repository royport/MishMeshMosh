import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: campaignId } = await params; // ✅ Next 16: params is a Promise

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as { offer_id?: string };
    const { offer_id } = body;

    if (!offer_id) {
      return NextResponse.json({ error: 'Missing offer_id' }, { status: 400 });
    }

    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', campaignId)
      .eq('kind', 'feed')
      .maybeSingle();

    if (campaignError || !campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    if (campaign.created_by !== user.id) {
      return NextResponse.json(
        { error: 'Not authorized to select supplier for this campaign' },
        { status: 403 }
      );
    }

    if (campaign.status_feed !== 'open') {
      return NextResponse.json(
        { error: 'Campaign is not open for supplier selection' },
        { status: 400 }
      );
    }

    const { data: selectedOffer, error: offerError } = await supabase
      .from('supplier_offers')
      .select('*, supplier:users!supplier_id(id, email, user_metadata)')
      .eq('id', offer_id)
      .eq('campaign_id', campaignId)
      .maybeSingle();

    if (offerError || !selectedOffer) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
    }

    const { data: allOffers } = await supabase
      .from('supplier_offers')
      .select('id, supplier_id, status')
      .eq('campaign_id', campaignId)
      .eq('status', 'signed');

    await supabase
      .from('campaigns')
      .update({
        status_feed: 'supplier_selected',
        updated_at: new Date().toISOString(),
      })
      .eq('id', campaignId);

    await supabase
      .from('supplier_offers')
      .update({ status: 'selected' })
      .eq('id', offer_id);

    const rejectedOfferIds = allOffers
      ?.filter((o: any) => o.id !== offer_id)
      .map((o: any) => o.id);

    if (rejectedOfferIds && rejectedOfferIds.length > 0) {
      await supabase
        .from('supplier_offers')
        .update({ status: 'rejected' })
        .in('id', rejectedOfferIds);
    }

    const winnerNotification = {
      user_id: selectedOffer.supplier_id,
      type: 'supplier_selected',
      title: 'Your offer was selected!',
      message: `Congratulations! Your offer for "${campaign.title}" has been selected. The campaign organizer will contact you to proceed with the next steps.`,
      link: `/workspace/offers/${offer_id}`,
      read: false,
    };

    await supabase.from('notifications').insert(winnerNotification);

    if (allOffers) {
      const loserNotifications = allOffers
        .filter((o: any) => o.id !== offer_id)
        .map((o: any) => ({
          user_id: o.supplier_id,
          type: 'offer_rejected',
          title: 'Offer not selected',
          message: `Thank you for your offer on "${campaign.title}". Unfortunately, another supplier was selected for this opportunity.`,
          link: `/campaign/${campaignId}`,
          read: false,
        }));

      if (loserNotifications.length > 0) {
        await supabase.from('notifications').insert(loserNotifications);
      }
    }

    await supabase.from('audit_logs').insert({
      actor_user_id: user.id,
      action: 'supplier_selected',
      entity_type: 'campaign',
      entity_id: campaignId,
      payload_json: {
        offer_id,
        supplier_id: selectedOffer.supplier_id,
        supplier_name:
          selectedOffer.supplier?.user_metadata?.display_name ||
          selectedOffer.supplier?.email,
        total_offers: allOffers?.length || 0,
        rejected_offers: rejectedOfferIds?.length || 0,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Supplier selected successfully',
    });
  } catch (error: any) {
    console.error('Failed to select supplier:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to select supplier' },
      { status: 500 }
    );
  }
}
