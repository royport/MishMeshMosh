'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface UserPermissionManagerProps {
  userId: string;
  currentPermissions: string[];
}

export function UserPermissionManager({
  userId,
  currentPermissions,
}: UserPermissionManagerProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleTogglePermission(permission: string) {
    setIsLoading(true);
    try {
      const hasPermission = currentPermissions.includes(permission);
      const response = await fetch('/api/admin/users/permissions', {
        method: hasPermission ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, permission }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Action failed');
      }

      router.refresh();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsLoading(false);
      setIsOpen(false);
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="px-3 py-1.5 bg-slate-100 text-slate-700 text-sm font-medium rounded hover:bg-slate-200 disabled:opacity-50"
      >
        {isLoading ? 'Processing...' : 'Manage'}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 z-20">
            <div className="py-1">
              <button
                onClick={() => handleTogglePermission('moderator')}
                className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center justify-between"
              >
                <span>Moderator</span>
                {currentPermissions.includes('moderator') && (
                  <span className="text-green-600">✓</span>
                )}
              </button>
              <button
                onClick={() => handleTogglePermission('admin')}
                className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center justify-between"
              >
                <span>Admin</span>
                {currentPermissions.includes('admin') && (
                  <span className="text-green-600">✓</span>
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
