import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET - List user's disputes
export async function GET() {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: disputes, error } = await supabase
      .from('disputes')
      .select('*')
      .eq('opened_by', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ disputes: disputes || [] });
  } catch (error: any) {
    console.error('Error fetching disputes:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch disputes' },
      { status: 500 }
    );
  }
}

// POST - Create a new dispute
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as {
      context_type?: 'deed' | 'campaign' | 'assignment' | 'offer';
      context_id?: string;
      reason?: string;
    };

    const { context_type, context_id, reason } = body;

    if (!context_type || !context_id || !reason) {
      return NextResponse.json(
        { error: 'context_type, context_id, and reason are required' },
        { status: 400 }
      );
    }

    // Validate context_type
    const validTypes: Array<typeof context_type> = [
      'deed',
      'campaign',
      'assignment',
      'offer',
    ];
    if (!validTypes.includes(context_type)) {
      return NextResponse.json({ error: 'Invalid context_type' }, { status: 400 });
    }

    // Check if user has involvement with the context
    let hasAccess = false;

    if (context_type === 'deed') {
      const { data: signer } = await supabase
        .from('deed_signers')
        .select('id')
        .eq('deed_id', context_id)
        .eq('user_id', user.id)
        .maybeSingle();

      hasAccess = !!signer;
    } else if (context_type === 'campaign') {
      const { data: campaign } = await supabase
        .from('campaigns')
        .select('created_by')
        .eq('id', context_id)
        .maybeSingle();

      const { data: pledge } = await supabase
        .from('need_pledges')
        .select('id')
        .eq('campaign_id', context_id)
        .eq('backer_id', user.id)
        .maybeSingle();

      hasAccess = campaign?.created_by === user.id || !!pledge;
    } else if (context_type === 'assignment') {
      // ✅ Alias relations + treat nested results as arrays for TS safety
      const { data: assignment } = await supabase
        .from('assignments')
        .select(`
          campaign_need_id,
          selected_offer_id,
          need_campaign:campaigns!assignments_campaign_need_id_fkey ( created_by ),
          selected_offer:supplier_offers ( supplier_id )
        `)
        .eq('id', context_id)
        .maybeSingle();

      const needCampaignCreatedBy = (assignment as any)?.need_campaign?.[0]?.created_by;
      const supplierId = (assignment as any)?.selected_offer?.[0]?.supplier_id;

      hasAccess = needCampaignCreatedBy === user.id || supplierId === user.id;
    } else if (context_type === 'offer') {
      // ✅ Alias relation + array-safe access
      const { data: offer } = await supabase
        .from('supplier_offers')
        .select(`
          supplier_id,
          campaign_id,
          campaign:campaigns ( created_by )
        `)
        .eq('id', context_id)
        .maybeSingle();

      const campaignCreatedBy = (offer as any)?.campaign?.[0]?.created_by;

      hasAccess = offer?.supplier_id === user.id || campaignCreatedBy === user.id;
    }

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'You do not have access to file a dispute for this item' },
        { status: 403 }
      );
    }

    // Check for existing open dispute (use maybeSingle so "no rows" isn't an error)
    const { data: existingDispute, error: existingError } = await supabase
      .from('disputes')
      .select('id')
      .eq('context_type', context_type)
      .eq('context_id', context_id)
      .eq('opened_by', user.id)
      .in('status', ['open', 'in_review'])
      .maybeSingle();

    if (existingError) throw existingError;

    if (existingDispute) {
      return NextResponse.json(
        { error: 'You already have an open dispute for this item' },
        { status: 400 }
      );
    }

    // Create dispute
    const { data: dispute, error: disputeError } = await supabase
      .from('disputes')
      .insert({
        context_type,
        context_id,
        opened_by: user.id,
        reason,
        status: 'open',
      })
      .select()
      .single();

    if (disputeError) throw disputeError;

    // Log audit
    await supabase.from('audit_logs').insert({
      actor_user_id: user.id,
      action: 'dispute_opened',
      entity_type: 'dispute',
      entity_id: dispute.id,
      payload_json: {
        context_type,
        context_id,
        reason,
      },
    });

    return NextResponse.json({ dispute });
  } catch (error: any) {
    console.error('Error creating dispute:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create dispute' },
      { status: 500 }
    );
  }
}
