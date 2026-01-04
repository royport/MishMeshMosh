import { createClient } from '@/lib/supabase/server';

export async function findNeedCampaignForFeed(feedCampaignId: string) {
  const supabase = await createClient();

  const { data: auditLog } = await supabase
    .from('audit_logs')
    .select('payload_json')
    .eq('action', 'feed_campaign_created')
    .eq('entity_id', feedCampaignId)
    .maybeSingle();

  if (auditLog && auditLog.payload_json) {
    const payload = auditLog.payload_json as any;
    return payload.source_need_campaign_id || null;
  }

  return null;
}

export async function getSelectedOfferForFeed(feedCampaignId: string) {
  const supabase = await createClient();

  const { data: offer } = await supabase
    .from('supplier_offers')
    .select('id')
    .eq('campaign_id', feedCampaignId)
    .eq('status', 'selected')
    .maybeSingle();

  return offer?.id || null;
}

export async function checkAssignmentExists(feedCampaignId: string) {
  const supabase = await createClient();

  const { data: assignment } = await supabase
    .from('assignments')
    .select('id')
    .eq('campaign_feed_id', feedCampaignId)
    .maybeSingle();

  return assignment?.id || null;
}

export function calculateWEEDFee(totalValue: number): number {
  const feePercentage = 0.03;
  return totalValue * feePercentage;
}
