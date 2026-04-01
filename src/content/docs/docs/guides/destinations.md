---
title: Managing Destinations
description: Add, configure, test, and manage destinations.
---

Destinations are where your data lands. Synclet writes synchronized data to databases, data warehouses, cloud storage, and other systems using Airbyte-compatible destination connectors.

## What is a Destination?

A destination represents a configured connection to an external system that Synclet writes data to. Each destination is tied to a specific connector (e.g., BigQuery, Snowflake, PostgreSQL) and stores the credentials and configuration needed to write data.

Like sources, destinations are scoped to a workspace. A single destination can be used by multiple connections.

## Adding a Destination

Follow these steps to add a new destination:

1. **Navigate** — Go to **Destinations** in the sidebar and click **Add Destination**.
2. **Select a connector** — Browse or search the connector catalog for destination connectors. Click the one that matches your target system (e.g., Snowflake, S3, Redshift).
3. **Fill in the configuration** — Provide the required connection details. Common fields include host, port, database, schema, credentials, and write mode. Sensitive fields are encrypted at rest using AES-256-GCM.
4. **Test the connection** — Click **Test Connection**. Synclet runs the connector's check command to verify write access. Wait for a success confirmation.
5. **Name it** — Give the destination a descriptive name (e.g., `Analytics Warehouse` or `S3 Data Lake`). Click **Save**.

:::tip
When setting up a database destination, create a dedicated user with write access limited to the target schema. This follows the principle of least privilege and prevents accidental writes to other schemas.
:::

## Editing a Destination

1. Go to **Destinations** and click the destination you want to edit.
2. Update the configuration fields as needed.
3. Click **Test Connection** to verify the changes.
4. Click **Save**.

Changes take effect on the next sync run. Running syncs are not interrupted.

## Deleting a Destination

1. Go to **Destinations** and click the destination you want to remove.
2. Click **Delete**.
3. Confirm the deletion.

:::caution
You cannot delete a destination that is used by one or more connections. Remove or reassign those connections first.
:::

## Troubleshooting

### Test Connection Failed

| Symptom | Possible Cause | Solution |
|---|---|---|
| Connection timed out | Firewall or network issue | Ensure the destination allows inbound connections from the Synclet host. For cloud warehouses, check IP allowlists. |
| Authentication failed | Invalid credentials | Verify the username, password, service account key, or access token. |
| Permission denied | Insufficient write access | Grant `INSERT`, `CREATE TABLE`, and `CREATE SCHEMA` permissions to the configured user. |
| SSL/TLS error | Certificate issue | Check the SSL configuration. Cloud warehouses typically require SSL enabled. |

### Write Failures During Sync

| Symptom | Possible Cause | Solution |
|---|---|---|
| Schema mismatch | Source schema changed | Refresh the source schema and reconfigure affected streams. A full refresh may be needed. |
| Disk/quota full | Storage limit reached | Free up space or increase quota on the destination system. |
| Rate limited | Too many concurrent writes | Reduce the number of parallel connections or adjust connector-specific rate limit settings. |

For detailed error messages, check the job logs under **Jobs** in the sidebar.

## Next Steps

- [Creating Connections](/docs/guides/connections/) — Link a source to a destination.
- [Managing Sources](/docs/guides/sources/) — Set up where your data comes from.
- [Stream Configuration](/docs/guides/stream-configuration/) — Fine-tune which data gets synced and how.
