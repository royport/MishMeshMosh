import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// GET - List groups for current user
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Groups where user is owner
    const { data: ownedGroups, error: ownedError } = await supabase
      .from('groups')
      .select('id, name, owner_id, visibility, created_at, updated_at')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false });

    if (ownedError) throw ownedError;

    // Groups where user is a member (join groups)
    const { data: memberships, error: memberError } = await supabase
      .from('group_members')
      .select(
        `
        member_role,
        group:groups (id, name, owner_id, visibility, created_at, updated_at)
      `
      )
      .eq('user_id', user.id);

    if (memberError) throw memberError;

    const ownedIds = new Set((ownedGroups ?? []).map(g => g.id));

    const memberGroups =
      (memberships ?? [])
        .map(m => {
          const g = (m as any).group; // join result
          if (!g) return null;
          return { ...g, member_role: m.member_role };
        })
        .filter(Boolean)
        // remove groups already included as owner
        .filter((mg: any) => !ownedIds.has(mg.id)) ?? [];

    const allGroups = [
      ...((ownedGroups ?? []).map(g => ({ ...g, member_role: 'owner' as const }))),
      ...(memberGroups as any[]),
    ];

    return NextResponse.json({ groups: allGroups });
  } catch (error: any) {
    console.error('Error fetching groups:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch groups' },
      { status: 500 }
    );
  }
}

// POST - Create a new group
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as {
      name?: string;
      visibility?: 'private' | 'public';
    };

    const name = body.name?.trim();
    const visibility = body.visibility ?? 'private';

    if (!name || name.length < 2) {
      return NextResponse.json(
        { error: 'Group name must be at least 2 characters' },
        { status: 400 }
      );
    }

    // Create the group
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .insert({
        name,
        owner_id: user.id,
        visibility,
      })
      .select('id, name, owner_id, visibility, created_at, updated_at')
      .single();

    if (groupError) throw groupError;

    // Add owner as member (best-effort)
    const { error: memberInsertError } = await supabase.from('group_members').insert({
      group_id: group.id,
      user_id: user.id,
      member_role: 'owner',
    });

    if (memberInsertError) {
      console.error('Error adding owner as member:', memberInsertError);
      // don't fail the whole request
    }

    return NextResponse.json({ group });
  } catch (error: any) {
    console.error('Error creating group:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create group' },
      { status: 500 }
    );
  }
}
