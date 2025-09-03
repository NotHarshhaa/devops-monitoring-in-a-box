# ⚙️ Configuration Guide

This comprehensive guide covers all configuration options for the Monitoring in a Box platform, including environment variables, configuration files, and deployment settings.

## Table of Contents

- [Environment Variables](#environment-variables)
- [Configuration Files](#configuration-files)
- [Configuration Management](#configuration-management)
- [Quick Setup Examples](#quick-setup-examples)
- [Production Deployment](#production-deployment)
- [Troubleshooting](#troubleshooting)

## Environment Variables

Configure your Monitoring in a Box platform using environment variables. Create a `.env` file in the project root or set these variables in your deployment environment.

### 🌐 Site Configuration
```bash
# Site Information
SITE_NAME="Monitoring in a Box"                    # Your platform name
SITE_URL="http://localhost:3000"                   # Your platform URL
SITE_DESCRIPTION="Modern monitoring solution"      # Site description
SITE_VERSION="1.0.0"                              # Platform version

# SEO Configuration
SEO_TITLE="Monitoring in a Box - Infrastructure Monitoring"
SEO_DESCRIPTION="Comprehensive DevOps monitoring solution"
SEO_KEYWORDS="devops,monitoring,infrastructure,metrics"
SEO_AUTHOR="Monitoring in a Box Team"
SEO_ROBOTS="index,follow"
SEO_CANONICAL="http://localhost:3000"
```

### 🔐 Authentication & Security
```bash
# Authentication
NEXTAUTH_SECRET="your-secret-key-here"             # Required for JWT tokens
NEXTAUTH_URL="http://localhost:3000"               # Your app URL

# Database
DATABASE_URL="file:./dev.db"                       # SQLite for development
# DATABASE_URL="postgresql://user:pass@localhost:5432/monitoring"  # PostgreSQL for production

# Session Configuration
SESSION_MAX_AGE="30d"                              # Session duration
SESSION_UPDATE_AGE="1d"                            # Session refresh interval
```

### 📊 Monitoring Services
```bash
# Prometheus Configuration
PROMETHEUS_URL="http://localhost:9090"             # Prometheus server URL
PROMETHEUS_RETENTION="15d"                         # Data retention period
PROMETHEUS_SCRAPE_INTERVAL="15s"                   # Metrics scrape interval

# Grafana Configuration
GRAFANA_URL="http://localhost:3000"                # Grafana server URL
GRAFANA_USER="admin"                               # Grafana admin username
GRAFANA_PASSWORD="admin"                           # Grafana admin password

# Loki Configuration
LOKI_URL="http://localhost:3100"                   # Loki server URL
LOKI_RETENTION="30d"                               # Log retention period

# Alertmanager Configuration
ALERTMANAGER_URL="http://localhost:9093"           # Alertmanager server URL
```

### 🔔 Notification Services
```bash
# Email Configuration
SMTP_HOST="smtp.gmail.com"                         # SMTP server host
SMTP_PORT="587"                                    # SMTP server port
SMTP_SECURE="false"                                # Use TLS (true/false)
SMTP_USER="your-email@gmail.com"                   # SMTP username
SMTP_PASS="your-app-password"                      # SMTP password
EMAIL_FROM="alerts@yourcompany.com"                # From email address
EMAIL_TO="admin@yourcompany.com"                   # Default recipient

# Slack Configuration
SLACK_WEBHOOK_URL="https://hooks.slack.com/..."    # Slack webhook URL
SLACK_CHANNEL="#alerts"                            # Default Slack channel
SLACK_USERNAME="Monitoring Bot"                    # Bot username
SLACK_ICON_EMOJI=":bell:"                          # Bot icon emoji

# Microsoft Teams Configuration
TEAMS_WEBHOOK_URL="https://outlook.office.com/..." # Teams webhook URL
TEAMS_TITLE="Monitoring Alert"                     # Alert title

# Discord Configuration
DISCORD_WEBHOOK_URL="https://discord.com/api/..."  # Discord webhook URL
DISCORD_USERNAME="Monitoring Bot"                  # Bot username
DISCORD_AVATAR_URL="https://..."                   # Bot avatar URL
```

### 🎨 UI Configuration
```bash
# Theme Configuration
DEFAULT_THEME="system"                             # Default theme (light/dark/system)
ENABLE_THEME_TOGGLE="true"                         # Enable theme switching

# Dashboard Configuration
DASHBOARD_REFRESH_INTERVAL="15s"                   # Auto-refresh interval
DASHBOARD_MAX_METRICS="50"                         # Maximum metrics per dashboard
DASHBOARD_DEFAULT_TIME_RANGE="1h"                  # Default time range

# Logs Configuration
LOGS_DEFAULT_QUERY="{job=\"varlogs\"}"             # Default log query
LOGS_DEFAULT_LIMIT="100"                           # Default log entries limit
LOGS_REFRESH_INTERVAL="10s"                        # Log refresh interval
```

### 🔌 Plugin Configuration
```bash
# Plugin System
ENABLE_PLUGINS="true"                              # Enable plugin system
PLUGIN_DIRECTORY="./plugins"                       # Plugin directory path
PLUGIN_AUTO_LOAD="true"                            # Auto-load plugins on startup

# Plugin Marketplace
PLUGIN_MARKETPLACE_URL="https://plugins.monitoring.com"  # Plugin marketplace URL
PLUGIN_UPDATE_CHECK="true"                         # Check for plugin updates
```

### 🏢 Multi-tenant Configuration
```bash
# Multi-tenancy
ENABLE_MULTI_TENANT="true"                         # Enable multi-tenant support
DEFAULT_TENANT="default"                           # Default tenant name
TENANT_ISOLATION="strict"                          # Tenant isolation level (strict/loose)
```

### 📈 Analytics & Monitoring
```bash
# Analytics
ENABLE_ANALYTICS="true"                            # Enable analytics tracking
GOOGLE_ANALYTICS_ID="GA-XXXXXXXXX"                 # Google Analytics ID
MIXPANEL_TOKEN="your-mixpanel-token"               # Mixpanel token

# Performance Monitoring
ENABLE_PERFORMANCE_MONITORING="true"               # Enable performance monitoring
SENTRY_DSN="https://..."                           # Sentry DSN for error tracking
```

### 🗄️ Database Configuration
```bash
# SQLite (Development)
DATABASE_URL="file:./dev.db"                       # SQLite database file

# PostgreSQL (Production)
DATABASE_URL="postgresql://user:password@localhost:5432/monitoring"
DB_HOST="localhost"                                # Database host
DB_PORT="5432"                                     # Database port
DB_NAME="monitoring"                               # Database name
DB_USER="monitoring_user"                          # Database user
DB_PASSWORD="secure_password"                      # Database password
DB_SSL="true"                                      # Use SSL connection

# MySQL (Alternative)
DATABASE_URL="mysql://user:password@localhost:3306/monitoring"
```

### 🚀 Deployment Configuration
```bash
# Production Settings
NODE_ENV="production"                              # Environment (development/production)
PORT="3000"                                        # Application port
HOST="0.0.0.0"                                     # Bind address

# Docker Configuration
DOCKER_REGISTRY="your-registry.com"                # Docker registry URL
DOCKER_IMAGE_TAG="latest"                          # Docker image tag

# Kubernetes Configuration
K8S_NAMESPACE="monitoring"                         # Kubernetes namespace
K8S_INGRESS_CLASS="nginx"                          # Ingress class
```

## Configuration Files

### Site Configuration (`site-config.json`)
```json
{
  "name": "Monitoring in a Box",
  "description": "Modern monitoring solution",
  "url": "http://localhost:3000",
  "seo": {
    "title": "Monitoring in a Box - Infrastructure Monitoring",
    "description": "Comprehensive DevOps monitoring solution",
    "keywords": ["devops", "monitoring", "infrastructure"]
  },
  "branding": {
    "logo": {
      "light": "/logo-light.png",
      "dark": "/logo-dark.png",
      "favicon": "/favicon.ico"
    },
    "colors": {
      "primary": "#3b82f6",
      "secondary": "#10b981",
      "accent": "#f59e0b"
    }
  },
  "features": {
    "analytics": true,
    "notifications": true,
    "multi_tenant": true,
    "plugins": true
  }
}
```

### Monitoring Configuration (`config.json`)
```json
{
  "dashboard": {
    "refresh_interval": "15s",
    "title": "Monitoring in a Box",
    "theme": "system"
  },
  "metrics": [
    {
      "name": "CPU Usage",
      "query": "100 - (avg by(instance)(irate(node_cpu_seconds_total{mode=\"idle\"}[5m])) * 100)",
      "unit": "%",
      "chart": "line",
      "thresholds": {
        "warning": 70,
        "critical": 85
      }
    }
  ],
  "services": {
    "prometheus": {
      "url": "http://localhost:9090",
      "enabled": true
    },
    "grafana": {
      "url": "http://localhost:3000",
      "enabled": true
    }
  }
}
```

## Configuration Management

### Using Environment Variables
1. **Create `.env` file** in project root:
   ```bash
   cp env.example .env
   ```

2. **Edit configuration**:
   ```bash
   nano .env
   ```

3. **Restart services**:
   ```bash
   docker-compose down && docker-compose up -d
   ```

### Using Configuration Files
1. **Edit site configuration**:
   ```bash
   nano site-config.json
   ```

2. **Edit monitoring configuration**:
   ```bash
   nano config.json
   ```

3. **Apply changes** through the UI or restart services

### Configuration Validation
```bash
# Validate configuration
npm run validate-config

# Test configuration
npm run test-config
```

## Quick Setup Examples

### Development Setup
```bash
# .env for development
NODE_ENV=development
DATABASE_URL=file:./dev.db
PROMETHEUS_URL=http://localhost:9090
GRAFANA_URL=http://localhost:3000
LOKI_URL=http://localhost:3100
ALERTMANAGER_URL=http://localhost:9093
```

### Production Setup
```bash
# .env for production
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@db:5432/monitoring
PROMETHEUS_URL=http://prometheus:9090
GRAFANA_URL=http://grafana:3000
LOKI_URL=http://loki:3100
ALERTMANAGER_URL=http://alertmanager:9093
SMTP_HOST=smtp.gmail.com
SMTP_USER=alerts@yourcompany.com
SMTP_PASS=your-app-password
SLACK_WEBHOOK_URL=https://hooks.slack.com/...
```

### Docker Compose Environment
```yaml
# docker-compose.override.yml
version: '3.8'
services:
  ui-next:
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://monitoring:password@postgres:5432/monitoring
      - PROMETHEUS_URL=http://prometheus:9090
      - GRAFANA_URL=http://grafana:3000
      - LOKI_URL=http://loki:3100
      - ALERTMANAGER_URL=http://alertmanager:9093
```

### Kubernetes ConfigMap
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: monitoring-config
data:
  NODE_ENV: "production"
  PROMETHEUS_URL: "http://prometheus:9090"
  GRAFANA_URL: "http://grafana:3000"
  LOKI_URL: "http://loki:3100"
  ALERTMANAGER_URL: "http://alertmanager:9093"
```

## Production Deployment

### Security Checklist
- [ ] Change default passwords
- [ ] Use strong NEXTAUTH_SECRET
- [ ] Enable SSL/TLS
- [ ] Configure proper CORS origins
- [ ] Set up database backups
- [ ] Enable audit logging
- [ ] Configure rate limiting
- [ ] Set up monitoring for the monitoring system

### Performance Optimization
- [ ] Use PostgreSQL for production database
- [ ] Configure Redis for session storage
- [ ] Enable CDN for static assets
- [ ] Set up proper caching headers
- [ ] Configure load balancing
- [ ] Enable compression
- [ ] Optimize database queries
- [ ] Set up monitoring and alerting

### Backup Strategy
```bash
# Database backup
pg_dump -h localhost -U monitoring_user monitoring > backup_$(date +%Y%m%d_%H%M%S).sql

# Configuration backup
tar -czf config_backup_$(date +%Y%m%d_%H%M%S).tar.gz site-config.json config.json .env
```

## Troubleshooting

### Common Issues

#### Configuration Not Loading
```bash
# Check environment variables
env | grep -E "(SITE_|PROMETHEUS_|GRAFANA_)"

# Validate configuration files
node -e "console.log(JSON.parse(require('fs').readFileSync('site-config.json', 'utf8')))"
```

#### Database Connection Issues
```bash
# Test database connection
psql $DATABASE_URL -c "SELECT 1;"

# Check database permissions
psql $DATABASE_URL -c "\du"
```

#### Service Connection Issues
```bash
# Test service connectivity
curl -f http://localhost:9090/api/v1/query?query=up
curl -f http://localhost:3000/api/health
curl -f http://localhost:3100/ready
curl -f http://localhost:9093/api/v1/status
```

#### Notification Issues
```bash
# Test SMTP connection
telnet smtp.gmail.com 587

# Test webhook endpoints
curl -X POST -H "Content-Type: application/json" \
  -d '{"text":"Test message"}' \
  $SLACK_WEBHOOK_URL
```

### Debug Mode
```bash
# Enable debug logging
DEBUG=* npm run dev

# Enable verbose logging
LOG_LEVEL=debug npm start
```

### Health Checks
```bash
# Check all services
curl http://localhost:3000/api/health

# Check individual components
curl http://localhost:3000/api/health/prometheus
curl http://localhost:3000/api/health/grafana
curl http://localhost:3000/api/health/loki
curl http://localhost:3000/api/health/alertmanager
```

## Best Practices

### Environment Management
1. **Use different configs** for dev/staging/production
2. **Never commit secrets** to version control
3. **Use environment-specific** configuration files
4. **Validate configuration** on startup
5. **Document all variables** and their purposes

### Security
1. **Rotate secrets regularly**
2. **Use least privilege** for database users
3. **Enable audit logging**
4. **Monitor configuration changes**
5. **Use secure communication** (HTTPS/TLS)

### Performance
1. **Cache configuration** in memory
2. **Use connection pooling** for databases
3. **Monitor resource usage**
4. **Set up proper timeouts**
5. **Optimize queries** and API calls

### Monitoring
1. **Monitor the monitoring system**
2. **Set up alerts** for configuration issues
3. **Track configuration changes**
4. **Monitor performance metrics**
5. **Set up health checks**

## Support

For additional help with configuration:

- 📖 **Documentation**: [Complete Documentation](README.md)
- 🐛 **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- 💬 **Community**: [Discord Server](https://discord.gg/monitoring-in-a-box)
- 📧 **Email**: support@monitoringinabox.com

---

**Need help?** Check our [troubleshooting guide](TROUBLESHOOTING.md) or reach out to our community!
