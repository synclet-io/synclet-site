---
title: FAQ
description: Frequently asked questions.
---

## General

### How does Synclet compare to Airbyte?

Synclet is a lightweight, self-hosted alternative to Airbyte. Key differences:

- **Single binary** -- Synclet is one Go binary. No Java, no multi-container orchestration.
- **Airbyte connector compatibility** -- Synclet runs any Airbyte-protocol connector (Docker images), so you get access to the same connector catalog.
- **Simpler operations** -- One container (or binary) plus PostgreSQL. No Temporal, no MinIO, no separate scheduler service.
- **Fewer enterprise features** -- Synclet focuses on reliable data movement. It does not include a connector builder, dbt integration, or multi-tenant SaaS features.

If you need a simple, fast data sync tool that works with Airbyte connectors, Synclet is a good fit. If you need the full Airbyte platform ecosystem, use Airbyte.

### Do I need Docker installed?

**For Airbyte-protocol connectors: yes.** Synclet launches connector containers via Docker to run syncs. Docker must be available on the host (or configured via Kubernetes in distributed mode).

**For native Go connectors: no.** Native connectors are compiled into the Synclet binary and run without Docker.

### Can I use custom connectors?

Yes. Any Docker image that implements the [Airbyte connector protocol](https://docs.airbyte.com/understanding-airbyte/airbyte-protocol/) will work. You can:

- Point Synclet at a custom Docker registry.
- Reference any image by its full name (e.g., `my-registry.example.com/my-connector:v1.0`).
- Build your own connectors using the Airbyte CDK or any language, as long as the image speaks the protocol.

## Security

### How are credentials stored?

All connector credentials (database passwords, API keys, OAuth tokens) are encrypted at rest using **AES-256-GCM**. The encryption key is your `SECRET_ENCRYPTION_KEY` environment variable. Without this key, stored credentials cannot be decrypted.

See [Environment Variables](/docs/reference/environment-variables/) for how to generate a secure key.

### Is data encrypted in transit?

Synclet itself does not terminate TLS. To encrypt traffic between users and Synclet, place a reverse proxy (Nginx, Caddy) or load balancer in front of it with a TLS certificate, or enable TLS on the [Kubernetes Ingress](/docs/deployment/kubernetes/).

Data between Synclet and your sources/destinations travels over whatever connection the connector establishes. Most database and API connectors support SSL/TLS natively through their configuration options.

### How do I control access?

- **Disable registration** -- Set `REGISTRATION_ENABLED=false` after creating your initial accounts.
- **OIDC single sign-on** -- Configure one or more OIDC providers (Google, Okta, Azure AD) so users authenticate through your identity provider. See [Environment Variables](/docs/reference/environment-variables/).
- **Role-based access** -- Synclet supports workspace-level roles to control who can create, edit, or run pipelines.

## Scalability

### How many connections can Synclet handle?

It depends on your deployment mode and resources:

- **Standalone mode** -- One Synclet instance can run multiple syncs concurrently, limited by host CPU and memory. A 2 CPU / 4 GB host comfortably handles 5-10 concurrent syncs.
- **Distributed mode (Kubernetes)** -- Each sync runs as a separate Kubernetes Job. The cluster scheduler handles placement and resource allocation. This scales to hundreds of concurrent syncs.

### Can I run multiple Synclet instances?

In **standalone mode**, run only one instance to avoid duplicate scheduling.

In **distributed mode** on Kubernetes, the API server is stateless and can be scaled horizontally. The scheduler and orchestrator run as single replicas with leader election. See [Kubernetes deployment](/docs/deployment/kubernetes/).

### What happens if a sync is interrupted?

Synclet uses **checkpoint-based resumption**. During a sync, the connector periodically emits state checkpoints. If a sync is interrupted (crash, timeout, restart), the next run resumes from the last checkpoint.

This means:

- No duplicate data in the destination (for connectors that support deduplication).
- Minimal re-processing after failures.
- Safe to restart Synclet at any time.

## Compatibility

### Which Airbyte connector versions are supported?

Synclet supports connectors that implement **Airbyte protocol v1**. This covers the vast majority of connectors in the Airbyte catalog.

Connector versions are pinned per source/destination in your configuration. Synclet does not auto-upgrade connector images. To update a connector, change the image tag in the source or destination settings.

### Which databases can Synclet use as its backend?

**PostgreSQL 16 or later** is the only supported backend database. Synclet uses PostgreSQL-specific features (enum types, JSONB, advisory locks) that are not available in other databases.
