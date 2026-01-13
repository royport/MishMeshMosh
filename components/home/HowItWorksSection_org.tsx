import Link from 'next/link';

type JourneyStep = {
  step: number;
  label: string;
  emoji: string;
  gradient: string;
  badgeBg: string;
  hoverRotate: string;
  description: string;
};

type CampaignCard = {
  href: string;
  outerGradient: string;
  borderColor: string;
  hoverBorder: string;
  hoverShadow: string;
  arrowBg: string;
  iconBg: string;
  title: string;
  tagText: string;
  tagBg: string;
  description: string;
  bullets: { text: string; dotColor: string; textColor: string }[];
  iconPath: string;
};

type DeedCard = {
  title: string;
  subtitle: string;
  body: string;
  accentBorderHover: string;
  accentBg: string;
  accentText: string;
  pills: { text: string; className: string }[];
};

const JOURNEY: JourneyStep[] = [
  {
    step: 1,
    label: 'NEED',
    emoji: '❓',
    gradient: 'from-blue-500 to-blue-600',
    badgeBg: 'bg-blue-600',
    hoverRotate: 'group-hover:-rotate-3',
    description: 'Backers express demand and sign commitments to join the campaign',
  },
  {
    step: 2,
    label: 'SEED',
    emoji: '🌱',
    gradient: 'from-emerald-500 to-emerald-600',
    badgeBg: 'bg-emerald-600',
    hoverRotate: 'group-hover:rotate-3',
    description: 'Threshold met! Demand is validated and aggregated into a ready package',
  },
  {
    step: 3,
    label: 'FEED',
    emoji: '🚿',
    gradient: 'from-amber-500 to-orange-500',
    badgeBg: 'bg-amber-600',
    hoverRotate: 'group-hover:-rotate-3',
    description: 'Suppliers compete to fulfill the aggregated need with their best offers',
  },
  {
    step: 4,
    label: 'REED',
    emoji: '🌾',
    gradient: 'from-purple-500 to-purple-600',
    badgeBg: 'bg-purple-600',
    hoverRotate: 'group-hover:rotate-3',
    description: 'Assignment made, fulfillment tracked until completion',
  },
];

const CAMPAIGN_CARDS: CampaignCard[] = [
  {
    href: '/explore',
    outerGradient: 'from-blue-50 to-white',
    borderColor: 'border-blue-100',
    hoverBorder: 'hover:border-blue-300',
    hoverShadow: 'hover:shadow-blue-500/10',
    arrowBg: 'bg-blue-500',
    iconBg: 'bg-blue-500',
    title: 'Need Campaign',
    tagText: 'Demand',
    tagBg: 'bg-blue-500',
    description:
      'Where backers gather around a shared need. Set thresholds, define terms, and aggregate demand into supplier-ready packages.',
    bullets: [
      { text: 'NEED Phase', dotColor: 'bg-blue-500', textColor: 'text-blue-600' },
      { text: 'SEED Phase', dotColor: 'bg-emerald-500', textColor: 'text-emerald-600' },
    ],
    iconPath: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
  },
  {
    href: '/explore/feeds',
    outerGradient: 'from-amber-50 to-white',
    borderColor: 'border-amber-100',
    hoverBorder: 'hover:border-amber-300',
    hoverShadow: 'hover:shadow-amber-500/10',
    arrowBg: 'bg-amber-500',
    iconBg: 'bg-amber-500',
    title: 'Feed Campaign',
    tagText: 'Supply',
    tagBg: 'bg-amber-500',
    description:
      'Where suppliers submit offers to fulfill seeded needs. Compete on price, terms, and delivery to win the assignment.',
    bullets: [
      { text: 'FEED Phase', dotColor: 'bg-amber-500', textColor: 'text-amber-600' },
      { text: 'REED Phase', dotColor: 'bg-purple-500', textColor: 'text-purple-600' },
    ],
    iconPath: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
  },
];

const DEEDS: DeedCard[] = [
  {
    title: 'Need Deed',
    subtitle: 'Backer Commitment',
    body: 'Backers sign to commit to the campaign. Documents quantity, terms, and deposit requirements.',
    accentBorderHover: 'hover:border-blue-500/50',
    accentBg: 'bg-blue-500/20',
    accentText: 'text-blue-400',
    pills: [
      { text: 'Legally Binding', className: 'bg-blue-500/20 text-blue-300' },
      { text: 'Versioned', className: 'bg-white/5 text-slate-400' },
    ],
  },
  {
    title: 'Feed Deed',
    subtitle: 'Supplier Offer',
    body: 'Suppliers sign to commit their offer. Locks in pricing, delivery terms, and fulfillment guarantees.',
    accentBorderHover: 'hover:border-amber-500/50',
    accentBg: 'bg-amber-500/20',
    accentText: 'text-amber-400',
    pills: [
      { text: 'Competitive', className: 'bg-amber-500/20 text-amber-300' },
      { text: 'Auditable', className: 'bg-white/5 text-slate-400' },
    ],
  },
  {
    title: 'Reed Deed',
    subtitle: 'Assignment Contract',
    body: 'Links Need Deeds to selected supplier. Multi-party signatures confirm the assignment.',
    accentBorderHover: 'hover:border-purple-500/50',
    accentBg: 'bg-purple-500/20',
    accentText: 'text-purple-400',
    pills: [
      { text: 'Multi-Party', className: 'bg-purple-500/20 text-purple-300' },
      { text: 'Traceable', className: 'bg-white/5 text-slate-400' },
    ],
  },
];

function JourneyStepCard({ item }: { item: JourneyStep }) {
  return (
    <div className="relative text-center group">
      <div className="relative inline-block mb-6">
        <div
          className={[
            'w-28 h-28 rounded-3xl bg-gradient-to-br shadow-xl flex items-center justify-center mx-auto transform group-hover:scale-110 transition-all duration-300',
            item.gradient,
            item.hoverRotate,
            item.label === 'NEED' ? 'shadow-blue-500/30' : '',
            item.label === 'SEED' ? 'shadow-emerald-500/30' : '',
            item.label === 'FEED' ? 'shadow-amber-500/30' : '',
            item.label === 'REED' ? 'shadow-purple-500/30' : '',
          ].join(' ')}
        >
          <span className="text-5xl">{item.emoji}</span>
        </div>
        <div className={`absolute -top-3 -right-3 w-10 h-10 ${item.badgeBg} rounded-xl flex items-center justify-center text-white font-bold shadow-lg rotate-12`}>
          {item.step}
        </div>
      </div>
      <h4 className="text-2xl font-bold text-slate-900 mb-3">{item.label}</h4>
      <p className="text-slate-600 leading-relaxed">{item.description}</p>
    </div>
  );
}

function CampaignTypeCard({ card }: { card: CampaignCard }) {
  return (
    <Link
      href={card.href}
      className={[
        'group relative bg-gradient-to-br border-2 rounded-2xl p-8 transition-all duration-300',
        card.outerGradient,
        card.borderColor,
        card.hoverBorder,
        'hover:shadow-xl',
        card.hoverShadow,
      ].join(' ')}
    >
      <div
        className={[
          'absolute top-6 right-6 w-12 h-12 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all',
          card.arrowBg,
        ].join(' ')}
      >
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </div>

      <div className="flex items-start gap-5">
        <div className={`w-16 h-16 rounded-2xl ${card.iconBg} flex items-center justify-center flex-shrink-0 shadow-lg`}>
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={card.iconPath} />
          </svg>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h4 className="text-xl font-bold text-slate-900">{card.title}</h4>
            <span className={`px-3 py-1 ${card.tagBg} text-white text-xs font-bold rounded-full uppercase tracking-wide`}>
              {card.tagText}
            </span>
          </div>

          <p className="text-slate-600 mb-4">{card.description}</p>

          <div className="flex items-center gap-6 text-sm">
            {card.bullets.map((b) => (
              <span key={b.text} className={`flex items-center gap-2 ${b.textColor}`}>
                <span className={`w-3 h-3 ${b.dotColor} rounded-full`} />
                {b.text}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}

function DeedCardView({ deed }: { deed: DeedCard }) {
  return (
    <div
      className={[
        'group bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300',
        deed.accentBorderHover,
      ].join(' ')}
    >
      <div className="flex items-center gap-4 mb-5">
        <div className={`w-14 h-14 rounded-xl ${deed.accentBg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
          <svg className={`w-7 h-7 ${deed.accentText}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <div>
          <h4 className="font-bold text-white text-lg">{deed.title}</h4>
          <p className={`${deed.accentText} text-sm`}>{deed.subtitle}</p>
        </div>
      </div>

      <p className="text-slate-400 text-sm mb-5 leading-relaxed">{deed.body}</p>

      <div className="flex items-center gap-2">
        {deed.pills.map((p) => (
          <span key={p.text} className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${p.className}`}>
            {p.text}
          </span>
        ))}
      </div>
    </div>
  );
}

export function HowItWorksSection() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1 rounded-full bg-primary-100 text-primary-700 text-sm font-semibold mb-4">
            THE PROCESS
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold text-slate-900 mb-4">How It Works</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            From Need to Deed: A transparent lifecycle that turns collective demand into executed supply
          </p>
        </div>

        {/* Journey Flow */}
        <div className="relative mb-16">
          <div className="hidden md:block absolute top-24 left-[12%] right-[12%] h-1 bg-gradient-to-r from-blue-500 via-emerald-500 via-amber-500 to-purple-500 rounded-full" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {JOURNEY.map((item) => (
              <JourneyStepCard key={item.label} item={item} />
            ))}
          </div>
        </div>

        {/* Campaign Types */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {CAMPAIGN_CARDS.map((card) => (
            <CampaignTypeCard key={card.href} card={card} />
          ))}
        </div>

        {/* Deeds Section */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-10 lg:p-12 relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
          </div>

          <div className="relative">
            <div className="text-center mb-10">
              <span className="inline-block px-4 py-1 rounded-full bg-white/10 text-white/80 text-sm font-semibold mb-4 backdrop-blur-sm">
                DIGITAL CONTRACTS
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold text-white">The Deeds — Trust Through Documents</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {DEEDS.map((deed) => (
                <DeedCardView key={deed.title} deed={deed} />
              ))}
            </div>

            <div className="mt-10 text-center">
              <p className="text-slate-400 mb-6 max-w-2xl mx-auto">
                Every transaction is secured by digitally signed deeds — creating trust through documents, not intermediaries.
              </p>
              <Link
                href="/create"
                className="inline-flex items-center gap-3 px-8 py-4 bg-white text-slate-900 font-semibold rounded-xl hover:bg-slate-100 transition-all shadow-xl shadow-white/10"
              >
                Start Your Campaign
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
