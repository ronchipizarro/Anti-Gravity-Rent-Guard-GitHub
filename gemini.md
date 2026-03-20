# Antigravity Coordination File

## Project Summary
Anti Gravity Rent Guard is a multi-component rental protection SaaS project containing four main sub-projects:
- `rentguard-web`: (Owned by Claude) The main SaaS web app built with Next.js 14, Supabase, and Tailwind. It handles tenant/owner applications, underwriting workflows, and email notifications.
- `lead-gen-workspace`: (Owned by Antigravity) A local Next.js 16 + SQLite application used for lead generation, campaign orchestration, sequence generation, and human-in-the-loop approvals.
- `lead_gen_agent`: (Shared) A Python scraper that generates real estate agent leads into CSV format.
- `lead_gen_log.md`: (Shared) Continuous learning log for the scraping process, tracking errors, solutions, and improvements.
- `marketing`: (Shared) Marketing materials including pitch decks, pamphlets, and broker email sequences.

## Current Goals
The lead generation pipeline is now functional. We are now pivoting to **Miami Sales Acceleration**: onboarding Santiago Furmento as the first Miami salesperson, establishing a rigorous "Sales Advisor" operating rhythm, and hitting tool-driven outreach targets (10,000 leads/month).

## Antigravity Current Understanding
- The project is split into distinct concerns: user-facing SaaS (`rentguard-web`) and internal lead generation tools (`lead-gen-workspace`, `lead_gen_agent`).
- `marketing` assets are being overhauled to improve conversion and brand positioning.
- `lead-gen-workspace` has a working Email Lead button powered by Resend.
- `lead_gen_agent` now uses Compass.com JSON-LD extraction for real data (148 unique leads verified).

## Relevant Notes From claude.md
- **Phase 1 Complete**: Underwriting dashboard, sessionStorage auth, owner form updates, and status migrations (`00003`) are applied.
- **Phase 2 Pending**: Claude is awaiting API keys for Dropbox Sign and Stripe.
- **Decoupled**: `rentguard-web` (port 3000) and `lead-gen-workspace` (port 3002) remain decoupled.

## Current State of the Codebase
- **marketing**: V2 assets created (`pamphlet_brokers_tiered.html`, `institutional_presentation.html`, `incentive_recommendation.md`, etc.).
- **Legal**: Drafted **Florida Rent Protection Services Agreement** (Tri-party, POA, Automated Triggers).
- **Strategy and Planning**: Completed **Legal Risk Analysis & Mitigation Plan**.
- **lead-gen-workspace**: Phase 1-7 MVP complete.
- **rentguard-web**: Phase 1 complete. 11 live applications in Supabase.
- **lead_gen_agent**: Production scraper using Compass.com JSON-LD. Latest output: `rentguard_leads_20260316_105858.csv` (148 unique leads across Miami, Orlando, Naples, Tampa).

## In Progress
- Onboarding Santiago Furmento (Miami Sales).
- Setting up the Google Sheets Sales Tracker (Live).
- Creating "Miami Battle Card" and "Account Hit List" assets.
- Transitioning outreach to full automation stack (Apollo/Clay/Instantly).
- **Continuous Learning**: Maintaining `lead_gen_log.md` and `sales_advisor_manifesto.md`.

## Decisions
- Adopted a "Broker's Best Friend" persona for agent-facing materials.
- Using a "Flashy Fintech" aesthetic for investor/institutional materials.
- Keeping `lead-gen-workspace` separate until integration scope is defined.
- Established automatic `gemini.md` maintenance protocol.
- Configured Git synchronization with a root `.gitignore` and `sync.ps1` script for multi-computer development.
- Adopted Compass.com JSON-LD extraction as the primary free scraping method (Google/Bing/YellowPages all blocked).
- Integrated Resend API for email outreach from lead-gen-workspace.
- **Tracking**: Created `lead_gen_log.md` to formalize knowledge retention for the scraping phase.


## Assumptions
- Marketing V2 assets will replace V1 once user-approved.
- `better-sqlite3` native bindings remain a local development constraint for `lead-gen-workspace`.

## Open Questions
- Should we automate the PDF generation for the new marketing pamphlets?
- Does the user want a unified design system across `rentguard-web` and `lead-gen-workspace`?

## Risks / Issues
- Potential for design drift between the two Next.js sub-projects.
- Coordination requires strict adherence to `gemini.md` / `claude.md` protocol.

## Next Recommended Steps
- User to review Marketing V2 assets.
- Finish marketing refinement (activation sequences, one-pagers).
- Transition back to `lead-gen-workspace` feedback or `rentguard-web` integration if requested.

## Handoff To Claude
Hi Claude — context updated as of 2026-03-19:
I have overhauled the `marketing` assets and established a new **Florida Legal Framework**. I've drafted a tri-party Rent Protection Services Agreement that includes the Tenant and leverages Florida's Summary Procedure for evictions. I've also performed a full legal risk analysis. Your Phase 1 work on `rentguard-web` remains the core SaaS focus; we may need to integrate these new legal signatories into the web flow.

## Latest Antigravity Changes
- **[2026-03-19]** Drafted **Florida Rent Protection Services Agreement** with "bulletproof" eviction/collection clauses and tri-party structure.
- **[2026-03-19]** Performed **Legal Risk Analysis & Mitigation Plan** focusing on FOIR compliance and operational speed.
- **[2026-03-19]** Drafted detailed plan for **Phase 9 & 10** (Advanced RE Filtering, CSV Export, and Resend Sequences).
- **[2026-03-19]** Created `handoff_lead_gen_expansion.md` for Claude to continue the outreach automation work.
- **[2026-03-17]** Fixed `lead-gen-workspace` for Next.js 16 (awaiting async params).
- **[2026-03-16]** Set up **Grenty Miami Sales Tracker** in Google Sheets and established **Sales Advisor Manifesto**.
- **[2026-03-16]** Created **30/60/90 Day Plan** and **Weekly Operating Rhythm** for Santiago Furmento.
- **[2026-03-16]** Built production Compass.com JSON-LD scraper (`lead_gen.py`). Extracted 148 unique real leads across 4 FL cities.
- **[2026-03-16]** Implemented "Email Lead" button in `lead-gen-workspace` using Resend API.
- **[2026-03-13]** Refined the real estate agent pamphlet and institutional presentation.
- **[2026-03-13]** Created new marketing assets and established `gemini.md` maintenance protocol.
- **[2026-03-13]** Synchronized entire project folder with GitHub.


