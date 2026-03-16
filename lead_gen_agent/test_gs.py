from googlesearch import search
results = search('site:linkedin.com/in/ "Real Estate Agent" "Miami, FL"', num_results=5, advanced=True)
for r in results:
    print(type(r))
    print(dir(r))
    try:
        print(f"Title: {r.title}")
        print(f"URL: {r.url}")
        print(f"Description: {r.description}")
    except Exception as e:
        print("Error accessing attributes:", e)
