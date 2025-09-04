# 📂 Project Structure

This document provides a comprehensive overview of the Monitoring in a Box project structure, including all directories, files, and their purposes.

## 🏗️ Root Directory Structure

```bash
devops-monitoring-in-a-box/
├── README.md                    # Project overview and quick start
├── env.example                  # Environment variables template
├── site-config.json             # Site configuration (SEO, branding, etc.)
├── config.json                  # Monitoring configuration
├── docker-compose.yml           # Production monitoring stack
├── docker-compose.dev.yml       # Development setup with hot reloading
├── devops-monitor.sh            # Main management script wrapper
├── scripts/                     # Management and setup scripts
│   ├── README.md                # Scripts documentation
│   ├── devops-monitor.sh        # Main management script
│   ├── start.sh                 # Quick start script
│   ├── stop.sh                  # Stop all services
│   ├── start-ui.sh              # Start UI development server
│   ├── start-full-stack.sh      # Full stack startup script
│   ├── setup-ui-next.sh         # UI setup script
│   ├── setup-env.sh             # Environment setup script
│   ├── generate-env.sh          # Environment generation script
│   └── test-docker-build.sh     # Docker build testing script
├── LICENSE                      # MIT License
└── package-lock.json            # NPM lock file
```

## 📜 Management Scripts

```bash
scripts/
├── README.md                    # Scripts documentation and usage guide
├── devops-monitor.sh            # Main management script for the stack
├── start.sh                     # Quick start script
├── stop.sh                      # Quick stop script
├── start-ui.sh                  # UI development server startup
├── start-full-stack.sh          # Full stack startup script
├── setup-ui-next.sh             # UI setup and configuration
├── setup-env.sh                 # Environment setup script
├── generate-env.sh              # Environment generation script
└── test-docker-build.sh         # Docker build testing script
```

**Purpose**: Centralized location for all management and setup scripts.

**Key Scripts:**
- **`devops-monitor.sh`** - Main management script with start/stop/status/logs commands
- **`start.sh`** - Quick start for the monitoring stack
- **`stop.sh`** - Quick stop for all services
- **`start-ui.sh`** - Start UI development server
- **`start-full-stack.sh`** - Full stack startup with all services
- **`setup-ui-next.sh`** - Complete UI setup and configuration
- **`setup-env.sh`** - Environment configuration setup
- **`generate-env.sh`** - Interactive environment file generation
- **`test-docker-build.sh`** - Docker build testing and validation

## 🔧 Core Monitoring Services

### Prometheus Configuration
```bash
prometheus/
├── prometheus.yml               # Scrape configurations and targets
└── alert_rules.yml              # Pre-configured alert rules
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
├── app/                         # Next.js 13+ app directory
│   ├── admin/                   # Admin panel pages
│   │   └── page.tsx             # Admin dashboard
│   ├── alerts/                  # Alert management pages
│   │   └── page.tsx             # Alert overview and management
│   ├── api/                     # API routes
│   │   ├── auth/                # Authentication API endpoints
│   │   ├── config/              # Configuration API endpoints
│   │   ├── health/              # Health check API endpoints
│   │   └── webhooks/            # Webhook API endpoints
│   ├── auth/                    # Authentication pages
│   │   ├── login/               # Login page
│   │   └── register/            # Registration page
│   ├── dashboard/               # Main dashboard
│   │   └── page.tsx             # Primary monitoring dashboard
│   ├── logs/                    # Log viewing pages
│   │   └── page.tsx             # Log search and visualization
│   ├── metrics/                 # Metrics visualization
│   │   └── page.tsx             # Metrics charts and analysis
│   ├── plugins/                 # Plugin management
│   │   └── page.tsx             # Plugin installation and configuration
│   ├── profile/                 # User profile pages
│   │   └── page.tsx             # User profile and settings
│   ├── services/                # Service monitoring
│   │   └── page.tsx             # Service health and status
│   ├── settings/                # Settings and configuration
│   │   └── page.tsx             # System settings and preferences
│   ├── templates/               # Dashboard templates
│   │   └── page.tsx             # Template management and marketplace
│   ├── globals.css              # Global CSS styles
│   ├── layout.tsx               # Root layout with metadata and providers
│   └── page.tsx                 # Home page
```

### React Components
```bash
ui-next/components/
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
├── sidebar.tsx                  # Navigation sidebar component
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
├── auth-simple.ts               # Simple authentication utilities
├── auth.ts                      # Authentication utilities and providers
├── config/                      # Configuration management system
│   ├── types.ts                 # TypeScript interfaces and types
│   ├── site-config.ts           # Site configuration manager
│   ├── manager.ts               # Main configuration manager
│   └── multi-tenant-manager.ts  # Multi-tenant configuration manager
├── config.ts                    # General configuration utilities
├── dashboard-templates.ts       # Dashboard template management
├── health-api.ts                # Health check API client
├── loki-api.ts                  # Loki API client for log queries
├── notification-service.ts      # Notification service integration
├── prisma-server.ts             # Prisma server-side utilities
├── prisma.ts                    # Database client configuration
├── prometheus-api.ts            # Prometheus API client
├── template-import-service.ts   # Template import and export service
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

### Utility Scripts
```bash
ui-next/scripts/
└── generate-site-config.js      # Interactive site configuration generator
```

### Configuration Files
```bash
ui-next/
├── Dockerfile                   # Production Docker image configuration
├── Dockerfile.dev               # Development Docker image configuration
├── next.config.js               # Next.js framework configuration
├── package.json                 # Dependencies and npm scripts
├── tailwind.config.js           # Tailwind CSS configuration
├── tsconfig.json                # TypeScript configuration
├── middleware.ts                # Next.js middleware for authentication
└── test-prisma.js               # Database connection testing script
```

## 📚 Documentation

```bash
docs/
├── README.md                    # Documentation index and overview
├── SETUP.md                     # Detailed setup instructions
├── CONFIGURATION_GUIDE.md       # Complete configuration reference
├── PROJECT_STRUCTURE.md         # This file - project structure overview
├── PROMETHEUS_INTEGRATION.md    # Prometheus setup and configuration guide
├── LOKI_INTEGRATION.md          # Loki log aggregation guide
├── ALERTMANAGER_INTEGRATION.md  # Alert management and notifications guide
├── AUTHENTICATION_MULTI_TENANCY_GUIDE.md # Authentication and multi-tenancy
├── UI_README.md                 # UI application documentation
├── CONFIG_SYSTEM_GUIDE.md       # Configuration system guide
├── SITE_CONFIGURATION_GUIDE.md  # Site configuration and branding guide
├── SERVICE_HEALTH_GUIDE.md      # Health monitoring and status checks
├── UX_IMPROVEMENTS_GUIDE.md     # UI/UX enhancements and best practices
├── PLUGIN_SYSTEM_GUIDE.md       # Plugin system documentation
├── DASHBOARD_TEMPLATE_MANAGEMENT_GUIDE.md # Template management guide
├── NOTIFICATIONS_INTEGRATION.md # Notification system setup guide
└── PRODUCTION_SETUP.md          # Production deployment guide
```

## 🔌 System Exporters

```bash
exporters/
└── node-exporter/               # System metrics exporter configuration
    └── [exporter configs]       # Node exporter setup and configuration
```

## 🎯 Key Features by Directory

### Core Monitoring (`prometheus/`, `grafana/`, `loki/`, `alertmanager/`)
- **Metrics Collection**: Prometheus with comprehensive scraping rules
- **Visualization**: Pre-configured Grafana dashboards
- **Log Aggregation**: Loki with Promtail for log collection
- **Alerting**: Alertmanager with multi-channel notifications

### Modern Web Interface (`ui-next/`)
- **Next.js 13+ App Router**: Modern React framework with app directory
- **TypeScript**: Full type safety throughout the application
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Prisma**: Type-safe database client and migrations
- **Authentication**: Secure user authentication and session management
- **Real-time Updates**: Live data refresh and WebSocket connections
- **Responsive Design**: Mobile-first responsive design
- **Theme Support**: Light/dark theme switching
- **Plugin System**: Extensible plugin architecture
- **Configuration Management**: Dynamic configuration system

### Documentation (`docs/`)
- **Comprehensive Guides**: Detailed documentation for all features
- **Setup Instructions**: Step-by-step setup guides
- **Configuration Reference**: Complete configuration documentation
- **Best Practices**: Industry-standard monitoring practices
- **Troubleshooting**: Common issues and solutions

## 🚀 Getting Started

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/devops-monitoring-in-a-box.git
   cd devops-monitoring-in-a-box
   ```

2. **Set up environment**:
   ```bash
   cp env.example .env
   # Edit .env with your configuration
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

## 📖 Related Documentation

- **[Setup Guide](SETUP.md)** - Detailed setup instructions
- **[Configuration Guide](CONFIGURATION_GUIDE.md)** - Complete configuration reference
- **[UI Documentation](UI_README.md)** - Web interface features and usage
- **[Plugin System](PLUGIN_SYSTEM_GUIDE.md)** - Plugin development and management

## 🔧 Development

### Prerequisites
- Node.js 18+ and npm
- Docker and Docker Compose
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
cp ../env.example .env
npm run dev
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

**Need help?** Check our [troubleshooting guide](TROUBLESHOOTING.md) or reach out to our community!
