from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
import io

class PDFReportService:
    @staticmethod
    def generate_scan_report(scan_results: dict) -> io.BytesIO:
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        styles = getSampleStyleSheet()
        elements = []

        # Title
        elements.append(Paragraph(f"Security Audit Report: {scan_results['url']}", styles['Title']))
        elements.append(Spacer(1, 12))

        # Overall Score
        score_color = colors.green if scan_results['score'] > 80 else colors.orange if scan_results['score'] > 50 else colors.red
        elements.append(Paragraph(f"Overall Security Score: <font color='{score_color.hexval()}'>{scan_results['score']}/100</font>", styles['Heading2']))
        elements.append(Spacer(1, 24))

        # SSL Section
        elements.append(Paragraph("SSL Certificate Status", styles['Heading3']))
        ssl_status = "Valid" if scan_results['ssl']['valid'] else "Invalid/Missing"
        elements.append(Paragraph(f"Status: {ssl_status}", styles['Normal']))
        elements.append(Paragraph(scan_results['ssl'].get('message', ''), styles['Normal']))
        elements.append(Spacer(1, 12))

        # Headers Section
        elements.append(Paragraph("Security Headers", styles['Heading3']))
        header_data = [["Header", "Found"]]
        for header, found in scan_results['headers'].get('headers_found', {}).items():
            header_data.append([header, "✅" if found else "❌"])
        
        t = Table(header_data, colWidths=[300, 100])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ]))
        elements.append(t)
        
        doc.build(elements)
        buffer.seek(0)
        return buffer
