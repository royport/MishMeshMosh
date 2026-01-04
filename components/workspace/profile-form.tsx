'use client';

import { useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { createSupabaseBrowser } from '@/lib/supabase/client';
import { useToast } from '@/components/toast-provider';
import { useRouter } from 'next/navigation';

interface ProfileFormProps {
  user: User;
}

export function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    displayName: user.user_metadata?.display_name || '',
    email: user.email || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const supabase = await createSupabaseBrowser();

    const { error } = await supabase.auth.updateUser({
      data: {
        display_name: formData.displayName,
      },
    });

    if (error) {
      showToast(error.message, 'error');
      setLoading(false);
      return;
    }

    showToast('Profile updated successfully!', 'success');
    router.refresh();
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="displayName" className="block text-sm font-medium text-neutral-700">
          Display Name
        </label>
        <input
          id="displayName"
          name="displayName"
          type="text"
          required
          value={formData.displayName}
          onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
          className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-neutral-700">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          disabled
          value={formData.email}
          className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 bg-neutral-50 text-neutral-500 cursor-not-allowed"
        />
        <p className="mt-1 text-xs text-neutral-500">Email cannot be changed</p>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex justify-center rounded-md border border-transparent bg-primary-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}
