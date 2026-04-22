from fastapi import Depends, HTTPException, Security, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.db.supabase import get_supabase
import os
import secrets

security = HTTPBearer()

async def get_optional_user(request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        # Check if they have API Key
        api_key = request.headers.get("x-api-key")
        if api_key:
            supabase = get_supabase()
            res = supabase.table("profiles").select("*").eq("api_key", api_key).execute()
            if res.data:
                class DummyUser:
                    def __init__(self, uid):
                        self.id = uid
                return {
                    "user": DummyUser(res.data[0]["id"]),
                    "profile": res.data[0],
                    "is_api_key": True
                }
        return None
        
    try:
        # Support Bearer <token>
        if "Bearer " in auth_header:
            token = auth_header.split(" ")[1]
        else:
            token = auth_header
            
        supabase = get_supabase()
        user_response = supabase.auth.get_user(token)
        if user_response and user_response.user:
            user = user_response.user
            res = supabase.table("profiles").select("*").eq("id", user.id).execute()
            profile = res.data[0] if res.data else {}
            return {
                "user": user,
                "profile": profile,
                "token": token,
                "is_api_key": False
            }
    except Exception as e:
        print(f"Auth error: {e}")
        pass
        
    return None

async def require_auth(request: Request):
    user_context = await get_optional_user(request)
    if not user_context:
        raise HTTPException(status_code=401, detail="Authentication required (Bearer token or x-api-key)")
    return user_context

def generate_api_key():
    return "sg_live_" + secrets.token_hex(20)
