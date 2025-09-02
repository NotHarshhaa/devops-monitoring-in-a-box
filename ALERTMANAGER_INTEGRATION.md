# Alertmanager Integration Guide

This guide explains how to configure and use the Alertmanager alert routing and management system in the DevOps Monitoring in a Box project.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Configuration](#configuration)
- [API Integration](#api-integration)
- [Usage Examples](#usage-examples)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)

## Overview

Alertmanager handles alerts sent by client applications such as Prometheus. It takes care of deduplicating, grouping, and routing them to the correct receiver integration such as email, Slack, or webhooks. It also takes care of silencing and inhibition of alerts.

### Key Features

- **Alert Routing**: Route alerts to different receivers based on labels
- **Grouping**: Group related alerts together
- **Inhibition**: Suppress certain alerts if other alerts are already firing
- **Silencing**: Temporarily silence specific alerts
- **Deduplication**: Remove duplicate alerts
- **Web UI Integration**: Real-time alert management through the dashboard

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Prometheus    │───▶│  Alertmanager   │───▶│   Receivers     │
│                 │    │                 │    │                 │
│ • Alert rules   │    │ • Alert routing │    │ • Email         │
│ • Alert firing  │    │ • Grouping      │    │ • Slack         │
│ • Alert sending │    │ • Silencing     │    │ • Webhooks      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                       │
                                                       ▼
                                               ┌─────────────────┐
                                               │   Web UI        │
                                               │                 │
                                               │ • Alert display │
                                               │ • Alert details │
                                               │ • Silence mgmt  │
                                               └─────────────────┘
```

## Configuration

### 1. Alertmanager Configuration (`alertmanager/config.yml`)

The main Alertmanager configuration file defines routing, grouping, and notification settings:

```yaml
global:
  resolve_timeout: 5m
  slack_api_url: 'https://hooks.slack.com/services/YOUR_SLACK_WEBHOOK_URL'

route:
  group_by: ['alertname']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h
  receiver: 'web.hook'
  routes:
    - match:
        severity: critical
      receiver: 'slack.critical'
      repeat_interval: 30m
    - match:
        severity: warning
      receiver: 'slack.warning'
      repeat_interval: 1h

receivers:
  - name: 'web.hook'
    webhook_configs:
      - url: 'http://127.0.0.1:5001/'

  - name: 'slack.critical'
    slack_configs:
      - channel: '#alerts-critical'
        title: '🚨 Critical Alert'
        text: '{{ range .Alerts }}{{ .Annotations.summary }}{{ "\n" }}{{ .Annotations.description }}{{ "\n" }}{{ end }}'
        send_resolved: true
        actions:
          - type: button
            text: 'View in Grafana'
            url: '{{ template "grafana_url" . }}'

  - name: 'slack.warning'
    slack_configs:
      - channel: '#alerts-warning'
        title: '⚠️ Warning Alert'
        text: '{{ range .Alerts }}{{ .Annotations.summary }}{{ "\n" }}{{ .Annotations.description }}{{ "\n" }}{{ end }}'
        send_resolved: true
        actions:
          - type: button
            text: 'View in Grafana'
            url: '{{ template "grafana_url" . }}'

  - name: 'email.admin'
    email_configs:
      - to: 'admin@example.com'
        from: 'alertmanager@example.com'
        smarthost: 'localhost:25'
        subject: '{{ template "email.subject" . }}'
        html: '{{ template "email.html" . }}'
        send_resolved: true

templates:
  - '/etc/alertmanager/template/*.tmpl'

inhibit_rules:
  - source_match:
      severity: 'critical'
    target_match:
      severity: 'warning'
    equal: ['alertname', 'dev', 'instance']
```

#### Configuration Options Explained

- **`global.resolve_timeout: 5m`**: Time after which an alert is declared resolved
- **`route.group_by: ['alertname']`**: Group alerts by alert name
- **`group_wait: 10s`**: Wait time before sending initial notification
- **`group_interval: 10s`**: Wait time before sending updated notifications
- **`repeat_interval: 1h`**: Wait time before resending notifications
- **`inhibit_rules`**: Suppress certain alerts if other alerts are firing

### 2. Prometheus Alert Rules (`prometheus/alert_rules.yml`)

Define alert rules in Prometheus to trigger alerts:

```yaml
groups:
  - name: node_alerts
    rules:
      # High CPU usage
      - alert: HighCPUUsage
        expr: 100 - (avg by(instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High CPU usage on {{ $labels.instance }}"
          description: "CPU usage is above 80% for more than 5 minutes"

      # High memory usage
      - alert: HighMemoryUsage
        expr: (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100 > 85
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage on {{ $labels.instance }}"
          description: "Memory usage is above 85% for more than 5 minutes"

      # High disk usage
      - alert: HighDiskUsage
        expr: (node_filesystem_size_bytes - node_filesystem_avail_bytes) / node_filesystem_size_bytes * 100 > 85
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High disk usage on {{ $labels.instance }}"
          description: "Disk usage is above 85% for more than 5 minutes"

      # Node down
      - alert: NodeDown
        expr: up == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Node {{ $labels.instance }} is down"
          description: "Node {{ $labels.instance }} has been down for more than 1 minute"

  - name: prometheus_alerts
    rules:
      # Prometheus down
      - alert: PrometheusDown
        expr: up{job="prometheus"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Prometheus is down"
          description: "Prometheus has been down for more than 1 minute"

      # High scrape duration
      - alert: HighScrapeDuration
        expr: scrape_duration_seconds > 10
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High scrape duration on {{ $labels.instance }}"
          description: "Scrape duration is above 10 seconds for more than 5 minutes"

  - name: container_alerts
    rules:
      # Container restarting frequently
      - alert: ContainerRestarting
        expr: increase(container_start_time_seconds[15m]) > 0
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Container restarting frequently on {{ $labels.instance }}"
          description: "Container {{ $labels.name }} has restarted in the last 15 minutes"

      # High container memory usage
      - alert: HighContainerMemoryUsage
        expr: (container_memory_usage_bytes / container_spec_memory_limit_bytes * 100) > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High container memory usage on {{ $labels.instance }}"
          description: "Container {{ $labels.name }} memory usage is above 80%"
```

### 3. Docker Compose Integration

Alertmanager is integrated into the main Docker Compose stack:

```yaml
# Alertmanager - Alert routing and silencing
alertmanager:
  image: prom/alertmanager:latest
  container_name: alertmanager
  ports:
    - "9093:9093"
  volumes:
    - ./alertmanager/config.yml:/etc/alertmanager/alertmanager.yml
    - alertmanager_data:/alertmanager
  command:
    - '--config.file=/etc/alertmanager/alertmanager.yml'
    - '--storage.path=/alertmanager'
  restart: unless-stopped
  networks:
    - monitoring
```

## API Integration

### 1. Alertmanager API Client (`ui-next/lib/alertmanager-api.ts`)

The web UI integrates with Alertmanager through a custom API client:

```typescript
import { alertmanagerAPI } from '@/lib/alertmanager-api';

// Get all active alerts
const alerts = await alertmanagerAPI.getAlerts();

// Get Alertmanager status
const status = await alertmanagerAPI.getStatus();

// Get all silences
const silences = await alertmanagerAPI.getSilences();

// Create a new silence
const silence = await alertmanagerAPI.createSilence({
  comment: 'Maintenance window',
  createdBy: 'admin',
  startsAt: new Date().toISOString(),
  endsAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour
  matchers: [
    {
      name: 'alertname',
      value: 'HighCPUUsage',
      isRegex: false
    }
  ]
});

// Delete a silence
await alertmanagerAPI.deleteSilence('silence-id');
```

### 2. React Hook (`ui-next/lib/hooks/use-alertmanager-alerts.ts`)

A custom React hook provides easy integration:

```typescript
import { useAlertmanagerAlerts } from '@/lib/hooks/use-alertmanager-alerts';

function AlertsPage() {
  const {
    alerts,
    loading,
    error,
    services,
    severities,
    refresh,
    setFilters,
    filters,
    filteredAlerts,
    stats
  } = useAlertmanagerAlerts();

  // Use the data in your component
}
```

### 3. Configuration (`ui-next/lib/config.ts`)

Alertmanager API configuration:

```typescript
export const config = {
  alertmanager: {
    baseURL: process.env.NEXT_PUBLIC_ALERTMANAGER_URL || 'http://localhost:9093',
    refreshInterval: 5000, // milliseconds
    maxAlerts: 1000
  }
};
```

## Usage Examples

### 1. Basic API Queries

```bash
# Get all active alerts
curl "http://localhost:9093/api/v2/alerts"

# Get Alertmanager status
curl "http://localhost:9093/api/v2/status"

# Get all silences
curl "http://localhost:9093/api/v2/silences"

# Create a silence
curl -X POST "http://localhost:9093/api/v2/silences" \
  -H "Content-Type: application/json" \
  -d '{
    "comment": "Maintenance window",
    "createdBy": "admin",
    "startsAt": "2023-07-01T12:00:00Z",
    "endsAt": "2023-07-01T13:00:00Z",
    "matchers": [
      {
        "name": "alertname",
        "value": "HighCPUUsage",
        "isRegex": false
      }
    ]
  }'

# Delete a silence
curl -X DELETE "http://localhost:9093/api/v2/silence/silence-id"
```

### 2. Alert Filtering Examples

```typescript
// Filter alerts by severity
const criticalAlerts = alerts.filter(alert => 
  alertmanagerAPI.extractSeverity(alert.labels) === 'critical'
);

// Filter alerts by service
const prometheusAlerts = alerts.filter(alert => 
  alertmanagerAPI.extractServiceName(alert.labels) === 'prometheus'
);

// Search alerts by text
const errorAlerts = alertmanagerAPI.filterAlertsBySearch(
  alerts, 
  'error'
);
```

### 3. Web UI Usage

1. **Navigate to Alerts Tab**: Access the alerts page in the web UI
2. **View Alert Statistics**: See firing, resolved, and suppressed alert counts
3. **Search Alerts**: Use the search box to find specific alerts
4. **Filter by Severity**: Select critical, warning, or info alerts
5. **Filter by Status**: Filter by active, suppressed, or unprocessed alerts
6. **Filter by Service**: Select alerts from specific services
7. **Expand Alert Details**: Click "Details" to see full alert information
8. **Manage Alerts**: Use action buttons to comment or silence alerts

## Troubleshooting

### Common Issues

#### 1. Alertmanager Not Starting

**Problem**: Alertmanager container fails to start

**Solutions**:
```bash
# Check Alertmanager logs
docker logs alertmanager

# Verify configuration
docker exec alertmanager cat /etc/alertmanager/alertmanager.yml

# Check port availability
netstat -tlnp | grep 9093
```

#### 2. No Alerts Appearing

**Problem**: Alerts not showing up in the UI

**Solutions**:
```bash
# Check Prometheus alert rules
curl http://localhost:9090/api/v1/rules

# Verify Alertmanager is receiving alerts
curl http://localhost:9093/api/v2/alerts

# Check Prometheus configuration
docker exec prometheus cat /etc/prometheus/prometheus.yml
```

#### 3. Alerts Not Being Sent

**Problem**: Alerts are firing but not being sent to receivers

**Solutions**:
- Check receiver configuration
- Verify network connectivity
- Check authentication credentials
- Review Alertmanager logs for errors

#### 4. High Alert Volume

**Problem**: Too many alerts causing notification fatigue

**Solutions**:
- Implement proper grouping rules
- Use inhibition rules
- Set appropriate repeat intervals
- Create silence rules for known issues

### Debug Commands

```bash
# Check Alertmanager status
curl http://localhost:9093/api/v2/status

# List all active alerts
curl http://localhost:9093/api/v2/alerts

# Get all silences
curl http://localhost:9093/api/v2/silences

# Check Prometheus alert rules
curl http://localhost:9090/api/v1/rules

# Test webhook receiver
curl -X POST http://localhost:5001/webhook \
  -H "Content-Type: application/json" \
  -d '{"alerts": [{"status": "firing", "labels": {"alertname": "test"}}]}'
```

## Best Practices

### 1. Alert Rule Design

- Use meaningful alert names
- Set appropriate severity levels
- Include helpful descriptions
- Use proper thresholds and durations
- Avoid alert fatigue

### 2. Routing Configuration

- Group related alerts together
- Route by severity and service
- Use appropriate repeat intervals
- Implement escalation policies
- Test notification channels

### 3. Silence Management

- Use temporary silences for maintenance
- Document silence reasons
- Set appropriate silence durations
- Review and clean up old silences
- Use regex matchers for flexibility

### 4. Monitoring

- Monitor Alertmanager metrics
- Set up alerts for Alertmanager itself
- Track notification delivery rates
- Monitor silence usage
- Review alert patterns

### 5. Security

- Secure API endpoints
- Use authentication for receivers
- Implement proper RBAC
- Encrypt sensitive data
- Regular security updates

## Environment Variables

Configure Alertmanager through environment variables:

```bash
# Alertmanager API URL
NEXT_PUBLIC_ALERTMANAGER_URL=http://localhost:9093

# Timeout settings
ALERTMANAGER_QUERY_TIMEOUT=30000

# Rate limiting
ALERTMANAGER_MAX_QUERIES_PER_MINUTE=60
```

## Production Considerations

### 1. High Availability

- Run multiple Alertmanager instances
- Use external storage for silences
- Implement proper backup strategies
- Use load balancers

### 2. Scalability

- Horizontal scaling with clustering
- Distributed notification delivery
- Efficient alert grouping
- Caching strategies

### 3. Security

- Enable authentication and authorization
- Use TLS encryption
- Implement network policies
- Regular security updates

### 4. Monitoring

- Set up comprehensive monitoring
- Create dashboards for Alertmanager metrics
- Implement alerting rules
- Track performance metrics

## Notification Channels

### 1. Email Configuration

```yaml
receivers:
  - name: 'email.admin'
    email_configs:
      - to: 'admin@example.com'
        from: 'alertmanager@example.com'
        smarthost: 'smtp.gmail.com:587'
        auth_username: 'alertmanager@example.com'
        auth_password: 'your-password'
        auth_secret: 'your-secret'
        subject: 'Alert: {{ .GroupLabels.alertname }}'
        html: |
          <h2>Alert Details</h2>
          <p><strong>Alert:</strong> {{ .GroupLabels.alertname }}</p>
          <p><strong>Severity:</strong> {{ .GroupLabels.severity }}</p>
          <p><strong>Description:</strong> {{ .CommonAnnotations.description }}</p>
        send_resolved: true
```

### 2. Slack Configuration

```yaml
receivers:
  - name: 'slack.alerts'
    slack_configs:
      - api_url: 'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK'
        channel: '#alerts'
        title: 'Alert: {{ .GroupLabels.alertname }}'
        text: |
          *Alert:* {{ .GroupLabels.alertname }}
          *Severity:* {{ .GroupLabels.severity }}
          *Description:* {{ .CommonAnnotations.description }}
        send_resolved: true
        actions:
          - type: button
            text: 'View in Grafana'
            url: 'https://grafana.example.com/d/alerts'
```

### 3. Webhook Configuration

```yaml
receivers:
  - name: 'webhook.alerts'
    webhook_configs:
      - url: 'http://your-webhook-endpoint.com/alerts'
        send_resolved: true
        http_config:
          basic_auth:
            username: 'webhook-user'
            password: 'webhook-password'
```

## Support

For issues and questions:

1. Check the troubleshooting section above
2. Review Alertmanager documentation: https://prometheus.io/docs/alerting/latest/alertmanager/
3. Check Prometheus alerting documentation: https://prometheus.io/docs/prometheus/latest/configuration/alerting_rules/
4. Open an issue in the project repository

## Additional Resources

- [Alertmanager Documentation](https://prometheus.io/docs/alerting/latest/alertmanager/)
- [Prometheus Alerting Rules](https://prometheus.io/docs/prometheus/latest/configuration/alerting_rules/)
- [Alertmanager Configuration](https://prometheus.io/docs/alerting/latest/configuration/)
- [Notification Templates](https://prometheus.io/docs/alerting/latest/notifications/)
- [Alertmanager Web UI](https://prometheus.io/docs/alerting/latest/alertmanager/#web-interface)
