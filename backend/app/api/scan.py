from fastapi import APIRouter, HTTPException, Depends, Request, Response
from pydantic import BaseModel
from typing import Dict, Any, List
from app.services.scanner import scan_site
from app.db.supabase import get_supabase
from app.services.pdf_generator import generate_report_pdf
from slowapi import Limiter
from slowapi.util import get_remote_address
from app.core.auth import get_optional_user
from datetime import datetime

router = APIRouter(prefix="/scan", tags=["scans"])
limiter = Limiter(key_func=get_remote_address)

# Admin emails that always have full access regardless of DB tier
ADMIN_EMAILS = {"cristborrero@gmail.com"}


def _get_effective_tier(user, profile: dict) -> str:
    """Resolve the effective tier for a user.
    
    Admin emails always get 'agency'. If no profile exists (empty dict/None),
    fall back to 'agency' for authenticated users (avoids broken onboarding).
    """
    if user and getattr(user, "email", None) in ADMIN_EMAILS:
        return "agency"
    tier = profile.get("tier", "free") if profile else "free"
    return tier


class ScanRequest(BaseModel):
    url: str


class ScanResponse(BaseModel):
    scan_id: str
    url: str
    overall_score: int
    data: Dict[str, Any]


@router.post("/", response_model=ScanResponse)
@limiter.limit("100/hour")
async def create_scan(
    request: Request, scan_req: ScanRequest, auth: dict = Depends(get_optional_user)
):
    url = scan_req.url
    user = auth.get("user") if auth else None
    profile = auth.get("profile") if auth else {}

    if not url.startswith("http"):
        raise HTTPException(
            status_code=422,
            detail="Invalid URL format. Must start with http:// or https://",
        )

    supabase = get_supabase()

    # Tier Limit Check (only if logged in and not admin)
    if auth and user:
        tier = _get_effective_tier(user, profile)
        if tier == "free":
            # Count scans this month
            first_of_month = (
                datetime.now()
                .replace(day=1, hour=0, minute=0, second=0, microsecond=0)
                .isoformat()
            )
            res = (
                supabase.table("scans")
                .select("id", count="exact")
                .eq("user_id", user.id)
                .gte("created_at", first_of_month)
                .execute()
            )
            count = res.count if res.count is not None else 0
            if count >= 3:
                raise HTTPException(
                    status_code=403,
                    detail="Free tier limit reached (3 scans/month). Please upgrade to Pro.",
                )
    else:
        pass

    try:
        # 1. Run the scan
        results = await scan_site(url)

        # 2. Save to Scan History
        scan_entry = {
            "user_id": str(user.id) if user else None,
            "target_url": url,
            "score": results["overall_score"],
            "status": "completed",
        }

        hist_res = supabase.table("scans").insert(scan_entry).execute()
        if not hist_res.data:
            raise HTTPException(status_code=500, detail="Failed to save scan history")

        scan_id = hist_res.data[0]["id"]

        # 3. Save findings
        findings_to_insert = []
        for category, check in results.get("checks", {}).items():
            findings_to_insert.append(
                {
                    "scan_id": scan_id,
                    "category": category.upper(),
                    "severity": check.get("severity", "low"),
                    "title": check.get("title"),
                    "description": check.get("description"),
                    "recommendation": check.get("recommendation"),
                }
            )

        if findings_to_insert:
            supabase.table("findings").insert(findings_to_insert).execute()

        return {
            "scan_id": scan_id,
            "url": url,
            "overall_score": results["overall_score"],
            "data": results,
        }
    except Exception as e:
        import traceback

        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Scan failed: {str(e)}")


@router.get("/history")
async def get_history(auth: dict = Depends(get_optional_user)):
    if not auth or not auth.get("user"):
        raise HTTPException(
            status_code=401, detail="Authentication required to view history"
        )
    user = auth["user"]
    supabase = get_supabase()
    res = (
        supabase.table("scans")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", desc=True)
        .limit(20)
        .execute()
    )
    return res.data


@router.get("/{scan_id}")
async def get_scan(scan_id: str, auth: dict = Depends(get_optional_user)):
    supabase = get_supabase()
    user = auth.get("user") if auth else None

    # Fetch record
    res = supabase.table("scans").select("*").eq("id", scan_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Scan record not found")

    record = res.data[0]

    # If the record has a user_id, ensure it matches the current user
    if record.get("user_id") and (not user or str(user.id) != record["user_id"]):
        raise HTTPException(status_code=403, detail="Not authorized to view this scan")

    # Fetch findings
    findings = supabase.table("findings").select("*").eq("scan_id", scan_id).execute()

    return {"scan": record, "findings": findings.data if findings.data else []}


@router.get("/{scan_id}/pdf")
async def get_scan_pdf(scan_id: str, auth: dict = Depends(get_optional_user)):
    user = auth.get("user") if auth else None
    profile = auth.get("profile") if auth else {}

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Authentication required to download PDF reports.",
        )

    tier = _get_effective_tier(user, profile)
    if tier == "free":
        raise HTTPException(
            status_code=403,
            detail="PDF reports are a Pro/Agency feature. Please upgrade.",
        )

    supabase = get_supabase()
    # Fetch scan metadata — admin can access any scan
    query = supabase.table("scans").select("*").eq("id", scan_id)
    if getattr(user, "email", None) not in ADMIN_EMAILS:
        query = query.eq("user_id", str(user.id))

    scan_res = query.execute()
    if not scan_res.data:
        raise HTTPException(status_code=404, detail="Scan not found")

    # Fetch findings
    findings_res = (
        supabase.table("findings").select("*").eq("scan_id", scan_id).execute()
    )

    # Generate PDF
    pdf_buffer = generate_report_pdf(
        scan_res.data[0], findings_res.data if findings_res.data else []
    )
    filename = f"lynce-report-{str(scan_id)[:8]}.pdf"

    return Response(
        content=pdf_buffer.getvalue(),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
