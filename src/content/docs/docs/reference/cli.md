---
title: CLI Commands
description: Complete reference for the synclet CLI.
---

Synclet is distributed as a single binary. All operations — running the server, managing migrations, and executing syncs — are subcommands of `synclet`.

## Commands

| Command | Description |
|---|---|
| `synclet server` | Start the API server. |
| `synclet server --standalone` | Start the API server with background jobs and sync executor in a single process. |
| `synclet jobs` | Run background jobs (scheduler, workers) as a separate process. |
| `synclet docker-executor` | Run the Docker sync executor daemon. |
| `synclet k8s-executor` | Run the Kubernetes sync executor daemon. |
| `synclet migrate up` | Apply all pending database migrations. |
| `synclet migrate down` | Roll back the last applied migration. |
| `synclet migrate status` | Show migration status. |
| `synclet migrate create <module> <name>` | Create a new migration file. |

## Global Flags

| Flag | Description |
|---|---|
| `--dotenv <path>` | Load environment variables from the specified `.env` file(s). Can be repeated. |
| `--version` | Print the Synclet version. |

## Server

`synclet server` starts the HTTP API. In **standalone mode** (`--standalone`), it also starts background jobs (scheduler, workers) and the sync executor in the same process — this is the simplest way to run Synclet.

```bash
# Start in standalone mode (API + jobs + executor in one process)
DB_DSN=postgres://user:pass@localhost:5432/synclet \
JWT_SECRET=your-secret \
SECRET_ENCRYPTION_KEY=your-base64-key \
synclet server --standalone

# Load config from a .env file
synclet server --standalone --dotenv .env
```

In standalone mode, the executor is automatically selected: Docker on regular hosts, Kubernetes when running inside a K8s pod.

The public HTTP server binds to `0.0.0.0:8080` by default (configurable via `PUBLIC_HTTP_SERVER_ADDR`). See [Environment Variables](/docs/reference/environment-variables/) for the full list of configuration options.

### Distributed Mode

For larger deployments, you can run the API server, background jobs, and executor as separate processes:

```bash
# Process 1: API server only
synclet server

# Process 2: Background jobs
synclet jobs

# Process 3: Docker executor
synclet docker-executor

# Or Kubernetes executor
synclet k8s-executor
```

The `docker-executor` and `k8s-executor` commands also accept a `--standalone` flag to use direct DB access instead of connecting to the API server via RPC.

## Migrations

Database migrations run automatically when the server starts. You can also run them manually:

```bash
# Apply all pending migrations
synclet migrate up

# Roll back the last migration
synclet migrate down

# Check migration status
synclet migrate status

# Create a new migration file
synclet migrate create auth add_api_tokens
```

The `--module` flag can be used with `up`, `down`, and `status` to target a specific module.

Migrations are idempotent — running `migrate up` on an already up-to-date database is a no-op.
