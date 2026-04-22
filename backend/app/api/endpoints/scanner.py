from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, HttpUrl
from app.services.scanner import ScannerService
from datetime import datetime

router = APIRouter()

class ScanRequest(BaseModel):
    url: HttpUrl

@router.post("/")
async def start_scan(request: ScanRequest):
    url = str(request.url)
    
    # In a real SaaS, this would be a background task (Celery/RQ/etc.)
    # For MVP, we'll run it inline or use FastAPI's BackgroundTasks
    
    ssl_result = await ScannerService.check_ssl(url)
    header_result = await ScannerService.check_headers(url)
    wp_result = await ScannerService.detect_wp_version(url)
    
    # Calculate score (Simplified for MVP)
    score = 100
    if not ssl_result.get("valid"): score -= 40
    if header_result.get("score"): score -= (100 - header_result["score"]) * 0.3
    if wp_result.get("exposed"): score -= 10
    
    results = {
        "url": url,
        "timestamp": datetime.utcnow().isoformat(),
        "score": max(0, int(score)),
        "ssl": ssl_result,
        "headers": header_result,
        "wordpress": wp_result,
        "wpscan": {"status": "skipped", "message": "WPScan integration pending"}
    }
    
    return results
