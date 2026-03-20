# Deferred Tasks Log
_Last updated: 2026-03-17_
_Maintained by Claude. Do not delete — used for cross-session continuity._

---

## PHASE 5: Post-Launch (When Resources Available)

### SMS / WhatsApp Notifications
- **Tool**: Respond.io API
- **Purpose**: Notify tenants and owners of key status changes via SMS/WhatsApp (faster engagement than email)
- **Trigger events**: Pre-approval result, contract ready to sign, payment link, coverage active
- **Why deferred**: Email (Resend) is sufficient for MVP launch; SMS adds cost and integration complexity
- **Estimate**: 2 days
- **Owner**: Claude (next session)

### Stripe Webhook Activation
- **Purpose**: Auto-update application status when payment is confirmed (PAYMENT_PENDING → ACTIVE)
- **Current state**: Webhook route stub created at `/api/webhooks/stripe/route.ts`
- **Trigger**: When `STRIPE_SECRET_KEY` is provided by user
- **Why deferred**: Stripe API key not yet available
- **Estimate**: 1 day once key is provided
- **Owner**: Claude (triggered by user providing Stripe key)

### Deposit Refund Automation
- **Purpose**: Automatically refund deposit to tenant/owner after rental agreement ends
- **Dependency**: Stripe integration (live), agreement end-date tracking
- **Why deferred**: No agreement end-date tracking in place yet
- **Estimate**: 2 days
- **Owner**: Claude (Phase 5+)

### Multi-Underwriter User Accounts
- **Purpose**: Support multiple underwriter users with real login accounts and audit trail
- **Current state**: sessionStorage password gate (ADMIN/ADMIN) — single user only
- **Tool**: Supabase Auth (email/password or magic link)
- **Why deferred**: Single underwriter is sufficient for MVP
- **Estimate**: 2 days
- **Owner**: Claude (Phase 5+)

### TransUnion Credit Bureau Integration
- **Purpose**: Pull actual credit score from TransUnion instead of relying on applicant-reported score
- **Why deferred**: Requires TransUnion API account + compliance setup; applicant-reported score + photo ID sufficient for MVP
- **Estimate**: 3–5 days
- **Owner**: Claude (Phase 5+ or when TransUnion account is established)

### Advanced Cosigner Flow Refinements
- **Purpose**: Allow multiple cosigners, co-renter income blending, cosigner credit check
- **Current state**: Basic cosigner invite flow exists
- **Why deferred**: Basic flow is sufficient for MVP
- **Estimate**: 2 days
- **Owner**: Claude (when underwriter feedback demands it)

### Claims Portal
- **Purpose**: Allow owners/brokers to file rent protection claims when tenant doesn't pay
- **Scope**: Claim form, documentation upload, claim status tracking, payout workflow
- **Why deferred**: No active policies yet (no ACTIVE applications); build when first policy is live
- **Estimate**: 3–4 days
- **Owner**: Claude (post-launch)

### Dropbox Sign Polling → Webhook Upgrade
- **Purpose**: Replace polling for signature status with real Dropbox Sign webhooks
- **Current state**: Basic polling approach in Phase 2 implementation
- **Why deferred**: Polling works for low volume; webhooks are more reliable at scale
- **Estimate**: 1 day
- **Owner**: Claude (Phase 5+)

---

## Technical Debt

### Full SSN Encryption at Rest
- **Purpose**: Encrypt SSN before storing in Supabase (currently stored as plain text in JSONB)
- **Approach**: Use server-side encryption (pgcrypto or client-side encryption before insert)
- **Why deferred**: RLS + Supabase security is acceptable for internal MVP; full encryption is best practice
- **Estimate**: 1 day
- **Owner**: Claude (before production launch)

### Bidirectional CRM Sync
- **Tool**: n8n orchestration platform + Zoho CRM (like Grenty)
- **Purpose**: Sync Portal ↔ CRM in real-time via webhooks (15 events)
- **Why deferred**: Over-engineered for current scale; Supabase is the single source of truth
- **Estimate**: 5+ days
- **Owner**: TBD (Series A+)

### Lead-Gen Workspace Integration
- **Purpose**: Push qualified leads from lead-gen-workspace SQLite into Supabase applications
- **Why deferred**: Integration scope not defined; lead-gen is for prospecting, not application intake
- **Owner**: Antigravity + Claude (when user decides on integration strategy)

### Zoho Books Invoicing
- **Purpose**: Auto-generate invoices for each active policy
- **Why deferred**: Not revenue-critical for MVP; manual tracking is fine initially
- **Owner**: Claude (post-launch when accounting needs arise)

---

## ❌ DON'T BUILD (Unless Product Strategy Changes)

| Task | Reason |
|---|---|
| Mobile app | Web forms work fine; mobile is Series A roadmap |
| Multi-tenant SaaS (Broker manages multiple companies) | Internal tool for now; full multi-tenant is architectural rework |
| Advanced analytics/reporting | Basic charts exist; advanced is post-launch |
| API for third-party integrations | No partner integrations planned |
| White-label product | Requires full rebrand infrastructure |

---
_To add a task: append under the relevant section with status, reason for deferral, estimate, and owner._
