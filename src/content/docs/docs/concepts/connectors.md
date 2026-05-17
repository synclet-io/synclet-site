---
title: Connectors & Airbyte Protocol
description: Using Airbyte connectors with Synclet — sources, destinations, native Go connectors.
---

## What are Connectors?

Connectors are Docker images that know how to read data from a specific system (source) or write data to one (destination). Every connector implements the [Airbyte connector protocol](https://docs.airbyte.com/understanding-airbyte/airbyte-protocol), which defines four standard operations:

| Operation | Purpose |
|---|---|
| **spec** | Returns the connector's configuration schema (what fields are needed to connect) |
| **check** | Tests the provided credentials and confirms the connection works |
| **discover** | Lists available streams (tables, endpoints, files) and their schemas |
| **read** / **write** | Reads data from a source or writes data to a destination |

Because Synclet speaks the Airbyte protocol, it works with the entire Airbyte connector ecosystem — over 300 connectors maintained by the community.

## Popular Sources

Synclet can pull data from any Airbyte-compatible source. Some commonly used ones:

- **Databases** — PostgreSQL, MySQL, MongoDB, SQL Server, Oracle
- **SaaS Platforms** — Salesforce, HubSpot, Stripe, Shopify, Zendesk, Jira
- **Files & Storage** — Google Sheets, Amazon S3, Azure Blob Storage, SFTP
- **Messaging & Events** — Kafka, RabbitMQ
- **Analytics** — Google Analytics, Facebook Ads, LinkedIn Ads
- **Developer Tools** — GitHub, GitLab, Notion, Slack

Browse the full catalog from **Settings > Connectors** in the Synclet dashboard.

## Popular Destinations

- **Data Warehouses** — BigQuery, Snowflake, Redshift, ClickHouse, Databricks
- **Databases** — PostgreSQL, MySQL, MSSQL
- **Files & Storage** — Amazon S3, Google Cloud Storage, Google Sheets
- **Search & Analytics** — Elasticsearch, Apache Pinot

## Adding a Connector

### Step 1: Configure a Repository

Synclet ships with the **default Airbyte registry** pre-configured, so you can use any public Airbyte connector immediately. To add a private or custom registry, go to **Settings > Connectors > Repositories** and add the registry URL.

### Step 2: Create a Source or Destination

1. Navigate to **Sources** (or **Destinations**) in the sidebar.
2. Click **Add Source** (or **Add Destination**).
3. Search for and select your connector from the catalog.
4. Fill in the required credentials (database host, API key, OAuth, etc.). All credentials are encrypted with **AES-256-GCM** before being stored.
5. Click **Test Connection** to verify everything works.
6. Save.

### Step 3: Use It in a Connection

Once a source or destination is saved, you can reference it when [creating a connection](/docs/guides/connections/). A single source or destination can be used in multiple connections.

## Configuring Streams

When you create a connection, Synclet runs **discover** on the source to list all available streams. For each stream, you can configure:

- **Enabled/disabled** — Choose which streams to include in the sync.
- **Sync mode** — Set the [source read mode and destination write mode](/docs/concepts/sync-modes/) independently per stream.
- **Field selection** — Pick only the columns you need instead of syncing the entire schema.
- **Primary key override** — Specify a custom primary key if the connector's default is not correct (required for deduplication).
- **Namespace rewriting** — Change the destination schema or dataset name where the stream's data lands.

See the [Stream Configuration](/docs/guides/stream-configuration/) guide for detailed instructions.

## Native Go Connectors

In addition to community Airbyte connectors, Synclet maintains a set of **native Go connectors** built with `airbyte-go-sdk`. They speak the same Airbyte protocol over stdin/stdout and ship as their own container images alongside the Synclet repo.

| Connector | Type | Image directory |
|---|---|---|
| Google Sheets | Source & Destination | `connectors/source-google-sheets/`, `connectors/destination-google-sheets/` |
| MySQL | Source | `connectors/source-mysql/` |
| BigQuery | Destination | `connectors/destination-bigquery/` |

Native connectors appear in the catalog alongside Docker-based community connectors and are configured the same way — the difference is that the implementation is Go (with smaller image size and faster cold starts) instead of Python or Java.

## Container Behavior

When running Docker-based connectors, Synclet manages the container lifecycle automatically:

- **Image pull** — Connector images are pulled on first use. The pull has a **10-minute timeout** to handle slow registries.
- **Resource limits** — Containers are started with default limits of **2 GB memory** and **1 CPU**. These can be overridden in the [configuration](/docs/getting-started/configuration/).
- **Stale cleanup** — A background process checks for stale or orphaned containers every **5 minutes** and removes them.
- **Graceful shutdown** — When a sync is cancelled, Synclet sends `SIGTERM` to the container and waits up to **30 seconds** before forcing termination.

## Next Steps

- [Sync Modes](/docs/concepts/sync-modes/) — Understand how data is read from sources and written to destinations.
- [Sources Guide](/docs/guides/sources/) — Step-by-step guide for adding and managing sources.
- [Destinations Guide](/docs/guides/destinations/) — Step-by-step guide for adding and managing destinations.
