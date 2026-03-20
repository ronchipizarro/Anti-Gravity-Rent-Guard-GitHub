# Lead Generation - Continuous Learning Log

This document tracks the evolution of the RentGuard Lead Generation pipeline, including technical challenges, mistakes, and solutions found to improve reliability.

## [2026-03-16] Pivot to Compass.com (Breakthrough)

### The Problem
- **Initial Attempt**: Python `requests` + `BeautifulSoup` targeting search engines (Google, Bing, DuckDuckGo).
- **Outcome**: Blocked by CAPTCHAs and 403 Forbidden errors almost immediately. Google's anti-bot protection is too strong for simple headless browsers without expensive proxy rotates.
- **Second Attempt**: Playwright automation.
- **Outcome**: Similar results. Timing out on selectors because pages weren't rendering or were hitting interstitials.

### The Mistake
Assuming that "Search Engine X-raying" was the only free way. I was overcomplicating the "discovery" phase by trying to use search engines as middleware.

### The Solution
- **Discovery**: Compass.com has city-level agent directories that are publicly accessible.
- **Optimization**: Discovered that Compass embeds a `script type="application/ld+json"` tag containing a JSON-LD array of all agents on the page.
- **Implementation**: Switched to a pure `requests` + JSON parsing approach. It's 10x faster than Playwright and completely bypassed the need for complex DOM scraping or search engine proxying.

### Results
- Extracted **148 unique leads** with verified Email and Phone in under 2 minutes.
- Verified semicolon-delimited CSV for Spanish Excel compatibility.

### Errors Caught
- **Unicode Error**: Windows console (cp1252) failed to print the `→` character.
    - *Fix*: Replaced with `->` in logs.
- **Missing Pandas**: Local environment didn't have `pandas` installed.
    - *Fix*: Rewrote extraction logic to use built-in `csv` module for maximum portability.

---

## [2026-03-13] Multi-Project Coordination & Sync

### The Challenge
Working across `lead-gen-workspace` (Next.js) and `lead_gen_agent` (Python) while ensuring Claude and Gemini stay in sync.

### The Solution
- Implementation of `gemini.md` as a coordination anchor.
- Setup of `sync.ps1` and GitHub integration to prevent local data loss and allow multi-computer development.

---

## Retrospective Goals for Next Phase
1. **Slug Discovery**: Find the correct slugs for "Fort Lauderdale", "Boca Raton", etc. (Compass uses location IDs in some URLs).
2. **Email Bounce Tracking**: Implement a check in the workspace to mark leads as "Invalid" if Resend returns a bounce (requires webhook or status polling).
3. **Advanced Filtering**: Filter out "Teams" vs "Individuals" to personalize outreach better.
