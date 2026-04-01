---
title: Introduction
description: What is Synclet, who it's for, and what makes it different from other data sync platforms.
---

## What is Synclet?

Synclet is a self-hosted data synchronization platform that moves data between databases, APIs, warehouses, and file systems. It ships as a single Go binary, runs on any Linux server or container orchestrator, and leverages the [Airbyte connector protocol](https://docs.airbyte.com/understanding-airbyte/airbyte-protocol) to give you access to **300+ pre-built connectors** out of the box.

You define sources, destinations, and connections through a web dashboard or API. Synclet handles schema detection, incremental synchronization, state management, scheduling, and monitoring — so you can focus on what to sync rather than how.

## Who is Synclet For?

- **Data engineers** who need a lightweight, self-hosted alternative to managed ELT platforms.
- **Teams already using Airbyte connectors** who want the same connector ecosystem with less operational overhead.
- **Organizations with strict data residency requirements** that need all data movement to happen within their own infrastructure.
- **Developers running one-off or periodic data transfers** who want a simple setup without complex infrastructure.

## Key Features

- **300+ Connectors** — Use any Airbyte-compatible source or destination connector. Databases, SaaS APIs, data warehouses, file storage, and more.
- **Multiple Execution Modes** — Run connectors via Docker, Kubernetes, or the local CLI depending on your environment.
- **Incremental Sync** — Only transfer new or changed records. Synclet tracks sync state automatically between runs.
- **Stream Configuration** — Select individual streams, choose sync modes (full refresh or incremental), pick specific fields, and rewrite destination namespaces or stream names.
- **Multi-Tenant Workspaces** — Organize sources, destinations, and connections into isolated workspaces with separate team access.
- **Role-Based Access Control** — Three built-in roles per workspace: Admin, Editor, and Viewer.
- **OIDC Single Sign-On** — Authenticate users through any OpenID Connect provider (Google, Okta, Keycloak, and others).
- **Notifications** — Get alerted on sync failures and completions via Slack, Email, or Telegram.
- **Dashboard & Metrics** — Monitor sync status, job history, duration, and record counts from the built-in web UI. Export Prometheus metrics for external monitoring.
- **Config Backup & Restore** — Export and import your entire Synclet configuration for disaster recovery or environment migration.
- **API Keys** — Automate operations and integrate with CI/CD pipelines using programmatic API access.

## How It Works

Synclet follows a straightforward three-step workflow:

1. **Configure a source** — Pick a connector (e.g., PostgreSQL, Stripe, Google Sheets), provide credentials, and test the connection. Synclet discovers the available schemas and streams automatically.
2. **Configure a destination** — Set up where the data should land (e.g., BigQuery, Snowflake, a CSV file). Test that Synclet can write to it.
3. **Create a connection** — Link a source to a destination. Select which streams to sync, choose sync modes, set a schedule (cron or manual), and run your first sync.

## Next Steps

- [Installation](/docs/getting-started/installation/) — Set up Synclet on your machine or server.
- [Quick Start](/docs/getting-started/quick-start/) — Create your first data sync in under 5 minutes.
