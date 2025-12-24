import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Add permission
export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin permission (only admins can manage permissions)
    const { data: permission } = await supabase
      .from('platform_permissions')
      .select('permission')
      .eq('user_id', user.id)
      .eq('permission', 'admin')
      .single();

    if (!permission) {
      return NextResponse.json(
        { error: 'Only admins can manage permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId, permission: newPermission } = body;

    if (!userId || !newPermission) {
      return NextResponse.json(
        { error: 'userId and permission are required' },
        { status: 400 }
      );
    }

    // Check if already exists
    const { data: existing } = await supabase
      .from('platform_permissions')
      .select('id')
      .eq('user_id', userId)
      .eq('permission', newPermission)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Permission already exists' },
        { status: 400 }
      );
    }

    // Add permission
    const { error: insertError } = await supabase
      .from('platform_permissions')
      .insert({
        user_id: userId,
        permission: newPermission,
      });

    if (insertError) throw insertError;

    // Log audit
    await supabase.from('audit_logs').insert({
      actor_user_id: user.id,
      action: 'permission_granted',
      entity_type: 'user',
      entity_id: userId,
      payload_json: { permission: newPermission },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error adding permission:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to add permission' },
      { status: 500 }
    );
  }
}

// Remove permission
export async function DELETE(request: Request) {
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
        { error: 'Only admins can manage permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId, permission: permissionToRemove } = body;

    if (!userId || !permissionToRemove) {
      return NextResponse.json(
        { error: 'userId and permission are required' },
        { status: 400 }
      );
    }

    // Can't remove own admin permission
    if (userId === user.id && permissionToRemove === 'admin') {
      return NextResponse.json(
        { error: 'Cannot remove your own admin permission' },
        { status: 400 }
      );
    }

    // Remove permission
    const { error: deleteError } = await supabase
      .from('platform_permissions')
      .delete()
      .eq('user_id', userId)
      .eq('permission', permissionToRemove);

    if (deleteError) throw deleteError;

    // Log audit
    await supabase.from('audit_logs').insert({
      actor_user_id: user.id,
      action: 'permission_revoked',
      entity_type: 'user',
      entity_id: userId,
      payload_json: { permission: permissionToRemove },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error removing permission:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to remove permission' },
      { status: 500 }
    );
  }
}
