# 📂 Project Structure

This document provides a comprehensive overview of the Monitoring in a Box project structure, including all directories, files, and their purposes.

## 🏗️ Root Directory Structure

```bash
devops-monitoring-in-a-box/
├── .github/workflows/           # CI (ci.yml) & Docker release (docker-publish.yml)
├── README.md                    # Project overview and quick start
├── DOCKER_README.md             # Docker quick-start guide
├── env.example                  # Environment variables template
├── site-config.json             # Site configuration (SEO, branding, etc.)
├── config.json                  # Monitoring configuration
├── config.yaml                  # Extended YAML configuration
├── docker-compose.yml           # Hardened production monitoring stack
├── docker-compose.dev.yml       # Development setup with hot reloading
├── docker-compose.logging.yml   # Logging configuration overrides
├── devops-monitor.sh            # Main management script wrapper
├── scripts/                     # Management and setup scripts
│   ├── README.md                # Scripts documentation
│   ├── devops-monitor.sh        # Main management script
│   ├── devops-monitor.ps1       # Native Windows PowerShell management script
│   ├── start.sh                 # Quick start script
│   ├── stop.sh                  # Stop all services
│   ├── start-ui.sh              # Start UI development server
│   ├── start-full-stack.sh      # Full stack startup script
│   ├── setup-ui-next.sh         # UI setup script
│   ├── setup-env.sh             # Environment & secret generation script
│   ├── generate-env.sh          # Environment generation script
│   ├── health-check.sh          # Stack health probe script
│   ├── build-and-push.sh        # Multi-arch build and push helper
│   └── test-docker-build.sh     # Docker build + Trivy/Scout 0-CVE check script
└── LICENSE                      # MIT License
```

## 📜 Management Scripts

```bash
scripts/
├── README.md                    # Scripts documentation and usage guide
├── devops-monitor.sh            # Main management script for the stack
├── devops-monitor.ps1           # Windows PowerShell CLI (start, health, validate, verify, probe)
├── start.sh                     # Quick start script
├── stop.sh                      # Quick stop script
├── start-ui.sh                  # Start UI development server
├── start-full-stack.sh          # Full stack startup script
├── setup-ui-next.sh             # UI setup and configuration
├── setup-env.sh                 # Environment & Alertmanager secret generation
├── generate-env.sh              # Environment generation script
├── health-check.sh              # Service endpoint health probe helper
├── build-and-push.sh            # Docker Hub build & push helper
└── test-docker-build.sh         # Docker build + Trivy/Scout security verification
```

**Purpose**: Centralized location for all management and setup scripts.

**Key Scripts:**
- **`devops-monitor.sh` / `devops-monitor.ps1`** - Cross-platform stack CLI (`start`, `stop`, `status`, `health`, `logs`, `validate`, `verify`)
- **`start.sh` / `stop.sh`** - Quick start and stop helpers
- **`start-ui.sh` / `start-full-stack.sh`** - Local UI dev server and full stack launchers
- **`setup-ui-next.sh`** - Complete UI setup and configuration
- **`setup-env.sh` / `generate-env.sh`** - Secure `.env` and `alertmanager/webhook_token` generators
- **`test-docker-build.sh`** - Builds `ui-next/Dockerfile` and runs Trivy & Docker Scout 0-CVE checks

## 🔧 Core Monitoring Services

### Prometheus Configuration
```bash
prometheus/
├── prometheus.yml               # Scrape configurations and targets
├── alert_rules.yml              # Pre-configured alert rules
├── recording_rules.yml          # Pre-aggregated recording rules
├── probe_rules.yml              # Blackbox probe availability rules
└── targets/                     # Hot-reloaded synthetic probe target files
```

**Purpose**: Prometheus metrics collection and alerting configuration.

### Grafana Configuration
```bash
grafana/
├── dashboards/                  # Pre-built dashboards
│   ├── dashboard.yml            # Dashboard provisioning configuration
│   └── node-exporter.json       # Node exporter dashboard template
└── datasources/                 # Data source configurations
    └── datasource.yml           # Prometheus datasource configuration
```

**Purpose**: Grafana dashboard and data source configuration.

### Loki Log Aggregation
```bash
loki/
├── config.yml                   # Loki server configuration
└── promtail-config.yml          # Log collection configuration
```

**Purpose**: Centralized log aggregation and collection setup.

### Alertmanager
```bash
alertmanager/
└── config.yml                   # Alert routing and notification configuration
```

**Purpose**: Alert management and notification routing.

## 🎨 Modern Web Interface (ui-next/)

### Next.js App Directory Structure
```bash
ui-next/
├── app/                         # Next.js 16 App Router pages & routes
│   ├── admin/                   # Admin panel page
│   ├── alerts/                  # Alert management & silence manager
│   ├── api/                     # API routes
│   │   ├── auth/                # NextAuth, register, forgot-password endpoints
│   │   ├── health/              # Stack & liveness health endpoint
│   │   ├── notifications/       # Config, send, test/[channel], webhook routes
│   │   ├── proxy/               # Authenticated upstream proxy allowlist
│   │   └── ssl/                 # Session-authenticated SSL/TLS checker
│   ├── auth/                    # signin, signup, forgot-password, error pages
│   ├── dashboard/               # Primary monitoring dashboard
│   ├── logs/                    # Loki log search & live tail
│   ├── metrics/                 # Prometheus metrics charts & analysis
│   ├── plugins/                 # Plugin installation & data viewer
│   ├── profile/                 # User profile & account settings
│   ├── services/                # Service health, Blackbox SLA, SSL tracker
│   ├── settings/                # System settings & notification channels
│   ├── templates/               # Grafana template management & marketplace
│   ├── version/                 # Monitoring component version tracker
│   ├── globals.css              # Tailwind v4 & shadcn global styles
│   ├── layout.tsx               # Root layout with metadata and providers
│   └── page.tsx                 # Home page
```

### React Components
```bash
ui-next/components/
├── app-shell.tsx                # Navigation shell and responsive sidebar
├── client-only.tsx              # Client-side only wrapper component
├── config-loader.tsx            # Configuration management component
├── dashboard-template-manager.tsx    # Template management interface
├── dashboard-template-marketplace.tsx # Template marketplace component
├── dynamic-metrics.tsx          # Dynamic metrics display component
├── metrics-card.tsx             # Individual metrics card component
├── metrics-chart.tsx            # Chart visualization component
├── metrics-overview.tsx         # Metrics overview dashboard
├── notification-settings.tsx    # Notification configuration component
├── plugin-configuration.tsx     # Plugin setup and configuration
├── plugin-data-viewer.tsx       # Plugin data display component
├── plugin-manager.tsx           # Plugin management interface
├── query-provider.tsx           # React Query provider wrapper
├── session-provider.tsx         # Session management provider
├── site-config-manager.tsx      # Site configuration management UI
├── theme-provider.tsx           # Theme management provider
├── theme-toggle.tsx             # Theme switcher component
├── user-menu.tsx                # User menu dropdown component
└── version-monitor.tsx          # Version monitoring component
```

### Custom React Hooks
```bash
ui-next/hooks/
├── use-site-config.ts           # Site configuration management hook
└── use-toast.ts                 # Toast notification hook
```

### Utility Libraries
```bash
ui-next/lib/
├── alertmanager-api.ts          # Alertmanager API client
├── auth-config-check.ts         # Startup NextAuth configuration validation
├── auth-secret.ts               # Signing secret resolution helper
├── auth-simple.ts               # Active NextAuth credentials provider & role logic
├── config/                      # Configuration management system
│   ├── types.ts                 # TypeScript interfaces and types
│   ├── site-config.ts           # Site configuration manager
│   ├── manager.ts               # Main configuration manager
│   └── multi-tenant-manager.ts  # Multi-tenant configuration manager
├── config.ts                    # General configuration utilities
├── dashboard-templates.ts       # Dashboard template management
├── health-api.ts                # Client health check API helpers
├── hooks/                       # Service query hooks (metrics, logs, alerts, versions)
├── http-client.ts               # Retry-aware Axios HTTP client
├── loki-api.ts                  # Loki API client for log queries
├── notification-service.ts      # Notification service & secret masking
├── plugins/                     # Plugin registry & implementations
├── prisma-server.ts             # Prisma server-side client helper
├── prometheus-api.ts            # Prometheus API client
├── server/                      # Server-only auth, health collector, upstream allowlist
├── service-config.ts            # Upstream service endpoint resolver
├── ssl-target.ts                # SSRF-safe SSL host/port validator
├── template-filters.ts          # Template marketplace filtering helpers
├── template-import-service.ts   # Template import and export service
├── url-filters.ts               # URL-synced search/filter helpers
├── utils.ts                     # General utility functions
└── version-monitor.ts           # Version monitoring utilities
```

### Database Configuration
```bash
ui-next/prisma/
├── dev.db                       # SQLite development database
├── schema.prisma                # Database schema definition
└── seed.ts                      # Database seeding script
```

### Static Assets
```bash
ui-next/public/
├── alerts.png                   # Alert page screenshot
├── banner.png                   # Project banner image
├── dashboard.png                # Dashboard page screenshot
├── logs.png                     # Logs page screenshot
├── metrics.png                  # Metrics page screenshot
├── services.png                 # Services page screenshot
├── settings1.png                # Settings page screenshot 1
├── settings2.png                # Settings page screenshot 2
├── settings3.png                # Settings page screenshot 3
├── settings4.png                # Settings page screenshot 4
├── settings5.png                # Settings page screenshot 5
├── logo-light.png               # Light theme logo
├── logo-dark.png                # Dark theme logo
├── favicon.ico                  # Browser favicon
└── apple-touch-icon.png         # iOS home screen icon
```

### Configuration, Tests & Build Files
```bash
ui-next/
├── Dockerfile                   # Multi-stage Chainguard Wolfi distroless build
├── build-docker.sh              # Local/multi-arch Docker build helper
├── eslint.config.mjs            # ESLint flat config
├── next.config.js               # Next.js configuration (standalone output)
├── package.json                 # Dependencies and npm scripts
├── postcss.config.mjs           # Tailwind CSS v4 PostCSS config
├── proxy.ts                     # NextAuth session & route protection proxy
├── test-prisma.js               # Database connection testing script
├── tests/                       # Vitest unit tests
├── tsconfig.json                # TypeScript configuration
└── vitest.config.ts             # Vitest test runner configuration
```

## 📚 Documentation

```bash
docs/
├── README.md                              # Documentation index and overview
├── SETUP.md                               # Detailed setup instructions
├── DOCKER_DEPLOYMENT_GUIDE.md             # Distroless build & CI release guide
├── CONFIGURATION_GUIDE.md                 # Complete configuration reference
├── CONFIGURATION_ENHANCEMENT_GUIDE.md     # Advanced configuration enhancements
├── PROJECT_STRUCTURE.md                   # This file - project structure overview
├── PROMETHEUS_INTEGRATION.md              # Prometheus setup and configuration guide
├── LOKI_INTEGRATION.md                    # Loki log aggregation guide
├── ALERTMANAGER_INTEGRATION.md            # Alert management and notifications guide
├── AUTHENTICATION_MULTI_TENANCY_GUIDE.md  # Authentication and multi-tenancy
├── UI_README.md                           # UI application documentation
├── CONFIG_SYSTEM_GUIDE.md                 # Configuration system guide
├── SERVICE_HEALTH_GUIDE.md                # Health monitoring and status checks
├── UX_IMPROVEMENTS_GUIDE.md               # UI/UX enhancements and best practices
├── PLUGIN_SYSTEM_GUIDE.md                 # Plugin system documentation
├── DASHBOARD_TEMPLATE_MANAGEMENT_GUIDE.md # Template management guide
├── NOTIFICATIONS_INTEGRATION.md           # Notification system setup guide
└── PRODUCTION_SETUP.md                    # Production deployment guide
```

## 🔌 System Exporters

```bash
exporters/
└── blackbox/                    # Blackbox Exporter HTTP/TCP/ICMP probing config
    └── config.yml
```

## 🎯 Key Features by Directory

### Core Monitoring (`prometheus/`, `grafana/`, `loki/`, `alertmanager/`)
- **Metrics Collection**: Prometheus with comprehensive scraping rules
- **Visualization**: Pre-configured Grafana dashboards
- **Log Aggregation**: Loki with Promtail for log collection
- **Alerting**: Alertmanager with multi-channel notifications

### Modern Web Interface (`ui-next/`)
- **Next.js 16 App Router**: Modern React framework with Turbopack and standalone output
- **TypeScript**: Full type safety throughout the application
- **Tailwind CSS v4**: Utility-first CSS framework (`@tailwindcss/postcss`)
- **Prisma**: Type-safe database client (`@prisma/client` v6)
- **Authentication**: NextAuth v4 credentials session management (`lib/auth-simple.ts`) and route proxy (`proxy.ts`)
- **Real-time Updates**: Auto-refreshing queries, live Loki log tail, and server-side upstream proxy allowlist
- **Responsive Design**: Mobile-first responsive design
- **Theme Support**: Light/dark theme switching
- **Plugin System**: Extensible plugin architecture
- **Configuration Management**: Dynamic configuration & notification service
- **Distroless 0-CVE Container**: Chainguard Wolfi (`glibc-dynamic`) multi-stage runtime

### Documentation (`docs/`)
- **Comprehensive Guides**: Detailed documentation for all features
- **Setup Instructions**: Step-by-step setup guides
- **Configuration Reference**: Complete configuration documentation
- **Best Practices**: Industry-standard monitoring practices
- **Troubleshooting**: Common issues and solutions

## 🚀 Getting Started

1. **Clone the repository**:
   ```bash
   git clone https://github.com/NotHarshhaa/devops-monitoring-in-a-box.git
   cd devops-monitoring-in-a-box
   ```

2. **Generate environment secrets and Alertmanager token**:
   ```bash
   ./scripts/setup-env.sh
   ```

3. **Start the monitoring stack**:
   ```bash
   ./devops-monitor.sh start
   ```

4. **Access the services**:
   - **Modern UI**: http://localhost:4000
   - **Grafana**: http://localhost:3000 (admin/admin)
   - **Prometheus**: http://localhost:9090
   - **Loki**: http://localhost:3100
   - **Alertmanager**: http://localhost:9093
   - **Blackbox Exporter**: http://localhost:9115

## 📖 Related Documentation

- **[Setup Guide](SETUP.md)** - Detailed setup instructions
- **[Docker Deployment Guide](DOCKER_DEPLOYMENT_GUIDE.md)** - Distroless build & CI release workflow
- **[Configuration Guide](CONFIGURATION_GUIDE.md)** - Complete configuration reference
- **[UI Documentation](UI_README.md)** - Web interface features and usage
- **[Plugin System](PLUGIN_SYSTEM_GUIDE.md)** - Plugin development and management

## 🔧 Development

### Prerequisites
- Node.js 20+ (24 LTS recommended) and npm
- Docker and Docker Compose (v2+)
- Git

### Development Setup
```bash
# Setup for first time
./scripts/setup-ui-next.sh
./scripts/setup-env.sh

# Start development server
./scripts/start-ui.sh

# Or manually:
cd ui-next
npm install
npm run dev
npm run verify   # ESLint, TypeScript check, Vitest suite, Next.js build
```

### Building for Production
```bash
# Build the UI
cd ui-next
npm run build

# Start production server
npm start
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

---

**Need help?** Check the [Setup Troubleshooting](SETUP.md#troubleshooting) section or reach out to our community!
