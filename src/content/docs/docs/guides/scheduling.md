---
title: Scheduling & Triggers
description: Cron schedules, manual triggers, retry policies.
---

Synclet gives you full control over when syncs run. You can set up automated cron schedules, trigger syncs manually, and configure retry behavior for failures.

## Cron Scheduling

Connections can be configured with a cron schedule to run syncs automatically. Synclet uses standard 5-field cron syntax.

### Cron Format

```
┌───────────── minute (0-59)
│ ┌───────────── hour (0-23)
│ │ ┌───────────── day of month (1-31)
│ │ │ ┌───────────── month (1-12)
│ │ │ │ ┌───────────── day of week (0-6, Sunday=0)
│ │ │ │ │
* * * * *
```

### Common Examples

| Schedule | Cron Expression | Description |
|---|---|---|
| Every hour | `0 * * * *` | Runs at the top of every hour. |
| Every 15 minutes | `*/15 * * * *` | Runs at :00, :15, :30, :45 each hour. |
| Daily at midnight | `0 0 * * *` | Runs once per day at 00:00. |
| Daily at 6 AM | `0 6 * * *` | Runs once per day at 06:00. |
| Every Monday at 9 AM | `0 9 * * 1` | Runs weekly on Monday mornings. |
| Twice daily | `0 6,18 * * *` | Runs at 06:00 and 18:00 every day. |
| First of the month | `0 0 1 * *` | Runs at midnight on the 1st of each month. |

:::note
All cron schedules are evaluated in **UTC**. Adjust your expressions accordingly if your team works in a different timezone.
:::

### Setting a Schedule

1. Open the connection you want to schedule.
2. In the **Schedule** section, select **Cron**.
3. Enter the cron expression.
4. Click **Save**.

The scheduler evaluates cron expressions periodically and enqueues sync jobs when they are due.

## Manual Triggers

You can trigger a sync at any time, regardless of whether a cron schedule is configured.

1. Go to **Connections** and find the connection.
2. Click the **Sync Now** button.

The sync is enqueued immediately and begins as soon as a worker is available.

Manual syncs do not affect the cron schedule. If a scheduled sync is due while a manual sync is running, it is queued and runs after the current one completes.

## Retry Policy

When a sync fails, Synclet can automatically retry it based on the connection's retry policy.

### Configuration

Each connection has two retry settings:

| Setting | Description |
|---|---|
| **Max Attempts** | The maximum number of attempts for a sync job (including the initial attempt). Set to 1 to disable retries. |
| **Retry Delay (minutes)** | The fixed delay in minutes between retry attempts. |

### How Retries Work

1. A sync job fails (connector error, timeout, network issue).
2. Synclet waits for the configured retry delay.
3. A new attempt is created within the same job.
4. If the attempt succeeds, the job is marked as completed.
5. If all attempts are exhausted, the job is marked as failed and notifications are sent.

Each attempt is recorded separately in the job history, so you can see exactly what happened on each try.

:::tip
For transient failures (network blips, rate limits), the default retry policy usually resolves the issue automatically. For persistent failures (wrong credentials, schema mismatch), retries will not help — check the error logs and fix the underlying issue.
:::

## Concurrent Syncs

Synclet handles concurrency as follows:

- **Same connection** — Syncs for the same connection are queued and run one at a time. If a manual sync is triggered while a scheduled sync is running, it waits in the queue.
- **Different connections** — Syncs for different connections run in parallel. The number of concurrent syncs depends on your available resources.

This design prevents conflicts from two syncs writing to the same destination tables simultaneously while maximizing throughput across connections.

## Disabling Schedules

To stop automated syncs without deleting the connection:

1. Open the connection.
2. Change the schedule to **Manual**.
3. Click **Save**.

Alternatively, you can [disable the connection](/docs/guides/connections/) entirely, which pauses both scheduled and manual syncs.

## Next Steps

- [Creating Connections](/docs/guides/connections/) — Set up connections with scheduling.
- [Monitoring & Jobs](/docs/guides/monitoring/) — View job history, attempts, and retry outcomes.
- [Notifications](/docs/guides/notifications/) — Get alerted when syncs fail after all retries.
