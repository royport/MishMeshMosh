import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const redirectTo = searchParams.get('redirectTo') || '/workspace';

  try {
    const supabase = createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    return NextResponse.redirect(new URL(redirectTo, request.url));
  } catch (error) {
    console.error('Login callback error:', error);
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
}
