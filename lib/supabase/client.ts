import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

let browserClient: SupabaseClient | null = null;

/**
 * Browser Supabase client (singleton).
 *
 * Notes:
 * - In some embedded environments (StackBlitz/Bolt webcontainers), cookies can be blocked.
 * - Supabase will then fall back to in-memory/local storage depending on the runtime.
 * - For production (Hostinger + your domain), cookies should work as expected.
 */
export function createSupabaseBrowser(): SupabaseClient {
  if (browserClient) return browserClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anon) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  browserClient = createBrowserClient(url, anon);
  return browserClient;
}

// Backwards-compat alias (some files import createClient())
export function createClient(): SupabaseClient {
  return createSupabaseBrowser();
}
