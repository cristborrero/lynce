
import asyncio
import time
from app.services.scanner import scan_site
import os

async def main():
    # Ensure keys are mocked if not present to avoid API wait/fail
    os.environ["WPSCAN_API_KEY"] = os.environ.get("WPSCAN_API_KEY", "dummy")
    os.environ["GOOGLE_SAFE_BROWSING_API_KEY"] = os.environ.get("GOOGLE_SAFE_BROWSING_API_KEY", "dummy")
    
    url = "https://wordpress.org"
    print(f"Starting scan for {url}...")
    
    start_time = time.time()
    results = await scan_site(url)
    end_time = time.time()
    
    duration_ms = (end_time - start_time) * 1000
    print(f"Scan completed in {duration_ms:.2f}ms")
    print(f"Overall Score: {results['overall_score']}")
    
    if duration_ms < 800:
        print("PERFORMANCE PASS: < 800ms")
    else:
        print(f"PERFORMANCE FAIL: {duration_ms:.2f}ms > 800ms")

if __name__ == "__main__":
    asyncio.run(main())
