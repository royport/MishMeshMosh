## Database Schema  Supabase 
### Enums

**campaign_kind**: need, feed  
**campaign_status_need**: draft, review, live, seeded, closed_unseeded, canceled  
**campaign_status_feed**: draft, review, open, supplier_selected, closed_no_winner, canceled

**deed_kind**: need_deed, feed_deed, assignment_deed, weed_deed  
**deed_status**: draft, review, open_for_signature, signed, executed, active, fulfilled, expired, disputed, voided

**visibility**: public, private, unlisted

**participation_kind**: viewer, backer, supplier, initiator, operator  
**offer_status**: draft, submitted, withdrawn, rejected, selected  
**assignment_status**: draft, executed, active, fulfilled, failed, disputed, voided

**fulfillment_status**: pending, in_progress, delivered, accepted, failed, disputed

---

## Core identity

### users

id, email, phone, full_name, created_at

### user_verifications

id, user_id, method, status, metadata_json, verified_at, created_at  
_(method = email/phone/manual/company/kyc, etc.)_

### platform_permissions

id, user_id, permission, scope, created_at  
_(permission = admin/moderator/deed_auditor; scope = global or group_id)_

---

## Groups & access

### groups

id, name, owner_id, visibility, created_at

### group_members

id, group_id, user_id, member_role, created_at  
_(member_role = owner/mod/member)_

---

## Campaigns (typed)

### campaigns

id, kind, title, description, visibility, group_id, created_by, created_at  
status_need, status_feed, starts_at, ends_at  
_(keep only the relevant status column used by kind, or use one status enum per kind in code)_

### need_campaigns

campaign_id (PK/FK), threshold_type, threshold_qty, threshold_value, currency, deadline_at  
deposit_policy_json, payment_structure_json, delivery_terms_json, cancellation_terms_json

### feed_campaigns

campaign_id (PK/FK), bid_deadline_at, award_method, eligibility_rules_json, compliance_requirements_json

---

## Items & row structure (the “contract table of rows”)

### campaign_items

id, campaign_id, item_code, title, description, unit, variant_json, created_at

### need_pledges

id, campaign_id, backer_id, status, created_at  
_(status could be active/withdrawn; but the real commitment is the signed deed)_

### need_pledge_rows

id, pledge_id, campaign_item_id, quantity, constraints_json, created_at

### supplier_offers

id, campaign_id, supplier_id, status, terms_json, created_at, submitted_at

### supplier_offer_rows

id, offer_id, campaign_item_id, unit_price, min_qty, lead_time_days, notes, terms_json

---

## Deeds (versioned + signed artifacts)

### deeds

id, deed_kind, status, campaign_id, version, prev_deed_id, doc_json, doc_hash, pdf_url  
created_by, created_at, opened_for_signature_at, executed_at

### deed_signers

id, deed_id, user_id, signer_kind, status, signed_at, signature_meta_json  
_(signer_kind = backer/supplier/initiator/platform)_  
_(status = invited/signed/declined)_

> Key rule: once `status = open_for_signature`, `doc_hash` must not change; new version requires `version+1` + `prev_deed_id`.

---

## Assignment (Reed)

### assignments

id, campaign_need_id, campaign_feed_id, selected_offer_id  
assignment_deed_id, status, created_at, executed_at

### assignment_need_deeds

id, assignment_id, need_deed_id  
_(join table: which Need Deeds are covered by the assignment)_

---

## Fulfillment & tracking

### fulfillment_milestones

id, assignment_id, title, due_at, status, metadata_json, updated_at

### fulfillment_events

id, assignment_id, actor_user_id, event_type, payload_json, created_at  
_(event_type = shipped/delivered/accepted/failed/etc.)_

---

## User workspace (contextual participation)

### participations

id, user_id, context_type, context_id, participation_kind, created_at  
_(context_type = campaign/deed/assignment/group)_  
_(this is how “a user can be backer here, supplier there” is represented)_

> You can derive many participations automatically (e.g., if signed a Need Deed → backer), but keeping a table helps performance and UX.

---

## Governance

### audit_logs

id, actor_user_id, action, entity_type, entity_id, payload_json, created_at

### disputes

id, context_type, context_id, opened_by, reason, status, resolution_json, created_at, closed_at

### notifications

id, user_id, kind, context_type, context_id, payload_json, read_at, created_at


---

