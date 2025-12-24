'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/toast-provider';
import type { CampaignFormData, CampaignItemForm } from '@/lib/types/campaign';
import { BasicsStep } from './wizard-steps/basics-step';
import { ItemsStep } from './wizard-steps/items-step';
import { ThresholdsStep } from './wizard-steps/thresholds-step';
import { TermsStep } from './wizard-steps/terms-step';
import { PreviewStep } from './wizard-steps/preview-step';

const STEPS = ['Basics', 'Items', 'Thresholds', 'Terms', 'Preview'];

interface CampaignWizardProps {
  initialGroupId?: string | null;
}

export function CampaignWizard({ initialGroupId }: CampaignWizardProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(null);

  const [formData, setFormData] = useState<CampaignFormData>({
    title: '',
    description: '',
    visibility: initialGroupId ? 'private' : 'public',
    group_id: initialGroupId || null,
    threshold_type: 'quantity',
    threshold_qty: null,
    threshold_value: null,
    currency: 'USD',
    deadline_at: '',
    deposit_percentage: 10,
    deposit_timing: 'upon_joining',
    payment_terms: 'net_30',
    delivery_timeline: '',
    delivery_location: '',
    cancellation_notice_days: 7,
    cancellation_penalty_percentage: 0,
    items: [],
  });

  const updateFormData = (updates: Partial<CampaignFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const saveDraft = async () => {
    setLoading(true);
    const supabase = createClient();

    try {
      if (draftId) {
        const { error: campaignError } = await supabase
          .from('campaigns')
          .update({
            title: formData.title,
            description: formData.description,
            visibility: formData.visibility,
            group_id: formData.group_id,
            updated_at: new Date().toISOString(),
          })
          .eq('id', draftId);

        if (campaignError) throw campaignError;

        const { error: needError } = await supabase
          .from('need_campaigns')
          .update({
            threshold_type: formData.threshold_type,
            threshold_qty: formData.threshold_qty,
            threshold_value: formData.threshold_value,
            currency: formData.currency,
            deadline_at: formData.deadline_at || null,
            deposit_policy_json: {
              percentage: formData.deposit_percentage,
              timing: formData.deposit_timing,
            },
            payment_structure_json: {
              terms: formData.payment_terms,
            },
            delivery_terms_json: {
              timeline: formData.delivery_timeline,
              location: formData.delivery_location,
            },
            cancellation_terms_json: {
              notice_days: formData.cancellation_notice_days,
              penalty_percentage: formData.cancellation_penalty_percentage,
            },
          })
          .eq('campaign_id', draftId);

        if (needError) throw needError;

        const { error: deleteError } = await supabase
          .from('campaign_items')
          .delete()
          .eq('campaign_id', draftId);

        if (deleteError) throw deleteError;

        if (formData.items.length > 0) {
          const { error: itemsError } = await supabase.from('campaign_items').insert(
            formData.items.map((item) => ({
              campaign_id: draftId,
              item_code: item.item_code,
              title: item.title,
              description: item.description,
              unit: item.unit,
            }))
          );

          if (itemsError) throw itemsError;
        }
      } else {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data: campaign, error: campaignError } = await supabase
          .from('campaigns')
          .insert({
            kind: 'need',
            title: formData.title,
            description: formData.description,
            visibility: formData.visibility,
            group_id: formData.group_id,
            created_by: user.id,
            status_need: 'draft',
          })
          .select()
          .single();

        if (campaignError) throw campaignError;

        const { error: needError } = await supabase.from('need_campaigns').insert({
          campaign_id: campaign.id,
          threshold_type: formData.threshold_type,
          threshold_qty: formData.threshold_qty,
          threshold_value: formData.threshold_value,
          currency: formData.currency,
          deadline_at: formData.deadline_at || null,
          deposit_policy_json: {
            percentage: formData.deposit_percentage,
            timing: formData.deposit_timing,
          },
          payment_structure_json: {
            terms: formData.payment_terms,
          },
          delivery_terms_json: {
            timeline: formData.delivery_timeline,
            location: formData.delivery_location,
          },
          cancellation_terms_json: {
            notice_days: formData.cancellation_notice_days,
            penalty_percentage: formData.cancellation_penalty_percentage,
          },
        });

        if (needError) throw needError;

        if (formData.items.length > 0) {
          const { error: itemsError } = await supabase.from('campaign_items').insert(
            formData.items.map((item) => ({
              campaign_id: campaign.id,
              item_code: item.item_code,
              title: item.title,
              description: item.description,
              unit: item.unit,
            }))
          );

          if (itemsError) throw itemsError;
        }

        setDraftId(campaign.id);
      }

      showToast('Draft saved successfully', 'success');
      setLoading(false);
      return true;
    } catch (error: any) {
      showToast(error.message || 'Failed to save draft', 'error');
      setLoading(false);
      return false;
    }
  };

  const publishCampaign = async () => {
    setLoading(true);
    const supabase = createClient();

    try {
      const saved = await saveDraft();
      if (!saved || !draftId) {
        throw new Error('Failed to save draft');
      }

      const { error } = await supabase
        .from('campaigns')
        .update({
          status_need: 'live',
          starts_at: new Date().toISOString(),
        })
        .eq('id', draftId);

      if (error) throw error;

      showToast('Campaign published successfully!', 'success');
      router.push(`/campaign/${draftId}`);
      router.refresh();
    } catch (error: any) {
      showToast(error.message || 'Failed to publish campaign', 'error');
      setLoading(false);
    }
  };

  const handleNext = async () => {
    if (currentStep < STEPS.length - 1) {
      await saveDraft();
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        // For private campaigns, require group selection
        if (formData.visibility === 'private' && !formData.group_id) {
          return false;
        }
        return formData.title.trim().length > 0;
      case 1:
        return formData.items.length > 0;
      case 2:
        if (formData.threshold_type === 'quantity') {
          return formData.threshold_qty !== null && formData.threshold_qty > 0;
        } else if (formData.threshold_type === 'value') {
          return formData.threshold_value !== null && formData.threshold_value > 0;
        } else {
          return (
            formData.threshold_qty !== null &&
            formData.threshold_qty > 0 &&
            formData.threshold_value !== null &&
            formData.threshold_value > 0
          );
        }
      case 3:
        return true;
      case 4:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="bg-white shadow-sm rounded-lg border border-neutral-200">
      <div className="border-b border-neutral-200 px-6 py-4">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => (
            <div key={step} className="flex items-center">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                  index <= currentStep
                    ? 'bg-primary-600 text-white'
                    : 'bg-neutral-200 text-neutral-600'
                }`}
              >
                {index + 1}
              </div>
              <span
                className={`ml-2 text-sm font-medium ${
                  index <= currentStep ? 'text-neutral-900' : 'text-neutral-500'
                }`}
              >
                {step}
              </span>
              {index < STEPS.length - 1 && (
                <div className="w-12 h-px bg-neutral-300 mx-4" />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="px-6 py-8">
        {currentStep === 0 && (
          <BasicsStep formData={formData} updateFormData={updateFormData} initialGroupId={initialGroupId} />
        )}
        {currentStep === 1 && (
          <ItemsStep formData={formData} updateFormData={updateFormData} />
        )}
        {currentStep === 2 && (
          <ThresholdsStep formData={formData} updateFormData={updateFormData} />
        )}
        {currentStep === 3 && (
          <TermsStep formData={formData} updateFormData={updateFormData} />
        )}
        {currentStep === 4 && <PreviewStep formData={formData} />}
      </div>

      <div className="border-t border-neutral-200 px-6 py-4 flex items-center justify-between">
        <button
          type="button"
          onClick={handleBack}
          disabled={currentStep === 0}
          className="inline-flex items-center px-4 py-2 border border-neutral-300 rounded-md shadow-sm text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Back
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={saveDraft}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-neutral-300 rounded-md shadow-sm text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save Draft'}
          </button>

          {currentStep < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={!canProceed() || loading}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={publishCampaign}
              disabled={!canProceed() || loading}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-success-600 hover:bg-success-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Publishing...' : 'Publish Campaign'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
