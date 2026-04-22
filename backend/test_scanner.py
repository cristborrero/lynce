import asyncio
from app.services.scanner import ScannerService

async def test_scanner():
    url = "https://wordpress.org"
    print(f"Scanning {url}...")
    
    ssl_result = await ScannerService.check_ssl(url)
    print(f"SSL: {ssl_result}")
    
    header_result = await ScannerService.check_headers(url)
    print(f"Headers Score: {header_result.get('score')}")
    
    wp_result = await ScannerService.detect_wp_version(url)
    print(f"WP Detection: {wp_result}")

if __name__ == "__main__":
    asyncio.run(test_scanner())
