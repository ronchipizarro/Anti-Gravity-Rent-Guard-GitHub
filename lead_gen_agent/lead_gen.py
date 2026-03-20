#!/usr/bin/env python3
"""
RentGuard Lead Generation Agent — Florida MVP
Targets: Real estate agents & brokerage offices in Miami, Orlando, Naples, Fort Lauderdale
Method: Compass.com JSON-LD extraction (free, no API keys, no bot blocks)
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

# Compass.com uses location-based slugs for their agent directory pages.
# Each city can have multiple pages of agents (paginated).
COMPASS_CITIES = {
    "Miami": "miami",
    "Fort Lauderdale": "fort-lauderdale",
    "Orlando": "orlando",
    "Naples": "naples",
    "Tampa": "tampa",
    "West Palm Beach": "west-palm-beach",
    "Boca Raton": "boca-raton",
    "Coral Gables": "coral-gables",
}

# Max pages to scrape per city (each page has ~40 agents)
MAX_PAGES_PER_CITY = 5

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "output")
os.makedirs(OUTPUT_DIR, exist_ok=True)

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                  "(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "DNT": "1",
    "Upgrade-Insecure-Requests": "1",
}

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


# ─── Compass.com JSON-LD Scraper ─────────────────────────────────────────────

def scrape_compass_page(city_name: str, city_slug: str, page: int = 1) -> list[Lead]:
    """
    Scrape a single page from compass.com/agents/{city_slug}/.
    Compass embeds rich agent data (name, email, phone) in a JSON-LD script tag.
    This is the most reliable, fastest, and completely free method.
    """
    leads = []
    
    if page == 1:
        url = f"https://www.compass.com/agents/{city_slug}/"
    else:
        url = f"https://www.compass.com/agents/{city_slug}/?page={page}"
    
    print(f"  Fetching: {url}")
    
    try:
        resp = requests.get(url, headers=HEADERS, timeout=20)
        
        if resp.status_code != 200:
            print(f"  [!] HTTP {resp.status_code} for {url}")
            return leads
        
        soup = BeautifulSoup(resp.text, "html.parser")
        script = soup.find("script", type="application/ld+json")
        
        if not script or not script.string:
            print(f"  [!] No JSON-LD found on {url}")
            return leads
        
        data = json.loads(script.string)
        graph = data.get("@graph", [])
        
        for item in graph:
            if item.get("@type") != "RealEstateAgent":
                continue
            
            name = item.get("name", "").strip()
            email = item.get("email", "").strip()
            phone = item.get("telephone", "").strip()
            profile_url = item.get("url", "")
            description = item.get("description", "")
            
            if not name:
                continue
            if not email and not phone:
                continue
                
            # Split name
            name_parts = name.split(" ", 1)
            first_name = name_parts[0]
            last_name = name_parts[1] if len(name_parts) > 1 else ""
            
            lead = Lead(
                id=f"CMP-{city_name[:3].upper()}-{len(leads)+1:04d}-P{page}",
                full_name=name,
                first_name=first_name,
                last_name=last_name,
                company="Compass",
                title=description if description else "Real Estate Agent",
                email=email,
                phone=phone if phone else "",
                city=city_name,
                state="FL",
                source="Compass.com",
                profile_url=profile_url,
            )
            leads.append(lead)
            
    except requests.exceptions.Timeout:
        print(f"  [!] Timeout on {url}")
    except json.JSONDecodeError as e:
        print(f"  [!] Failed to parse JSON-LD: {e}")
    except Exception as e:
        print(f"  [!] Unexpected error: {e}")
    
    return leads


def scrape_compass_city(city_name: str, city_slug: str, max_pages: int = MAX_PAGES_PER_CITY) -> list[Lead]:
    """Scrape multiple pages for a single city."""
    all_leads = []
    
    for page in range(1, max_pages + 1):
        leads = scrape_compass_page(city_name, city_slug, page)
        
        if not leads:
            print(f"  No more agents found on page {page}. Moving on.")
            break
        
        all_leads.extend(leads)
        print(f"  -> Page {page}: {len(leads)} agents (total so far: {len(all_leads)})")
        
        # Polite delay between pages (2-5 seconds)
        if page < max_pages:
            delay = random.uniform(2, 5)
            print(f"  Waiting {delay:.1f}s...")
            time.sleep(delay)
    
    return all_leads


# ─── Deduplication ────────────────────────────────────────────────────────────

def deduplicate_leads(leads: list[Lead]) -> list[Lead]:
    """Remove duplicate leads based on email address."""
    seen_emails = set()
    unique_leads = []
    
    for lead in leads:
        key = lead.email.lower() if lead.email else lead.full_name.lower()
        if key not in seen_emails:
            seen_emails.add(key)
            unique_leads.append(lead)
    
    removed = len(leads) - len(unique_leads)
    if removed > 0:
        print(f"\n[Dedup] Removed {removed} duplicate leads.")
    
    return unique_leads


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


# ─── Mock Data (for testing) ─────────────────────────────────────────────────

def generate_mock_leads(market_name: str, count: int = 20) -> list[Lead]:
    """Generate realistic mock leads for development/testing."""
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


# ─── Main ─────────────────────────────────────────────────────────────────────

def run(use_mock: bool = False, max_pages: int = MAX_PAGES_PER_CITY, cities: dict = None):
    """
    Run the lead generation agent.
    
    Args:
        use_mock: If True, generates mock data (for testing). 
        max_pages: Number of pages to scrape per city (~40 agents/page).
        cities: Optional dict of {city_name: compass_slug}. Uses COMPASS_CITIES by default.
    """
    target_cities = cities if cities else COMPASS_CITIES
    
    print("\n" + "=" * 60)
    print("  RentGuard Lead Generation Agent - Florida MVP")
    print("  Source: Compass.com JSON-LD Extraction")
    print("=" * 60)
    
    all_leads: list[Lead] = []
    
    for city_name, city_slug in target_cities.items():
        print(f"\n[City] Processing: {city_name}, FL")
        
        if use_mock:
            leads = generate_mock_leads(city_name, count=10)
            print(f"  - Generated {len(leads)} mock leads")
        else:
            leads = scrape_compass_city(city_name, city_slug, max_pages=max_pages)
            print(f"  - Scraped {len(leads)} leads from Compass.com")
        
        all_leads.extend(leads)
        
        # Polite delay between cities
        if not use_mock:
            delay = random.uniform(3, 7)
            print(f"\n  Waiting {delay:.1f}s before next city...")
            time.sleep(delay)
    
    # Deduplicate
    all_leads = deduplicate_leads(all_leads)
    
    print(f"\n[Stats] Total unique leads collected: {len(all_leads)}")
    
    csv_path = export_to_csv(all_leads)
    
    if csv_path:
        print(f"\n[Success] Exported to: {csv_path}")
        print("\nColumns included:")
        print("  - Lead info: full_name, email, phone, company, title, city, source")
        print("  - Outreach tracking: outreach_status, notes, date_added")
    print("\n" + "=" * 60)
    
    return csv_path


if __name__ == "__main__":
    import sys
    import argparse
    
    parser = argparse.ArgumentParser(description="RentGuard Lead Generation Agent")
    parser.add_argument("--mock", action="store_true", help="Generate mock data instead of scraping")
    parser.add_argument("--quick", action="store_true", help="Quick mode: Scrape 1 page of Miami")
    parser.add_argument("--city", type=str, help="Compass city slug (e.g., miami, fort-lauderdale, etc.)")
    parser.add_argument("--max-pages", type=int, default=MAX_PAGES_PER_CITY, help="Max pages to scrape per city")
    
    args = parser.parse_args()
    
    if args.mock:
        run(use_mock=True)
    elif args.quick:
        # Quick mode: only Miami, 1 page
        run(cities={"Miami": "miami"}, max_pages=1)
    elif args.city:
        # Run for a specific city slug
        # Find city name from slug
        city_name = next((k for k, v in COMPASS_CITIES.items() if v == args.city), args.city.capitalize())
        run(cities={city_name: args.city}, max_pages=args.max_pages)
    else:
        # Full scrape: all cities
        run(max_pages=args.max_pages)
