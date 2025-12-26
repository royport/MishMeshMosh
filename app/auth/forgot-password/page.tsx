import type { Metadata } from 'next';
import Link from 'next/link';
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';
import Image from "next/image";


export const metadata: Metadata = {
  title: 'Forgot Password',
  description: 'Reset your MishMeshMosh account password.',
};

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Back to login link */}
      <div className="absolute top-4 left-4">
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Sign In
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex justify-center">

          <Image
                src="/mishmeshmosh_black.png"
                alt="MishMeshMosh"
                width={160}
                height={40}
                className="h-12 w-auto"
                priority
              />
        </Link>
        <h2 className="mt-6 text-center text-3xl font-bold text-neutral-900">
          Reset your password
        </h2>
        <p className="mt-2 text-center text-sm text-neutral-600">
          Enter your email address and we&apos;ll send you a link to reset your password.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm sm:rounded-lg sm:px-10 border border-neutral-200">
          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  );
}
