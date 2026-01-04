import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createHash } from 'crypto';

export async function POST(
  request: NextRequest,
{ params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: offer, error: offerError } = await supabase
      .from('supplier_offers')
      .select(`
        *,
        campaigns(*),
        supplier_offer_rows(*)
      `)
      .eq('id', id)
      .eq('supplier_id', user.id)
      .maybeSingle();

    if (offerError || !offer) {
      return NextResponse.json(
        { error: 'Offer not found' },
        { status: 404 }
      );
    }

    if (offer.status !== 'submitted') {
      return NextResponse.json(
        { error: 'Offer already signed or not in submitted status' },
        { status: 400 }
      );
    }

    const deedContent = JSON.stringify({
      offer_id: offer.id,
      campaign_id: offer.campaign_id,
      supplier_id: user.id,
      terms: offer.terms_json,
      rows: offer.supplier_offer_rows,
      timestamp: new Date().toISOString(),
    });

    const hash = createHash('sha256').update(deedContent).digest('hex');

    const { data: deed, error: deedError } = await supabase
      .from('deeds')
      .insert({
        kind: 'feed',
        status: 'signed',
        signer_id: user.id,
        context_type: 'supplier_offer',
        context_id: offer.id,
        doc_hash: hash,
        signed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (deedError) {
      console.error('Failed to create deed:', deedError);
      return NextResponse.json(
        { error: 'Failed to create deed' },
        { status: 500 }
      );
    }

    await supabase
      .from('supplier_offers')
      .update({ status: 'signed' })
      .eq('id', offer.id);

    await supabase.from('audit_logs').insert({
      actor_user_id: user.id,
      action: 'feed_deed_signed',
      entity_type: 'deed',
      entity_id: deed.id,
      payload_json: {
        offer_id: offer.id,
        campaign_id: offer.campaign_id,
      },
    });

    return NextResponse.json({
      success: true,
      deed_id: deed.id,
    });
  } catch (error: any) {
    console.error('Failed to sign offer:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to sign offer' },
      { status: 500 }
    );
  }
}
