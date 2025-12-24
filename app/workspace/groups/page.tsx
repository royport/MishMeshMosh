import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function GroupsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Fetch user's groups
  const { data: ownedGroups } = await supabase
    .from('groups')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false });

  const { data: memberships } = await supabase
    .from('group_members')
    .select(`
      member_role,
      group:groups (*)
    `)
    .eq('user_id', user.id);

  const memberGroups = memberships
    ?.filter((m: any) => m.group && m.group.owner_id !== user.id)
    .map((m: any) => ({ ...m.group, member_role: m.member_role })) || [];

  const allGroups = [
    ...(ownedGroups?.map((g) => ({ ...g, member_role: 'owner' })) || []),
    ...memberGroups,
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Groups</h1>
          <p className="text-slate-600 mt-1">
            Create and manage private communities for group purchasing
          </p>
        </div>
        <Link
          href="/workspace/groups/create"
          className="px-6 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
        >
          Create Group
        </Link>
      </div>

      {allGroups.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <svg
            className="w-16 h-16 text-slate-300 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No groups yet</h3>
          <p className="text-slate-600 mb-6">
            Create a group to coordinate private campaigns with your community
          </p>
          <Link
            href="/workspace/groups/create"
            className="px-6 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
          >
            Create Your First Group
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allGroups.map((group: any) => (
            <Link
              key={group.id}
              href={`/workspace/groups/${group.id}`}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">👥</span>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    group.member_role === 'owner'
                      ? 'bg-purple-100 text-purple-700'
                      : group.member_role === 'mod'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {group.member_role}
                </span>
              </div>

              <h3 className="text-lg font-semibold text-slate-900 mb-1">
                {group.name}
              </h3>

              <div className="flex items-center gap-4 text-sm text-slate-500">
                <span
                  className={`flex items-center gap-1 ${
                    group.visibility === 'private'
                      ? 'text-amber-600'
                      : 'text-green-600'
                  }`}
                >
                  {group.visibility === 'private' ? '🔒' : '🌐'}
                  {group.visibility}
                </span>
                <span>
                  Created {new Date(group.created_at).toLocaleDateString()}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
