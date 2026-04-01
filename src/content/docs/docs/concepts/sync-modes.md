---
title: Sync Modes
description: Understanding sync modes — full refresh, incremental, and destination write modes.
---

## Overview

Every stream in a connection has a **sync mode** that controls two things:

1. **How the source reads data** (source read mode)
2. **How the destination writes data** (destination write mode)

The combination of these two determines the behavior of each sync run. You configure the sync mode per stream when [setting up a connection](/docs/guides/connections/) or [configuring streams](/docs/guides/stream-configuration/).

## Source Read Modes

### Full Refresh

The source reads **all data** from the stream on every sync run. Every record is emitted regardless of whether it has changed since the last sync.

- Simple and predictable — no state to manage.
- Can be expensive for large datasets since the entire table or endpoint is read each time.
- Best for small datasets, reference tables, or systems that do not support change tracking.

### Incremental

The source reads **only new or changed records** since the last sync. It uses a **cursor field** (typically a column like `updated_at` or an auto-incrementing ID) to track where the last sync left off.

- Efficient — only transfers delta data.
- Requires a cursor field that reliably tracks changes.
- Sync state is saved between runs so each sync picks up where the last one finished.

Not all sources support incremental mode. If a source or stream does not have a suitable cursor field, use Full Refresh instead.

## Destination Write Modes

### Overwrite

The destination **drops and recreates** the target table on each sync run, then writes all incoming records.

- Guarantees the destination is an exact mirror of the source.
- Best paired with Full Refresh.
- Not suitable for destinations where you need to preserve historical data.

### Append

The destination **inserts all incoming records** at the end of the existing table. No existing rows are modified or deleted.

- Simple and fast.
- May create **duplicate records** if the same data is synced more than once (e.g., after a retry or with Full Refresh).
- Useful for event logs or append-only tables.

### Append + Dedup

The destination **inserts new records and updates existing ones** based on a primary key. If a record with the same primary key already exists, it is replaced with the new version.

- Prevents duplicate records.
- Requires a **primary key** to identify unique records.
- Best paired with Incremental mode for efficient, deduplicated syncs.

## Common Combinations

| Source Mode | Destination Mode | Behavior | Use Case |
|---|---|---|---|
| Full Refresh | Overwrite | Drop and replace the entire table each sync | Simple mirror of small datasets |
| Full Refresh | Append | Append a full snapshot each sync | Periodic snapshots, historical tracking |
| Incremental | Append | Append only new/changed records | Event streams, audit logs |
| **Incremental** | **Append + Dedup** | **Append new, update existing by primary key** | **Production data mirror (recommended)** |

## Choosing a Sync Mode

Use this decision guide to pick the right sync mode for each stream:

1. **Does the source support incremental sync?**
   - No &rarr; Use **Full Refresh + Overwrite** (or Append if you need history).
   - Yes &rarr; Continue to step 2.

2. **Do you need an exact mirror of the source at the destination?**
   - Yes &rarr; Use **Incremental + Append + Dedup**.
   - No &rarr; Continue to step 3.

3. **Do you need a history of all changes over time?**
   - Yes &rarr; Use **Incremental + Append**.
   - No &rarr; Use **Incremental + Append + Dedup**.

**When in doubt**, choose **Incremental + Append + Dedup**. It is the most efficient and handles the widest range of use cases correctly.

## Primary Keys and Cursors

### Primary Keys

A primary key uniquely identifies each record in a stream. It is required for the **Append + Dedup** write mode so the destination knows which existing record to update.

- Most connectors auto-detect primary keys from the source schema (e.g., the `id` column).
- You can **override the primary key** per stream in the stream configuration. This is useful when the default is incorrect or when you need a composite key.

### Cursor Fields

A cursor field is a column that the source uses to track which records have already been synced. It must increase monotonically — each new or updated record has a higher cursor value than previously synced records.

Common cursor fields:

- `updated_at` — A timestamp updated whenever a row changes.
- `id` — An auto-incrementing integer (works for append-only sources).
- `created_at` — Works when records are never updated.

The cursor field is configured on the source connector or overridden per stream.

## Next Steps

- [Stream Configuration](/docs/guides/stream-configuration/) — Configure sync modes, field selection, and primary keys per stream.
- [Connections Guide](/docs/guides/connections/) — Create and manage connections between sources and destinations.
- [Architecture Overview](/docs/concepts/architecture/) — Understand how data flows through Synclet.
