import Link from 'next/link';
import { AppHeader } from '@/components/ui/app-header';

export default function DeedTemplatesPage() {
  return (
    <>
      <AppHeader />
      <main className="min-h-screen bg-slate-50">
        {/* Hero */}
        <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-20 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-4xl text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Deed Templates
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Understanding the digital documents that power MishMeshMosh
            </p>
          </div>
        </section>

        {/* Introduction */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-5xl">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 md:p-12 mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">What Are Deeds?</h2>
              <p className="text-slate-600 mb-4">
                Deeds are the digital documents that form the backbone of every MishMeshMosh transaction. 
                Unlike traditional contracts that require intermediaries, Deeds create trust through 
                transparent, auditable, and legally-binding digital commitments.
              </p>
              <p className="text-slate-600">
                Each Deed type serves a specific purpose in the campaign lifecycle, documenting commitments 
                at every stage from initial interest to final fulfillment.
              </p>
            </div>

            {/* Deed Types */}
            <div className="space-y-8">
              {/* Need Deed */}
              <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">Need Deed</h3>
                      <p className="text-blue-100">Backer Commitment Document</p>
                    </div>
                  </div>
                </div>
                <div className="p-8">
                  <p className="text-slate-600 mb-6">
                    The Need Deed is signed by backers when they join a campaign. It represents their 
                    commitment to purchase if the campaign succeeds and a supplier is assigned.
                  </p>
                  
                  <h4 className="font-semibold text-slate-900 mb-3">Key Components:</h4>
                  <ul className="list-disc list-inside text-slate-600 mb-6 space-y-2">
                    <li><strong>Backer Information:</strong> Name, contact details, account ID</li>
                    <li><strong>Campaign Reference:</strong> Link to the parent campaign</li>
                    <li><strong>Quantity Committed:</strong> Number of units the backer wants</li>
                    <li><strong>Price Acceptance:</strong> Maximum price willing to pay</li>
                    <li><strong>Terms Acceptance:</strong> Acknowledgment of campaign terms</li>
                    <li><strong>Digital Signature:</strong> Timestamp and cryptographic verification</li>
                    <li><strong>Version Control:</strong> Document version for audit trail</li>
                  </ul>

                  <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                    <h4 className="font-semibold text-blue-900 mb-2">When It's Generated:</h4>
                    <p className="text-blue-700 text-sm">
                      Created when a user clicks "Back This Campaign" and completes the commitment flow.
                    </p>
                  </div>
                </div>
              </div>

              {/* Feed Deed */}
              <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">Feed Deed</h3>
                      <p className="text-amber-100">Supplier Offer Document</p>
                    </div>
                  </div>
                </div>
                <div className="p-8">
                  <p className="text-slate-600 mb-6">
                    The Feed Deed is submitted by suppliers who want to fulfill a seeded campaign. 
                    It's a binding offer that locks in pricing, delivery terms, and fulfillment guarantees.
                  </p>
                  
                  <h4 className="font-semibold text-slate-900 mb-3">Key Components:</h4>
                  <ul className="list-disc list-inside text-slate-600 mb-6 space-y-2">
                    <li><strong>Supplier Information:</strong> Business details, contact, credentials</li>
                    <li><strong>Campaign Reference:</strong> Link to the seeded campaign</li>
                    <li><strong>Pricing Structure:</strong> Unit price, volume discounts, total cost</li>
                    <li><strong>Delivery Terms:</strong> Timeline, shipping method, logistics</li>
                    <li><strong>Fulfillment Guarantee:</strong> Quality standards, warranties</li>
                    <li><strong>Payment Terms:</strong> When and how payment is expected</li>
                    <li><strong>Validity Period:</strong> How long the offer remains open</li>
                    <li><strong>Digital Signature:</strong> Binding commitment verification</li>
                  </ul>

                  <div className="bg-amber-50 rounded-xl p-6 border border-amber-100">
                    <h4 className="font-semibold text-amber-900 mb-2">When It's Generated:</h4>
                    <p className="text-amber-700 text-sm">
                      Created when a supplier submits an offer on a campaign in the SEED or FEED phase.
                    </p>
                  </div>
                </div>
              </div>

              {/* Reed Deed */}
              <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">Reed Deed</h3>
                      <p className="text-purple-100">Assignment Contract</p>
                    </div>
                  </div>
                </div>
                <div className="p-8">
                  <p className="text-slate-600 mb-6">
                    The Reed Deed is the final contract that officially assigns the selected supplier 
                    to fulfill the campaign. It requires signatures from multiple parties and initiates 
                    the fulfillment process.
                  </p>
                  
                  <h4 className="font-semibold text-slate-900 mb-3">Key Components:</h4>
                  <ul className="list-disc list-inside text-slate-600 mb-6 space-y-2">
                    <li><strong>Campaign Summary:</strong> Complete overview of the need</li>
                    <li><strong>Linked Need Deeds:</strong> References to all backer commitments</li>
                    <li><strong>Selected Feed Deed:</strong> The winning supplier offer</li>
                    <li><strong>Assignment Terms:</strong> Final agreed-upon terms</li>
                    <li><strong>Milestone Schedule:</strong> Fulfillment checkpoints</li>
                    <li><strong>Payment Schedule:</strong> When funds are released</li>
                    <li><strong>Dispute Resolution:</strong> Process for handling issues</li>
                    <li><strong>Multi-Party Signatures:</strong> Campaign owner, supplier, platform witness</li>
                  </ul>

                  <div className="bg-purple-50 rounded-xl p-6 border border-purple-100">
                    <h4 className="font-semibold text-purple-900 mb-2">When It's Generated:</h4>
                    <p className="text-purple-700 text-sm">
                      Created when the campaign owner selects a supplier offer and initiates the assignment process.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Section */}
            <div className="mt-12 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 md:p-12 text-white">
              <h2 className="text-2xl font-bold mb-6">Deed Security & Verification</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/10 rounded-xl p-6">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold mb-2">Encrypted Storage</h3>
                  <p className="text-slate-300 text-sm">All deeds are encrypted at rest and in transit</p>
                </div>
                <div className="bg-white/10 rounded-xl p-6">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold mb-2">Tamper-Proof</h3>
                  <p className="text-slate-300 text-sm">Versioning ensures documents cannot be altered</p>
                </div>
                <div className="bg-white/10 rounded-xl p-6">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold mb-2">Full Audit Trail</h3>
                  <p className="text-slate-300 text-sm">Complete history of all document activities</p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-12 text-center">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Ready to Create Your First Deed?</h2>
              <p className="text-slate-600 mb-6">
                Start a campaign or explore existing needs to see deeds in action.
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
          </div>
        </section>
      </main>
    </>
  );
}
