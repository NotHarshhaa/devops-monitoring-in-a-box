# Loki Integration Guide

This guide explains how to configure and use the Loki log aggregation system in the DevOps Monitoring in a Box project.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Configuration](#configuration)
- [API Integration](#api-integration)
- [Usage Examples](#usage-examples)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)

## Overview

Loki is a horizontally-scalable, highly-available log aggregation system inspired by Prometheus. It's designed to be very cost-effective and easy to operate. In this project, Loki is used to collect, store, and query logs from various services.

### Key Features

- **Log Collection**: Automatically collects logs from system, containers, and applications
- **LogQL Queries**: Powerful query language for log analysis
- **Real-time Search**: Live log streaming and search capabilities
- **Label-based Indexing**: Efficient log organization and retrieval
- **Web UI Integration**: Seamless integration with the monitoring dashboard

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Log Sources   │───▶│    Promtail     │───▶│      Loki       │
│                 │    │                 │    │                 │
│ • System logs   │    │ • Log collector │    │ • Log storage   │
│ • Container logs│    │ • Label extractor│    │ • Query engine  │
│ • App logs      │    │ • Log forwarder │    │ • API server    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                       │
                                                       ▼
                                               ┌─────────────────┐
                                               │   Web UI        │
                                               │                 │
                                               │ • Log search    │
                                               │ • Real-time view│
                                               │ • Filtering     │
                                               └─────────────────┘
```

## Configuration

### 1. Loki Configuration (`loki/config.yml`)

The main Loki configuration file defines how Loki stores and processes logs:

```yaml
auth_enabled: false

server:
  http_listen_port: 3100

ingester:
  lifecycler:
    address: 127.0.0.1
    ring:
      kvstore:
        store: inmemory
      replication_factor: 1
    final_sleep: 0s
  chunk_idle_period: 5m
  chunk_retain_period: 30s

schema_config:
  configs:
    - from: 2020-05-15
      store: boltdb-shipper
      object_store: filesystem
      schema: v11
      index:
        prefix: index_
        period: 24h

storage_config:
  boltdb:
    directory: /tmp/loki/index
  filesystem:
    directory: /tmp/loki/chunks

compactor:
  working_directory: /tmp/loki/boltdb-shipper-compactor
  shared_store: filesystem

limits_config:
  enforce_metric_name: false
  reject_old_samples: true
  reject_old_samples_max_age: 168h

chunk_store_config:
  max_look_back_period: 0s

table_manager:
  retention_deletes_enabled: false
  retention_period: 0s
```

#### Configuration Options Explained

- **`auth_enabled: false`**: Disables authentication (for development)
- **`http_listen_port: 3100`**: Port where Loki API listens
- **`chunk_idle_period: 5m`**: How long to keep chunks in memory before flushing
- **`chunk_retain_period: 30s`**: How long to keep chunks after flushing
- **`reject_old_samples_max_age: 168h`**: Reject logs older than 7 days
- **`retention_period: 0s`**: Log retention period (0 = infinite)

### 2. Promtail Configuration (`loki/promtail-config.yml`)

Promtail is the log collection agent that ships logs to Loki:

```yaml
server:
  http_listen_port: 9080
  grpc_listen_port: 0

positions:
  filename: /tmp/positions.yaml

clients:
  - url: http://loki:3100/loki/api/v1/push

scrape_configs:
  # System logs
  - job_name: system
    static_configs:
      - targets:
          - localhost
        labels:
          job: varlogs
          __path__: /var/log/*log

  # Docker container logs
  - job_name: containers
    static_configs:
      - targets:
          - localhost
        labels:
          job: containerlogs
          __path__: /var/lib/docker/containers/*/*-json.log

  # Application logs (if any)
  - job_name: applications
    static_configs:
      - targets:
          - localhost
        labels:
          job: applogs
          __path__: /var/log/app/*.log

  # Syslog
  - job_name: syslog
    static_configs:
      - targets:
          - localhost
        labels:
          job: syslog
          __path__: /var/log/syslog

  # Auth logs
  - job_name: auth
    static_configs:
      - targets:
          - localhost
        labels:
          job: auth
          __path__: /var/log/auth.log
```

#### Promtail Configuration Explained

- **`http_listen_port: 9080`**: Promtail metrics port
- **`positions.yaml`**: Tracks log file positions to resume after restarts
- **`clients.url`**: Loki endpoint for log shipping
- **`scrape_configs`**: Defines what logs to collect and how to label them

### 3. Docker Compose Integration

Loki and Promtail are integrated into the main Docker Compose stack:

```yaml
# Loki - Log aggregation
loki:
  image: grafana/loki:latest
  container_name: loki
  ports:
    - "3100:3100"
  volumes:
    - ./loki/config.yml:/etc/loki/local-config.yaml
    - loki_data:/loki
  command: -config.file=/etc/loki/local-config.yaml
  restart: unless-stopped
  networks:
    - monitoring

# Promtail - Log collection agent
promtail:
  image: grafana/promtail:latest
  container_name: promtail
  volumes:
    - ./loki/promtail-config.yml:/etc/promtail/config.yml
    - /var/log:/var/log
  command: -config.file=/etc/promtail/config.yml
  restart: unless-stopped
  networks:
    - monitoring
  depends_on:
    - loki
```

## API Integration

### 1. Loki API Client (`ui-next/lib/loki-api.ts`)

The web UI integrates with Loki through a custom API client:

```typescript
import { lokiAPI } from '@/lib/loki-api';

// Query logs with filters
const logs = await lokiAPI.queryLogs({
  query: '{job="prometheus"} |= "error"',
  start: Date.now() - 3600000, // 1 hour ago
  end: Date.now(),
  limit: 1000
});

// Get available labels
const labels = await lokiAPI.getLabels();

// Get label values
const jobs = await lokiAPI.getLabelValues('job');
```

### 2. React Hook (`ui-next/lib/hooks/use-loki-logs.ts`)

A custom React hook provides easy integration:

```typescript
import { useLokiLogs } from '@/lib/hooks/use-loki-logs';

function LogsPage() {
  const {
    logs,
    loading,
    error,
    jobs,
    namespaces,
    severityLevels,
    refresh,
    setFilters,
    filters
  } = useLokiLogs();

  // Use the data in your component
}
```

### 3. Configuration (`ui-next/lib/config.ts`)

Loki API configuration:

```typescript
export const config = {
  loki: {
    baseURL: process.env.NEXT_PUBLIC_LOKI_URL || 'http://localhost:3100',
    defaultTimeRange: 1, // hours
    refreshInterval: 10000, // milliseconds
    maxEntries: 1000
  }
};
```

## Usage Examples

### 1. Basic Log Queries

```bash
# Query all logs
curl "http://localhost:3100/loki/api/v1/query_range?query={__name__=~\".+\"}"

# Query logs by job
curl "http://localhost:3100/loki/api/v1/query_range?query={job=\"prometheus\"}"

# Search for error logs
curl "http://localhost:3100/loki/api/v1/query_range?query={__name__=~\".+\"} |= \"error\""

# Query with time range
curl "http://localhost:3100/loki/api/v1/query_range?query={job=\"prometheus\"}&start=1640995200000000000&end=1640998800000000000"
```

### 2. LogQL Examples

```logql
# All logs from prometheus job
{job="prometheus"}

# Error logs from any service
{__name__=~".+"} |= "error"

# Logs with specific severity
{level="error"}

# Logs from specific container
{container_name="nginx"}

# Complex query with multiple filters
{job="prometheus", level="error"} |= "connection refused"

# Regex matching
{job="prometheus"} |~ "error|warning|fatal"

# Log parsing and filtering
{job="nginx"} | json | status >= 400
```

### 3. Web UI Usage

1. **Navigate to Logs Tab**: Access the logs page in the web UI
2. **Search Logs**: Use the search box to find specific log entries
3. **Filter by Job**: Select specific jobs from the dropdown
4. **Filter by Namespace**: Filter by container names or namespaces
5. **Filter by Severity**: Filter by log levels (error, warn, info, debug)
6. **Time Range**: Select time ranges (15m, 1h, 6h, 24h, 7d)
7. **View Modes**: Switch between List view and Raw logs view

## Troubleshooting

### Common Issues

#### 1. Loki Not Starting

**Problem**: Loki container fails to start

**Solutions**:
```bash
# Check Loki logs
docker logs loki

# Verify configuration
docker exec loki cat /etc/loki/local-config.yaml

# Check port availability
netstat -tlnp | grep 3100
```

#### 2. No Logs Appearing

**Problem**: Logs not showing up in the UI

**Solutions**:
```bash
# Check Promtail logs
docker logs promtail

# Verify log file paths
docker exec promtail ls -la /var/log/

# Check Loki API
curl http://localhost:3100/loki/api/v1/labels
```

#### 3. High Memory Usage

**Problem**: Loki using too much memory

**Solutions**:
- Reduce `chunk_idle_period` in config
- Increase `chunk_retain_period`
- Limit `max_entries` in queries
- Enable log retention

#### 4. Slow Queries

**Problem**: Log queries are slow

**Solutions**:
- Use more specific label filters
- Limit time ranges
- Reduce `limit` parameter
- Optimize LogQL queries

### Debug Commands

```bash
# Check Loki status
curl http://localhost:3100/ready

# List available labels
curl http://localhost:3100/loki/api/v1/labels

# Get label values
curl http://localhost:3100/loki/api/v1/label/job/values

# Test query
curl "http://localhost:3100/loki/api/v1/query_range?query={__name__=~\".+\"}&limit=10"

# Check Promtail targets
curl http://localhost:9080/targets
```

## Best Practices

### 1. Log Labeling

- Use consistent label names across services
- Keep label cardinality low
- Use meaningful job names
- Include service and environment labels

### 2. Query Optimization

- Always use label filters first
- Limit time ranges for better performance
- Use specific LogQL patterns
- Avoid overly broad queries

### 3. Storage Management

- Set appropriate retention periods
- Monitor disk usage
- Use compression for long-term storage
- Consider log rotation policies

### 4. Security

- Enable authentication in production
- Use TLS for API communication
- Restrict network access
- Implement proper RBAC

### 5. Monitoring

- Monitor Loki metrics
- Set up alerts for log ingestion failures
- Track query performance
- Monitor storage usage

## Environment Variables

Configure Loki through environment variables:

```bash
# Loki API URL
NEXT_PUBLIC_LOKI_URL=http://localhost:3100

# Timeout settings
LOKI_QUERY_TIMEOUT=30000

# Rate limiting
LOKI_MAX_QUERIES_PER_MINUTE=60
```

## Production Considerations

### 1. High Availability

- Run multiple Loki instances
- Use external storage (S3, GCS)
- Implement proper backup strategies
- Use load balancers

### 2. Scalability

- Horizontal scaling with multiple ingesters
- Distributed storage backends
- Query parallelization
- Caching strategies

### 3. Security

- Enable authentication and authorization
- Use TLS encryption
- Implement network policies
- Regular security updates

### 4. Monitoring

- Set up comprehensive monitoring
- Create dashboards for Loki metrics
- Implement alerting rules
- Track performance metrics

## Support

For issues and questions:

1. Check the troubleshooting section above
2. Review Loki documentation: https://grafana.com/docs/loki/
3. Check Promtail documentation: https://grafana.com/docs/loki/latest/clients/promtail/
4. Open an issue in the project repository

## Additional Resources

- [Loki Documentation](https://grafana.com/docs/loki/)
- [LogQL Reference](https://grafana.com/docs/loki/latest/logql/)
- [Promtail Configuration](https://grafana.com/docs/loki/latest/clients/promtail/configuration/)
- [Grafana Loki Tutorial](https://grafana.com/tutorials/loki/)
