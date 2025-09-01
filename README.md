# 📦 DevOps Monitoring in a Box

## 🚀 Overview

This project provides a **ready-to-use monitoring stack** for DevOps engineers and beginners.
With just **one command**, you get:

* **Prometheus** → Metrics collection
* **Grafana** → Beautiful dashboards
* **Loki** → Centralized log aggregation
* **Alertmanager** → Alerts via Slack/Email/Webhooks
* **Node Exporter** → System metrics (CPU, RAM, Disk, etc.)
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

## ⚡ Quick Start

```bash
git clone https://github.com/<your-username>/devops-monitoring-in-a-box.git
cd devops-monitoring-in-a-box
docker-compose up -d
```

Then open:

* 🎨 **DevOps Monitor UI** → [http://localhost:4000](http://localhost:4000) - Modern unified dashboard
* Grafana → [http://localhost:3000](http://localhost:3000) (user: `admin`, pass: `admin`)
* Prometheus → [http://localhost:9090](http://localhost:9090)
* Loki → [http://localhost:3100](http://localhost:3100)
* Alertmanager → [http://localhost:9093](http://localhost:9093)

## 📂 Project Structure

```bash
devops-monitoring-in-a-box/
├── README.md                # Repo overview + usage
├── docker-compose.yml       # Runs all monitoring services
├── docker-compose.dev.yml   # Development setup with UI hot reloading
│
├── prometheus/
│   ├── prometheus.yml       # Scrape configs
│   └── alert_rules.yml      # Pre-configured alert rules
│
├── grafana/
│   ├── dashboards/          # Pre-built dashboards (JSON files)
│   │   ├── dashboard.yml    # Dashboard provisioning
│   │   └── node-exporter.json
│   └── datasources/         # Pre-configured Prometheus datasource
│
├── loki/
│   ├── config.yml           # Loki log aggregation config
│   └── promtail-config.yml  # Log collection configuration
│
├── alertmanager/
│   └── config.yml           # Alert rules + Slack/email webhook config
│
├── ui-next/                 # 🆕 Modern Next.js Dashboard
│   ├── src/                 # React application source
│   ├── public/              # Static assets
│   ├── Dockerfile           # Production build
│   ├── Dockerfile.dev       # Development build
│   └── package.json         # Dependencies
│
└── exporters/
    └── node-exporter/       # System metrics exporter
```

## 📊 Features

* 📈 **Metrics**: Collect metrics from Node Exporter
* 🖼️ **Dashboards**: Pre-configured Grafana dashboards
* 📜 **Logs**: Loki + Promtail for log aggregation
* 🚨 **Alerts**: Sample Alertmanager config (Slack/Email integration ready)
* 🎨 **Modern UI**: React-based dashboard for unified monitoring experience
* ⚡ **One command setup**: Just run `docker-compose up -d`

## 🔧 Next Steps (for contributors)

* Add more exporters (MySQL, Redis, Nginx, etc.)
* Add Kubernetes manifests for K8s-based deployment
* Add Terraform/Ansible automation for cloud deployment

## 🚀 Getting Started

📖 **For detailed setup instructions, see [SETUP.md](SETUP.md)**

### 🎯 Quick Commands

We've created convenient scripts to manage your entire monitoring stack:

```bash
# Start everything (monitoring stack + UI)
./devops-monitor.sh start

# Start just the UI development server
./devops-monitor.sh ui

# Check project status
./devops-monitor.sh status

# View service logs
./devops-monitor.sh logs

# Stop everything
./devops-monitor.sh stop

# Get help
./devops-monitor.sh help
```

### Prerequisites

* Docker and Docker Compose installed
* At least 2GB of available RAM
* Ports 3000, 9090, 3100, 9093 available

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/<your-username>/devops-monitoring-in-a-box.git
   cd devops-monitoring-in-a-box
   ```

2. **Start the monitoring stack:**

   ```bash
   # Option 1: Using the management script (Recommended)
   ./devops-monitor.sh start
   
   # Option 2: Using Docker Compose directly
   docker-compose up -d
   ```

3. **Verify all services are running:**

   ```bash
   docker-compose ps
   ```

4. **Access the services:**
   * **Grafana**: <http://localhost:3000> (admin/admin)
   * **Prometheus**: <http://localhost:9090>
   * **Loki**: <http://localhost:3100>
   * **Alertmanager**: <http://localhost:9093>

### Stopping the Stack

```bash
docker-compose down
```

### Viewing Logs

```bash
# All services
docker-compose logs

# Specific service
docker-compose logs prometheus
docker-compose logs grafana
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

## 🔒 Security Notes

* Default credentials are for development only
* Change default passwords in production
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
