import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: campaignId } = await params;

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin permission
    const { data: permission } = await supabase
      .from('platform_permissions')
      .select('permission')
      .eq('user_id', user.id)
      .in('permission', ['admin', 'moderator'])
      .single();

    if (!permission) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }
    const body = await request.json();
    const { action } = body as { action?: string };

    // Get current campaign
    const { data: campaign, error: fetchError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', campaignId)
      .single();

    if (fetchError || !campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    const updates: Record<string, unknown> = {};
    let auditAction = '';

    switch (action) {
      case 'approve':
        if (campaign.kind === 'need') {
          updates.status_need = 'live';
          updates.starts_at = new Date().toISOString();
        } else {
          updates.status_feed = 'open';
        }
        auditAction = 'campaign_approved';
        break;

      case 'reject':
        if (campaign.kind === 'need') {
          updates.status_need = 'canceled';
        } else {
          updates.status_feed = 'canceled';
        }
        auditAction = 'campaign_rejected';
        break;

      case 'suspend':
        if (campaign.kind === 'need') {
          updates.status_need = 'canceled';
        } else {
          updates.status_feed = 'canceled';
        }
        auditAction = 'campaign_suspended';
        break;

      case 'reactivate':
        if (campaign.kind === 'need') {
          updates.status_need = 'live';
        } else {
          updates.status_feed = 'open';
        }
        auditAction = 'campaign_reactivated';
        break;

      case 'delete': {
        // Only admins can delete
        if (permission.permission !== 'admin') {
          return NextResponse.json(
            { error: 'Only admins can delete campaigns' },
            { status: 403 }
          );
        }

        const { error: deleteError } = await supabase
          .from('campaigns')
          .delete()
          .eq('id', campaignId);

        if (deleteError) throw deleteError;

        // Log audit
        await supabase.from('audit_logs').insert({
          actor_user_id: user.id,
          action: 'campaign_deleted',
          entity_type: 'campaign',
          entity_id: campaignId,
          payload_json: { campaign_title: campaign.title },
        });

        return NextResponse.json({ success: true, deleted: true });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Update campaign
    const { error: updateError } = await supabase
      .from('campaigns')
      .update(updates)
      .eq('id', campaignId);

    if (updateError) throw updateError;

    // Log audit
    await supabase.from('audit_logs').insert({
      actor_user_id: user.id,
      action: auditAction,
      entity_type: 'campaign',
      entity_id: campaignId,
      payload_json: {
        campaign_title: campaign.title,
        previous_status: campaign.status_need || campaign.status_feed,
        new_status: (updates as any).status_need || (updates as any).status_feed,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error moderating campaign:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to moderate campaign' },
      { status: 500 }
    );
  }
}
