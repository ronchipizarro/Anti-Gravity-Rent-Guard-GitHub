import pprint
from playwright.sync_api import sync_playwright
import requests

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
    )
    page = context.new_page()
    search_query = 'site:linkedin.com/in/ "Real Estate Agent" OR "Broker" "Miami, FL"'
    page.goto("https://www.bing.com/search?q=" + requests.utils.quote(search_query), timeout=60000)
    page.wait_for_load_state("domcontentloaded")
    
    with open("bing_dump.html", "w", encoding="utf-8") as f:
        f.write(page.content())
    
    browser.close()
    print("Dumped to bing_dump.html")
