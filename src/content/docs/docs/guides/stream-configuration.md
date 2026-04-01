---
title: Stream Configuration
description: Configure streams — sync modes, field selection, primary keys, cursors, namespace mapping.
---

When you create or edit a connection, you configure individual streams to control exactly what data gets synced and how. This page covers all the options available for each stream.

## What is a Stream?

A stream is a logical data set from a source — typically a database table, an API endpoint, or a file collection. Each stream has a name, a set of fields (columns/properties), and metadata about supported sync modes.

During schema discovery, Synclet detects all available streams from the source connector and presents them for configuration.

## Enabling and Disabling Streams

By default, all discovered streams are shown when configuring a connection. You can:

- **Enable** a stream to include it in syncs.
- **Disable** a stream to exclude it entirely.

Only enabled streams are synchronized. Disabled streams consume no resources and produce no data at the destination.

You can toggle streams on and off at any time by editing the connection.

## Sync Mode per Stream

Each stream can be configured with its own sync mode, which determines how data is read from the source and written to the destination.

| Sync Mode | Source Behavior | Destination Behavior | Best For |
|---|---|---|---|
| **Full Refresh \| Overwrite** | Reads all records every sync | Replaces all data in the destination | Small tables, lookup data |
| **Full Refresh \| Append** | Reads all records every sync | Appends all records (duplicates possible) | Audit logs, snapshots |
| **Incremental \| Append** | Reads only new/changed records | Appends new records | Event streams, logs |
| **Incremental \| Append + Dedup** | Reads only new/changed records | Upserts records, deduplicating by primary key | Dimension tables, CRM contacts |

The available sync modes depend on what the source and destination connectors support. Synclet only shows valid combinations.

:::tip
Use **Incremental** modes whenever possible. They transfer less data, run faster, and reduce load on both source and destination systems.
:::

## Field Selection

You can choose which fields to include for each stream, rather than syncing every column.

- Open the stream configuration and expand the field list.
- Check or uncheck individual fields.
- Only checked fields are synced to the destination.

Field selection is useful for:

- Reducing data volume and transfer time.
- Excluding sensitive columns (e.g., PII) from the destination.
- Keeping destination schemas clean.

:::caution
If you re-enable a previously excluded field, a full refresh of that stream may be required to backfill the missing data. Synclet will prompt you if this is needed.
:::

## Primary Keys

Primary keys are used for deduplication in **Append + Dedup** mode. They identify which records are the same so that Synclet can upsert (insert or update) rather than create duplicates.

- **Auto-detected** — Most connectors report primary keys in their schema metadata. These are pre-filled automatically.
- **Manual override** — If the connector does not report primary keys, or you want to use different columns, you can set them manually.
- **Composite keys** — You can select multiple fields to form a composite primary key.

Primary keys are required when using Append + Dedup mode. If no primary key is set, Synclet will not allow you to select that mode for the stream.

## Cursor Fields

Cursor fields are used in **Incremental** sync modes to track which records have already been synced.

- The cursor field must contain values that increase monotonically over time (e.g., `updated_at` timestamps, auto-incrementing IDs).
- Synclet stores the last cursor value after each sync and uses it to filter the next sync to only new or updated records.
- **Auto-detected** — Many connectors suggest a default cursor field. This is pre-selected automatically.
- **Manual override** — You can choose a different field if the default is not suitable.

:::note
Choosing a cursor field that does not increase monotonically (e.g., a randomly generated ID) will cause records to be missed. Timestamps and sequential IDs are the safest choices.
:::

## Namespace Mapping

Namespace mapping controls where streams are written in the destination. A namespace is typically a database schema, dataset, or bucket path.

Synclet offers three mapping strategies:

| Strategy | Behavior | Example |
|---|---|---|
| **Source** | Uses the same namespace as the source. | Source `public.users` writes to `public.users` in the destination. |
| **Destination** | Writes all streams to the destination's default namespace. | Source `public.users` writes to `default_schema.users`. |
| **Custom** | You specify the destination namespace using a custom format string. | Source `public.users` writes to `analytics.users`. |

You can also set a **stream prefix** at the connection level. For example, setting the prefix to `raw_` would write a source stream called `events` to `raw_events` in the destination.

## Resetting Stream State

If you need to re-sync a stream from scratch (for example, after a schema change or data corruption), you can reset its sync state:

1. Open the connection and find the stream.
2. Click **Reset State** for that stream.
3. The next sync performs a full refresh for that stream, regardless of its sync mode.

After the full refresh, incremental syncs resume from the new state.

You can reset individual streams without affecting others in the same connection.

## Next Steps

- [Creating Connections](/docs/guides/connections/) — Set up a connection using these stream options.
- [Sync Modes](/docs/concepts/sync-modes/) — Learn more about how each sync mode works under the hood.
- [Scheduling & Triggers](/docs/guides/scheduling/) — Configure when syncs run.
