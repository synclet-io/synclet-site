---
title: Production Checklist
description: Run Synclet reliably in production — SSL, monitoring, backups, performance.
---

This checklist covers the essentials for running Synclet in production. Work through each section before going live.

## Security

### Strong secrets

Generate cryptographically secure secrets. Never use default or weak values.

```bash
# JWT signing key
export JWT_SECRET="$(openssl rand -base64 32)"

# AES-256 encryption key for stored credentials (must be 32 bytes, base64-encoded)
export ENCRYPTION_KEY="$(openssl rand -base64 32)"
```

Store secrets in a secret manager (HashiCorp Vault, AWS Secrets Manager, Kubernetes Secrets) rather than plain text files.

### HTTPS / TLS

Always terminate TLS in front of Synclet. Options:

- **Reverse proxy** -- Nginx, Caddy, or Traefik with a Let's Encrypt certificate.
- **Kubernetes Ingress** -- Enable `server.ingress.tls` in the [Helm chart](/docs/deployment/kubernetes/).
- **Cloud load balancer** -- AWS ALB, GCP HTTPS LB, etc.

### Disable open registration

After creating your admin account, disable public registration:

```bash
export REGISTRATION_ENABLED="false"
```

### OIDC single sign-on

For teams, configure an OIDC provider (Google, Okta, etc.) instead of local passwords. See [Environment Variables](/docs/reference/environment-variables/) for the `OIDC_PROVIDER_*` settings.

### Container network isolation

Run Synclet and connector containers on an isolated Docker network. Connectors should only reach the data sources they need -- not internal services or the host network.

## Database

| Requirement | Detail |
|---|---|
| Engine | PostgreSQL **16 or later** |
| Managed service | Recommended (RDS, Cloud SQL, Azure Database) for automated backups and failover |
| Connection pooling | Use PgBouncer or your cloud provider's connection pooler for high-concurrency workloads |
| Backups | Enable automated daily backups with at least 7-day retention |

### Connection string

```bash
export DSN="postgres://synclet:password@db.example.com:5432/synclet?sslmode=require"
```

Always use `sslmode=require` or `sslmode=verify-full` in production.

## Monitoring

### Health endpoint

```bash
curl -f https://synclet.example.com/health
# HTTP 200 = healthy
```

Wire this into your uptime monitor (Pingdom, UptimeRobot, etc.).

### Prometheus

Synclet exposes metrics at `/metrics`. Scrape it with Prometheus:

```yaml
scrape_configs:
  - job_name: synclet
    static_configs:
      - targets: ["synclet:8080"]
```

On Kubernetes, enable the ServiceMonitor in the [Helm chart](/docs/deployment/kubernetes/).

### Grafana dashboards

Import the bundled Grafana dashboards or build your own from the exposed metrics. Key panels to track:

- Active syncs and queue depth
- Sync duration (p50, p95, p99)
- Error rate by pipeline
- Database connection pool usage

### Alerting

Recommended alerts:

- Health endpoint returns non-200 for more than 2 minutes.
- Sync failure rate exceeds threshold.
- Sync duration exceeds `MAX_SYNC_DURATION`.

## Backup Strategy

| What | How | Frequency |
|---|---|---|
| PostgreSQL | `pg_dump` or managed-service snapshots | Daily (minimum) |
| Restore test | Restore into a staging instance | Monthly |

Automate all of the above and **test restores regularly**. A backup you have never restored is not a backup.

## Performance Tuning

| Variable | Description | Default | Guidance |
|---|---|---|---|
| `WORKER_INTERVAL` | How often workers poll for new jobs | `1s` | Lower = faster pickup, higher CPU. 1-5 s is typical. |
| `SCHEDULER_INTERVAL` | How often the scheduler evaluates cron triggers | `30s` | 15-60 s depending on schedule granularity. |
| `MAX_SYNC_DURATION` | Hard timeout for a single sync | `24h` | Set based on your largest dataset. |
| `IDLE_TIMEOUT` | Kill a sync if no data flows for this long | `10m` | Increase for slow sources. |

### Container resource limits

For Docker deployments, set memory and CPU limits on the Synclet container:

```bash
docker run -d \
  --memory=2g \
  --cpus=1 \
  ...
  synclet
```

For Kubernetes, configure limits in the Helm values:

```yaml
server:
  resources:
    requests:
      memory: "512Mi"
      cpu: "250m"
    limits:
      memory: "2Gi"
      cpu: "1000m"
```

## High Availability (Kubernetes)

For zero-downtime deployments, use **distributed mode**:

```yaml
mode: distributed
server:
  replicaCount: 2     # stateless API — scale horizontally
```

Key considerations:

- **Persistent volumes** -- Use a PVC for any log or state directories if you want data to survive pod restarts. Alternatively, ship logs to an external store.
- **Database** -- Use a managed PostgreSQL with multi-AZ or a replicated cluster. Synclet does not manage database HA.
- **Connection pooling** -- With multiple replicas, a connection pooler (PgBouncer) prevents exhausting the database connection limit.

See [Kubernetes deployment](/docs/deployment/kubernetes/) for the full Helm reference.

## Upgrade Strategy

1. **Read the release notes** for breaking changes.
2. **Back up** the database and configuration before major upgrades.
3. **Pull the new image** or download the new binary.
4. **Restart Synclet** -- migrations run automatically on startup. No manual `migrate up` needed for standard upgrades.
5. **Verify** -- Check `/health`, review the dashboard, and confirm a test sync completes.

For Kubernetes, use rolling updates (the default Helm strategy). The readiness probe ensures traffic only routes to healthy pods.
