FROM python:3.12-slim

# Prevents .pyc files being written to disk
ENV PYTHONDONTWRITEBYTECODE=1
# Prevents Python buffering stdout/stderr (critical for Docker logs)
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# System dependencies required by psycopg2 and Pillow
RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies first
# Docker caches this layer — only rebuilds if requirements.txt changes
COPY requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "2", "--reload"]