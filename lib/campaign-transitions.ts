import { createClient } from '@/lib/supabase/server';

export interface CampaignProgress {
  current_qty: number;
  threshold_qty: number;
  current_value: number;
  threshold_value: number;
  threshold_type: string;
  threshold_met: boolean;
  backer_count: number;
  pledge_count: number;
  progress_percentage: number;
}

export async function getCampaignProgress(campaignId: string): Promise<CampaignProgress | null> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc('get_campaign_progress', {
    p_campaign_id: campaignId,
  });

  if (error) {
    console.error('Failed to get campaign progress:', error);
    return null;
  }

  return data?.[0] || null;
}

export async function evaluateCampaignThresholds(campaignId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc('evaluate_campaign_thresholds', {
    p_campaign_id: campaignId,
  });

  if (error) {
    console.error('Failed to evaluate thresholds:', error);
    throw error;
  }

  return data;
}

export async function transitionCampaignToSeeded(campaignId: string, userId?: string) {
  const supabase = await createClient();

  const { error } = await supabase.rpc('transition_campaign_to_seeded', {
    p_campaign_id: campaignId,
  });

  if (error) {
    console.error('Failed to transition campaign:', error);
    throw error;
  }

  if (userId) {
    await supabase.from('audit_logs').insert({
      actor_user_id: userId,
      action: 'manual_seed',
      entity_type: 'campaign',
      entity_id: campaignId,
      payload_json: {
        timestamp: new Date().toISOString(),
      },
    });
  }

  return { success: true };
}

export async function closeExpiredCampaigns() {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc('close_expired_campaigns');

  if (error) {
    console.error('Failed to close expired campaigns:', error);
    throw error;
  }

  return { closed_count: data };
}

export async function canUserManuallyTransition(userId: string): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('platform_permissions')
    .select('permission')
    .eq('user_id', userId)
    .in('permission', ['admin', 'moderator']);

  if (error) {
    console.error('Failed to check permissions:', error);
    return false;
  }

  return data && data.length > 0;
}
