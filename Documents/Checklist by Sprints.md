## **Sprint 0 — Project Skeleton & Guardrails**

**Goal:** A clean, future-proof Next.js foundation that won’t fight you later.

### Tech & Repo

-  Create Next.js app (App Router, TypeScript, Tailwind)
    
-  Configure ESLint, Prettier, strict TS
    
-  Set up path aliases (`@/components`, `@/lib`, `@/db`)
    
-  Environment validation schema (Zod)
    
-  Base folder structure:
    
    `app/   (public)/   (auth)/   (protected)/   api/ components/ lib/ db/`
    
-  Global error boundary (`error.tsx`, `not-found.tsx`)
    
-  Toast system (client-only)
    

### DB & Auth

-  Initialize Supabase project
    
-  Connect Supabase client + server helpers
    
-  Enable Auth (email + magic link)
    
-  Create minimal DB schema:
    
    - users
        
    - campaigns (need only, draft)
        
-  RLS: user can read/write own drafts
    

✅ **Exit condition:**  
App loads, auth works, DB connected, no UX yet — just rails.

---

## **Sprint 1 — Public Pages & SEO Core**

**Goal:** The platform exists _publicly_ and explains itself.

-  Home page (value prop + lifecycle explanation)
    
-  Static Need → Seed → Feed → Reed explainer
    
-  App header + navigation shell
    
-  Metadata + OpenGraph setup
    
-  Campaign card component (static data)
    
-  Explore Needs page (mock data)
    
-  Mobile responsiveness baseline
    

✅ **Exit condition:**  
You can send a link and people understand _what this is_.

---

## **Sprint 2 — Authentication & Workspace Skeleton**

**Goal:** Users have identity and a place to land.

-  Signup / login pages
    
-  Session persistence via middleware
    
-  Protected route group `(protected)`
    
-  Workspace layout
    
-  My Campaigns (empty state)
    
-  My Deeds (empty state)
    
-  Profile page (basic info)
    
-  Verification placeholder (badges, “coming soon”)
    

✅ **Exit condition:**  
A user can log in and see _their_ empty world.

---

## **Sprint 3 — Need Campaign Creation (Initiator MVP)**

**Goal:** A real Need campaign can be created and published.

-  Campaign creation wizard
    
    -  Basics (title, description, visibility)
        
    -  Items table (SKU, qty, unit)
        
    -  Thresholds (qty/value/deadline)
        
    -  Commercial terms (deposit, payment structure)
        
-  Draft saving
    
-  Validation per step
    
-  Campaign preview
    
-  Publish → `status = live`
    
-  Campaign appears in Explore
    

✅ **Exit condition:**  
A real campaign exists and is discoverable.

---

## **Sprint 4 — Need Campaign Page & Backer Flow**

**Goal:** Backers can _commit_ via a Need Deed.

-  Campaign page (dynamic)
    
-  Progress / threshold UI
    
-  Items read-only table
    
-  Join Campaign flow
    
-  Quantity selector
    
-  Price summary
    
-  Need Deed generation (HTML)
    
-  Signature consent flow
    
-  Store signed deed + hash
    
-  Download / print deed
    

✅ **Exit condition:**  
Someone can legally commit to a campaign.

---

## **Sprint 5 — Deed System v1**

**Goal:** Deeds become first-class citizens.

-  DeedViewer component
    
-  Deed metadata (status, version, hash)
    
-  Signature block
    
-  Audit trail (signed, viewed)
    
-  Immutable lock after signing
    
-  Versioning logic (new version ≠ overwrite)
    
-  PDF-ready print styles
    

✅ **Exit condition:**  
Deeds feel like contracts — not UI screens.

---

## **Sprint 6 — Seed Logic & Threshold Engine**

**Goal:** Campaigns transition automatically.

-  Threshold evaluation DB function
    
-  Live → Seeded transition
    
-  Backer notifications on success/failure
    
-  Deadline auto-close
    
-  Realtime progress updates
    
-  Admin override (manual seed)
    

✅ **Exit condition:**  
Campaigns _move themselves_ without manual babysitting.

---

## **Sprint 7 — Feed Campaigns (Supplier Side)**

**Goal:** Suppliers see validated demand and respond.

-  Auto-create Feed Campaign from Seed
    
-  Supplier-facing Feed page
    
-  Aggregated demand (BOM totals)
    
-  Supplier offer form
    
-  Offer row pricing + terms
    
-  Supplier Feed Deed
    
-  Offer signing flow
    
-  Supplier dashboard
    

✅ **Exit condition:**  
Suppliers can legally bid on real demand.

---

## **Sprint 8 — Supplier Selection & Award**

**Goal:** One supplier is chosen transparently.

-  Offer comparison table
    
-  Side-by-side comparison
    
-  Manual selection UI
    
-  Award confirmation
    
-  Notifications to winners & losers
    
-  Feed campaign closure
    
-  Audit trail for decision
    

✅ **Exit condition:**  
The market resolves cleanly.

---

## **Sprint 9 — Assignment (Reed) & WEED**

**Goal:** Convert commitments into executable orders.

-  Assignment Deed generation
    
-  Link Need + Feed deeds
    
-  WEED fee calculation
    
-  Multi-party signatures
    
-  Assignment status tracking
    
-  Reed viewer (relationship graph)
    

✅ **Exit condition:**  
This is now a real commercial transaction.

---

## **Sprint 10 — Fulfillment Tracking**

**Goal:** The promise gets delivered.

-  Milestone definition
    
-  Supplier updates
    
-  Proof of delivery uploads
    
-  Backer tracking view
    
-  Milestone notifications
    
-  Completion confirmation
    

✅ **Exit condition:**  
Deals don’t disappear after signing.

---

## **Sprint 11 — Groups, Private Campaigns & Trust**

**Goal:** Enable communities + credibility.

- [x] Group creation & invites
    
- [x] Private campaigns
    
- [x] Group dashboards
    
- [x] Verification badges
    
- [x] Reputation signals
    
- [x] Dispute filing
    
✅ **Exit condition:**  
Communities can coordinate, and trust is visible.

---

## **Sprint 12 — Admin, Polish & Launch**

**Goal:** Operate the platform safely.

- [x] Admin dashboard
    
- [x] Campaign moderation
    
- [x] Dispute resolution tools
    
- [x] Rate limiting
    
- [x] Accessibility pass
    
- [x] SEO polish
    
- [x] Demo data
    
- [x] Analytics hooks
    
✅ **Exit condition:**  
You can _launch without fear_.