from fastapi import Request
from app.core.auth import get_optional_user

async def tier_rate_limit(request: Request):
    # Default for unauthenticated or free
    limit = "5/hour"
    
    user_context = await get_optional_user(request)
    if user_context:
        profile = user_context.get("profile")
        tier = profile.get("tier", "free") if profile else "free"
        
        if tier == "pro":
            limit = "100/hour"
        elif tier == "agency":
            limit = "500/hour"
            
    return limit
