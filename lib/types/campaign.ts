export type CampaignKind = 'need' | 'feed';
export type CampaignStatusNeed = 'draft' | 'review' | 'live' | 'seeded' | 'closed_unseeded' | 'canceled';
export type Visibility = 'public' | 'private' | 'unlisted';

export interface Campaign {
  id: string;
  kind: CampaignKind;
  title: string;
  description: string | null;
  visibility: Visibility;
  group_id: string | null;
  created_by: string;
  status_need: CampaignStatusNeed | null;
  status_feed: string | null;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface NeedCampaign {
  campaign_id: string;
  threshold_type: string;
  threshold_qty: number | null;
  threshold_value: number | null;
  currency: string | null;
  deadline_at: string | null;
  deposit_policy_json: Record<string, any>;
  payment_structure_json: Record<string, any>;
  delivery_terms_json: Record<string, any>;
  cancellation_terms_json: Record<string, any>;
}

export interface CampaignItem {
  id: string;
  campaign_id: string;
  item_code: string | null;
  title: string;
  description: string | null;
  unit: string | null;
  variant_json: Record<string, any>;
  created_at: string;
}

export interface CampaignFormData {
  title: string;
  description: string;
  visibility: Visibility;
  group_id: string | null;
  threshold_type: 'quantity' | 'value' | 'both';
  threshold_qty: number | null;
  threshold_value: number | null;
  currency: string;
  deadline_at: string;
  deposit_percentage: number;
  deposit_timing: string;
  payment_terms: string;
  delivery_timeline: string;
  delivery_location: string;
  cancellation_notice_days: number;
  cancellation_penalty_percentage: number;
  items: CampaignItemForm[];
}

export interface CampaignItemForm {
  id?: string;
  item_code: string;
  title: string;
  description: string;
  unit: string;
  tempId?: string;
}
