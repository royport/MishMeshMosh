import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AdminNav } from '@/components/admin/admin-nav';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Check if user has admin permission
  const { data: permission } = await supabase
    .from('platform_permissions')
    .select('permission')
    .eq('user_id', user.id)
    .in('permission', ['admin', 'moderator'])
    .single();

  if (!permission) {
    redirect('/workspace');
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNav userRole={permission.permission} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
