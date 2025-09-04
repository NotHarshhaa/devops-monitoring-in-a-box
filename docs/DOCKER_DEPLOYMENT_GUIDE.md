# Docker Deployment Guide

This guide covers the complete Docker deployment setup for the DevOps Monitoring Dashboard, including automated publishing to Docker Hub.

## 📋 Prerequisites

- Docker installed locally (for testing)
- Docker Hub account
- GitHub repository with Actions enabled

## 🐳 Docker Setup

### Local Testing

1. **Build the Docker image locally:**
   ```bash
   docker build -t devops-monitoring-dashboard:latest .
   ```

2. **Run the container:**
   ```bash
   docker run -p 3000:3000 devops-monitoring-dashboard:latest
   ```

3. **Verify the dashboard:**
   - Open your browser and navigate to `http://localhost:3000`
   - You should see the DevOps Monitoring Dashboard

### Docker Image Details

- **Base Image:** Node.js 18 Alpine
- **Multi-stage Build:** Optimized for production
- **Port:** 3000
- **Health Check:** Built-in health monitoring
- **Security:** Runs as non-root user

## 🚀 Automated Publishing

### GitHub Secrets Configuration

To enable automated Docker Hub publishing, you need to configure the following secrets in your GitHub repository:

#### Step 1: Get Docker Hub Credentials

1. **Docker Hub Username:**
   - Your Docker Hub username (e.g., `yourusername`)

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

When you push a tag like `v1.0.0`, the following tags will be created:

- `yourusername/devops-monitoring-dashboard:latest`
- `yourusername/devops-monitoring-dashboard:v1.0.0`

## 🏗️ Full Stack Deployment

### Using Docker Compose

For a complete monitoring stack deployment, use the provided `docker-compose.yml`:

```bash
# Clone the repository
git clone <your-repo-url>
cd devops-monitoring-in-a-box

# Start the full stack
docker-compose up -d
```

This will start:
- **Dashboard** (port 3000) - Your Next.js monitoring UI
- **Prometheus** (port 9090) - Metrics collection
- **Grafana** (port 3001) - Visualization dashboards
- **Loki** (port 3100) - Log aggregation
- **Alertmanager** (port 9093) - Alert management
- **Node Exporter** (port 9100) - System metrics
- **cAdvisor** (port 8080) - Container metrics

### Using Only the Dashboard

If you only want to run the dashboard:

```bash
# Pull the latest image
docker pull yourusername/devops-monitoring-dashboard:latest

# Run the container
docker run -p 3000:3000 yourusername/devops-monitoring-dashboard:latest
```

## 🔧 Configuration

### Environment Variables

The dashboard supports the following environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `production` | Node.js environment |
| `PORT` | `3000` | Application port |
| `HOSTNAME` | `0.0.0.0` | Host binding |
| `SITE_NAME` | `Monitoring in a Box` | Site title |
| `SITE_URL` | `http://localhost:3000` | Site URL |
| `SITE_DESCRIPTION` | `Comprehensive DevOps monitoring...` | Site description |

### Custom Configuration

You can override the default configuration by:

1. **Environment Variables:**
   ```bash
   docker run -p 3000:3000 \
     -e SITE_NAME="My Company Monitoring" \
     -e SITE_URL="https://monitoring.mycompany.com" \
     yourusername/devops-monitoring-dashboard:latest
   ```

2. **Configuration Files:**
   ```bash
   docker run -p 3000:3000 \
     -v $(pwd)/config.json:/app/config.json \
     yourusername/devops-monitoring-dashboard:latest
   ```

## 🐛 Troubleshooting

### Common Issues

1. **Build Fails:**
   - Check that all dependencies are properly installed
   - Verify the Dockerfile syntax
   - Ensure the Next.js build completes successfully

2. **Container Won't Start:**
   - Check port conflicts (ensure port 3000 is available)
   - Verify environment variables
   - Check container logs: `docker logs <container-id>`

3. **GitHub Actions Fails:**
   - Verify Docker Hub credentials are correct
   - Check that secrets are properly set
   - Ensure the tag format is correct (starts with 'v')

### Health Checks

The container includes built-in health checks:

```bash
# Check container health
docker ps

# View health check logs
docker inspect <container-id> | grep -A 10 Health
```

## 📚 Additional Resources

- [Commit-Based Build Guide](COMMIT_BASED_BUILD_GUIDE.md) - Build from any commit or branch
- [Docker Hub Documentation](https://docs.docker.com/docker-hub/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Next.js Docker Deployment](https://nextjs.org/docs/deployment#docker-image)
- [Docker Multi-stage Builds](https://docs.docker.com/develop/dev-best-practices/dockerfile_best-practices/#use-multi-stage-builds)
