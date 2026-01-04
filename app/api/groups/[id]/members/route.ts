import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// POST - Add member to group (invite)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: groupId } = await params;

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as { email?: string; role?: string };
    const email = body.email;
    const role = body.role ?? 'member';

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Check if user has permission to add members
    const { data: group } = await supabase
      .from('groups')
      .select('owner_id')
      .eq('id', groupId)
      .single();

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    const { data: membership } = await supabase
      .from('group_members')
      .select('member_role')
      .eq('group_id', groupId)
      .eq('user_id', user.id)
      .single();

    const isOwner = group.owner_id === user.id;
    const isMod = membership?.member_role === 'mod';

    if (!isOwner && !isMod) {
      return NextResponse.json(
        { error: 'Not authorized to add members' },
        { status: 403 }
      );
    }

    // Find user by email
    const { data: targetUser } = await supabase
      .from('users')
      .select('id, email, full_name')
      .eq('email', email.toLowerCase())
      .single();

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found with this email' },
        { status: 404 }
      );
    }

    // Check if already a member
    const { data: existingMember } = await supabase
      .from('group_members')
      .select('id')
      .eq('group_id', groupId)
      .eq('user_id', targetUser.id)
      .single();

    if (existingMember) {
      return NextResponse.json(
        { error: 'User is already a member' },
        { status: 400 }
      );
    }

    // Add member
    const { data: newMember, error: memberError } = await supabase
      .from('group_members')
      .insert({
        group_id: groupId,
        user_id: targetUser.id,
        member_role: role,
      })
      .select(
        `
        id,
        member_role,
        created_at,
        user:users (id, email, full_name)
      `
      )
      .single();

    if (memberError) throw memberError;

    // Create notification for invited user
    await supabase.from('notifications').insert({
      user_id: targetUser.id,
      kind: 'group_invite',
      context_type: 'group',
      context_id: groupId,
      payload_json: {
        group_id: groupId,
        invited_by: user.id,
        role,
      },
    });

    return NextResponse.json({ member: newMember });
  } catch (error: any) {
    console.error('Error adding member:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to add member' },
      { status: 500 }
    );
  }
}

// DELETE - Remove member from group
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: groupId } = await params;

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');
    const userId = searchParams.get('userId');

    if (!memberId && !userId) {
      return NextResponse.json(
        { error: 'memberId or userId is required' },
        { status: 400 }
      );
    }

    // Check permissions
    const { data: group } = await supabase
      .from('groups')
      .select('owner_id')
      .eq('id', groupId)
      .single();

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    const isOwner = group.owner_id === user.id;

    // Users can remove themselves, owners can remove anyone
    const targetUserId = userId ?? null;
    const isSelfRemoval = targetUserId === user.id;

    if (!isOwner && !isSelfRemoval) {
      return NextResponse.json(
        { error: 'Not authorized to remove members' },
        { status: 403 }
      );
    }

    // Cannot remove owner
    if (targetUserId === group.owner_id) {
      return NextResponse.json(
        { error: 'Cannot remove the group owner' },
        { status: 400 }
      );
    }

    let query = supabase.from('group_members').delete().eq('group_id', groupId);

    if (memberId) {
      query = query.eq('id', memberId);
    } else if (userId) {
      query = query.eq('user_id', userId);
    }

    const { error } = await query;
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error removing member:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to remove member' },
      { status: 500 }
    );
  }
}
