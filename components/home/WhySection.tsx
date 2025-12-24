import Link from 'next/link';

const WHY_ITEMS = [
  { title: 'Demand Originates Anywhere', desc: 'End users, groups, resellers, even manufacturers can initiate campaigns', icon: '🌍' },
  { title: 'Trust Through Documents', desc: 'Deeds create enforceable clarity without payment custody', icon: '📜' },
  { title: 'Supplier-Ready Aggregation', desc: 'Suppliers see totals and clear terms, not chaos', icon: '📊' },
  { title: 'Private Group Campaigns', desc: 'Communities coordinate purchases without forming a company', icon: '👥' },
  { title: 'Scales Across Everything', desc: 'From bulk items to service bundles, any need can become a deed', icon: '📈' },
];

export function WhySection() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="inline-block px-4 py-1 rounded-full bg-primary-100 text-primary-700 text-sm font-semibold mb-4">
              WHY CHOOSE US
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-8">Why MishMeshMosh Wins</h2>

            <div className="space-y-6">
              {WHY_ITEMS.map((item) => (
                <div key={item.title} className="flex gap-4 p-4 rounded-xl hover:bg-white hover:shadow-md transition-all">
                  <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center text-2xl flex-shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">{item.title}</h3>
                    <p className="text-slate-600 text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-3xl p-10 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-black/10 rounded-full blur-3xl" />

              <div className="relative">
                <h3 className="text-2xl sm:text-3xl font-bold mb-4">Ready to turn your need into reality?</h3>
                <p className="text-primary-100 mb-8 leading-relaxed">
                  Experience what entrepreneurs do — defining demand, setting terms, and triggering supply — without taking heavy upfront risk.
                </p>
                <Link
                  href="/auth/signup"
                  className="inline-flex items-center justify-center w-full gap-2 rounded-xl bg-white px-6 py-4 text-base font-semibold text-primary-600 hover:bg-primary-50 transition-all"
                >
                  Create Your First Campaign
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
