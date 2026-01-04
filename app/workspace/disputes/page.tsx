'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { createSupabaseBrowser } from '@/lib/supabase/client';

export default function Page() {
  const supabase = useMemo(() => createSupabaseBrowser(), []);
  const [email, setEmail] = useState<string>('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? '');
    });
  }, [supabase]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Disputes</h1>
        <p className="mt-1 text-sm text-neutral-600">Review and manage dispute cases.</p>
        {email ? <p className="mt-2 text-sm text-neutral-500">Signed in as <span className="font-medium text-neutral-800">{email}</span></p> : null}
      </div>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <li className="rounded-lg border border-neutral-200 bg-white p-4">
            <div className="text-sm font-medium text-neutral-900">Back to Dashboard</div>
            <div className="mt-1 text-sm text-neutral-600">Return to your workspace.</div>
            <Link className="mt-3 inline-block text-sm font-medium text-primary-700 hover:underline" href="/workspace">Open</Link>
          </li>
          <li className="rounded-lg border border-neutral-200 bg-white p-4">
            <div className="text-sm font-medium text-neutral-900">My Deeds</div>
            <div className="mt-1 text-sm text-neutral-600">Open deeds.</div>
            <Link className="mt-3 inline-block text-sm font-medium text-primary-700 hover:underline" href="/workspace/deeds">Open</Link>
          </li>
          <li className="rounded-lg border border-neutral-200 bg-white p-4">
            <div className="text-sm font-medium text-neutral-900">My Campaigns</div>
            <div className="mt-1 text-sm text-neutral-600">Open campaigns.</div>
            <Link className="mt-3 inline-block text-sm font-medium text-primary-700 hover:underline" href="/workspace/campaigns">Open</Link>
          </li>
      </ul>
    </div>
  );
}
