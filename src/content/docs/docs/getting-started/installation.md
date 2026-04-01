---
title: Installation
description: Install Synclet using Docker Compose, a pre-built binary, or build from source.
---

## Prerequisites

Before installing Synclet, make sure you have the following:

| Requirement | Details |
|---|---|
| **PostgreSQL 16** | Used for all Synclet metadata, sync state, and configuration. Included in the Docker Compose setup. |
| **Docker** | Required to run Airbyte connectors. Docker Engine 20.10+ or Docker Desktop. |
| **Helm 3** *(optional)* | Only needed if you plan to deploy Synclet on Kubernetes. |

## Docker Compose (Recommended)

The fastest way to get Synclet running. This setup includes PostgreSQL, Synclet, and automatic database migrations.

```bash
# Clone the repository
git clone https://github.com/syncletdev/synclet.git
cd synclet

# Start all services in the background
docker compose up -d
```

This starts:

- **PostgreSQL 16** on port 5432
- **Synclet** on port 8080 (API + dashboard)
- Automatic database migrations on first startup

Open your browser and navigate to [http://localhost:8080](http://localhost:8080) to access the dashboard. You will be prompted to create your first admin account.

## Pre-built Binary

Download a pre-compiled binary from the [GitHub Releases](https://github.com/syncletdev/synclet/releases) page and run it directly.

**1. Download the binary**

```bash
# Replace <version> and <os-arch> with your target
curl -L -o synclet https://github.com/syncletdev/synclet/releases/download/<version>/synclet-<os-arch>
chmod +x synclet
```

**2. Set required environment variables**

```bash
export DSN="postgres://user:password@localhost:5432/synclet?sslmode=disable"
export JWT_SECRET="$(openssl rand -hex 32)"
export ENCRYPTION_KEY="$(openssl rand -base64 32)"
```

See the [Configuration](/docs/getting-started/configuration/) page for a full list of environment variables.

**3. Run database migrations**

```bash
./synclet migrate up
```

**4. Start the server**

```bash
./synclet server
```

Synclet is now running on port 8080 by default.

## Build from Source

If you prefer to compile Synclet yourself, you need **Go 1.25+** installed.

```bash
# Clone the repository
git clone https://github.com/syncletdev/synclet.git
cd synclet

# Build the binary
go build -o bin/synclet .

# Or, if you have Task installed:
task build
```

The compiled binary is located at `./bin/synclet`. Follow the same steps as the [Pre-built Binary](#pre-built-binary) section to configure and run it.

## Verifying Installation

Once Synclet is running, verify that everything is working:

**1. Check the health endpoint**

```bash
curl http://localhost:8080/health
```

You should receive a `200 OK` response.

**2. Open the dashboard**

Navigate to [http://localhost:8080](http://localhost:8080) in your browser. The Synclet dashboard should load.

**3. Create your first account**

On the first visit, Synclet will prompt you to create an admin account. Enter your email and password to complete the setup.

## Next Steps

- [Configuration](/docs/getting-started/configuration/) — Fine-tune Synclet with environment variables for SMTP, OIDC, sync behavior, and more.
- [Quick Start](/docs/getting-started/quick-start/) — Create your first source, destination, and connection.
