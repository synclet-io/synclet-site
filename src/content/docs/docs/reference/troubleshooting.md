---
title: Troubleshooting
description: Common issues, error messages, debugging steps.
---

This page covers the most common issues you may encounter when running Synclet and how to resolve them.

## Sync Failures

### "Connection test failed"

The source or destination connector could not reach the target system.

- **Check credentials** -- Verify the username, password, and host in the connector configuration.
- **Check network access** -- Ensure the Synclet host (or container) can reach the target system. Test with `curl` or `telnet` from inside the container.
- **Check Docker** -- Connectors run as Docker containers. Confirm Docker is running and Synclet has access to the Docker socket.

```bash
# Test connectivity from the Synclet container
docker exec -it synclet curl -v telnet://db.example.com:5432
```

### "Discovery failed"

The connector connected successfully but could not read the source schema.

- **Check permissions** -- The database user needs read access to the schemas and tables you want to sync. For PostgreSQL, grant `SELECT` on the target tables and `USAGE` on the schema.
- **Check schema access** -- Some connectors require access to `information_schema` or system catalogs. Verify the user has the necessary grants.

### "Sync timed out"

The sync exceeded the configured time limit.

- **Increase `PIPELINE_MAX_SYNC_DURATION`** -- Default is `24h`. For very large initial syncs, you may need to raise this. See [Environment Variables](/docs/reference/environment-variables/).
- **Increase `PIPELINE_IDLE_TIMEOUT`** -- Default is `10m`. Some sources are slow to emit data (e.g., API rate limits). Increase if the connector is working but pauses between batches.
- **Check source performance** -- Slow queries on the source database can cause timeouts. Consider adding indexes or reducing the number of streams.

### "Container failed to start"

The connector container could not be launched.

- **Docker access** -- Verify Synclet can access the Docker socket: `docker ps` should work from the Synclet host.
- **Image pull** -- The connector image may not exist or may require authentication. Try pulling manually: `docker pull airbyte/source-postgres:latest`.
- **Memory** -- The host may be out of memory. Check `docker stats` and ensure at least 512 MB is available for the connector.

## Database Issues

### "Cannot connect to database"

Synclet cannot reach PostgreSQL on startup.

- **Connection string format** -- Verify `DB_DSN` follows the format: `postgres://user:password@host:port/dbname?sslmode=require`
- **PostgreSQL is running** -- Check with `pg_isready -h host -p port`.
- **Version** -- Synclet requires PostgreSQL **16 or later**. Check with `SELECT version();`.
- **Firewall / security groups** -- Ensure the Synclet host can reach the database port.

### "Migration failed"

Database migrations did not complete successfully.

- **DDL permissions** -- The database user needs permission to create and alter tables, types, and indexes. Grant `CREATE` on the database and schema.
- **Concurrent migrations** -- If two Synclet instances start simultaneously, one may fail with a lock error. This is safe to ignore; retry after the other instance finishes.

## Kubernetes Issues

### "Job failed to start"

A sync Job was created but its pod never started.

- **Namespace** -- Verify `K8S_NAMESPACE` matches an existing namespace. Check with `kubectl get ns`.
- **Service account** -- If `PIPELINE_DEFAULT_SERVICE_ACCOUNT_NAME` is set, confirm the service account exists: `kubectl get sa -n <namespace>`.
- **Image pull secrets** -- If connectors are in a private registry, set `K8S_IMAGE_PULL_SECRET` and verify the secret exists: `kubectl get secret -n <namespace>`.
- **Pod events** -- Check why the pod is pending:

```bash
kubectl describe pod -n synclet -l job-name=<job-name>
```

### "Orchestrator crash"

The orchestrator process (runs inside sync Job pods) exits unexpectedly.

- **Check logs** -- `kubectl logs -n synclet <pod-name> -c orchestrator`
- **Resource limits** -- The orchestrator may be OOMKilled. Increase memory limits in the Helm values.
- **RBAC** -- The orchestrator needs permission to create and watch Jobs. Verify the ClusterRole and ClusterRoleBinding are applied.

## General Debugging Steps

When something is not working, follow these steps in order:

1. **Check the job detail page** -- In the dashboard, click on the failed job. The log output and error message are usually enough to identify the problem.

2. **Verify the connector config with a connection test** -- On the source or destination settings page, click "Test Connection." This runs the connector's `check` command and reports the result.

3. **Check server logs** -- Review the Synclet server logs for errors:

   ```bash
   # Docker
   docker logs synclet

   # Kubernetes
   kubectl logs -n synclet deploy/synclet-server
   ```

4. **Re-test the connection** -- Use the "Test Connection" button on the source or destination page to isolate whether the issue is with credentials/connectivity or the sync process itself.

5. **Check host resources** -- Verify the host has enough CPU, memory, and disk space. Connector containers need at least 512 MB of memory.

   ```bash
   docker stats
   df -h
   ```

6. **Verify DNS and network** -- From inside the Synclet container, confirm you can resolve and reach the target host.

   ```bash
   docker exec -it synclet nslookup db.example.com
   docker exec -it synclet curl -v telnet://db.example.com:5432
   ```

## Getting Help

If you cannot resolve the issue, open a [GitHub Issue](https://github.com/synclet/synclet/issues). Please include:

- Synclet version (`synclet --version`)
- Deployment method (Docker, Kubernetes, binary)
- Connector image and version
- The full error message or log output
- Steps to reproduce
