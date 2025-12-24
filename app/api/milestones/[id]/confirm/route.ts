import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: milestone } = await supabase
      .from('fulfillment_milestones')
      .select(`
        *,
        assignment:assignments!assignment_id(
          *,
          assignmentDeed:deeds!assignment_deed_id(
            deed_signers(user_id, signer_kind)
          )
        )
      `)
      .eq('id', params.id)
      .maybeSingle();

    if (!milestone) {
      return NextResponse.json({ error: 'Milestone not found' }, { status: 404 });
    }

    const isBacker = milestone.assignment.assignmentDeed.deed_signers.some(
      (s: any) => s.user_id === user.id && s.signer_kind === 'backer'
    );

    if (!isBacker) {
      return NextResponse.json(
        { error: 'Only backers can confirm delivery' },
        { status: 403 }
      );
    }

    if (milestone.status !== 'delivered') {
      return NextResponse.json(
        { error: 'Milestone must be in delivered status to confirm' },
        { status: 400 }
      );
    }

    const { data: updatedMilestone, error: updateError } = await supabase
      .from('fulfillment_milestones')
      .update({
        status: 'accepted',
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single();

    if (updateError || !updatedMilestone) {
      throw new Error('Failed to confirm delivery');
    }

    await supabase.from('fulfillment_events').insert({
      assignment_id: milestone.assignment_id,
      actor_user_id: user.id,
      event_type: 'milestone_accepted',
      payload_json: {
        milestone_id: params.id,
        confirmed_by: user.id,
      },
    });

    const { data: allMilestones } = await supabase
      .from('fulfillment_milestones')
      .select('status')
      .eq('assignment_id', milestone.assignment_id);

    const allAccepted = allMilestones?.every((m: any) => m.status === 'accepted');

    if (allAccepted && allMilestones && allMilestones.length > 0) {
      await supabase
        .from('assignments')
        .update({ status: 'fulfilled' })
        .eq('id', milestone.assignment_id);

      await supabase.from('fulfillment_events').insert({
        assignment_id: milestone.assignment_id,
        actor_user_id: user.id,
        event_type: 'assignment_fulfilled',
        payload_json: {
          all_milestones_accepted: true,
        },
      });
    }

    return NextResponse.json({ success: true, milestone: updatedMilestone });
  } catch (error: any) {
    console.error('Failed to confirm delivery:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to confirm delivery' },
      { status: 500 }
    );
  }
}
