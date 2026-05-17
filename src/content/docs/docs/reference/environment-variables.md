---
title: Environment Variables
description: Complete reference of all Synclet environment variables.
---

Synclet is configured entirely through environment variables. Set them in your shell, a `.env` file, Docker Compose, or Kubernetes Secrets.

## Required

These must be set before starting the server.

| Variable | Description | Default |
|---|---|---|
| `DB_DSN` | PostgreSQL connection string. Example: `postgres://user:pass@host:5432/synclet?sslmode=require` | *none* |
| `AUTH_JWT_SECRET` | Secret key used to sign authentication tokens. Must be at least 32 bytes. | *none* |
| `SECRET_ENCRYPTION_KEY` | AES-256 key for encrypting stored connector credentials. Must be exactly 32 bytes, base64-encoded. | *none* |

Generate secure values:

```bash
# AUTH_JWT_SECRET
openssl rand -base64 32

# SECRET_ENCRYPTION_KEY (32 random bytes, base64-encoded)
openssl rand -base64 32
```

:::tip
You can generate a `.env` file with all available variables and their defaults by running `synclet generate dotenv`.
:::

## General

| Variable | Description | Default |
|---|---|---|
| `ENVIRONMENT` | Runtime environment. Accepts `development`, `production`, `test` (and short forms). | `development` |

## Server

| Variable | Description | Default |
|---|---|---|
| `PUBLIC_HTTP_SERVER_ADDR` | Address and port the public HTTP server binds to. | `0.0.0.0:8080` |
| `INTERNAL_HTTP_SERVER_ADDR` | Address and port the internal (cluster-only) HTTP server binds to. Used by executors in distributed mode. | `0.0.0.0:8080` |
| `WORKSPACE_FRONTEND_URL` | Public URL of the frontend. Used for email links (e.g., workspace invitations). | `http://localhost:5173` |

## Sync Behavior

| Variable | Description | Default |
|---|---|---|
| `DOCKER_EXECUTOR_JOB_WORKER_INTERVAL` | How often the Docker executor worker polls for pending sync jobs. | `1s` |
| `PIPELINE_JOB_SCHEDULER_INTERVAL` | How often the scheduler evaluates pipeline cron schedules. | `30s` |
| `DOCKER_EXECUTOR_MAX_SYNC_DURATION` | Maximum time a single sync can run before being killed (Docker executor). | `24h` |
| `PIPELINE_MAX_CONCURRENT_JOBS` | Maximum number of sync jobs the pipeline scheduler will start concurrently. | `10` |
| `DOCKER_EXECUTOR_MAX_CONCURRENT_JOBS` | Maximum number of sync jobs the Docker executor processes concurrently. | `5` |
| `PIPELINE_IDLE_TIMEOUT` | Kill a sync if no data has been emitted for this duration. Prevents stuck connectors from running indefinitely. | `10m` |
| `PIPELINE_JOB_WATCHDOG_INTERVAL` | How often the watchdog checks for stale jobs (no heartbeat). | `10s` |
| `DOCKER_EXECUTOR_JOB_RESOURCE_CLEANUP_INTERVAL` | How often orphaned Docker containers are cleaned up. | `5m` |
| `DOCKER_EXECUTOR_HEARTBEAT_INTERVAL` | How often the Docker executor sync worker emits a heartbeat. | `5s` |
| `PIPELINE_CONNECTOR_TASK_RUNNING_TIMEOUT` | Timeout for an in-progress connector task (check, spec, discover). | `5m` |
| `PIPELINE_CONNECTOR_TASK_PENDING_TIMEOUT` | Timeout for a connector task that has not started running. | `1m` |
| `PIPELINE_CONNECTOR_TASK_RETENTION` | How long completed connector task results are kept. | `24h` |

### Resource Defaults

Default container resource limits for connectors. These can be overridden per source/destination.

| Variable | Description | Default |
|---|---|---|
| `PIPELINE_RUNTIME_CPU_REQUEST` | Default CPU request for connector containers. | *none* |
| `PIPELINE_RUNTIME_CPU_LIMIT` | Default CPU limit for connector containers. | *none* |
| `PIPELINE_RUNTIME_MEMORY_REQUEST` | Default memory request for connector containers. | *none* |
| `PIPELINE_RUNTIME_MEMORY_LIMIT` | Default memory limit for connector containers. | *none* |
| `PIPELINE_RUNTIME_SERVICE_ACCOUNT_NAME` | Default Kubernetes service account for connector pods. | *none* |

## Email (SMTP)

Required if you want Synclet to send email notifications (alerts, invitations). If `NOTIFY_SMTP_HOST` is not set, email delivery is disabled.

| Variable | Description | Default |
|---|---|---|
| `NOTIFY_SMTP_HOST` | SMTP server hostname. | *none* |
| `NOTIFY_SMTP_PORT` | SMTP server port. | `587` |
| `NOTIFY_SMTP_USER` | SMTP authentication username. | *none* |
| `NOTIFY_SMTP_PASSWORD` | SMTP authentication password. | *none* |
| `NOTIFY_SMTP_FROM` | Sender address for outgoing emails. | `noreply@synclet.io` |

## Authentication

| Variable | Description | Default |
|---|---|---|
| `AUTH_REGISTRATION_ENABLED` | Allow new users to register via the sign-up form. Set to `false` after creating your admin account. | `true` |
| `AUTH_SECURE_COOKIES` | Set to `true` to mark authentication cookies as `Secure` (requires HTTPS). | `false` |
| `AUTH_ACCESS_TOKEN_TTL` | Lifetime of access tokens. | `15m` |
| `AUTH_REFRESH_TOKEN_TTL` | Lifetime of refresh tokens. | `168h` |
| `AUTH_MIN_PASSWORD_LENGTH` | Minimum length for new passwords. | `8` |

## Workspaces

| Variable | Description | Default |
|---|---|---|
| `WORKSPACE_MODE` | Workspace mode. `single` creates one default workspace and auto-joins every user to it. `multi` allows multiple workspaces with explicit membership. | `single` |
| `WORKSPACE_INVITE_TTL` | How long workspace invitation links remain valid. | `168h` |

## OIDC Providers

Configure one or more OIDC providers for single sign-on. Set `AUTH_OIDC_PROVIDERS` to a comma-separated list of provider slugs, then configure each provider with `AUTH_OIDC_<SLUG>_*` variables.

| Variable | Description |
|---|---|
| `AUTH_OIDC_PROVIDERS` | Comma-separated list of provider slugs (e.g., `google,okta`). Required to enable OIDC. |
| `AUTH_OIDC_CALLBACK_BASE_URL` | Base URL for OIDC callback redirects. Required when `AUTH_OIDC_PROVIDERS` is set. |
| `AUTH_OIDC_<SLUG>_ISSUER` | OIDC issuer URL (e.g., `https://accounts.google.com`). |
| `AUTH_OIDC_<SLUG>_CLIENT_ID` | OAuth client ID from your identity provider. |
| `AUTH_OIDC_<SLUG>_CLIENT_SECRET` | OAuth client secret. |
| `AUTH_OIDC_<SLUG>_DISPLAY_NAME` | Human-readable name shown in the UI. Defaults to the slug. |
| `AUTH_OIDC_<SLUG>_SCOPES` | Comma-separated list of OIDC scopes. Default: `openid,profile,email`. |
| `AUTH_OIDC_<SLUG>_DEFAULT_ROLE` | Default role for auto-created users. Default: `viewer`. |
| `AUTH_OIDC_<SLUG>_AUTO_CREATE_USER` | Auto-create users on first login. Default: `true`. |
| `AUTH_OIDC_<SLUG>_ALLOWED_DOMAINS` | Comma-separated list of allowed email domains. |
| `AUTH_OIDC_<SLUG>_ROLE_CLAIM` | OIDC claim to use for role mapping (e.g., `groups`). |
| `AUTH_OIDC_<SLUG>_ROLE_MAP_ADMIN` | Claim value that maps to the Admin role. |
| `AUTH_OIDC_<SLUG>_ROLE_MAP_EDITOR` | Claim value that maps to the Editor role. |
| `AUTH_OIDC_<SLUG>_ROLE_MAP_VIEWER` | Claim value that maps to the Viewer role. |
| `AUTH_OIDC_<SLUG>_BOUND_CLAIM_<NAME>` | Require a specific claim value for authentication (e.g., `AUTH_OIDC_OKTA_BOUND_CLAIM_DEPARTMENT=engineering`). |

### Example: Google

```bash
export AUTH_OIDC_PROVIDERS="google"
export AUTH_OIDC_CALLBACK_BASE_URL="https://synclet.example.com"
export AUTH_OIDC_GOOGLE_CLIENT_ID="123456.apps.googleusercontent.com"
export AUTH_OIDC_GOOGLE_CLIENT_SECRET="GOCSPX-abc123"
export AUTH_OIDC_GOOGLE_ISSUER="https://accounts.google.com"
```

You can configure multiple providers by adding slugs to `AUTH_OIDC_PROVIDERS` (e.g., `google,okta`) and setting the corresponding `AUTH_OIDC_<SLUG>_*` variables for each.

## Kubernetes

These are only needed when running with the Kubernetes executor (`synclet k8s-executor` or `synclet server --standalone` inside a K8s pod).

| Variable | Description | Default |
|---|---|---|
| `K8S_EXECUTOR_NAMESPACE` | Kubernetes namespace for sync Job resources. | *none* |
| `K8S_EXECUTOR_KUBECONFIG` | Path to kubeconfig file. If unset, uses in-cluster config. | *none* |
| `K8S_EXECUTOR_IMAGE_PULL_SECRET` | Image pull secret name for private container registries. | *none* |
| `K8S_EXECUTOR_SYNCLET_IMAGE` | Synclet image used for the orchestrator sidecar container. | *none* |
| `K8S_EXECUTOR_SERVER_ADDR` | Address of the Synclet internal API server (used by orchestrator pods). | *none* |
| `K8S_EXECUTOR_DEFAULT_MEMORY` | Default memory limit for sync Job pods. | `2Gi` |
| `K8S_EXECUTOR_DEFAULT_CPU` | Default CPU limit for sync Job pods. | `1` |

## Distributed Mode

These are only needed when running executors in distributed (RPC) mode, where the executor connects to the API server instead of accessing the database directly.

| Variable | Description | Default |
|---|---|---|
| `EXECUTOR_API_URL` | URL of the Synclet internal API server. | *none* |
| `EXECUTOR_API_TOKEN` | Shared secret token for executor authentication. | *none* |
| `INTERNAL_HTTP_SERVER_EXECUTOR_API_TOKEN` | Token the internal HTTP server validates against. Must match `EXECUTOR_API_TOKEN` on executor side. | *none* |

## Secret Rotation

| Variable | Description | Default |
|---|---|---|
| `SECRET_ENCRYPTION_KEY_PREVIOUS` | Previous encryption key (base64-encoded). When set, Synclet can decrypt credentials encrypted with the old key and re-encrypt them with the current key. | *none* |

## Generating Secrets

Use `openssl` to generate production-grade secrets:

```bash
# JWT secret (base64, 32 bytes)
openssl rand -base64 32

# Encryption key (base64, 32 bytes)
openssl rand -base64 32
```

**Security notes:**

- Never commit secrets to version control.
- Use a secret manager (HashiCorp Vault, AWS Secrets Manager, Kubernetes Secrets, Doppler) in production.
- Rotate secrets periodically. After rotating `AUTH_JWT_SECRET`, all users will need to re-authenticate. After rotating `SECRET_ENCRYPTION_KEY`, set the old key as `SECRET_ENCRYPTION_KEY_PREVIOUS` so existing credentials can be re-encrypted transparently.
