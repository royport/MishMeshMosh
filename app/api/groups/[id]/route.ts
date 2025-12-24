import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET - Get single group with members
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const groupId = params.id;

    // Get group details
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .select('*')
      .eq('id', groupId)
      .single();

    if (groupError) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    // Check if user has access (owner or member)
    const { data: membership } = await supabase
      .from('group_members')
      .select('member_role')
      .eq('group_id', groupId)
      .eq('user_id', user.id)
      .single();

    const isOwner = group.owner_id === user.id;
    const isMember = !!membership;

    if (!isOwner && !isMember && group.visibility === 'private') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get members with user info
    const { data: members, error: membersError } = await supabase
      .from('group_members')
      .select(`
        id,
        member_role,
        created_at,
        user:users (id, email, full_name)
      `)
      .eq('group_id', groupId)
      .order('created_at', { ascending: true });

    if (membersError) throw membersError;

    // Get group campaigns
    const { data: campaigns, error: campaignsError } = await supabase
      .from('campaigns')
      .select(`
        id,
        kind,
        title,
        description,
        visibility,
        status_need,
        status_feed,
        created_at
      `)
      .eq('group_id', groupId)
      .order('created_at', { ascending: false });

    if (campaignsError) throw campaignsError;

    return NextResponse.json({
      group,
      members: members || [],
      campaigns: campaigns || [],
      userRole: isOwner ? 'owner' : membership?.member_role || 'viewer',
    });
  } catch (error: any) {
    console.error('Error fetching group:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch group' },
      { status: 500 }
    );
  }
}

// PATCH - Update group
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const groupId = params.id;
    const body = await request.json();

    // Check ownership
    const { data: group } = await supabase
      .from('groups')
      .select('owner_id')
      .eq('id', groupId)
      .single();

    if (!group || group.owner_id !== user.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const updates: any = {};
    if (body.name) updates.name = body.name.trim();
    if (body.visibility) updates.visibility = body.visibility;

    const { data: updatedGroup, error } = await supabase
      .from('groups')
      .update(updates)
      .eq('id', groupId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ group: updatedGroup });
  } catch (error: any) {
    console.error('Error updating group:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update group' },
      { status: 500 }
    );
  }
}

// DELETE - Delete group
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const groupId = params.id;

    // Check ownership
    const { data: group } = await supabase
      .from('groups')
      .select('owner_id')
      .eq('id', groupId)
      .single();

    if (!group || group.owner_id !== user.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const { error } = await supabase
      .from('groups')
      .delete()
      .eq('id', groupId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting group:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete group' },
      { status: 500 }
    );
  }
}
