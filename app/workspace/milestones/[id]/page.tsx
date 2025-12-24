import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import SupplierMilestoneUpdateForm from '@/components/fulfillment/supplier-milestone-update-form';

export const dynamic = 'force-dynamic';

export default async function MilestoneUpdatePage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const { data: milestone, error } = await supabase
    .from('fulfillment_milestones')
    .select(`
      *,
      assignment:assignments!assignment_id(
        *,
        needCampaign:campaigns!campaign_need_id(title),
        feedCampaign:campaigns!campaign_feed_id(title),
        selectedOffer:supplier_offers!selected_offer_id(supplier_id)
      )
    `)
    .eq('id', params.id)
    .maybeSingle();

  if (error || !milestone) {
    notFound();
  }

  const isSupplier = milestone.assignment.selectedOffer.supplier_id === user.id;

  if (!isSupplier) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h1>
          <p className="text-slate-600">Only the supplier can update milestones</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8">
          <a
            href={`/workspace/assignments/${milestone.assignment_id}`}
            className="text-blue-600 hover:text-blue-700 font-medium mb-4 inline-block"
          >
            ← Back to Assignment
          </a>

          <h1 className="text-4xl font-bold text-slate-900 mb-4">Update Milestone</h1>
          <p className="text-lg text-slate-600">{milestone.assignment.needCampaign.title}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">{milestone.title}</h2>
            <div className="flex items-center gap-4 text-sm text-slate-600">
              {milestone.due_at && (
                <span>Due: {new Date(milestone.due_at).toLocaleDateString()}</span>
              )}
              <span>
                Current Status:{' '}
                <span className="font-semibold text-blue-600">
                  {milestone.status.replace('_', ' ').toUpperCase()}
                </span>
              </span>
            </div>
          </div>

          <SupplierMilestoneUpdateForm
            milestoneId={params.id}
            currentStatus={milestone.status}
            assignmentId={milestone.assignment_id}
          />
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Status Guide</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>
                  <span className="font-semibold">In Progress:</span> Work has started
                </li>
                <li>
                  <span className="font-semibold">Delivered:</span> Items shipped or milestone
                  completed, awaiting backer confirmation
                </li>
                <li>
                  <span className="font-semibold">Accepted:</span> Backers have confirmed receipt
                  and acceptance
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
