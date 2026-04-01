---
title: Authentication & SSO
description: Setting up authentication, OIDC SSO, and API keys.
---

Synclet supports multiple authentication methods: email and password for quick setup, OpenID Connect (OIDC) for enterprise single sign-on, and API keys for programmatic access.

## Email & Password

Email and password is the default authentication method. When you first access Synclet, you can create an account from the login page.

1. Open the Synclet web UI in your browser.
2. Click **Create account**.
3. Enter your email address, your name, and choose a password (minimum 12 characters).
4. Submit the form. You are logged in and can start creating workspaces.

The first user to register is automatically assigned the Admin role on the default workspace.

## Single Sign-On (OIDC)

Synclet supports any OpenID Connect identity provider, including Google, Okta, Auth0, Keycloak, and Azure AD. You can configure multiple providers simultaneously.

### Configuration

OIDC setup requires two steps: (1) list the providers you want to enable, and (2) set per-provider credentials.

**Step 1: Declare providers**

Set `OIDC_PROVIDERS` to a comma-separated list of provider slugs, and `OIDC_CALLBACK_BASE_URL` to your public Synclet URL:

```bash
OIDC_PROVIDERS="google,okta"
OIDC_CALLBACK_BASE_URL="https://synclet.example.com"
```

**Step 2: Configure each provider**

For each slug listed in `OIDC_PROVIDERS`, set the following environment variables (replace `<SLUG>` with the uppercase slug):

| Variable | Description | Required |
|---|---|---|
| `OIDC_<SLUG>_ISSUER` | The OIDC issuer URL | Yes |
| `OIDC_<SLUG>_CLIENT_ID` | OAuth 2.0 client ID | Yes |
| `OIDC_<SLUG>_CLIENT_SECRET` | OAuth 2.0 client secret | Yes |
| `OIDC_<SLUG>_DISPLAY_NAME` | Button label on login page | No (defaults to slug) |
| `OIDC_<SLUG>_SCOPES` | Comma-separated scopes | No (defaults to `openid,profile,email`) |
| `OIDC_<SLUG>_ALLOWED_DOMAINS` | Restrict to email domains | No |
| `OIDC_<SLUG>_AUTO_CREATE_USER` | Create user on first login | No (defaults to `true`) |
| `OIDC_<SLUG>_DEFAULT_ROLE` | Role for new OIDC users | No (defaults to `viewer`) |

### Example: Google

```bash
OIDC_PROVIDERS="google"
OIDC_CALLBACK_BASE_URL="https://synclet.example.com"
OIDC_GOOGLE_ISSUER="https://accounts.google.com"
OIDC_GOOGLE_CLIENT_ID="123456789.apps.googleusercontent.com"
OIDC_GOOGLE_CLIENT_SECRET="GOCSPX-xxxxxxxxxxxxxxxx"
OIDC_GOOGLE_DISPLAY_NAME="Google"
OIDC_GOOGLE_ALLOWED_DOMAINS="yourcompany.com"
```

### Example: Multiple providers (Google + Okta)

```bash
OIDC_PROVIDERS="google,okta"
OIDC_CALLBACK_BASE_URL="https://synclet.example.com"

# Google
OIDC_GOOGLE_ISSUER="https://accounts.google.com"
OIDC_GOOGLE_CLIENT_ID="123456789.apps.googleusercontent.com"
OIDC_GOOGLE_CLIENT_SECRET="GOCSPX-xxxxxxxxxxxxxxxx"

# Okta
OIDC_OKTA_ISSUER="https://your-org.okta.com"
OIDC_OKTA_CLIENT_ID="0oaXXXXXXXXXXXXXXX"
OIDC_OKTA_CLIENT_SECRET="your-client-secret"
OIDC_OKTA_DISPLAY_NAME="Company SSO"
```

When OIDC is configured, a **Sign in with ...** button appears on the login page for each provider. Users who sign in through OIDC for the first time have an account created automatically (unless `AUTO_CREATE_USER` is set to `false`).

## Disabling Registration

Once your team is onboarded, you can prevent new sign-ups by setting:

```bash
REGISTRATION_ENABLED=false
```

This blocks new email/password registrations. Existing users and OIDC logins are not affected — users who authenticate through an OIDC provider can still sign in and have accounts created on first login.

## API Keys

API keys allow programmatic access to the Synclet API, useful for CI/CD pipelines, scripts, and integrations.

### Creating an API Key

1. Navigate to **Settings > API Keys** in the workspace you want to access.
2. Click **Create API Key**.
3. Give the key a descriptive name (e.g., `ci-pipeline` or `terraform`).
4. Copy the key immediately — it is only shown once.

### Using an API Key

Include the key in the `Authorization` header of your HTTP requests:

```bash
curl -H "Authorization: Bearer synclet_sk_your_api_key_here" \
  https://synclet.example.com/api/v1/connections
```

### Revoking an API Key

1. Go to **Settings > API Keys**.
2. Find the key you want to revoke.
3. Click **Revoke** and confirm.

Revoked keys stop working immediately. Any automation using the key will begin receiving `401 Unauthorized` responses.

:::caution
API keys have the same permissions as the role of the user who created them within that workspace. Treat them like passwords — do not commit them to version control.
:::

## Session Management

Synclet uses cookie-based sessions for authentication.

- **Access token cookie** (`synclet_at`) is short-lived (15 minutes) and sent automatically with every request from the web UI. It is `HttpOnly` and not accessible to JavaScript.
- **Refresh token cookie** (`synclet_rt`) allows the browser to obtain new access tokens without re-entering credentials.
- A **metadata cookie** (`synclet_auth`) is readable by JavaScript and contains token expiration timestamps so the frontend can proactively refresh tokens.
- Sessions persist across browser restarts until the refresh token expires (7 days by default) or is revoked.

To log out, click your avatar in the top-right corner and select **Log out**. This clears your session cookies and invalidates the refresh token.

## Next Steps

- [Workspaces & Roles](/docs/concepts/workspaces-and-roles/) — Learn about multi-tenant workspaces and role-based access.
- [Settings & API Keys](/docs/guides/settings/) — Manage workspace settings, members, and API keys.
- [Configuration](/docs/getting-started/configuration/) — Full list of environment variables including OIDC and registration settings.
