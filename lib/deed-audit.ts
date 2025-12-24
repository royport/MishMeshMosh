import { createClient } from '@/lib/supabase/server';

export type DeedAuditAction = 'viewed' | 'signed' | 'created' | 'updated' | 'voided' | 'disputed';

export async function logDeedEvent(
  deedId: string,
  action: DeedAuditAction,
  userId?: string,
  metadata?: Record<string, any>
) {
  const supabase = createClient();

  const { error } = await supabase.from('audit_logs').insert({
    actor_user_id: userId || null,
    action,
    entity_type: 'deed',
    entity_id: deedId,
    payload_json: metadata || {},
  });

  if (error) {
    console.error('Failed to log deed event:', error);
  }
}

export async function getDeedAuditTrail(deedId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('audit_logs')
    .select('*, actor:actor_user_id(id, full_name, email)')
    .eq('entity_type', 'deed')
    .eq('entity_id', deedId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch deed audit trail:', error);
    return [];
  }

  return data || [];
}
