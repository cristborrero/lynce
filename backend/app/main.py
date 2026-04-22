from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import os
from dotenv import load_dotenv
import sentry_sdk

from app.api.scan import router as scan_router
from app.api.billing import router as billing_router

load_dotenv()

SENTRY_DSN = os.getenv("SENTRY_DSN")
if SENTRY_DSN:
    sentry_sdk.init(
        dsn=SENTRY_DSN,
        # Set traces_sample_rate to 1.0 to capture 100%
        # of transactions for performance monitoring.
        traces_sample_rate=1.0,
        # Set profiles_sample_rate to 1.0 to profile 100%
        # of transactions.
        profiles_sample_rate=1.0,
    )

limiter = Limiter(key_func=get_remote_address)
app = FastAPI(
    title="LYNCE API", description="CMS Security Auditing SaaS Backend", version="0.1.0"
)

# Rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "LYNCE API is running", "version": "0.1.0"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


app.include_router(scan_router, prefix="/api/v1")
app.include_router(billing_router, prefix="/api/v1")
