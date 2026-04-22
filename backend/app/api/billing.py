from fastapi import APIRouter, HTTPException, Depends, Request, Response
from pydantic import BaseModel
import stripe
import os
from app.core.auth import require_auth, generate_api_key
from app.db.supabase import get_supabase

router = APIRouter(prefix="/billing", tags=["billing"])

stripe.api_key = os.environ.get("STRIPE_SECRET_KEY")
webhook_secret = os.environ.get("STRIPE_WEBHOOK_SECRET")

# Plan mapping - you should replace these with your actual Stripe Price IDs
PRICE_IDS = {
    "pro": os.environ.get("STRIPE_PRICE_PRO", "price_pro_placeholder"),
    "agency": os.environ.get("STRIPE_PRICE_AGENCY", "price_agency_placeholder")
}

class CheckoutRequest(BaseModel):
    tier: str

@router.post("/checkout")
async def create_checkout_session(req: CheckoutRequest, user_context: dict = Depends(require_auth)):
    if req.tier not in PRICE_IDS:
        raise HTTPException(status_code=400, detail="Invalid tier")

    user = user_context["user"]
    profile = user_context["profile"]
    
    # Check if they already have a customer ID
    customer_id = profile.get("stripe_customer_id") if profile else None

    try:
        if not customer_id:
            customer = stripe.Customer.create(
                email=user.email,
                metadata={"supabase_uuid": user.id}
            )
            customer_id = customer.id
            supabase = get_supabase()
            supabase.table("profiles").update({"stripe_customer_id": customer_id}).eq("id", user.id).execute()

        # Create checkout session
        frontend_url = os.environ.get("NEXT_PUBLIC_SITE_URL", "http://localhost:3000")
        session = stripe.checkout.Session.create(
            customer=customer_id,
            payment_method_types=["card"],
            line_items=[{
                "price": PRICE_IDS[req.tier],
                "quantity": 1,
            }],
            mode="subscription",
            success_url=f"{frontend_url}/dashboard?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{frontend_url}/dashboard",
            metadata={"tier": req.tier, "user_id": user.id}
        )

        return {"url": session.url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/webhook")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, webhook_secret
        )
    except ValueError as e:
        # Invalid payload
        return Response(status_code=400)
    except stripe.error.SignatureVerificationError as e:
        # Invalid signature
        return Response(status_code=400)

    # Handle the event
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        
        # Determine the user and tier
        user_id = session.get("metadata", {}).get("user_id")
        tier = session.get("metadata", {}).get("tier")
        subscription_id = session.get("subscription")
        
        if user_id and tier:
            supabase = get_supabase()
            # Update user profile tier
            supabase.table("profiles").update({
                "tier": tier,
                "stripe_subscription_id": subscription_id
            }).eq("id", user_id).execute()
            
    elif event['type'] == 'customer.subscription.deleted':
        subscription = event['data']['object']
        # Downgrade user back to free if subscription fails/canceled
        # Find user by subscription_id
        supabase = get_supabase()
        supabase.table("profiles").update({
            "tier": "free",
        }).eq("stripe_subscription_id", subscription.id).execute()

    return Response(status_code=200)

@router.post("/api-keys")
async def create_api_key(user_context: dict = Depends(require_auth)):
    profile = user_context["profile"]
    
    # Only agency tier can create API keys
    if not profile or profile.get("tier") != "agency":
        raise HTTPException(status_code=403, detail="API keys are only available on the Agency tier")
        
    api_key = generate_api_key()
    
    supabase = get_supabase()
    res = supabase.table("profiles").update({"api_key": api_key}).eq("id", user_context["user"].id).execute()
    
    if not res.data:
        raise HTTPException(status_code=500, detail="Failed to generate API key")
        
    return {"api_key": api_key}
