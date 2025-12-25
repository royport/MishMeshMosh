'use client';
import Image from "next/image";


import Link from 'next/link';
import { useState, useEffect } from 'react';
import NotificationBadge from '@/components/notifications/notification-badge';
import { createClient } from '@/lib/supabase/client';

export function AppHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  async function checkAuthStatus() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    setIsLoggedIn(!!user);
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">

             <Image
                src="/mishmeshmosh_black.png"
                alt="MishMeshMosh"
                width={160}
                height={40}
                className="h-10"
                priority
              />
            </Link>
          </div>

          <nav className="hidden md:flex md:items-center md:space-x-8">
            <Link
              href="/"
              className="text-sm font-medium text-neutral-700 hover:text-primary-600 transition-colors"
            >
              Home
            </Link>
            <Link
              href="/explore"
              className="text-sm font-medium text-neutral-700 hover:text-primary-600 transition-colors"
            >
              Explore Needs
            </Link>
            <Link
              href="/explore/feeds"
              className="text-sm font-medium text-neutral-700 hover:text-primary-600 transition-colors"
            >
              Explore Feeds
            </Link>
            <Link
              href="/create"
              className="text-sm font-medium text-neutral-700 hover:text-primary-600 transition-colors"
            >
              Create Need
            </Link>
          </nav>

          <div className="hidden md:flex md:items-center md:space-x-4">
            {isLoggedIn ? (
              <>
                <NotificationBadge />
                <Link
                  href="/workspace"
                  className="text-sm font-medium text-neutral-700 hover:text-primary-600 transition-colors"
                >
                  Workspace
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-sm font-medium text-neutral-700 hover:text-primary-600 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            className="md:hidden rounded-md p-2 text-neutral-700 hover:bg-neutral-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="sr-only">Open menu</span>
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-200 bg-white">
          <div className="space-y-1 px-4 pb-3 pt-2">
            <Link
              href="/"
              className="block rounded-md px-3 py-2 text-base font-medium text-neutral-700 hover:bg-neutral-100"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/explore"
              className="block rounded-md px-3 py-2 text-base font-medium text-neutral-700 hover:bg-neutral-100"
              onClick={() => setMobileMenuOpen(false)}
            >
              Explore Needs
            </Link>
            <Link
              href="/explore/feeds"
              className="block rounded-md px-3 py-2 text-base font-medium text-neutral-700 hover:bg-neutral-100"
              onClick={() => setMobileMenuOpen(false)}
            >
              Explore Feeds
            </Link>
            <Link
              href="/create"
              className="block rounded-md px-3 py-2 text-base font-medium text-neutral-700 hover:bg-neutral-100"
              onClick={() => setMobileMenuOpen(false)}
            >
              Create Need
            </Link>
            <div className="border-t border-neutral-200 pt-4">
              <Link
                href="/auth/login"
                className="block rounded-md px-3 py-2 text-base font-medium text-neutral-700 hover:bg-neutral-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="block rounded-md bg-primary-600 px-3 py-2 text-base font-medium text-white hover:bg-primary-700 mt-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
