import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { WorkspaceNav } from '@/components/workspace/workspace-nav';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  // If there's an error or no user, redirect to login
  if (error || !user) {
    console.log('Workspace: No user found, redirecting to login');
    redirect('/auth/login');
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <WorkspaceNav user={user} />
      <main>{children}</main>
    </div>
  );
}
