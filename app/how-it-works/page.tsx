import Link from 'next/link';
import { AppHeader } from '@/components/ui/app-header';

export default function HowItWorksPage() {
  return (
    <>
      <AppHeader />
      <main className="min-h-screen bg-slate-50">
        {/* Hero */}
        <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-20 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-4xl text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              How MishMeshMosh Works
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              A demand-first platform that turns collective needs into supplier-ready deals through digital deeds.
            </p>
          </div>
        </section>

        {/* The 4-Phase Process */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-3xl font-bold text-slate-900 text-center mb-16">The 4-Phase Lifecycle</h2>

            <div className="space-y-12">
              {/* NEED Phase */}
              <div className="flex flex-col md:flex-row gap-8 items-start bg-white rounded-2xl p-8 shadow-lg border border-slate-100">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/30">
                  <span className="text-4xl">❓</span>
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">PHASE 1</span>
                    <h3 className="text-2xl font-bold text-slate-900">NEED</h3>
                  </div>
                  <p className="text-slate-600 mb-4">
                    Anyone can create a campaign expressing a need. Define what you want, set minimum thresholds,
                    and establish terms. Backers join by signing a <strong>Need Deed</strong> — a digital commitment
                    that documents their intent without requiring upfront payment.
                  </p>
                  <ul className="list-disc list-inside text-slate-500 space-y-1 text-sm">
                    <li>Create campaigns for products, services, or experiences</li>
                    <li>Set minimum backer thresholds for validation</li>
                    <li>Define terms, quantities, and acceptable price ranges</li>
                    <li>Backers commit through legally-binding Need Deeds</li>
                  </ul>
                </div>
              </div>

              {/* SEED Phase */}
              <div className="flex flex-col md:flex-row gap-8 items-start bg-white rounded-2xl p-8 shadow-lg border border-slate-100">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/30">
                  <span className="text-4xl">🌱</span>
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">PHASE 2</span>
                    <h3 className="text-2xl font-bold text-slate-900">SEED</h3>
                  </div>
                  <p className="text-slate-600 mb-4">
                    When the campaign reaches its threshold, the need is validated and &quot;seeded.&quot; The platform
                    aggregates all commitments into a clear package that suppliers can understand and bid on.
                  </p>
                  <ul className="list-disc list-inside text-slate-500 space-y-1 text-sm">
                    <li>Automatic transition when threshold is met</li>
                    <li>All Need Deeds aggregated into supplier-ready package</li>
                    <li>Total quantities, terms, and requirements clearly documented</li>
                    <li>Campaign becomes visible to potential suppliers</li>
                  </ul>
                </div>
              </div>

              {/* FEED Phase */}
              <div className="flex flex-col md:flex-row gap-8 items-start bg-white rounded-2xl p-8 shadow-lg border border-slate-100">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-500/30">
                  <span className="text-4xl">🚿</span>
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">PHASE 3</span>
                    <h3 className="text-2xl font-bold text-slate-900">FEED</h3>
                  </div>
                  <p className="text-slate-600 mb-4">
                    Suppliers compete to fulfill the aggregated need. They submit <strong>Feed Deeds</strong> —
                    binding offers that specify pricing, delivery terms, and fulfillment guarantees.
                  </p>
                  <ul className="list-disc list-inside text-slate-500 space-y-1 text-sm">
                    <li>Multiple suppliers can submit competing offers</li>
                    <li>Each offer is documented in a Feed Deed</li>
                    <li>Transparent comparison of pricing and terms</li>
                    <li>Campaign owner selects the best offer</li>
                  </ul>
                </div>
              </div>

              {/* REED Phase */}
              <div className="flex flex-col md:flex-row gap-8 items-start bg-white rounded-2xl p-8 shadow-lg border border-slate-100">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/30">
                  <span className="text-4xl">🌾</span>
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">PHASE 4</span>
                    <h3 className="text-2xl font-bold text-slate-900">REED</h3>
                  </div>
                  <p className="text-slate-600 mb-4">
                    The assignment is made official through a <strong>Reed Deed</strong> — a multi-party contract
                    that links backers to the selected supplier. Fulfillment is tracked through milestones until completion.
                  </p>
                  <ul className="list-disc list-inside text-slate-500 space-y-1 text-sm">
                    <li>Multi-party signatures confirm the assignment</li>
                    <li>Clear milestones for fulfillment tracking</li>
                    <li>Dispute resolution available if needed</li>
                    <li>Campaign closes upon successful delivery</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="container mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold text-slate-900 mb-6">Ready to Start?</h2>
            <p className="text-slate-600 mb-8">
              Whether you have a need or want to supply one, MishMeshMosh makes it easy to connect.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/create"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-8 py-4 text-base font-semibold text-white hover:bg-primary-700 transition-all"
              >
                Create a Campaign
              </Link>
              <Link
                href="/explore"
                className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-slate-300 px-8 py-4 text-base font-semibold text-slate-700 hover:bg-slate-50 transition-all"
              >
                Explore Campaigns
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
