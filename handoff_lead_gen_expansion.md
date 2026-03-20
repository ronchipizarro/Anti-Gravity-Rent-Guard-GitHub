# Handoff: Lead Gen Workspace Expansion

This document provides context for Claude to continue the expansion of the **Anti Gravity Rent Guard Lead Generation Workspace**.

## Current Status
- **Phase 1-8 Complete**: We have a functional Next.js 16 app on port 3002 with a SQLite backend.
- **Scraper Integrated**: The Python scraper (`lead_gen.py`) is successfully bridged to the UI.
- **Verification Done**: Campaigns for Miami and Orlando have been created and populated with live leads from Compass.com.

## Phase 9: Real Estate Filtering & CSV Export (READY TO EXECUTE)

### Context & Constraints
- **Focus**: Real Estate only (Compass scraper or manual CSVs).
- **Filters**: Add `sub_sector` (Residential, Commercial, Luxury) and `listing_count` to the `leads` table.
- **Export**: Users need a button to export the current filtered campaign leads to a CSV file (Excel compatible).

### Technical Requirements
- Update `src/lib/db.js` schema.
- Update `src/app/campaigns/new/page.js` to include these specific RE filters.
- Create `src/app/api/leads/export/route.js` to stream CSV data.

## Phase 10: Human-in-the-Loop Email Automation (Resend)

### Context & Constraints
- **Sending Engine**: Use `resend` (already in `package.json`).
- **Human Approval**: Outreach must happen in "Batches". Only leads marked as "Approved" can be added. The operator must approve the sequence copies before sending.
- **Reply Handling**: Implement a manual "Mark as Replied" button in the UI. This stops the sequence for that lead.
- **Resend Inbound**: The user asked to try integrating Resend for replies. Resend supports Inbound Email webhooks, but since this is a local app, a manual "Mark as Replied" or an IMAP check is safer for now.

### Technical Requirements
- Build a Sequence Management UI.
- Implement the batch-sending logic in `src/app/api/outreach/send-batch/route.js`.
- Add "Outreach Status" tracking (sent, opened, replied).

## Access
- **Path**: `lead-gen-workspace/`
- **Port**: 3002
- **Database**: `lead-gen.db` (SQLite)

## Pending User Questions
- None. User has approved the focus on Real Estate and the human-in-the-loop Resend flow.
