'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell } from 'lucide-react';
import { createSupabaseBrowser } from '@/lib/supabase/client';

export function NotificationBadge() {
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;
    const supabase = createSupabaseBrowser();

    const loadUnread = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          if (isMounted) setUnreadCount(0);
          return;
        }

        // Count unread notifications (safe even if table is missing)
        const { count, error } = await supabase
          .from('notifications')
          .select('id', { head: true, count: 'exact' })
          .eq('user_id', user.id)
          .is('read_at', null);

        if (!isMounted) return;
        setUnreadCount(error ? 0 : (count ?? 0));
      } catch {
        if (isMounted) setUnreadCount(0);
      }
    };

    loadUnread();

    // Refresh on auth changes
    const { data } = supabase.auth.onAuthStateChange(() => {
      loadUnread();
    });

    return () => {
      isMounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  return (
    <Link
      href="/workspace/notifications"
      className="relative inline-flex items-center justify-center w-9 h-9 rounded-md hover:bg-gray-100 transition-colors"
      aria-label="Notifications"
    >
      <Bell className="w-5 h-5 text-gray-700" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-600 text-white text-xs leading-5 text-center">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Link>
  );
}
