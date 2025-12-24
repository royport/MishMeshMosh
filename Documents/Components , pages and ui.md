

This document defines **pages, components, responsibilities, and wireframes** for the MishMeshMosh platform, aligned with the **Need → Seed → Feed → Reed** lifecycle and the existing Supabase schema.

---

## 1. Product Mental Model (shared language)

**Everything revolves around three first‑class objects:**

1. **Campaigns** (Need / Feed)
    
2. **Deeds** (Need / Feed / Reed / Weed)
    
3. **Assignments** (execution & fulfillment)
    

UX rule: **Users never "do actions" — they enter or exit obligations.**

---

## 2. Global App Structure

### 2.1 Top‑level Layout

**Persistent global components**

- `AppHeader`
    
- `AuthGate`
    
- `NotificationBell`
    
- `GlobalDeedViewer (modal)`
    

---

## 3. Pages & Components (by user journey)

## 3.1 Home / Landing Page

### Purpose

Explain the concept and funnel users into **Explore** or **Create Need**.

### Components

- `HeroSection`
    
- `ExplainerStepper (Need → Seed → Feed → Reed)`
    
- `FeaturedCampaigns`
    
- `TrustSignals`
    


## 3.2 Explore Campaigns

### Purpose

Browse **public Need Campaigns** (Kickstarter‑style discovery).

### Components

- `CampaignFilters`
    
- `CampaignCard`
    
- `CampaignProgressBar`
    

## 3.3 Campaign Page (Need Campaign)

### Purpose

Convert interest → **Need Deed signature**.

### Sections / Components

- `CampaignHeader`
    
- `CampaignStory`
    
- `ThresholdStatus`
    
- `ItemTable (read‑only)`
    
- `JoinCampaignCTA`
    
- `NeedDeedPreview`
    
- `Updates & Timeline`
    

## 3.4 Join Campaign Flow (Backer)

### Purpose

Let a user **commit clearly and safely**.

### Components

- `ItemSelector`
    
- `PriceSummary`
    
- `NeedDeedFullViewer`
    
- `DigitalSignatureBlock`
    

## 3.5 User Workspace (Core Page)

### Purpose

Answer: **"What am I bound to?"**

### Sections

- `MyCampaigns`
    
- `MyDeeds`
    
- `MyAssignments`
    
- `ActionQueue`
    

## 3.6 Create Need Campaign (Wizard)

### Purpose

Help an initiator define **terms before hype**.

### Steps

1. Campaign basics
    
2. Item & row definition
    
3. Thresholds & deadlines
    
4. Commercial structure
    
5. Draft Need Deed
    

### Components

- `WizardStepper`
    
- `CampaignBasicsForm`
    
- `ItemEditor`
    
- `ThresholdEditor`
    
- `NeedDeedEditor`
    

## 3.7 Feed Campaign Page (Supplier Side)

### Purpose

Let suppliers **quote professionally**.

### Components

- `AggregatedDemandTable`
    
- `SupplierOfferEditor`
    
- `FeedDeedPreview`
    

## 3.8 Supplier Selection Page

### Purpose

Compare offers and select one **traceably**.

### Components

- `OfferComparisonTable`
    
- `AwardRuleSummary`
    
- `SelectSupplierCTA`
    

## 3.9 Assignment (Reed) Execution Page

### Purpose

Execute the **moment of truth**.

### Components

- `AssignmentSummary`
    
- `CoveredNeedDeedsTable`
    
- `WEEDBreakdown`
    
- `ReedDeedViewer`
    

## 3.10 Fulfillment Tracking Page

### Purpose

Track execution **after contracts exist**.

### Components

- `MilestoneTimeline`
    
- `FulfillmentEvents`
    
- `DisputeCTA`
    

## 4. Core Shared Components (Design System)

### Contract / Deed Components

- `DeedViewer`
    
- `DeedStatusBadge`
    
- `SignatureBlock`
    

### Data Components

- `RowTable`
    
- `TotalsFooter`
    
- `StatusTimeline`
    

### Trust Components

- `VerificationBadge`
    
- `AuditTrail`
    

---

## 5. Developer Notes

### Page → DB Mapping (examples)

| Page          | Tables                                |
| ------------- | ------------------------------------- |
| Campaign Page | campaigns, campaign_items             |
| Join Flow     | need_pledges, need_pledge_rows, deeds |
| Feed Campaign | supplier_offers, supplier_offer_rows  |
| Assignment    | assignments, assignment_need_deeds    |

### Invariants enforced in UI

- Cannot go live without `deed.status = open_for_signature`
    
- Cannot assign without seeded Need Campaign
    
- Cannot edit deed after signature
    

---

## 6. UX Principles 

1. **Deeds always visible**
    
2. **Statuses over buttons**
    
3. **Explicit obligations**
    
4. **No dark patterns**
    
5. **Printable, auditable outputs**
    

---

## 7. To be consider and implement 

- Mobile‑first refinement
    
- RTL support
    
- Visual deed diffing
    
- Campaign reputation signals
    
- Best practice of UI / UX guidelines 
    
---

**This document is the canonical reference for designers & developers.**

---

## 8. Mobile-first Variant (canonical)

### 8.1 Mobile navigation model

Mobile should feel like a **focused flow**, not a desktop squeezed into a phone.

**Bottom Tab Bar (primary)**

- `Home`
    
- `Explore`
    
- `Create`
    
- `Workspace`
    
- `Profile`
    

**Contextual actions** live inside each page (sticky bottom CTA) rather than top-right buttons.


**Sticky CTA rules**

- Exactly **one** primary action per screen.
    
- Secondary actions go into `(⋯)`.
    
- If action is blocked (not verified, wrong state), show CTA disabled with reason.
    

### 8.2 Mobile page variants

#### A) Home (mobile)

- Reduce landing copy.
    
- Keep: hero + stepper + featured cards.
    
#### B) Explore (mobile)

- Filters become a **top sheet**.
    
- Campaigns are stacked cards.
    

#### C) Campaign Page (Need) (mobile)

**Key change:** split into tabs for readability.

- `Overview` | `Items` | `Deed` | `Updates`
    

#### D) Join flow (mobile)

Turn into a 3-step modal flow:

1. Select rows
    
2. Review deed
    
3. Sign
    

#### E) Workspace (mobile)

Workspace becomes an **Action Inbox** first.

Sections order:

1. `ActionQueue`
    
2. `My Deeds`
    
3. `My Campaigns`
    
4. `My Assignments`
    
#### F) Create Need (mobile)

Wizard stays, but inputs are simplified.

- Stepper is horizontal chips.
    
- Item editor uses “Add row” cards.
    

#### G) Feed (supplier) (mobile)

- Aggregated table becomes **row cards**.
    
- Offer entry uses inline numeric fields.
    

#### H) Assignment/Reed (mobile)

- Focus on summary + “covered deeds” count.
    
- Full covered deed list opens as drilldown.
    

### 8.3 Mobile UI patterns (reusable)

- `BottomSheet` (filters, deed actions, secondary actions)
    
- `StickyCTA`
    
- `SegmentTabs` (overview/items/deed/updates)
    
- `CardList` (rows become cards)
    

---

## 9. Deed-first UI Polish (make contracts feel premium)

Your core differentiator is **documents that turn chaos into enforceable clarity**. So deeds must feel:

- serious
    
- readable
    
- immutable
    
- auditable
    

### 9.1 Visual language for Deeds

**Deed Header (always the same)**

- Left: Deed name + subtitle
    
- Right: status pill + version
    
- Below: Deed ID + hash (copy button)
    

**Key UI elements**

- `StatusPill` (draft/review/open/signed/executed/active)
    
- `HashChip` with copy
    
- `AuditTrail` (timestamped events)
    
- `ImmutableBanner` when open_for_signature or beyond
    

### 9.2 Deed viewer layout (mobile + desktop)

**Mobile**: deed is a readable document with anchors.

- Top: compact meta
    
- Middle: scrollable contract
    
- Bottom: signature area
    

**Desktop**: split view

- Left: sections nav
    
- Right: document
    

### 9.3 “Contract table” styling

Item rows and pricing must look like a real contract:

- strong table borders
    
- fixed column widths
    
- totals bar pinned below table
    

Add a `TotalsFooter` that always shows:

- total quantity
    
- total value
    
- currency
    
- any deposit rule
    

### 9.4 Guardrails (trust)

- When a deed is **Open for signature**: show `ImmutableBanner` + “Terms locked”
    
- When a deed is **Signed**: show “This is your receipt” with download
    
- When **Reed executed**: show “This now binds you to Supplier X” and link to supplier profile
    

### 9.5 Microcopy rules (non-negotiable)

- Replace vague language (“maybe”, “later”) with explicit conditions.
    
- Always state:
    
    - what changes now
        
    - what does not change
        
    - what happens next
        

---
## 10. temp folder structure 

```
app/
  mobile/
    explore/needs/
    explore/feeds/
    need/demo/
    feed/demo/
    create/need/
    workspace/
  playground/
components/
  ui/
  campaign/
  need/
  feed/
  deed/
  editors/
  wizard/
```

