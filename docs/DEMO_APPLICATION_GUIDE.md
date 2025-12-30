# Demo Application Guide

## Overview

The Demo Application is a sample Node.js/Express application designed to demonstrate the monitoring capabilities of Monitoring in a Box. It generates real metrics, logs, and can simulate various scenarios to show how the monitoring stack responds.

## 🚀 Quick Start

### Start the Demo App

The demo app is automatically included when you start the full stack:

```bash
docker-compose up -d
```

Or start just the demo app:

```bash
docker-compose up -d demo-app
```

### Access the Demo App

- **Demo App**: http://localhost:5000
- **Health Check**: http://localhost:5000/health
- **Metrics**: http://localhost:5000/metrics
- **Demo Control UI**: http://localhost:4000/demo (in the main UI)

## 📊 What the Demo App Does

### Metrics Exposed

The demo app exposes the following Prometheus metrics:

- `demo_app_http_request_duration_seconds` - HTTP request duration histogram
- `demo_app_http_requests_total` - Total HTTP requests counter
- `demo_app_errors_total` - Total errors counter (by type)
- `demo_app_active_users` - Current active users gauge
- `demo_app_response_time_seconds` - Current response time gauge
- `demo_app_memory_usage_bytes` - Memory usage gauge
- `demo_app_cpu_usage_percent` - CPU usage gauge

### Logs Generated

All logs from the demo app are automatically collected by Promtail and sent to Loki with labels:
- `app: demo-app`
- `environment: demo`
- `level: info/warn/error`

## 🎮 Demo Scenarios

### 1. Error Simulation

Simulate application errors to see alerts trigger:

```bash
# Enable error simulation (20% error rate)
curl -X POST http://localhost:5000/api/demo/errors \
  -H "Content-Type: application/json" \
  -d '{"enabled": true, "rate": 0.2}'
```

**What to watch:**
- Check Prometheus: `rate(demo_app_errors_total[5m])`
- Check Alertmanager: `DemoAppHighErrorRate` alert should fire
- Check Loki: `{app="demo-app", level="error"}`

### 2. Slow Response Simulation

Simulate slow API responses:

```bash
# Enable slow response (3 second delay)
curl -X POST http://localhost:5000/api/demo/slow \
  -H "Content-Type: application/json" \
  -d '{"enabled": true, "delay": 3000}'
```

**What to watch:**
- Check Prometheus: `demo_app_response_time_seconds`
- Check Alertmanager: `DemoAppSlowResponse` alert should fire
- View metrics in Grafana dashboard

### 3. High Load Simulation

Simulate high CPU and memory usage:

```bash
# Enable high load simulation
curl -X POST http://localhost:5000/api/demo/load \
  -H "Content-Type: application/json" \
  -d '{"enabled": true}'
```

**What to watch:**
- Check Prometheus: `demo_app_cpu_usage_percent` and `demo_app_memory_usage_bytes`
- Check Alertmanager: `DemoAppHighCPU` and `DemoAppHighMemory` alerts
- View system metrics in the dashboard

### 4. Generate Test Logs

Generate logs to see them in Loki:

```bash
# Generate 50 error logs
curl -X POST http://localhost:5000/api/demo/logs \
  -H "Content-Type: application/json" \
  -d '{"count": 50, "level": "error"}'
```

**What to watch:**
- Check Loki: Query `{app="demo-app", level="error"}`
- View logs in the Logs page of the UI
- See log volume metrics

## 🎯 Using the Demo Control UI

Navigate to **Demo** in the sidebar (or http://localhost:4000/demo) to access the interactive demo control panel.

### Features:

1. **Real-time State**: See current metrics (active users, CPU, response time, error rate)
2. **Scenario Controls**: Toggle error simulation, slow responses, and high load
3. **Log Generation**: Generate test logs with one click
4. **API Testing**: Test demo app endpoints directly
5. **Quick Links**: Jump to Prometheus, Loki, and Alertmanager

## 📈 Prometheus Queries

Try these queries in Prometheus (http://localhost:9090):

```promql
# Request rate
rate(demo_app_http_requests_total[5m])

# Error rate
rate(demo_app_errors_total[5m])

# Average response time
demo_app_response_time_seconds

# Active users
demo_app_active_users

# CPU usage
demo_app_cpu_usage_percent

# Memory usage
demo_app_memory_usage_bytes / 1024 / 1024  # MB
```

## 📜 Loki Queries

Try these queries in Loki (http://localhost:3100):

```logql
# All demo app logs
{app="demo-app"}

# Error logs only
{app="demo-app", level="error"}

# Logs with specific message
{app="demo-app"} |= "error"

# Count logs by level
sum(count_over_time({app="demo-app"}[1m])) by (level)
```

## 🚨 Alert Rules

The demo app has pre-configured alert rules:

- **DemoAppHighErrorRate**: Fires when error rate > 0.1 errors/second
- **DemoAppSlowResponse**: Fires when response time > 2 seconds
- **DemoAppHighCPU**: Fires when CPU usage > 80%
- **DemoAppHighMemory**: Fires when memory usage > 1GB
- **DemoAppDown**: Fires when the app is unreachable

View alerts at: http://localhost:9093

## 🧪 Testing Scenarios

### Scenario 1: Normal Operation
1. Start the demo app
2. Make some API calls: `GET /api/users`, `POST /api/login`
3. Watch metrics increase in Prometheus
4. Check logs appear in Loki

### Scenario 2: Error Spike
1. Enable error simulation: `POST /api/demo/errors {"enabled": true, "rate": 0.3}`
2. Make several API calls
3. Watch error counter increase
4. Check Alertmanager for `DemoAppHighErrorRate` alert
5. View error logs in Loki

### Scenario 3: Performance Degradation
1. Enable slow response: `POST /api/demo/slow {"enabled": true, "delay": 5000}`
2. Make API calls
3. Watch response time metrics increase
4. Check Alertmanager for `DemoAppSlowResponse` alert

### Scenario 4: Resource Exhaustion
1. Enable high load: `POST /api/demo/load {"enabled": true}`
2. Watch CPU and memory metrics spike
3. Check Alertmanager for resource alerts
4. View system metrics in Grafana

## 🔄 Reset Demo State

Reset all simulations:

```bash
curl -X POST http://localhost:5000/api/demo/reset
```

Or use the "Reset All Simulations" button in the Demo Control UI.

## 📝 API Endpoints

### Health & Metrics
- `GET /health` - Health check
- `GET /metrics` - Prometheus metrics

### Demo API
- `GET /api/users` - Get user list
- `POST /api/login` - Simulate login
- `POST /api/logout` - Simulate logout
- `POST /api/process` - Simulate data processing

### Demo Controls
- `GET /api/demo/state` - Get current state
- `POST /api/demo/errors` - Control error simulation
- `POST /api/demo/slow` - Control slow response simulation
- `POST /api/demo/load` - Control high load simulation
- `POST /api/demo/logs` - Generate test logs
- `POST /api/demo/reset` - Reset all state
- `GET /api/demo/sample` - Get sample data

## 🎓 Learning Path

1. **Start Simple**: Just start the demo app and watch metrics appear
2. **Generate Logs**: Use the log generation feature to see logs in Loki
3. **Trigger Alerts**: Enable error simulation to see alerts fire
4. **Explore Metrics**: Query Prometheus for different metrics
5. **Create Dashboards**: Build Grafana dashboards using demo app metrics
6. **Monitor in Real-time**: Use the Demo Control UI to interact with the app

## 💡 Tips

- Keep the Demo Control UI open while testing scenarios
- Use multiple browser tabs to view Prometheus, Loki, and Alertmanager simultaneously
- Try combining scenarios (e.g., high load + errors) to see complex alerting
- Check the Alerts page in the main UI to see alerts as they fire
- Use Grafana to create custom dashboards for the demo app metrics

## 🐛 Troubleshooting

### Demo app not accessible
- Check if container is running: `docker ps | grep demo-app`
- Check logs: `docker logs demo-app`
- Verify port 5000 is not in use

### Metrics not appearing in Prometheus
- Check Prometheus targets: http://localhost:9090/targets
- Verify demo-app target is UP
- Check Prometheus logs: `docker logs prometheus`

### Logs not appearing in Loki
- Check Promtail is running: `docker ps | grep promtail`
- Verify Promtail config includes demo-app
- Check Promtail logs: `docker logs promtail`

### Alerts not firing
- Check alert rules are loaded: http://localhost:9090/alerts
- Verify alert conditions are met
- Check Alertmanager is receiving alerts: http://localhost:9093

## 📚 Next Steps

1. Explore the demo app code in `demo-app/server.js`
2. Add your own metrics to the demo app
3. Create custom alert rules for demo app metrics
4. Build Grafana dashboards for demo app
5. Integrate the demo app with your own applications

