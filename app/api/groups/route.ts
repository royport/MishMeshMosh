import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET - List groups for current user
export async function GET() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get groups where user is owner or member
    const { data: ownedGroups, error: ownedError } = await supabase
      .from('groups')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false });

    if (ownedError) throw ownedError;

    const { data: memberships, error: memberError } = await supabase
      .from('group_members')
      .select(`
        member_role,
        group:groups (*)
      `)
      .eq('user_id', user.id);

    if (memberError) throw memberError;

    // Combine and deduplicate
    const memberGroups = memberships
      ?.filter(m => m.group)
      .map(m => ({ ...m.group, member_role: m.member_role })) || [];

    const allGroups = [
      ...(ownedGroups?.map(g => ({ ...g, member_role: 'owner' })) || []),
      ...memberGroups.filter(mg => !ownedGroups?.some(og => og.id === mg.id))
    ];

    return NextResponse.json({ groups: allGroups });
  } catch (error: any) {
    console.error('Error fetching groups:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch groups' },
      { status: 500 }
    );
  }
}

// POST - Create a new group
export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, visibility = 'private' } = body;

    if (!name || name.trim().length < 2) {
      return NextResponse.json(
        { error: 'Group name must be at least 2 characters' },
        { status: 400 }
      );
    }

    // Create the group
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .insert({
        name: name.trim(),
        owner_id: user.id,
        visibility,
      })
      .select()
      .single();

    if (groupError) throw groupError;

    // Add owner as a member with 'owner' role
    const { error: memberError } = await supabase
      .from('group_members')
      .insert({
        group_id: group.id,
        user_id: user.id,
        member_role: 'owner',
      });

    if (memberError) {
      console.error('Error adding owner as member:', memberError);
    }

    return NextResponse.json({ group });
  } catch (error: any) {
    console.error('Error creating group:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create group' },
      { status: 500 }
    );
  }
}
