import { NextRequest, NextResponse } from 'next/server';
import { getCampaignProgress } from '@/lib/campaign-transitions';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const progress = await getCampaignProgress(params.id);

    if (!progress) {
      return NextResponse.json(
        { error: 'Campaign not found or unable to calculate progress' },
        { status: 404 }
      );
    }

    return NextResponse.json(progress);
  } catch (error: any) {
    console.error('Failed to get campaign progress:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get campaign progress' },
      { status: 500 }
    );
  }
}
