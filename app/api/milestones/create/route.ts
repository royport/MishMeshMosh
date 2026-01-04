import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { assignment_id, title, due_at } = body;

    if (!assignment_id || !title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data: assignment } = await supabase
      .from('assignments')
      .select(`
        *,
        needCampaign:campaigns!campaign_need_id(created_by),
        feedCampaign:campaigns!campaign_feed_id(created_by),
        selectedOffer:supplier_offers!selected_offer_id(supplier_id)
      `)
      .eq('id', assignment_id)
      .maybeSingle();

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    const isCreator =
      assignment.needCampaign.created_by === user.id ||
      assignment.feedCampaign.created_by === user.id;
    const isSupplier = assignment.selectedOffer.supplier_id === user.id;

    if (!isCreator && !isSupplier) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { data: milestone, error: milestoneError } = await supabase
      .from('fulfillment_milestones')
      .insert({
        assignment_id,
        title,
        due_at: due_at || null,
        status: 'pending',
      })
      .select()
      .single();

    if (milestoneError || !milestone) {
      throw new Error('Failed to create milestone');
    }

    await supabase.from('fulfillment_events').insert({
      assignment_id,
      actor_user_id: user.id,
      event_type: 'milestone_created',
      payload_json: {
        milestone_id: milestone.id,
        title,
      },
    });

    await supabase.from('audit_logs').insert({
      actor_user_id: user.id,
      action: 'milestone_created',
      entity_type: 'fulfillment_milestone',
      entity_id: milestone.id,
      payload_json: {
        assignment_id,
        title,
      },
    });

    return NextResponse.json({ success: true, milestone });
  } catch (error: any) {
    console.error('Failed to create milestone:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create milestone' },
      { status: 500 }
    );
  }
}
