import asyncio
from app.services.scanner import scan_site
import json

async def main():
    target = "https://wordpress.org"
    print(f"--- Starting Scan for {target} ---")
    results = await scan_site(target)
    print(json.dumps(results, indent=2))

if __name__ == "__main__":
    asyncio.run(main())
