---
title: Notifications
description: Set up Slack, Email, Telegram notifications.
---

Synclet can notify you when syncs fail, encounter warnings, or when connection health degrades. Notifications are configured at the workspace level and assigned to individual connections.

## Overview

The notification system works in two steps:

1. **Create notification channels** — Set up one or more channels (Slack, Email, Telegram) in your workspace settings.
2. **Assign channels to connections** — Choose which channels each connection should use for alerts.

A single connection can notify multiple channels, and a single channel can serve multiple connections.

## Slack

Synclet sends notifications to Slack using incoming webhooks.

### Setup

1. In your Slack workspace, go to **Apps > Incoming Webhooks** (or visit [api.slack.com/messaging/webhooks](https://api.slack.com/messaging/webhooks)).
2. Create a new webhook and select the channel where notifications should appear.
3. Copy the webhook URL (it looks like `https://hooks.slack.com/services/T.../B.../xxx`).
4. In Synclet, go to **Settings > Notification Channels**.
5. Click **Add Channel**, select **Slack**, and paste the webhook URL.
6. Give the channel a name (e.g., `#data-alerts`) and click **Save**.

### What Notifications Look Like

Slack notifications include:

- The connection name.
- The failure reason or warning summary.
- A direct link to the job detail page in Synclet.

## Email (SMTP)

Synclet sends email notifications through your SMTP server.

### Setup

First, configure the SMTP server using environment variables:

```bash
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="alerts@yourcompany.com"
SMTP_PASSWORD="your-app-password"
SMTP_FROM="noreply@yourcompany.com"
```

Then create an email notification channel:

1. Go to **Settings > Notification Channels**.
2. Click **Add Channel**, select **Email**.
3. Enter the recipient email addresses (comma-separated for multiple recipients).
4. Give the channel a name (e.g., `Data Team Email`) and click **Save**.

:::note
Email notifications are only available when the SMTP environment variables are configured. If they are not set, the Email option will not appear when creating a channel. See [Configuration](/docs/getting-started/configuration/) for details.
:::

## Telegram

Synclet sends notifications to Telegram chats or groups via a bot.

### Setup

1. Open Telegram and search for **@BotFather**.
2. Send `/newbot` and follow the prompts to create a bot. Copy the bot token.
3. Add the bot to the Telegram group or channel where you want notifications, or start a direct chat with the bot.
4. Get the chat ID:
   - For groups, add the bot and send a message. Then visit `https://api.telegram.org/bot<TOKEN>/getUpdates` to find the chat ID.
   - For direct chats, send a message to the bot and check `getUpdates` for your chat ID.
5. In Synclet, go to **Settings > Notification Channels**.
6. Click **Add Channel**, select **Telegram**.
7. Enter the bot token and chat ID.
8. Give the channel a name (e.g., `Telegram Alerts`) and click **Save**.

:::tip
For group chats, make sure the bot has permission to send messages. In supergroups, you may need to make the bot an admin or adjust the group's permissions.
:::

## Notification Rules

After creating notification channels, create rules to link them to connections:

1. Go to **Settings > Notification Channels** and select a channel.
2. Click **Add Rule**.
3. Choose a **condition** (on failure, on consecutive failures, or on zero records).
4. Optionally scope the rule to a specific **connection**. If no connection is selected, the rule applies to all connections in the workspace.
5. Click **Save**.

A single channel can have multiple rules with different conditions. Rules can be enabled or disabled independently without deleting them.

## Notification Rules & Conditions

Notifications are driven by rules. Each rule links a channel to a connection (or applies workspace-wide) and specifies a condition that determines when notifications fire.

| Condition | When It Fires | Use Case |
|---|---|---|
| **On failure** | A sync job fails. | Catch any sync failure immediately. |
| **On consecutive failures** | A sync fails and the number of consecutive failures reaches a threshold you configure. | Avoid alert fatigue from transient errors; only notify after repeated failures. |
| **On zero records** | A sync completes successfully but reads zero records. | Detect stale or broken source configurations early. |

Notifications are not sent for:

- Successful syncs with records (to avoid alert fatigue).
- Disabled connections or disabled rules.

## Next Steps

- [Settings & API Keys](/docs/guides/settings/) — Manage notification channels and other workspace settings.
- [Monitoring & Jobs](/docs/guides/monitoring/) — View job details and logs referenced in notifications.
- [Scheduling & Triggers](/docs/guides/scheduling/) — Configure retry policies that affect when failure notifications are sent.
