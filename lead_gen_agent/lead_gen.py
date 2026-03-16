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

# ─── Data Model ───────────────────────────────────────────────────────────────

@dataclass
class Lead:
    id: str = ""
    full_name: str = ""
    first_name: str = ""
    last_name: str = ""
    company: str = ""
    title: str = ""
    email: str = ""
    phone: str = ""
    website: str = ""
    linkedin_url: str = ""
    city: str = ""
    state: str = "FL"
    source: str = ""
    profile_url: str = ""
    
    # Outreach tracking
    outreach_status: str = "Not Contacted"
    notes: str = ""
    date_added: str = field(default_factory=lambda: datetime.now().strftime("%Y-%m-%d"))


# ─── Helpers ──────────────────────────────────────────────────────────────────

def extract_emails(text: str) -> list[str]:
    """Find email addresses using regex."""
    if not text:
        return []
    # Basic email regex
    pattern = r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+"
    emails = re.findall(pattern, text)
    # Filter out common false positives and image extensions
    valid_emails = []
    for e in emails:
        e = e.lower()
        if not any(e.endswith(ext) for ext in [".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"]) and "sentry" not in e and "example" not in e:
            valid_emails.append(e)
    return list(set(valid_emails))

def extract_phones(text: str) -> list[str]:
    """Find phone numbers using regex."""
    if not text:
        return []
    # Looks for shapes like (555) 555-5555 or 555-555-5555
    pattern = r"\(?\b[2-9][0-9]{2}\)?[-.\s]?[2-9][0-9]{2}[-.\s]?[0-9]{4}\b"
    phones = re.findall(pattern, text)
    return list(set(phones))


# ─── Scrapers ─────────────────────────────────────────────────────────────────

def scrape_with_google(market_name: str, max_leads: int = 15) -> list[Lead]:
    """Scrape using googlesearch-python to bypass captchas and find agent profiles."""
    leads = []
    
    # We will search for LinkedIn profiles of agents in this city.
    search_query = f'site:linkedin.com/in/ "Real Estate Agent" OR "Broker" "{market_name}, FL"'
    print(f"  - Searching Google for: {search_query}")
    
    try:
        from googlesearch import search
        
        # googlesearch-python's advanced=True returns objects with title, url, description
        results = search(search_query, num_results=max_leads, advanced=True, sleep_interval=5)
        
        for res in results:
            try:
                raw_title = res.title
                profile_url = res.url
                snippet_text = res.description
                
                if not raw_title or not profile_url:
                    continue
                    
                # Clean up the LinkedIn title format: "John Doe - Real Estate Agent - Company | LinkedIn"
                name = raw_title.split(" - ")[0].replace(" | LinkedIn", "").strip()
                if not name or len(name.split()) < 2:
                    continue
                    
                parts = name.split(" ", 1)
                
                # Try to guess company from the title or snippet
                company = ""
                if " - " in raw_title:
                    title_parts = raw_title.split(" - ")
                    if len(title_parts) > 2:
                        company = title_parts[2].replace(" | LinkedIn", "").strip()
                
                # If we didn't find a company, default it
                if not company or company == "LinkedIn":
                    company = "Independent Agent"
                    
                # Extract any emails or phones from the Google snippet
                emails = extract_emails(snippet_text)
                phones = extract_phones(snippet_text)
                
                lead = Lead(
                    id=f"GGL-{market_name[:3].upper()}-{len(leads)+1:04d}",
                    first_name=parts[0],
                    last_name=parts[1] if len(parts) > 1 else "",
                    full_name=name,
                    company=company,
                    title="Real Estate Agent / Broker",
                    email=emails[0] if emails else "",
                    phone=phones[0] if phones else "",
                    city=market_name,
                    source="Google X-Ray (LinkedIn)",
                    linkedin_url=profile_url,
                    profile_url=profile_url,
                )
                leads.append(lead)
                
                if len(leads) >= max_leads:
                    break
                    
            except Exception as e:
                print(f"  [!] Error parsing Google result: {e}")
                
    except Exception as e:
        print(f"  [!] Google search failed: {e}")
        
    return leads


def generate_mock_leads(market_name: str, count: int = 20) -> list[Lead]:
    """
    Generate realistic mock leads for development/testing.
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
            full_name=f"{first} {last}",
            first_name=first,
            last_name=last,
            company=company,
            title=random.choice(titles),
            email=f"{first.lower()}.{last.lower()}@{company.split()[0].lower().replace('/', '')}.com",
            phone=f"+1 (305) {random.randint(200,999)}-{random.randint(1000,9999)}",
            website=f"https://{company.split()[0].lower()}.example.com",
            city=market_name,
            source="Mock Data (Dev)",
            profile_url="",
        )
        leads.append(lead)
    
    return leads


# ─── Export ───────────────────────────────────────────────────────────────────

def export_to_csv(leads: list[Lead]) -> str:
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = os.path.join(OUTPUT_DIR, f"rentguard_leads_{timestamp}.csv")
    
    if not leads:
        print("[!] No leads to export.")
        return ""
    
    rows = [asdict(lead) for lead in leads]
    
    with open(filename, "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=list(rows[0].keys()), delimiter=';')
        writer.writeheader()
        writer.writerows(rows)
    
    return filename


# ─── Main ─────────────────────────────────────────────────────────────────────

def run(use_mock: bool = True, max_pages_per_market: int = 3):
    """
    Run the lead generation agent.
    
    Args:
        use_mock: If True, generates mock data (for testing). 
                  Set to False to run the Playwright Google X-ray scraper.
        max_pages_per_market: Number of leads to target per market (approximate).
    """
    print("\n" + "=" * 60)
    print("  RentGuard Lead Generation Agent - Florida MVP (Playwright)")
    print("=" * 60)
    
    all_leads: list[Lead] = []
    
    for market_name, (city_slug, state, _) in MARKETS.items():
        print(f"\n[Location] Processing: {market_name}, {state}")
        
        if use_mock:
            leads = generate_mock_leads(market_name, count=10)
            print(f"  - Generated {len(leads)} mock leads")
        else:
            # We use max_pages_per_market * 10 to approximate the number of leads we want to process 
            leads = scrape_with_google(market_name, max_leads=max_pages_per_market * 10)
            print(f"  - Scraped {len(leads)} leads via Google X-Ray")
        
        all_leads.extend(leads)
    
    print(f"\n[Stats] Total leads collected: {len(all_leads)}")
    
    csv_path = export_to_csv(all_leads)
    
    if csv_path:
        print(f"\n[Success] Exported to: {csv_path}")
        print("\nColumns included:")
        print("  - Lead info: full_name, email, phone, company, title, website, city, source")
        print("  - Outreach tracking: outreach_status, notes")
    print("\n" + "=" * 60)
    
    return csv_path


if __name__ == "__main__":
    import sys
    live_mode = "--live" in sys.argv
    run(use_mock=not live_mode)
