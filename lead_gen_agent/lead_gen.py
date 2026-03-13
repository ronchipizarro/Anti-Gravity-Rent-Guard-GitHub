#!/usr/bin/env python3
"""
RentGuard Lead Generation Agent — Florida MVP
Targets: Real estate agents & brokerage offices in Miami, Orlando, Naples, Fort Lauderdale
Method: Open-source scraping from public RE directories (Realtor.com, Zillow Agent Finder, Google Maps)
Output: CSV file ready for outreach campaigns
"""

import csv
import time
import random
import json
import re
import os
from datetime import datetime
from dataclasses import dataclass, field, asdict
from typing import Optional

try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    print("Installing dependencies... Run: pip install requests beautifulsoup4")
    exit(1)

# ─── Configuration ────────────────────────────────────────────────────────────

MARKETS = {
    "Miami": ("miami", "FL", "33101"),
    "Orlando": ("orlando", "FL", "32801"),
    "Naples": ("naples", "FL", "34101"),
    "Fort Lauderdale": ("fort-lauderdale", "FL", "33301"),
}

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "output")
os.makedirs(OUTPUT_DIR, exist_ok=True)

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "en-US,en;q=0.9",
}


# ─── Data Model ───────────────────────────────────────────────────────────────

@dataclass
class Lead:
    id: str = ""
    first_name: str = ""
    last_name: str = ""
    full_name: str = ""
    email: str = ""
    phone: str = ""
    company: str = ""
    title: str = ""           # Agent, Broker, Property Manager, etc.
    market: str = ""
    city: str = ""
    state: str = "FL"
    source: str = ""
    profile_url: str = ""
    
    # Outreach tracking
    outreach_status: str = "Not Contacted"
    email_1_sent: str = ""
    email_2_sent: str = ""
    email_3_sent: str = ""
    reply_received: str = ""
    meeting_booked: str = ""
    calendly_link: str = "https://calendly.com/rentguard/demo"
    notes: str = ""
    date_added: str = field(default_factory=lambda: datetime.now().strftime("%Y-%m-%d"))


# ─── Email Template Generator ─────────────────────────────────────────────────

def generate_email_sequence(lead: Lead) -> dict:
    """Generate 3 personalized warm email touchpoints for a lead."""
    
    first = lead.first_name or lead.full_name.split()[0] if lead.full_name else "there"
    market = lead.market or lead.city
    
    emails = {
        "email_1_subject": f"Quick question, {first}",
        "email_1_body": f"""Hey {first},

I came across your profile and noticed you're doing great work in the {market} rental market — always impressive to see agents who really know their area.

I'm reaching out because I'm one of the founders of RentGuard, and we just launched in Florida. We basically guarantee landlords collect rent no matter what — covering unpaid rent + all legal/eviction costs if a tenant defaults.

The reason I'm reaching out specifically to you: we have a referral program for agents. When a landlord you work with buys coverage through RentGuard, you earn a fee. Zero extra work on your end — we handle everything online.

Would love to show you how it works in 15 minutes. Mind if I grab some time on your calendar?

→ Book here: {lead.calendly_link}

Best,
[Your Name]
RentGuard | Florida
""",
        
        "email_2_subject": f"Re: Quick question, {first}",
        "email_2_body": f"""Hey {first},

Just following up on my note from a few days ago — didn't want it to get buried.

Here's the quick pitch: RentGuard protects landlords if their tenant stops paying. We cover 100% of unpaid rent + attorney fees throughout the eviction. No deductibles, no monthly cap.

For you, every landlord client you refer earns you a commission with zero effort on your part. We handle the entire application online — no paperwork for you or your client.

In {market}, we've seen agents use it as a differentiator to close deals faster. Landlords love it, tenants get approved quicker, and leases get signed.

If even 2–3 of your landlord clients per month get covered, that's a meaningful income stream for you.

Worth 15 minutes? → {lead.calendly_link}

Cheers,
[Your Name]
RentGuard
""",
        
        "email_3_subject": f"Last note from me, {first}",
        "email_3_body": f"""{first},

I know your inbox is a warzone, so I'll keep this my last note (unless you want to chat!).

We're building something that genuinely helps landlords in {market} sleep at night. If it's ever relevant to you or a client, I'd love to connect.

Drop me a reply anytime, or grab 15 minutes here: {lead.calendly_link}

Either way, best of luck with the market — it's a busy one!

[Your Name]
RentGuard
"""
    }
    
    return emails


# ─── Scrapers ─────────────────────────────────────────────────────────────────

def scrape_realtor_agents(city_slug: str, state: str, market_name: str, max_pages: int = 5) -> list[Lead]:
    """Scrape real estate agent profiles from Realtor.com."""
    leads = []
    
    for page in range(1, max_pages + 1):
        url = f"https://www.realtor.com/realestateagents/{city_slug}_{state}/pg-{page}"
        
        try:
            resp = requests.get(url, headers=HEADERS, timeout=15)
            if resp.status_code != 200:
                print(f"  [!] Realtor.com returned {resp.status_code} for {city_slug} page {page}")
                break
            
            soup = BeautifulSoup(resp.text, "html.parser")
            
            # Agent cards
            cards = soup.select("[data-testid='agent-card']") or soup.select(".agent-list-card")
            
            if not cards:
                print(f"  [!] No agent cards found on page {page} (site structure may have changed)")
                break
            
            for card in cards:
                try:
                    name_el = card.select_one("[data-testid='agent-name']") or card.select_one(".agent-name")
                    name = name_el.get_text(strip=True) if name_el else ""
                    
                    company_el = card.select_one("[data-testid='agent-office']") or card.select_one(".agent-office")
                    company = company_el.get_text(strip=True) if company_el else ""
                    
                    phone_el = card.select_one("[data-testid='agent-phone']") or card.select_one(".phone")
                    phone = phone_el.get_text(strip=True) if phone_el else ""
                    
                    link_el = card.select_one("a[href*='/realestateagents/']")
                    profile_url = "https://www.realtor.com" + link_el["href"] if link_el and link_el.get("href") else ""
                    
                    if not name:
                        continue
                    
                    parts = name.split(" ", 1)
                    lead = Lead(
                        id=f"RLT-{market_name[:3].upper()}-{len(leads)+1:04d}",
                        first_name=parts[0] if len(parts) > 0 else "",
                        last_name=parts[1] if len(parts) > 1 else "",
                        full_name=name,
                        company=company,
                        phone=phone,
                        title="Real Estate Agent",
                        market=market_name,
                        city=city_slug.replace("-", " ").title(),
                        source="Realtor.com",
                        profile_url=profile_url,
                    )
                    leads.append(lead)
                    
                except Exception as e:
                    print(f"  [!] Error parsing card: {e}")
                    continue
            
            print(f"  - Realtor.com | {market_name} | Page {page} -> {len(cards)} agents")
            time.sleep(random.uniform(2.5, 4.5))  # polite delay
            
        except Exception as e:
            print(f"  [!] Request error for {city_slug} page {page}: {e}")
            break
    
    return leads


def generate_mock_leads(market_name: str, count: int = 20) -> list[Lead]:
    """
    Generate realistic mock leads for development/testing.
    In production, replace with real scraping calls.
    """
    first_names = ["Michael", "Sarah", "David", "Jennifer", "Robert", "Lisa", "James", "Maria",
                   "William", "Patricia", "Carlos", "Ana", "Jorge", "Michelle", "Kevin", "Sandra"]
    last_names = ["Rodriguez", "Martinez", "Johnson", "Smith", "Garcia", "Williams", "Brown",
                  "Davis", "Miller", "Wilson", "Taylor", "Anderson", "Thomas", "Jackson", "White"]
    companies = [
        "RE/MAX Excellence", "Keller Williams Realty", "Coldwell Banker", "Compass Real Estate",
        "EXP Realty", "Century 21", "Berkshire Hathaway HomeServices", "Douglas Elliman",
        "The Keyes Company", "One Sotheby's International"
    ]
    titles = ["Real Estate Agent", "Real Estate Broker", "Rental Property Specialist", "Property Manager"]
    
    leads = []
    for i in range(count):
        first = random.choice(first_names)
        last = random.choice(last_names)
        company = random.choice(companies)
        
        lead = Lead(
            id=f"MOCK-{market_name[:3].upper()}-{i+1:04d}",
            first_name=first,
            last_name=last,
            full_name=f"{first} {last}",
            email=f"{first.lower()}.{last.lower()}@{company.split()[0].lower().replace('/', '')}.com",
            phone=f"+1 (305) {random.randint(200,999)}-{random.randint(1000,9999)}",
            company=company,
            title=random.choice(titles),
            market=market_name,
            city=market_name,
            source="Mock Data (Dev)",
            profile_url="",
        )
        leads.append(lead)
    
    return leads


# ─── Export ───────────────────────────────────────────────────────────────────

def export_to_csv(leads: list[Lead], include_emails: bool = True) -> str:
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = os.path.join(OUTPUT_DIR, f"rentguard_leads_{timestamp}.csv")
    
    if not leads:
        print("[!] No leads to export.")
        return ""
    
    # Add email sequences to each lead row
    rows = []
    for lead in leads:
        row = asdict(lead)
        if include_emails:
            emails = generate_email_sequence(lead)
            row.update(emails)
        rows.append(row)
    
    with open(filename, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)
    
    return filename


# ─── Main ─────────────────────────────────────────────────────────────────────

def run(use_mock: bool = True, max_pages_per_market: int = 3):
    """
    Run the lead generation agent.
    
    Args:
        use_mock: If True, generates mock data (for testing). 
                  Set to False to run live scraping (be respectful of rate limits).
        max_pages_per_market: Number of pages to scrape per market (live mode only).
    """
    print("\n" + "=" * 60)
    print("  RentGuard Lead Generation Agent - Florida MVP")
    print("=" * 60)
    
    all_leads: list[Lead] = []
    
    for market_name, (city_slug, state, _) in MARKETS.items():
        print(f"\n[Location] Processing: {market_name}, {state}")
        
        if use_mock:
            leads = generate_mock_leads(market_name, count=25)
            print(f"  - Generated {len(leads)} mock leads")
        else:
            leads = scrape_realtor_agents(city_slug, state, market_name, max_pages=max_pages_per_market)
            print(f"  - Scraped {len(leads)} leads from Realtor.com")
        
        all_leads.extend(leads)
    
    print(f"\n[Stats] Total leads collected: {len(all_leads)}")
    
    csv_path = export_to_csv(all_leads, include_emails=True)
    print(f"\n[Success] Exported to: {csv_path}")
    print("\nColumns included:")
    print("  - Lead info: name, email, phone, company, title, city, market, source")
    print("  - Outreach tracking: outreach_status, email_1-3_sent, reply_received, meeting_booked")
    print("  - Pre-written email templates: email_1-3 subject + body")
    print("  - Calendly link pre-filled")
    print("\n" + "=" * 60)
    
    return csv_path


if __name__ == "__main__":
    import sys
    live_mode = "--live" in sys.argv
    run(use_mock=not live_mode)
