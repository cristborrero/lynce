# Stripe Integration Placeholder for future tiers (Free/Pro/Agency)
# This module will handle subscription management and payment verification.

def get_tier_limits(tier: str):
    """
    Returns limits for the specified tier.
    Tiers: 'free', 'pro', 'agency'
    """
    tiers = {
        "free": {"scans_per_month": 5, "pdf_reports": False},
        "pro": {"scans_per_month": 50, "pdf_reports": True},
        "agency": {"scans_per_month": 500, "pdf_reports": True},
    }
    return tiers.get(tier, tiers["free"])

def create_checkout_session(user_id: str, tier: str):
    # TODO: Implement Stripe Checkout Session creation
    pass

def verify_subscription(user_id: str):
    # TODO: Implement Stripe subscription verification logic
    return True
