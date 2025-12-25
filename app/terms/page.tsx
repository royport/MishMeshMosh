import Link from 'next/link';
import { AppHeader } from '@/components/ui/app-header';

export default function TermsOfServicePage() {
  return (
    <>
      <AppHeader />
      <main className="min-h-screen bg-slate-50">
        {/* Hero */}
        <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-16 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-4xl text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Terms of Service
            </h1>
            <p className="text-slate-400">Last updated: January 2025</p>
          </div>
        </section>

        {/* Content */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-4xl">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 md:p-12">
              <div className="prose prose-slate max-w-none">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Acceptance of Terms</h2>
                <p className="text-slate-600 mb-6">
                  By accessing or using MishMeshMosh (&quot;the Platform&quot;), you agree to be bound by these Terms of Service.
                  If you do not agree to these terms, please do not use the Platform.
                </p>

                <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Description of Service</h2>
                <p className="text-slate-600 mb-6">
                  MishMeshMosh is a demand-first commerce platform that facilitates connections between buyers (&quot;Backers&quot;)
                  who express needs and suppliers who fulfill them. The Platform uses digital documents called &quot;Deeds&quot;
                  to record commitments, offers, and assignments.
                </p>

                <h2 className="text-2xl font-bold text-slate-900 mb-4">3. User Accounts</h2>
                <p className="text-slate-600 mb-4">To use certain features of the Platform, you must:</p>
                <ul className="list-disc list-inside text-slate-600 mb-6 space-y-2">
                  <li>Create an account with accurate and complete information</li>
                  <li>Maintain the security of your account credentials</li>
                  <li>Be at least 18 years old or the age of majority in your jurisdiction</li>
                  <li>Accept responsibility for all activities under your account</li>
                </ul>

                <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Deeds and Commitments</h2>
                <p className="text-slate-600 mb-4">
                  When you sign a Deed on the Platform, you are entering into a binding commitment:
                </p>
                <ul className="list-disc list-inside text-slate-600 mb-6 space-y-2">
                  <li><strong>Need Deeds:</strong> Represent your commitment to purchase as specified if the campaign succeeds</li>
                  <li><strong>Feed Deeds:</strong> Represent a supplier&apos;s binding offer to fulfill under specified terms</li>
                  <li><strong>Reed Deeds:</strong> Represent the final assignment linking backers to suppliers</li>
                </ul>
                <p className="text-slate-600 mb-6">
                  Signing a Deed constitutes your electronic signature and legal commitment to the terms specified therein.
                </p>

                <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Campaign Rules</h2>
                <p className="text-slate-600 mb-4">Campaigns on the Platform must:</p>
                <ul className="list-disc list-inside text-slate-600 mb-6 space-y-2">
                  <li>Represent legitimate needs for legal products or services</li>
                  <li>Provide accurate descriptions and terms</li>
                  <li>Set reasonable thresholds and deadlines</li>
                  <li>Not involve prohibited items or fraudulent schemes</li>
                </ul>

                <h2 className="text-2xl font-bold text-slate-900 mb-4">6. Platform Fees</h2>
                <p className="text-slate-600 mb-6">
                  MishMeshMosh may charge fees for successful transactions. Fee structures will be clearly
                  communicated before any charges apply. Creating campaigns and signing Need Deeds is free.
                </p>

                <h2 className="text-2xl font-bold text-slate-900 mb-4">7. Dispute Resolution</h2>
                <p className="text-slate-600 mb-6">
                  The Platform provides dispute resolution mechanisms for conflicts between parties.
                  Users agree to attempt resolution through the Platform before pursuing other remedies.
                  MishMeshMosh serves as a facilitator and not an arbiter in disputes.
                </p>

                <h2 className="text-2xl font-bold text-slate-900 mb-4">8. Limitation of Liability</h2>
                <p className="text-slate-600 mb-6">
                  MishMeshMosh is a platform that connects parties but does not guarantee the performance
                  of any user. We are not responsible for the quality, safety, or legality of items or
                  services offered, the truth or accuracy of listings, or the ability of parties to complete transactions.
                </p>

                <h2 className="text-2xl font-bold text-slate-900 mb-4">9. Prohibited Activities</h2>
                <p className="text-slate-600 mb-4">Users may not:</p>
                <ul className="list-disc list-inside text-slate-600 mb-6 space-y-2">
                  <li>Violate any laws or regulations</li>
                  <li>Infringe on intellectual property rights</li>
                  <li>Post fraudulent, misleading, or deceptive content</li>
                  <li>Harass or abuse other users</li>
                  <li>Attempt to circumvent platform security or fees</li>
                  <li>Use the Platform for money laundering or illegal purposes</li>
                </ul>

                <h2 className="text-2xl font-bold text-slate-900 mb-4">10. Termination</h2>
                <p className="text-slate-600 mb-6">
                  We reserve the right to suspend or terminate accounts that violate these terms.
                  Users may close their accounts at any time, subject to fulfilling any outstanding
                  commitments under signed Deeds.
                </p>

                <h2 className="text-2xl font-bold text-slate-900 mb-4">11. Changes to Terms</h2>
                <p className="text-slate-600 mb-6">
                  We may update these terms from time to time. Continued use of the Platform after
                  changes constitutes acceptance of the new terms. We will notify users of significant changes.
                </p>

                <h2 className="text-2xl font-bold text-slate-900 mb-4">12. Contact</h2>
                <p className="text-slate-600 mb-6">
                  For questions about these Terms of Service, please contact us at{' '}
                  <a href="mailto:legal@mishmeshmosh.com" className="text-primary-600 hover:underline">legal@mishmeshmosh.com</a>.
                </p>
              </div>
            </div>

            <div className="mt-8 text-center">
              <Link href="/" className="text-primary-600 font-medium hover:underline">
                ← Back to Home
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
