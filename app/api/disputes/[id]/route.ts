import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET - Get dispute details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: disputeId } = await params; // ✅ FIX: await params

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: dispute, error } = await supabase
      .from('disputes')
      .select('*')
      .eq('id', disputeId)
      .single();

    if (error || !dispute) {
      return NextResponse.json({ error: 'Dispute not found' }, { status: 404 });
    }

    // Check access
    if (dispute.opened_by !== user.id) {
      // Check if admin/moderator
      const { data: permission } = await supabase
        .from('platform_permissions')
        .select('permission')
        .eq('user_id', user.id)
        .in('permission', ['admin', 'moderator'])
        .single();

      if (!permission) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
    }

    // Get related context info
    let contextInfo: any = null;

    if (dispute.context_type === 'deed') {
      const { data } = await supabase
        .from('deeds')
        .select('id, deed_kind, status, campaign_id')
        .eq('id', dispute.context_id)
        .single();
      contextInfo = data;
    } else if (dispute.context_type === 'campaign') {
      const { data } = await supabase
        .from('campaigns')
        .select('id, title, kind, status_need, status_feed')
        .eq('id', dispute.context_id)
        .single();
      contextInfo = data;
    } else if (dispute.context_type === 'assignment') {
      const { data } = await supabase
        .from('assignments')
        .select('id, status, campaign_need_id')
        .eq('id', dispute.context_id)
        .single();
      contextInfo = data;
    }

    return NextResponse.json({ dispute, contextInfo });
  } catch (error: any) {
    console.error('Error fetching dispute:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch dispute' },
      { status: 500 }
    );
  }
}
