# 📦 DevOps Monitoring in a Box

<p align="center">
  <img src="./ui-next/public/banner.png" alt="banner"/>
</p>

## 🚀 Overview

This project provides a **ready-to-use monitoring stack** for DevOps engineers and beginners.
With just **one command**, you get:

> **🎯 Demo Preview Available**: Check out the live demo at [devops-monitoring-in-a-box.vercel.app](https://devops-monitoring-in-a-box.vercel.app)  
> **Login**: demo@example.com / demo123 (Demo credentials only - configure your own for production)

* **Prometheus** → Metrics collection
* **Grafana** → Beautiful dashboards
* **Loki** → Centralized log aggregation
* **Alertmanager** → Alerts via Slack/Email/Webhooks
* **Node Exporter** → System metrics (CPU, RAM, Disk, etc.)
* **🔔 Notification Service** → Multi-channel notifications (Slack, Teams, Discord, Email, Webhooks)
* **🎨 Modern React UI** → **Unified dashboard experience** (What makes us unique!)

👉 Perfect for learning, testing, or quick local monitoring setup.

**🚀 What Sets Us Apart:** While most monitoring projects stop at Prometheus + Grafana, we provide a **modern, responsive web interface** that unifies all your monitoring tools into one beautiful dashboard experience!

## 🖼️ Visual Showcase

See what you'll get with our modern monitoring dashboard:

<table>
  <tr>
    <td align="center">
      <img src="ui-next/public/dashboard.png" width="600"/><br/>
      <b>Main Dashboard</b><br/>
      <sub>Unified monitoring dashboard with system overview</sub>
    </td>
    <td align="center">
      <img src="ui-next/public/metrics.png" width="600"/><br/>
      <b>Metrics & Analytics</b><br/>
      <sub>Real-time metrics visualization and analysis</sub>
    </td>
  </tr>
  <tr>
    <td align="center">
      <img src="ui-next/public/logs.png" width="600"/><br/>
      <b>Log Management</b><br/>
      <sub>Centralized log viewing and search</sub>
    </td>
    <td align="center">
      <img src="ui-next/public/alerts.png" width="600"/><br/>
      <b>Alert Management</b><br/>
      <sub>Comprehensive alert monitoring and management</sub>
    </td>
  </tr>
  <tr>
    <td align="center">
      <img src="ui-next/public/services.png" width="600"/><br/>
      <b>Service Monitoring</b><br/>
      <sub>Service health and status overview</sub>
    </td>
    <td align="center">
      <b>Settings & Configuration</b><br/>
      <div>
        <img src="ui-next/public/settings1.png" width="350"/>
        <img src="ui-next/public/settings2.png" width="350"/><br/>
        <img src="ui-next/public/settings3.png" width="350"/>
        <img src="ui-next/public/settings4.png" width="350"/><br/>
        <img src="ui-next/public/settings5.png" width="350"/>
      </div>
      <sub>Comprehensive settings and configuration options</sub>
    </td>
  </tr>
</table>

*Comprehensive settings and configuration options for all monitoring aspects*

## 🚀 Usage & Deployment

Choose your preferred deployment method based on your needs:

### 🐳 **Docker Deployment (Recommended)**

[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://hub.docker.com/r/harshhaareddy/devops-monitoring-box)

**Option 1: Use Pre-built Image (Fastest)**
```bash
# Pull and run the pre-built image
docker pull harshhaareddy/devops-monitoring-box:latest
docker run -d -p 4000:4000 --name devops-monitor harshhaareddy/devops-monitoring-box:latest

# Access the application
open http://localhost:4000
```

**Option 2: Build Your Own Image**
```bash
# Clone the repository
git clone https://github.com/NotHarshhaa/devops-monitoring-in-a-box.git
cd devops-monitoring-in-a-box

# Build your custom image
docker build -t your-username/devops-monitoring-box:latest .

# Run your custom image
docker run -d -p 4000:4000 --name devops-monitor your-username/devops-monitoring-box:latest

# Push to your registry (optional)
docker push your-username/devops-monitoring-box:latest
```

**Option 3: Full Stack with Docker Compose**
```bash
# Clone and start the complete monitoring stack
git clone https://github.com/NotHarshhaa/devops-monitoring-in-a-box.git
cd devops-monitoring-in-a-box

# Generate required session/webhook secrets and Alertmanager's credential file.
./scripts/setup-env.sh

# Start all services (Prometheus, Grafana, Loki, etc.)
./devops-monitor.sh start

# Or manually with Docker Compose after the setup step above
docker compose up -d
```

### 🌐 **Cloud Deployment**

#### **Vercel (Frontend Only)**
[![Vercel](https://img.shields.io/badge/Vercel-Deploy-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/new/clone?repository-url=https://github.com/NotHarshhaa/devops-monitoring-in-a-box)

```bash
# Deploy the UI to Vercel
cd ui-next
npm install
vercel --prod

# Or use the one-click deploy button above
```

**Features:**
- ✅ Automatic deployments from GitHub
- ✅ Custom domain support
- ✅ Environment variables management
- ✅ Serverless functions support

#### **Netlify (Frontend Only)**
[![Netlify](https://img.shields.io/badge/Netlify-Deploy-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)](https://app.netlify.com/start/deploy?repository=https://github.com/NotHarshhaa/devops-monitoring-in-a-box)

```bash
# Build and deploy to Netlify
cd ui-next
npm install
npm run build

# Upload the 'out' folder to Netlify
# Or connect your GitHub repository for auto-deployments
```

**Features:**
- ✅ Continuous deployment from Git
- ✅ Form handling and serverless functions
- ✅ CDN and edge functions
- ✅ Branch previews

#### **Railway (Full Stack)**
[![Railway](https://img.shields.io/badge/Railway-Deploy-0B0D0E?style=for-the-badge&logo=railway&logoColor=white)](https://railway.app/template/your-template-id)

```bash
# Deploy full stack to Railway
railway login
railway init
railway up
```

### 🏗️ **Self-Hosted Options**

#### **Kubernetes**
> ⚠️ Kubernetes manifests are on the roadmap and are not in this repository yet.
> Track progress in the issue tracker, or deploy with Docker Compose in the
> meantime. When running the dashboard in a cluster, set `DOCKER_ENV=true` (or
> rely on `KUBERNETES_SERVICE_HOST`) so it resolves the backends by service name.

#### **Traditional VPS/Server**
```bash
# On your server
git clone https://github.com/NotHarshhaa/devops-monitoring-in-a-box.git
cd devops-monitoring-in-a-box

# Install dependencies
sudo apt update && sudo apt install docker.io docker-compose

# Start services
./devops-monitor.sh start
```

### 🎯 **Access Points**

Once deployed, access your monitoring tools:

| Service | URL | Credentials | Description |
|---------|-----|-------------|-------------|
| 🎨 **Modern UI** | [http://localhost:4000](http://localhost:4000) | - | Unified dashboard experience |
| ❤️ **Health API** | [http://localhost:4000/api/health](http://localhost:4000/api/health) | - | Stack health, used by the container healthcheck |
| 📊 **Grafana** | [http://localhost:3000](http://localhost:3000) | admin/admin | Visualization dashboards |
| 📈 **Prometheus** | [http://localhost:9090](http://localhost:9090) | - | Metrics collection & querying |
| 📜 **Loki** | [http://localhost:3100](http://localhost:3100) | - | Log aggregation |
| 🚨 **Alertmanager** | [http://localhost:9093](http://localhost:9093) | - | Alert management |
| 🛰️ **Blackbox Exporter** | [http://localhost:9115](http://localhost:9115) | - | HTTP/TCP uptime probing |

### 🔧 **Quick Management Commands**

```bash
# Check status
./devops-monitor.sh status

# View logs
./devops-monitor.sh logs

# Stop services
./devops-monitor.sh stop

# Restart services
./devops-monitor.sh restart

# Clean up (removes all containers and volumes)
./devops-monitor.sh clean
```

## 📂 Project Structure

The Monitoring in a Box project is organized into several key directories, each serving a specific purpose in the monitoring ecosystem.

### 🏗️ **Core Components**
- **`prometheus/`** - Metrics collection, alert rules, and `targets/` probe lists
- **`grafana/`** - Dashboard and visualization setup
- **`loki/`** - Log aggregation and collection
- **`alertmanager/`** - Alert routing and notifications
- **`ui-next/`** - Modern Next.js web interface
- **`docs/`** - Comprehensive documentation
- **`exporters/`** - Exporter configuration (Blackbox uptime probing)

### 🎯 **Key Files**
- **`devops-monitor.sh`** - Main management script (wrapper)
- **`scripts/devops-monitor.sh`** - Management script (Linux/macOS)
- **`scripts/devops-monitor.ps1`** - Management script (Windows PowerShell)
- **`env.example`** - Environment variables template
- **`site-config.json`** - Site configuration (SEO, branding)
- **`config.json`** - Monitoring configuration
- **`docker-compose.yml`** - Production stack configuration
- **`prometheus/targets/*.yml`** - Uptime probe targets, hot-reloaded
- **`scripts/`** - All management and setup scripts

### 📖 **Detailed Structure**
For a complete breakdown of all directories, files, and their purposes, see our comprehensive **[Project Structure Guide](docs/PROJECT_STRUCTURE.md)**.

## 📊 Features

### 🔧 Core Monitoring Stack
* 📈 **Metrics Collection**: Prometheus with Node Exporter for system metrics
* 🖼️ **Dashboards**: Pre-configured Grafana dashboards with beautiful visualizations
* 📜 **Log Aggregation**: Loki + Promtail for centralized log management
* 🚨 **Alert Management**: Alertmanager with multi-channel notifications
* 📊 **Service Health**: Real-time service status monitoring

### 🎨 Modern Web Interface
* 🖥️ **Unified Dashboard**: Single-page application for all monitoring needs
* 📱 **Responsive Design**: Works perfectly on desktop, tablet, and mobile
* 🌙 **Dark/Light Theme**: Automatic theme switching with user preference
* ⚡ **Real-time Updates**: Live data refresh without page reloads
* 🎯 **Intuitive Navigation**: Easy-to-use sidebar navigation

### 🔐 Authentication & Security
* 👤 **User Authentication**: Secure login system with session management
* 🏢 **Multi-tenant Support**: Role-based access control (Admin, Editor, Viewer)
* 🔒 **Secure API**: Protected endpoints with authentication middleware
* 🛡️ **Input Validation**: Comprehensive data validation and sanitization

### 📊 Advanced Monitoring Features
* 📈 **Custom Metrics**: Define and monitor custom application metrics
* 📊 **Dynamic Dashboards**: Create and customize monitoring dashboards
* 🔍 **Log Search**: Advanced log filtering and search capabilities
* 📊 **Metrics Visualization**: Interactive charts and graphs
* ⏰ **Historical Data**: Time-series data analysis and trending

### 🔔 Notification System
* 📧 **Email Alerts**: SMTP-based email notifications
* 💬 **Slack Integration**: Direct Slack channel notifications
* 🎯 **Microsoft Teams**: Teams webhook integration
* 🎮 **Discord Support**: Discord webhook notifications
* 🔗 **Custom Webhooks**: Generic webhook support for any service

### ⚙️ Configuration Management
* 🎛️ **Dynamic Configuration**: JSON-based configuration system
* 🔄 **Hot Reloading**: Configuration changes without restart
* 📁 **Import/Export**: Share configurations between environments
* ✅ **Validation**: Built-in configuration validation
* 🎨 **Site Customization**: SEO, branding, and company information

### 🔌 Plugin System
* 🧩 **Extensible Architecture**: Plugin-based system for custom integrations
* 📦 **Plugin Marketplace**: Browse and install community plugins
* ⚙️ **Plugin Configuration**: Easy plugin setup and management
* 🔧 **Custom Plugins**: Create your own monitoring plugins

### 📚 Documentation & Support
* 📖 **Comprehensive Docs**: Detailed documentation for all features
* 🎯 **Quick Start Guide**: Get up and running in minutes
* 🔧 **Configuration Examples**: Ready-to-use configuration templates
* 💡 **Best Practices**: Industry-standard monitoring practices

## ⚙️ Configuration

Configure your Monitoring in a Box platform with comprehensive environment variables and configuration files.

### 🔧 Quick Setup
1. **Generate secure configuration** (recommended):
   ```bash
   ./scripts/setup-env.sh
   ```
   This creates `.env` with random `NEXTAUTH_SECRET` and `ALERT_WEBHOOK_TOKEN`
   values, plus the ignored `alertmanager/webhook_token` credential file.

2. **Edit non-secret settings**:
   ```bash
   nano .env
   ```

3. **Start the platform**:
   ```bash
   docker compose up -d
   ```

### 📖 Complete Configuration Guide
For detailed configuration options, environment variables, and deployment settings, see our comprehensive **[Configuration Guide](docs/CONFIGURATION_GUIDE.md)**.

**Key Configuration Areas:**
- 🌐 **Site Configuration**: SEO, branding, company information
- 🔐 **Authentication & Security**: Database, sessions, JWT tokens
- 📊 **Monitoring Services**: Prometheus, Grafana, Loki, Alertmanager
- 🔔 **Notifications**: Email, Slack, Teams, Discord, webhooks
- 🎨 **UI Settings**: Themes, dashboards, logs configuration
- 🔌 **Plugin System**: Plugin management and marketplace
- 🏢 **Multi-tenancy**: Tenant isolation and management
- 🚀 **Deployment**: Docker, Kubernetes, production settings

## 🛰️ Uptime Monitoring

The stack ships a **Blackbox Exporter** so you can watch any HTTP, HTTPS or TCP
endpoint, not just the machine it runs on.

Add a target and you are done — Prometheus re-reads the target files every 30
seconds, so there is no restart and no `prometheus.yml` edit:

```yaml
# prometheus/targets/http-probes.yml
- targets:
    - https://my-app.example.com/health
  labels:
    module: https_2xx     # probe module from exporters/blackbox/config.yml
    env: production       # any labels you add appear on the probe_* series
    team: platform
```

On Windows the management script will do it for you:

```powershell
.\scripts\devops-monitor.ps1 probe -Url https://my-app.example.com/health
```

Non-HTTP services go in `prometheus/targets/tcp-probes.yml` with
`module: tcp_connect`.

**Available probe modules** (`exporters/blackbox/config.yml`): `http_2xx`,
`http_2xx_or_auth`, `http_post_2xx`, `https_2xx`, `http_2xx_body_match`,
`tcp_connect`, `tcp_connect_tls`, `icmp`, `dns_udp`.

**Alerts that come with it** (`prometheus/probe_rules.yml`): endpoint down,
flapping, slow response, 24h availability below 99%, unexpected HTTP status, TLS
certificate expiring in 30/7/0 days, plus scrape-pipeline alerts that fire when
Prometheus or Alertmanager themselves stop working.

## 🪟 Windows Support

The bash scripts need WSL or Git Bash. `scripts/devops-monitor.ps1` is a native
PowerShell equivalent:

```powershell
.\scripts\devops-monitor.ps1 init-env    # generate .env with strong secrets
.\scripts\devops-monitor.ps1 start       # start the stack
.\scripts\devops-monitor.ps1 status      # containers + dashboard health
.\scripts\devops-monitor.ps1 health      # probe every published endpoint
.\scripts\devops-monitor.ps1 logs -Service prometheus
.\scripts\devops-monitor.ps1 validate    # promtool + amtool + compose config
.\scripts\devops-monitor.ps1 verify      # lint, type-check, tests, build
.\scripts\devops-monitor.ps1 clean       # remove containers and volumes
```

## 🔀 How the Dashboard Reaches the Backends

The browser never calls Prometheus, Loki or Alertmanager directly. It calls the
dashboard, which forwards the request server-side:

```
browser ──▶ /api/proxy/prometheus/api/v1/query ──▶ http://prometheus:9090/api/v1/query
```

This matters for three reasons:

- **It works in Docker.** Container hostnames such as `prometheus:9090` cannot be
  resolved by a browser, so direct calls fail in any containerised deployment.
- **No CORS setup.** Requests are same-origin.
- **The backends can stay private.** You can remove the published `9090`, `3100`
  and `9093` ports entirely and the dashboard keeps working.

Every proxied request requires a signed-in user, and each upstream path is
matched against an explicit allowlist (`ui-next/lib/server/upstream.ts`).
Administrative endpoints — Prometheus' `admin/tsdb/delete_series`, Loki's `push`
— are not reachable through the proxy. Creating or expiring an Alertmanager
silence additionally requires the `ADMIN` or `EDITOR` role.

Set `NEXT_PUBLIC_<SERVICE>_URL` to control the "open in a new tab" links, and
`<SERVICE>_URL` to control the address the server connects to.

## 🔧 Next Steps (for contributors)

* Add more exporters (MySQL, Redis, Nginx, etc.)
* Add Kubernetes manifests for K8s-based deployment
* Add Terraform/Ansible automation for cloud deployment
* Migrate the remaining fetch-in-`useEffect` hooks to React Query (currently
  surfaced as ESLint warnings)

## 🚀 Getting Started

📖 **For detailed setup instructions, see [SETUP.md](SETUP.md)**

### 🎯 Quick Setup

1. **Clone and setup environment:**
   ```bash
   git clone https://github.com/NotHarshhaa/devops-monitoring-in-a-box.git
   cd devops-monitoring-in-a-box
   
   # Setup environment (creates .env files, installs dependencies)
   ./scripts/setup-env.sh
   ```

2. **Start the monitoring stack:**
   ```bash
   # Start everything (monitoring stack + UI)
   ./scripts/devops-monitor.sh start
   
   # Check health of all services
   ./scripts/devops-monitor.sh health
   ```

### 🎯 Management Commands

We've created convenient scripts to manage your entire monitoring stack:

```bash
# Start everything (monitoring stack + UI)
./scripts/devops-monitor.sh start

# Start just the UI development server
./scripts/devops-monitor.sh ui

# Check project status
./scripts/devops-monitor.sh status

# Run comprehensive health check
./scripts/devops-monitor.sh health

# View service logs
./scripts/devops-monitor.sh logs

# Stop everything
./scripts/devops-monitor.sh stop

# Clean up (removes containers and volumes)
./scripts/devops-monitor.sh clean

# Get help
./scripts/devops-monitor.sh help
```

### Prerequisites

* Docker and Docker Compose installed
* At least 2GB of available RAM
* Ports 3000, 4000, 9090, 3100, 9093 available

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/NotHarshhaa/devops-monitoring-in-a-box.git
   cd devops-monitoring-in-a-box
   ```

2. **Setup environment:**

   ```bash
   # Setup environment (creates .env files, installs dependencies)
   ./scripts/setup-env.sh
   ```

3. **Start the monitoring stack:**

   ```bash
   # Option 1: Using the management script (Recommended)
   ./scripts/devops-monitor.sh start
   
   # Option 2: Using Docker Compose directly
   docker compose up -d
   ```

4. **Verify all services are running:**

   ```bash
   # Check status
   ./scripts/devops-monitor.sh status
   
   # Run health check
   ./scripts/devops-monitor.sh health
   ```

5. **Access the services:**
   * **🎨 DevOps Monitor UI**: <http://localhost:4000>
   * **📊 Grafana**: <http://localhost:3000> (admin/admin)
   * **📈 Prometheus**: <http://localhost:9090>
   * **📜 Loki**: <http://localhost:3100>
   * **🚨 Alertmanager**: <http://localhost:9093>

### Stopping the Stack

```bash
# Using management script
./scripts/devops-monitor.sh stop

# Or using Docker Compose directly
docker compose down
```

### Viewing Logs

```bash
# All services
./scripts/devops-monitor.sh logs

# Or using Docker Compose directly
docker compose logs

# Specific service
docker compose logs prometheus
docker compose logs grafana
```

## 📈 What You'll Get

### Prometheus

* Scrapes metrics from Node Exporter every 15 seconds
* Stores time-series data for historical analysis
* Built-in query language (PromQL) for data exploration

### Grafana

* Pre-configured Prometheus data source
* Node Exporter dashboard showing system metrics
* Easy to create custom dashboards and alerts

### Loki

* Collects logs from various sources
* Efficient log storage and querying
* Integration with Grafana for log visualization

### Alertmanager

* Sample alert rules for system monitoring
* Ready for Slack/Email/Webhook integration
* Manages alert routing and silencing

### Node Exporter

* Exports system metrics (CPU, memory, disk, network)
* Low resource footprint
* Industry standard for system monitoring

## 📚 Documentation

**📖 [Complete Documentation](docs/README.md)** - Comprehensive guides and setup instructions

### Key Documentation Links:
- **[Setup Guide](docs/SETUP.md)** - Detailed setup instructions
- **[Configuration Guide](docs/CONFIGURATION_GUIDE.md)** - Complete configuration reference
- **[Project Structure](docs/PROJECT_STRUCTURE.md)** - Complete project structure overview
- **[Prometheus Integration](docs/PROMETHEUS_INTEGRATION.md)** - Metrics collection and configuration
- **[Grafana Dashboards](docs/PROMETHEUS_INTEGRATION.md#grafana-dashboards)** - Dashboard setup and customization
- **[Loki Logs](docs/LOKI_INTEGRATION.md)** - Log aggregation and search
- **[AlertManager](docs/ALERTMANAGER_INTEGRATION.md)** - Alert management and notifications
- **[Authentication & Multi-Tenancy](docs/AUTHENTICATION_MULTI_TENANCY_GUIDE.md)** - User management and role-based access
- **[UI Application](docs/UI_README.md)** - Next.js web interface documentation
- **[Configuration System](docs/CONFIG_SYSTEM_GUIDE.md)** - Dynamic configuration management
- **[Service Health](docs/SERVICE_HEALTH_GUIDE.md)** - Health monitoring and status checks
- **[UX Improvements](docs/UX_IMPROVEMENTS_GUIDE.md)** - User interface enhancements
- **[Plugin System](docs/PLUGIN_SYSTEM_GUIDE.md)** - Plugin development and management
- **[Dashboard Templates](docs/DASHBOARD_TEMPLATE_MANAGEMENT_GUIDE.md)** - Template creation and marketplace
- **[Notifications Integration](docs/NOTIFICATIONS_INTEGRATION.md)** - Multi-channel notification setup
- **[Production Setup](docs/PRODUCTION_SETUP.md)** - Production deployment guide

### 🎯 Quick Access
- **Main Documentation Hub**: [docs/README.md](docs/README.md)
- **All Documentation Files**: [docs/](docs/) folder

## 🔒 Security Notes

* `NEXTAUTH_SECRET` and `ALERT_WEBHOOK_TOKEN` are **required** — Compose fails
  rather than accepting a shared/default signing key or an unauthenticated
  Alertmanager webhook. Generate both and the matching
  `alertmanager/webhook_token` file with `./scripts/setup-env.sh` or
  `.\scripts\devops-monitor.ps1 init-env`.
* Change the default Grafana credentials before exposing the stack.
* Prometheus' admin API (`--web.enable-admin-api`) is disabled by default; it
  allows deleting time series.
* `/api/notifications` never returns SMTP passwords or channel webhook URLs;
  they are masked, and saving the form preserves the stored values.
* The published `9090`, `3100`, `9093` and `9115` ports are for your own
  convenience. The dashboard does not need them — remove them in production.
* Consider using secrets management for sensitive configs
* Restrict network access in production environments

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

* [Prometheus](https://prometheus.io/) - Metrics collection
* [Grafana](https://grafana.com/) - Visualization platform
* [Loki](https://grafana.com/oss/loki/) - Log aggregation
* [Node Exporter](https://github.com/prometheus/node_exporter) - System metrics

---

## 🛠️ Author & Community

Built with passion and purpose by [**Harshhaa**](https://github.com/NotHarshhaa).  
Your ideas, feedback, and contributions are what make this project better.

Let’s shape the future of DevOps monitoring together! 🚀

**Connect & Collaborate:**  

* **GitHub:** [@NotHarshhaa](https://github.com/NotHarshhaa)  
* **Blog:** [ProDevOpsGuy](https://blog.prodevopsguy.xyz)  
* **Telegram Community:** [Join Here](https://t.me/prodevopsguy)  
* **LinkedIn:** [Harshhaa Vardhan Reddy](https://www.linkedin.com/in/harshhaa-vardhan-reddy/)  

---

## ⭐ How You Can Support

If you found this project useful:  

* ⭐ **Star** the repository to show your support  
* 📢 **Share** it with your friends and colleagues  
* 📝 **Open issues** or **submit pull requests** to help improve it

---

### 📢 Stay Connected

[![Follow Me](https://imgur.com/2j7GSPs.png)](https://github.com/NotHarshhaa)

Join the community, share your experience, and help us grow!
