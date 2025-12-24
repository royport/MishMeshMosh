'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
  [key: string]: any;
}

export function useAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Track page views
  useEffect(() => {
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
    trackPageView(url);
  }, [pathname, searchParams]);

  return {
    trackEvent,
    trackPageView,
  };
}

export function trackPageView(url: string) {
  // Google Analytics
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', process.env.NEXT_PUBLIC_GA_ID || '', {
      page_path: url,
    });
  }

  // Custom analytics endpoint (can be replaced with your own)
  if (process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'true') {
    fetch('/api/analytics/pageview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, timestamp: new Date().toISOString() }),
    }).catch(() => {});
  }
}

export function trackEvent(event: AnalyticsEvent) {
  // Google Analytics
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', event.action, {
      event_category: event.category,
      event_label: event.label,
      value: event.value,
      ...event,
    });
  }

  // Custom analytics endpoint
  if (process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'true') {
    fetch('/api/analytics/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...event, timestamp: new Date().toISOString() }),
    }).catch(() => {});
  }
}

// Pre-defined event helpers
export const analytics = {
  // Campaign events
  campaignViewed: (campaignId: string, title: string) =>
    trackEvent({
      action: 'campaign_viewed',
      category: 'Campaign',
      label: title,
      campaign_id: campaignId,
    }),

  campaignJoined: (campaignId: string, title: string) =>
    trackEvent({
      action: 'campaign_joined',
      category: 'Campaign',
      label: title,
      campaign_id: campaignId,
    }),

  campaignCreated: (campaignId: string, title: string) =>
    trackEvent({
      action: 'campaign_created',
      category: 'Campaign',
      label: title,
      campaign_id: campaignId,
    }),

  // Deed events
  deedSigned: (deedId: string, deedKind: string) =>
    trackEvent({
      action: 'deed_signed',
      category: 'Deed',
      label: deedKind,
      deed_id: deedId,
    }),

  // User events
  signUp: () =>
    trackEvent({
      action: 'sign_up',
      category: 'User',
    }),

  signIn: () =>
    trackEvent({
      action: 'sign_in',
      category: 'User',
    }),

  // Group events
  groupCreated: (groupId: string) =>
    trackEvent({
      action: 'group_created',
      category: 'Group',
      group_id: groupId,
    }),

  // Search events
  search: (query: string, resultCount: number) =>
    trackEvent({
      action: 'search',
      category: 'Search',
      label: query,
      value: resultCount,
    }),
};
