import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
{ params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { status, proof_url, notes } = body;

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    const { data: milestone } = await supabase
      .from('fulfillment_milestones')
      .select(`
        *,
        assignment:assignments!assignment_id(
          *,
          selectedOffer:supplier_offers!selected_offer_id(supplier_id)
        )
      `)
      .eq('id', id)
      .maybeSingle();

    if (!milestone) {
      return NextResponse.json({ error: 'Milestone not found' }, { status: 404 });
    }

    const isSupplier = milestone.assignment.selectedOffer.supplier_id === user.id;

    if (!isSupplier) {
      return NextResponse.json({ error: 'Only supplier can update milestones' }, { status: 403 });
    }

    const metadata = milestone.metadata_json || {};
    const updates: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (proof_url || notes) {
      updates.metadata_json = {
        ...metadata,
        proof_url: proof_url || metadata.proof_url,
        notes: notes || metadata.notes,
        last_update: new Date().toISOString(),
      };
    }

    const { data: updatedMilestone, error: updateError } = await supabase
      .from('fulfillment_milestones')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (updateError || !updatedMilestone) {
      throw new Error('Failed to update milestone');
    }

    await supabase.from('fulfillment_events').insert({
      assignment_id: milestone.assignment_id,
      actor_user_id: user.id,
      event_type: 'milestone_updated',
      payload_json: {
        milestone_id: id,
        status,
        proof_url: proof_url || null,
        notes: notes || null,
      },
    });

    const { data: assignment } = await supabase
      .from('assignments')
      .select(`
        *,
        assignmentDeed:deeds!assignment_deed_id(
          deed_signers(user_id)
        )
      `)
      .eq('id', milestone.assignment_id)
      .maybeSingle();

    if (assignment) {
      const backerIds = assignment.assignmentDeed.deed_signers
        .filter((s: any) => s.user_id !== user.id)
        .map((s: any) => s.user_id);

      const notifications = backerIds.map((backerId: string) => ({
        user_id: backerId,
        kind: 'milestone_update',
        context_type: 'fulfillment_milestone',
        context_id: id,
        payload_json: {
          milestone_title: milestone.title,
          status,
          assignment_id: milestone.assignment_id,
        },
      }));

      if (notifications.length > 0) {
        await supabase.from('notifications').insert(notifications);
      }
    }

    return NextResponse.json({ success: true, milestone: updatedMilestone });
  } catch (error: any) {
    console.error('Failed to update milestone:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update milestone' },
      { status: 500 }
    );
  }
}
