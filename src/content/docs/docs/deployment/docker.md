---
title: Docker
description: Deploy Synclet with Docker Compose or standalone Docker.
---

Synclet ships as a single container image. The fastest way to get running is Docker Compose, which bundles PostgreSQL alongside Synclet. You can also run the container standalone or skip Docker entirely with a bare binary.

## Docker Compose (Recommended)

Docker Compose starts both PostgreSQL 16 and Synclet in one command.

```bash
git clone https://github.com/synclet/synclet.git
cd synclet
cp .env.dist .env   # edit .env with your secrets
docker compose up -d
```

The default `docker-compose.yml` includes:

- **PostgreSQL 16** — data stored in a named volume
- **Synclet** — API, scheduler, and workers in a single container

Once the containers are healthy, open the dashboard at **http://localhost:8080**.

### Customizing the Compose file

| Variable | Purpose | Default |
|---|---|---|
| `DSN` | PostgreSQL connection string | Set by Compose |
| `JWT_SECRET` | Token signing key | *must set* |
| `ENCRYPTION_KEY` | Base64-encoded 32-byte key for credentials | *must set* |
| `HTTP_SERVER_ADDR` | HTTP listen address | `0.0.0.0:8080` |

Generate secrets before first start:

```bash
# JWT_SECRET
openssl rand -base64 32

# ENCRYPTION_KEY (must be exactly 32 bytes, base64-encoded)
openssl rand -base64 32
```

## Docker Standalone

If you already have a PostgreSQL 16 instance, run Synclet on its own.

```bash
docker build -t synclet .
```

```bash
docker run -d \
  --name synclet \
  -p 8080:8080 \
  -e DSN="postgres://synclet:password@host.docker.internal:5432/synclet?sslmode=disable" \
  -e HTTP_SERVER_ADDR="0.0.0.0:8080" \
  -e JWT_SECRET="$(openssl rand -base64 32)" \
  -e ENCRYPTION_KEY="$(openssl rand -base64 32)" \
  -v /var/run/docker.sock:/var/run/docker.sock \
  synclet server --standalone
```

> **Note:** Synclet needs access to the Docker socket (`/var/run/docker.sock`) to launch Airbyte connector containers during syncs.

Verify the container is running:

```bash
docker logs synclet
```

## Binary (No Docker)

You can run Synclet as a plain binary without Docker.

1. Download the latest release from [GitHub Releases](https://github.com/synclet/synclet/releases).
2. Set the required environment variables (see [Environment Variables](/docs/reference/environment-variables/)).
3. Run migrations and start the server:

```bash
export DSN="postgres://synclet:password@localhost:5432/synclet?sslmode=disable"
export HTTP_SERVER_ADDR="0.0.0.0:8080"
export JWT_SECRET="your-jwt-secret"
export ENCRYPTION_KEY="your-encryption-key"

synclet migrate up
synclet server --standalone
```

The dashboard is available at `http://localhost:8080`.

> **Important:** Airbyte-protocol connectors still require Docker on the host. If you only use native Go connectors, Docker is not needed.

## Health Checks

Synclet exposes a health endpoint for load balancers and orchestrators:

```bash
curl http://localhost:8080/health
# Returns HTTP 200 when the server is ready
```

The default Synclet image is based on distroless and does not include `curl` or `wget`. To add Docker health checks, use a multi-stage build that includes a health-check binary, or check from outside the container:

```bash
# Health check from the host or a sidecar
curl -f http://localhost:8080/health
```

## Monitoring

- **Dashboard** — The built-in web UI at `http://localhost:8080` shows pipeline status, job history, and logs.
- **Prometheus metrics** — Synclet exposes a `/metrics` endpoint compatible with Prometheus. See [Production Checklist](/docs/deployment/production/) for scraping configuration.

## Backup & Restore

### Database backup

Back up your PostgreSQL database regularly:

```bash
pg_dump -Fc $DSN > synclet_$(date +%Y%m%d).dump

# Restore
pg_restore -d $DSN synclet_20260401.dump
```

