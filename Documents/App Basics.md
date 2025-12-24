### 1.1 Product name

**MishMeshMosh** — “Need-to-Deed” campaigns that turn shared needs into executable supply.

### 1.2 Problem

Needs are discovered and shaped upstream of the supply chain

### 1.3 Solution summary

MishMeshMosh lets _anyone_ raise a **Need Campaign**. Backers join by signing a **Need Deed** (non-binding, transferable). When thresholds are met, the need becomes a **Seed** (validated need). Then a **Feed Campaign** opens to suppliers; a supplier signs a **Feed Deed** to fulfill the aggregated need. Finally, a **Reed Deed** assigns the batch of Need Deeds to the supplier and defines **WEED** commissions (initiator + platform). Supplier fulfills and collects payments externally / directly (or via agreed rails).

### 1.4 Core entities and terminology

- **Initiator**: creates Need Campaign.
    
- **Backer**: joins a Need Campaign by signing Need Deed .
    
- **Supplier**: fulfills via Feed Deed; receives assigned Need Deeds via Reed Deed.
    
- **Need**: the proposed demand.
    
- **Seed**: validated need (threshold met).
    
- **Feed**: supplier bidding/commit stage .
    
- **Reed**: executed assignment stage → supplier now holds deeds + can supply/collect.
    
- **Weed**: commissions/fees defined in Reed Deed.
    
- **NEED-DEED**: contract between  a backer and the platform to buy the goods or services under the NEED-campaign terms.
    
- **FEED-DEED**: contract between  a Supplier and the platform to provide the goods or services under the NEED-campaign and FEED-campaign terms.
    
- **REED-DEED**: contract between  the Supplier and the platform to assign the supplier name and details on the NEED-DEEDS  under the terms of the FEED-DEED and the completion of the payment of the Weeds - commission to the platform and the initiator.
    
- **NEED-campaign**: a call to join and back a specific need of goods and services under the campaign terms.
    
- **FEED-campaign**: a call to join and become a supplier for a specific need of goods and services under the campaign terms - it is linked directly to specific need-campaign .

### 1.5 User roles & permissions

- **Anonymous visitor**: view public campaigns - Both NEED and FEED campaigns .
    
- **Verified user**: can back and sign deeds.
    
- **Initiator**: can create campaign; manage updates; invite group for private campaigns.
    
- **Supplier (verified business)**: can view feed campaigns; submit & sign feed deeds.
    
- **Admin/Compliance**: moderation, identity review, abuse handling, legal templates.
    

### 1.6 Key user journeys

#### Journey A — Standard public flow (Need → Seed → Feed → Reed)

1. Initiator creates **Need Campaign** (Kickstarter-like page).
    
2. Backer selects item rows (size/design/qty) → signs **Need Deed**.
    
3. Campaign reaches threshold (qty/amount/time) → becomes a **Seed**.
    
4. Platform opens **Feed Campaign** to relevant suppliers.
    
5. Supplier submits terms and signs **Feed Deed** (obligation to supply totals under terms).
    
6. Initiator/platform selects supplier (rule-based or manual) → **Reed Deed** signed:
    
    - Assigns batch of Need Deeds to supplier
        
    - Defines WEED (fees) and any transfer constraints
        
7. Supplier fulfills and collects money per agreed method.
    

#### Journey B — Initiator is supplier (Seed → Reed direct)

- Need reaches Seed → supplier/initiator signs Feed+Reed in a combined simplified path (flagged campaign type).
    

#### Journey C — Private campaign

- Initiator limits access to group/invite list.
    
- Everything else identical, but feed suppliers may be:
    
    - only approved suppliers, or
        
    - open suppliers with NDA-like gates, depending on policy.
        

### 1.7 Campaign page requirements (Kickstarter-like)

Campaign must include:

- Title, story.
    
- Target thresholds (qty / total value / deadline)
    
- Item catalog (multiple SKUs, sizes, designs)
    
- Price model (may be estimate or capped max)
      
- Supplier requirement:  what are the standards that the supplier must meet
    
- Timeline: need phase → seed achieved → feed phase → reed assigned → fulfillment
    
- Updates & comments
    
- Trust signals: identity verified, initiator reputation, supplier verification (later)
    

### 1.8 Deeds (contract objects) — functional spec

#### Need Deed (Platform ↔ Backer)

**Nature:** non-binding, transferable, identity-bound signature  
**Per-backer:** includes rows (items, variants, qty, max price/terms, expiry)  
**Purpose:** expresses conditional intent + consent to assignment if reed occurs.

Key fields:

- Parties: Platform, Backer (verified identity)
    
- Campaign reference + version hash of campaign terms at signing time
    
- Item rows (SKU/variant/qty/constraints)
    
- “Activation conditions”: only assignable if Seed and Reed 
    
- Transferability clause: assignment permitted via Reed Deed
    
- Withdrawal/cancellation rules (if allowed)
    
- Audit trail: timestamp, device, signature method
    

#### Feed Deed (Platform ↔ Supplier)

**Nature:** supplier’s obligation to fulfill aggregated demand under defined terms  
**Purpose:** makes supplier commitment explicit before assignment occurs.

Key fields:

- Parties: Supplier + Platform
    
- Aggregated totals (sum of all backer rows)
    
- Terms: unit prices, lead times, delivery split, warranty, SLA, geographic scope
    
- Expiry: supplier offer valid until X
    
- Preconditions: Reed execution triggers assignment + fulfillment obligation
    

#### Reed Deed (Platform ↔ Supplier)

**Nature:** assignment + fee schedule (WEED) + transfer rules  
**Purpose:** legally moves the batch of Need Deeds to supplier and defines commissions.

Key fields:

- Assigned need-deed list (hashes/IDs) according to linked feed-deed
    
- Total value/qty being assigned
    
- WEED: platform fee and initiator fee rules (flat / % / per unit)
    
- Payment/collection rails (declared but not executed by platform)
    
- Fulfillment & reporting obligations (proof-of-delivery, milestones)
    
- Dispute process (first-line, escalation, jurisdiction)
    

### 1.9 Identity & digital signature requirements

- Users sign with **real ID and details** :
    
    - ID number + phone verification + document scan or external KYC provider.
        
- Signature must be:
    
    - tamper-evident (hash + timestamp)
        
    - stored with signed PDF + machine-readable JSON
        
    - versioned by “campaign terms hash” so later edits don’t invalidate prior deeds
        

### 1.10 Data model (high level)

**Core tables / collections:**

- **Users**  (role flags, verification status, reputation)
- **Groups** (private campaign access control)
- **Campaigns**  (owner, group, kind: _need / feed_, status, visibility, timeline, summary)
- **NeedCampaigns**  (success thresholds, buyer-side commercial structure, deposit rules, payment structure definition, delivery window, cancellation logic)
- **FeedCampaigns**  (bid deadline, award method, compliance requirements, supplier eligibility rules)
- **CampaignItems**  (product/service definitions, variants, options, units)
- **NeedPledges**  (backer → need campaign commitment)
- **NeedPledgeRows**  (item, quantity, constraints per backer)
- **SupplierOffers**   (supplier → feed campaign submission)
- **SupplierOfferRows**  (item, pricing, commercial terms aligned to campaign items)
- **Deeds**  (kind: _Need / Feed / Assignment / Weed_, status, campaign reference, signed parties, document JSON, hash, timestamps)
- **NeedDeeds**  (buyer obligations, deposits, payment schedule, delivery and cancellation terms)
- **FeedDeeds**  (supplier obligations, pricing commitment, SLA, compliance, penalties)
- **AssignmentDeeds**  (mapping of supplier obligations to sets of need deeds, counterparty substitution logic)
- **WeedDeeds**  (platform and initiator fees, authority, liability, disclosures)
- **Assignments**  (successful match between feed outcome and grouped need deeds)
- **AssignmentNeedDeeds**  (join table linking assignment to covered need deeds)
- **AuditLogs**  (who did what, when)
- **Disputes** _(optional / MVP-light)_  claim, status, resolution reference)



### 1.11 State machine (campaign lifecycle)

#### Need Campaign lifecycle

- **Draft**  - Campaign and associated **Need Deed** are being defined (items, rows, pricing structure, deposits, payment schedule, delivery terms).
- **Review** _(optional)_  -  Compliance, moderation, or group approval of campaign and deed content.
- **Live**  -  Campaign is visible; backers may join.  **Guard condition:** Need Deed is **Open for Signature**.
- **Seeded**  -    Success threshold met (quantity / amount / participants).
- **Closed (Unseeded)**  -    Deadline reached without meeting threshold; Need Deeds expire or are voided per terms.
#### **Feed Campaign lifecycle**

- **Feed Draft**  -    Feed campaign and associated **Feed Deed** prepared from a seeded Need Campaign.
- **Feed Review** _(optional)_ -    Supplier eligibility, compliance requirements, and award logic validated.
- **Feed Open** -    Suppliers may submit offers and sign Feed Deeds.  **Guard condition:** Feed Deed is **Open for Signature**.
- **Supplier Selected**  -    Winning supplier selected per award rules.
- **Feed Closed (No Winner)**      No acceptable or compliant supplier offer received.
#### **Assignment & execution lifecycle**

- **Reeded**  - **Assignment Deed** executed; supplier obligations assigned to a defined set of Need Deeds.
- **Active Fulfillment**  - Delivery and execution in progress.
- **Closed (Fulfilled)**  - All obligations satisfied.
- **Closed (Failed)**  - Assignment unwound or failed per Assignment Deed terms.
#### **Need Deed lifecycle**

- **Draft**  - Terms and commercial rows editable.
- **Review** _(optional)_  -    Compliance or moderation review.
- **Open for Signature**  -    Terms locked; backers signing from this point accept this exact version.
- **Signed** -    Executed by a backer.
- **Eligible for Assignment**  -Associated Need Campaign is seeded.
- **Assigned**  -    Included in an executed Assignment Deed.
- **Fulfilled** / **Expired** / **Disputed** / **Voided**
#### **Feed Deed lifecycle**
- **Draft**  -     Supplier obligations and pricing structure defined.
- **Review** _(optional)_  -    Compliance, licensing, and eligibility checks.
- **Open for Signature**  -    Terms locked; suppliers may sign.
- **Signed**  -    Executed by a supplier.
- **Eligible for Selection**  -    Feed Campaign is open and accepting offers.
- **Selected** / **Rejected**     
- **Active**  -    Supplier is bound under an Assignment Deed.
- **Fulfilled** / **Expired** / **Disputed** / **Voided**
#### **Assignment Deed lifecycle**

- **Draft**  - Mapping between supplier offer and grouped Need Deeds defined.
- **Review** _(optional)_  -    Legal, platform, or initiator validation.
- **Open for Signature**     
- **Executed**  -    Signed by required parties (supplier / initiator / platform).
- **Active**
- **Fulfilled** / **Failed** / **Disputed** / **Voided**
#### **Key invariants**

- A **campaign cannot be Live** unless its primary deed is **Open for Signature**.
- A **Need Deed cannot be Assigned** unless the Need Campaign is **Seeded**.
- A **Feed Deed cannot become Active** unless included in an **Executed Assignment Deed**.
- All state transitions are **append-only and auditable**.





### 1.12 Rules engine (thresholds & aggregation)

Threshold types:

- minimum total value
    
- minimum total units (overall or per SKU)
    
- deadline
    
- group-only minimum participation  
    Aggregation output:
    
- supplier-facing BOM-like totals: SKU/variant → total qty, plus constraints summary.
    

### 1.13 Trust & abuse controls

- Rate limits on campaign creation
    
- Manual review flags for high-value campaigns
    
- Verified supplier onboarding
    
- Transparent disclosure: TBD
    
- Anti-scam: initiator identity visibility level, supplier verification badges, complaint reporting
    

### 1.14  feature list 

#### **Identity & access**

1. **User identity & authentication**
    
    - User registration & login
        
    - Identity verification (email / phone / wallet)
        
2. **Permission system (contextual)**
    
    - Permissions derived from:
        
        - Campaign ownership
            
        - Deed participation
            
        - Platform assignment (admin / moderator)
            
    - Read / write / sign permissions evaluated per context
        
#### **User workspace **

3. **User dashboard (personal workspace)**
    
    - All campaigns the user is involved in (any capacity)
        
    - All deeds the user has signed or may sign
        
    - All assignments affecting the user
        
    - Action queue (“needs signature”, “awaiting delivery”, etc.)
        
4. **User activity & history**
    
    - Immutable timeline of:
        
        - Campaigns created
            
        - Deeds signed
            
        - Offers submitted
            
        - Assignments executed
            
#### **Need side**

5. **Create Need Campaign**
    
    - Any authenticated user may initiate
        
    - Define items, quantities, thresholds, deadlines
        
    - Define commercial structure
        
    - Draft associated **Need Deed**
        
6. **Need Deed lifecycle (pre-live)**
    
    - Draft → Review (optional) → Open for signature
        
    - Terms locked before campaign goes live
        
7. **Participate as Backer**
    
    - Join Need Campaign
        
    - Select items / quantities
        
    - View and e-sign **Need Deed**
        
8. **Backer view**
    
    - Track campaign progress
        
    - View signed deeds
        
    - See assignment & fulfillment status
        
9. **Threshold engine → Seed transition**
    
    - Automatic evaluation
        
    - Campaign state update
        
    - All participants notified
        
#### **Feed side **

10. **Feed Campaign creation**
    
    - Generated from seeded Need Campaign
        
    - Draft associated **Feed Deed**
        
    - Define supplier requirements & award logic
        
11. **Supplier participation**
    
    - Any user may act as supplier
        
    - Submit offer aligned to campaign items
        
    - Upload compliance documents
        
    - E-sign **Feed Deed**
        
12. **Supplier view**
    
    - Active feed campaigns
        
    - Submitted offers
        
    - Signed feed deeds
        
    - Assignment status
        
13. **Supplier selection**
    
    - Initiator or authorized operator selects winning offer
        
    - Feed Campaign closes
        
#### **Assignment & execution**

14. **Assignment (Reed) generation**
    
    - Generate **Assignment Deed**
        
    - Map supplier obligations to grouped Need Deeds
        
    - Execute assignment
        
15. **Fulfillment management**
    
    - Supplier updates delivery milestones
        
    - Backers track fulfillment
        
    - Documents and proofs uploaded
        
#### **Admin Platform & governance**

16. **Platform administration**
    
    - Grant operational permissions to users (admin / moderator)
        
    - Review campaigns or deeds (optional)
        
    - No ownership of commercial obligations
        
17. **Notifications & messaging**
    
    - Context-aware notifications
        
    - Only relevant to user’s participation
        
18. **Disputes & exceptions** _(MVP-light)_
    
    - Any deed participant may open dispute
        
    - Status tracking & resolution reference
        
19. **Audit & compliance**
    
    - Full audit log
        
    - Deed versioning & signature history
        
    - Downloadable legal records


### 1.15 Tech architecture (practical suggestion)

- **Frontend:** Next.js (RTL-ready), Tailwind
    
- **Backend:** Node/TS (or Next API routes) + queue worker
    
- **DB:** Supabase
    
- **Storage:** signed PDFs + JSON in object storage
    
- **Signing:** integrate an e-sign provider or build basic signing:
    
    - server-side PDF generation
        
    - cryptographic hash + signature record
        
    - later: qualified e-sign / KYC provider
        


