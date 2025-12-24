import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Demo data seeding endpoint
export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin permission
    const { data: permission } = await supabase
      .from('platform_permissions')
      .select('permission')
      .eq('user_id', user.id)
      .eq('permission', 'admin')
      .single();

    if (!permission) {
      return NextResponse.json(
        { error: 'Only admins can seed demo data' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { type } = body;

    if (type === 'campaigns') {
      // Create demo campaigns
      const demoCampaigns = [
        {
          kind: 'need',
          title: 'Bulk Solar Panel Purchase for Neighborhood',
          description: 'Organizing a group purchase of high-efficiency solar panels for residential installations in our neighborhood. Minimum order of 50 units to qualify for wholesale pricing.',
          visibility: 'public',
          created_by: user.id,
          status_need: 'live',
          starts_at: new Date().toISOString(),
        },
        {
          kind: 'need',
          title: 'Office Furniture Collective Buy',
          description: 'Small businesses pooling together to purchase ergonomic office furniture at bulk prices. Standing desks, chairs, and monitor arms.',
          visibility: 'public',
          created_by: user.id,
          status_need: 'live',
          starts_at: new Date().toISOString(),
        },
        {
          kind: 'need',
          title: 'Community Garden Supplies',
          description: 'Annual bulk order of seeds, soil, and gardening tools for our community garden members.',
          visibility: 'public',
          created_by: user.id,
          status_need: 'live',
          starts_at: new Date().toISOString(),
        },
      ];

      for (const campaign of demoCampaigns) {
        const { data: newCampaign, error: campaignError } = await supabase
          .from('campaigns')
          .insert(campaign)
          .select()
          .single();

        if (campaignError) {
          console.error('Error creating campaign:', campaignError);
          continue;
        }

        // Create need_campaign record
        await supabase.from('need_campaigns').insert({
          campaign_id: newCampaign.id,
          threshold_type: 'quantity',
          threshold_qty: Math.floor(Math.random() * 50) + 10,
          currency: 'USD',
          deadline_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          deposit_policy_json: { percentage: 10, timing: 'upon_joining' },
          payment_structure_json: { terms: 'net_30' },
          delivery_terms_json: { timeline: '4-6 weeks', location: 'Local pickup' },
          cancellation_terms_json: { notice_days: 7, penalty_percentage: 0 },
        });

        // Create some items
        await supabase.from('campaign_items').insert([
          {
            campaign_id: newCampaign.id,
            item_code: 'ITEM-001',
            title: 'Primary Item',
            description: 'Main item for this campaign',
            unit: 'piece',
          },
        ]);
      }

      return NextResponse.json({ success: true, message: 'Demo campaigns created' });
    }

    if (type === 'groups') {
      // Create demo groups
      const demoGroups = [
        { name: 'Neighborhood Buyers Club', visibility: 'private', owner_id: user.id },
        { name: 'Small Business Alliance', visibility: 'public', owner_id: user.id },
        { name: 'Tech Startup Co-op', visibility: 'unlisted', owner_id: user.id },
      ];

      for (const group of demoGroups) {
        const { data: newGroup, error } = await supabase
          .from('groups')
          .insert(group)
          .select()
          .single();

        if (error) {
          console.error('Error creating group:', error);
          continue;
        }

        // Add owner as member
        await supabase.from('group_members').insert({
          group_id: newGroup.id,
          user_id: user.id,
          member_role: 'owner',
        });
      }

      return NextResponse.json({ success: true, message: 'Demo groups created' });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error: any) {
    console.error('Error seeding demo data:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to seed demo data' },
      { status: 500 }
    );
  }
}
