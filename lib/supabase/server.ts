import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  // Next.js may treat cookies() as an async dynamic API in some runtimes (e.g., WebContainer/Edge).
  // Awaiting is safe even when cookies() is sync (await will just return the value).
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // If called from a Server Component (not a Route Handler), this can throw.
            // It's safe to ignore; client-side auth will still function.
          }
        },
      },
    }
  );
}
