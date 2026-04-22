import asyncio
import os
import sys
from dotenv import load_dotenv

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app.services.scanner import scan_site

async def main():
    load_dotenv(dotenv_path='backend/.env')
    url = "https://wordpress.org"
    print(f"Scanning {url}...")
    result = await scan_site(url)
    
    blacklist_res = result['checks']['blacklist']
    print("\n--- Blacklist Check Results ---")
    print(f"Status: {blacklist_res['status']}")
    print(f"Title: {blacklist_res['title']}")
    print(f"Description: {blacklist_res['description']}")
    
    if blacklist_res['status'] == 'warning' and 'skipped' in blacklist_res['title'].lower():
        print("\n[!] WARNING: Blacklist check still returned 'skipped'.")
    else:
        print("\n[+] SUCCESS: Blacklist check returned a real result.")

if __name__ == "__main__":
    asyncio.run(main())
