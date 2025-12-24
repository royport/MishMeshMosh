import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { ProfileForm } from '@/components/workspace/profile-form';
import { calculateReputation } from '@/lib/reputation';
import { ReputationDisplay } from '@/components/trust/reputation-display';
import { VerificationBadges } from '@/components/trust/verification-badge';

export const metadata: Metadata = {
  title: 'Profile',
  description: 'Manage your MishMeshMosh profile',
};

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Calculate reputation
  const reputation = await calculateReputation(supabase, user.id);

  // Get verifications
  const { data: verifications } = await supabase
    .from('user_verifications')
    .select('method, status')
    .eq('user_id', user.id);

  // Add email as verified if user has confirmed email
  const allVerifications = [
    { method: 'email', status: user.email_confirmed_at ? 'verified' : 'pending' },
    ...(verifications || []),
  ];

  return (
    <div className="py-10">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900">Profile</h1>
          <p className="mt-2 text-neutral-600">Manage your account information and preferences</p>
        </div>

        <div className="space-y-6">
          {/* Reputation Section */}
          <div className="bg-white shadow-sm rounded-lg border border-neutral-200">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-neutral-900">Reputation</h2>
                <VerificationBadges verifications={allVerifications} />
              </div>
              
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg p-6">
                <ReputationDisplay reputation={reputation} showDetails={true} size="lg" />
              </div>

              <div className="mt-4 text-sm text-neutral-600">
                <p>
                  Your reputation score is calculated based on your activity: campaigns created,
                  deeds signed and fulfilled, and successful transactions.
                </p>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="bg-white shadow-sm rounded-lg border border-neutral-200">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">
                Personal Information
              </h2>
              <ProfileForm user={user} />
            </div>
          </div>

          {/* Verification Status */}
          <div className="bg-white shadow-sm rounded-lg border border-neutral-200">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">
                Verification Status
              </h2>
              
              {/* Email Verification */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-neutral-50 border border-neutral-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      user.email_confirmed_at ? 'bg-green-100' : 'bg-amber-100'
                    }`}>
                      <span className="text-xl">{user.email_confirmed_at ? '✓' : '⏳'}</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-neutral-900">Email Verification</p>
                    <p className="text-sm text-neutral-600">{user.email}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                  user.email_confirmed_at 
                    ? 'bg-success-100 text-success-700' 
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {user.email_confirmed_at ? 'Verified' : 'Pending'}
                </span>
              </div>

              {/* Phone Verification */}
              <div className="mt-4 flex items-center justify-between p-4 rounded-lg bg-neutral-50 border border-neutral-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-neutral-200 flex items-center justify-center">
                      <span className="text-xl">📱</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-neutral-900">Phone Verification</p>
                    <p className="text-sm text-neutral-600">Verify your phone number</p>
                  </div>
                </div>
                <span className="inline-flex items-center rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600">
                  Coming Soon
                </span>
              </div>

              {/* Identity Verification */}
              <div className="mt-4 flex items-center justify-between p-4 rounded-lg bg-neutral-50 border border-neutral-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-neutral-200 flex items-center justify-center">
                      <span className="text-xl">🆔</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-neutral-900">Identity Verification</p>
                    <p className="text-sm text-neutral-600">KYC verification for suppliers</p>
                  </div>
                </div>
                <span className="inline-flex items-center rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600">
                  Coming Soon
                </span>
              </div>

              {/* Business Verification */}
              <div className="mt-4 flex items-center justify-between p-4 rounded-lg bg-neutral-50 border border-neutral-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-neutral-200 flex items-center justify-center">
                      <span className="text-xl">🏢</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-neutral-900">Business Verification</p>
                    <p className="text-sm text-neutral-600">Verify your business entity</p>
                  </div>
                </div>
                <span className="inline-flex items-center rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600">
                  Coming Soon
                </span>
              </div>

              <div className="mt-4 p-4 rounded-lg bg-primary-50 border border-primary-200">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-primary-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-primary-700">
                      Higher verification levels unlock more features and build trust with other users.
                      Identity verification will be required for suppliers to fulfill campaigns.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Account Info */}
          <div className="bg-white shadow-sm rounded-lg border border-neutral-200">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">Account</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-900">User ID</p>
                    <p className="text-sm text-neutral-600 font-mono">{user.id}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-900">Member Since</p>
                    <p className="text-sm text-neutral-600">
                      {new Date(user.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
