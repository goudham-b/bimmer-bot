# syntax=docker/dockerfile:1

FROM python:3.13-slim

# System dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    nodejs \
    npm \
    supervisor \
    && rm -rf /var/lib/apt/lists/*

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /app


# API dependencies
COPY api/pyproject.toml api/uv.lock ./api/
WORKDIR /app/api

RUN uv sync --frozen

# Webapp dependencies
WORKDIR /app/webapp
COPY webapp/package*.json ./
RUN npm ci


WORKDIR /app

COPY api ./api
COPY webapp ./webapp


COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf


EXPOSE 8000
EXPOSE 5173

CMD ["supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
