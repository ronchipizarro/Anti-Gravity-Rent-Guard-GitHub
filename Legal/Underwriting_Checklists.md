# RENT GUARD — UNDERWRITING APPROVAL CHECKLISTS

**Version:** 1.0
**Last Updated:** 2026-03-19

These checklists are used by the underwriting team (Francisco / Guillermo) to review applications before final approval. GREEN-tier applications are auto-pre-approved by the AI engine but **require human document verification** before confirmation. YELLOW-tier applications require full manual review.

---

## GREEN TIER (AI Score 80-100) — Document Verification Checklist

**Purpose:** The AI has pre-approved this application based on reported data. This checklist ensures the supporting documents match what was reported and catches fraud or errors the AI cannot detect.

**SLA:** Complete within 24 hours of AI pre-approval.

### A. Identity Verification

- [ ] **Photo ID uploaded** and legible (driver's license, passport, or state ID)
- [ ] Name on ID matches tenant name on application
- [ ] Photo on ID is plausible (not obviously fake or stock photo)
- [ ] ID is not expired
- [ ] Address on ID is consistent with information provided (current or previous address)

### B. Income Verification

- [ ] **Employment document uploaded** (pay stub, employment letter, or bank statements)
- [ ] Employer name matches what tenant reported in application
- [ ] Income amount on documents is consistent with reported monthly income
- [ ] Income meets minimum threshold: **3x monthly rent** for GREEN tier
- [ ] Document is recent (within last 60 days)
- [ ] No signs of document alteration (mismatched fonts, alignment issues, blurry edits)

### C. Lease Verification

- [ ] Lease provided by landlord matches property address in application
- [ ] Monthly rent in lease matches amount in application
- [ ] Lease dates match (start date, end date)
- [ ] Tenant name in lease matches applicant
- [ ] Lease is fully executed (signed by both landlord and tenant)
- [ ] No unusual clauses that would affect protection (e.g., month-to-month with 30-day termination, sublease arrangements)

### D. Eviction & Credit Check

- [ ] Tenant reported **no prior evictions** — cross-reference if public records check is available
- [ ] Self-reported credit score is consistent with expected range for GREEN tier (typically 670+)
- [ ] If credit pull was performed: verify score matches or is close to self-reported
- [ ] No bankruptcies or outstanding judgments visible in credit report (if pulled)

### E. Fraud Red Flags

Check for ANY of the following. If present, **escalate to YELLOW review** regardless of AI score:

- [ ] Photo ID appears altered, low quality, or is a photo of a screen
- [ ] Pay stub has formatting inconsistencies (different fonts, misaligned numbers, blurry sections)
- [ ] Employer cannot be verified (no web presence, disconnected phone, very new business)
- [ ] Landlord and tenant share a last name, address, phone number, or email domain
- [ ] Application was submitted unusually fast (all 3 steps completed in <5 minutes)
- [ ] Multiple applications from same IP address or device
- [ ] Income documents show round numbers that don't match typical pay periods
- [ ] Tenant provided a P.O. Box as their current address
- [ ] Emergency contact / alternative contact appears to be the landlord

### F. Decision

- [ ] **APPROVED** — All checks passed. Proceed to contract generation.
- [ ] **ESCALATED TO YELLOW REVIEW** — Red flag(s) detected. Apply full YELLOW checklist below.
- [ ] **REJECTED** — Document fraud confirmed or documents do not support reported data.
- [ ] **PENDING DOCUMENTS** — Missing or illegible documents. Request re-upload from tenant (set 48-hour deadline).

**Reviewer:** _________________ **Date:** _________ **Decision:** _________

---

## YELLOW TIER (AI Score 50-79) — Full Manual Review Checklist

**Purpose:** The AI has flagged this application as medium risk. The underwriter performs a complete manual assessment to determine if the risk is acceptable, if a cosigner should be required, or if the application should be rejected.

**SLA:** Complete within 48 hours of AI scoring.

### A. All GREEN Checklist Items (Above)

- [ ] Complete the entire GREEN checklist (Sections A-E) first. All items must pass before proceeding.

### B. Deep Income Analysis

- [ ] Calculate actual income-to-rent ratio from documents (not self-reported)
  - Ratio: $_________ income / $_________ rent = _________x
  - Minimum for YELLOW approval: **2.5x rent**
  - If below 2.5x: **REJECT** or require cosigner
- [ ] If self-employed: review 2+ months of bank statements for income consistency
- [ ] Check for income volatility (commission-based, gig work, seasonal employment)
  - If highly variable: average last 3 months. Use the lowest month if significantly different.
- [ ] Verify employment tenure
  - < 6 months at current employer: elevated risk — document reason (new job vs. job hopping)
  - If < 3 months: consider requiring cosigner

### C. Credit Deep Dive

- [ ] Review full credit report (if available, not just score)
- [ ] Check for:
  - [ ] Collections accounts — how many, how recent, amounts
  - [ ] Late payments — pattern vs. one-time (mortgage late payments are worse than credit card)
  - [ ] Credit utilization — over 80% is a red flag
  - [ ] Recent hard inquiries — many in short period suggests financial stress
  - [ ] Public records — tax liens, judgments, bankruptcies
- [ ] Self-reported credit score vs. actual: if discrepancy >50 points, flag as potential misrepresentation

### D. Eviction History Deep Dive

- [ ] If tenant reported prior eviction: review details
  - How recent? (>5 years ago = less concerning, <2 years = high risk)
  - Was it a default or a landlord dispute? (tenant's explanation)
  - Was there a judgment? Amount?
- [ ] If public records show eviction history that tenant did NOT disclose: **REJECT for misrepresentation** (per contract Art. 5.4(a))
- [ ] Check county court records (Miami-Dade Clerk) for any eviction filings involving tenant name

### E. Property & Lease Analysis

- [ ] Is the rent amount reasonable for the area? (If rent is significantly above market, could indicate inflated lease for fraud)
- [ ] Lease term: is it at least 12 months? (Short leases increase risk)
- [ ] Are there any lease addenda or modifications? (Must be disclosed to Rent Guard)
- [ ] Who is the landlord? (Individual vs. management company — verify identity)

### F. Cosigner Evaluation

If any of the following are true, **require a cosigner** before approval:

- [ ] Income-to-rent ratio is 2.0x - 2.5x
- [ ] Employment tenure < 6 months
- [ ] Prior eviction within last 3 years
- [ ] Credit score below 600
- [ ] Multiple collections accounts (3+)
- [ ] Self-employed with inconsistent income

If cosigner is required:
- [ ] Send CosignerRequestEmail to tenant
- [ ] Set status to PENDING_COSIGNER
- [ ] Cosigner must meet GREEN-tier standards independently

### G. Risk Pricing

If approving a YELLOW application:

- [ ] Confirm Service Fee tier: **6-8% of annual rent** (per tiered pricing proposal)
- [ ] Higher risk within YELLOW → price toward 8%
- [ ] Lower risk within YELLOW (score 70-79, minor issues only) → price toward 6%
- [ ] Document pricing rationale: _______________________________________________

### H. Decision

- [ ] **APPROVED** — Risk acceptable. Specify Service Fee %: _________%
- [ ] **APPROVED WITH COSIGNER** — Cosigner required. Set status to PENDING_COSIGNER.
- [ ] **REJECTED** — Risk too high. Specify primary reason: _________________________
- [ ] **PENDING** — Additional information needed. Specify: _________________________

**Reviewer:** _________________ **Date:** _________ **Decision:** _________

---

## RED TIER (AI Score <50) — Auto-Reject Protocol

**No manual review required** unless the landlord specifically requests an exception.

### Standard Process:
1. AI auto-rejects the application
2. Send TenantDecisionEmail (rejection) — include adverse action notice if credit was a factor (FCRA)
3. Send OwnerNotificationEmail (tenant rejected)
4. Optional: offer landlord the **Security Deposit Management** service ($99 flat fee, no protection)

### Exception Process (Landlord Request Only):
If a landlord specifically asks for an exception for a RED-tier tenant:
1. Perform full YELLOW checklist
2. Price at maximum tier (8%+ of annual rent) or reject
3. Require cosigner in all cases
4. Francisco must personally approve — Guillermo cannot approve RED exceptions
5. Document the exception rationale in the application notes

---

## ADVERSE ACTION NOTICE (FCRA Requirement)

If an application is denied or placed in a higher-risk tier **based in whole or in part on information from a consumer report** (credit report), provide the following to the tenant:

> **ADVERSE ACTION NOTICE**
>
> Dear [TENANT NAME],
>
> We regret to inform you that your application for Rent Guard protection services for the property at [PROPERTY ADDRESS] has been [DENIED / PLACED IN A HIGHER-RISK CATEGORY REQUIRING ADDITIONAL FEES OR A COSIGNER].
>
> This decision was based, in whole or in part, on information obtained from the following consumer reporting agency:
>
> **[AGENCY NAME]**
> [Agency Address]
> [Agency Phone]
>
> The consumer reporting agency did not make this decision and is unable to provide you with the specific reasons for it.
>
> **Your rights under the Fair Credit Reporting Act (FCRA):**
> - You have the right to obtain a **free copy** of your consumer report from the above agency within 60 days of this notice.
> - You have the right to **dispute** the accuracy or completeness of any information in your report directly with the consumer reporting agency.
> - You have the right to a **description of your rights** under the FCRA, available at consumerfinance.gov.
>
> If you have questions about this decision, contact us at [support@rentguard.com].
>
> — Rent Guard LLC

**This notice must be sent whenever credit information influences the decision. It is a federal legal requirement, not optional.**
