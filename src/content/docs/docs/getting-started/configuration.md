---
title: Configuration
description: Configure Synclet via environment variables — database, sync behavior, SMTP, OIDC, and roles.
---

Synclet is configured entirely through environment variables. Set them in your shell, a `.env` file, or your container orchestrator's configuration.

## Required Settings

`DB_DSN` is the only variable Synclet truly requires — everything else has a built-in default. See [Environment Variables](/docs/reference/environment-variables/) for the full list.

| Variable | Description | Example |
|---|---|---|
| `DB_DSN` | PostgreSQL connection string. Must point to a PostgreSQL 16 database. | `postgres://user:pass@localhost:5432/synclet?sslmode=disable` |

## Production Secrets

Two variables have safe-for-local defaults that you should still override for any real deployment.

| Variable | Default behavior | Why you should set it |
|---|---|---|
| `AUTH_JWT_SECRET` | A new 32-byte secret is generated on every startup (logged as `WARN`). | Without an explicit value, **every restart invalidates all sessions** because the signing key changes. |
| `SECRET_ENCRYPTION_KEY` | Generated once and persisted to `<UserConfigDir>/synclet/encryption.key`. | Losing that file makes every stored connector credential **unrecoverable**. Setting the env var explicitly (from your secret manager) is safer than relying on the on-disk file. |

Generate either with `openssl rand -base64 32`.

:::tip
Run `synclet generate dotenv` to dump every available environment variable (with its current default) to a `.env` file — handy as a starting template.
:::

## Sync Behavior

Control how Synclet schedules and runs sync jobs.

| Variable | Default | Description |
|---|---|---|
| `DOCKER_EXECUTOR_JOB_WORKER_INTERVAL` | `1s` | How often the Docker executor worker checks for pending sync jobs to execute. Lower values reduce latency; higher values reduce database polling. |
| `PIPELINE_JOB_SCHEDULER_INTERVAL` | `30s` | How often the scheduler evaluates connection cron schedules and enqueues new jobs. |
| `DOCKER_EXECUTOR_MAX_SYNC_DURATION` | `24h` | Maximum allowed duration for a single sync job. Jobs exceeding this limit are terminated. |
| `PIPELINE_IDLE_TIMEOUT` | `10m` | If a running connector produces no output for this duration, the job is considered stalled and terminated. |
| `PIPELINE_MAX_CONCURRENT_JOBS` | `10` | Maximum number of sync jobs the pipeline scheduler will start concurrently. |

## Email Notifications

To enable email notifications for sync failures and completions, configure an SMTP server.

| Variable | Description |
|---|---|
| `NOTIFY_SMTP_HOST` | SMTP server hostname (e.g., `smtp.gmail.com`). |
| `NOTIFY_SMTP_PORT` | SMTP server port. Defaults to `587`. |
| `NOTIFY_SMTP_USER` | SMTP authentication username. |
| `NOTIFY_SMTP_PASSWORD` | SMTP authentication password or app-specific password. |
| `NOTIFY_SMTP_FROM` | Sender email address. Defaults to `noreply@synclet.io`. |

Email notifications are disabled when these variables are not set. You can still use Slack or Telegram notifications independently.

## Single Sign-On (OIDC)

Synclet supports any OpenID Connect (OIDC) identity provider. You can configure multiple providers simultaneously.

First, set the list of providers and the callback base URL:

| Variable | Description |
|---|---|
| `AUTH_OIDC_PROVIDERS` | Comma-separated list of provider slugs to enable (e.g., `google,okta`). OIDC is disabled when not set. |
| `AUTH_OIDC_CALLBACK_BASE_URL` | Base URL for OAuth callbacks (e.g., `https://synclet.example.com`). Required when `AUTH_OIDC_PROVIDERS` is set. |

Then, for each provider slug `<SLUG>`, set the following variables:

| Variable | Description |
|---|---|
| `AUTH_OIDC_<SLUG>_ISSUER` | The OIDC issuer URL for the provider. |
| `AUTH_OIDC_<SLUG>_CLIENT_ID` | The OAuth 2.0 client ID. |
| `AUTH_OIDC_<SLUG>_CLIENT_SECRET` | The OAuth 2.0 client secret. |
| `AUTH_OIDC_<SLUG>_DISPLAY_NAME` | *(optional)* Display name shown on the login button. Defaults to the slug. |
| `AUTH_OIDC_<SLUG>_SCOPES` | *(optional)* Comma-separated list of scopes. Defaults to `openid,profile,email`. |
| `AUTH_OIDC_<SLUG>_ALLOWED_DOMAINS` | *(optional)* Comma-separated list of allowed email domains. |
| `AUTH_OIDC_<SLUG>_AUTO_CREATE_USER` | *(optional)* Whether to auto-create users on first login. Defaults to `true`. |

Replace `<SLUG>` with an uppercase identifier for your provider (e.g., `GOOGLE`, `OKTA`, `KEYCLOAK`).

**Example: Google OIDC**

```bash
AUTH_OIDC_PROVIDERS="google"
AUTH_OIDC_CALLBACK_BASE_URL="https://synclet.example.com"
AUTH_OIDC_GOOGLE_ISSUER="https://accounts.google.com"
AUTH_OIDC_GOOGLE_CLIENT_ID="123456789.apps.googleusercontent.com"
AUTH_OIDC_GOOGLE_CLIENT_SECRET="GOCSPX-xxxxxxxxxxxxxxxx"
```

**Example: Multiple providers**

```bash
AUTH_OIDC_PROVIDERS="google,okta"
AUTH_OIDC_CALLBACK_BASE_URL="https://synclet.example.com"

# Google
AUTH_OIDC_GOOGLE_ISSUER="https://accounts.google.com"
AUTH_OIDC_GOOGLE_CLIENT_ID="..."
AUTH_OIDC_GOOGLE_CLIENT_SECRET="..."

# Okta
AUTH_OIDC_OKTA_ISSUER="https://your-org.okta.com"
AUTH_OIDC_OKTA_CLIENT_ID="..."
AUTH_OIDC_OKTA_CLIENT_SECRET="..."
```

When OIDC is configured, a "Sign in with ..." button appears on the login page for each provider.

## User Registration

| Variable | Default | Description |
|---|---|---|
| `AUTH_REGISTRATION_ENABLED` | `true` | Set to `false` to prevent new users from creating accounts. Existing users and OIDC logins are not affected. Useful after your team has been onboarded. |

## Workspaces and Roles

Synclet supports multiple workspaces, each with its own set of sources, destinations, connections, and team members. Every workspace has three roles:

- **Admin** — Full access. Can manage workspace settings, invite members, and change roles.
- **Editor** — Can create and modify sources, destinations, and connections. Cannot manage members or workspace settings.
- **Viewer** — Read-only access. Can view configurations, job history, and logs but cannot make changes.

Workspaces and roles are managed through the dashboard. No environment variables are required.

## Next Steps

- [Quick Start](/docs/getting-started/quick-start/) — Create your first sync with the configuration in place.
- [Installation](/docs/getting-started/installation/) — Go back to installation if you haven't set up Synclet yet.
