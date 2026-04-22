FROM python:3.11

# Install system dependencies for WeasyPrint
# Note: libgdk-pixbuf2.0-0 is replaced by libgdk-pixbuf-xlib-2.0-0 in newer Debian versions
RUN apt-get update && apt-get install -y \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libcairo2 \
    libgdk-pixbuf-xlib-2.0-0 \
    libffi-dev \
    shared-mime-info \
    gir1.2-pango-1.0 \
    gir1.2-gdkpixbuf-2.0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Render should be configured to map port 8000
EXPOSE 8000

# Standard exec form CMD
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
