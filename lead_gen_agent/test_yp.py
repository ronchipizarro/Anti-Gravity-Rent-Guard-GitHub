import requests
from bs4 import BeautifulSoup

url = "https://www.yellowpages.com/search?search_terms=Real+Estate+Agents&geo_location_terms=Miami%2C+FL"
headers = {"User-Agent": "Mozilla/5.0"}
resp = requests.get(url, headers=headers)
print("Status:", resp.status_code)

soup = BeautifulSoup(resp.text, "html.parser")
results = soup.select(".result")
print(f"Found {len(results)} results")

for res in results[:5]:
    name_el = res.select_one(".business-name")
    name = name_el.get_text(strip=True) if name_el else "None"
    
    phone_el = res.select_one(".phones")
    phone = phone_el.get_text(strip=True) if phone_el else "None"
    
    website_el = res.select_one("a.track-visit-website")
    website = website_el["href"] if website_el else "None"
    
    print(f"{name} | {phone} | {website}")
