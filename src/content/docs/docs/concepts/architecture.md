---
title: Architecture Overview
description: How Synclet moves data — the sync flow, execution modes, reliability features, and security model.
---

## The Big Picture

Synclet ships as a **single Go binary** that bundles the API server, job scheduler, and sync workers into one process. There is no message queue, no sidecar, and no external coordinator to operate — just Synclet and a PostgreSQL database.

Data movement follows the [Airbyte connector protocol](https://docs.airbyte.com/understanding-airbyte/airbyte-protocol). When a sync runs, Synclet spawns connector containers (source and destination) and orchestrates the data flow between them. The high-level lifecycle looks like this:

1. You create a **connection** that links a source to a destination and set a cron schedule.
2. The built-in **scheduler** triggers a sync job when the schedule fires (or you trigger it manually).
3. A **worker** picks up the job, starts the source and destination connectors, and pipes data through.
4. As data flows, **state checkpoints** are saved so that interrupted syncs can resume where they left off.
5. When the sync completes, results (record counts, duration, errors) are recorded and any configured [notifications](/docs/guides/notifications/) are sent.

## Execution Modes

Synclet supports two ways to run connector containers. Choose the one that matches your infrastructure.

### Docker (Default)

The simplest option. Synclet communicates with the local Docker daemon, pulls connector images, and manages container lifecycles on the same machine.

- Containers run alongside Synclet on the host.
- Data streams between source and destination in-process — no intermediate storage.
- Only requires Docker to be installed. No Kubernetes, no cloud services.

This is the recommended mode for single-server deployments and local development.

### Kubernetes

Each sync job becomes a **Kubernetes Job** containing a single pod with three containers:

| Container | Role |
|---|---|
| **Orchestrator** | Synclet sidecar that coordinates the source and destination |
| **Source** | Airbyte source connector (reads data) |
| **Destination** | Airbyte destination connector (writes data) |

Resource limits (CPU, memory) are applied per container. Completed jobs are automatically cleaned up. This mode is ideal for production deployments where you need horizontal scaling and resource isolation.

See [Kubernetes Deployment](/docs/deployment/kubernetes/) for setup instructions.


## Reliability

Synclet is designed to handle transient failures, crashes, and stuck connectors without manual intervention.

### Automatic Retries

When a sync attempt fails, Synclet retries it immediately. By default, each job gets up to **3 attempts** before being marked as failed. You can configure the retry count per connection. Permanent failures (such as OOM kills or segfaults) and intentional terminations are not retried.

### Heartbeat Monitoring

While a sync is running, workers send heartbeat signals every **5 seconds**. If a worker stops responding (crash, OOM kill, network partition), Synclet detects the stall and terminates the job so it can be retried.

### Orphan Cleanup

If Synclet restarts while syncs are in progress, those containers become orphans. A background process checks for orphaned containers every **5 minutes** and cleans them up.

### Graceful Cancellation

When you cancel a running sync (or Synclet shuts down), it sends `SIGTERM` to the connector containers and waits up to **30 seconds** for them to finish writing any buffered data. If containers do not stop within the grace period, they are forcefully terminated.

## Data Flow

Every sync follows a five-step data flow:

1. **Source emits RECORD messages** — The source connector reads data from the external system and outputs it as Airbyte RECORD messages, one per row.
2. **Records are routed to the destination** — Synclet streams records from the source directly to the destination connector.
3. **Source emits STATE checkpoints** — Periodically, the source outputs a STATE message indicating how far it has read (e.g., "all rows up to `updated_at = 2025-06-01`").
4. **Destination confirms the checkpoint** — After the destination has successfully written all records up to a STATE message, it acknowledges the checkpoint.
5. **State is persisted** — Synclet saves the confirmed checkpoint to the database. The next sync starts from this point.

If a sync fails mid-way, no data is lost. The next attempt resumes from the **last confirmed checkpoint**, re-reading only the data that was not yet committed to the destination.

## Security

### Credential Encryption

All connector credentials (database passwords, API keys, OAuth tokens) are encrypted at rest using **AES-256-GCM**. The encryption key is configured via the `SECRET_ENCRYPTION_KEY` environment variable and never stored in the database. See [Configuration](/docs/getting-started/configuration/) for details.

### Container Isolation

- **Docker mode** — Connector containers are started with **no network access by default**. Synclet communicates with containers through stdin/stdout pipes, not over the network.
- **Kubernetes mode** — The orchestrator sidecar runs as **non-root** with a **read-only root filesystem**. All containers (orchestrator, source, and destination) have privilege escalation disabled and all Linux capabilities dropped. Network policies can further restrict traffic.

### OAuth Token Refresh

For connectors that use OAuth (e.g., Google Sheets, Salesforce), Synclet automatically refreshes access tokens before they expire. You configure OAuth credentials once and Synclet handles the token lifecycle.

## Next Steps

- [Connectors & Airbyte Protocol](/docs/concepts/connectors/) — Learn how connectors work and how to add new ones.
- [Sync Modes](/docs/concepts/sync-modes/) — Understand the different ways data can be read and written.
- [Installation](/docs/getting-started/installation/) — Get Synclet running on your infrastructure.
