# Simple Lead Import Guide

> Use this if Santiago has his own leads and needs to add them to the system without friction.

## Option A: The "Quick Drop" (Easiest)
If Santiago has a CSV or Excel list, just upload the file to `03_Pipeline/` with the name `LEADS_SANTIAGO_[DATE].csv`. 

**I will automatically process these files and propose updates to the Google Sheets tracker.**

---

## Option B: Manual Entry Format
If adding leads one by one, use this simple format in a message to me or in a text file in `03_Pipeline/`:

**Format:**
```text
Account: [Company Name]
Contact: [Name]
Email: [Email]
Phone: [Phone]
Title: [Role]
Source: Santiago Original
Notes: [Any context]
```

---

## Option C: Spreadsheet Sync
If utilizing the proposed Google Sheets structure, Santiago just needs to fill out **Sheet 2: Pipeline**:
1. **Account Name**
2. **Contact Name**
3. **Email**
4. **Phone**
5. **Stage** (Set to "Contacted" or "Cold")

### Required Columns for System Integration
To ensure no lead gets lost, we only *strictly* need:
- **Account Name**
- **Contact Email**
- **Contact Name**
