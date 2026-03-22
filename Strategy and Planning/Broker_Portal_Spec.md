# RentGuard Broker Portal — Feature Specification

_Created: 2026-03-21 | Based on: GRENTY portal.grenty.us analysis + grenty-workflow.netlify.app_

---

## 1. Executive Summary

Build a broker/realtor-facing portal within `rentguard-app` that allows real estate agents to:
1. Create an account and log in
2. Enroll properties under their name
3. Invite tenants to apply for specific properties
4. Track application status (deals pipeline)
5. Manage their property portfolio

This mirrors GRENTY's portal functionality but adapted to RentGuard's simpler architecture (Supabase + Next.js, no Zoho CRM).

---

## 2. GRENTY Feature Map (What They Built)

### 2.1 Portal Pages (Broker/Realtor Role)

| Page | Purpose | Key Fields/Features |
|------|---------|-------------------|
| **Dashboard** | Welcome + action cards | 4 quick-action cards: Enroll Property, View Properties, Invite Renter, View Deals |
| **Properties** | Portfolio view | Card grid of enrolled properties. Click → detail view with progress stepper (Upload → Invite → Contract Signed → Deal Closed). Shows: address, type, rent, beds, payer, LLC, contacts. Bulk Upload Units via Excel. |
| **Deals** | Pipeline analytics | Donut chart + timeline chart. Filterable table: Deal, Stage, Amount, Properties, Payment Link. Filters by deal/stage/property/realtor. |
| **Resources** | Self-service FAQ | Expandable FAQ accordion |
| **Invite Teammates** | Team management | Role picker (Broker/Realtor) + name + email |
| **Invite Renter** | Tenant assignment | Name + email + property dropdown. Max 4 renters/property. Invitation status table (Accepted/Pending). |
| **Enroll Property** | Property registration | Property Type (6 options), Address, Floor, Unit, Beds, Monthly Rent, Lease Duration, Contract Status (New/Ongoing), Payer (Broker/Owner/Renter), LLC?, Owner info?, Property Manager? |
| **File a Claim** | Claims submission | Listed in nav but not yet functional |
| **Account Settings** | Profile management | Name, email, password |

### 2.2 GRENTY Workflow Pipeline (8 Stages)

```
Pre-Approval → Risk Analysis → Info Required → Reassessment → RPSA Contract → Send to Sign → Payment → Active
```

### 2.3 GRENTY Role Hierarchy

| Role | Can See | Can Invite | Restrictions |
|------|---------|-----------|-------------|
| Broker | All agency properties | Realtors, Renters, Owners | None |
| Realtor | Only own properties | Renters | Requires parent Broker |
| Owner | Only own properties | Renters, Broker/Realtor | — |
| Renter | Only assigned property | Co-Renters | — |

### 2.4 GRENTY Tech Stack

- **Portal**: Softr (no-code, backed by Airtable/Softr Tables)
- **CRM**: Zoho CRM (bidirectional sync via webhooks + n8n)
- **Signing**: Zoho Sign
- **Payments**: Stripe
- **Risk**: TransUnion
- **Messaging**: Respond.io (SMS/WhatsApp)

---

## 3. RentGuard Broker Portal — Proposed Architecture

### 3.1 Approach: Build Natively in Next.js + Supabase

Unlike GRENTY (Softr no-code + Zoho CRM), we build directly in `rentguard-app` using:
- **Auth**: Supabase Auth (email/password + optional Google OAuth)
- **DB**: Supabase PostgreSQL (new `brokers`, `properties`, `invitations` tables)
- **UI**: Next.js 14 App Router + Tailwind (matching existing app style)
- **Email**: Resend (invitation emails, status notifications)

### 3.2 New Database Schema

```sql
-- Broker/Realtor accounts
CREATE TABLE brokers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('broker', 'realtor')) NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  license_id TEXT,
  brokerage_name TEXT,
  brokerage_license TEXT,
  parent_broker_id UUID REFERENCES brokers(id), -- Realtors link to their Broker
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Properties enrolled by brokers
CREATE TABLE properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  broker_id UUID REFERENCES brokers(id) ON DELETE CASCADE,
  property_type TEXT CHECK (property_type IN (
    'house', 'townhome', 'apartment_condo', 'commercial', 'multi_family', 'apartment_building'
  )) NOT NULL,
  address TEXT NOT NULL,
  city TEXT DEFAULT 'Miami',
  state TEXT DEFAULT 'FL',
  zip TEXT,
  floor TEXT,
  unit_number TEXT,
  bedrooms INTEGER,
  monthly_rent DECIMAL(10,2) NOT NULL,
  lease_duration_months INTEGER DEFAULT 12,
  lease_status TEXT CHECK (lease_status IN ('new', 'ongoing')) DEFAULT 'new',
  fee_payer TEXT CHECK (fee_payer IN ('broker', 'owner', 'renter')) DEFAULT 'owner',
  owned_by_llc BOOLEAN DEFAULT false,
  llc_name TEXT,
  llc_address TEXT,
  llc_representative_name TEXT,
  llc_representative_email TEXT,
  owner_name TEXT,
  owner_email TEXT,
  owner_phone TEXT,
  has_property_manager BOOLEAN DEFAULT false,
  pm_name TEXT,
  pm_email TEXT,
  pm_signs_for_owner BOOLEAN DEFAULT false,
  status TEXT CHECK (status IN (
    'enrolled', 'invitations_sent', 'tenant_applied', 'under_review',
    'approved', 'contract_sent', 'contract_signed', 'payment_pending', 'active', 'rejected'
  )) DEFAULT 'enrolled',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tenant invitations sent by brokers
CREATE TABLE invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  broker_id UUID REFERENCES brokers(id) ON DELETE CASCADE,
  renter_name TEXT NOT NULL,
  renter_email TEXT NOT NULL,
  role TEXT CHECK (role IN ('renter', 'co_renter', 'owner')) DEFAULT 'renter',
  status TEXT CHECK (status IN ('pending', 'sent', 'accepted', 'expired', 'declined')) DEFAULT 'pending',
  application_id UUID REFERENCES applications(id), -- links to existing applications table once tenant applies
  invite_token TEXT UNIQUE DEFAULT gen_random_uuid()::text,
  sent_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Link brokers to applications (for commission tracking)
ALTER TABLE applications ADD COLUMN IF NOT EXISTS broker_id UUID REFERENCES brokers(id);
ALTER TABLE applications ADD COLUMN IF NOT EXISTS property_id UUID REFERENCES properties(id);
ALTER TABLE applications ADD COLUMN IF NOT EXISTS invitation_id UUID REFERENCES invitations(id);
```

### 3.3 Route Structure

```
rentguard-app/src/app/
├── broker/
│   ├── login/page.tsx          — Email/password login
│   ├── register/page.tsx       — Broker/Realtor signup (name, email, phone, license, brokerage)
│   ├── dashboard/page.tsx      — Welcome + action cards + stats
│   ├── properties/
│   │   ├── page.tsx            — Property portfolio (card grid)
│   │   └── [id]/page.tsx       — Property detail + progress stepper + contacts
│   ├── enroll/page.tsx         — Enroll new property (multi-step form)
│   ├── invite/
│   │   ├── renter/page.tsx     — Invite renter to property
│   │   └── teammate/page.tsx   — Invite Broker/Realtor teammate
│   ├── deals/page.tsx          — Deal pipeline table + analytics
│   ├── claims/page.tsx         — File a claim (Phase 2+)
│   ├── resources/page.tsx      — FAQ accordion
│   └── settings/page.tsx       — Account settings
├── broker/layout.tsx           — Sidebar nav + auth guard
```

### 3.4 Auth Flow

1. **Registration**: Broker visits `/broker/register` → fills form (name, email, phone, FL license ID, brokerage name) → Supabase Auth `signUp()` → creates `auth.users` row + `brokers` row → redirect to `/broker/dashboard`
2. **Login**: `/broker/login` → email + password → Supabase Auth `signInWithPassword()` → redirect to `/broker/dashboard`
3. **Auth Guard**: `broker/layout.tsx` checks Supabase session. No session → redirect to `/broker/login`. Valid session → fetch `brokers` row by `user_id` → render sidebar + children.
4. **Realtor Invite**: Broker invites Realtor via email → Realtor receives invite → clicks link → `/broker/register?invite=TOKEN&role=realtor` → pre-fills brokerage, links `parent_broker_id`.

### 3.5 Broker-to-Tenant Flow

```
1. Broker registers → creates account
2. Broker enrolls property → property card appears in portfolio
3. Broker invites renter → email sent with application link
   Link: /apply/tenant?invite=TOKEN&property=PROPERTY_ID
4. Tenant clicks link → pre-filled tenant application form (property info auto-populated)
5. Tenant submits → application created in `applications` table (linked to broker + property)
6. AI underwriting runs → decision made
7. Broker sees status update on Deals page + gets email notification
8. If approved → contract + payment flow (existing Phase 2)
9. Broker earns commission (tracked via broker_id on application)
```

---

## 4. Page-by-Page Specification

### 4.1 Dashboard (`/broker/dashboard`)

**Header**: "Welcome, {broker.full_name}!" with RentGuard branding
**Action Cards** (4 cards in a row):
1. **Enroll Property** — icon + "Add new properties" + link to `/broker/enroll`
2. **My Properties** — icon + "View all your properties" + link to `/broker/properties`
3. **Invite Renter** — icon + "Send tenant applications" + link to `/broker/invite/renter`
4. **My Deals** — icon + "Track application status" + link to `/broker/deals`

**Stats Row** (below cards):
- Total Properties enrolled
- Active deals (in pipeline)
- Pending invitations
- Commission earned (Phase 2)

### 4.2 Properties (`/broker/properties`)

**Card Grid**: Each enrolled property as a card showing:
- Property type icon (house, apartment, etc.)
- Address (truncated)
- Monthly rent
- Status badge (Enrolled, Tenant Applied, Under Review, Approved, Active)

**Click → Property Detail** (`/broker/properties/[id]`):
- **Progress Stepper**: Enroll Property → Invite Tenants → Application Review → Contract Signed → Active
- **Property Info Card**: Full address, type, rent, beds, floor/unit, lease duration, payer, LLC info
- **Contacts Section**: Owner info, PM info, linked broker/realtor
- **Tenants Section**: List of invited/applied tenants with status
- **Actions**: "Invite Renter" button, "Edit Property" button

### 4.3 Enroll Property (`/broker/enroll`)

**Multi-step form** (matching GRENTY's fields, adapted for RentGuard):

**Step 1 — Property Type**: Radio buttons (House, Townhome, Apartment/Condo, Commercial, Multi-Family, Apartment Building)

**Step 2 — Property Details**: Address (autocomplete), Floor, Unit Number, Bedrooms, Monthly Rent ($), Lease Duration (months dropdown: 6, 12, 18, 24)

**Step 3 — Lease & Payment**:
- Lease Contract Status: New Contract / Ongoing Contract
- Who pays the RentGuard fee? Broker / Owner / Renter
- Is property owned by an LLC? Yes/No → conditional: LLC Name, LLC Address, Representative Name + Email

**Step 4 — Owner Information**:
- Do you have owner info? Yes / No (add later)
- If Yes: Owner Name, Email, Phone
- Are you the property manager? Yes/No
- If broker is not PM: Does property have a PM? → PM Name, Email, Will PM sign for owner?

**Step 5 — Review & Submit**: Summary card → "Enroll My Property" button

### 4.4 Invite Renter (`/broker/invite/renter`)

**Form**:
- Renter Full Name*
- Renter Email*
- Which property?* (dropdown of broker's enrolled properties)
- "Add Renter" button (can add up to 4 per property)

**Below form — Invitation History Table**:
| Full Name | Status | Role | Email | Property | Date Sent |
Statuses: Pending (email not yet sent), Sent, Accepted (tenant created account/started application), Expired (7 days no action)

### 4.5 Invite Teammate (`/broker/invite/teammate`)

**Form**:
- Role*: Broker / Realtor
- Full Name*
- Email*
- "Send Invitation" button

**Invitation History**: Same table format as renter invitations

### 4.6 Deals (`/broker/deals`)

**Analytics Section**:
- Donut chart: Applications by status (Pending Review, Approved, Rejected, Active)
- Line chart: Applications over time (last 30 days)

**Deals Table** (filterable):
| Deal | Property | Tenant | Stage | Amount | Date |
Stages map to existing RentGuard statuses: PENDING_TENANT → PENDING_REVIEW → APPROVED → CONTRACT_SENT → ... → ACTIVE
Filters: Stage dropdown, Property dropdown, Date range

### 4.7 Resources (`/broker/resources`)

**FAQ Accordion** — RentGuard-specific questions:
- How do I register as a Broker on RentGuard?
- How do I enroll a property?
- What property types can I enroll?
- How does tenant screening work?
- How long does approval take?
- What happens if a tenant defaults?
- How does the referral commission work?
- Who pays the protection fee?
- Can I enroll properties owned by an LLC?
- How do I file a claim?

### 4.8 Account Settings (`/broker/settings`)

- Full Name (editable)
- Email (read-only)
- Phone (editable)
- License ID (editable)
- Brokerage Name (editable)
- Change Password
- Sign Out

---

## 5. Email Templates Needed

| Template | Trigger | Recipient |
|----------|---------|-----------|
| **BrokerWelcomeEmail** | Broker registers | Broker |
| **RenterInviteEmail** | Broker invites renter to property | Renter |
| **TeammateInviteEmail** | Broker invites realtor/broker | Teammate |
| **ApplicationStatusEmail** | Tenant application status changes | Broker |
| **DealClosedEmail** | Application reaches ACTIVE | Broker + Owner |

---

## 6. What We Keep vs. What We Adapt from GRENTY

### Keep (directly replicate)
- Sidebar navigation layout
- Property card grid with type icons
- Progress stepper on property detail
- Invite renter form (name + email + property dropdown)
- Invitation tracking table with statuses
- FAQ accordion in Resources
- Property enrollment form fields (type, address, floor, beds, rent, LLC, PM)
- "Who pays" selector (Broker/Owner/Renter)

### Adapt (different implementation)
- **Auth**: Supabase Auth instead of Softr built-in
- **CRM sync**: No Zoho CRM — everything in Supabase
- **Deal pipeline**: Map to RentGuard's existing 8-status flow instead of GRENTY's pipeline
- **Signing**: Dropbox Sign instead of Zoho Sign
- **Risk assessment**: Our AI underwriting engine instead of TransUnion (Phase 1)
- **Bulk upload**: Skip for MVP — single property enrollment only
- **"Ask Sara" AI**: Skip for MVP

### Skip (not needed for MVP)
- Zoho CRM bidirectional sync
- n8n webhook orchestration
- TransUnion direct integration
- Respond.io integration
- Bulk Excel unit upload
- AI chatbot in portal
- Multi-language support

---

## 7. Implementation Phases

### Phase A — MVP Broker Portal (build in `rentguard-app-test`)
1. DB migration: `brokers`, `properties`, `invitations` tables
2. Supabase Auth signup/login for brokers
3. Broker layout with sidebar navigation
4. Dashboard with action cards
5. Enroll Property multi-step form
6. Properties list (card grid) + detail view with progress stepper
7. Invite Renter form + invitation email via Resend
8. Modified tenant application form that accepts `?invite=TOKEN` to pre-fill property
9. Deals page (table view of linked applications)
10. Resources FAQ page
11. Account settings page

### Phase B — Integration
1. Connect broker invitations to existing underwriting pipeline
2. Broker notification emails on status changes
3. Commission tracking (broker_id on applications)
4. Owner invitation flow (broker invites property owner)

### Phase C — Advanced
1. Invite Teammates (broker → realtor hierarchy)
2. Role-based visibility (realtors see only their properties)
3. Deal analytics (charts on Deals page)
4. Claim filing form
5. Bulk unit upload for multi-family properties

---

## 8. Key Decisions for User

1. **Auth method**: Supabase Auth (email/password) for MVP? Add Google OAuth later?
2. **Separate Supabase project** or same DB as rentguard-app?
3. **Commission tracking**: Automatic calculation or manual?
4. **Tenant form modification**: Should invited tenants skip property info step (already pre-filled)?
5. **Broker approval**: Auto-approve broker registrations or require admin review?
6. **Port for test app**: `rentguard-app-test` on port 3003?

---

## 9. Files to Create (in `rentguard-app-test/`)

This will be a **copy of `rentguard-app/`** with the broker portal added:

```
rentguard-app-test/
├── supabase/migrations/
│   └── 00004_broker_portal.sql         — New tables
├── src/app/broker/
│   ├── layout.tsx                       — Sidebar + auth guard
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── dashboard/page.tsx
│   ├── properties/page.tsx
│   ├── properties/[id]/page.tsx
│   ├── enroll/page.tsx
│   ├── invite/renter/page.tsx
│   ├── invite/teammate/page.tsx
│   ├── deals/page.tsx
│   ├── resources/page.tsx
│   └── settings/page.tsx
├── src/components/broker/
│   ├── BrokerSidebar.tsx
│   ├── PropertyCard.tsx
│   ├── ProgressStepper.tsx
│   ├── DealTable.tsx
│   ├── InvitationTable.tsx
│   └── StatCard.tsx
├── src/components/emails/
│   ├── BrokerWelcomeEmail.tsx
│   ├── RenterPropertyInviteEmail.tsx
│   └── BrokerStatusUpdateEmail.tsx
├── src/lib/
│   └── broker-auth.ts                  — Supabase auth helpers for broker flow
```
