# 🐳 Docker Deployment - DevOps Monitoring Dashboard

Quick start guide for running the DevOps Monitoring Dashboard with Docker.

## 🚀 Quick Start

### Option 1: Full Stack (Recommended)

Run the complete monitoring stack with one command:

```bash
./start-full-stack.sh
```

This will start:
- ✅ **Dashboard** (port 3000) - Your monitoring UI
- ✅ **Prometheus** (port 9090) - Metrics collection  
- ✅ **Grafana** (port 3001) - Visualization dashboards
- ✅ **Loki** (port 3100) - Log aggregation
- ✅ **Alertmanager** (port 9093) - Alert management
- ✅ **Node Exporter** (port 9100) - System metrics
- ✅ **cAdvisor** (port 8080) - Container metrics

### Option 2: Dashboard Only

If you only want the dashboard:

```bash
# Pull the latest image
docker pull yourusername/devops-monitoring-dashboard:latest

# Run the container
docker run -p 3000:3000 yourusername/devops-monitoring-dashboard:latest
```

## 📋 Prerequisites

- Docker and Docker Compose installed
- Docker Hub account (for pulling images)

## ⚙️ Configuration

1. **Copy environment file:**
   ```bash
   cp docker-compose.env.example .env
   ```

2. **Edit `.env` file:**
   ```bash
   # Replace 'yourusername' with your Docker Hub username
   DOCKERHUB_USERNAME=yourusername
   ```

## 🎯 Access Points

After starting, access your services at:

| Service | URL | Credentials |
|---------|-----|-------------|
| **Dashboard** | http://localhost:3000 | - |
| **Prometheus** | http://localhost:9090 | - |
| **Grafana** | http://localhost:3001 | admin/admin |
| **Loki** | http://localhost:3100 | - |
| **Alertmanager** | http://localhost:9093 | - |
| **Node Exporter** | http://localhost:9100 | - |
| **cAdvisor** | http://localhost:8080 | - |

## 🛠️ Management Commands

```bash
# View all services
docker-compose ps

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Restart services
docker-compose restart

# Update to latest images
docker-compose pull
docker-compose up -d
```

## 📚 Documentation

- [Complete Docker Deployment Guide](docs/DOCKER_DEPLOYMENT_GUIDE.md)
- [GitHub Actions Setup](docs/DOCKER_DEPLOYMENT_GUIDE.md#automated-publishing)
- [Configuration Options](docs/DOCKER_DEPLOYMENT_GUIDE.md#configuration)

## 🆘 Troubleshooting

### Common Issues

1. **Port conflicts:** Ensure ports 3000, 3001, 9090, 3100, 9093, 9100, 8080 are available
2. **Permission issues:** Make sure Docker daemon is running and you have proper permissions
3. **Image not found:** Verify your Docker Hub username in the `.env` file

### Getting Help

- Check service logs: `docker-compose logs <service-name>`
- Verify service status: `docker-compose ps`
- Restart problematic service: `docker-compose restart <service-name>`

---

**🎉 Happy monitoring!** Your DevOps monitoring stack is now running with Docker.
