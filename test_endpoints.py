import httpx
import asyncio
import json

BASE_URL = "http://localhost:8000/api/v1"

async def test_endpoints():
    async with httpx.AsyncClient(timeout=30) as client:
        # 1. Test POST /scan
        print("\n--- Testing POST /api/v1/scan ---")
        scan_payload = {"url": "https://wordpress.org"}
        response = await client.post(f"{BASE_URL}/scan/", json=scan_payload)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            scan_data = response.json()
            scan_id = scan_data["scan_id"]
            print(f"Scan ID: {scan_id}")
            print(f"Score: {scan_data['overall_score']}")
            
            # 2. Test GET /scan/{scan_id}
            print(f"\n--- Testing GET /api/v1/scan/{scan_id} ---")
            response = await client.get(f"{BASE_URL}/scan/{scan_id}")
            print(f"Status: {response.status_code}")
            if response.status_code == 200:
                print("Successfully fetched scan details and findings.")
        else:
            print(f"Error: {response.text}")

        # 3. Test GET /history
        print("\n--- Testing GET /api/v1/scan/history ---")
        response = await client.get(f"{BASE_URL}/scan/history")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            history = response.json()
            print(f"Fetched {len(history)} recent scans.")

if __name__ == "__main__":
    asyncio.run(test_endpoints())
