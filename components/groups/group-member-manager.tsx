'use client';

import { useState } from 'react';

interface Member {
  id: string;
  member_role: string;
  created_at: string;
  user: {
    id: string;
    email: string;
    full_name: string | null;
  };
}

interface GroupMemberManagerProps {
  groupId: string;
  members: Member[];
  canManage: boolean;
  isOwner: boolean;
  ownerId: string;
}

export function GroupMemberManager({
  groupId,
  members,
  canManage,
  isOwner,
  ownerId,
}: GroupMemberManagerProps) {
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [isInviting, setIsInviting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setIsInviting(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/groups/${groupId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to invite member');
      }

      setSuccess('Member added successfully!');
      setInviteEmail('');
      setShowInviteForm(false);
      window.location.reload();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsInviting(false);
    }
  }

  async function handleRemoveMember(userId: string) {
    if (!confirm('Are you sure you want to remove this member?')) return;

    try {
      const response = await fetch(
        `/api/groups/${groupId}/members?userId=${userId}`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to remove member');
      }

      window.location.reload();
    } catch (err: any) {
      alert(err.message);
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-slate-900">Members</h3>
        {canManage && !showInviteForm && (
          <button
            onClick={() => setShowInviteForm(true)}
            className="text-sm text-primary-600 font-medium hover:text-primary-700"
          >
            + Invite
          </button>
        )}
      </div>

      {showInviteForm && (
        <form onSubmit={handleInvite} className="bg-slate-50 rounded-lg p-4 mb-4">
          <h4 className="font-medium text-slate-900 mb-3">Invite Member</h4>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-2 mb-3">
              <p className="text-xs text-red-800">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded p-2 mb-3">
              <p className="text-xs text-green-800">{success}</p>
            </div>
          )}

          <div className="space-y-3">
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="Email address"
              required
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />

            {isOwner && (
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="member">Member</option>
                <option value="mod">Moderator</option>
              </select>
            )}

            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={isInviting}
                className="flex-1 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {isInviting ? 'Inviting...' : 'Invite'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowInviteForm(false);
                  setInviteEmail('');
                  setError('');
                }}
                className="px-4 py-2 bg-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {members.map((member) => (
          <div key={member.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-slate-600">
                  {(member.user.full_name || member.user.email)?.[0]?.toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {member.user.full_name || member.user.email.split('@')[0]}
                </p>
                <p className="text-xs text-slate-500">
                  {member.member_role === 'owner' ? (
                    <span className="text-purple-600">Owner</span>
                  ) : member.member_role === 'mod' ? (
                    <span className="text-blue-600">Moderator</span>
                  ) : (
                    'Member'
                  )}
                </p>
              </div>
            </div>

            {canManage && member.user.id !== ownerId && (
              <button
                onClick={() => handleRemoveMember(member.user.id)}
                className="text-xs text-red-600 hover:text-red-700"
              >
                Remove
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
