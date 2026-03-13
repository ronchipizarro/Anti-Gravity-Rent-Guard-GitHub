# Antigravity Coordination File

## Project Summary
Anti Gravity Rent Guard is a multi-component rental protection SaaS project containing four main sub-projects:
- `rentguard-web`: (Owned by Claude) The main SaaS web app built with Next.js 14, Supabase, and Tailwind. It handles tenant/owner applications, underwriting workflows, and email notifications.
- `lead-gen-workspace`: (Owned by Antigravity) A local Next.js 16 + SQLite application used for lead generation, campaign orchestration, sequence generation, and human-in-the-loop approvals.
- `lead_gen_agent`: (Shared) A Python scraper that generates real estate agent leads into CSV format.
- `marketing`: (Shared) Marketing materials including pitch decks, pamphlets, and broker email sequences.

## Current Goals
My current goal is to refine the marketing materials to align with the "Broker's Best Friend" and "Modern Fintech" aesthetic. I am also maintaining `gemini.md` as my canonical record of the project state and handoff notes for Claude.

## Antigravity Current Understanding
- The project is split into distinct concerns: user-facing SaaS (`rentguard-web`) and internal lead generation tools (`lead-gen-workspace`, `lead_gen_agent`).
- `marketing` assets are being overhauled to improve conversion and brand positioning.
- `lead-gen-workspace` is in a "waiting for review" state while I focus on marketing.

## Relevant Notes From claude.md
- **Phase 1 Complete**: Underwriting dashboard, sessionStorage auth, owner form updates, and status migrations (`00003`) are applied.
- **Phase 2 Pending**: Claude is awaiting API keys for Dropbox Sign and Stripe.
- **Decoupled**: `rentguard-web` (port 3000) and `lead-gen-workspace` (port 3002) remain decoupled.

## Current State of the Codebase
- **marketing**: V2 assets created (`pamphlet_brokers_tiered.html`, `institutional_presentation.html`, `incentive_recommendation.md`, etc.).
- **lead-gen-workspace**: Phase 1-7 MVP complete.
- **rentguard-web**: Phase 1 complete. 11 live applications in Supabase.
- **lead_gen_agent**: CSV output `rentguard_leads_20260309_133604.csv` generated.

## In Progress
Refining marketing strategy and ensuring all assets (emails, PDFs, HTML presentations) are cohesive and professional.

## Decisions
- Adopted a "Broker's Best Friend" persona for agent-facing materials.
- Using a "Flashy Fintech" aesthetic for investor/institutional materials.
- Keeping `lead-gen-workspace` separate until integration scope is defined.
- Established automatic `gemini.md` maintenance protocol.

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
Hi Claude — context updated as of 2026-03-13:
I have overhauled the `marketing` assets, creating V2 versions of the Real Estate Agent pamphlet and the Institutional Presentation. I'm also now maintaining `gemini.md` automatically at the start and end of every session to ensure we stay in sync. Your Phase 1 work is noted and incorporated into my project view. I'll continue to respect your ownership of `rentguard-web`.

## Latest Antigravity Changes
- Refined the real estate agent pamphlet (`pamphlet_brokers_tiered.html`) and institutional presentation (`institutional_presentation.html`).
- Created new marketing assets: `incentive_recommendation.md`, `one_liner_pitch.md`, and `landlord_one_pager.md`.
- Implemented automatic `gemini.md` maintenance protocol.
- Reconciled project state with Claude's latest `claude.md` updates.

