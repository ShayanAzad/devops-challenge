# ── Build stage ──────────────────────────────────────────────────────────────
FROM python:3.11-slim AS builder

WORKDIR /app

# Install deps into a prefix so the runtime image stays clean
COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# ── Runtime stage ─────────────────────────────────────────────────────────────
FROM python:3.11-slim

# Non-root user for security
RUN adduser --disabled-password --gecos "" appuser

WORKDIR /app

# Pull only the installed packages from the builder stage
COPY --from=builder /install /usr/local
COPY main.py .

USER appuser

EXPOSE 8000

# Use exec form (no shell wrapper) and enable access log for observability
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", \
     "--workers", "2", "--access-log"]