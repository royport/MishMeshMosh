'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { CampaignFormData } from '@/lib/types/campaign';
import { createClient } from '@/lib/supabase/client';

interface Group {
  id: string;
  name: string;
  visibility: string;
  member_role?: string;
}

interface BasicsStepProps {
  formData: CampaignFormData;
  updateFormData: (updates: Partial<CampaignFormData>) => void;
  initialGroupId?: string | null;
}

export function BasicsStep({ formData, updateFormData, initialGroupId }: BasicsStepProps) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(true);

  useEffect(() => {
    async function fetchGroups() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return;

        // Get owned groups
        const { data: ownedGroups } = await supabase
          .from('groups')
          .select('*')
          .eq('owner_id', user.id);

        // Get member groups
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

        setGroups(allGroups);

        // Set initial group if provided
        if (initialGroupId && !formData.group_id) {
          updateFormData({ group_id: initialGroupId, visibility: 'private' });
        }
      } catch (error) {
        console.error('Error fetching groups:', error);
      } finally {
        setLoadingGroups(false);
      }
    }

    fetchGroups();
  }, [formData.group_id, initialGroupId, updateFormData]);

  // When visibility changes to non-private, clear group
  useEffect(() => {
    if (formData.visibility !== 'private' && formData.group_id) {
      updateFormData({ group_id: null });
    }
  }, [formData.group_id, formData.visibility, updateFormData]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Campaign Basics</h2>
        <p className="text-sm text-neutral-600 mb-6">
          Start with the fundamental details of your Need campaign
        </p>
      </div>

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-neutral-700 mb-1">
          Campaign Title <span className="text-error-600">*</span>
        </label>
        <input
          type="text"
          id="title"
          value={formData.title}
          onChange={(e) => updateFormData({ title: e.target.value })}
          placeholder="e.g., Bulk Order: Commercial Grade Laptops"
          className="block w-full rounded-md border border-neutral-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-neutral-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          rows={5}
          value={formData.description}
          onChange={(e) => updateFormData({ description: e.target.value })}
          placeholder="Describe what you're looking to purchase, why you're organizing this campaign, and any important details..."
          className="block w-full rounded-md border border-neutral-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
      </div>

      <div>
        <label htmlFor="visibility" className="block text-sm font-medium text-neutral-700 mb-1">
          Visibility
        </label>
        <select
          id="visibility"
          value={formData.visibility}
          onChange={(e) =>
            updateFormData({ visibility: e.target.value as 'public' | 'private' | 'unlisted' })
          }
          className="block w-full rounded-md border border-neutral-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        >
          <option value="public">Public - Anyone can find and join</option>
          <option value="unlisted">Unlisted - Only people with the link can join</option>
          <option value="private">Private - Group members only</option>
        </select>
        <p className="mt-1 text-xs text-neutral-500">
          Control who can discover and participate in your campaign
        </p>
      </div>

      {/* Group Selection for Private Campaigns */}
      {formData.visibility === 'private' && (
        <div>
          <label htmlFor="group" className="block text-sm font-medium text-neutral-700 mb-1">
            Select Group <span className="text-error-600">*</span>
          </label>
          {loadingGroups ? (
            <div className="block w-full rounded-md border border-neutral-300 px-3 py-2 bg-neutral-50 text-neutral-500">
              Loading groups...
            </div>
          ) : groups.length === 0 ? (
            <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
              <p className="text-sm text-amber-800 mb-2">
                You don&apos;t have any groups yet. Create a group first to run a private campaign.
              </p>
              <Link
                href="/workspace/groups/create"
                className="text-sm font-medium text-amber-900 hover:text-amber-700 underline"
              >
                Create a Group →
              </Link>
            </div>
          ) : (
            <>
              <select
                id="group"
                value={formData.group_id || ''}
                onChange={(e) => updateFormData({ group_id: e.target.value || null })}
                className="block w-full rounded-md border border-neutral-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="">Select a group...</option>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                    {group.member_role === 'owner' ? ' (Owner)' : ` (${group.member_role})`}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-neutral-500">
                Only members of this group will be able to see and join the campaign
              </p>
            </>
          )}
        </div>
      )}

      {formData.visibility === 'private' && formData.group_id && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex items-start gap-3">
            <span className="text-blue-600 text-xl">🔒</span>
            <div>
              <p className="text-sm font-medium text-blue-900">Private Campaign</p>
              <p className="text-xs text-blue-700 mt-1">
                This campaign will only be visible to members of the selected group.
                Group members will receive notifications when the campaign goes live.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
