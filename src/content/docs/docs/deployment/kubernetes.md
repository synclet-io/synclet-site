---
title: Kubernetes
description: Deploy on Kubernetes with Helm chart.
---

Synclet provides a Helm chart for Kubernetes deployments, supporting both a simple single-pod setup and a distributed architecture where each sync runs as a separate Kubernetes Job.

## Helm Installation

Install from the OCI registry:

```bash
helm install synclet oci://ghcr.io/synclet-io/charts/synclet \
  -f values.yaml \
  --namespace synclet \
  --create-namespace
```

To install a specific version:

```bash
helm install synclet oci://ghcr.io/synclet-io/charts/synclet \
  --version 0.1.2 \
  -f values.yaml \
  --namespace synclet \
  --create-namespace
```

A minimal `values.yaml`:

```yaml
auth:
  jwtSecret: "your-jwt-secret"
encryption:
  key: "your-base64-encoded-32-byte-key"
```

The chart includes a built-in PostgreSQL by default. To use an external database, disable the built-in one and configure `externalDatabase`:

```yaml
postgresql:
  enabled: false
externalDatabase:
  host: "db.example.com"
  port: 5432
  user: "synclet"
  password: "password"
  database: "synclet"
  sslmode: require
```

Upgrade after changing values:

```bash
helm upgrade synclet oci://ghcr.io/synclet-io/charts/synclet -f values.yaml -n synclet
```

## Key Helm Values

| Value | Description | Default |
|---|---|---|
| `mode` | Deployment mode: `standalone` or `distributed` | `standalone` |
| `server.replicaCount` | Number of server replicas | `1` |
| `server.resources.requests.cpu` | CPU request | `250m` |
| `server.resources.requests.memory` | Memory request | `512Mi` |
| `server.resources.limits.cpu` | CPU limit | `2` |
| `server.resources.limits.memory` | Memory limit | `1Gi` |
| `server.ingress.enabled` | Enable Ingress resource | `true` |
| `server.ingress.hostname` | Ingress hostname | `synclet.local` |
| `server.ingress.tls` | Enable TLS on Ingress | `false` |

## Standalone vs Distributed

### Standalone mode

A single pod runs the API server, scheduler, and sync workers together. This is the simplest setup and works well for small-to-medium workloads.

```yaml
mode: standalone
server:
  replicaCount: 1
```

Connectors run as Docker containers inside the Synclet pod (requires Docker-in-Docker or a mounted socket).

### Distributed mode

Three separate Deployments run the server, jobs worker, and executor. The executor launches connector pods as Kubernetes Jobs, giving you native resource isolation and scaling.

```yaml
mode: distributed
server:
  replicaCount: 2     # API replicas (stateless)
```

Benefits of distributed mode:

- **Isolation** -- A failing sync cannot crash the API server.
- **Scaling** -- Kubernetes schedules sync Jobs across the cluster.
- **Resource control** -- Set CPU/memory limits per sync via Helm values.
- **Observability** -- Each sync is a distinct Job with its own logs.

See [Production Checklist](/docs/deployment/production/) for sizing guidance.

## TLS / HTTPS

Enable TLS on the Ingress with cert-manager:

```yaml
server:
  ingress:
    enabled: true
    hostname: synclet.example.com
    tls: true
    annotations:
      cert-manager.io/cluster-issuer: letsencrypt-prod
```

Make sure [cert-manager](https://cert-manager.io/) is installed in your cluster. The chart creates the Ingress resource and TLS secret automatically.

## Health Checks

The chart configures liveness and readiness probes by default:

```yaml
server:
  livenessProbe:
    httpGet:
      path: /health
      port: 8080
    initialDelaySeconds: 10
    periodSeconds: 15
  readinessProbe:
    httpGet:
      path: /health
      port: 8080
    initialDelaySeconds: 5
    periodSeconds: 10
```

The `GET /health` endpoint returns HTTP 200 when the server is ready to accept requests.

## Monitoring

### Prometheus ServiceMonitor

If you run the [Prometheus Operator](https://prometheus-operator.dev/), enable the ServiceMonitor:

```yaml
server:
  serviceMonitor:
    enabled: true
    interval: 30s
    labels:
      release: prometheus   # match your Prometheus selector
```

This automatically configures Prometheus to scrape the `/metrics` endpoint. See [Production Checklist](/docs/deployment/production/) for recommended Grafana dashboards and alerting rules.
