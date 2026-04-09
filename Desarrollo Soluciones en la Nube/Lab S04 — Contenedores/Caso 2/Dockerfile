# Imagen base
FROM python:3.11-slim

LABEL maintainer="tu-email@ejemplo.com"
LABEL description="Consulta masiva ONPE 2026 - Excel + Selenium + Chromium"

# Chromium y ChromeDriver directo desde apt (sin descargas externas)
RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium \
    chromium-driver \
    ca-certificates \
    fonts-liberation \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app.py .
COPY consulta_onpe.xlsx .

EXPOSE 5000

CMD ["python", "app.py"]