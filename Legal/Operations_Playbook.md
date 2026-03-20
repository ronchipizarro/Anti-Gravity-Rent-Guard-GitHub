# RENT GUARD — OPERATIONS PLAYBOOK (MIAMI MVP)

**Version:** 1.0
**Last Updated:** 2026-03-19
**Applies to:** Rent Guard Florida LLC

---

## TEAM ROSTER (MVP)

| Role | Person | Responsibilities | Contact Method |
|------|--------|-----------------|----------------|
| **Underwriter / Claims Manager** | Francisco | Application review (GREEN doc check + YELLOW full review), claim verification, payout approval, escalation decisions | Platform + Email |
| **Underwriter (Backup)** | Guillermo | Same as above — shares ADMIN access to underwriting dashboard | Platform + Email |
| **Sales / Pre-Sales Support** | Santiago (Contractor, Miami-based) | Broker outreach, landlord onboarding, pre-sales queries (pricing, process, timelines), WhatsApp front-line | WhatsApp + Email |
| **Legal Partner** | TBD (FL eviction attorney) | Signs all pleadings, court appearances, eviction filings, legal advice | Flat-fee per case |
| **Collection Agency A** | TBD | Post-default debt recovery (contingency, 25-35%) | Per-account placement |
| **Collection Agency B** | TBD | Post-default debt recovery (split portfolio to benchmark) | Per-account placement |

**Underwriter email notifications:** Both Francisco and Guillermo receive all underwriter alert emails (AgentReviewEmail, claim notifications, status changes).
*Code change required: update `UNDERWRITER_EMAIL` to support comma-separated addresses or add `UNDERWRITER_EMAIL_CC`.*

---

## PART 1: APPLICATION & UNDERWRITING

### 1.1 Application Flow

```
Owner applies (app.rentguard.com/apply/owner)
    → Tenant receives invite email (TenantInviteEmail)
    → Tenant applies (app.rentguard.com/apply/tenant)
    → AI scores application (5-rule engine)
    → Status: PENDING_REVIEW
    → Underwriter notified (AgentReviewEmail → Francisco + Guillermo)
    → Human review (see Checklists below)
    → Decision: APPROVED / REJECTED / PENDING_COSIGNER
```

### 1.2 Underwriter Review SLA

| Tier | AI Action | Human Review Required | Target SLA |
|------|-----------|----------------------|------------|
| **GREEN (80-100)** | Auto-pre-approved | Yes — document verification checklist (see Underwriting_Checklists.md) | 24 hours |
| **YELLOW (50-79)** | Flagged for review | Yes — full manual underwriting checklist | 48 hours |
| **RED (<50)** | Auto-rejected | No (unless landlord requests exception) | Immediate |

### 1.3 Post-Approval Flow

```
APPROVED
    → Send Protection Agreement via Dropbox Sign (3 parties)
    → Status: CONTRACT_SENT
    → Wait for all signatures (reminder at 48h if unsigned)
    → Status: CONTRACT_SIGNED
    → Send payment request (Stripe Payment Link) to designated fee payer
    → Status: PAYMENT_PENDING
    → Payment confirmed (Stripe webhook)
    → Status: ACTIVE
    → Owner + Tenant notified (ActiveEmail)
```

---

## PART 2: DEFAULT DETECTION & RECOVERY

### 2.1 Timeline Overview

```
Day 0:  Rent due date
Day 3:  SERVICE ACTIVATION EVENT (rent unpaid 3+ days)
Day 3:  Auto-serve FL 3-Day Notice to Pay or Quit
Day 4-7:  Soft recovery outreach (SMS/WhatsApp/phone)
Day 7:  Formal demand if no cure
Day 8-10: Last chance cure window
Day 11:  Claim verified, payout process begins
Day 15:  Landlord payout (within 7 business days of verification)
Day 16:  Legal handover to FL eviction attorney
Day 16-45: Eviction proceedings
Day 30+:  Tenant debt referred to collection agency
```

### 2.2 Phase 1: Detection (Day 0-3)

**Trigger:** Rent due date passes. Tenant has not paid.

| Day | Action | Owner | Method | Template |
|-----|--------|-------|--------|----------|
| 0 | Rent due date — monitor for payment confirmation | System | Automated | — |
| 1 | If no payment detected: internal flag "Payment Delayed" | System | Automated | — |
| 3 | **SERVICE ACTIVATION EVENT** — grace period expired | System | Automated | — |
| 3 | Notify landlord: "We have detected a payment delay. Rent Guard is initiating the recovery protocol." | System | Email + WhatsApp | *Template D-1* |
| 3 | Auto-prepare and serve **FL 3-Day Notice to Pay Rent or Deliver Possession** in Landlord's name via POA | Francisco/Guillermo | Per FL § 83.56(3) | See `FL_3Day_Notice_Template.md` |

**3-Day Notice Service Methods (FL § 83.56(3)):**
- Personal delivery to Tenant, OR
- Leaving at the residence in the presence of a household member age 15+, OR
- Posting on the Property door + mailing by first-class mail

**Document:** Keep proof of service (photo of posted notice with timestamp, certified mail receipt, or witness affidavit).

### 2.3 Phase 2: Soft Recovery (Day 4-10)

**Goal:** Recover payment without legal action. Most defaults are resolved in this phase.

| Day | Action | Owner | Method | Template |
|-----|--------|-------|--------|----------|
| 4 | Soft outreach to Tenant: "Hey [Name], it looks like your rent payment is overdue. Can we help resolve this today?" | Santiago | SMS/WhatsApp | *Template R-1* |
| 5 | Follow-up call if no response | Santiago | Phone call | *Script R-2* |
| 5 | If tenant responds with hardship claim: evaluate one-time **Cure Offer** (5-day payment plan) | Francisco | Email | *Template R-3* |
| 7 | If no cure: send formal demand letter to Tenant | Francisco | Email + certified mail | *Template R-4* |
| 7 | 3-Day Notice expires — Tenant has failed to pay or vacate | — | — | — |
| 8-10 | Final cure window. If tenant pays in full: close case, notify landlord, status returns to ACTIVE | Francisco | Platform | — |

**Cure Offer Rules:**
- Maximum ONE cure offer per tenant per policy term
- Cure must be full payment within 5 calendar days
- Cure must include any late fees under the Lease
- Cure offer requires Francisco's approval (not Santiago)
- If cure is accepted and tenant pays: case closed, no claim, landlord notified
- If cure is accepted and tenant fails to pay by deadline: immediate escalation to Phase 3

### 2.4 Phase 3: Claim & Payout (Day 11-15)

**Trigger:** Tenant has not cured. 3-Day Notice has expired. Recovery has failed.

| Day | Action | Owner | Method |
|-----|--------|-------|--------|
| 11 | Landlord submits formal Claim (or Rent Guard initiates on landlord's behalf if auto-detection) | Landlord / Francisco | Platform form or email to claims@rentguard.com |
| 11 | Verify claim using **Claim Verification Checklist** (see below) | Francisco/Guillermo | Internal |
| 11-13 | Claim verified (5 business day window, but target 2-3 days) | Francisco/Guillermo | Internal |
| 13-15 | **Disburse Protected Funds to Landlord** via ACH or Zelle (within 7 business days of verification) | Francisco | Bank transfer |
| 15 | Notify landlord: payout sent, confirmation details | System | Email |
| 15 | Tenant status changed to **DEFAULTER** — revoked from future Rent Guard services | Francisco | Platform |
| 15 | Subrogation activated: Rent Guard now owns the debt | Automatic | Per contract Art. VII |

### 2.5 Phase 4: Legal Action (Day 16+)

**Trigger:** Payout made. Tenant has not vacated. Eviction required.

| Day | Action | Owner | Method |
|-----|--------|-------|--------|
| 16 | Hand file to FL eviction attorney: lease, 3-Day Notice proof of service, payment records, Protection Agreement | Francisco | Email to attorney |
| 16-18 | Attorney files eviction complaint (Summary Procedure, § 51.011) | FL Attorney | Court filing |
| 18-25 | Service of process on Tenant | Process server | Personal/posting |
| 25-30 | If Tenant doesn't answer/deposit rent in Court Registry → motion for default judgment | FL Attorney | Court |
| 30-45 | Writ of possession issued and executed by Sheriff | FL Attorney + Sheriff | Court order |

**Francisco's role during eviction:**
- Provide documents to attorney as requested
- Approve any settlement offers (POA gives us authority, but Francisco makes the business decision)
- Track timeline and costs (eviction costs are part of Protected Funds, subject to Aggregate Cap)

**Landlord's role:** None. Per contract Art. 5.3, Rent Guard has exclusive eviction authority. Landlord must not interfere or settle independently.

### 2.6 Phase 5: Debt Collection (Day 30+)

**Trigger:** Subrogation active. Tenant owes Rent Guard the payout amount + 18% interest + costs.

| Step | Action | Owner | Method |
|------|--------|-------|--------|
| 1 | Send initial collection demand letter to Tenant (FDCPA-compliant, Mini-Miranda) | Francisco | Certified mail + email (see `Collection_Letter_Templates.md`) |
| 2 | Wait 30 days for Tenant to dispute or pay | — | — |
| 3 | If no response: refer account to **Collection Agency A or B** (split portfolio for benchmarking) | Francisco | Agency placement form |
| 4 | Provide agency with: Protection Agreement, proof of payout, debt ledger, tenant contact info + alternative contacts + employer info | Francisco | Email/portal |
| 5 | Agency handles: demand letters, phone calls, skip-tracing, credit reporting, payment plans | Agency | Per agency agreement |
| 6 | If agency recommends litigation (debt >$2,500): evaluate cost vs. recovery likelihood | Francisco + Agency | Conference call |
| 7 | Track recovery amounts. Agency remits collected funds minus commission (25-35%) | Agency | Monthly remittance |

**Collection Agency Split Strategy:**
- Place 50% of accounts with Agency A, 50% with Agency B
- After 6 months, compare: recovery rate, speed, tenant complaints, communication quality
- Consolidate to the better performer, or keep split if both perform well

### 2.7 Phase 6: Post-Default Audit

**Trigger:** Case closed (tenant vacated, debt collected or written off).

| Action | Owner |
|--------|-------|
| Review AI score vs. actual outcome — was the tenant correctly scored? | Francisco/Guillermo |
| If pattern detected (e.g., job type, area, income source): flag for underwriting rule adjustment | Francisco |
| Update risk model parameters if needed | Francisco |
| Document lessons learned in internal log | Francisco |
| If fraud suspected (fake application data): flag for potential criminal referral | Francisco |

---

## PART 3: CLAIM SUBMISSION & VERIFICATION

### 3.1 Claim Submission — Option A: Platform Form

**URL:** `app.rentguard.com/claims/submit` (to be built)

**Required fields:**

| Field | Type | Validation |
|-------|------|------------|
| Property address | Text (pre-filled from application) | Must match active policy |
| Tenant name | Text (pre-filled) | Must match active policy |
| Lease agreement reference | Auto-linked | From application record |
| Date rent was due | Date picker | Cannot be future date |
| Amount unpaid | Currency | Must match or be less than monthly base rent on file |
| Partial payment received? | Yes/No | If Yes: amount field appears |
| 3-Day Notice served? | Yes/No + date | If No: explain (Rent Guard may have auto-served) |
| Has landlord accepted any payment from tenant since default? | Yes/No | If Yes: claim may be denied per Art. 5.2(a) |
| Has landlord entered any side agreement with tenant? | Yes/No | If Yes: claim denied per Art. 5.2(b) |
| Supporting documents upload | File upload (PDF/JPG/PNG) | Bank statement showing missed payment, any correspondence with tenant |
| Landlord declaration checkbox | Checkbox | "I declare that the above is true and that I have not accepted partial payment or settled with the tenant." |

### 3.2 Claim Submission — Option B: Email

**To:** claims@rentguard.com
**Subject line:** CLAIM — [Property Address]

**Required in email:**
1. Property address and tenant name
2. Date rent was due and amount unpaid
3. Confirmation that no partial payment was accepted
4. Attachments: bank statement showing missed payment, copy of 3-Day Notice (if landlord served it)

*Claims team (Francisco/Guillermo) manually enters email claims into the Platform for tracking.*

### 3.3 Claim Verification Checklist

Before approving any claim for payout, verify ALL of the following:

**Identity & Policy Check:**
- [ ] Claim is from the landlord on file (verify email/identity)
- [ ] Active policy exists for this property (status = ACTIVE)
- [ ] Policy has not been terminated or suspended
- [ ] Claim submitted within 10 calendar days of missed payment (Art. 4.1)

**Default Verification:**
- [ ] Rent due date confirmed against lease terms on file
- [ ] Amount claimed matches base rent in lease/application
- [ ] Bank statement or payment platform confirms no payment received
- [ ] No partial payment accepted by landlord (Art. 5.2(a))
- [ ] No Accumulated Default — unpaid amount does not exceed 1 month's rent at time of claim (Art. 3.4)
- [ ] Landlord reported within 30 days of first missed payment (Art. 3.4)

**3-Day Notice Check:**
- [ ] FL 3-Day Notice to Pay Rent or Deliver Possession was served
- [ ] Notice was served in compliance with FL § 83.56(3) (personal delivery, posting + mail, or household member)
- [ ] Proof of service exists (photo with timestamp, certified mail receipt, or affidavit)
- [ ] 3-day period has expired without cure

**Fraud Screening:**
- [ ] No evidence of landlord-tenant collusion (e.g., landlord and tenant at same address, related parties, recent lease modifications)
- [ ] Landlord has not independently filed for eviction or settled (Art. 5.2(b))
- [ ] Tenant's application data was not flagged for fraud during underwriting
- [ ] Property address confirms to be a real residential property

**Exclusion Check:**
- [ ] Claimed amount is NOT for any excluded item (Art. 3.3): utilities, deposits, HOA, damages, fines, etc.
- [ ] No Force Majeure event in effect (e.g., FL eviction moratorium)
- [ ] Claim does not exceed Aggregate Cap (Art. 3.2)

**Approval:**
- [ ] **APPROVED** — all checks passed → proceed to payout
- [ ] **DENIED** — specify reason, notify landlord with denial explanation
- [ ] **PENDING** — additional documentation needed → request from landlord (5 business day deadline)

**Approver signature:** _________________ Date: _________

---

## PART 4: COMMUNICATION TEMPLATES

### Template D-1: Landlord Default Notification

**Channel:** Email + WhatsApp
**Trigger:** Day 3 — Service Activation Event detected

> Subject: Rent Guard Alert — Payment Delay Detected at [PROPERTY ADDRESS]
>
> Dear [LANDLORD NAME],
>
> We have detected that the rent payment due on [DUE DATE] for your property at [PROPERTY ADDRESS] has not been received from [TENANT NAME].
>
> **Rent Guard is now initiating our recovery protocol.** Here is what happens next:
>
> 1. We have served (or are serving) a Florida 3-Day Notice to Pay Rent or Deliver Possession on your behalf.
> 2. Our team will attempt direct outreach to the tenant to resolve this quickly.
> 3. If the tenant does not cure the default, we will process your claim and disburse Protected Funds to you.
>
> **Important reminders:**
> - **Do NOT accept any partial payment** from the tenant without our written consent.
> - **Do NOT contact the tenant** about this default or attempt to settle independently.
> - Rent Guard has exclusive authority over the resolution process per your Protection Agreement.
>
> We will keep you updated at every step. If you have questions, reply to this email or message us on WhatsApp.
>
> — Rent Guard Team

### Template R-1: Tenant Soft Outreach (SMS/WhatsApp)

**Channel:** SMS or WhatsApp
**Trigger:** Day 4
**Sender:** Santiago

> Hi [TENANT FIRST NAME], this is Santiago from Rent Guard. It looks like the rent payment due on [DATE] for [PROPERTY ADDRESS] hasn't gone through yet. Is everything okay? We'd like to help resolve this as quickly as possible. Please give us a call or reply here. Thanks!

### Script R-2: Tenant Phone Call

**Channel:** Phone
**Trigger:** Day 5 (if no response to R-1)
**Caller:** Santiago

> "Hi [TENANT NAME], this is Santiago calling from Rent Guard regarding your rent at [PROPERTY ADDRESS]. I'm reaching out because the payment due on [DATE] hasn't been received. I wanted to check in — is there an issue with the payment? ... [Listen] ... We want to work with you to resolve this. If you're able to make the payment today or within the next few days, we can help keep this from escalating. Can we set up a payment plan or is there anything we can do to help?"

**If tenant commits to paying:** Get a specific date. Follow up on that date. If they don't pay, escalate to Phase 3.
**If tenant is unresponsive/hostile:** Document the call. Escalate to Francisco.
**If tenant claims hardship:** Offer to have Francisco evaluate a Cure Offer (Template R-3).

### Template R-3: Cure Offer

**Channel:** Email
**Trigger:** Day 5-7, after hardship claim, approved by Francisco
**Sender:** Francisco

> Subject: Rent Guard — One-Time Payment Arrangement for [PROPERTY ADDRESS]
>
> Dear [TENANT NAME],
>
> We understand you're experiencing temporary difficulty with your rent payment at [PROPERTY ADDRESS]. Rent Guard is offering you a **one-time payment arrangement** under the following terms:
>
> - **Total amount due:** $[AMOUNT] (base rent of $[RENT] + any applicable late fees under your lease)
> - **Payment deadline:** [DATE — 5 calendar days from this email]
> - **Payment method:** [Provide Zelle/ACH instructions or Stripe link]
>
> **This offer is a one-time courtesy.** If payment is not received in full by [DEADLINE DATE], the offer is withdrawn and Rent Guard will proceed with the formal claim and eviction process as provided in your Rent Protection Services Agreement.
>
> This is a one-time arrangement and will not be available again during the term of your lease.
>
> Please confirm receipt of this email and your intention to pay by replying here.
>
> — Francisco
> Rent Guard LLC

### Template R-4: Formal Demand (Pre-Claim)

**Channel:** Email + certified mail
**Trigger:** Day 7, no cure received
**Sender:** Francisco

> Subject: FORMAL DEMAND — Unpaid Rent at [PROPERTY ADDRESS]
>
> Dear [TENANT NAME],
>
> This letter serves as formal notice that you have failed to pay rent in the amount of **$[AMOUNT]** due on **[DUE DATE]** for the property located at **[PROPERTY ADDRESS]**, Florida.
>
> A Florida 3-Day Notice to Pay Rent or Deliver Possession was served on you on [NOTICE DATE]. The 3-day period has expired and you have not paid or vacated the premises.
>
> **You are hereby notified that:**
>
> 1. Rent Guard LLC, as Service Provider under the Rent Protection Services Agreement dated [DATE], will proceed with claim processing and disbursement of Protected Funds to your landlord.
> 2. Upon payment to your landlord, Rent Guard LLC is **automatically subrogated** to all of the landlord's rights against you, including the right to recover the full amount paid, plus **18% annual interest**, plus all attorneys' fees, court costs, and collection costs.
> 3. Rent Guard LLC will initiate **eviction proceedings** through licensed Florida counsel if you do not vacate the property.
> 4. Your default may be reported to **consumer credit reporting agencies** (Equifax, Experian, TransUnion).
> 5. Your account may be referred to a **licensed collection agency** for recovery.
>
> You may avoid these consequences by paying the full amount of **$[AMOUNT]** by **[FINAL DEADLINE — Day 10]**. Payment should be made to:
>
> [ACH/Zelle payment instructions]
>
> If you have questions, contact us at [support@rentguard.com] or [PHONE].
>
> — Francisco
> Rent Guard LLC
> [BUSINESS ADDRESS]

### Template P-1: Landlord Payout Notification

**Channel:** Email
**Trigger:** Payout sent (Day 13-15)

> Subject: Rent Guard — Protected Funds Disbursed for [PROPERTY ADDRESS]
>
> Dear [LANDLORD NAME],
>
> We have disbursed **$[AMOUNT]** in Protected Funds to your bank account on file for the tenant default at [PROPERTY ADDRESS].
>
> **Payment details:**
> - Amount: $[AMOUNT]
> - Method: [ACH / Zelle]
> - Date sent: [DATE]
> - Expected arrival: [1-3 business days for ACH / instant for Zelle]
> - Reference: [TRANSACTION ID]
>
> **What happens next:**
> 1. Rent Guard is now subrogated to your rights against [TENANT NAME] for the amount paid.
> 2. Our legal team will manage eviction proceedings. **You do not need to take any action.**
> 3. Do not accept any payments from the tenant — all funds owed are now payable to Rent Guard.
> 4. We will keep you updated on the eviction timeline.
>
> If the tenant remains in the property next month and rent is again unpaid, submit a new claim through the Platform or email claims@rentguard.com.
>
> Thank you for being a Rent Guard partner.
>
> — Rent Guard Team

---

## PART 5: PAYOUT PROCEDURES

### 5.1 Payout Method

| Method | When to Use | How |
|--------|-------------|-----|
| **ACH Transfer** | Standard payout (default) | From FL LLC business bank account. Requires landlord's routing + account number (collected at onboarding). 1-3 business days. |
| **Zelle** | Urgent payout or small amounts | From FL LLC business bank account. Requires landlord's email or phone linked to Zelle. Instant. Daily limits may apply ($2,500-5,000). |

**Per the Protection Agreement (Art. 4.3(b)):** Service Provider selects the payout method at its sole discretion. Payout within 7 business days of claim verification.

### 5.2 Payout Approval Workflow

1. Claim passes Verification Checklist (Part 3) → Francisco or Guillermo signs off
2. Francisco initiates transfer from FL LLC bank account
3. Record in Platform: payout date, amount, method, transaction ID
4. Send Landlord Payout Notification (Template P-1)
5. Update application status to reflect payout

### 5.3 Banking Information Collection

Landlord banking info (for ACH payouts) should be collected during onboarding:
- **Add to owner application form:** Bank name, routing number, account number, account holder name
- **Or collect post-approval:** During contract signing, include banking details as a required field
- **For Zelle:** Collect the email or phone number linked to the landlord's Zelle account

*Code change required: add banking info fields to owner application or post-approval onboarding flow.*

---

## PART 6: ONGOING MONITORING

### 6.1 Daily Tasks (Francisco or Guillermo)

- [ ] Check underwriting dashboard for new PENDING_REVIEW applications
- [ ] Review any pending claims
- [ ] Check for unsigned contracts >48 hours (signing reminders)
- [ ] Review any collection agency updates

### 6.2 Weekly Tasks

- [ ] Review active policy count and exposure (total potential payout liability)
- [ ] Check Service Fund balance vs. exposure ratio (target: 3x monthly exposure minimum)
- [ ] Review any tenant cure arrangements — are they on track?
- [ ] Santiago sync: lead pipeline, broker feedback, support issues

### 6.3 Monthly Tasks

- [ ] Reconcile payouts: total paid out vs. total collected (Service Fees + recovered debts)
- [ ] Review collection agency performance (if accounts placed)
- [ ] Update risk model if any defaults occurred
- [ ] Financial report: revenue (fees), expenses (payouts + legal + operations), net margin

---

## APPENDIX: KEY CONTACTS

| Role | Name | Contact | Status |
|------|------|---------|--------|
| Underwriter 1 | Francisco | [email] | Active |
| Underwriter 2 | Guillermo | [email] | Active |
| Sales / Support | Santiago | [WhatsApp] [email] | Contractor (Miami) |
| FL Eviction Attorney | TBD | | Engage before launch |
| Collection Agency A | TBD | | Engage before first default |
| Collection Agency B | TBD | | Engage before first default |
| Registered Agent (FL) | TBD | | Needed at LLC formation |
| CPA / Accountant | TBD | | Needed for tax returns |

---

## APPENDIX: CODE CHANGES NEEDED

| Change | File / Area | Priority |
|--------|------------|----------|
| Dual underwriter email (Francisco + Guillermo) | `rentguard-app/src/lib/resend.ts` — support multiple UNDERWRITER_EMAIL addresses | High (before launch) |
| Claim submission form | New route: `app.rentguard.com/claims/submit` | Medium (can use email Option B for MVP) |
| Banking info fields on owner application | `rentguard-app/src/app/apply/owner/page.tsx` — add routing/account/Zelle fields | High (needed for payouts) |
| Claim tracking in dashboard | Extend underwriter dashboard with claims tab | Medium |
