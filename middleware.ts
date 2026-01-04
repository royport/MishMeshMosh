import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  // StackBlitz / WebContainer runs in a credentialless environment where cookies are not persisted.
  // In that environment, rely on browser (localStorage) auth only and skip server cookie sync.
  if (host.includes('webcontainer') || host.includes('stackblitz') || host.includes('webcontainer-api.io')) {
    return NextResponse.next();
  }
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
