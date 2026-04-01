---
title: Configuration
description: Configure Synclet via environment variables — database, sync behavior, SMTP, OIDC, and roles.
---

Synclet is configured entirely through environment variables. Set them in your shell, a `.env` file, or your container orchestrator's configuration.

## Required Settings

These variables must be set before Synclet can start.

| Variable | Description | Example |
|---|---|---|
| `DSN` | PostgreSQL connection string. Must point to a PostgreSQL 16 database. | `postgres://user:pass@localhost:5432/synclet?sslmode=disable` |
| `JWT_SECRET` | Secret key used to sign authentication tokens. Must be at least 32 characters. | Generate with: `openssl rand -hex 32` |
| `ENCRYPTION_KEY` | Key used to encrypt sensitive configuration values (connector credentials, API keys) at rest. Must be a base64-encoded 32-byte key. | Generate with: `openssl rand -base64 32` |

:::caution
Keep `JWT_SECRET` and `ENCRYPTION_KEY` safe. Losing them means existing sessions are invalidated and encrypted credentials become unreadable. Back them up securely.
:::

## Sync Behavior

Control how Synclet schedules and runs sync jobs.

| Variable | Default | Description |
|---|---|---|
| `PIPELINE_WORKER_INTERVAL` | `1s` | How often the worker checks for pending sync jobs to execute. Lower values reduce latency; higher values reduce database polling. |
| `PIPELINE_SCHEDULER_INTERVAL` | `30s` | How often the scheduler evaluates connection cron schedules and enqueues new jobs. |
| `PIPELINE_MAX_SYNC_DURATION` | `24h` | Maximum allowed duration for a single sync job. Jobs exceeding this limit are terminated. |
| `PIPELINE_IDLE_TIMEOUT` | `10m` | If a running connector produces no output for this duration, the job is considered stalled and terminated. |

## Email Notifications

To enable email notifications for sync failures and completions, configure an SMTP server.

| Variable | Description |
|---|---|
| `SMTP_HOST` | SMTP server hostname (e.g., `smtp.gmail.com`). |
| `SMTP_PORT` | SMTP server port. Defaults to `587`. |
| `SMTP_USER` | SMTP authentication username. |
| `SMTP_PASSWORD` | SMTP authentication password or app-specific password. |
| `SMTP_FROM` | Sender email address. Defaults to `noreply@synclet.io`. |

Email notifications are disabled when these variables are not set. You can still use Slack or Telegram notifications independently.

## Single Sign-On (OIDC)

Synclet supports any OpenID Connect (OIDC) identity provider. You can configure multiple providers simultaneously.

First, set the list of providers and the callback base URL:

| Variable | Description |
|---|---|
| `OIDC_PROVIDERS` | Comma-separated list of provider slugs to enable (e.g., `google,okta`). OIDC is disabled when not set. |
| `OIDC_CALLBACK_BASE_URL` | Base URL for OAuth callbacks (e.g., `https://synclet.example.com`). Required when `OIDC_PROVIDERS` is set. |

Then, for each provider slug `<SLUG>`, set the following variables:

| Variable | Description |
|---|---|
| `OIDC_<SLUG>_ISSUER` | The OIDC issuer URL for the provider. |
| `OIDC_<SLUG>_CLIENT_ID` | The OAuth 2.0 client ID. |
| `OIDC_<SLUG>_CLIENT_SECRET` | The OAuth 2.0 client secret. |
| `OIDC_<SLUG>_DISPLAY_NAME` | *(optional)* Display name shown on the login button. Defaults to the slug. |
| `OIDC_<SLUG>_SCOPES` | *(optional)* Comma-separated list of scopes. Defaults to `openid,profile,email`. |
| `OIDC_<SLUG>_ALLOWED_DOMAINS` | *(optional)* Comma-separated list of allowed email domains. |
| `OIDC_<SLUG>_AUTO_CREATE_USER` | *(optional)* Whether to auto-create users on first login. Defaults to `true`. |

Replace `<SLUG>` with an uppercase identifier for your provider (e.g., `GOOGLE`, `OKTA`, `KEYCLOAK`).

**Example: Google OIDC**

```bash
OIDC_PROVIDERS="google"
OIDC_CALLBACK_BASE_URL="https://synclet.example.com"
OIDC_GOOGLE_ISSUER="https://accounts.google.com"
OIDC_GOOGLE_CLIENT_ID="123456789.apps.googleusercontent.com"
OIDC_GOOGLE_CLIENT_SECRET="GOCSPX-xxxxxxxxxxxxxxxx"
```

**Example: Multiple providers**

```bash
OIDC_PROVIDERS="google,okta"
OIDC_CALLBACK_BASE_URL="https://synclet.example.com"

# Google
OIDC_GOOGLE_ISSUER="https://accounts.google.com"
OIDC_GOOGLE_CLIENT_ID="..."
OIDC_GOOGLE_CLIENT_SECRET="..."

# Okta
OIDC_OKTA_ISSUER="https://your-org.okta.com"
OIDC_OKTA_CLIENT_ID="..."
OIDC_OKTA_CLIENT_SECRET="..."
```

When OIDC is configured, a "Sign in with ..." button appears on the login page for each provider.

## User Registration

| Variable | Default | Description |
|---|---|---|
| `REGISTRATION_ENABLED` | `true` | Set to `false` to prevent new users from creating accounts. Existing users and OIDC logins are not affected. Useful after your team has been onboarded. |

## Workspaces and Roles

Synclet supports multiple workspaces, each with its own set of sources, destinations, connections, and team members. Every workspace has three roles:

- **Admin** — Full access. Can manage workspace settings, invite members, and change roles.
- **Editor** — Can create and modify sources, destinations, and connections. Cannot manage members or workspace settings.
- **Viewer** — Read-only access. Can view configurations, job history, and logs but cannot make changes.

Workspaces and roles are managed through the dashboard. No environment variables are required.

## Next Steps

- [Quick Start](/docs/getting-started/quick-start/) — Create your first sync with the configuration in place.
- [Installation](/docs/getting-started/installation/) — Go back to installation if you haven't set up Synclet yet.
