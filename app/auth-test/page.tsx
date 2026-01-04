'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowser } from '@/lib/supabase/client';

export default async function AuthTestPage() {
  const router = useRouter();
  const [status, setStatus] = useState<string>('Checking...');
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkAuth() {
      try {
        const supabase = await createSupabaseBrowser();
        
        // Check session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          setError(`Session error: ${sessionError.message}`);
          setStatus('Session error');
          return;
        }

        if (!session) {
          setStatus('No session found');
          setError('You are not logged in. Session is null.');
          return;
        }

        // Check user
        const { data: { user: authUser }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          setError(`User error: ${userError.message}`);
          setStatus('User error');
          return;
        }

        if (authUser) {
          setUser(authUser);
          setStatus('Authenticated');
        } else {
          setStatus('No user');
          setError('Session exists but no user found');
        }
      } catch (err: any) {
        setError(`Exception: ${err.message}`);
        setStatus('Exception');
      }
    }

    checkAuth();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4">Auth Test Page</h1>
        
        <div className="space-y-4">
          <div>
            <label className="font-semibold text-gray-700">Status:</label>
            <p className={`text-lg ${status === 'Authenticated' ? 'text-green-600' : 'text-red-600'}`}>
              {status}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {user && (
            <div className="bg-green-50 border border-green-200 rounded p-3">
              <p className="text-sm"><strong>User ID:</strong> {user.id}</p>
              <p className="text-sm"><strong>Email:</strong> {user.email}</p>
              <p className="text-sm"><strong>Created:</strong> {new Date(user.created_at).toLocaleString()}</p>
            </div>
          )}

          <div className="pt-4 space-y-2">
            <button
              onClick={() => router.push('/auth/login')}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Go to Login
            </button>
            <button
              onClick={() => router.push('/workspace')}
              className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Try Workspace
            </button>
            <button
              onClick={async () => {
                const supabase = await createSupabaseBrowser();
                await supabase.auth.signOut();
                window.location.reload();
              }}
              className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
