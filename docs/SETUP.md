# 🚀 Setup Guide - DevOps Monitoring in a Box

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your system:

### Required Software

- **Docker** (version 20.10 or higher)
- **Docker Compose** (version 2.0 or higher)

### System Requirements

- **RAM**: Minimum 2GB, Recommended 4GB+
- **Storage**: At least 5GB free space
- **Ports**: Ensure ports 3000, 9090, 3100, 9093, 8080, 9100 are available

## 🔧 Installation Steps

### 1. Install Docker

#### Ubuntu/Debian

```bash
# Update package index
sudo apt update

# Install prerequisites
sudo apt install apt-transport-https ca-certificates curl gnupg lsb-release

# Add Docker's official GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repository
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt update
sudo apt install docker-ce docker-ce-cli containerd.io

# Start and enable Docker
sudo systemctl start docker
sudo systemctl enable docker

# Add user to docker group (optional, for non-sudo usage)
sudo usermod -aG docker $USER
```

#### CentOS/RHEL

```bash
# Install prerequisites
sudo yum install -y yum-utils

# Add Docker repository
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo

# Install Docker
sudo yum install docker-ce docker-ce-cli containerd.io

# Start and enable Docker
sudo systemctl start docker
sudo systemctl enable docker
```

#### macOS

```bash
# Install using Homebrew
brew install --cask docker

# Or download from https://www.docker.com/products/docker-desktop
```

#### Windows

Download and install Docker Desktop from [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)

### 2. Install Docker Compose

#### Linux

```bash
# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Make it executable
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker-compose --version
```

#### macOS/Windows

Docker Compose is included with Docker Desktop.

### 3. Clone and Setup the Project

```bash
# Clone the repository
git clone https://github.com/<your-username>/devops-monitoring-in-a-box.git
cd devops-monitoring-in-a-box

# Make scripts executable
chmod +x start.sh stop.sh

# Start the monitoring stack
./start.sh
```

## 🚀 Quick Start

### Option 1: Using the startup script (Recommended)

```bash
./start.sh
```

### Option 2: Using Docker Compose directly

```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

## 🌐 Accessing Your Monitoring Tools

Once all services are running, you can access:

| Service | URL | Default Credentials |
|---------|-----|-------------------|
| **Grafana** | <http://localhost:3000> | admin / admin |
| **Prometheus** | <http://localhost:9090> | None |
| **Loki** | <http://localhost:3100> | None |
| **Alertmanager** | <http://localhost:9093> | None |
| **cAdvisor** | <http://localhost:8080> | None |
| **Node Exporter** | <http://localhost:9100> | None |

## 📊 What You'll See

### Grafana Dashboard

- **Node Exporter Dashboard**: Pre-configured with system metrics
- **Prometheus Data Source**: Already configured and ready to use
- **Loki Data Source**: Ready for log queries

### Prometheus

- **Targets**: All services automatically discovered
- **Alerts**: Pre-configured alert rules for system monitoring
- **Metrics**: Real-time system and container metrics

### Loki

- **System Logs**: Collection from various log sources
- **Container Logs**: Docker container log aggregation
- **Search**: Log querying and filtering

## 🔧 Configuration

### Customizing Alertmanager

Edit `alertmanager/config.yml` to configure:

- Slack webhooks
- Email notifications
- Alert routing rules

### Adding More Exporters

To add additional exporters (MySQL, Redis, etc.):

1. Add the service to `docker-compose.yml`
2. Add scrape configuration to `prometheus/prometheus.yml`
3. Create custom dashboards in Grafana

### Custom Dashboards

- Place JSON dashboard files in `grafana/dashboards/`
- They will be automatically loaded by Grafana

## 🛠️ Troubleshooting

### Common Issues

#### Services won't start

```bash
# Check Docker status
docker info

# Check service logs
docker-compose logs [service-name]

# Check port availability
netstat -tulpn | grep :3000
```

#### Can't access Grafana

```bash
# Check if Grafana is running
docker-compose ps grafana

# Check Grafana logs
docker-compose logs grafana

# Verify port binding
docker port grafana
```

#### Prometheus targets down

```bash
# Check Prometheus logs
docker-compose logs prometheus

# Verify network connectivity
docker-compose exec prometheus wget -qO- http://node-exporter:9100/metrics
```

#### High resource usage

```bash
# Check resource usage
docker stats

# Adjust resource limits in docker-compose.yml
```

### Reset Everything

```bash
# Stop and remove all containers
docker-compose down

# Remove all volumes (WARNING: This will delete all data)
docker-compose down -v

# Remove all images
docker-compose down --rmi all

# Start fresh
./start.sh
```

## 📈 Monitoring Your Own Applications

### Adding Custom Metrics

1. **Instrument your application** with Prometheus client libraries
2. **Add scrape configuration** to `prometheus/prometheus.yml`
3. **Create custom dashboards** in Grafana

### Example Prometheus scrape config

```yaml
- job_name: 'my-app'
  static_configs:
    - targets: ['my-app:8080']
  metrics_path: '/metrics'
  scrape_interval: 15s
```

### Adding Custom Logs

1. **Configure your application** to output structured logs
2. **Update Promtail config** in `loki/promtail-config.yml`
3. **Query logs** in Grafana using Loki

## 🔒 Security Considerations

### Production Deployment

- **Change default passwords** for all services
- **Use secrets management** for sensitive configuration
- **Restrict network access** with firewalls
- **Enable TLS/SSL** for all services
- **Use reverse proxy** (nginx, traefik) for external access

### Environment Variables

Create a `.env` file for sensitive configuration:

```bash
GRAFANA_ADMIN_PASSWORD=your-secure-password
SLACK_WEBHOOK_URL=your-slack-webhook
SMTP_PASSWORD=your-smtp-password
```

## 📚 Next Steps

### Learning Resources

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [Loki Documentation](https://grafana.com/docs/loki/latest/)
- [Node Exporter Documentation](https://github.com/prometheus/node_exporter)

### Advanced Topics

- **Kubernetes Deployment**: Create K8s manifests
- **Terraform Automation**: Infrastructure as Code
- **CI/CD Integration**: Automated deployment
- **Custom Dashboards**: Build specialized visualizations
- **Alert Rules**: Create business-specific alerts

## 🤝 Getting Help

### Community Support

- **GitHub Issues**: Report bugs and request features
- **Discord**: Join our community server
- **Documentation**: Check the README and this guide

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

**Happy Monitoring! 🚀**

If you find this project helpful, please give it a ⭐ on GitHub!
