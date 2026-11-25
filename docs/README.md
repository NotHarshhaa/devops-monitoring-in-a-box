# DevOps Monitoring in a Box - Documentation

Welcome to the comprehensive documentation for the DevOps Monitoring in a Box project. This documentation covers all aspects of the monitoring system, from setup and configuration to advanced features and integrations.

## 📚 Documentation Index

### 🚀 Getting Started
- **[Setup Guide](SETUP.md)** - Complete setup instructions for the monitoring stack
- **[Docker Deployment Guide](DOCKER_DEPLOYMENT_GUIDE.md)** - Distroless Wolfi container build, hardening, and Docker Hub publishing
- **[Configuration Guide](CONFIGURATION_GUIDE.md)** - Complete configuration reference with environment variables
- **[Production Setup Guide](PRODUCTION_SETUP.md)** - Production environment and security hardening checklist
- **[Project Structure](PROJECT_STRUCTURE.md)** - Complete project structure overview
- **[Main README](../README.md)** - Project overview and quick start guide

### 🔧 Core Components

#### Prometheus Integration
- **[Prometheus Integration Guide](PROMETHEUS_INTEGRATION.md)** - Complete guide to Prometheus setup, configuration, and usage
- **[Prometheus Queries Reference](PROMETHEUS_INTEGRATION.md#prometheus-queries-used)** - CPU, memory, disk, network, and load PromQL expressions
- **[Alert Rules Configuration](ALERTMANAGER_INTEGRATION.md#configuration)** - Setting up and managing alert rules

#### Grafana Dashboards
- **[Grafana Dashboard Provisioning](SETUP.md#grafana-dashboard)** - Pre-configured dashboards and custom provisioning
- **[Grafana Datasources](../grafana/datasources)** - Pre-provisioned Prometheus and Loki datasources

#### Loki Log Management
- **[Loki Integration Guide](LOKI_INTEGRATION.md)** - Centralized log aggregation and search
- **[Log Shipping Configuration](LOKI_INTEGRATION.md#configuration)** - Setting up Promtail for log collection

#### AlertManager
- **[AlertManager Integration](ALERTMANAGER_INTEGRATION.md)** - Alert routing, grouping, and notification management
- **[Notification Channels](ALERTMANAGER_INTEGRATION.md#notification-channels)** - Email, Slack, and other notification setups

### 🎨 User Interface

#### Next.js Web Application
- **[UI Application Guide](UI_README.md)** - Frontend application setup and features
- **[Authentication & Multi-Tenancy](AUTHENTICATION_MULTI_TENANCY_GUIDE.md)** - User management and role-based access control

#### Configuration Management
- **[Configuration System Guide](CONFIG_SYSTEM_GUIDE.md)** - Dynamic configuration management
- **[Configuration Enhancement Guide](CONFIGURATION_ENHANCEMENT_GUIDE.md)** - Advanced configuration features

#### Dashboard Templates
- **[Dashboard Template Management Guide](DASHBOARD_TEMPLATE_MANAGEMENT_GUIDE.md)** - Create, import, and manage monitoring dashboard templates
- **[Template Marketplace](DASHBOARD_TEMPLATE_MANAGEMENT_GUIDE.md#template-marketplace)** - Browse and import pre-built templates
- **[Custom Template Creation](DASHBOARD_TEMPLATE_MANAGEMENT_GUIDE.md#creating-custom-templates)** - Build custom templates from scratch

#### Plugin System
- **[Plugin System Guide](PLUGIN_SYSTEM_GUIDE.md)** - Extensible plugin system for new data sources
- **[Available Plugins](PLUGIN_SYSTEM_GUIDE.md#available-plugins)** - AWS CloudWatch, Jenkins, GitHub Actions plugins
- **[Plugin Development](PLUGIN_SYSTEM_GUIDE.md#plugin-development)** - Create custom plugins and integrations

### 🔍 Monitoring & Health

#### Service Health Monitoring
- **[Service Health Guide](SERVICE_HEALTH_GUIDE.md)** - Monitoring service availability and performance
- **[Health Check Endpoints](SERVICE_HEALTH_GUIDE.md#api-reference)** - API endpoints and health check methods

#### User Experience
- **[UX Improvements Guide](UX_IMPROVEMENTS_GUIDE.md)** - User interface enhancements and best practices

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js UI    │    │   Prometheus    │    │     Grafana     │
│   (Port 4000)   │◄──►│   (Port 9090)   │◄──►│   (Port 3000)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       ▼                       │
         │              ┌─────────────────┐              │
         │              │   AlertManager  │              │
         │              │   (Port 9093)   │              │
         │              └─────────────────┘              │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│      Loki       │    │  Node Exporter  │    │    Promtail     │
│   (Port 3100)   │    │   (Port 9100)   │    │   (Log Agent)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/NotHarshhaa/devops-monitoring-in-a-box.git
   cd devops-monitoring-in-a-box
   ```

2. **Generate required secrets and start the stack**
   ```bash
   ./scripts/setup-env.sh
   docker compose up -d
   # Or use the wrapper script:
   ./devops-monitor.sh start
   ```

3. **Access the applications**
   - **Web UI**: http://localhost:4000 (or http://localhost:3000 when running `npm run dev` locally)
   - **Grafana**: http://localhost:3000
   - **Prometheus**: http://localhost:9090
   - **Loki**: http://localhost:3100
   - **Alertmanager**: http://localhost:9093

## 📋 Prerequisites

- Docker and Docker Compose (v2+)
- Node.js 20+ (24 LTS recommended for local UI development)
- Basic knowledge of monitoring concepts

## 🔐 Authentication

The system uses NextAuth v4 (`ui-next/lib/auth-simple.ts`) with session protection (`ui-next/proxy.ts`):
- **Demo Users**: Enabled outside production (`ENABLE_DEMO_AUTH=true` in Compose for out-of-the-box demos; set `false` for hardened production)
- **Prisma Schema**: Includes optional OAuth account/session models for custom database-backed deployments
- **Role-Based Access**: Admin, Editor, Viewer roles

### Demo Credentials
- **Admin**: `demo@example.com` / `demo123`
- **Editor**: `editor@example.com` / `editor123`
- **Viewer**: `viewer@example.com` / `viewer123`

## 📊 Features

### Core Monitoring
- ✅ **Real-time Metrics**: CPU, Memory, Disk, Network monitoring
- ✅ **Custom Dashboards**: Configurable Grafana dashboards
- ✅ **Alert Management**: Intelligent alerting with AlertManager
- ✅ **Log Aggregation**: Centralized logging with Loki
- ✅ **Service Health**: Automated health checks and status monitoring

### User Interface
- ✅ **Modern Web UI**: Next.js-based monitoring interface
- ✅ **Responsive Design**: Works on desktop and mobile
- ✅ **Dark/Light Theme**: User preference support
- ✅ **Multi-tenant**: User-specific configurations and dashboards

### Advanced Features
- ✅ **Dynamic Configuration**: Runtime configuration updates
- ✅ **Role-based Access**: Granular permission system
- ✅ **Export/Import**: Configuration backup and restore
- ✅ **API Integration**: RESTful APIs for all components
- ✅ **Plugin System**: Extensible architecture for new data sources
- ✅ **Dashboard Templates**: Pre-built and custom monitoring templates
- ✅ **Template Marketplace**: Community-driven template sharing

## 🛠️ Development

### UI Development
```bash
cd ui-next
npm install
npm run dev
```

### Adding New Metrics
1. Configure in Prometheus
2. Create Grafana dashboard
3. Set up alerts in AlertManager
4. Update UI configuration

### Plugin Development
1. Follow the [Plugin Development Guide](PLUGIN_SYSTEM_GUIDE.md#plugin-development)
2. Implement the Plugin interface
3. Register your plugin in the system
4. Test and validate functionality

### Template Creation
1. Use the [Template Creation Guide](DASHBOARD_TEMPLATE_MANAGEMENT_GUIDE.md#creating-custom-templates)
2. Design your dashboard layout
3. Configure metrics and variables
4. Share via marketplace or GitHub

## 📞 Support

For issues and questions:
1. Check the relevant documentation above
2. Review the setup guide for common issues
3. Check service logs for troubleshooting

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

---

**Built with ❤️ by Harshhaa**

*Last updated: November 2026*
