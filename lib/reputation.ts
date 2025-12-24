import { SupabaseClient } from '@supabase/supabase-js';

export interface ReputationData {
  score: number;
  level: 'new' | 'bronze' | 'silver' | 'gold' | 'platinum';
  stats: {
    campaignsCreated: number;
    campaignsSuccessful: number;
    deedsSigned: number;
    deedsFulfilled: number;
    assignmentsCompleted: number;
    disputesOpened: number;
    disputesAgainst: number;
  };
}

export async function calculateReputation(
  supabase: SupabaseClient,
  userId: string
): Promise<ReputationData> {
  const stats = {
    campaignsCreated: 0,
    campaignsSuccessful: 0,
    deedsSigned: 0,
    deedsFulfilled: 0,
    assignmentsCompleted: 0,
    disputesOpened: 0,
    disputesAgainst: 0,
  };

  // Get campaigns created
  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('id, status_need, status_feed')
    .eq('created_by', userId);

  if (campaigns) {
    stats.campaignsCreated = campaigns.length;
    stats.campaignsSuccessful = campaigns.filter(
      (c) => c.status_need === 'seeded' || c.status_feed === 'supplier_selected'
    ).length;
  }

  // Get deeds signed
  const { data: deedSigners } = await supabase
    .from('deed_signers')
    .select('id, status, deeds (status)')
    .eq('user_id', userId)
    .eq('status', 'signed');

  if (deedSigners) {
    stats.deedsSigned = deedSigners.length;
    stats.deedsFulfilled = deedSigners.filter(
      (ds: any) => ds.deeds?.status === 'fulfilled'
    ).length;
  }

  // Get assignments completed (as supplier or initiator)
  const { data: supplierOffers } = await supabase
    .from('supplier_offers')
    .select('id, assignments (id, status)')
    .eq('supplier_id', userId)
    .eq('status', 'selected');

  if (supplierOffers) {
    const completedAssignments = supplierOffers.filter(
      (so: any) => so.assignments?.some((a: any) => a.status === 'fulfilled')
    );
    stats.assignmentsCompleted = completedAssignments.length;
  }

  // Get disputes
  const { data: openedDisputes } = await supabase
    .from('disputes')
    .select('id')
    .eq('opened_by', userId);

  stats.disputesOpened = openedDisputes?.length || 0;

  // Calculate score
  let score = 0;
  score += stats.campaignsCreated * 5;
  score += stats.campaignsSuccessful * 20;
  score += stats.deedsSigned * 10;
  score += stats.deedsFulfilled * 15;
  score += stats.assignmentsCompleted * 25;
  score -= stats.disputesOpened * 5; // Slight penalty for opening disputes
  score -= stats.disputesAgainst * 15; // Larger penalty for disputes against

  // Ensure score doesn't go negative
  score = Math.max(0, score);

  // Determine level
  let level: ReputationData['level'] = 'new';
  if (score >= 500) level = 'platinum';
  else if (score >= 200) level = 'gold';
  else if (score >= 100) level = 'silver';
  else if (score >= 25) level = 'bronze';

  return { score, level, stats };
}

export function getReputationColor(level: ReputationData['level']): string {
  switch (level) {
    case 'platinum':
      return 'bg-gradient-to-r from-slate-300 to-slate-400 text-slate-900';
    case 'gold':
      return 'bg-gradient-to-r from-yellow-400 to-amber-500 text-amber-900';
    case 'silver':
      return 'bg-gradient-to-r from-slate-200 to-slate-300 text-slate-800';
    case 'bronze':
      return 'bg-gradient-to-r from-orange-300 to-orange-400 text-orange-900';
    default:
      return 'bg-slate-100 text-slate-600';
  }
}

export function getReputationIcon(level: ReputationData['level']): string {
  switch (level) {
    case 'platinum':
      return '💎';
    case 'gold':
      return '🏆';
    case 'silver':
      return '🥈';
    case 'bronze':
      return '🥉';
    default:
      return '🌱';
  }
}
