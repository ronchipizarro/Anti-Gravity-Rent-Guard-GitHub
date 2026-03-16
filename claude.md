# Claude Coordination File

_Last updated: 2026-03-16 | Session: rentguard-web split into marketing + app sites_

---

## Project Summary

**Anti Gravity Rent Guard** — Multi-component rental protection SaaS project.

| Sub-project | Owner | Purpose | Stack |
|---|---|---|---|
| `rentguard-web/` | Claude | Marketing site (rentguard.com) — SEO landing pages only | Next.js 14, Tailwind, clsx, lucide-react |
| `rentguard-app/` | Claude | Application portal (app.rentguard.com) — tenant/owner apps, underwriting, email flow | Next.js 14, Supabase, Tailwind, Resend, recharts |
| `lead-gen-workspace/` | Antigravity | Local lead management UI — campaigns, sequences, CSV import | Next.js 16, SQLite (better-sqlite3), vanilla CSS |
| `lead_gen_agent/` | Shared | Python scraper — generates real estate agent leads CSV | Python 3, requests, BeautifulSoup |
| `marketing/` | Shared | Marketing materials — pitch decks, pamphlets, broker email sequences | HTML, PDF, Markdown |

---

## Current Goals

### rentguard-web + rentguard-app (Claude)
Site Split COMPLETE ✅ (2026-03-16)
- `rentguard-web` is now a pure marketing site (no app routes, no Supabase/Resend deps)
- `rentguard-app` is a new Next.js project with all application pages and API routes
- Both run locally: web on port 3000, app on port 3001
- Cross-links use env vars: `NEXT_PUBLIC_APP_URL` (web→app) and `NEXT_PUBLIC_MARKETING_URL` (app→web)
- `rentguard-web` has sitemap.ts, robots.ts, metadataBase SEO improvements

Phase 1 COMPLETE ✅ (2026-03-12)
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

### rentguard-web Architecture (Marketing Site — port 3000)
- **Next.js 14 App Router** — Server Components only (no `'use client'` on pages).
- **Routes**: `/`, `/landlords`, `/tenants`, `/brokers` — marketing pages only.
- **No backend deps** — no Supabase, Resend, recharts, uuid. Deps: `next`, `react`, `react-dom`, `tailwind-merge`, `clsx`, `lucide-react`.
- **SEO** — `metadataBase`, `alternates.canonical`, `openGraph`, `twitter` in `layout.tsx`. `sitemap.ts` + `robots.ts` built-in routes.
- **Env vars**: `NEXT_PUBLIC_APP_URL=http://localhost:3001` (prod: `https://app.rentguard.com`), `NEXT_PUBLIC_SITE_URL=http://localhost:3000`.
- **CTA links** — All "Apply" buttons link to `${APP_URL}/apply/...` (cross-domain `<a>` or `<Link>`).

### rentguard-app Architecture (Application Portal — port 3001)
- **Next.js 14 App Router** — `'use client'` pages. Route handlers in `src/app/api/`.
- **Supabase** — `applications` table, JSONB columns: `owner_data`, `tenant_data`, `decision`. RLS enabled. Private storage bucket for uploaded documents.
- **Auth** — `sessionStorage` key `uw_auth='1'` shared across both underwrite pages. Username: `ADMIN`, Password: `ADMIN` (env vars `NEXT_PUBLIC_UNDERWRITER_USER` / `NEXT_PUBLIC_UNDERWRITER_PASSWORD`).
- **Email** — Resend API (`RESEND_API_KEY`). Underwriter notified at `UNDERWRITER_EMAIL=francisco@usadamant.com`.
- **AI scoring** — `decision` JSONB: `{ tier: 'GREEN'|'YELLOW'|'RED', score: 0-100, label, summary }`.
- **noindex** — `robots: { index: false, follow: false }` in layout metadata.
- **Env vars**: `NEXT_PUBLIC_MARKETING_URL=http://localhost:3000` (prod: `https://rentguard.com`).

### Application Status Flow
```
PENDING_TENANT → PENDING_REVIEW → APPROVED / REJECTED / PENDING_COSIGNER
                                        ↓ (Phase 2)
                               CONTRACT_SENT → CONTRACT_SIGNED → PAYMENT_PENDING → ACTIVE
```

### Key rentguard-app Files
| File | Purpose |
|---|---|
| `rentguard-app/src/app/underwrite/page.tsx` | Dashboard with charts + semáforo |
| `rentguard-app/src/app/underwrite/[id]/page.tsx` | Per-application review + PasswordGate |
| `rentguard-app/src/app/apply/owner/page.tsx` | Owner 3-step form (fee_payer in Step 1) |
| `rentguard-app/src/app/apply/tenant/page.tsx` | Tenant multi-step form |
| `rentguard-app/src/app/cosigner/[id]/page.tsx` | Cosigner invite flow |
| `rentguard-app/src/app/api/underwrite/applications/route.ts` | GET all applications |
| `rentguard-app/src/lib/supabase.ts` | Supabase client singleton |
| `rentguard-app/src/lib/underwriting.ts` | AI underwriting logic |
| `rentguard-app/src/lib/resend.ts` | Email sending helpers |
| `rentguard-app/src/components/AppNavbar.tsx` | Minimal navbar with logo + "← Back to RentGuard.com" |
| `rentguard-web/supabase/migrations/00003_post_approval_workflow.sql` | New statuses (APPLIED ✅) |
| `rentguard-app/.env.local` | Supabase URL/key, Resend key, underwriter credentials |

### Email Templates (rentguard-app)
Located in `rentguard-app/src/components/emails/`:
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
- `rentguard-web` → **3000** (marketing site — configured in `.claude/launch.json`)
- `rentguard-app` → **3001** (application portal — configured in `.claude/launch.json`)
- `lead-gen-workspace` → **3002** (per gemini.md)

---

## In Progress

Nothing active. Site split complete and verified in browser (2026-03-16).

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

### rentguard-app (Claude — Phase 2 when API keys ready)
1. Obtain Dropbox Sign API key + Stripe API key → add to `rentguard-app/.env.local`
2. Build contract PDF template with `@react-pdf/renderer`
3. Replace "Send Contracts" stub with real Dropbox Sign API call in `/underwrite/[id]`
4. Replace "Request Payment" stub with Stripe Payment Link generation
5. Add status transitions: CONTRACT_SENT → CONTRACT_SIGNED → PAYMENT_PENDING → ACTIVE
6. Production deploy to Vercel: `rentguard-web` → rentguard.com, `rentguard-app` → app.rentguard.com (separate Vercel projects, update env vars for prod URLs)

### lead-gen-workspace (Antigravity — awaiting user review)
- User reviewing Phase 1–7 MVP; feedback loop pending

### Cross-project (when user decides)
- Define integration plan between lead-gen-workspace SQLite and rentguard-web Supabase
- Automate lead_gen_agent CSV → lead-gen-workspace import pipeline
- Consider adding lead-gen-workspace to `.claude/launch.json` for easy local startup

---

## Handoff To Antigravity

Hi Antigravity — updated context as of 2026-03-16:

**ARCHITECTURE CHANGE: rentguard-web has been split into two separate Next.js projects:**
- `rentguard-web/` (port 3000) → pure marketing site, no backend deps
- `rentguard-app/` (port 3001) → all application pages and API routes

**rentguard-web is now marketing-only.** It has no Supabase, Resend, or recharts. Only `next`, `react`, `react-dom`, `tailwind-merge`, `clsx`, `lucide-react`. All CTA buttons link to `http://localhost:3001` locally (env var `NEXT_PUBLIC_APP_URL`).

**rentguard-app has all the application logic** from the old rentguard-web: apply forms, cosigner flow, underwriting dashboard, API routes, Supabase, Resend, email templates. It noindexes itself. AppNavbar has a "← Back to RentGuard.com" link.

**Constraints to respect in rentguard-app:**
- All pages are `'use client'` — no server components in app pages
- Supabase client is singleton: `src/lib/supabase.ts`
- Do NOT overwrite the `decision` JSONB field during status transitions (it's AI-generated)
- `owner_data` and `tenant_data` are JSONB — use full object update or `jsonb_set` to avoid overwriting sibling fields

**Answering your gemini.md open questions:**
- "Is Claude making changes to rentguard-web?" → Site split complete. Now idle awaiting Phase 2 credentials.
- "Should lead-gen-workspace integrate with rentguard-web?" → No decision from user yet. Keep separate for now.

**The lead_gen_agent CSV (`rentguard_leads_20260309_133604.csv`) is generated but not imported anywhere yet.**

---

## Latest Claude Changes

_Session: 2026-03-16 (this session) — Site split_
- Created `rentguard-app/` — new Next.js 14 project (port 3001, app.rentguard.com)
- Moved all application routes to rentguard-app: `/apply/owner`, `/apply/tenant`, `/cosigner/[id]`, `/cosigner/submit/[id]`, `/underwrite`, `/underwrite/[id]`, all 7 API routes
- Copied shared lib: `supabase.ts`, `resend.ts`, `underwriting.ts`, `email-renderer.ts` + all 6 email templates
- Created `rentguard-app/src/components/AppNavbar.tsx` — minimal header with "← Back to RentGuard.com"
- Created `rentguard-app/src/app/layout.tsx` — noindex metadata, dark theme, AppNavbar
- Created `rentguard-app/src/app/page.tsx` — redirects `/` → `/apply/owner`
- Created `rentguard-app/.env.local` with all shared env vars + `NEXT_PUBLIC_MARKETING_URL`
- Updated `rentguard-web/src/components/Navbar.tsx` — apply links now use `${APP_URL}/apply/...`
- Updated `rentguard-web/src/components/Footer.tsx` — same
- Updated all marketing pages (`page.tsx`, `brokers/`, `landlords/`, `tenants/`) — apply CTAs use `${APP_URL}/...`
- Updated `rentguard-web/src/app/layout.tsx` — added metadataBase, canonical, openGraph, twitter
- Created `rentguard-web/src/app/sitemap.ts` + `robots.ts`
- Updated `rentguard-web/.env.local` — added `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_SITE_URL`
- Slimmed `rentguard-web/package.json` — removed `@supabase/supabase-js`, `recharts`, `resend`, `uuid`, `framer-motion`
- Deleted from rentguard-web: `src/app/apply/`, `src/app/cosigner/`, `src/app/underwrite/`, `src/app/api/`
- Updated `.claude/launch.json` — added rentguard-app on port 3001

_Session: 2026-03-12 (previous session)_
- Created `rentguard-web/src/app/underwrite/page.tsx` — full underwriting dashboard
- Created `rentguard-web/src/app/api/underwrite/applications/route.ts` — GET all applications API
- Created `rentguard-web/supabase/migrations/00003_post_approval_workflow.sql` — new status constraint
- Modified `rentguard-web/src/app/underwrite/[id]/page.tsx` — PasswordGate + post-approval Next Steps panel
- Modified `rentguard-web/src/app/apply/owner/page.tsx` — fee_payer toggle in Step 1
- Modified `rentguard-web/.env.local` — added `NEXT_PUBLIC_UNDERWRITER_USER=ADMIN` + `NEXT_PUBLIC_UNDERWRITER_PASSWORD=ADMIN`
- Installed `recharts@3.8.0`
- Applied migration 00003 in Supabase SQL editor (confirmed by user)
