import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { campaign_id, offer_rows, terms } = body;

    if (!campaign_id || !offer_rows || !terms) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data: offer, error: offerError } = await supabase
      .from('supplier_offers')
      .insert({
        campaign_id,
        supplier_id: user.id,
        status: 'submitted',
        terms_json: terms,
        submitted_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (offerError) {
      console.error('Failed to create offer:', offerError);
      return NextResponse.json(
        { error: 'Failed to create offer' },
        { status: 500 }
      );
    }

    const offerRowsWithOfferId = offer_rows.map((row: any) => ({
      offer_id: offer.id,
      campaign_item_id: row.item_id,
      unit_price: parseFloat(row.unit_price),
      min_qty: parseFloat(row.min_qty),
      lead_time_days: parseInt(row.lead_time_days),
      notes: row.notes || null,
      terms_json: {},
    }));

    const { error: rowsError } = await supabase
      .from('supplier_offer_rows')
      .insert(offerRowsWithOfferId);

    if (rowsError) {
      console.error('Failed to create offer rows:', rowsError);
      await supabase.from('supplier_offers').delete().eq('id', offer.id);
      return NextResponse.json(
        { error: 'Failed to create offer rows' },
        { status: 500 }
      );
    }

    await supabase.from('audit_logs').insert({
      actor_user_id: user.id,
      action: 'supplier_offer_created',
      entity_type: 'supplier_offer',
      entity_id: offer.id,
      payload_json: {
        campaign_id,
        row_count: offer_rows.length,
      },
    });

    return NextResponse.json({
      success: true,
      offer_id: offer.id,
    });
  } catch (error: any) {
    console.error('Failed to create supplier offer:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create supplier offer' },
      { status: 500 }
    );
  }
}
