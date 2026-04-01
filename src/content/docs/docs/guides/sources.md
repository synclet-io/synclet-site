---
title: Managing Sources
description: Add, configure, test, and manage data sources.
---

Sources are where your data comes from. Synclet uses Airbyte-compatible connectors to pull data from databases, SaaS APIs, file systems, and more.

## What is a Source?

A source represents a configured connection to an external system that Synclet reads data from. Each source is tied to a specific connector (e.g., PostgreSQL, Stripe, Google Sheets) and stores the credentials and configuration needed to access that system.

Sources are scoped to a workspace. Each workspace manages its own set of sources independently.

## Adding a Source

Follow these steps to add a new source:

1. **Navigate** — Go to **Sources** in the sidebar and click **Add Source**.
2. **Select a connector** — Browse or search the connector catalog. Click the connector that matches your data system (e.g., MySQL, Salesforce, HubSpot).
3. **Fill in the configuration** — Each connector has its own set of required and optional fields. Common fields include host, port, database name, username, and password. Sensitive fields like passwords and API keys are encrypted at rest using AES-256-GCM.
4. **Test the connection** — Click **Test Connection**. Synclet runs the connector's check command to verify that the provided credentials are valid and the system is reachable. Wait for a success message before proceeding.
5. **Name it** — Give the source a descriptive name (e.g., `Production PostgreSQL` or `Stripe Live`). Click **Save**.

:::tip
Use clear, descriptive names that distinguish between environments. For example, `Stripe Live` vs. `Stripe Sandbox` helps avoid mistakes when creating connections.
:::

## Schema Discovery

After a source is saved, Synclet runs schema discovery to detect the available streams (tables, endpoints, or collections) and their fields.

- **Streams** represent logical data sets — database tables, API endpoints, or file paths.
- **Fields** are the columns or properties within each stream, along with their data types.
- Discovery results are cached and used when you create or edit a connection.

### Refreshing the Schema

If the structure of your source system changes (new tables, renamed columns, added fields), you can refresh the schema:

1. Go to **Sources** and open the source.
2. Click **Refresh Schema**.
3. Synclet re-runs the discovery process and updates the available streams and fields.

When you refresh, any connections using this source will show a notification if their stream configuration is affected by the schema changes.

## Editing a Source

1. Go to **Sources** and click the source you want to edit.
2. Update the configuration fields as needed.
3. Click **Test Connection** to verify the changes.
4. Click **Save**.

Editing a source does not affect running syncs. Changes take effect on the next sync run.

## Deleting a Source

1. Go to **Sources** and click the source you want to remove.
2. Click **Delete**.
3. Confirm the deletion.

:::caution
You cannot delete a source that is used by one or more connections. Remove or reassign those connections first.
:::

## Troubleshooting

### Test Connection Failed

| Symptom | Possible Cause | Solution |
|---|---|---|
| Connection timed out | Firewall blocking access | Ensure the source system allows inbound connections from the Synclet host. |
| Authentication failed | Wrong credentials | Double-check the username, password, or API key. |
| Host not found | DNS resolution failure | Verify the hostname or IP address. Use an IP address if DNS is unreliable. |
| SSL/TLS error | Certificate mismatch | Check the SSL mode setting. Try `require` or `disable` depending on your setup. |

### Schema Discovery Failed

| Symptom | Possible Cause | Solution |
|---|---|---|
| No streams found | Insufficient permissions | Ensure the database user has `SELECT` access to the relevant schemas/tables. |
| Discovery timed out | Large schema | Some systems with thousands of tables may take longer. Check connector logs for details. |
| Connector error | Connector bug or incompatibility | Check the [Airbyte connector docs](https://docs.airbyte.com/integrations/) for known issues with the specific connector version. |

For detailed error messages, check the connector logs in **Jobs** after a failed test or discovery.

## Next Steps

- [Managing Destinations](/docs/guides/destinations/) — Set up where your data goes.
- [Creating Connections](/docs/guides/connections/) — Link a source to a destination.
- [Connectors](/docs/concepts/connectors/) — Learn more about the Airbyte connector protocol.
