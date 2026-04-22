from fastapi import APIRouter, Response
from app.services.pdf_gen import PDFReportService

router = APIRouter()

@router.post("/generate")
async def create_report(results: dict):
    # This expects the results dictionary returned by the scanner
    pdf_buffer = PDFReportService.generate_scan_report(results)
    
    headers = {
        'Content-Disposition': 'attachment; filename="security_report.pdf"'
    }
    return Response(pdf_buffer.getvalue(), headers=headers, media_type='application/pdf')
