'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

import type { User } from '@supabase/supabase-js';

import { WorkspaceNav } from '@/components/workspace/workspace-nav';
import { createSupabaseBrowser } from '@/lib/supabase/client';

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const supabase = createSupabaseBrowser();

    const load = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user ?? null);
      setLoading(false);
    };

    load();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  React.useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth/login');
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <div className="h-16 border-b bg-white" />
        <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-neutral-500">Loading�</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-neutral-50">
      <WorkspaceNav user={user} />
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
