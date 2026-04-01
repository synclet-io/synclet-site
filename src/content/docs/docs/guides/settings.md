---
title: Settings & API Keys
description: Workspace settings, members, connector repos, API keys.
---

The Settings page lets you manage your workspace configuration, team members, connector repositories, notification channels, and API keys.

## Workspace Settings

### Name and Preferences

1. Go to **Settings > General**.
2. Update the workspace name or other preferences.
3. Click **Save**.

The workspace name appears in the sidebar, notifications, and exported configurations. Choose something descriptive, especially if your organization uses multiple workspaces (e.g., `Production`, `Staging`, `Analytics`).

## Members

Manage who has access to your workspace and what they can do.

### Viewing Members

Go to **Settings > Members** to see all current workspace members, their email addresses, and their roles.

### Inviting Members

1. Click **Invite Member**.
2. Enter the user's email address.
3. Select a role: **Admin**, **Editor**, or **Viewer**.
4. Click **Send Invite**.

The user receives an email with an invitation link containing a unique token. They can accept the invite to join the workspace. If they do not have a Synclet account yet, they will be prompted to create one (unless registration is disabled). You can also resend or revoke pending invitations from the members list.

### Changing Roles

1. Find the member in the list.
2. Click the role dropdown next to their name.
3. Select the new role.

Role changes take effect immediately.

### Removing Members

1. Find the member in the list.
2. Click **Remove** and confirm.

Removed members lose access to the workspace immediately. Their past actions (created connections, triggered syncs) remain in the history.

For a detailed explanation of what each role can do, see [Workspaces & Roles](/docs/concepts/workspaces-and-roles/).

## Connector Repositories

Synclet discovers connectors from registries. By default, the official Airbyte connector registry is included.

### Default Registry

The Airbyte connector registry provides access to 300+ pre-built source and destination connectors. It is enabled by default and requires no configuration.

### Adding a Custom Repository

If you maintain custom connectors or use a private registry:

1. Go to **Settings > Connector Repositories**.
2. Click **Add Repository**.
3. Enter the repository URL and any required authentication details.
4. Click **Save**.

Custom connectors appear alongside default connectors when adding sources and destinations. Custom registries are checked in addition to the default registry.

:::tip
Custom repositories are useful for organizations that build proprietary connectors for internal systems or need to pin specific connector versions for stability.
:::

## Notification Channels

Manage your workspace's notification channels from **Settings > Notification Channels**. From here you can:

- View all configured channels (Slack, Email, Telegram).
- Add new channels.
- Edit or delete existing channels.
- Test a channel to verify it works.

For detailed setup instructions, see the [Notifications](/docs/guides/notifications/) guide.

## API Keys

API keys provide programmatic access to the Synclet API, scoped to the workspace where they are created.

### Creating an API Key

1. Go to **Settings > API Keys**.
2. Click **Create API Key**.
3. Enter a descriptive name (e.g., `github-actions`, `terraform-pipeline`).
4. Copy the key immediately — it is displayed only once.

### Permissions

API keys inherit the permissions of the user who created them, scoped to the current workspace:

| Creator's Role | API Key Can |
|---|---|
| **Admin** | Full access — manage settings, members, sources, destinations, connections. |
| **Editor** | Create and modify sources, destinations, and connections. Cannot manage members or settings. |
| **Viewer** | Read-only access to configurations, job history, and logs. |

### Using an API Key

Include the key in the `Authorization` header:

```bash
curl -H "Authorization: Bearer synclet_sk_your_api_key_here" \
  https://synclet.example.com/api/v1/connections
```

### Common CI/CD Use Cases

API keys are ideal for automation:

```bash
# Trigger a sync from a CI/CD pipeline
curl -X POST \
  -H "Authorization: Bearer $SYNCLET_API_KEY" \
  https://synclet.example.com/api/v1/connections/{id}/sync

# Check connection health in a deployment script
curl -s -H "Authorization: Bearer $SYNCLET_API_KEY" \
  https://synclet.example.com/api/v1/connections/{id} \
  | jq '.status'
```

### Revoking an API Key

1. Go to **Settings > API Keys**.
2. Find the key and click **Revoke**.
3. Confirm the action.

Revoked keys stop working immediately. Store the key value securely — if compromised, revoke and create a new one.

:::caution
Never commit API keys to version control. Use environment variables or a secrets manager in your CI/CD system.
:::

## Account Settings

Account settings apply to your personal profile across all workspaces.

### Profile

Go to your avatar in the top-right corner and select **Account Settings** to update:

- **Display name** — How your name appears to other workspace members.

### Password

To change your password:

1. Go to **Account Settings > Security**.
2. Enter your current password and the new password.
3. Click **Update Password**.

If you signed up through OIDC, you may not have a password set. You can add one here to enable email/password login as a fallback.

## Config Export & Import

Synclet supports exporting and importing your workspace configuration as a YAML file. This is useful for backups, environment migration, and disaster recovery.

### Exporting

1. Go to **Settings > General**.
2. Click **Export Configuration**.
3. A YAML file is downloaded containing your workspace setup.

### What is Included

| Included | Not Included |
|---|---|
| Sources (connector type, name, non-secret config) | Encrypted credentials and secrets |
| Destinations (connector type, name, non-secret config) | API keys |
| Connections (streams, schedule, retry, notifications) | Job history and sync state |
| Notification channels (type, name) | Webhook URLs and tokens |
| Workspace settings | Member list |

:::caution
Credentials and secrets are excluded from exports for security. After importing a configuration, you will need to re-enter credentials for each source and destination.
:::

### Importing

1. Go to **Settings > General**.
2. Click **Import Configuration**.
3. Select the YAML file.
4. Review the changes and confirm.

Importing merges the configuration into the current workspace. Existing items with matching names are updated; new items are created.

## Next Steps

- [Authentication & SSO](/docs/guides/authentication/) — Set up OIDC providers and manage registration.
- [Notifications](/docs/guides/notifications/) — Detailed setup for Slack, Email, and Telegram channels.
- [Workspaces & Roles](/docs/concepts/workspaces-and-roles/) — Understand the Admin, Editor, and Viewer roles.
