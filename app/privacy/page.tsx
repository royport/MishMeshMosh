import Link from 'next/link';
import { AppHeader } from '@/components/ui/app-header';

export default function PrivacyPolicyPage() {
  return (
    <>
      <AppHeader />
      <main className="min-h-screen bg-slate-50">
        {/* Hero */}
        <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-16 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-4xl text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Privacy Policy
            </h1>
            <p className="text-slate-400">Last updated: January 2025</p>
          </div>
        </section>

        {/* Content */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-4xl">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 md:p-12">
              <div className="prose prose-slate max-w-none">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Introduction</h2>
                <p className="text-slate-600 mb-6">
                  MishMeshMosh (&quot;we,&quot; &quot;our,&quot; or &quot;the Platform&quot;) is committed to protecting your privacy.
                  This Privacy Policy explains how we collect, use, disclose, and safeguard your information
                  when you use our platform.
                </p>

                <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Information We Collect</h2>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">Personal Information</h3>
                <p className="text-slate-600 mb-4">We may collect:</p>
                <ul className="list-disc list-inside text-slate-600 mb-6 space-y-2">
                  <li>Name and contact information (email address, phone number)</li>
                  <li>Account credentials</li>
                  <li>Profile information you choose to provide</li>
                  <li>Payment information (processed securely by third-party providers)</li>
                  <li>Communications you send to us or other users</li>
                </ul>

                <h3 className="text-xl font-semibold text-slate-800 mb-3">Usage Information</h3>
                <p className="text-slate-600 mb-4">We automatically collect:</p>
                <ul className="list-disc list-inside text-slate-600 mb-6 space-y-2">
                  <li>Device and browser information</li>
                  <li>IP address and location data</li>
                  <li>Pages viewed and actions taken on the Platform</li>
                  <li>Campaign interactions (views, backings, offers)</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>

                <h2 className="text-2xl font-bold text-slate-900 mb-4">3. How We Use Your Information</h2>
                <p className="text-slate-600 mb-4">We use collected information to:</p>
                <ul className="list-disc list-inside text-slate-600 mb-6 space-y-2">
                  <li>Provide, maintain, and improve the Platform</li>
                  <li>Process transactions and send related information</li>
                  <li>Create and manage your account</li>
                  <li>Facilitate communication between users</li>
                  <li>Send notifications about campaigns and platform updates</li>
                  <li>Generate and store Deeds and other legal documents</li>
                  <li>Prevent fraud and ensure platform security</li>
                  <li>Comply with legal obligations</li>
                  <li>Analyze usage patterns to improve user experience</li>
                </ul>

                <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Information Sharing</h2>
                <p className="text-slate-600 mb-4">We may share your information with:</p>
                <ul className="list-disc list-inside text-slate-600 mb-6 space-y-2">
                  <li><strong>Other Users:</strong> Your public profile, campaign activity, and Deed signatures are visible to relevant parties</li>
                  <li><strong>Service Providers:</strong> Third parties who help us operate the Platform</li>
                  <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                  <li><strong>Business Transfers:</strong> In connection with mergers or acquisitions</li>
                </ul>
                <p className="text-slate-600 mb-6">
                  We do not sell your personal information to third parties.
                </p>

                <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Data Security</h2>
                <p className="text-slate-600 mb-6">
                  We implement appropriate technical and organizational measures to protect your information.
                  However, no method of transmission over the Internet is 100% secure. We cannot guarantee
                  absolute security but strive to protect your data using industry-standard practices.
                </p>

                <h2 className="text-2xl font-bold text-slate-900 mb-4">6. Data Retention</h2>
                <p className="text-slate-600 mb-6">
                  We retain your information for as long as your account is active or as needed to provide
                  services. Deed documents may be retained indefinitely as they represent legal records.
                  You may request deletion of your account, subject to our legal obligations to retain certain records.
                </p>

                <h2 className="text-2xl font-bold text-slate-900 mb-4">7. Your Rights</h2>
                <p className="text-slate-600 mb-4">Depending on your location, you may have the right to:</p>
                <ul className="list-disc list-inside text-slate-600 mb-6 space-y-2">
                  <li>Access the personal information we hold about you</li>
                  <li>Correct inaccurate information</li>
                  <li>Request deletion of your information</li>
                  <li>Object to or restrict certain processing</li>
                  <li>Data portability</li>
                  <li>Withdraw consent where applicable</li>
                </ul>
                <p className="text-slate-600 mb-6">
                  To exercise these rights, contact us at{' '}
                  <a href="mailto:privacy@mishmeshmosh.com" className="text-primary-600 hover:underline">privacy@mishmeshmosh.com</a>.
                </p>

                <h2 className="text-2xl font-bold text-slate-900 mb-4">8. Cookies</h2>
                <p className="text-slate-600 mb-6">
                  We use cookies and similar technologies to enhance your experience, analyze usage,
                  and remember your preferences. You can control cookies through your browser settings,
                  though some Platform features may not function properly without them.
                </p>

                <h2 className="text-2xl font-bold text-slate-900 mb-4">9. Third-Party Links</h2>
                <p className="text-slate-600 mb-6">
                  The Platform may contain links to third-party websites. We are not responsible for
                  the privacy practices of these external sites. We encourage you to review their privacy policies.
                </p>

                <h2 className="text-2xl font-bold text-slate-900 mb-4">10. Children&apos;s Privacy</h2>
                <p className="text-slate-600 mb-6">
                  The Platform is not intended for users under 18 years of age. We do not knowingly
                  collect information from children. If we learn we have collected information from a
                  child, we will delete it promptly.
                </p>

                <h2 className="text-2xl font-bold text-slate-900 mb-4">11. International Users</h2>
                <p className="text-slate-600 mb-6">
                  If you access the Platform from outside the United States, your information may be
                  transferred to and processed in the United States or other countries. By using the
                  Platform, you consent to such transfers.
                </p>

                <h2 className="text-2xl font-bold text-slate-900 mb-4">12. Changes to This Policy</h2>
                <p className="text-slate-600 mb-6">
                  We may update this Privacy Policy periodically. We will notify you of material changes
                  by posting the new policy on the Platform and updating the &quot;Last updated&quot; date.
                </p>

                <h2 className="text-2xl font-bold text-slate-900 mb-4">13. Contact Us</h2>
                <p className="text-slate-600 mb-6">
                  For questions about this Privacy Policy, please contact us at:{' '}
                  <a href="mailto:privacy@mishmeshmosh.com" className="text-primary-600 hover:underline">privacy@mishmeshmosh.com</a>
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
