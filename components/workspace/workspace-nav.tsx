'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/toast-provider';
import Image from "next/image";


interface WorkspaceNavProps {
  user: User;
}

export function WorkspaceNav({ user }: WorkspaceNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { showToast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const displayName =
    user.user_metadata?.display_name || user.email?.split('@')[0] || 'User';

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    showToast('Signed out successfully', 'success');
    router.push('/');
    router.refresh();
  };

  const navItems = [
    { href: '/workspace', label: 'Dashboard', icon: '📊' },
    { href: '/workspace/campaigns', label: 'My Campaigns', icon: '📋' },
    { href: '/workspace/deeds', label: 'My Deeds', icon: '📜' },
    { href: '/workspace/assignments', label: 'Assignments', icon: '🔗' },
    { href: '/workspace/offers', label: 'My Offers', icon: '📦' },
    { href: '/workspace/groups', label: 'Groups', icon: '👥' },
    { href: '/workspace/disputes', label: 'Disputes', icon: '⚖️' },
    { href: '/workspace/profile', label: 'Profile', icon: '👤' },
  ];

  return (
    <nav className="bg-white border-b border-neutral-200">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
                    <Image
                      src="/mishmeshmosh_black.png"
                      alt="MishMeshMosh"
                      width={160}
                      height={40}
                      className="h-10 w-auto"
                      priority
                    />
            </Link>
            <div className="hidden md:ml-10 md:flex md:space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                    pathname === item.href
                      ? 'border-b-2 border-primary-600 text-neutral-900'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden md:flex md:items-center md:space-x-4">
            <Link
              href="/explore"
              className="text-sm font-medium text-neutral-600 hover:text-neutral-900"
            >
              Explore
            </Link>
            <div className="flex items-center gap-3">
              <span className="text-sm text-neutral-700">{displayName}</span>
              <button
                onClick={handleSignOut}
                className="rounded-md bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-200"
              >
                Sign Out
              </button>
            </div>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-neutral-600 hover:bg-neutral-100"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-200">
          <div className="space-y-1 px-2 pb-3 pt-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-md px-3 py-2 text-base font-medium ${
                  pathname === item.href
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-neutral-600 hover:bg-neutral-50'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </Link>
            ))}
            <Link
              href="/explore"
              className="block rounded-md px-3 py-2 text-base font-medium text-neutral-600 hover:bg-neutral-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              Explore
            </Link>
            <div className="px-3 py-2">
              <p className="text-sm text-neutral-500 mb-2">{displayName}</p>
              <button
                onClick={handleSignOut}
                className="w-full rounded-md bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-200"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
