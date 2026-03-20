# RentGuard Email Domain Warmup & Deliverability Setup Plan

**Domain:** rentguard.us.com
**Date:** March 2026
**Sending infrastructure:** Google Workspace (team email) + Resend (transactional + campaigns)

---

## Table of Contents

1. [DNS Configuration Checklist](#1-dns-configuration-checklist)
2. [Google Workspace Email Setup](#2-google-workspace-email-setup)
3. [Warmup Schedule — Resend (Lead Gen Campaigns)](#3-warmup-schedule--resend-lead-gen-campaigns)
4. [Google Workspace Warmup (Manual Outreach)](#4-google-workspace-warmup-manual-outreach)
5. [Monitoring Tools](#5-monitoring-tools)
6. [Pre-Send Checklist](#6-pre-send-checklist)

---

## 1. DNS Configuration Checklist

All records go in your domain registrar's DNS panel (wherever rentguard.us.com is registered). Changes propagate in 24–48 hours. Verify each record at [MXToolbox](https://mxtoolbox.com) after adding.

---

### 1.1 MX Records (Google Workspace — required first)

Add these five MX records so mail can be received at @rentguard.us.com. Remove any existing MX records before adding these.

| Type | Host/Name | Value | Priority |
|------|-----------|-------|----------|
| MX | `@` | `ASPMX.L.GOOGLE.COM` | 1 |
| MX | `@` | `ALT1.ASPMX.L.GOOGLE.COM` | 5 |
| MX | `@` | `ALT2.ASPMX.L.GOOGLE.COM` | 5 |
| MX | `@` | `ALT3.ASPMX.L.GOOGLE.COM` | 10 |
| MX | `@` | `ALT4.ASPMX.L.GOOGLE.COM` | 10 |

**Verify:** `dig MX rentguard.us.com` or MXToolbox → "MX Lookup" → `rentguard.us.com`

---

### 1.2 SPF Record (Combined Google Workspace + Resend)

SPF tells receiving servers which IPs are allowed to send on behalf of your domain. You can only have **one SPF TXT record**. This single record covers both Google Workspace and Resend.

| Type | Host/Name | Value |
|------|-----------|-------|
| TXT | `@` | `v=spf1 include:_spf.google.com include:amazonses.com ~all` |

**Explanation of each part:**
- `include:_spf.google.com` — authorizes Google Workspace to send as @rentguard.us.com
- `include:amazonses.com` — authorizes Resend (Resend routes mail through Amazon SES infrastructure)
- `~all` — soft fail for everything else (use `~all` initially; switch to `-all` after warmup is complete and DMARC is at `p=reject`)

**Verify:** MXToolbox → "SPF Record Lookup" → `rentguard.us.com`

> **Warning:** Never create two separate TXT records starting with `v=spf1`. Only one is allowed. Always combine into one record.

---

### 1.3 DKIM for Google Workspace

DKIM adds a cryptographic signature to every outbound email, proving it came from your domain.

**Step-by-step:**

1. Go to [Google Admin Console](https://admin.google.com) → Apps → Google Workspace → Gmail → Authenticate email
2. Select domain: `rentguard.us.com`
3. Click **Generate new record**
   - Key bit length: **2048-bit** (recommended)
   - Prefix selector: `google` (leave default)
4. Google will display a TXT record value. Copy it — it will look like:

```
v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCg...
```

5. Add this record to your DNS:

| Type | Host/Name | Value |
|------|-----------|-------|
| TXT | `google._domainkey` | *(paste the full value Google gave you)* |

6. Wait 24–48 hours for propagation.
7. Return to Google Admin → Authenticate email → click **Start authentication**
8. Status should change to "Authenticating email" within a few minutes.

**Verify:** MXToolbox → "DKIM Lookup" → Host: `google._domainkey.rentguard.us.com`

---

### 1.4 DKIM for Resend

Resend requires its own DKIM records. These are separate from Google's DKIM.

**Step-by-step:**

1. Log in to [Resend dashboard](https://resend.com) → Domains → Add Domain
2. Enter `rentguard.us.com`
3. Resend will show you three DNS records to add (two DKIM + one DMARC ownership TXT). The DKIM records will look like:

| Type | Host/Name | Value |
|------|-----------|-------|
| TXT | `resend._domainkey` | `p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNA...` *(Resend provides this)* |
| TXT | `resend2._domainkey` | `p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNA...` *(Resend provides this)* |

> Resend may use different selector names (e.g., `resend._domainkey`). Use exactly the values Resend provides — do not modify them.

4. After adding the records, click **Verify** in the Resend dashboard.
5. Resend will confirm when DKIM is active (usually within 1–24 hours).

**Verify:** MXToolbox → "DKIM Lookup" → Host: `resend._domainkey.rentguard.us.com`

---

### 1.5 DMARC Record

DMARC builds on SPF + DKIM. It tells receiving servers what to do when an email fails authentication, and sends you reports on your sending reputation.

**Phase 1 — Monitoring only (start here, Day 1):**

| Type | Host/Name | Value |
|------|-----------|-------|
| TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:dmarc-reports@rentguard.us.com; ruf=mailto:dmarc-reports@rentguard.us.com; fo=1; adkim=r; aspf=r` |

**Explanation:**
- `p=none` — monitor only; do not block anything yet
- `rua=` — aggregate report address (daily digest of pass/fail stats)
- `ruf=` — forensic report address (per-failure details; some providers skip this)
- `fo=1` — generate forensic reports on any authentication failure
- `adkim=r` — relaxed DKIM alignment (subdomains allowed)
- `aspf=r` — relaxed SPF alignment

> Note: Create the `dmarc-reports@rentguard.us.com` alias in Google Workspace so the reports land in Francisco's inbox. Alternatively, use a dedicated DMARC monitoring service like [Postmark's DMARC digest](https://dmarc.postmarkapp.com) — free.

**Phase 2 — After 4 weeks, once reports show >95% pass rate:**

Change `p=none` to `p=quarantine`:
```
v=DMARC1; p=quarantine; pct=25; rua=mailto:dmarc-reports@rentguard.us.com; fo=1; adkim=r; aspf=r
```
- `pct=25` — apply quarantine to 25% of failing mail first, then increase to 100% over 2 weeks.

**Phase 3 — After 8 weeks, once fully warmed up and confident:**

```
v=DMARC1; p=reject; rua=mailto:dmarc-reports@rentguard.us.com; fo=1; adkim=r; aspf=r
```

**Verify:** MXToolbox → "DMARC Lookup" → `rentguard.us.com`

---

### 1.6 Full DNS Verification Commands

Run these from a terminal (Mac/Linux) or WSL (Windows) to verify records are live:

```bash
# MX records
dig MX rentguard.us.com +short

# SPF
dig TXT rentguard.us.com +short | grep spf

# Google DKIM
dig TXT google._domainkey.rentguard.us.com +short

# Resend DKIM
dig TXT resend._domainkey.rentguard.us.com +short

# DMARC
dig TXT _dmarc.rentguard.us.com +short
```

All five should return populated values before proceeding to warmup.

---

## 2. Google Workspace Email Setup

### 2.1 Accounts to Create at Launch

| Email | Type | Purpose |
|-------|------|---------|
| `francisco@rentguard.us.com` | Full mailbox | Founder, primary admin, underwriting |
| `guillermo@rentguard.us.com` | Full mailbox | Team member |
| `santiago@rentguard.us.com` | Full mailbox | Cold outreach — broker campaigns |
| `support@rentguard.us.com` | Alias or Group | Customer support inquiries |
| `claims@rentguard.us.com` | Alias or Group | Claims intake |
| `info@rentguard.us.com` | Alias | General inbound |
| `dmarc-reports@rentguard.us.com` | Alias | DMARC aggregate reports |

**Priority order:** Create francisco@ first (needed for Google Admin). Then guillermo@ and santiago@. Then set up the aliases/groups below.

---

### 2.2 Routing: Aliases vs. Google Groups

**Use aliases** when:
- One person handles all mail to that address
- No need for shared visibility or collaboration
- Simple forwarding is enough

**Use Google Groups** when:
- Multiple people need to see and reply to the same inbox
- You want a shared queue (e.g., support tickets)
- You need to track who responded

**Recommended setup for launch:**

| Address | Approach | Forward to |
|---------|----------|------------|
| `support@` | **Google Group** (even if only Francisco reads it now) — scales later | `francisco@` as initial member |
| `claims@` | **Google Group** — same reason; easy to add ops staff later | `francisco@` as initial member |
| `info@` | **Alias on francisco@** — low volume, no need for group overhead | — |
| `dmarc-reports@` | **Alias on francisco@** | — |

**How to create an alias in Google Admin:**
1. Admin Console → Directory → Users → click Francisco's account
2. User information → Alternate email addresses (email aliases)
3. Add `info@rentguard.us.com` and `dmarc-reports@rentguard.us.com`

**How to create a Google Group for support@:**
1. Admin Console → Directory → Groups → Create group
2. Name: "Support", Email: `support@rentguard.us.com`
3. Add Francisco as a member and set to receive all messages
4. Posting settings: "Anyone on the web can post" (so external senders work)

---

### 2.3 Gmail Signature Template

Use this template for all team members. Set it in Gmail Settings → General → Signature.

```
[First Name] [Last Name]
[Title] · RentGuard
rentguard.us.com

📧 [firstname]@rentguard.us.com
📱 [Phone — optional]

RentGuard protects landlords from tenant default.
Learn how it works → rentguard.us.com
```

**To set signatures in bulk:** Google Admin → Apps → Google Workspace → Gmail → Email read receipts (scroll to "Append footer"). Alternatively, each team member sets their own in Gmail settings.

---

## 3. Warmup Schedule — Resend (Lead Gen Campaigns)

### Why Warmup Matters

rentguard.us.com is a brand-new domain. Email providers (Gmail, Outlook, Yahoo) have never seen mail from it. Sending large volumes immediately guarantees spam folder placement. Warmup gradually builds a positive sending reputation by starting small, getting high engagement, and scaling slowly.

**Target at end of warmup:** 500–1,000 broker cold emails per day from Resend with >20% open rates.

---

### 3.1 Key Metrics to Monitor Throughout

| Metric | Green | Yellow (Slow Down) | Red (Stop) |
|--------|-------|---------------------|------------|
| Bounce rate | < 2% | 2–5% | > 5% |
| Spam complaint rate | < 0.08% | 0.08–0.3% | > 0.3% |
| Open rate (cold) | > 20% | 10–20% | < 10% |
| Reply rate (cold) | > 3% | 1–3% | < 1% |
| Unsubscribe rate | < 0.5% | 0.5–1% | > 1% |

> Google's spam threshold is **0.10%** complaint rate. Exceeding it risks domain blacklisting. Stay well below it.

---

### 3.2 Week-by-Week Warmup Schedule

#### Week 1 (Days 1–7): Internal Testing Only

**Volume:** 5–10 emails/day max
**Recipients:** Only internal team + personal email accounts you control (Gmail, Outlook, Yahoo, iCloud — use all four)

**Actions:**
- [ ] Send test emails from Resend to `francisco@rentguard.us.com`, `guillermo@rentguard.us.com`, `santiago@rentguard.us.com`
- [ ] Send to personal Gmail, Outlook, and Yahoo accounts to check rendering and spam placement
- [ ] Open every email, click every link, reply to several — this trains inbox placement
- [ ] Check Resend dashboard: confirm DKIM and SPF pass on all messages
- [ ] Run each test email through [mail-tester.com](https://mail-tester.com) (see Section 5)
- [ ] Verify emails land in inbox (not spam) across all major providers

**What to send:** The transactional emails already in the codebase — tenant invite, decision email, agent review notification. These are legitimate transactional emails and ideal for warmup because they have natural content.

**Do not send:** Any cold outreach. Any bulk sends. Any marketing campaigns.

---

#### Week 2 (Days 8–14): Small Engaged List

**Volume:** 25–50 emails/day
**Recipients:** People who have opted in or know you — team, early users, friends in real estate who agreed to hear from you, anyone who signed up at rentguard.us.com

**Actions:**
- [ ] Send a soft-launch announcement to your personal network via Resend (people who want to hear from you)
- [ ] Continue sending all transactional emails through Resend (every new application triggers real emails — these count toward warmup)
- [ ] Monitor Resend analytics daily: open rates, clicks, bounces
- [ ] Check Google Postmaster Tools — domain reputation should show "Low" but not "Bad"
- [ ] Remove any hard bounces from your list immediately

**Content types:** Transactional (tenant invites, decisions), announcements to warm contacts, newsletter-style updates to opted-in subscribers.

---

#### Week 3 (Days 15–21): Expand to Warm Contacts

**Volume:** 75–150 emails/day
**Recipients:** Extended warm list — people who have interacted with RentGuard in any way (downloaded a pamphlet, visited a form, met you at an event)

**Actions:**
- [ ] Continue all transactional email volume
- [ ] Add a "Resources for Real Estate Agents" nurture email to anyone who received the broker pamphlet PDF previously
- [ ] Check bounce rate: if above 2%, stop expanding until list is cleaned
- [ ] Verify Postmaster Tools domain reputation is "Medium" or trending upward

---

#### Week 4 (Days 22–28): Soft Cold Outreach (Micro-batch)

**Volume:** 200–300 emails/day
**Recipients:** First small batch of cold broker leads from the lead_gen_agent CSV

**Actions:**
- [ ] Select the 200 highest-quality leads from the CSV (verified emails, active agents, Florida markets)
- [ ] Use a highly personalized first email from the broker_email_sequence.md — the open touch
- [ ] Send in batches of 50 per hour, not all at once
- [ ] Mandatory: list must be cleaned through a verification service first (ZeroBounce, NeverBounce, or Resend's built-in validation)
- [ ] Monitor spam complaint rate in Resend dashboard every 24 hours
- [ ] If any metric hits yellow zone, pause for 48 hours before resuming

---

#### Week 5 (Days 29–35): Scale Cold Outreach

**Volume:** 400–500 emails/day
**Actions:**
- [ ] Expand cold outreach to next batch of verified leads
- [ ] A/B test subject lines: 2 variants on the same day split 50/50
- [ ] Ensure every email has a clear unsubscribe link (required by CAN-SPAM and Resend policy)
- [ ] Update DMARC from `p=none` to `p=quarantine; pct=25` if passing rate is >95%

---

#### Week 6 (Days 36–42): Full Campaign Pace

**Volume:** 600–750 emails/day
**Actions:**
- [ ] Begin sending full broker email sequences (all 5 touchpoints from broker_email_sequence.md)
- [ ] Space follow-ups: minimum 3 days between touchpoints per contact
- [ ] Set up suppression list in Resend: anyone who unsubscribed or complained must never receive another email
- [ ] Review Postmaster Tools: domain reputation should be "High" or "Medium"

---

#### Week 7–8 (Days 43–56): Volume at Scale

**Volume:** 1,000 emails/day
**Actions:**
- [ ] Full cold outreach capacity reached
- [ ] Escalate DMARC to `p=reject` if all metrics are in green zone
- [ ] Update SPF `~all` to `-all` (hard fail)
- [ ] Establish regular weekly reporting: open rate, reply rate, meetings booked

---

### 3.3 What to Do If Deliverability Drops

**Symptom: Open rate drops below 10%**
- Pause all cold outreach immediately
- Check Postmaster Tools for spam rate spike
- Review recent content — did any email use spam trigger words?
- Wait 5–7 days before resuming at previous volume (do not try to accelerate)

**Symptom: Bounce rate exceeds 2%**
- Stop sending to cold list
- Run entire remaining list through ZeroBounce or NeverBounce
- Remove all invalid addresses before resuming
- Bounces permanently damage domain reputation — prevention is critical

**Symptom: Spam complaint rate exceeds 0.08%**
- Stop all campaigns
- Do not send anything for 72 hours
- Audit recent emails — were they sent to people who did not opt in?
- Review unsubscribe flow — is it working correctly?
- Resume only with warmer, more targeted list

**Symptom: Resend account flagged or suspended**
- Contact Resend support immediately with explanation of your use case
- Show them your warmup plan and engagement metrics
- Do not create a new account — this makes the problem worse

---

## 4. Google Workspace Warmup (Manual Outreach)

### 4.1 Who This Applies To

Santiago will use `santiago@rentguard.us.com` for 1:1 personalized cold outreach to real estate agents and brokers. This is different from Resend campaign sends. These are individual emails written and sent through Gmail.

---

### 4.2 Google Workspace Sending Limits

Google enforces the following limits on Google Workspace accounts:

| Limit | Value |
|-------|-------|
| Daily send limit (Google Workspace paid) | 2,000 recipients/day |
| Daily send limit (new account, first 30 days) | 500 recipients/day |
| Max recipients per message | 2,000 (To + CC + BCC) |
| Rate limit | ~100 emails per hour sustained |

> Google will silently move your emails to spam — or temporarily suspend sending — if you trigger spam signals, regardless of whether you hit these numeric limits.

---

### 4.3 Safe Daily Volume for Cold Outreach (Santiago)

**Do not rely on the 2,000/day limit as a target.** Gmail's spam filters are behavioral, not just volume-based.

Recommended safe daily volumes for a new domain:

| Week | Max Cold Emails/Day | Notes |
|------|--------------------|----|
| 1–2 | 10–20 | Only if DNS is fully verified; send to warm contacts first |
| 3–4 | 30–50 | Mix of warm follow-ups and cold first touches |
| 5–8 | 75–100 | After domain reputation is established |
| 8+ | 150–200 max | Sustainable steady state for 1:1 manual outreach |

---

### 4.4 Best Practices for Avoiding Spam Flags in 1:1 Outreach

**Email content:**
- Write every email as if it is to a specific person — use their name, their brokerage, their market
- No all-caps subject lines, no excessive punctuation (`!!!`), no emoji in subject lines for cold outreach
- Avoid spam trigger words: "free", "guaranteed", "no risk", "act now", "limited time", "click here"
- Keep emails under 200 words for the first touch
- Plain text or minimal HTML — do not use heavy template designs for cold 1:1 outreach
- One clear CTA per email — a question or a soft ask, not a hard pitch

**Sending behavior:**
- Do not send 100 identical emails — Gmail detects template-like patterns across sends
- Vary send times — not all at 9:00 AM; spread throughout the day
- Use Gmail's built-in scheduling if batching sends
- Do not CC or BCC multiple brokers on one cold email — always individual sends

**List hygiene:**
- Verify email addresses before sending (Google penalizes bounces from personal accounts too)
- Never send to the same person more than once per week
- Honor opt-outs immediately — if someone replies "remove me", stop all contact

**Account health:**
- Santiago should use the account for real business activity too: internal email, replies, calendar — not just outbound cold sends
- A purely outbound account with no inbound replies is a spam signal
- Check Google Postmaster Tools for the `santiago@` identity's reputation

---

## 5. Monitoring Tools

### 5.1 Google Postmaster Tools

**What it is:** Google's free dashboard showing how Gmail perceives your domain's sending reputation.

**What it shows:**
- **Domain Reputation:** Bad / Low / Medium / High — the most important signal
- **IP Reputation:** Reputation of the sending IPs (less relevant for Resend since they manage IPs)
- **Spam Rate:** % of your emails that Gmail users marked as spam
- **Authentication:** % of mail passing SPF, DKIM, DMARC
- **Delivery Errors:** Bounce and temp-fail rates to Gmail addresses
- **Encryption:** % of mail delivered over TLS

**How to set up:**
1. Go to [postmaster.google.com](https://postmaster.google.com)
2. Sign in with your Google Workspace account (francisco@rentguard.us.com)
3. Click "+" → Add domain → `rentguard.us.com`
4. Google will give you a TXT record to add to DNS for verification:

| Type | Host/Name | Value |
|------|-----------|-------|
| TXT | `@` | `google-site-verification=XXXXXXXXXXXXXXX` *(Google provides)* |

5. After adding, click Verify in Postmaster Tools
6. Data appears within 24–48 hours of your first sends to Gmail addresses

**When to check:** Daily during warmup weeks 1–4; weekly thereafter.

**Target:** Domain reputation should reach "Medium" by end of week 4 and "High" by end of week 8.

---

### 5.2 Resend Built-In Analytics

Access at [resend.com](https://resend.com) → Emails or Analytics tab.

**Key metrics to watch:**

| Metric | Where to Find | Target |
|--------|---------------|--------|
| Delivered rate | Emails tab → filter by Delivered | > 98% |
| Open rate | Emails tab → Opens | > 25% for transactional; > 20% for campaigns |
| Click rate | Emails tab → Clicks | > 5% |
| Bounce rate | Emails tab → Bounced | < 2% |
| Spam complaints | Emails tab → Complained | < 0.08% |
| Hard bounces | Individual email detail | Remove from list immediately |

**Resend webhooks (optional but recommended):**
Configure webhook in Resend dashboard → Webhooks to POST bounce and complaint events to your app. The existing codebase in `rentguard-app/src/lib/resend.ts` can be extended to log these events and suppress future sends to flagged addresses.

---

### 5.3 MXToolbox

**URL:** [mxtoolbox.com](https://mxtoolbox.com)

**Use cases:**

| Tool | URL | When to Use |
|------|-----|-------------|
| MX Lookup | mxtoolbox.com/MXLookup.aspx | Verify MX records after adding |
| SPF Lookup | mxtoolbox.com/spf.aspx | Verify SPF record syntax and includes |
| DKIM Lookup | mxtoolbox.com/dkim.aspx | Verify DKIM keys are publishing |
| DMARC Lookup | mxtoolbox.com/dmarc.aspx | Verify DMARC policy |
| Blacklist Check | mxtoolbox.com/blacklists.aspx | Check if domain or IP is blacklisted |
| Email Health | mxtoolbox.com/emailhealth.aspx | Full scan of domain email configuration |

**When to run:** After initial DNS setup, and any time deliverability drops unexpectedly. The "Email Health" report is the most comprehensive — run it once per week during warmup.

---

### 5.4 Mail-Tester.com

**URL:** [mail-tester.com](https://mail-tester.com)

**How to use:**
1. Visit mail-tester.com — it generates a unique temporary email address
2. Send a test email from Resend (or Gmail) to that address — use the exact content of your planned campaign
3. Wait 30 seconds, then click "Then check your score"
4. Review the full report:
   - SPF pass/fail
   - DKIM pass/fail
   - DMARC pass/fail
   - SpamAssassin content score
   - Blacklist status
   - Link validation
   - HTML/text balance

**Target score:** 9.5/10 or higher before sending any campaign.

**When to use:** Before Week 4 cold outreach begins, and every time you change email content templates.

**Limitation:** Free version allows 3 tests per day. Tests with identical content give the same result — change the unique send address each time.

---

### 5.5 Additional Tools (Optional)

| Tool | Purpose | Cost |
|------|---------|------|
| [ZeroBounce](https://zerobounce.net) | Email list verification before sending | Pay-per-use (~$0.008/email) |
| [NeverBounce](https://neverbounce.com) | Alternative list verification | Pay-per-use |
| [Postmark DMARC Digest](https://dmarc.postmarkapp.com) | Parses DMARC aggregate reports into readable summaries | Free |
| [GlockApps](https://glockapps.com) | Inbox placement testing across Gmail, Outlook, Yahoo | Paid, ~$79/month |
| [Litmus](https://litmus.com) | Email rendering across 100+ clients | Paid, useful before major campaigns |

---

## 6. Pre-Send Checklist

Run through this checklist **before sending any campaign** from Resend. Every item must pass before proceeding.

### DNS Verification

- [ ] MX records confirmed active via MXToolbox
- [ ] SPF record returns `v=spf1 include:_spf.google.com include:amazonses.com ~all`
- [ ] Google DKIM (`google._domainkey.rentguard.us.com`) resolves with valid key
- [ ] Resend DKIM (`resend._domainkey.rentguard.us.com`) resolves with valid key
- [ ] DMARC policy is active (`_dmarc.rentguard.us.com` returns valid record)
- [ ] Resend dashboard shows domain as "Verified" with green checkmarks on SPF and DKIM

### List Hygiene

- [ ] Email list has been verified through ZeroBounce or NeverBounce (< 2% invalid rate)
- [ ] All previous hard bounces have been removed from this list
- [ ] All previous unsubscribers have been removed from this list
- [ ] All previous spam complainers have been removed from this list
- [ ] No duplicate email addresses in the list
- [ ] List source is documented (where did these contacts come from?)

### Content

- [ ] Test email scored 9.5+ on mail-tester.com
- [ ] Email renders correctly on mobile (tested in Gmail app or mail-tester preview)
- [ ] All links are working and point to correct URLs
- [ ] Unsubscribe link is present and working (required by CAN-SPAM)
- [ ] Physical mailing address is present in the footer (required by CAN-SPAM)
- [ ] Subject line does not contain spam trigger words
- [ ] Plain-text version is included alongside HTML version (Resend handles this automatically if configured)

### Volume & Timing

- [ ] Daily send volume is within the current week's warmup schedule limit
- [ ] Send is batched (not all at once) — use Resend's scheduled sends or batch API
- [ ] Time of send is within business hours in recipients' timezone (Tuesday–Thursday, 9 AM–11 AM or 2 PM–4 PM recommended)
- [ ] No other large send went out in the last 24 hours from this domain

### Monitoring Ready

- [ ] Google Postmaster Tools is accessible and showing recent data
- [ ] Resend dashboard is open to monitor bounce and complaint rates in real time
- [ ] You are available to monitor for the first 4 hours after sending

### Compliance

- [ ] CAN-SPAM compliant: sender name is "RentGuard" or team member name, not misleading
- [ ] Recipients have a legitimate reason to receive this email (they are real estate agents in target markets)
- [ ] Opt-out honored within 10 business days (immediate is best practice)
- [ ] No purchased lists of unverified addresses from third-party data brokers

---

## Quick Reference: DNS Records Summary

| Type | Host | Value | Purpose |
|------|------|-------|---------|
| MX | `@` | `ASPMX.L.GOOGLE.COM` (priority 1) | Google mail routing |
| MX | `@` | `ALT1.ASPMX.L.GOOGLE.COM` (priority 5) | Google mail routing |
| MX | `@` | `ALT2.ASPMX.L.GOOGLE.COM` (priority 5) | Google mail routing |
| MX | `@` | `ALT3.ASPMX.L.GOOGLE.COM` (priority 10) | Google mail routing |
| MX | `@` | `ALT4.ASPMX.L.GOOGLE.COM` (priority 10) | Google mail routing |
| TXT | `@` | `v=spf1 include:_spf.google.com include:amazonses.com ~all` | SPF (combined) |
| TXT | `google._domainkey` | *(from Google Admin — generate and paste)* | Google DKIM |
| TXT | `resend._domainkey` | *(from Resend dashboard — paste exactly)* | Resend DKIM |
| TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:dmarc-reports@rentguard.us.com; fo=1; adkim=r; aspf=r` | DMARC (monitoring) |
| TXT | `@` | `google-site-verification=XXXXX` | Postmaster Tools verification |

---

## Timeline Summary

| Milestone | Target Date | Status |
|-----------|-------------|--------|
| DNS records added | Week 1 Day 1 | — |
| Google Workspace accounts created | Week 1 Day 1 | — |
| Resend domain verified | Week 1 Day 1 | — |
| All DNS verified via MXToolbox | Week 1 Day 2 | — |
| Internal test emails pass mail-tester.com | Week 1 | — |
| Google Postmaster Tools active | Week 1 | — |
| First warm contact emails | Week 2 | — |
| First cold outreach batch | Week 4 | — |
| DMARC escalated to p=quarantine | Week 4–5 | — |
| Full broker campaign at volume | Week 6 | — |
| DMARC escalated to p=reject | Week 8 | — |
| SPF updated to -all | Week 8 | — |

---

*Plan authored March 2026. Review and update metrics monthly after full ramp-up is complete.*
