'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';

import { createSupabaseBrowser } from '@/lib/supabase/client';

const NAV_ITEMS = [
  { href: '/workspace', label: 'Dashboard' },
  { href: '/workspace/campaigns', label: 'My Campaigns' },
  { href: '/workspace/deeds', label: 'My Deeds' },
  { href: '/workspace/assignments', label: 'Assignments' },
  { href: '/workspace/offers', label: 'My Offers' },
  { href: '/workspace/groups', label: 'Groups' },
  { href: '/workspace/disputes', label: 'Disputes' },
  { href: '/workspace/profile', label: 'Profile' },
];

function isActive(pathname: string, href: string) {
  if (href === '/workspace') return pathname === '/workspace';
  return pathname.startsWith(href);
}

export function WorkspaceNav({ user }: { user: User | null }) {
  const pathname = usePathname();
  const router = useRouter();

  const supabase = React.useMemo(() => createSupabaseBrowser(), []);

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    (user?.email ? user.email.split('@')[0] : 'Account');

  async function handleSignOut() {
    try {
      await supabase.auth.signOut();
    } finally {
      router.replace('/auth/login');
      router.refresh();
    }
  }

  return (
    <div className="border-b bg-white">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-semibold tracking-tight">
            MishMeshMosh
          </Link>

          <nav className="hidden items-center gap-4 text-sm md:flex">
            {NAV_ITEMS.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    active
                      ? 'text-neutral-900 underline underline-offset-8'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-neutral-600 sm:inline">
            {displayName}
          </span>
          <button
            onClick={handleSignOut}
            className="rounded-md border px-3 py-1.5 text-sm text-neutral-800 hover:bg-neutral-50"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 pb-2 md:hidden">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                'whitespace-nowrap rounded-full border px-3 py-1 text-sm ' +
                (active ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-700')
              }
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
