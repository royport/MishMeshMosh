import Link from 'next/link';
import { AppHeader } from '@/components/ui/app-header';

const faqs = [
  {
    category: 'Getting Started',
    questions: [
      {
        q: 'What is MishMeshMosh?',
        a: 'MishMeshMosh is a demand-first commerce platform that turns shared needs into supplier-ready deals. Instead of suppliers offering products and hoping for buyers, we flip the model: buyers express their needs first, and suppliers compete to fulfill them.'
      },
      {
        q: 'How do I create a campaign?',
        a: 'Click "Create Campaign" and follow our step-by-step wizard. You\'ll define what you need, set thresholds for validation, establish terms, and publish. Once published, others can join your campaign by signing Need Deeds.'
      },
      {
        q: 'Is it free to use?',
        a: 'Creating campaigns and signing Need Deeds is free. Platform fees are only applied when a campaign successfully reaches the fulfillment stage (REED phase).'
      },
      {
        q: 'Do I need to pay upfront to join a campaign?',
        a: 'No! That\'s the beauty of MishMeshMosh. Signing a Need Deed is a commitment, not a payment. You only pay when a supplier is assigned and fulfillment begins.'
      }
    ]
  },
  {
    category: 'Campaigns & Deeds',
    questions: [
      {
        q: 'What is a Need Deed?',
        a: 'A Need Deed is a digital commitment signed by backers when they join a campaign. It documents your intent to purchase, the quantity you want, and your acceptance of the campaign terms. It\'s legally binding once signed.'
      },
      {
        q: 'What is a Feed Deed?',
        a: 'A Feed Deed is a supplier\'s binding offer to fulfill a seeded campaign. It specifies pricing, delivery terms, quantities, and fulfillment guarantees. Suppliers compete by submitting Feed Deeds.'
      },
      {
        q: 'What is a Reed Deed?',
        a: 'A Reed Deed is the final assignment contract that links backers\' Need Deeds to the selected supplier\'s Feed Deed. It requires multi-party signatures and officially kicks off fulfillment.'
      },
      {
        q: 'What happens if a campaign doesn\'t reach its threshold?',
        a: 'If a campaign doesn\'t reach its minimum threshold before the deadline, it expires. All Need Deeds are released, and no one has any obligations.'
      }
    ]
  },
  {
    category: 'For Suppliers',
    questions: [
      {
        q: 'How do I become a supplier?',
        a: 'Any registered user can submit supplier offers. Browse seeded campaigns in the Explore Feeds section and submit your Feed Deed with your best offer.'
      },
      {
        q: 'How are suppliers selected?',
        a: 'Campaign owners review all submitted Feed Deeds and select the one that best meets their criteria. Selection factors may include price, delivery time, reputation, and terms.'
      },
      {
        q: 'What happens after I\'m selected?',
        a: 'You\'ll receive a notification and be prompted to sign the Reed Deed along with the backers. Once all parties sign, you can begin fulfillment according to the agreed milestones.'
      }
    ]
  },
  {
    category: 'Trust & Safety',
    questions: [
      {
        q: 'How does MishMeshMosh ensure trust?',
        a: 'All transactions are documented through digital deeds that create an auditable paper trail. Every commitment, offer, and assignment is recorded and can be referenced if disputes arise.'
      },
      {
        q: 'What if there\'s a dispute?',
        a: 'Our platform includes a dispute resolution system. Either party can file a dispute, which is reviewed by our admin team. All deed documents serve as evidence for resolution.'
      },
      {
        q: 'Are the deeds legally binding?',
        a: 'Yes. Deeds are designed to be legally enforceable documents. We recommend consulting with legal counsel for high-value campaigns.'
      }
    ]
  },
  {
    category: 'Groups & Privacy',
    questions: [
      {
        q: 'Can I create private campaigns?',
        a: 'Yes! You can create private campaigns that are only visible to members of your group. This is perfect for communities, organizations, or teams who want to coordinate purchases.'
      },
      {
        q: 'What are Groups?',
        a: 'Groups are private communities within MishMeshMosh. You can create a group, invite members, and run campaigns exclusively for your group members.'
      },
      {
        q: 'How do I join a group?',
        a: 'Groups are invite-only. A group owner or admin must send you an invitation, which you can accept from your workspace.'
      }
    ]
  }
];

export default function FAQPage() {
  return (
    <>
      <AppHeader />
      <main className="min-h-screen bg-slate-50">
        {/* Hero */}
        <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-20 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-4xl text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Everything you need to know about MishMeshMosh
            </p>
          </div>
        </section>

        {/* FAQ Content */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-4xl">
            {faqs.map((section, sectionIdx) => (
              <div key={sectionIdx} className="mb-12">
                <h2 className="text-2xl font-bold text-slate-900 mb-6 pb-2 border-b border-slate-200">
                  {section.category}
                </h2>
                <div className="space-y-6">
                  {section.questions.map((faq, faqIdx) => (
                    <div key={faqIdx} className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                      <h3 className="text-lg font-semibold text-slate-900 mb-3">
                        {faq.q}
                      </h3>
                      <p className="text-slate-600 leading-relaxed">
                        {faq.a}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Still Have Questions */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="container mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Still have questions?</h2>
            <p className="text-slate-600 mb-6">
              Can\'t find what you\'re looking for? Our support team is here to help.
            </p>
            <Link
              href="/support"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-8 py-4 text-base font-semibold text-white hover:bg-primary-700 transition-all"
            >
              Contact Support
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
