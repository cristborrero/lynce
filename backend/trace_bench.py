
import asyncio
import time
from app.services.scanner import ScannerEngine
from urllib.parse import urlparse
import os

async def main():
    # Ensure keys are mocked if not present to avoid API wait/fail
    os.environ["WPSCAN_API_KEY"] = os.environ.get("WPSCAN_API_KEY", "dummy")
    os.environ["GOOGLE_SAFE_BROWSING_API_KEY"] = os.environ.get("GOOGLE_SAFE_BROWSING_API_KEY", "dummy")
    
    url = "https://wordpress.org"
    hostname = urlparse(url).hostname
    domain = ".".join(hostname.split(".")[-2:])
    engine = ScannerEngine()
    
    checks = [
        ("ssl_check", engine.ssl_check(url)),
        ("headers_check", engine.headers_check(url)),
        ("wordpress_check", engine.wordpress_check(url)),
        ("sensitive_files_check", engine.sensitive_files_check(url)),
        ("blacklist_check", engine.blacklist_check(url)),
        ("wp_vulnerability_check", engine.wp_vulnerability_check(url)),
        ("ssl_labs_check", engine.ssl_labs_check(hostname)),
        ("domain_security_check", engine.domain_security_check(hostname)),
        ("tech_fingerprint", engine.tech_fingerprint(url)),
        ("email_security_check", engine.email_security_check(domain))
    ]
    
    print(f"Timing checks for {url}...")
    
    for name, coro in checks:
        start = time.time()
        await coro
        end = time.time()
        print(f"{name:25}: {(end-start)*1000:7.2f}ms")

if __name__ == "__main__":
    asyncio.run(main())
