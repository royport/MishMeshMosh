import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { transitionCampaignToSeeded, canUserManuallyTransition } from '@/lib/campaign-transitions';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const canTransition = await canUserManuallyTransition(user.id);
    if (!canTransition) {
      return NextResponse.json(
        { error: 'Forbidden - Admin or moderator permission required' },
        { status: 403 }
      );
    }

    await transitionCampaignToSeeded(params.id, user.id);

    return NextResponse.json({
      success: true,
      message: 'Campaign transitioned to seeded status',
    });
  } catch (error: any) {
    console.error('Failed to transition campaign:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to transition campaign' },
      { status: 500 }
    );
  }
}
