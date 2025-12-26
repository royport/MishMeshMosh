// lib/supabase/middleware.ts
import { NextResponse, type NextRequest } from "next/server";

/**
 * Edge-safe auth gate for protected routes.
 *
 * Why this exists:
 * - Next.js Middleware runs on the Edge Runtime.
 * - Importing supabase-js / realtime in middleware can trigger Node API warnings (process.version/versions).
 *
 * What it does:
 * - For protected paths, checks whether a Supabase auth cookie exists.
 * - If not, redirects to /auth/login with ?redirectTo=<path>.
 *
 * Note:
 * - This is a UX guard, not security. Security must be enforced by Supabase RLS.
 */
export function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const protectedPaths = ["/workspace", "/admin", "/create"];
  const isProtectedPath = protectedPaths.some((p) => pathname.startsWith(p));

  const isAuthPage = pathname.startsWith("/auth");

  // Allow non-protected routes + auth pages
  if (!isProtectedPath || isAuthPage) {
    return NextResponse.next();
  }

  // Check for common Supabase auth cookie naming patterns
  const cookieNames = request.cookies.getAll().map((c) => c.name);

  const hasSupabaseSession =
    // Newer SSR cookie format often contains "sb-" and "auth-token"
    cookieNames.some((n) => n.includes("sb-") && n.includes("auth-token")) ||
    // Older formats
    cookieNames.includes("sb-access-token") ||
    cookieNames.includes("sb-refresh-token");

  if (!hasSupabaseSession) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}



// import { createServerClient, type CookieOptions } from '@supabase/ssr';
// import { NextResponse, type NextRequest } from 'next/server';

// export async function updateSession(request: NextRequest) {
//   let response = NextResponse.next({
//     request: {
//       headers: request.headers,
//     },
//   });

//   const supabase = createServerClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//     {
//       cookies: {
//         get(name: string) {
//           return request.cookies.get(name)?.value;
//         },
//         set(name: string, value: string, options: CookieOptions) {
//           // Set cookie on the request
//           request.cookies.set({
//             name,
//             value,
//             ...options,
//           });
//           // Create a new response to ensure cookies are passed
//           response = NextResponse.next({
//             request: {
//               headers: request.headers,
//             },
//           });
//           // Set cookie on the response
//           response.cookies.set({
//             name,
//             value,
//             ...options,
//           });
//         },
//         remove(name: string, options: CookieOptions) {
//           request.cookies.set({
//             name,
//             value: '',
//             ...options,
//           });
//           response = NextResponse.next({
//             request: {
//               headers: request.headers,
//             },
//           });
//           response.cookies.set({
//             name,
//             value: '',
//             ...options,
//           });
//         },
//       },
//     }
//   );

//   // This will refresh the session if expired
//   const { data: { user } } = await supabase.auth.getUser();

//   // Protected routes that require authentication
//   const protectedPaths = ['/workspace', '/admin', '/create'];
//   const isProtectedPath = protectedPaths.some(path =>
//     request.nextUrl.pathname.startsWith(path)
//   );

//   // Auth pages should not trigger redirects
//   const isAuthPage = request.nextUrl.pathname.startsWith('/auth');

//   // If accessing protected route without auth, redirect to login
//   // But avoid redirect loop if already on auth pages
//   if (isProtectedPath && !user && !isAuthPage) {
//     const loginUrl = new URL('/auth/login', request.url);
//     return NextResponse.redirect(loginUrl);
//   }

//   return response;
// }
