from fastapi import APIRouter
from app.api.endpoints import scanner, reports

router = APIRouter()

router.include_router(scanner.router, prefix="/scan", tags=["Scanner"])
router.include_router(reports.router, prefix="/reports", tags=["Reports"])
