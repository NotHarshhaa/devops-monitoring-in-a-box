# Configuration System Guide - Phase 6

This guide explains the powerful configuration system that allows users to define their own metrics, logs, and alerts without editing code. The system supports JSON configuration files and provides a user-friendly interface for managing monitoring settings.

## Table of Contents

- [Overview](#overview)
- [Configuration Structure](#configuration-structure)
- [Configuration Examples](#configuration-examples)
- [Dynamic Dashboard](#dynamic-dashboard)
- [Configuration Management](#configuration-management)
- [Advanced Features](#advanced-features)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Overview

The Configuration System (Phase 6) is a major feature that transforms the monitoring interface from a static, code-based system to a dynamic, configuration-driven platform. Users can now:

- **Define Custom Metrics**: Add, modify, or remove monitoring metrics
- **Configure Log Queries**: Set up custom log queries and filters
- **Manage Alert Rules**: Define alert severity levels and filters
- **Customize Dashboard**: Set refresh intervals, themes, and layouts
- **Import/Export Configs**: Share configurations between environments

### Key Benefits

1. **No Code Changes Required**: Modify monitoring without touching source code
2. **Environment-Specific Configs**: Different configurations for dev, staging, production
3. **Easy Sharing**: Export and import configurations between teams
4. **Validation**: Built-in validation ensures configuration correctness
5. **Dynamic Updates**: Changes take effect immediately without restarts

## Configuration Structure

### Basic Configuration Format

```json
{
  "dashboard": { ... },
  "metrics": [ ... ],
  "logs": { ... },
  "alerts": { ... },
  "services": { ... },
  "version": "1.0.0",
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

### Dashboard Configuration

```json
{
  "dashboard": {
    "refresh_interval": "15s",
    "title": "DevOps Monitor",
    "description": "System monitoring dashboard",
    "theme": "system"
  }
}
```

**Fields:**
- `refresh_interval`: Auto-refresh interval (5s, 15s, 1m, 5m, etc.)
- `title`: Dashboard title displayed in header
- `description`: Dashboard description
- `theme`: UI theme (light, dark, system)

### Metrics Configuration

```json
{
  "metrics": [
    {
      "name": "CPU Usage",
      "query": "100 - (avg by(instance)(irate(node_cpu_seconds_total{mode=\"idle\"}[5m])) * 100)",
      "unit": "%",
      "chart": "line",
      "description": "Current CPU utilization across all instances",
      "thresholds": {
        "warning": 70,
        "critical": 85
      },
      "color": "#3b82f6",
      "enabled": true,
      "group": "System"
    }
  ]
}
```

**Fields:**
- `name`: Display name for the metric
- `query`: Prometheus query expression
- `unit`: Unit of measurement (%, MB, req/s, etc.)
- `chart`: Chart type (line, area, bar, stacked, composed)
- `description`: Metric description
- `thresholds`: Warning and critical thresholds
- `color`: Chart color (hex code)
- `enabled`: Whether metric is active
- `group`: Metric grouping for organization

### Logs Configuration

```json
{
  "logs": {
    "default_query": "{job=\"varlogs\"}",
    "limit": 100,
    "time_range": "1h",
    "refresh_interval": "10s",
    "filters": {
      "jobs": [],
      "namespaces": [],
      "severity_levels": ["error", "warning", "info"]
    }
  }
}
```

**Fields:**
- `default_query`: Default LogQL query
- `limit`: Maximum number of log entries to fetch
- `time_range`: Default time range for log queries
- `refresh_interval`: Auto-refresh interval for logs
- `filters`: Default filter options

### Alerts Configuration

```json
{
  "alerts": {
    "severity_levels": ["critical", "warning", "info"],
    "refresh_interval": "5s",
    "filters": {
      "services": [],
      "statuses": ["firing", "resolved"]
    }
  }
}
```

**Fields:**
- `severity_levels`: Available alert severity levels
- `refresh_interval`: Auto-refresh interval for alerts
- `filters`: Default filter options

### Services Configuration

```json
{
  "services": {
    "prometheus": {
      "url": "http://localhost:9090",
      "enabled": true
    },
    "grafana": {
      "url": "http://localhost:3000",
      "enabled": true
    },
    "loki": {
      "url": "http://localhost:3100",
      "enabled": true
    },
    "alertmanager": {
      "url": "http://localhost:9093",
      "enabled": true
    }
  }
}
```

**Fields:**
- `url`: Service endpoint URL
- `enabled`: Whether service is active

## Configuration Examples

### Example 1: Basic System Monitoring

```json
{
  "dashboard": {
    "refresh_interval": "15s",
    "title": "System Monitor",
    "description": "Basic system health monitoring"
  },
  "metrics": [
    {
      "name": "CPU Usage",
      "query": "100 - (avg by(instance)(irate(node_cpu_seconds_total{mode=\"idle\"}[5m])) * 100)",
      "unit": "%",
      "chart": "line",
      "thresholds": { "warning": 70, "critical": 85 },
      "color": "#3b82f6",
      "group": "System"
    },
    {
      "name": "Memory Usage",
      "query": "(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100",
      "unit": "%",
      "chart": "line",
      "thresholds": { "warning": 80, "critical": 90 },
      "color": "#10b981",
      "group": "System"
    }
  ],
  "logs": {
    "default_query": "{job=\"varlogs\"}",
    "limit": 50
  },
  "alerts": {
    "severity_levels": ["critical", "warning"]
  }
}
```

### Example 2: Application Performance Monitoring

```json
{
  "dashboard": {
    "refresh_interval": "5s",
    "title": "Application Performance",
    "description": "Real-time application metrics"
  },
  "metrics": [
    {
      "name": "Response Time",
      "query": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
      "unit": "s",
      "chart": "line",
      "thresholds": { "warning": 1.0, "critical": 2.0 },
      "color": "#06b6d4",
      "group": "Performance"
    },
    {
      "name": "Error Rate",
      "query": "rate(http_requests_total{status=~\"5..\"}[5m]) / rate(http_requests_total[5m]) * 100",
      "unit": "%",
      "chart": "line",
      "thresholds": { "warning": 1.0, "critical": 5.0 },
      "color": "#f97316",
      "group": "Performance"
    },
    {
      "name": "Throughput",
      "query": "rate(http_requests_total[5m])",
      "unit": "req/s",
      "chart": "area",
      "color": "#84cc16",
      "group": "Performance"
    }
  ],
  "logs": {
    "default_query": "{job=\"app-logs\"}",
    "limit": 200,
    "filters": {
      "severity_levels": ["error", "warning"]
    }
  },
  "alerts": {
    "severity_levels": ["critical", "warning", "info"],
    "refresh_interval": "3s"
  }
}
```

### Example 3: Multi-Environment Configuration

```json
{
  "dashboard": {
    "refresh_interval": "30s",
    "title": "Production Monitor",
    "description": "Production environment monitoring"
  },
  "metrics": [
    {
      "name": "Database Connections",
      "query": "pg_stat_database_numbackends",
      "unit": "connections",
      "chart": "line",
      "thresholds": { "warning": 80, "critical": 100 },
      "color": "#8b5cf6",
      "group": "Database"
    },
    {
      "name": "Cache Hit Rate",
      "query": "redis_keyspace_hits / (redis_keyspace_hits + redis_keyspace_misses) * 100",
      "unit": "%",
      "chart": "line",
      "thresholds": { "warning": 90, "critical": 95 },
      "color": "#f59e0b",
      "group": "Cache"
    }
  ],
  "services": {
    "prometheus": {
      "url": "https://prometheus.prod.example.com",
      "enabled": true
    },
    "grafana": {
      "url": "https://grafana.prod.example.com",
      "enabled": true
    }
  }
}
```

## Dynamic Dashboard

The dashboard automatically generates cards and charts based on the configuration:

### Metric Cards
- **Automatic Generation**: Cards are created for each enabled metric
- **Threshold Indicators**: Color-coded based on warning/critical thresholds
- **Real-time Updates**: Values update based on refresh interval
- **Responsive Layout**: Adapts to different screen sizes

### Chart Generation
- **Chart Types**: Line, area, bar, stacked, and composed charts
- **Multi-series Support**: Multiple metrics in single charts
- **Interactive Features**: Zoom, pan, and tooltip information
- **Animation**: Smooth transitions and data updates

### Grouping
- **Metric Groups**: Organize metrics by category (System, Network, Application)
- **Grouped Layout**: Metrics displayed in logical sections
- **Collapsible Sections**: Expand/collapse metric groups

## Configuration Management

### Import/Export

#### Export Configuration
```typescript
// Export current configuration
const configJson = configManager.exportToJson();
```

#### Import Configuration
```typescript
// Import from JSON string
const result = await configManager.loadFromJson(jsonString);
if (result.valid) {
  console.log('Configuration loaded successfully');
} else {
  console.error('Validation errors:', result.errors);
}
```

### Validation

The system includes comprehensive validation:

#### Structure Validation
- Required fields are present
- Data types are correct
- Nested objects are properly formatted

#### Content Validation
- Prometheus queries are syntactically valid
- Color codes are valid hex values
- Thresholds are numeric values
- URLs are properly formatted

#### Example Validation Errors
```json
{
  "valid": false,
  "errors": [
    "Metric at index 0 must have a valid name",
    "Invalid refresh interval format: 15x",
    "Service prometheus url must be a string"
  ],
  "warnings": [
    "Unknown service: custom-service"
  ]
}
```

### Configuration UI

The settings page includes a comprehensive configuration interface:

#### Configuration Summary
- Current configuration overview
- Metric counts and groups
- Service status
- Version information

#### JSON Editor
- Syntax highlighting
- Real-time validation
- Error highlighting
- Auto-formatting

#### File Operations
- Upload configuration files
- Download current configuration
- Copy to clipboard
- Reset to defaults

## Advanced Features

### Custom Chart Types

#### Stacked Charts
```json
{
  "name": "CPU Breakdown",
  "query": "irate(node_cpu_seconds_total[5m])",
  "chart": "stacked",
  "group": "System"
}
```

#### Composed Charts
```json
{
  "name": "Performance Overview",
  "query": "rate(http_requests_total[5m])",
  "chart": "composed",
  "dataKeys": [
    { "key": "requests", "type": "line" },
    { "key": "errors", "type": "bar" },
    { "key": "latency", "type": "area" }
  ]
}
```

### Dynamic Refresh Intervals

#### Per-Metric Intervals
```json
{
  "name": "Critical Metric",
  "query": "critical_metric",
  "refresh_interval": "5s"
}
```

#### Per-Section Intervals
```json
{
  "dashboard": {
    "refresh_interval": "15s"
  },
  "logs": {
    "refresh_interval": "10s"
  },
  "alerts": {
    "refresh_interval": "5s"
  }
}
```

### Environment Variables

Configuration can use environment variables:

```json
{
  "services": {
    "prometheus": {
      "url": "${PROMETHEUS_URL:-http://localhost:9090}"
    }
  }
}
```

### Configuration Inheritance

Configurations can extend base configurations:

```json
{
  "extends": "base-config.json",
  "dashboard": {
    "title": "Production Override"
  },
  "metrics": [
    {
      "name": "Additional Metric",
      "query": "additional_metric"
    }
  ]
}
```

## Best Practices

### 1. Configuration Organization

#### Use Groups
```json
{
  "metrics": [
    {
      "name": "CPU Usage",
      "group": "System",
      "query": "..."
    },
    {
      "name": "Response Time",
      "group": "Application",
      "query": "..."
    }
  ]
}
```

#### Logical Naming
```json
{
  "metrics": [
    {
      "name": "API Response Time (95th percentile)",
      "description": "95th percentile response time for API endpoints",
      "query": "histogram_quantile(0.95, rate(api_request_duration_seconds_bucket[5m]))"
    }
  ]
}
```

### 2. Performance Optimization

#### Limit Data Points
```json
{
  "logs": {
    "limit": 100,
    "time_range": "1h"
  }
}
```

#### Appropriate Refresh Intervals
```json
{
  "dashboard": {
    "refresh_interval": "15s"  // Not too frequent
  },
  "alerts": {
    "refresh_interval": "5s"   // More frequent for alerts
  }
}
```

### 3. Error Handling

#### Set Thresholds
```json
{
  "thresholds": {
    "warning": 70,
    "critical": 85
  }
}
```

#### Validate Queries
```json
{
  "query": "rate(metric_name[5m])",  // Test queries in Prometheus first
  "description": "Rate of metric_name over 5 minutes"
}
```

### 4. Documentation

#### Include Descriptions
```json
{
  "name": "Database Connections",
  "description": "Number of active database connections",
  "query": "pg_stat_database_numbackends",
  "unit": "connections"
}
```

#### Version Control
```json
{
  "version": "1.2.0",
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-15T10:30:00.000Z"
}
```

## Troubleshooting

### Common Issues

#### 1. Configuration Validation Errors

**Problem**: Configuration fails validation
**Solutions**:
- Check JSON syntax
- Verify required fields are present
- Ensure data types are correct
- Validate Prometheus queries

#### 2. Metrics Not Displaying

**Problem**: Metrics don't appear on dashboard
**Solutions**:
- Check if metric is enabled
- Verify Prometheus query syntax
- Ensure data source is accessible
- Check metric grouping

#### 3. Charts Not Rendering

**Problem**: Charts show no data
**Solutions**:
- Verify query returns data
- Check time range settings
- Ensure proper chart type
- Validate data format

#### 4. Import/Export Issues

**Problem**: Configuration import/export fails
**Solutions**:
- Check file format (must be JSON)
- Verify file permissions
- Ensure valid JSON syntax
- Check file size limits

### Debug Tools

#### Configuration Validation
```typescript
// Validate configuration
const result = ConfigParser.validateConfig(config);
console.log('Valid:', result.valid);
console.log('Errors:', result.errors);
console.log('Warnings:', result.warnings);
```

#### Query Testing
```bash
# Test Prometheus query
curl -G 'http://localhost:9090/api/v1/query' \
  --data-urlencode 'query=rate(node_cpu_seconds_total[5m])'
```

#### Configuration Summary
```typescript
// Get configuration summary
const summary = configManager.getConfigSummary();
console.log('Metrics:', summary.metrics.total);
console.log('Services:', summary.services.total);
```

### Error Messages

#### Common Error Messages

1. **"Configuration must be an object"**
   - Solution: Ensure configuration is wrapped in `{}`

2. **"Metric must have a valid name"**
   - Solution: Add `name` field to metric configuration

3. **"Invalid refresh interval format"**
   - Solution: Use format like `5s`, `1m`, `1h`, `1d`

4. **"Prometheus query syntax error"**
   - Solution: Test query in Prometheus UI first

5. **"Service URL must be a string"**
   - Solution: Ensure service URLs are strings, not objects

## Future Enhancements

### Planned Features

#### 1. YAML Support
```yaml
dashboard:
  refresh_interval: 15s
  title: "DevOps Monitor"

metrics:
  - name: "CPU Usage"
    query: "100 - (avg by(instance)(irate(node_cpu_seconds_total{mode=\"idle\"}[5m])) * 100)"
    unit: "%"
    chart: "line"
```

#### 2. Configuration Templates
```json
{
  "template": "kubernetes-monitoring",
  "variables": {
    "namespace": "production",
    "cluster": "main"
  }
}
```

#### 3. Configuration Versioning
```json
{
  "version": "1.2.0",
  "history": [
    {
      "version": "1.1.0",
      "date": "2024-01-01",
      "changes": ["Added new metrics", "Updated thresholds"]
    }
  ]
}
```

#### 4. Configuration API
```typescript
// REST API for configuration management
GET /api/config
POST /api/config
PUT /api/config
DELETE /api/config
```

#### 5. Configuration Backup
```json
{
  "backup": {
    "enabled": true,
    "frequency": "daily",
    "retention": "30d",
    "location": "s3://backups/configs/"
  }
}
```

## Conclusion

The Configuration System (Phase 6) represents a major advancement in the DevOps Monitoring platform, transforming it from a static system to a dynamic, user-configurable solution. This system provides:

### Key Achievements

1. **User Empowerment**: Non-technical users can configure monitoring
2. **Environment Flexibility**: Different configs for different environments
3. **Easy Maintenance**: No code changes required for configuration updates
4. **Validation & Safety**: Built-in validation prevents configuration errors
5. **Sharing & Collaboration**: Easy export/import for team collaboration

### Benefits for Different User Types

#### **Beginners**
- Use default configuration out of the box
- Simple JSON structure is easy to understand
- Built-in validation prevents mistakes
- Comprehensive documentation and examples

#### **Advanced Users**
- Full control over metrics, queries, and visualization
- Custom chart types and configurations
- Environment-specific configurations
- Integration with existing monitoring tools

#### **Teams**
- Share configurations between environments
- Version control for configuration changes
- Collaborative configuration management
- Standardized monitoring across teams

### Next Steps

1. **User Feedback**: Gather feedback on configuration system usability
2. **Performance Testing**: Test with large configurations and many metrics
3. **Integration Testing**: Ensure compatibility with existing monitoring tools
4. **Documentation**: Expand examples and use cases
5. **Feature Enhancement**: Add YAML support and advanced features

The configuration system provides a solid foundation for a truly customizable monitoring platform that can adapt to any environment and use case.
