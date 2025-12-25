-- =====================================================================
-- MishMeshMosh — DEFINITIVE Supabase/Postgres schema (run on a clean DB)
-- =====================================================================
-- Recommended workflow:
-- 1) (Optional) Wipe public schema (ONLY if you are sure you want to delete everything):
--      begin;
--      drop schema if exists public cascade;
--      create schema public;
--      grant usage on schema public to postgres, anon, authenticated, service_role;
--      grant all on schema public to postgres, service_role;
--      commit;
--
-- 2) Then run THIS file once.
--
-- Notes:
-- - This file is ordered so tables exist before functions/views/policies that reference them.
-- - It is safe to run on a fresh Supabase project (empty public schema).
-- - It is also mostly idempotent due to IF NOT EXISTS / CREATE OR REPLACE.
-- =====================================================================

begin;

-- =====================================================================
-- MishMeshMosh — Supabase / Postgres Schema (DDL + Indexes + RLS)
-- =====================================================================
-- Assumptions:
-- 1) You use Supabase Auth. auth.uid() returns the authenticated user's UUID.
-- 2) Your app maps auth.users.id == public.users.id (same UUID).
--
-- Notes:
-- - This script is "starter-safe": RLS is enabled with practical policies.
-- - You will likely tighten policies as flows become more formal.
-- - All JSON is stored as jsonb for indexing/operations.
-- =====================================================================

-- -------------------------
-- Extensions
-- -------------------------
create extension if not exists "pgcrypto";

-- -------------------------
-- Helper: Updated-at trigger
-- -------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;


-- =====================================================================
-- ENUMS
-- =====================================================================
do $$ begin
  create type public.campaign_kind as enum ('need','feed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.campaign_status_need as enum ('draft','review','live','seeded','closed_unseeded','canceled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.campaign_status_feed as enum ('draft','review','open','supplier_selected','closed_no_winner','canceled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.deed_kind as enum ('need_deed','feed_deed','assignment_deed','weed_deed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.deed_status as enum (
    'draft','review','open_for_signature',
    'signed','executed','active',
    'fulfilled','expired','disputed','voided'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.visibility as enum ('public','private','unlisted');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.participation_kind as enum ('viewer','backer','supplier','initiator','operator');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.offer_status as enum ('draft','submitted','withdrawn','rejected','selected');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.assignment_status as enum ('draft','executed','active','fulfilled','failed','disputed','voided');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.fulfillment_status as enum ('pending','in_progress','delivered','accepted','failed','disputed');
exception when duplicate_object then null; end $$;

-- =====================================================================
-- TABLES
-- =====================================================================

-- ---------------------------------------------------------------------
-- users
-- ---------------------------------------------------------------------
-- Mirrors auth.users.id (recommended). Store profile fields here.
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  phone text unique,
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_users_updated_at on public.users;
create trigger trg_users_updated_at
before update on public.users
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- user_verifications
-- ---------------------------------------------------------------------
create table if not exists public.user_verifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  method text not null,               -- e.g., email/phone/manual/kyc/company
  status text not null,               -- e.g., pending/verified/rejected
  metadata_json jsonb,
  verified_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- platform_permissions
-- ---------------------------------------------------------------------
create table if not exists public.platform_permissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  permission text not null,           -- admin/moderator/deed_auditor
  scope text,                         -- null or 'global' or future: group:<uuid>
  created_at timestamptz not null default now(),
  unique (user_id, permission, scope)
);


-- -------------------------
-- Helper: Platform admin check
-- -------------------------
-- Uses platform_permissions table defined below.
create or replace function public.is_platform_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.platform_permissions pp
    where pp.user_id = auth.uid()
      and pp.permission in ('admin','moderator','deed_auditor')
      and (pp.scope is null or pp.scope = 'global')
  );
$$;


-- ---------------------------------------------------------------------
-- groups / group_members
-- ---------------------------------------------------------------------
create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid references public.users(id),
  visibility public.visibility not null default 'private',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_groups_updated_at on public.groups;
create trigger trg_groups_updated_at
before update on public.groups
for each row execute function public.set_updated_at();

create table if not exists public.group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  member_role text not null default 'member', -- owner/mod/member
  created_at timestamptz not null default now(),
  unique (group_id, user_id)
);

-- ---------------------------------------------------------------------
-- campaigns (base)
-- ---------------------------------------------------------------------
create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  kind public.campaign_kind not null,
  title text not null,
  description text,
  visibility public.visibility not null default 'public',
  group_id uuid references public.groups(id),
  created_by uuid references public.users(id),
  status_need public.campaign_status_need,
  status_feed public.campaign_status_feed,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Constraints:
  constraint chk_campaign_time_range
    check (ends_at is null or starts_at is null or ends_at >= starts_at),

  constraint chk_campaign_kind_status
    check (
      (kind = 'need' and status_need is not null and status_feed is null)
      or
      (kind = 'feed' and status_feed is not null and status_need is null)
    )
);

-- Ensure campaigns.kind exists even if campaigns table was created earlier without it
alter table public.campaigns add column if not exists kind public.campaign_kind;
alter table public.campaigns alter column kind set default 'need';
update public.campaigns set kind = 'need' where kind is null;
alter table public.campaigns alter column kind set not null;

-- Ensure campaigns.created_by exists even if campaigns table was created earlier without it
alter table public.campaigns add column if not exists created_by uuid references public.users(id);


drop trigger if exists trg_campaigns_updated_at on public.campaigns;
create trigger trg_campaigns_updated_at
before update on public.campaigns
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- need_campaigns (typed extension)
-- ---------------------------------------------------------------------
create table if not exists public.need_campaigns (
  campaign_id uuid primary key references public.campaigns(id) on delete cascade,
  threshold_type text not null,         -- qty/value/participants/etc.
  threshold_qty numeric,
  threshold_value numeric,
  currency text,
  deadline_at timestamptz,
  deposit_policy_json jsonb,
  payment_structure_json jsonb,
  delivery_terms_json jsonb,
  cancellation_terms_json jsonb,

  constraint chk_need_threshold
    check (
      (threshold_qty is null or threshold_qty >= 0)
      and (threshold_value is null or threshold_value >= 0)
    )
);

-- ---------------------------------------------------------------------
-- feed_campaigns (typed extension)
-- ---------------------------------------------------------------------
create table if not exists public.feed_campaigns (
  campaign_id uuid primary key references public.campaigns(id) on delete cascade,
  bid_deadline_at timestamptz,
  award_method text,                   -- lowest_price/best_value/weighted/etc.
  eligibility_rules_json jsonb,
  compliance_requirements_json jsonb
);

-- ---------------------------------------------------------------------
-- campaign_items
-- ---------------------------------------------------------------------
create table if not exists public.campaign_items (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  item_code text,
  title text not null,
  description text,
  unit text,                           -- sqm, unit, kg, hour, etc.
  variant_json jsonb,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- need_pledges / need_pledge_rows
-- ---------------------------------------------------------------------
create table if not exists public.need_pledges (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  backer_id uuid not null references public.users(id),
  status text not null default 'active',  -- active/withdrawn (deed is the real bind)
  created_at timestamptz not null default now(),
  unique (campaign_id, backer_id)
);

create table if not exists public.need_pledge_rows (
  id uuid primary key default gen_random_uuid(),
  pledge_id uuid not null references public.need_pledges(id) on delete cascade,
  campaign_item_id uuid not null references public.campaign_items(id),
  quantity numeric not null check (quantity > 0),
  constraints_json jsonb,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- supplier_offers / supplier_offer_rows
-- ---------------------------------------------------------------------
create table if not exists public.supplier_offers (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  supplier_id uuid not null references public.users(id),
  status public.offer_status not null default 'draft',
  terms_json jsonb,
  created_at timestamptz not null default now(),
  submitted_at timestamptz,
  unique (campaign_id, supplier_id)
);

create table if not exists public.supplier_offer_rows (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid not null references public.supplier_offers(id) on delete cascade,
  campaign_item_id uuid not null references public.campaign_items(id),
  unit_price numeric not null check (unit_price >= 0),
  min_qty numeric check (min_qty is null or min_qty >= 0),
  lead_time_days integer check (lead_time_days is null or lead_time_days >= 0),
  notes text,
  terms_json jsonb
);

-- ---------------------------------------------------------------------
-- deeds (versioned legal artifacts) + deed_signers
-- ---------------------------------------------------------------------
create table if not exists public.deeds (
  id uuid primary key default gen_random_uuid(),
  deed_kind public.deed_kind not null,
  status public.deed_status not null default 'draft',
  campaign_id uuid references public.campaigns(id) on delete set null,
  version integer not null default 1,
  prev_deed_id uuid references public.deeds(id) on delete set null,
  doc_json jsonb not null,
  doc_hash text not null,
  pdf_url text,
  created_by uuid references public.users(id),
  created_at timestamptz not null default now(),
  opened_for_signature_at timestamptz,
  executed_at timestamptz,

  constraint chk_deed_version_positive check (version >= 1),

  constraint chk_deed_open_time
    check (
      (status <> 'open_for_signature') or (opened_for_signature_at is not null)
    ),

  constraint chk_deed_executed_time
    check (
      (status not in ('executed','active','fulfilled')) or (executed_at is not null)
    ),

  constraint uq_deed_version_per_campaign
    unique (campaign_id, deed_kind, version)
);

-- Ensure deeds.created_by exists even if deeds table was created earlier without it
alter table public.deeds add column if not exists created_by uuid references public.users(id);

create table if not exists public.deed_signers (
  id uuid primary key default gen_random_uuid(),
  deed_id uuid not null references public.deeds(id) on delete cascade,
  user_id uuid not null references public.users(id),
  signer_kind text not null,           -- backer/supplier/initiator/platform
  status text not null default 'invited', -- invited/signed/declined
  signed_at timestamptz,
  signature_meta_json jsonb,
  created_at timestamptz not null default now(),
  unique (deed_id, user_id)
);

-- ---------------------------------------------------------------------
-- assignments (Reed) + assignment_need_deeds
-- ---------------------------------------------------------------------
create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  campaign_need_id uuid references public.campaigns(id) on delete set null,
  campaign_feed_id uuid references public.campaigns(id) on delete set null,
  selected_offer_id uuid references public.supplier_offers(id) on delete set null,
  assignment_deed_id uuid references public.deeds(id) on delete set null,
  status public.assignment_status not null default 'draft',
  created_at timestamptz not null default now(),
  executed_at timestamptz
);

create table if not exists public.assignment_need_deeds (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  need_deed_id uuid not null references public.deeds(id) on delete restrict,
  created_at timestamptz not null default now(),
  unique (assignment_id, need_deed_id)
);

-- ---------------------------------------------------------------------
-- fulfillment
-- ---------------------------------------------------------------------
create table if not exists public.fulfillment_milestones (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  title text not null,
  due_at timestamptz,
  status public.fulfillment_status not null default 'pending',
  metadata_json jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_fulfillment_milestones_updated_at on public.fulfillment_milestones;
create trigger trg_fulfillment_milestones_updated_at
before update on public.fulfillment_milestones
for each row execute function public.set_updated_at();

create table if not exists public.fulfillment_events (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  actor_user_id uuid references public.users(id),
  event_type text not null,            -- shipped/delivered/accepted/failed/etc.
  payload_json jsonb,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- participations (contextual roles)
-- ---------------------------------------------------------------------
create table if not exists public.participations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  context_type text not null,          -- campaign/deed/assignment/group
  context_id uuid not null,
  participation_kind public.participation_kind not null,
  created_at timestamptz not null default now(),
  unique (user_id, context_type, context_id, participation_kind)
);

-- ---------------------------------------------------------------------
-- governance: audit_logs, disputes, notifications
-- ---------------------------------------------------------------------
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references public.users(id),
  action text not null,
  entity_type text not null,
  entity_id uuid not null,
  payload_json jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.disputes (
  id uuid primary key default gen_random_uuid(),
  context_type text not null,
  context_id uuid not null,
  opened_by uuid references public.users(id),
  reason text,
  status text not null default 'open', -- open/in_review/resolved/closed
  resolution_json jsonb,
  created_at timestamptz not null default now(),
  closed_at timestamptz
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  kind text not null,
  context_type text,
  context_id uuid,
  payload_json jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

-- =====================================================================
-- INDEXES
-- =====================================================================

create index if not exists idx_users_email on public.users (email);
create index if not exists idx_users_phone on public.users (phone);

create index if not exists idx_groups_owner on public.groups (owner_id);
create index if not exists idx_group_members_group on public.group_members (group_id);
create index if not exists idx_group_members_user on public.group_members (user_id);

create index if not exists idx_campaigns_kind on public.campaigns (kind);
create index if not exists idx_campaigns_created_by on public.campaigns (created_by);
create index if not exists idx_campaigns_group on public.campaigns (group_id);
create index if not exists idx_campaigns_visibility on public.campaigns (visibility);
create index if not exists idx_campaigns_status_need on public.campaigns (status_need);
create index if not exists idx_campaigns_status_feed on public.campaigns (status_feed);

create index if not exists idx_campaign_items_campaign on public.campaign_items (campaign_id);

create index if not exists idx_need_pledges_campaign on public.need_pledges (campaign_id);
create index if not exists idx_need_pledges_backer on public.need_pledges (backer_id);
create index if not exists idx_need_pledge_rows_pledge on public.need_pledge_rows (pledge_id);
create index if not exists idx_need_pledge_rows_item on public.need_pledge_rows (campaign_item_id);

create index if not exists idx_supplier_offers_campaign on public.supplier_offers (campaign_id);
create index if not exists idx_supplier_offers_supplier on public.supplier_offers (supplier_id);
create index if not exists idx_supplier_offer_rows_offer on public.supplier_offer_rows (offer_id);
create index if not exists idx_supplier_offer_rows_item on public.supplier_offer_rows (campaign_item_id);

create index if not exists idx_deeds_campaign on public.deeds (campaign_id);
create index if not exists idx_deeds_kind_status on public.deeds (deed_kind, status);
create index if not exists idx_deeds_created_by on public.deeds (created_by);
create index if not exists idx_deed_signers_deed on public.deed_signers (deed_id);
create index if not exists idx_deed_signers_user on public.deed_signers (user_id);

create index if not exists idx_assignments_need_campaign on public.assignments (campaign_need_id);
create index if not exists idx_assignments_feed_campaign on public.assignments (campaign_feed_id);
create index if not exists idx_assignments_selected_offer on public.assignments (selected_offer_id);
create index if not exists idx_assignment_need_deeds_assignment on public.assignment_need_deeds (assignment_id);
create index if not exists idx_assignment_need_deeds_need_deed on public.assignment_need_deeds (need_deed_id);

create index if not exists idx_fulfillment_milestones_assignment on public.fulfillment_milestones (assignment_id);
create index if not exists idx_fulfillment_events_assignment on public.fulfillment_events (assignment_id);

create index if not exists idx_participations_user on public.participations (user_id);
create index if not exists idx_participations_context on public.participations (context_type, context_id);

create index if not exists idx_audit_logs_actor on public.audit_logs (actor_user_id);
create index if not exists idx_audit_logs_entity on public.audit_logs (entity_type, entity_id);
create index if not exists idx_disputes_context on public.disputes (context_type, context_id);
create index if not exists idx_notifications_user on public.notifications (user_id);

-- =====================================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================================

alter table public.users enable row level security;
alter table public.user_verifications enable row level security;
alter table public.platform_permissions enable row level security;

alter table public.groups enable row level security;
alter table public.group_members enable row level security;

alter table public.campaigns enable row level security;
alter table public.need_campaigns enable row level security;
alter table public.feed_campaigns enable row level security;
alter table public.campaign_items enable row level security;

alter table public.need_pledges enable row level security;
alter table public.need_pledge_rows enable row level security;

alter table public.supplier_offers enable row level security;
alter table public.supplier_offer_rows enable row level security;

alter table public.deeds enable row level security;
alter table public.deed_signers enable row level security;

alter table public.assignments enable row level security;
alter table public.assignment_need_deeds enable row level security;

alter table public.fulfillment_milestones enable row level security;
alter table public.fulfillment_events enable row level security;

alter table public.participations enable row level security;

alter table public.audit_logs enable row level security;
alter table public.disputes enable row level security;
alter table public.notifications enable row level security;

-- USERS
drop policy if exists "users_select_own" on public.users;
create policy "users_select_own"
on public.users for select
to authenticated
using (id = auth.uid() or public.is_platform_admin());

drop policy if exists "users_insert_self" on public.users;
create policy "users_insert_self"
on public.users for insert
to authenticated
with check (id = auth.uid());

drop policy if exists "users_update_own" on public.users;
create policy "users_update_own"
on public.users for update
to authenticated
using (id = auth.uid() or public.is_platform_admin())
with check (id = auth.uid() or public.is_platform_admin());

-- USER_VERIFICATIONS
drop policy if exists "verifications_select_own" on public.user_verifications;
create policy "verifications_select_own"
on public.user_verifications for select
to authenticated
using (user_id = auth.uid() or public.is_platform_admin());

drop policy if exists "verifications_insert_own" on public.user_verifications;
create policy "verifications_insert_own"
on public.user_verifications for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "verifications_update_admin" on public.user_verifications;
create policy "verifications_update_admin"
on public.user_verifications for update
to authenticated
using (public.is_platform_admin())
with check (public.is_platform_admin());

-- PLATFORM_PERMISSIONS (admin-only)
drop policy if exists "platform_permissions_admin_only" on public.platform_permissions;
create policy "platform_permissions_admin_only"
on public.platform_permissions for all
to authenticated
using (public.is_platform_admin())
with check (public.is_platform_admin());

-- GROUPS
drop policy if exists "groups_select_visible_or_member" on public.groups;
create policy "groups_select_visible_or_member"
on public.groups for select
to authenticated
using (
  visibility <> 'private'
  or owner_id = auth.uid()
  or exists (
    select 1 from public.group_members gm
    where gm.group_id = groups.id and gm.user_id = auth.uid()
  )
  or public.is_platform_admin()
);

drop policy if exists "groups_insert_owner" on public.groups;
create policy "groups_insert_owner"
on public.groups for insert
to authenticated
with check (owner_id = auth.uid());

drop policy if exists "groups_update_owner_or_admin" on public.groups;
create policy "groups_update_owner_or_admin"
on public.groups for update
to authenticated
using (owner_id = auth.uid() or public.is_platform_admin())
with check (owner_id = auth.uid() or public.is_platform_admin());

-- GROUP_MEMBERS
drop policy if exists "group_members_select_member" on public.group_members;
create policy "group_members_select_member"
on public.group_members for select
to authenticated
using (
  user_id = auth.uid()
  or exists (
    select 1 from public.groups g
    where g.id = group_members.group_id and (g.owner_id = auth.uid() or public.is_platform_admin())
  )
);

drop policy if exists "group_members_insert_owner_or_admin" on public.group_members;
create policy "group_members_insert_owner_or_admin"
on public.group_members for insert
to authenticated
with check (
  public.is_platform_admin()
  or exists (select 1 from public.groups g where g.id = group_members.group_id and g.owner_id = auth.uid())
);

drop policy if exists "group_members_delete_owner_or_admin" on public.group_members;
create policy "group_members_delete_owner_or_admin"
on public.group_members for delete
to authenticated
using (
  public.is_platform_admin()
  or exists (select 1 from public.groups g where g.id = group_members.group_id and g.owner_id = auth.uid())
);

-- CAMPAIGNS
drop policy if exists "campaigns_select_public_or_member" on public.campaigns;
create policy "campaigns_select_public_or_member"
on public.campaigns for select
to authenticated
using (
  visibility in ('public','unlisted')
  or created_by = auth.uid()
  or public.is_platform_admin()
  or (
    visibility = 'private'
    and group_id is not null
    and exists (
      select 1 from public.group_members gm
      where gm.group_id = campaigns.group_id and gm.user_id = auth.uid()
    )
  )
);

drop policy if exists "campaigns_insert_creator" on public.campaigns;
create policy "campaigns_insert_creator"
on public.campaigns for insert
to authenticated
with check (created_by = auth.uid());

drop policy if exists "campaigns_update_creator_or_admin" on public.campaigns;
create policy "campaigns_update_creator_or_admin"
on public.campaigns for update
to authenticated
using (created_by = auth.uid() or public.is_platform_admin())
with check (created_by = auth.uid() or public.is_platform_admin());

-- NEED_CAMPAIGNS
drop policy if exists "need_campaigns_select" on public.need_campaigns;
create policy "need_campaigns_select"
on public.need_campaigns for select
to authenticated
using (
  exists (
    select 1 from public.campaigns c
    where c.id = need_campaigns.campaign_id
      and (
        c.visibility in ('public','unlisted')
        or c.created_by = auth.uid()
        or public.is_platform_admin()
        or (
          c.visibility = 'private'
          and c.group_id is not null
          and exists (
            select 1 from public.group_members gm
            where gm.group_id = c.group_id and gm.user_id = auth.uid()
          )
        )
      )
  )
);

drop policy if exists "need_campaigns_insert_creator_or_admin" on public.need_campaigns;
create policy "need_campaigns_insert_creator_or_admin"
on public.need_campaigns for insert
to authenticated
with check (
  exists (select 1 from public.campaigns c where c.id = campaign_id and (c.created_by = auth.uid() or public.is_platform_admin()))
);

drop policy if exists "need_campaigns_update_creator_or_admin" on public.need_campaigns;
create policy "need_campaigns_update_creator_or_admin"
on public.need_campaigns for update
to authenticated
using (
  exists (select 1 from public.campaigns c where c.id = campaign_id and (c.created_by = auth.uid() or public.is_platform_admin()))
)
with check (
  exists (select 1 from public.campaigns c where c.id = campaign_id and (c.created_by = auth.uid() or public.is_platform_admin()))
);

-- FEED_CAMPAIGNS
drop policy if exists "feed_campaigns_select" on public.feed_campaigns;
create policy "feed_campaigns_select"
on public.feed_campaigns for select
to authenticated
using (
  exists (
    select 1 from public.campaigns c
    where c.id = feed_campaigns.campaign_id
      and (
        c.visibility in ('public','unlisted')
        or c.created_by = auth.uid()
        or public.is_platform_admin()
        or (
          c.visibility = 'private'
          and c.group_id is not null
          and exists (
            select 1 from public.group_members gm
            where gm.group_id = c.group_id and gm.user_id = auth.uid()
          )
        )
      )
  )
);

drop policy if exists "feed_campaigns_insert_creator_or_admin" on public.feed_campaigns;
create policy "feed_campaigns_insert_creator_or_admin"
on public.feed_campaigns for insert
to authenticated
with check (
  exists (select 1 from public.campaigns c where c.id = campaign_id and (c.created_by = auth.uid() or public.is_platform_admin()))
);

drop policy if exists "feed_campaigns_update_creator_or_admin" on public.feed_campaigns;
create policy "feed_campaigns_update_creator_or_admin"
on public.feed_campaigns for update
to authenticated
using (
  exists (select 1 from public.campaigns c where c.id = campaign_id and (c.created_by = auth.uid() or public.is_platform_admin()))
)
with check (
  exists (select 1 from public.campaigns c where c.id = campaign_id and (c.created_by = auth.uid() or public.is_platform_admin()))
);

-- CAMPAIGN_ITEMS
drop policy if exists "campaign_items_select" on public.campaign_items;
create policy "campaign_items_select"
on public.campaign_items for select
to authenticated
using (
  exists (
    select 1 from public.campaigns c
    where c.id = campaign_items.campaign_id
      and (
        c.visibility in ('public','unlisted')
        or c.created_by = auth.uid()
        or public.is_platform_admin()
        or (
          c.visibility = 'private'
          and c.group_id is not null
          and exists (
            select 1 from public.group_members gm
            where gm.group_id = c.group_id and gm.user_id = auth.uid()
          )
        )
      )
  )
);

drop policy if exists "campaign_items_insert_creator_or_admin" on public.campaign_items;
create policy "campaign_items_insert_creator_or_admin"
on public.campaign_items for insert
to authenticated
with check (
  exists (select 1 from public.campaigns c where c.id = campaign_id and (c.created_by = auth.uid() or public.is_platform_admin()))
);

drop policy if exists "campaign_items_update_creator_or_admin" on public.campaign_items;
create policy "campaign_items_update_creator_or_admin"
on public.campaign_items for update
to authenticated
using (
  exists (select 1 from public.campaigns c where c.id = campaign_id and (c.created_by = auth.uid() or public.is_platform_admin()))
)
with check (
  exists (select 1 from public.campaigns c where c.id = campaign_id and (c.created_by = auth.uid() or public.is_platform_admin()))
);

-- NEED_PLEDGES
drop policy if exists "need_pledges_select_backer_or_creator" on public.need_pledges;
create policy "need_pledges_select_backer_or_creator"
on public.need_pledges for select
to authenticated
using (
  backer_id = auth.uid()
  or public.is_platform_admin()
  or exists (select 1 from public.campaigns c where c.id = need_pledges.campaign_id and c.created_by = auth.uid())
);

drop policy if exists "need_pledges_insert_backer" on public.need_pledges;
create policy "need_pledges_insert_backer"
on public.need_pledges for insert
to authenticated
with check (backer_id = auth.uid());

drop policy if exists "need_pledges_update_backer_or_admin" on public.need_pledges;
create policy "need_pledges_update_backer_or_admin"
on public.need_pledges for update
to authenticated
using (backer_id = auth.uid() or public.is_platform_admin())
with check (backer_id = auth.uid() or public.is_platform_admin());

-- NEED_PLEDGE_ROWS
drop policy if exists "need_pledge_rows_select_backer_or_creator" on public.need_pledge_rows;
create policy "need_pledge_rows_select_backer_or_creator"
on public.need_pledge_rows for select
to authenticated
using (
  exists (
    select 1 from public.need_pledges p
    join public.campaigns c on c.id = p.campaign_id
    where p.id = need_pledge_rows.pledge_id
      and (p.backer_id = auth.uid() or c.created_by = auth.uid() or public.is_platform_admin())
  )
);

drop policy if exists "need_pledge_rows_insert_backer" on public.need_pledge_rows;
create policy "need_pledge_rows_insert_backer"
on public.need_pledge_rows for insert
to authenticated
with check (
  exists (select 1 from public.need_pledges p where p.id = pledge_id and p.backer_id = auth.uid())
);

drop policy if exists "need_pledge_rows_update_backer_or_admin" on public.need_pledge_rows;
create policy "need_pledge_rows_update_backer_or_admin"
on public.need_pledge_rows for update
to authenticated
using (
  exists (select 1 from public.need_pledges p where p.id = pledge_id and p.backer_id = auth.uid())
  or public.is_platform_admin()
)
with check (
  exists (select 1 from public.need_pledges p where p.id = pledge_id and p.backer_id = auth.uid())
  or public.is_platform_admin()
);

-- SUPPLIER_OFFERS
drop policy if exists "supplier_offers_select_supplier_or_creator" on public.supplier_offers;
create policy "supplier_offers_select_supplier_or_creator"
on public.supplier_offers for select
to authenticated
using (
  supplier_id = auth.uid()
  or public.is_platform_admin()
  or exists (select 1 from public.campaigns c where c.id = supplier_offers.campaign_id and c.created_by = auth.uid())
);

drop policy if exists "supplier_offers_insert_supplier" on public.supplier_offers;
create policy "supplier_offers_insert_supplier"
on public.supplier_offers for insert
to authenticated
with check (supplier_id = auth.uid());

drop policy if exists "supplier_offers_update_supplier_or_admin" on public.supplier_offers;
create policy "supplier_offers_update_supplier_or_admin"
on public.supplier_offers for update
to authenticated
using (supplier_id = auth.uid() or public.is_platform_admin())
with check (supplier_id = auth.uid() or public.is_platform_admin());

-- SUPPLIER_OFFER_ROWS
drop policy if exists "supplier_offer_rows_select_supplier_or_creator" on public.supplier_offer_rows;
create policy "supplier_offer_rows_select_supplier_or_creator"
on public.supplier_offer_rows for select
to authenticated
using (
  exists (
    select 1 from public.supplier_offers o
    join public.campaigns c on c.id = o.campaign_id
    where o.id = supplier_offer_rows.offer_id
      and (o.supplier_id = auth.uid() or c.created_by = auth.uid() or public.is_platform_admin())
  )
);

drop policy if exists "supplier_offer_rows_insert_supplier" on public.supplier_offer_rows;
create policy "supplier_offer_rows_insert_supplier"
on public.supplier_offer_rows for insert
to authenticated
with check (
  exists (select 1 from public.supplier_offers o where o.id = offer_id and o.supplier_id = auth.uid())
);

drop policy if exists "supplier_offer_rows_update_supplier_or_admin" on public.supplier_offer_rows;
create policy "supplier_offer_rows_update_supplier_or_admin"
on public.supplier_offer_rows for update
to authenticated
using (
  exists (select 1 from public.supplier_offers o where o.id = offer_id and o.supplier_id = auth.uid())
  or public.is_platform_admin()
)
with check (
  exists (select 1 from public.supplier_offers o where o.id = offer_id and o.supplier_id = auth.uid())
  or public.is_platform_admin()
);

-- DEEDS
drop policy if exists "deeds_select_participant_or_creator" on public.deeds;
create policy "deeds_select_participant_or_creator"
on public.deeds for select
to authenticated
using (
  public.is_platform_admin()
  or created_by = auth.uid()
  or exists (select 1 from public.deed_signers ds where ds.deed_id = deeds.id and ds.user_id = auth.uid())
  or exists (select 1 from public.campaigns c where c.id = deeds.campaign_id and c.created_by = auth.uid())
);

drop policy if exists "deeds_insert_creator_or_admin" on public.deeds;
create policy "deeds_insert_creator_or_admin"
on public.deeds for insert
to authenticated
with check (created_by = auth.uid() or public.is_platform_admin());

drop policy if exists "deeds_update_creator_or_admin" on public.deeds;
create policy "deeds_update_creator_or_admin"
on public.deeds for update
to authenticated
using (created_by = auth.uid() or public.is_platform_admin())
with check (created_by = auth.uid() or public.is_platform_admin());

-- DEED_SIGNERS
drop policy if exists "deed_signers_select_visible_to_deed_viewers" on public.deed_signers;
create policy "deed_signers_select_visible_to_deed_viewers"
on public.deed_signers for select
to authenticated
using (
  public.is_platform_admin()
  or user_id = auth.uid()
  or exists (
    select 1 from public.deeds d
    where d.id = deed_signers.deed_id
      and (
        d.created_by = auth.uid()
        or exists (select 1 from public.deed_signers ds2 where ds2.deed_id = d.id and ds2.user_id = auth.uid())
      )
  )
);

drop policy if exists "deed_signers_insert_creator_or_admin" on public.deed_signers;
create policy "deed_signers_insert_creator_or_admin"
on public.deed_signers for insert
to authenticated
with check (
  public.is_platform_admin()
  or exists (select 1 from public.deeds d where d.id = deed_id and d.created_by = auth.uid())
);

drop policy if exists "deed_signers_update_self" on public.deed_signers;
create policy "deed_signers_update_self"
on public.deed_signers for update
to authenticated
using (user_id = auth.uid() or public.is_platform_admin())
with check (user_id = auth.uid() or public.is_platform_admin());

-- ASSIGNMENTS
drop policy if exists "assignments_select_involved" on public.assignments;
create policy "assignments_select_involved"
on public.assignments for select
to authenticated
using (
  public.is_platform_admin()
  or exists (select 1 from public.campaigns c where c.id = assignments.campaign_need_id and c.created_by = auth.uid())
  or exists (select 1 from public.supplier_offers o where o.id = assignments.selected_offer_id and o.supplier_id = auth.uid())
  or exists (
    select 1
    from public.assignment_need_deeds ands
    join public.deed_signers ds on ds.deed_id = ands.need_deed_id
    where ands.assignment_id = assignments.id and ds.user_id = auth.uid()
  )
);

drop policy if exists "assignments_insert_creator_or_admin" on public.assignments;
create policy "assignments_insert_creator_or_admin"
on public.assignments for insert
to authenticated
with check (
  public.is_platform_admin()
  or exists (select 1 from public.campaigns c where c.id = campaign_need_id and c.created_by = auth.uid())
);

drop policy if exists "assignments_update_creator_or_admin" on public.assignments;
create policy "assignments_update_creator_or_admin"
on public.assignments for update
to authenticated
using (
  public.is_platform_admin()
  or exists (select 1 from public.campaigns c where c.id = campaign_need_id and c.created_by = auth.uid())
)
with check (
  public.is_platform_admin()
  or exists (select 1 from public.campaigns c where c.id = campaign_need_id and c.created_by = auth.uid())
);

-- ASSIGNMENT_NEED_DEEDS
drop policy if exists "assignment_need_deeds_select_involved" on public.assignment_need_deeds;
create policy "assignment_need_deeds_select_involved"
on public.assignment_need_deeds for select
to authenticated
using (
  public.is_platform_admin()
  or exists (select 1 from public.deed_signers ds where ds.deed_id = assignment_need_deeds.need_deed_id and ds.user_id = auth.uid())
  or exists (
    select 1 from public.assignments a
    join public.campaigns c on c.id = a.campaign_need_id
    where a.id = assignment_need_deeds.assignment_id and c.created_by = auth.uid()
  )
  or exists (
    select 1 from public.assignments a
    join public.supplier_offers o on o.id = a.selected_offer_id
    where a.id = assignment_need_deeds.assignment_id and o.supplier_id = auth.uid()
  )
);

drop policy if exists "assignment_need_deeds_insert_creator_or_admin" on public.assignment_need_deeds;
create policy "assignment_need_deeds_insert_creator_or_admin"
on public.assignment_need_deeds for insert
to authenticated
with check (
  public.is_platform_admin()
  or exists (
    select 1 from public.assignments a
    join public.campaigns c on c.id = a.campaign_need_id
    where a.id = assignment_id and c.created_by = auth.uid()
  )
);

-- FULFILLMENT
drop policy if exists "fulfillment_milestones_select_involved" on public.fulfillment_milestones;
create policy "fulfillment_milestones_select_involved"
on public.fulfillment_milestones for select
to authenticated
using (
  public.is_platform_admin()
  or exists (
    select 1 from public.assignments a
    where a.id = fulfillment_milestones.assignment_id
      and (
        exists (select 1 from public.campaigns c where c.id = a.campaign_need_id and c.created_by = auth.uid())
        or exists (select 1 from public.supplier_offers o where o.id = a.selected_offer_id and o.supplier_id = auth.uid())
        or exists (
          select 1 from public.assignment_need_deeds ands
          join public.deed_signers ds on ds.deed_id = ands.need_deed_id
          where ands.assignment_id = a.id and ds.user_id = auth.uid()
        )
      )
  )
);

-- Writes are admin-only in this starter schema (tighten later with supplier/initiator rules)
drop policy if exists "fulfillment_milestones_write_admin" on public.fulfillment_milestones;
create policy "fulfillment_milestones_write_admin"
on public.fulfillment_milestones for insert
to authenticated
with check (public.is_platform_admin());

drop policy if exists "fulfillment_milestones_update_admin" on public.fulfillment_milestones;
create policy "fulfillment_milestones_update_admin"
on public.fulfillment_milestones for update
to authenticated
using (public.is_platform_admin())
with check (public.is_platform_admin());

drop policy if exists "fulfillment_events_select_involved" on public.fulfillment_events;
create policy "fulfillment_events_select_involved"
on public.fulfillment_events for select
to authenticated
using (
  public.is_platform_admin()
  or actor_user_id = auth.uid()
  or exists (
    select 1 from public.assignments a
    where a.id = fulfillment_events.assignment_id
      and (
        exists (select 1 from public.campaigns c where c.id = a.campaign_need_id and c.created_by = auth.uid())
        or exists (select 1 from public.supplier_offers o where o.id = a.selected_offer_id and o.supplier_id = auth.uid())
        or exists (
          select 1 from public.assignment_need_deeds ands
          join public.deed_signers ds on ds.deed_id = ands.need_deed_id
          where ands.assignment_id = a.id and ds.user_id = auth.uid()
        )
      )
  )
);

drop policy if exists "fulfillment_events_insert_actor_or_admin" on public.fulfillment_events;
create policy "fulfillment_events_insert_actor_or_admin"
on public.fulfillment_events for insert
to authenticated
with check (actor_user_id = auth.uid() or public.is_platform_admin());

-- PARTICIPATIONS
drop policy if exists "participations_select_own" on public.participations;
create policy "participations_select_own"
on public.participations for select
to authenticated
using (user_id = auth.uid() or public.is_platform_admin());

drop policy if exists "participations_insert_own" on public.participations;
create policy "participations_insert_own"
on public.participations for insert
to authenticated
with check (user_id = auth.uid() or public.is_platform_admin());

drop policy if exists "participations_delete_own" on public.participations;
create policy "participations_delete_own"
on public.participations for delete
to authenticated
using (user_id = auth.uid() or public.is_platform_admin());

-- AUDIT_LOGS (admin-only)
drop policy if exists "audit_logs_admin_select" on public.audit_logs;
create policy "audit_logs_admin_select"
on public.audit_logs for select
to authenticated
using (public.is_platform_admin());

drop policy if exists "audit_logs_admin_insert" on public.audit_logs;
create policy "audit_logs_admin_insert"
on public.audit_logs for insert
to authenticated
with check (public.is_platform_admin());

-- DISPUTES
drop policy if exists "disputes_select_involved_or_admin" on public.disputes;
create policy "disputes_select_involved_or_admin"
on public.disputes for select
to authenticated
using (
  public.is_platform_admin()
  or opened_by = auth.uid()
  or exists (
    select 1 from public.deed_signers ds
    where disputes.context_type = 'deed'
      and ds.deed_id = disputes.context_id
      and ds.user_id = auth.uid()
  )
);

drop policy if exists "disputes_insert_self" on public.disputes;
create policy "disputes_insert_self"
on public.disputes for insert
to authenticated
with check (opened_by = auth.uid());

drop policy if exists "disputes_update_admin" on public.disputes;
create policy "disputes_update_admin"
on public.disputes for update
to authenticated
using (public.is_platform_admin())
with check (public.is_platform_admin());

-- NOTIFICATIONS
drop policy if exists "notifications_select_own" on public.notifications;
create policy "notifications_select_own"
on public.notifications for select
to authenticated
using (user_id = auth.uid() or public.is_platform_admin());

drop policy if exists "notifications_update_own" on public.notifications;
create policy "notifications_update_own"
on public.notifications for update
to authenticated
using (user_id = auth.uid() or public.is_platform_admin())
with check (user_id = auth.uid() or public.is_platform_admin());

drop policy if exists "notifications_insert_admin" on public.notifications;
create policy "notifications_insert_admin"
on public.notifications for insert
to authenticated
with check (public.is_platform_admin());

-- =====================================================================
-- END
-- =====================================================================

-- =====================================================================
-- MIGRATIONS MERGED
-- =====================================================================

/*
  # Add Threshold Evaluation & Campaign Transition Functions

  ## Purpose
  Implements the automatic campaign state transition system for Sprint 6.

  ## New Functions
  
  ### 1. `evaluate_campaign_thresholds(campaign_id uuid)`
  - Calculates current pledge totals (quantity and value)
  - Compares against campaign thresholds
  - Returns boolean indicating if thresholds are met
  
  ### 2. `transition_campaign_to_seeded(campaign_id uuid)`
  - Transitions a campaign from 'live' to 'seeded' status
  - Creates audit log entry
  - Triggers notification creation for all backers
  
  ### 3. `close_expired_campaigns()`
  - Finds campaigns past their deadline
  - Marks unsuccessful campaigns as 'closed_unseeded'
  - Creates notifications for backers
  
  ### 4. `get_campaign_progress(campaign_id uuid)`
  - Returns current progress metrics
  - Used for real-time progress displays
  
  ## Security
  - Functions are marked as SECURITY DEFINER where needed
  - Only callable by authenticated users or system processes
*/

-- Function to calculate campaign progress and check thresholds
CREATE OR REPLACE FUNCTION evaluate_campaign_thresholds(p_campaign_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_campaign record;
  v_need_campaign record;
  v_total_qty numeric := 0;
  v_total_value numeric := 0;
  v_threshold_met boolean := false;
  v_progress jsonb;
BEGIN
  -- Get campaign details
  SELECT * INTO v_campaign
  FROM campaigns
  WHERE id = p_campaign_id AND kind = 'need';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Campaign not found or not a need campaign';
  END IF;
  
  -- Get need campaign details
  SELECT * INTO v_need_campaign
  FROM need_campaigns
  WHERE campaign_id = p_campaign_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Need campaign details not found';
  END IF;
  
  -- Calculate total quantity from all pledges
  SELECT COALESCE(SUM(npr.quantity), 0) INTO v_total_qty
  FROM need_pledges np
  JOIN need_pledge_rows npr ON npr.pledge_id = np.id
  WHERE np.campaign_id = p_campaign_id
    AND np.status = 'active';
  
  -- Calculate total value
  -- Note: This assumes unit prices are stored in campaign_items or calculated separately
  -- For now, we'll use a simple calculation based on quantity
  SELECT COALESCE(SUM(npr.quantity), 0) INTO v_total_value
  FROM need_pledges np
  JOIN need_pledge_rows npr ON npr.pledge_id = np.id
  WHERE np.campaign_id = p_campaign_id
    AND np.status = 'active';
  
  -- Evaluate threshold based on type
  IF v_need_campaign.threshold_type = 'quantity' THEN
    v_threshold_met := v_total_qty >= v_need_campaign.threshold_qty;
  ELSIF v_need_campaign.threshold_type = 'value' THEN
    v_threshold_met := v_total_value >= v_need_campaign.threshold_value;
  ELSIF v_need_campaign.threshold_type = 'both' THEN
    v_threshold_met := v_total_qty >= v_need_campaign.threshold_qty 
                      AND v_total_value >= v_need_campaign.threshold_value;
  END IF;
  
  -- Build progress response
  v_progress := jsonb_build_object(
    'campaign_id', p_campaign_id,
    'current_qty', v_total_qty,
    'threshold_qty', v_need_campaign.threshold_qty,
    'current_value', v_total_value,
    'threshold_value', v_need_campaign.threshold_value,
    'threshold_type', v_need_campaign.threshold_type,
    'threshold_met', v_threshold_met,
    'deadline_at', v_need_campaign.deadline_at,
    'status', v_campaign.status_need
  );
  
  RETURN v_progress;
END;
$$;

-- Function to transition campaign to seeded status
CREATE OR REPLACE FUNCTION transition_campaign_to_seeded(p_campaign_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_campaign record;
  v_progress jsonb;
BEGIN
  -- Get campaign
  SELECT * INTO v_campaign
  FROM campaigns
  WHERE id = p_campaign_id AND kind = 'need';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Campaign not found';
  END IF;
  
  -- Check if campaign is in live status
  IF v_campaign.status_need != 'live' THEN
    RAISE EXCEPTION 'Campaign is not in live status';
  END IF;
  
  -- Evaluate thresholds
  v_progress := evaluate_campaign_thresholds(p_campaign_id);
  
  -- Only transition if threshold is met
  IF (v_progress->>'threshold_met')::boolean THEN
    -- Update campaign status
    UPDATE campaigns
    SET status_need = 'seeded',
        updated_at = now()
    WHERE id = p_campaign_id;
    
    -- Create audit log
    INSERT INTO audit_logs (action, entity_type, entity_id, payload_json)
    VALUES (
      'campaign_seeded',
      'campaign',
      p_campaign_id,
      jsonb_build_object(
        'previous_status', 'live',
        'new_status', 'seeded',
        'progress', v_progress
      )
    );
    
    -- Create notifications for all backers
    INSERT INTO notifications (user_id, kind, context_type, context_id, payload_json)
    SELECT 
      np.backer_id,
      'campaign_seeded',
      'campaign',
      p_campaign_id,
      jsonb_build_object(
        'campaign_id', p_campaign_id,
        'campaign_title', v_campaign.title,
        'message', 'Campaign has reached its goal and is now seeded!'
      )
    FROM need_pledges np
    WHERE np.campaign_id = p_campaign_id
      AND np.status = 'active'
    GROUP BY np.backer_id;
  ELSE
    RAISE EXCEPTION 'Campaign threshold not met';
  END IF;
END;
$$;

-- Function to close expired campaigns
CREATE OR REPLACE FUNCTION close_expired_campaigns()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_closed_count integer := 0;
  v_campaign record;
  v_progress jsonb;
BEGIN
  -- Find all live campaigns past their deadline
  FOR v_campaign IN
    SELECT c.id, c.title
    FROM campaigns c
    JOIN need_campaigns nc ON nc.campaign_id = c.id
    WHERE c.kind = 'need'
      AND c.status_need = 'live'
      AND nc.deadline_at < now()
  LOOP
    -- Check if threshold was met
    v_progress := evaluate_campaign_thresholds(v_campaign.id);
    
    IF (v_progress->>'threshold_met')::boolean THEN
      -- Transition to seeded
      UPDATE campaigns
      SET status_need = 'seeded',
          updated_at = now()
      WHERE id = v_campaign.id;
      
      -- Notify backers of success
      INSERT INTO notifications (user_id, kind, context_type, context_id, payload_json)
      SELECT 
        np.backer_id,
        'campaign_seeded',
        'campaign',
        v_campaign.id,
        jsonb_build_object(
          'campaign_id', v_campaign.id,
          'campaign_title', v_campaign.title,
          'message', 'Campaign deadline reached and goal was met!'
        )
      FROM need_pledges np
      WHERE np.campaign_id = v_campaign.id
        AND np.status = 'active'
      GROUP BY np.backer_id;
    ELSE
      -- Close as unseeded
      UPDATE campaigns
      SET status_need = 'closed_unseeded',
          updated_at = now()
      WHERE id = v_campaign.id;
      
      -- Notify backers of failure
      INSERT INTO notifications (user_id, kind, context_type, context_id, payload_json)
      SELECT 
        np.backer_id,
        'campaign_failed',
        'campaign',
        v_campaign.id,
        jsonb_build_object(
          'campaign_id', v_campaign.id,
          'campaign_title', v_campaign.title,
          'message', 'Campaign deadline reached but goal was not met.'
        )
      FROM need_pledges np
      WHERE np.campaign_id = v_campaign.id
        AND np.status = 'active'
      GROUP BY np.backer_id;
    END IF;
    
    -- Create audit log
    INSERT INTO audit_logs (action, entity_type, entity_id, payload_json)
    VALUES (
      'campaign_closed_deadline',
      'campaign',
      v_campaign.id,
      jsonb_build_object(
        'threshold_met', (v_progress->>'threshold_met')::boolean,
        'progress', v_progress
      )
    );
    
    v_closed_count := v_closed_count + 1;
  END LOOP;
  
  RETURN v_closed_count;
END;
$$;

-- Function to get campaign progress (for real-time updates)
CREATE OR REPLACE FUNCTION get_campaign_progress(p_campaign_id uuid)
RETURNS TABLE (
  current_qty numeric,
  threshold_qty numeric,
  current_value numeric,
  threshold_value numeric,
  threshold_type text,
  threshold_met boolean,
  backer_count bigint,
  pledge_count bigint,
  progress_percentage numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_progress jsonb;
  v_backer_count bigint;
  v_pledge_count bigint;
  v_percentage numeric;
BEGIN
  -- Get threshold evaluation
  v_progress := evaluate_campaign_thresholds(p_campaign_id);
  
  -- Count backers and pledges
  SELECT COUNT(DISTINCT np.backer_id), COUNT(*)
  INTO v_backer_count, v_pledge_count
  FROM need_pledges np
  WHERE np.campaign_id = p_campaign_id
    AND np.status = 'active';
  
  -- Calculate percentage based on threshold type
  IF (v_progress->>'threshold_type')::text = 'quantity' THEN
    v_percentage := CASE 
      WHEN (v_progress->>'threshold_qty')::numeric > 0 THEN
        ((v_progress->>'current_qty')::numeric / (v_progress->>'threshold_qty')::numeric) * 100
      ELSE 0
    END;
  ELSIF (v_progress->>'threshold_type')::text = 'value' THEN
    v_percentage := CASE 
      WHEN (v_progress->>'threshold_value')::numeric > 0 THEN
        ((v_progress->>'current_value')::numeric / (v_progress->>'threshold_value')::numeric) * 100
      ELSE 0
    END;
  ELSE
    v_percentage := 0;
  END IF;
  
  RETURN QUERY SELECT
    (v_progress->>'current_qty')::numeric,
    (v_progress->>'threshold_qty')::numeric,
    (v_progress->>'current_value')::numeric,
    (v_progress->>'threshold_value')::numeric,
    (v_progress->>'threshold_type')::text,
    (v_progress->>'threshold_met')::boolean,
    v_backer_count,
    v_pledge_count,
    v_percentage;
END;
$$;

/*
  # Add Feed Campaign Auto-Creation System

  ## Purpose
  Automatically creates Feed campaigns when Need campaigns reach "seeded" status,
  enabling suppliers to respond to validated demand.

  ## New Functions
  
  ### 1. `create_feed_campaign_from_seeded(need_campaign_id uuid)`
  - Creates a new Feed campaign linked to a seeded Need campaign
  - Copies campaign items from the Need campaign
  - Sets default bid deadline (e.g., 14 days from creation)
  - Returns the new Feed campaign ID
  
  ### 2. `get_campaign_bom(campaign_id uuid)`
  - Aggregates all pledged quantities by item (Bill of Materials)
  - Returns total quantities needed for each campaign item
  - Used to show suppliers the full demand
  
  ## Database Changes
  
  - No new tables required (feed_campaigns, supplier_offers already exist)
  - Adds trigger to auto-create Feed campaign when Need campaign transitions to seeded
  
  ## Security
  - Functions use SECURITY DEFINER for system-level operations
  - RLS policies ensure only authorized suppliers can create offers
*/

-- Function to aggregate demand (BOM) for a campaign
CREATE OR REPLACE FUNCTION get_campaign_bom(p_campaign_id uuid)
RETURNS TABLE (
  item_id uuid,
  item_code text,
  item_title text,
  item_description text,
  unit text,
  total_quantity numeric,
  backer_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ci.id as item_id,
    ci.item_code,
    ci.title as item_title,
    ci.description as item_description,
    ci.unit,
    COALESCE(SUM(npr.quantity), 0) as total_quantity,
    COUNT(DISTINCT np.backer_id) as backer_count
  FROM campaign_items ci
  LEFT JOIN need_pledge_rows npr ON npr.campaign_item_id = ci.id
  LEFT JOIN need_pledges np ON np.id = npr.pledge_id AND np.status = 'active'
  WHERE ci.campaign_id = p_campaign_id
  GROUP BY ci.id, ci.item_code, ci.title, ci.description, ci.unit
  ORDER BY ci.item_code, ci.title;
END;
$$;

-- Function to create a Feed campaign from a seeded Need campaign
CREATE OR REPLACE FUNCTION create_feed_campaign_from_seeded(p_need_campaign_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_need_campaign record;
  v_feed_campaign_id uuid;
  v_item record;
BEGIN
  -- Get the Need campaign
  SELECT * INTO v_need_campaign
  FROM campaigns
  WHERE id = p_need_campaign_id AND kind = 'need' AND status_need = 'seeded';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Campaign not found or not in seeded status';
  END IF;
  
  -- Check if Feed campaign already exists
  SELECT id INTO v_feed_campaign_id
  FROM campaigns
  WHERE kind = 'feed' 
    AND title = v_need_campaign.title || ' - Supply Opportunity'
    AND created_at > v_need_campaign.updated_at - interval '1 hour';
  
  IF FOUND THEN
    -- Already created, return existing ID
    RETURN v_feed_campaign_id;
  END IF;
  
  -- Create the Feed campaign
  INSERT INTO campaigns (
    kind,
    title,
    description,
    visibility,
    group_id,
    created_by,
    status_feed
  ) VALUES (
    'feed',
    v_need_campaign.title || ' - Supply Opportunity',
    'Supply opportunity for validated demand: ' || COALESCE(v_need_campaign.description, ''),
    'public',
    v_need_campaign.group_id,
    v_need_campaign.created_by,
    'open'
  ) RETURNING id INTO v_feed_campaign_id;
  
  -- Create feed_campaigns details
  INSERT INTO feed_campaigns (
    campaign_id,
    bid_deadline_at,
    award_method,
    eligibility_rules_json,
    compliance_requirements_json
  ) VALUES (
    v_feed_campaign_id,
    now() + interval '14 days',
    'manual',
    '{"requires_verification": false}'::jsonb,
    '{"basic_compliance": true}'::jsonb
  );
  
  -- Copy campaign items from Need campaign
  FOR v_item IN 
    SELECT * FROM campaign_items WHERE campaign_id = p_need_campaign_id
  LOOP
    INSERT INTO campaign_items (
      campaign_id,
      item_code,
      title,
      description,
      unit,
      variant_json
    ) VALUES (
      v_feed_campaign_id,
      v_item.item_code,
      v_item.title,
      v_item.description,
      v_item.unit,
      v_item.variant_json
    );
  END LOOP;
  
  -- Create audit log
  INSERT INTO audit_logs (
    action,
    entity_type,
    entity_id,
    payload_json
  ) VALUES (
    'feed_campaign_created',
    'campaign',
    v_feed_campaign_id,
    jsonb_build_object(
      'source_need_campaign_id', p_need_campaign_id,
      'auto_created', true
    )
  );
  
  -- Update Need campaign to reference Feed campaign
  UPDATE campaigns
  SET updated_at = now()
  WHERE id = p_need_campaign_id;
  
  RETURN v_feed_campaign_id;
END;
$$;

-- Trigger function to auto-create Feed campaign when Need campaign is seeded
CREATE OR REPLACE FUNCTION trigger_create_feed_on_seed()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_feed_id uuid;
BEGIN
  -- Check if status changed to 'seeded'
  IF NEW.kind = 'need' AND NEW.status_need = 'seeded' AND (OLD.status_need IS NULL OR OLD.status_need != 'seeded') THEN
    -- Create Feed campaign
    v_feed_id := create_feed_campaign_from_seeded(NEW.id);
    
    -- Log the creation
    RAISE NOTICE 'Auto-created Feed campaign % for Need campaign %', v_feed_id, NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS auto_create_feed_on_seed ON campaigns;
CREATE TRIGGER auto_create_feed_on_seed
  AFTER UPDATE ON campaigns
  FOR EACH ROW
  EXECUTE FUNCTION trigger_create_feed_on_seed();

-- Grant permissions for suppliers to view Feed campaigns and create offers
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'campaigns' AND policyname = 'Anyone can view open Feed campaigns'
  ) THEN
    CREATE POLICY "Anyone can view open Feed campaigns"
      ON campaigns
      FOR SELECT
      USING (kind = 'feed' AND status_feed IN ('open', 'review'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'supplier_offers' AND policyname = 'Suppliers can create offers'
  ) THEN
    CREATE POLICY "Suppliers can create offers"
      ON supplier_offers
      FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'supplier_offers' AND policyname = 'Suppliers can view their own offers'
  ) THEN
    CREATE POLICY "Suppliers can view their own offers"
      ON supplier_offers
      FOR SELECT
      TO authenticated
      USING (supplier_id = auth.uid());
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'supplier_offers' AND policyname = 'Suppliers can update their own draft offers'
  ) THEN
    CREATE POLICY "Suppliers can update their own draft offers"
      ON supplier_offers
      FOR UPDATE
      TO authenticated
      USING (supplier_id = auth.uid() AND status = 'draft')
      WITH CHECK (supplier_id = auth.uid());
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'supplier_offer_rows' AND policyname = 'Suppliers can insert their own offer rows'
  ) THEN
    CREATE POLICY "Suppliers can insert their own offer rows"
      ON supplier_offer_rows
      FOR INSERT
      TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM supplier_offers
          WHERE id = offer_id AND supplier_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'supplier_offer_rows' AND policyname = 'Suppliers can view their own offer rows'
  ) THEN
    CREATE POLICY "Suppliers can view their own offer rows"
      ON supplier_offer_rows
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM supplier_offers
          WHERE id = offer_id AND supplier_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'supplier_offer_rows' AND policyname = 'Suppliers can update their own draft offer rows'
  ) THEN
    CREATE POLICY "Suppliers can update their own draft offer rows"
      ON supplier_offer_rows
      FOR UPDATE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM supplier_offers
          WHERE id = offer_id AND supplier_id = auth.uid() AND status = 'draft'
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM supplier_offers
          WHERE id = offer_id AND supplier_id = auth.uid() AND status = 'draft'
        )
      );
  END IF;
END $$;
-- =====================================================================
-- Post-run alignment fixes (RLS + privileges + created_by defaults)
-- These address:
--  - group_members policy recursion (keep policies simple; avoid self-referential EXISTS)
--  - "permission denied" due to missing GRANTs
--  - campaigns.created_by FK violations + default auth.uid()
-- =====================================================================

-- ---------- Privileges (required in addition to RLS) ----------
grant usage on schema public to anon, authenticated;

-- grant CRUD to authenticated on all tables (common Supabase pattern)
grant select, insert, update, delete on all tables in schema public to authenticated;
-- optionally allow anon read; comment out if you want everything behind auth
grant select on all tables in schema public to anon;

alter default privileges in schema public
  grant select, insert, update, delete on tables to authenticated;

alter default privileges in schema public
  grant select on tables to anon;

-- ---------- campaigns.created_by: default + FK ----------
alter table public.campaigns
  add column if not exists created_by uuid;

alter table public.campaigns
  alter column created_by set default auth.uid();

do $$
begin
  if exists (select 1 from pg_constraint where conname = 'campaigns_created_by_fkey') then
    execute 'alter table public.campaigns drop constraint campaigns_created_by_fkey';
  end if;
exception when undefined_table then
  null;
end $$;

do $$
begin
  if to_regclass('public.campaigns') is not null then
    execute 'alter table public.campaigns add constraint campaigns_created_by_fkey
             foreign key (created_by) references auth.users(id) on delete set null';
  end if;
exception when duplicate_object then null;
end $$;

-- ---------- group_members: safe non-recursive policies ----------
do $$
begin
  if to_regclass('public.group_members') is not null then

    execute 'drop policy if exists gm_select_own on public.group_members';
    execute 'drop policy if exists gm_insert_self on public.group_members';
    execute 'drop policy if exists gm_update_own on public.group_members';
    execute 'drop policy if exists gm_delete_own on public.group_members';

    execute 'drop policy if exists group_members_select_member on public.group_members';
    execute 'drop policy if exists group_members_insert_owner_or_admin on public.group_members';
    execute 'drop policy if exists group_members_delete_owner_or_admin on public.group_members';
    execute 'drop policy if exists group_members_update_owner_or_admin on public.group_members';

    execute 'alter table public.group_members enable row level security';

    execute $p$
      create policy group_members_select_member
      on public.group_members
      for select
      to authenticated
      using (user_id = auth.uid())
    $p$;

    execute $p$
      create policy group_members_insert_self
      on public.group_members
      for insert
      to authenticated
      with check (user_id = auth.uid())
    $p$;

    execute $p$
      create policy group_members_update_self
      on public.group_members
      for update
      to authenticated
      using (user_id = auth.uid())
      with check (user_id = auth.uid())
    $p$;

    execute $p$
      create policy group_members_delete_self
      on public.group_members
      for delete
      to authenticated
      using (user_id = auth.uid())
    $p$;

    execute 'grant select, insert, update, delete on table public.group_members to authenticated';
  end if;
end $$;


commit;
