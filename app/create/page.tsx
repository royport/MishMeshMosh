import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { CampaignWizard } from '@/components/campaigns/campaign-wizard';

export const metadata: Metadata = {
  title: 'Create Campaign',
  description: 'Create a new Need campaign on MishMeshMosh',
};

export const dynamic = 'force-dynamic';

interface CreateCampaignPageProps {
  searchParams: { group?: string };
}

export default async function CreateCampaignPage({ searchParams }: CreateCampaignPageProps) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Validate group access if group is provided
  let initialGroupId = searchParams.group || null;
  
  if (initialGroupId) {
    const { data: group } = await supabase
      .from('groups')
      .select('id, owner_id')
      .eq('id', initialGroupId)
      .single();

    if (!group) {
      initialGroupId = null;
    } else if (group.owner_id !== user.id) {
      // Check if user is a member with permission
      const { data: membership } = await supabase
        .from('group_members')
        .select('member_role')
        .eq('group_id', initialGroupId)
        .eq('user_id', user.id)
        .single();

      if (!membership || membership.member_role === 'member') {
        // Regular members cannot create campaigns, only owners and mods
        initialGroupId = null;
      }
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="py-10">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-neutral-900">Create Need Campaign</h1>
            <p className="mt-2 text-neutral-600">
              Aggregate demand and bring collective buying power to the marketplace
            </p>
          </div>

          <CampaignWizard initialGroupId={initialGroupId} />
        </div>
      </div>
    </div>
  );
}
