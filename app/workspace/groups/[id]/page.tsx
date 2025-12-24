import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { GroupMemberManager } from '@/components/groups/group-member-manager';
import { GroupSettings } from '@/components/groups/group-settings';

export const dynamic = 'force-dynamic';

interface GroupPageProps {
  params: { id: string };
}

export default async function GroupPage({ params }: GroupPageProps) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Fetch group with members and campaigns
  const { data: group, error: groupError } = await supabase
    .from('groups')
    .select('*')
    .eq('id', params.id)
    .single();

  if (groupError || !group) {
    notFound();
  }

  // Check access
  const { data: membership } = await supabase
    .from('group_members')
    .select('member_role')
    .eq('group_id', params.id)
    .eq('user_id', user.id)
    .single();

  const isOwner = group.owner_id === user.id;
  const isMember = !!membership;
  const canManage = isOwner || membership?.member_role === 'mod';

  if (!isOwner && !isMember && group.visibility === 'private') {
    notFound();
  }

  // Fetch members
  const { data: members } = await supabase
    .from('group_members')
    .select(`
      id,
      member_role,
      created_at,
      user:users (id, email, full_name)
    `)
    .eq('group_id', params.id)
    .order('created_at', { ascending: true });

  // Fetch group campaigns
  const { data: campaigns } = await supabase
    .from('campaigns')
    .select(`
      id,
      kind,
      title,
      description,
      visibility,
      status_need,
      status_feed,
      created_at
    `)
    .eq('group_id', params.id)
    .order('created_at', { ascending: false });

  return (
    <div>
      <div className="mb-8">
        <Link
          href="/workspace/groups"
          className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 mb-4"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Groups
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-slate-900">{group.name}</h1>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  group.visibility === 'private'
                    ? 'bg-amber-100 text-amber-700'
                    : group.visibility === 'unlisted'
                    ? 'bg-slate-100 text-slate-700'
                    : 'bg-green-100 text-green-700'
                }`}
              >
                {group.visibility}
              </span>
            </div>
            <p className="text-slate-600">
              {members?.length || 0} member{members?.length !== 1 ? 's' : ''} ·
              Created {new Date(group.created_at).toLocaleDateString()}
            </p>
          </div>

          {isOwner && (
            <Link
              href={`/create?group=${group.id}`}
              className="px-6 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
            >
              Create Campaign
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Campaigns */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Group Campaigns</h2>

            {!campaigns || campaigns.length === 0 ? (
              <div className="text-center py-8">
                <svg
                  className="w-12 h-12 text-slate-300 mx-auto mb-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
                <p className="text-slate-600 mb-4">No campaigns yet</p>
                {isOwner && (
                  <Link
                    href={`/create?group=${group.id}`}
                    className="text-primary-600 font-medium hover:text-primary-700"
                  >
                    Create the first campaign
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {campaigns.map((campaign: any) => (
                  <Link
                    key={campaign.id}
                    href={campaign.kind === 'need' ? `/campaign/${campaign.id}` : `/feed/${campaign.id}`}
                    className="block p-4 border border-slate-200 rounded-lg hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-medium ${
                              campaign.kind === 'need'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-purple-100 text-purple-700'
                            }`}
                          >
                            {campaign.kind.toUpperCase()}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-medium ${
                              campaign.status_need === 'live' || campaign.status_feed === 'open'
                                ? 'bg-green-100 text-green-700'
                                : campaign.status_need === 'seeded' || campaign.status_feed === 'supplier_selected'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {campaign.status_need || campaign.status_feed}
                          </span>
                        </div>
                        <h3 className="font-semibold text-slate-900">{campaign.title}</h3>
                        <p className="text-sm text-slate-600 line-clamp-1">
                          {campaign.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Members */}
          <GroupMemberManager
            groupId={group.id}
            members={members || []}
            canManage={canManage}
            isOwner={isOwner}
            ownerId={group.owner_id}
          />

          {/* Settings (owner only) */}
          {isOwner && (
            <GroupSettings group={group} />
          )}
        </div>
      </div>
    </div>
  );
}
