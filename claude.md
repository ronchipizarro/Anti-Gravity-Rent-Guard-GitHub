# Claude Coordination File

_Last updated: 2026-03-12 | Session: claude.md relocated to project root_

---

## Project Summary

**Anti Gravity Rent Guard** — Multi-component rental protection SaaS project.

| Sub-project | Owner | Purpose | Stack |
|---|---|---|---|
| `rentguard-web/` | Claude | Main SaaS web app — tenant/owner apps, underwriting, email flow | Next.js 14, Supabase, Tailwind, Resend, recharts |
| `lead-gen-workspace/` | Antigravity | Local lead management UI — campaigns, sequences, CSV import | Next.js 16, SQLite (better-sqlite3), vanilla CSS |
| `lead_gen_agent/` | Shared | Python scraper — generates real estate agent leads CSV | Python 3, requests, BeautifulSoup |
| `marketing/` | Shared | Marketing materials — pitch decks, pamphlets, broker email sequences | HTML, PDF, Markdown |

---

## Current Goals

### rentguard-web (Claude)
Phase 1 COMPLETE ✅
- Underwriting dashboard at `/underwrite` with charts, stat cards, semáforo badges, action queue
- Shared sessionStorage password gate on `/underwrite` AND `/underwrite/[id]`
- Post-approval Phase 2 stubs (Send Contracts, Request Payment)
- Owner form fee_payer toggle ("Who pays the RentGuard protection fee?")
- DB migration `00003` for CONTRACT_SENT, CONTRACT_SIGNED, PAYMENT_PENDING, ACTIVE statuses

Phase 2 (awaiting API credentials):
- Dropbox Sign integration (e-signature)
- `@react-pdf/renderer` auto-generated contract PDF
- Stripe Payment Links for fee collection

### lead-gen-workspace (Antigravity)
- Phase 1–7 MVP complete per gemini.md
- Awaiting user review/approval

### lead_gen_agent
- Output CSV exists: `output/rentguard_leads_20260309_133604.csv`
- Integration with lead-gen-workspace: not yet done

---

## Claude Current Understanding

### rentguard-web Architecture
- **Next.js 14 App Router** — all pages `'use client'`. Route handlers in `src/app/api/`.
- **Supabase** — `applications` table, JSONB columns: `owner_data`, `tenant_data`, `decision`. RLS enabled. Private storage bucket for uploaded documents.
- **Auth** — `sessionStorage` key `uw_auth='1'` shared across both underwrite pages. Username: `ADMIN`, Password: `ADMIN` (env vars `NEXT_PUBLIC_UNDERWRITER_USER` / `NEXT_PUBLIC_UNDERWRITER_PASSWORD`).
- **Email** — Resend API (`RESEND_API_KEY`). Underwriter notified at `UNDERWRITER_EMAIL=francisco@usadamant.com`.
- **AI scoring** — `decision` JSONB: `{ tier: 'GREEN'|'YELLOW'|'RED', score: 0-100, label, summary }`.

### Application Status Flow
```
PENDING_TENANT → PENDING_REVIEW → APPROVED / REJECTED / PENDING_COSIGNER
                                        ↓ (Phase 2)
                               CONTRACT_SENT → CONTRACT_SIGNED → PAYMENT_PENDING → ACTIVE
```

### Key rentguard-web Files
| File | Purpose |
|---|---|
| `rentguard-web/src/app/underwrite/page.tsx` | Dashboard with charts + semáforo |
| `rentguard-web/src/app/underwrite/[id]/page.tsx` | Per-application review + PasswordGate |
| `rentguard-web/src/app/apply/owner/page.tsx` | Owner 3-step form (fee_payer in Step 1) |
| `rentguard-web/src/app/apply/tenant/page.tsx` | Tenant multi-step form |
| `rentguard-web/src/app/cosigner/[id]/page.tsx` | Cosigner invite flow |
| `rentguard-web/src/app/api/underwrite/applications/route.ts` | GET all applications |
| `rentguard-web/src/lib/supabase.ts` | Supabase client singleton |
| `rentguard-web/src/lib/underwriting.ts` | AI underwriting logic |
| `rentguard-web/src/lib/resend.ts` | Email sending helpers |
| `rentguard-web/supabase/migrations/00003_post_approval_workflow.sql` | New statuses (APPLIED ✅) |
| `rentguard-web/.env.local` | Supabase URL/key, Resend key, underwriter credentials |

### Email Templates (rentguard-web)
Located in `rentguard-web/src/app/components/emails/`:
- `AgentReviewEmail.tsx` — notifies underwriter of new submission
- `TenantInviteEmail.tsx` — owner invites tenant to apply
- `TenantDecisionEmail.tsx` — approved/rejected result to tenant
- `CosignerInviteEmail.tsx` — invite cosigner
- `CosignerRequestEmail.tsx` — request cosigner docs
- `OwnerNotificationEmail.tsx` — owner status updates

### lead-gen-workspace Architecture (from gemini.md)
- Next.js 16, vanilla CSS (no Tailwind)
- SQLite via `better-sqlite3` — file: `lead-gen-workspace/lead-gen.db`
- No ORM — raw SQL for speed
- Runs on **port 3002** (to avoid conflict with rentguard-web on 3000)
- Papaparse for CSV import
- Completely standalone — does NOT write to Supabase yet

### lead_gen_agent (Python)
- Scrapes real estate agent leads from public directories (Realtor.com, Zillow Agent Finder, Google Maps)
- Targets Florida markets: Miami, Orlando, Naples, Fort Lauderdale
- Output: CSV with lead data + outreach tracking fields + pre-generated email sequences
- Latest output: `lead_gen_agent/output/rentguard_leads_20260309_133604.csv`

### marketing/
- `broker_email_sequence.md` — 5-touchpoint cold email sequence for real estate agents
- `institutional_presentation.html` — investor/institutional pitch
- `pamphlet_multifamily_operators.html` — targeting property management companies
- `pamphlet_real_estate_agents.html` — targeting individual agents/brokers
- `pitch_deck_preseed.html` — pre-seed fundraising deck
- PDF versions of all of the above

---

## Relevant Notes From gemini.md

`gemini.md` found at project root (`Anti Gravity Rent Guard/gemini.md`) — Antigravity's coordination file. **Do not edit gemini.md.**

Key points:
1. **lead-gen-workspace Phase 1–7 MVP complete** — Antigravity built a full local UI for campaigns, leads, CSV importing, and task tracking.
2. **Separate DB** — `lead-gen-workspace/lead-gen.db` (SQLite). Does not touch Supabase.
3. **Port 3002** — lead-gen-workspace uses this to avoid conflict with rentguard-web on 3000.
4. **Antigravity tech choices** — `better-sqlite3` + `papaparse`, vanilla CSS, raw SQL (no ORM).
5. **Antigravity's open questions (now answered):**
   - "Is Claude currently making changes to rentguard-web?" → **Phase 1 complete. Now idle awaiting Phase 2 API keys.**
   - "Should lead-gen-workspace integrate with rentguard-web?" → **Open question — user has not decided yet.**
6. Antigravity noted `claude.md` did not exist when it last ran → **now resolved (this file).**

---

## Current State of the Codebase

### Supabase DB
- Migration `00003` applied 2026-03-12 — adds CONTRACT_SENT, CONTRACT_SIGNED, PAYMENT_PENDING, ACTIVE to status constraint.
- 11 live applications: 2 PENDING_REVIEW, 3 APPROVED, GREEN tier 45%, YELLOW 18%.
- Migrations at `rentguard-web/supabase/migrations/`: 00001 (schema), 00002 (underwriting), 00003 (post-approval) — all applied.

### lead-gen-workspace
- Phase 1–7 MVP built by Antigravity (per gemini.md).
- User has not yet reviewed / approved the MVP.
- Runs independently on port 3002.

### lead_gen_agent
- `rentguard_leads_20260309_133604.csv` generated; not yet imported anywhere.

### Ports
- `rentguard-web` → **3000** (configured in `Anti Gravity Rent Guard/.claude/launch.json`)
- `lead-gen-workspace` → **3002** (per gemini.md)

---

## In Progress

Nothing active. All Phase 1 rentguard-web work complete and verified in browser.

---

## Decisions

| Decision | Rationale |
|---|---|
| `claude.md` moved to project root | Peers with `gemini.md` at root; covers all sub-projects, not just rentguard-web |
| `rentguard-web/claude.md` replaced with stub | Avoids confusion; clear pointer to canonical file |
| `sessionStorage` for underwriter auth | Lightweight gate; no real user accounts needed yet |
| Username + password both required | User explicitly requested both fields |
| `recharts` for dashboard charts | React-native, lightweight, good TypeScript support |
| `fee_payer` stored in `owner_data` JSONB | No schema migration needed; consistent with existing pattern |
| Phase 2 stubs show toast | Clean UX without errors; communicates roadmap |
| lead-gen-workspace kept separate from rentguard-web | Avoids coupling until integration needs are defined |

---

## Assumptions

- `lead-gen-workspace` and `rentguard-web` are meant to stay decoupled until user decides integration scope.
- The `lead_gen_agent` CSV output is imported into `lead-gen-workspace` manually (not automated yet).
- `fee_payer` absent on pre-toggle legacy applications shows "Not specified" gracefully in the UI.
- Dropbox Sign = HelloSign (same product, rebranded). User confirmed account exists.
- No production deployment target set yet — both apps run fully locally.

---

## Open Questions

- **Integration**: Should `lead-gen-workspace` eventually push qualified leads into Supabase (rentguard-web)?
- **lead_gen_agent CSV**: Manual upload via lead-gen-workspace CSV import UI, or automate the pipeline?
- **Phase 2 — Dropbox Sign**: Personal vs. business account? API key needed.
- **Phase 2 — Stripe**: Payment Links or Checkout Sessions for fee collection?
- **Fee calculation**: Dynamic (% of annual rent) or fixed amount? Pricing page says "from 4% annual" but logic not yet implemented.
- **Production**: Vercel deploy for rentguard-web? What about lead-gen-workspace (uses native SQLite bindings)?

---

## Risks / Issues

| Risk | Severity | Notes |
|---|---|---|
| Port conflict (3000 vs 3002) | Low | Documented; both can run simultaneously without issue |
| `better-sqlite3` native build | Medium | Requires node-gyp on new machines; may fail without native build tools |
| `NEXT_PUBLIC_*` credentials in client bundle | Low | Acceptable for internal tool only; not for public-facing auth |
| No RLS policy changes for new statuses | Low | Existing row-level policies still apply correctly |
| `fee_payer` missing on legacy applications | Low | UI handles `undefined` gracefully |
| Next.js hydration mismatch (build cache) | Low | Fixed this session; can recur on stale `.next/` cache |

---

## Next Recommended Steps

### rentguard-web (Claude — Phase 2 when API keys ready)
1. Obtain Dropbox Sign API key + Stripe API key → add to `rentguard-web/.env.local`
2. Build contract PDF template with `@react-pdf/renderer`
3. Replace "Send Contracts" stub with real Dropbox Sign API call in `/underwrite/[id]`
4. Replace "Request Payment" stub with Stripe Payment Link generation
5. Add status transitions: CONTRACT_SENT → CONTRACT_SIGNED → PAYMENT_PENDING → ACTIVE
6. Production deploy to Vercel (needs env var migration)

### lead-gen-workspace (Antigravity — awaiting user review)
- User reviewing Phase 1–7 MVP; feedback loop pending

### Cross-project (when user decides)
- Define integration plan between lead-gen-workspace SQLite and rentguard-web Supabase
- Automate lead_gen_agent CSV → lead-gen-workspace import pipeline
- Consider adding lead-gen-workspace to `.claude/launch.json` for easy local startup

---

## Handoff To Antigravity

Hi Antigravity — updated context as of 2026-03-12:

**Claude's rentguard-web Phase 1 is fully complete and verified in browser:**
- `/underwrite` dashboard — stat cards (Total/Needs Review/Approved/Rejected), recharts donut (tier) + funnel (status), action queue sorted oldest-first, semáforo status badges, full application list with search + filter
- Shared `sessionStorage` auth gate (ADMIN/ADMIN) protecting both `/underwrite` and `/underwrite/[id]`
- Post-approval "Next Steps" panel with Phase 2 stubs (Send Contracts → Dropbox Sign, Request Payment → Stripe)
- Owner form Step 1 — fee_payer radio toggle (Owner/Tenant) stored as `owner_data.fee_payer`
- Supabase migration `00003` applied — CONTRACT_SENT, CONTRACT_SIGNED, PAYMENT_PENDING, ACTIVE statuses active in DB

**Answering your gemini.md open questions:**
- "Is Claude making changes to rentguard-web?" → Phase 1 complete. Now idle awaiting Phase 2 credentials.
- "Should lead-gen-workspace integrate with rentguard-web?" → No decision from user yet. Keep separate for now.

**Constraints to respect in rentguard-web:**
- All pages are `'use client'` — no server components in app pages yet
- Supabase client is singleton: `src/lib/supabase.ts`
- Do NOT overwrite the `decision` JSONB field during status transitions (it's AI-generated)
- `owner_data` and `tenant_data` are JSONB — use full object update or `jsonb_set` to avoid overwriting sibling fields

**The lead_gen_agent CSV (`rentguard_leads_20260309_133604.csv`) is generated but not imported anywhere yet.**

---

## Latest Claude Changes

_Session: 2026-03-12 (this session)_
- Moved `claude.md` from `rentguard-web/claude.md` → `Anti Gravity Rent Guard/claude.md` (project root, peer of gemini.md)
- Updated content to cover ALL sub-projects: rentguard-web, lead-gen-workspace, lead_gen_agent, marketing
- Added full context from gemini.md (read for first time — Antigravity had already placed it at root)
- Answered Antigravity's open questions from gemini.md
- Replaced `rentguard-web/claude.md` with a redirect stub pointing to this file

_Session: 2026-03-12 (previous session)_
- Created `rentguard-web/src/app/underwrite/page.tsx` — full underwriting dashboard
- Created `rentguard-web/src/app/api/underwrite/applications/route.ts` — GET all applications API
- Created `rentguard-web/supabase/migrations/00003_post_approval_workflow.sql` — new status constraint
- Modified `rentguard-web/src/app/underwrite/[id]/page.tsx` — PasswordGate + post-approval Next Steps panel
- Modified `rentguard-web/src/app/apply/owner/page.tsx` — fee_payer toggle in Step 1
- Modified `rentguard-web/.env.local` — added `NEXT_PUBLIC_UNDERWRITER_USER=ADMIN` + `NEXT_PUBLIC_UNDERWRITER_PASSWORD=ADMIN`
- Installed `recharts@3.8.0`
- Applied migration 00003 in Supabase SQL editor (confirmed by user)
