---
title: Workspaces & Roles
description: Multi-tenant workspace isolation and role-based access control.
---

## Workspaces

A workspace is an **isolated environment** within Synclet. Each workspace has its own sources, destinations, connections, schedules, settings, and API keys. Nothing is shared between workspaces — they are completely independent.

Common use cases for multiple workspaces:

- **Team separation** — Give the marketing team and engineering team their own workspace so they manage their own data pipelines independently.
- **Environment isolation** — Create separate workspaces for development, staging, and production.
- **Client isolation** — If you manage data pipelines for multiple clients, each client gets their own workspace with no visibility into others.

A single user can belong to **multiple workspaces**, each with a different role. Switch between workspaces from the workspace selector in the dashboard header.

## Roles

Every workspace member is assigned one of three roles. Roles are scoped to a single workspace — a user can be an Admin in one workspace and a Viewer in another.

### Admin

Full control over the workspace. Admins can manage every aspect of data pipelines and workspace membership.

- Create, edit, and delete sources, destinations, and connections.
- Trigger and cancel syncs.
- Manage workspace members (invite, change roles, remove).
- Configure workspace settings, API keys, and notifications.

### Editor

Can build and operate data pipelines but cannot manage team membership or workspace settings.

- Create, edit, and delete sources, destinations, and connections.
- Trigger and cancel syncs.
- View logs, job history, and dashboard metrics.
- Cannot invite or remove members, change roles, or modify workspace settings.

### Viewer

Read-only access. Viewers can monitor pipeline status and review logs but cannot make changes.

- View the dashboard, connection status, and sync history.
- View source and destination configurations.
- View logs and job details.
- Cannot create, edit, or delete any resources.
- Cannot trigger or cancel syncs.

## Permissions Summary

| Action | Admin | Editor | Viewer |
|---|:---:|:---:|:---:|
| View dashboard & metrics | &#10003; | &#10003; | &#10003; |
| View sync logs & job history | &#10003; | &#10003; | &#10003; |
| View sources & destinations | &#10003; | &#10003; | &#10003; |
| Create / edit sources | &#10003; | &#10003; | &#10007; |
| Create / edit destinations | &#10003; | &#10003; | &#10007; |
| Create / edit connections | &#10003; | &#10003; | &#10007; |
| Trigger / cancel syncs | &#10003; | &#10003; | &#10007; |
| Manage API keys | &#10003; | &#10007; | &#10007; |
| Manage members | &#10003; | &#10007; | &#10007; |
| Workspace settings | &#10003; | &#10007; | &#10007; |
| Notification settings | &#10003; | &#10007; | &#10007; |

## Managing Members

### Inviting a Member

1. Navigate to **Settings > Members** in the workspace.
2. Click **Invite Member**.
3. Enter the user's email address and select a role (Admin, Editor, or Viewer).
4. The user receives an email invitation. If they already have a Synclet account, the workspace appears in their workspace selector immediately. New users are prompted to create an account first.

### Changing a Role

1. Go to **Settings > Members**.
2. Find the member in the list.
3. Select a new role from the dropdown.
4. The change takes effect immediately.

### Removing a Member

1. Go to **Settings > Members**.
2. Click the remove button next to the member.
3. The member immediately loses access to the workspace and all its resources. Their data and configurations are not deleted — other workspace members can still see and manage them.

## Default Workspace

When you first install Synclet, the initial setup wizard creates a **default workspace** and assigns the first user as its **Admin**. This workspace is ready to use immediately — you can start adding sources, destinations, and connections right away.

Additional users can join the default workspace (if invited) or create their own workspaces. There is no limit on the number of workspaces.

## Next Steps

- [Authentication](/docs/guides/authentication/) — Configure OIDC single sign-on and user management.
- [Quick Start](/docs/getting-started/quick-start/) — Set up your first sync in under 5 minutes.
- [Architecture Overview](/docs/concepts/architecture/) — Learn how Synclet is structured under the hood.
