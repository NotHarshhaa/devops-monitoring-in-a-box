# 📦 DevOps Monitoring in a Box

<p align="center">
  <img src="./ui-next/public/banner.png" alt="banner"/>
</p>

<p align="center">
  <a href="https://hub.docker.com/r/harshhaareddy/devops-monitoring-box"><img src="https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker Ready"/></a>
  <a href="https://devops-monitoring-in-a-box.vercel.app"><img src="https://img.shields.io/badge/Live-Demo-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo"/></a>
  <a href="#license"><img src="https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge" alt="License"/></a>
</p>

## 🚀 Overview

This project provides a **complete, production-grade monitoring stack** for DevOps engineers, SREs, and beginners.
With just **one command**, you get:

> **🎯 Demo Preview Available**: Check out the live demo at [devops-monitoring-in-a-box.vercel.app](https://devops-monitoring-in-a-box.vercel.app)  
> **Login**: demo@example.com / demo123 (Demo credentials only - configure your own for production)

* 📈 **Prometheus** → High-performance metrics collection and alerting engine
* 📊 **Grafana** → Beautiful dashboards with pre-provisioned datasources and views
* 📜 **Loki** → Centralized log aggregation and stream querying
* 🚨 **Alertmanager** → Multi-channel notification router (Slack, Teams, Discord, Email, Webhooks)
* 🖥️ **Node Exporter** → Real-time host and system metrics (CPU, RAM, Disk, Load, Network)
* 🐳 **cAdvisor** → Container CPU, memory, and lifecycle resource monitoring
* 🛰️ **Blackbox Exporter** → Synthetic HTTP/HTTPS, TCP, DNS, and ICMP uptime probing
* 🔒 **SSL/TLS Certificate Tracker** → Authenticated domain certificate expiration, validity days, and SAN inspector
* ⏱️ **SLI/SLA Availability Engine** → 24h/7d/30d uptime windows and 30-day heatmaps computed live from Blackbox probe data
* 🔔 **Multi-Channel Notification Service** → Email, Slack, Teams, Discord, and webhook routing with masked credentials
* 🧩 **Plugins, Templates & Admin Workspace** → Extensible plugin manager, Grafana dashboard templates, and health/role administration
* 🛡️ **0-CVE Distroless UI Container** → Hardened Chainguard Wolfi (`glibc-dynamic`) image passing Trivy, Docker Scout, and `npm audit --omit=dev` with zero vulnerabilities
* 🎨 **Radix-Sera Unified UI** → Modern Next.js 16 web interface styled with shadcn UI and Hugeicons

👉 Perfect for learning, testing, local homelabs, or full production deployments.

**🚀 What Sets Us Apart:** While most monitoring projects stop at Prometheus + Grafana, we provide a **modern, responsive web interface** that unifies all your monitoring tools into one seamless dashboard experience!

---

## ✨ New & Highlighted Features

### 🎨 1. Modern Radix-Sera Design System
- **shadcn UI with Sera Preset**: Clean, high-contrast aesthetics with seamless Dark/Light mode switching.
- **Hugeicons Integration**: Crisp, accessible stroke icons replacing bulky legacy icon sets.
- **Micro-animations**: Smooth Framer Motion transitions across dashboard widgets, metrics cards, and log inspectors.

### 🔒 2. SSL/TLS Certificate Expiration & Health Tracker
- **Real-time Probing**: Live SSL/TLS inspection via `/api/ssl` for any public or internal domain.
- **Early Expiry Warnings**: Color-coded badges for Valid (>30d), Warning (14-30d), and Critical/Expired (<14d).
- **Certificate Metadata**: Displays Certificate Authority (Issuer CA), Subject, Validity ranges, Serial Numbers, and Subject Alternative Names (SANs).

### ⏱️ 3. SLI / SLA Availability & Outage Tracker
- **Uptime Heatmaps**: 30-day timeline bars computed live from Prometheus `probe_success` series (one bar per day).
- **Real Availability Windows**: 24h / 7d / 30d uptime percentages via `avg_over_time(probe_success[...])` — no fabricated numbers; when probes have no data yet, the UI says so.
- **Synthetics Integration**: Correlates automatically with Prometheus Blackbox Exporter probe results.

### 🔕 4. Full Silence Management
- **Silence Anything, Any Duration**: Create silences from an alert card (pre-filled with its matchers) or from scratch — 30 minutes to 7 days, with author and comment.
- **Silence Manager**: List all active silences with matchers and time remaining, and expire them in one click when an incident is over.
- **Inhibitor Rules**: Pre-configured alert inhibition prevents alert fatigue when root hosts go down.

### ⚡ 5. Live Log Tail & Shareable Views
- **Live Tail**: Stream newly ingested log lines into the Logs page with one click (3-second polling, deduplicated, pauses when the tab is hidden).
- **URL-Synced Filters**: Log, alert and time-range filters live in the URL (`/logs?range=12h&sev=error`), so any view is a shareable bookmark.
- **Real Data Everywhere**: The dashboard renders live Prometheus metrics, Alertmanager alerts and probe health — with honest empty/error states instead of mock numbers.

### 🛡️ 6. Zero-Vulnerability Distroless Container & Hardening
- **0 CVEs Across All Severities**: Clean **Trivy** (`0` vulnerabilities, `0` misconfigurations, `0` secrets), **Docker Scout** (`0C 0H 0M 0L`), and **`npm audit --omit=dev`** (`0` vulnerabilities) scans.
- **Distroless Chainguard Wolfi Base**: Built multi-stage with multi-arch OCI digest-pinned `cgr.dev/chainguard/node` and `cgr.dev/chainguard/glibc-dynamic` (`linux/amd64` & `linux/arm64`) — removes `/bin/sh`, BusyBox, `wget`, `npm`, `npx`, `node-gyp`, Yarn, and package managers (`258MB` disk / `65.8MB` content, down from `290MB` / `73.3MB`).
- **Least-Privilege Runtime**: Runs as non-root `65532:65532` with native PID 1 Node signal handling and an exec-form `fetch` `HEALTHCHECK` (`/api/health?live=1`).
- **Compose & CI Security Controls**: Enforces `no-new-privileges:true`, `cap_drop: [ALL]`, `read_only: true`, and `noexec,nosuid,nodev` `tmpfs` mounts across Compose services, plus blocking 0-CVE Trivy, Docker Scout, and `npm audit` gates in GitHub Actions.

### 🧩 7. Admin Center, Plugins, Templates & Auth Flows
- **Admin & Profile Workspaces (`/admin`, `/profile`)**: Stack health overview, URL-synchronized admin tabs, configuration shortcuts, and account profile controls.
- **Plugin Manager (`/plugins`)**: Install, configure, toggle, and inspect monitoring integrations (AWS CloudWatch, Jenkins CI/CD, GitHub Actions).
- **Dashboard Templates (`/templates`) & Version Monitor (`/version`)**: Filterable Grafana template marketplace and monitoring stack version tracking.
- **Hardened Auth & SSL Probing**: Complete `/auth/signin`, `/auth/signup`, and `/auth/forgot-password` flows on NextAuth `4.24.15`, plus session-protected SSL checks (`/api/ssl`).

---

## 🖼️ Visual Showcase

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
      <sub>Real-time metrics visualization and PromQL analysis</sub>
    </td>
  </tr>
  <tr>
    <td align="center">
      <img src="ui-next/public/logs.png" width="600"/><br/>
      <b>Log Management</b><br/>
      <sub>Centralized Loki log viewing and search</sub>
    </td>
    <td align="center">
      <img src="ui-next/public/alerts.png" width="600"/><br/>
      <b>Alert Management</b><br/>
      <sub>Comprehensive alert routing and 1-click silencing</sub>
    </td>
  </tr>
  <tr>
    <td align="center">
      <img src="ui-next/public/services.png" width="600"/><br/>
      <b>Services & SLA & SSL Tracker</b><br/>
      <sub>Health checks, 30-day uptime SLA, and certificate monitoring</sub>
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
      <sub>Comprehensive notification channels and multi-tenant settings</sub>
    </td>
  </tr>
</table>

---

## 🚀 Usage & Deployment

Choose your preferred deployment method based on your needs:

### 🐳 **Docker Deployment (Recommended)**

#### **Option 1: Quick Start with Docker Compose (Full Stack)**
```bash
# Clone the repository
git clone https://github.com/NotHarshhaa/devops-monitoring-in-a-box.git
cd devops-monitoring-in-a-box

# Generate secure secrets (.env and Alertmanager token)
./scripts/setup-env.sh

# Start the complete hardened monitoring stack
docker compose up -d

# Or run the hot-reload development stack (uses Chainguard Wolfi Node for the UI)
docker compose -f docker-compose.dev.yml up -d
```

#### **Option 2: Native PowerShell (Windows)**
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

#### **Option 3: Pre-built Docker Image (Hardened Distroless)**
```bash
docker pull harshhaareddy/devops-monitoring-box:latest
docker run -d -p 4000:3000 --name devops-monitor \
  --read-only --cap-drop=ALL --security-opt=no-new-privileges:true \
  --tmpfs /tmp:rw,noexec,nosuid,nodev,size=64m \
  --tmpfs /app/.next/cache:rw,noexec,nosuid,nodev,uid=65532,gid=65532,size=64m \
  -e NEXTAUTH_SECRET="$(openssl rand -base64 32)" \
  -e NEXTAUTH_URL=http://localhost:4000 \
  harshhaareddy/devops-monitoring-box:latest
```

#### **Option 4: Local UI Development**
```bash
cd ui-next
npm install          # also generates the Prisma client
npm run db:push      # create the local SQLite database
npm run dev          # http://localhost:3000 (demo login enabled outside production)
npm run verify       # run ESLint, TypeScript check, Vitest suite, and Next.js build
npm audit --omit=dev # verify 0 production runtime dependency vulnerabilities
```
The UI expects the monitoring backends at their default ports (or `PROMETHEUS_URL`, `LOKI_URL`, ... in `ui-next/.env.local`). Without them, pages render honest "service unavailable" states instead of errors.

---

### 🌐 **Cloud Deployment**

#### **Vercel (Frontend Only)**
[![Vercel](https://img.shields.io/badge/Vercel-Deploy-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/new/clone?repository-url=https://github.com/NotHarshhaa/devops-monitoring-in-a-box)

```bash
# Deploy the UI to Vercel
cd ui-next
npm install
vercel --prod
```

#### **Netlify (Frontend Only)**
[![Netlify](https://img.shields.io/badge/Netlify-Deploy-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)](https://app.netlify.com/start/deploy?repository=https://github.com/NotHarshhaa/devops-monitoring-in-a-box)

```bash
# Build and deploy to Netlify
cd ui-next
npm install
npm run build
```

#### **Container Hosts / Railway CLI**
Deploy the standalone UI image (`ui-next/Dockerfile`) or full Compose stack on any Docker host, VM, or Railway CLI workspace (`railway login && railway init && railway up`).

---

## 🎯 Access Points

Once deployed, access your monitoring tools:

| Service | Port / URL | Credentials | Description |
|---------|------------|-------------|-------------|
| 🎨 **DevOps Monitor UI** | [http://localhost:4000](http://localhost:4000) | demo@example.com / demo123 | Unified observability web application (`/dashboard`, `/metrics`, `/logs`, `/alerts`, `/services`, `/plugins`, `/templates`, `/admin`, `/profile`, `/settings`, `/version`) |
| ❤️ **Health API** | [http://localhost:4000/api/health](http://localhost:4000/api/health) | - | Stack health report (`?live=1` liveness probe, `?strict=true` strict `503` readiness check) |
| 📊 **Grafana** | [http://localhost:3000](http://localhost:3000) | `admin` / `admin` | Visualization dashboards with pre-provisioned datasources |
| 📈 **Prometheus** | [http://localhost:9090](http://localhost:9090) | - | Metrics collection & PromQL engine |
| 📜 **Loki** | [http://localhost:3100](http://localhost:3100) | - | Log aggregation and query service |
| 🚨 **Alertmanager** | [http://localhost:9093](http://localhost:9093) | - | Alert routing & silencing |
| 🛰️ **Blackbox Exporter** | [http://localhost:9115](http://localhost:9115) | - | HTTP/TCP uptime probing |
| 🖥️ **Node Exporter** | `http://localhost:9100/metrics` | - | Host kernel & hardware metrics |
| 🐳 **cAdvisor** | `http://localhost:8080/metrics` | - | Container performance metrics |

---

## 🔧 Management & CLI Helpers

| Bash Command (`./devops-monitor.sh`) | PowerShell (`.\scripts\devops-monitor.ps1`) | Purpose |
|-------------------------------------|--------------------------------------------|---------|
| `./devops-monitor.sh start` | `.\scripts\devops-monitor.ps1 start` | Start all stack containers |
| `./devops-monitor.sh status` | `.\scripts\devops-monitor.ps1 status` | Check service health & running state |
| `./devops-monitor.sh health` | `.\scripts\devops-monitor.ps1 health` | Probe all endpoints for 200 OK |
| `./devops-monitor.sh logs` | `.\scripts\devops-monitor.ps1 logs` | View unified logs across services |
| `./devops-monitor.sh stop` | `.\scripts\devops-monitor.ps1 stop` | Gracefully shut down all containers |
| `./devops-monitor.sh clean` | `.\scripts\devops-monitor.ps1 clean` | Remove containers and data volumes |
| `./scripts/test-docker-build.sh` | - | Build distroless UI image and enforce 0-CVE Trivy / Scout checks |
| `./ui-next/build-docker.sh` | - | Build and optionally push single- or multi-arch (`amd64`/`arm64`) UI images |

---

## 📂 Project Structure

### 🏗️ **Core Components**
- **`prometheus/`** - Metrics collection, alert rules, and `targets/` probe lists
- **`grafana/`** - Dashboard and visualization provisioning
- **`loki/`** - Log aggregation and collection configs
- **`alertmanager/`** - Alert routing, notification channels, and silencing
- **`ui-next/`** - Modern Next.js web application
- **`docs/`** - Comprehensive documentation
- **`exporters/`** - Exporter configuration (Blackbox uptime probing)

### 🎯 **Key Files**
- **`devops-monitor.sh`** - Main management script (Linux/macOS wrapper)
- **`scripts/devops-monitor.ps1`** - Native Windows PowerShell management script
- **`scripts/test-docker-build.sh`** - Local image build + Trivy & Docker Scout 0-CVE check script
- **`env.example`** - Environment variables template
- **`site-config.json`** - Site configuration (SEO, branding)
- **`config.json`** - Monitoring configuration
- **`docker-compose.yml`** - Hardened production stack configuration
- **`docker-compose.dev.yml`** - Hot-reload development Compose stack
- **`ui-next/Dockerfile`** - Multi-stage Chainguard Wolfi distroless build
- **`.github/workflows/`** - CI (`ci.yml`) and multi-arch Docker release (`docker-publish.yml`) with 0-CVE enforcement
- **`prometheus/targets/*.yml`** - Uptime probe targets, hot-reloaded without restart

For a complete breakdown of all directories and files, see **[Project Structure Guide](docs/PROJECT_STRUCTURE.md)**.

---

## 📊 Feature Breakdown

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
* ⚡ **Real-time Updates**: Live data refresh without page reloads, plus a one-click live log tail
* 🔗 **Cross-Page Navigation**: Every page links to its related pages, and the sidebar shows live stack health
* 🎯 **Intuitive Navigation**: Easy-to-use sidebar navigation

### 🔐 Authentication & Security
* 👤 **User Authentication**: Secure login system with session management
* 🏢 **Multi-tenant Support**: Role-based access control (Admin, Editor, Viewer)
* 🔒 **Secure API**: Protected endpoints with authentication middleware
* 🛡️ **Input Validation**: Comprehensive data validation and sanitization

### 🔔 Notification System
* 📧 **Email Alerts**: SMTP-based email notifications
* 💬 **Slack Integration**: Direct Slack channel notifications
* 🎯 **Microsoft Teams**: Teams webhook integration
* 🎮 **Discord Support**: Discord webhook notifications
* 🔗 **Custom Webhooks**: Generic webhook support for any service

---

## 🛰️ Synthetic Uptime & Dynamic Probing

The stack ships a **Blackbox Exporter** so you can watch any HTTP, HTTPS or TCP endpoint:

Add targets to `prometheus/targets/http-probes.yml` without restarting the stack:

```yaml
# prometheus/targets/http-probes.yml
- targets:
    - https://api.yourcompany.com/health
    - https://yourcompany.com
  labels:
    module: https_2xx     # probe module from exporters/blackbox/config.yml
    env: production       # any labels you add appear on the probe_* series
    team: platform
```

On Windows, the management script can add probes for you:

```powershell
.\scripts\devops-monitor.ps1 probe -Url https://my-app.example.com/health
```

Prometheus automatically hot-reloads probe target files every 30 seconds.

---

## 🔀 How the Dashboard Reaches the Backends

The browser never calls Prometheus, Loki or Alertmanager directly. It calls the dashboard, which forwards the request server-side:

```
browser ──▶ /api/proxy/prometheus/api/v1/query ──▶ http://prometheus:9090/api/v1/query
```

This matters for three reasons:

- **It works in Docker.** Container hostnames such as `prometheus:9090` cannot be resolved by a browser, so direct calls fail in any containerised deployment.
- **No CORS setup.** Requests are same-origin.
- **The backends can stay private.** You can remove the published `9090`, `3100` and `9093` ports entirely and the dashboard keeps working.

Every proxied request requires a signed-in user, and each upstream path is matched against an explicit allowlist (`ui-next/lib/server/upstream.ts`). Administrative endpoints — Prometheus' `admin/tsdb/delete_series`, Loki's `push` — are not reachable through the proxy.

---

## 📈 What You'll Get

### Prometheus
* Scrapes metrics from Node Exporter and cAdvisor every 15 seconds
* Stores time-series data for historical analysis
* Built-in query language (PromQL) for data exploration

### Grafana
* Pre-configured Prometheus and Loki data sources
* Node Exporter and container dashboards showing real-time metrics
* Custom alerts and dashboard templating

### Loki
* Collects logs from containers and system services
* Efficient log storage and querying
* Log-to-metric correlations in Grafana

### Alertmanager
* Production-ready alert rules for system, disk, and container alerts
* Slack/Email/Discord/Teams webhook routing
* Integrated silence management

### Node Exporter & cAdvisor
* Host CPU, memory, disk, network metrics
* Container memory working sets, CPU throttling, and OOM event tracking

---

## 📚 Documentation

**📖 [Complete Documentation Hub](docs/README.md)** - Comprehensive guides and setup instructions

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

---

## 🔒 Security Notes

* **Zero-Vulnerability Distroless UI Container**: `ui-next/Dockerfile` uses digest-pinned Chainguard Wolfi images (`cgr.dev/chainguard/node` -> `cgr.dev/chainguard/glibc-dynamic`), `--ignore-scripts` clean dependency installation, no runtime shell/BusyBox/npm, and runs as `65532:65532` — passing **Trivy**, **Docker Scout**, and `npm audit --omit=dev` with **0 vulnerabilities**.
* **Hardened Runtime Controls**: Non-privileged Compose services drop all Linux capabilities (`cap_drop: [ALL]`, keeping only `NET_RAW` on `blackbox-exporter`) and set `no-new-privileges:true`. `devops-monitor-ui`, `prometheus`, `alertmanager`, `node-exporter`, and `blackbox-exporter` run with `read_only: true` root filesystems (`devops-monitor-ui` writes runtime notification config to `/tmp/config.json` and cache to `noexec,nosuid,nodev` `tmpfs` mounts).
* `NEXTAUTH_SECRET` and `ALERT_WEBHOOK_TOKEN` are **required** — Compose fails rather than accepting a shared/default signing key or an unauthenticated Alertmanager webhook. Generate both and the matching `alertmanager/webhook_token` file with `./scripts/setup-env.sh` or `.\scripts\devops-monitor.ps1 init-env`.
* **Demo login accounts** (`demo@example.com / demo123`) are active by default in development builds. In production builds they are disabled unless `ENABLE_DEMO_AUTH=true` — note the bundled `docker-compose.yml` sets it for the out-of-the-box demo experience; set it to `false` (or remove it) before exposing the stack.
* Change default Grafana credentials before exposing the stack in production.
* Prometheus admin API (`--web.enable-admin-api`) is disabled by default.
* `/api/notifications` never returns plain SMTP passwords or channel webhook URLs in client payloads; they are masked, and saving preserves stored secrets.
* The SSL certificate endpoint requires a signed-in session and validates target hosts and ports (`ui-next/lib/ssl-target.ts`) — it cannot be used anonymously to scan internal hosts.
* Published ports `9090`, `3100`, `9093`, and `9115` are optional for convenience. The dashboard proxies internal traffic via Docker networks, so external ports can be removed in hardened environments.

---

## 🤝 Contributing

1. Fork the repository (`git clone https://github.com/NotHarshhaa/devops-monitoring-in-a-box.git`)
2. Create a feature branch (`git checkout -b feature/awesome-feature`)
3. Commit your changes (`git commit -m 'Add awesome feature'`)
4. Push to the branch (`git push origin feature/awesome-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

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
