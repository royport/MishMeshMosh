import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      return NextResponse.json({ 
        authenticated: false, 
        error: error.message,
        debug: 'Auth error'
      });
    }

    if (!user) {
      return NextResponse.json({ 
        authenticated: false, 
        error: 'No user found',
        debug: 'No user in session'
      });
    }

    return NextResponse.json({ 
      authenticated: true, 
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
      }
    });
  } catch (error: any) {
    return NextResponse.json({ 
      authenticated: false, 
      error: error.message,
      debug: 'Exception caught'
    }, { status: 500 });
  }
}
