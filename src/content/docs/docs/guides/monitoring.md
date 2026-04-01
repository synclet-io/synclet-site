---
title: Monitoring & Jobs
description: Dashboard, job history, logs, Prometheus metrics.
---

Synclet provides built-in tools for monitoring your data syncs — a real-time dashboard, detailed job history, per-connector logs, and Prometheus-compatible metrics for external observability.

## Dashboard

The dashboard is the landing page after you log in. It provides a high-level view of your workspace's sync health.

### Overview Stats

- **Total connections** — How many connections exist in the workspace.
- **Active syncs** — How many syncs are currently running.
- **Recent failures** — Connections that failed in the last 24 hours.
- **Records synced** — Total records moved over a selected time range.

### Health Indicators

Each connection shows a status badge:

| Status | Meaning |
|---|---|
| **Active** | Connection is enabled and syncs run on schedule. |
| **Inactive** | Connection is disabled. No syncs are scheduled. |
| **Paused** | Connection is temporarily paused (e.g., due to schema change policy). |

### Sync Timeline

The dashboard includes a timeline chart showing sync activity over the past 24 hours, 7 days, or 30 days. Each bar represents a sync job, color-coded by status. Hover over a bar to see the connection name, duration, and record count.

## Job History

Every sync run creates a job. You can browse all jobs from the **Jobs** page in the sidebar.

### Job States

| State | Description |
|---|---|
| **Scheduled** | The job is enqueued and waiting for a worker. |
| **Starting** | The job is initializing (pulling connector image, preparing workspace). |
| **Running** | The job is actively syncing data. |
| **Completed** | The job completed successfully. |
| **Failed** | The job failed after exhausting all retry attempts. |
| **Cancelled** | The job was manually cancelled by a user. |

### Filtering

You can filter the job list by:

- **Connection** — Show jobs for a specific connection.
- **Status** — Show only failed, succeeded, or running jobs.
- **Date range** — Narrow down to a specific time period.

Click any job to view its details.

## Job Detail

The job detail page shows everything about a specific sync run.

### Attempt Breakdown

Each job may have multiple attempts if retries are configured. For each attempt, you can see:

- **Start time** and **end time**.
- **Duration**.
- **Status** — whether the attempt succeeded or failed.
- **Error message** — if the attempt failed, the connector's error output.

### Sync Stats

For each attempt, the job detail shows aggregate sync statistics:

| Metric | Description |
|---|---|
| **Records read** | Number of records read from the source. |
| **Bytes synced** | Data volume transferred. |
| **Duration** | Time spent on this attempt. |

### Errors

If a job failed, the error section shows the connector's error output with timestamps. Common errors include authentication failures, schema mismatches, network timeouts, and rate limit violations.

## Logs

Synclet captures logs from each connector during a sync. Logs are available per attempt in the job detail view.

### Log Levels

| Level | Description |
|---|---|
| **INFO** | Normal operational messages — records processed, state checkpoints. |
| **WARN** | Non-fatal issues — skipped records, deprecated features, approaching limits. |
| **ERROR** | Failures that caused the sync to stop — authentication errors, connection drops. |

Logs can be filtered by level to focus on warnings and errors during troubleshooting.

:::tip
If `PIPELINE_LOG_STORE_DIR` is configured, logs are stored on disk instead of the database. This is recommended for high-volume workloads to keep the database lean. See [Configuration](/docs/getting-started/configuration/) for details.
:::

## Prometheus Metrics

Synclet exposes a Prometheus-compatible metrics endpoint for integration with external monitoring systems like Grafana.

### Metrics Endpoint

```
GET /metrics
```

This endpoint returns metrics in the Prometheus exposition format.

### Key Metrics

| Metric | Type | Description |
|---|---|---|
| `synclet_syncs_total` | Counter | Total number of syncs by workspace, connection, and status. |
| `synclet_sync_duration_seconds` | Histogram | Duration of sync operations in seconds. |
| `synclet_records_synced_total` | Counter | Total records synced by workspace, connection, and direction. |
| `synclet_bytes_synced_total` | Counter | Total bytes synced by workspace and connection. |
| `synclet_active_syncs` | Gauge | Number of currently running syncs. |
| `synclet_failed_syncs_total` | Counter | Total number of failed syncs by workspace and connection. |
| `synclet_pending_jobs` | Gauge | Number of pending jobs in the queue. |
| `synclet_connector_sync_duration_seconds` | Histogram | Duration of sync operations by connector type. |

### Kubernetes ServiceMonitor

If you run Synclet on Kubernetes with the Prometheus Operator, create a `ServiceMonitor` to scrape metrics automatically:

```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: synclet
  labels:
    app: synclet
spec:
  selector:
    matchLabels:
      app: synclet
  endpoints:
    - port: http
      path: /metrics
      interval: 30s
```

## Health Endpoint

Synclet provides a health check endpoint for load balancers and orchestration tools.

```
GET /health
```

Returns `200 OK` when the service is healthy and connected to the database. Returns `503 Service Unavailable` if the database connection is down.

Example:

```bash
curl -s http://localhost:8080/health
```

```json
{"status": "ok"}
```

## Next Steps

- [Scheduling & Triggers](/docs/guides/scheduling/) — Configure when syncs run and how retries work.
- [Notifications](/docs/guides/notifications/) — Get alerted when syncs fail.
- [Environment Variables](/docs/reference/environment-variables/) — Configure metrics, log storage, and health check settings.
