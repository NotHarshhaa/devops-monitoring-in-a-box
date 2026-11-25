# Docker Deployment Guide

This guide covers the complete Docker deployment setup for the DevOps Monitoring Dashboard, including automated publishing to Docker Hub.

## 📋 Prerequisites

- Docker installed locally (for testing)
- Docker Hub account
- GitHub repository with Actions enabled

## 🐳 Docker Setup

### Local Testing

1. **Build the Docker image locally (Dockerfile lives in `ui-next/`):**
   ```bash
   docker build -f ui-next/Dockerfile -t devops-monitoring-dashboard:latest ui-next
   # Or run the automated build + 0-CVE scan script:
   ./scripts/test-docker-build.sh
   ```

2. **Run the container (hardened read-only mode):**
   ```bash
   docker run --rm -p 4000:3000 \
     --read-only --cap-drop=ALL --security-opt=no-new-privileges:true \
     --tmpfs /tmp:rw,noexec,nosuid,nodev,size=64m \
     --tmpfs /app/.next/cache:rw,noexec,nosuid,nodev,uid=65532,gid=65532,size=64m \
     -e NEXTAUTH_SECRET="$(openssl rand -base64 32)" \
     -e NEXTAUTH_URL="http://localhost:4000" \
     devops-monitoring-dashboard:latest
   ```

3. **Verify the dashboard:**
   - Open your browser and navigate to `http://localhost:4000`
   - You should see the DevOps Monitoring Dashboard

### Docker Image Details

- **Builder Base:** `cgr.dev/chainguard/node:latest` (Wolfi Linux, multi-arch OCI digest-pinned)
- **Runner Base:** `cgr.dev/chainguard/glibc-dynamic:latest` (distroless, no shell/BusyBox/npm/package manager)
- **Platforms:** `linux/amd64`, `linux/arm64`
- **Container Port:** `3000` (published as host port `4000` in `docker-compose.yml`)
- **Health Check:** Exec-form native Node `fetch` probe against `http://127.0.0.1:3000/api/health?live=1`
- **Security:** Runs as non-root `65532:65532` (`CONFIG_PATH=/tmp/config.json`) with **0 CVEs** across Trivy and Docker Scout

## 🚀 Automated Publishing

### GitHub Secrets Configuration

To enable automated Docker Hub publishing, you need to configure the following secrets in your GitHub repository:

#### Step 1: Get Docker Hub Credentials

1. **Docker Hub Username:**
   - Your Docker Hub username (e.g., `your-dockerhub-username`)

2. **Docker Hub Access Token:**
   - Go to [Docker Hub Security Settings](https://hub.docker.com/settings/security)
   - Click "New Access Token"
   - Give it a name (e.g., "GitHub Actions")
   - Copy the generated token

#### Step 2: Add GitHub Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add the following secrets:

   | Secret Name | Value | Description |
   |-------------|-------|-------------|
   | `DOCKERHUB_USERNAME` | `your-dockerhub-username` | Your Docker Hub username |
   | `DOCKERHUB_TOKEN` | `your-access-token` | Docker Hub access token |

### Workflow Triggers

The GitHub Actions workflow automatically triggers on:

- ✅ **Push to main/master** - Builds automatically on every push
- ✅ **Version tags** - `v*` tags (e.g., `v1.0.0`, `v2.1.3`)
- ✅ **Manual trigger** - Build from any commit, branch, or tag

**Examples:**
- ✅ `v1.0.0` - Will trigger build and publish
- ✅ `v2.1.3` - Will trigger build and publish  
- ✅ `main` branch push - Will trigger build
- ✅ Manual build from commit SHA - Will trigger build

## 📦 Release Process

### Creating a Release

1. **Make your changes and commit:**
   ```bash
   git add .
   git commit -m "feat: add new monitoring features"
   git push origin main
   ```

2. **Create and push a version tag:**
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

3. **Monitor the build:**
   - Go to your GitHub repository
   - Click on the **Actions** tab
   - Watch the "Docker Build and Publish" workflow

4. **Verify the published image:**
   - Check [Docker Hub](https://hub.docker.com) for your image
   - The image will be tagged with both `latest` and the version tag

### Image Tags

When you push a tag like `v1.0.0`, the following tags will be created under `${DOCKERHUB_USERNAME}/devops-monitoring-box`:

- `<your-dockerhub-username>/devops-monitoring-box:latest`
- `<your-dockerhub-username>/devops-monitoring-box:v1.0.0`

## 🏗️ Full Stack Deployment

### Using Docker Compose

For a complete monitoring stack deployment, use the provided `docker-compose.yml`:

```bash
# Clone the repository
git clone https://github.com/NotHarshhaa/devops-monitoring-in-a-box.git
cd devops-monitoring-in-a-box

# Generate required secrets (.env + alertmanager/webhook_token)
./scripts/setup-env.sh

# Start the full stack
docker compose up -d
```

This will start:
- **Dashboard** (port `4000` → container `3000`) - Your Next.js monitoring UI
- **Prometheus** (port `9090`) - Metrics collection
- **Grafana** (port `3000`) - Visualization dashboards
- **Loki** (port `3100`) - Log aggregation
- **Alertmanager** (port `9093`) - Alert management
- **Node Exporter** (port `9100`) - System metrics
- **cAdvisor** (port `8080`) - Container metrics
- **Blackbox Exporter** (port `9115`) - Synthetic HTTP/TCP/ICMP probing

### Using Only the Dashboard

If you only want to run the dashboard:

```bash
# Pull the latest image
docker pull harshhaareddy/devops-monitoring-box:latest

# Run the hardened container
docker run -d -p 4000:3000 --name devops-monitor \
  --read-only --cap-drop=ALL --security-opt=no-new-privileges:true \
  --tmpfs /tmp:rw,noexec,nosuid,nodev,size=64m \
  --tmpfs /app/.next/cache:rw,noexec,nosuid,nodev,uid=65532,gid=65532,size=64m \
  -e NEXTAUTH_SECRET="$(openssl rand -base64 32)" \
  -e NEXTAUTH_URL="http://localhost:4000" \
  harshhaareddy/devops-monitoring-box:latest
```

## 🔧 Configuration

### Environment Variables

The dashboard supports the following environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `production` | Node.js environment |
| `PORT` | `3000` | Internal container port |
| `HOSTNAME` | `0.0.0.0` | Host binding |
| `CONFIG_PATH` | `/tmp/config.json` | Runtime notification config path (writable under `--read-only`) |
| `SITE_NAME` | `Monitoring in a Box` | Site title |
| `SITE_URL` | `http://localhost:4000` | Public site URL |
| `SITE_DESCRIPTION` | `Comprehensive DevOps monitoring...` | Site description |

### Custom Configuration

You can override the default configuration by:

1. **Environment Variables:**
   ```bash
   docker run -p 4000:3000 \
     -e NEXTAUTH_SECRET="$(openssl rand -base64 32)" \
     -e SITE_NAME="My Company Monitoring" \
     -e SITE_URL="https://monitoring.mycompany.com" \
     harshhaareddy/devops-monitoring-box:latest
   ```

2. **Configuration Files:**
   ```bash
   docker run -p 4000:3000 \
     -e NEXTAUTH_SECRET="$(openssl rand -base64 32)" \
     -e CONFIG_PATH=/data/config.json \
     -v $(pwd)/config.json:/data/config.json \
     harshhaareddy/devops-monitoring-box:latest
   ```

## 🐛 Troubleshooting

### Common Issues

1. **Build Fails:**
   - Check that all dependencies are properly installed
   - Verify you are building with context `./ui-next` (`docker build -f ui-next/Dockerfile ui-next`)
   - Ensure the Next.js build completes successfully

2. **Container Won't Start:**
   - Check port conflicts (ensure host port `4000` is available)
   - Verify `NEXTAUTH_SECRET` and writable `/tmp` & `/app/.next/cache` tmpfs mounts when running `--read-only`
   - Check container logs: `docker logs <container-id>`

3. **GitHub Actions Fails:**
   - Verify Docker Hub credentials are correct
   - Check that secrets are properly set
   - Ensure the tag format is correct (starts with 'v')

### Health Checks

The container includes a built-in native Node health check (`/api/health?live=1`):

```bash
# Check container health
docker ps

# View health check logs
docker inspect --format '{{json .State.Health}}' <container-id>
```

## 🔒 Security Features

### **Automated Security Scanning**
- **Docker Scout** (`docker/scout-action@v1`) and **Trivy** (`ghcr.io/aquasecurity/trivy:0.69.0`) scan built images
- **0-CVE Enforcement** across `CRITICAL`, `HIGH`, `MEDIUM`, and `LOW` severities (workflow fails if any CVE is found)
- **Production dependency audit** (`npm audit --omit=dev --audit-level=low`) enforced in CI
- **Security reports** surfaced in workflow summaries and pull requests

### **Security Measures**
- **Updated dependencies** with zero production runtime vulnerabilities
- **Distroless Chainguard Wolfi** runtime (`glibc-dynamic`, digest-pinned, no shell/BusyBox/npm/package manager)
- **Non-root execution** (`65532:65532`) with `--read-only`, `cap_drop: [ALL]`, and `no-new-privileges:true` in Compose
- **Minimal attack surface** with multi-stage builds and BuildKit `--ignore-scripts` dependency installation

## 📚 Additional Resources

- [Main README Security Notes](../README.md#-security-notes) - Compose and runtime hardening summary
- [Production Setup Guide](PRODUCTION_SETUP.md) - Production secrets and environment checklist
- [Docker Hub Documentation](https://docs.docker.com/docker-hub/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Next.js Docker Deployment](https://nextjs.org/docs/app/getting-started/deploying)
- [Docker Multi-stage Builds](https://docs.docker.com/build/building/multi-stage/)
