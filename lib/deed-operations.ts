import { createClient } from '@/lib/supabase/server';

export function isDeedImmutable(deed: any): boolean {
  const immutableStatuses = ['signed', 'executed', 'active', 'fulfilled'];
  return immutableStatuses.includes(deed.status);
}

export async function canEditDeed(deedId: string, userId: string): Promise<{ canEdit: boolean; reason?: string }> {
  const supabase = await createClient();

  const { data: deed, error } = await supabase
    .from('deeds')
    .select('*')
    .eq('id', deedId)
    .maybeSingle();

  if (error || !deed) {
    return { canEdit: false, reason: 'Deed not found' };
  }

  if (deed.created_by !== userId) {
    return { canEdit: false, reason: 'Not authorized' };
  }

  if (isDeedImmutable(deed)) {
    return { canEdit: false, reason: 'Deed is immutable after signing' };
  }

  if (deed.opened_for_signature_at) {
    return { canEdit: false, reason: 'Deed is open for signature and cannot be edited' };
  }

  return { canEdit: true };
}

export async function createNewDeedVersion(originalDeedId: string, updatedDoc: any, userId: string) {
  const supabase = await createClient();

  const { data: originalDeed, error: fetchError } = await supabase
    .from('deeds')
    .select('*')
    .eq('id', originalDeedId)
    .maybeSingle();

  if (fetchError || !originalDeed) {
    throw new Error('Original deed not found');
  }

  if (originalDeed.created_by !== userId) {
    throw new Error('Not authorized to create new version');
  }

  const newVersion = (originalDeed.version || 1) + 1;

  const { data: newDeed, error: insertError } = await supabase
    .from('deeds')
    .insert({
      deed_kind: originalDeed.deed_kind,
      status: 'draft',
      campaign_id: originalDeed.campaign_id,
      version: newVersion,
      prev_deed_id: originalDeedId,
      doc_json: updatedDoc,
      doc_hash: generateDeedHash(updatedDoc),
      created_by: userId,
    })
    .select()
    .single();

  if (insertError) {
    throw new Error('Failed to create new deed version');
  }

  return newDeed;
}

function generateDeedHash(doc: any): string {
  const crypto = require('crypto');
  const hash = crypto.createHash('sha256');
  hash.update(JSON.stringify(doc));
  return hash.digest('hex');
}

export async function getDeedVersionHistory(deedId: string) {
  const supabase = await createClient();

  const versions: any[] = [];
  let currentId: string | null = deedId;

  while (currentId) {
    const result: any = await supabase
      .from('deeds')
      .select('id, version, status, created_at, prev_deed_id')
      .eq('id', currentId)
      .maybeSingle();

    if (result.error || !result.data) break;

    versions.push(result.data);
    currentId = result.data.prev_deed_id;
  }

  const { data: newerVersions } = await supabase
    .from('deeds')
    .select('id, version, status, created_at, prev_deed_id')
    .eq('prev_deed_id', deedId)
    .order('version', { ascending: true });

  if (newerVersions) {
    versions.unshift(...newerVersions);
  }

  return versions.sort((a, b) => a.version - b.version);
}
