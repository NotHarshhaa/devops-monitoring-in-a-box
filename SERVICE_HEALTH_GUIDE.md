# Service Health & Quick Links Guide

This guide explains how to use the Service Health monitoring and Quick Links functionality in the DevOps Monitoring in a Box project.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Service Health Monitoring](#service-health-monitoring)
- [Quick Links](#quick-links)
- [Usage Guide](#usage-guide)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)
- [API Reference](#api-reference)
- [Best Practices](#best-practices)

## Overview

The Service Health & Quick Links feature provides real-time monitoring of all monitoring services in your DevOps stack, along with quick access to external service interfaces. This feature helps you maintain visibility into the health of your monitoring infrastructure and provides convenient access to external tools.

### Key Benefits

- **Real-time Health Monitoring**: Monitor the status of all monitoring services
- **Quick Access**: Direct links to external service interfaces
- **Performance Tracking**: Response time monitoring for each service
- **Error Detection**: Detailed error messages when services are down
- **Centralized View**: Single interface for all service health information

## Features

### 🏥 **Service Health Monitoring**

- **Real-time Status Checks**: Automatic health checks every 30 seconds
- **Response Time Tracking**: Monitor service performance
- **Error Detection**: Detailed error messages and status codes
- **Overall System Health**: System-wide health status calculation
- **Individual Service Refresh**: Manual refresh for specific services

### 🔗 **Quick Links**

- **External Service Access**: Direct links to Grafana, Prometheus, Alertmanager, and Loki
- **Secure Navigation**: Opens in new tabs with proper security settings
- **Icon-based Interface**: Visual icons for easy identification
- **Responsive Design**: Works on all screen sizes

## Service Health Monitoring

### Monitored Services

The system monitors the following services:

| Service | Endpoint | Description |
|---------|----------|-------------|
| **Prometheus** | `/api/v1/status/config` | Metrics collection and storage |
| **Grafana** | `/api/health` | Visualization and dashboards |
| **Loki** | `/ready` | Log aggregation system |
| **Alertmanager** | `/api/v2/status` | Alert routing and management |
| **Node Exporter** | `/metrics` | System metrics collection |
| **cAdvisor** | `/healthz` | Container metrics collection |

### Health Status Indicators

#### Status Types

- **✅ Up**: Service is healthy and responding
- **❌ Down**: Service is unavailable or erroring
- **⏳ Checking**: Health check in progress

#### Overall System Status

- **✅ Healthy**: All services are up and running
- **⚠️ Degraded**: 50% or more services are up
- **❌ Unhealthy**: Less than 50% of services are up

### Health Check Process

1. **Parallel Checks**: All services are checked simultaneously for efficiency
2. **Timeout Handling**: 5-second timeout per service check
3. **Error Classification**: Different error types are categorized and displayed
4. **Response Time Measurement**: Tracks how long each service takes to respond
5. **Status Calculation**: Determines overall system health based on individual service status

## Quick Links

### Available Quick Links

| Service | Icon | Description | URL |
|---------|------|-------------|-----|
| **Grafana** | 📊 | Open Grafana dashboards | `http://localhost:3000` |
| **Prometheus** | 🔍 | Open Prometheus query interface | `http://localhost:9090` |
| **Alertmanager** | 🚨 | Open Alertmanager web UI | `http://localhost:9093` |
| **Loki** | 📝 | Open Loki query interface | `http://localhost:3100` |

### Quick Link Features

- **New Tab Opening**: Links open in new browser tabs
- **Security**: Uses `noopener` and `noreferrer` for security
- **Visual Indicators**: Icons and descriptions for easy identification
- **Responsive Layout**: Adapts to different screen sizes

## Usage Guide

### Accessing Service Health

1. **Navigate to Services Tab**: Click on the "Services" tab in the main navigation
2. **View Overall Status**: See the system-wide health status at the top
3. **Monitor Individual Services**: Scroll down to see individual service cards
4. **Check Details**: Click on service cards to see detailed information

### Using Quick Links

1. **Locate Quick Links**: Find the Quick Links section on the right side
2. **Click Service Link**: Click on any service to open it in a new tab
3. **Access External Tools**: Use the links to access Grafana, Prometheus, etc.

### Manual Refresh

1. **Refresh All Services**: Click the "Refresh" button in the header
2. **Refresh Individual Service**: Click the "Refresh" button on a specific service card
3. **Auto-refresh**: Services automatically refresh every 30 seconds

### Understanding Status Information

#### Service Card Information

- **Status**: Current health status (Up/Down/Checking)
- **Port**: Service port number
- **Response Time**: How long the service took to respond
- **Last Checked**: When the last health check was performed
- **Endpoint**: The health check endpoint used
- **URL**: The full service URL
- **Error Details**: Specific error messages if the service is down

#### Overall Status Information

- **System Status**: Overall health of the monitoring stack
- **Service Count**: Number of services that are up vs. total
- **Last Updated**: When the last system-wide check was performed

## Configuration

### Environment Variables

Configure service URLs through environment variables:

```bash
# Prometheus URL
NEXT_PUBLIC_PROMETHEUS_URL=http://localhost:9090

# Loki URL
NEXT_PUBLIC_LOKI_URL=http://localhost:3100

# Alertmanager URL
NEXT_PUBLIC_ALERTMANAGER_URL=http://localhost:9093
```

### Health Check Settings

The health monitoring system uses the following default settings:

```typescript
// Health check configuration
const healthConfig = {
  timeout: 5000,        // 5 second timeout per service
  refreshInterval: 30000, // 30 second auto-refresh
  parallelChecks: true,   // Check all services simultaneously
  retryOnError: true     // Retry failed checks on next cycle
};
```

### Service Endpoints

You can customize the health check endpoints by modifying the service configuration:

```typescript
// Custom service configuration
const customServices = [
  {
    name: 'Custom Service',
    url: 'http://localhost:8080',
    endpoint: '/health',
    description: 'Custom monitoring service'
  }
];
```

## Troubleshooting

### Common Issues

#### 1. All Services Showing as Down

**Problem**: All services appear to be down

**Possible Causes**:
- Services are not running
- Network connectivity issues
- Firewall blocking connections
- Wrong URLs configured

**Solutions**:
```bash
# Check if services are running
docker ps | grep -E "(prometheus|grafana|loki|alertmanager)"

# Test connectivity
curl -I http://localhost:9090/api/v1/status/config
curl -I http://localhost:3000/api/health
curl -I http://localhost:3100/ready

# Check Docker Compose status
docker-compose ps
```

#### 2. Some Services Down

**Problem**: Only some services are showing as down

**Solutions**:
- Check individual service logs
- Verify service-specific configurations
- Test individual service endpoints
- Check for service-specific issues

#### 3. Slow Response Times

**Problem**: Services are up but response times are high

**Solutions**:
- Check system resources (CPU, memory, disk)
- Monitor network latency
- Check for service-specific performance issues
- Consider scaling resources

#### 4. Quick Links Not Working

**Problem**: Quick links don't open or show errors

**Solutions**:
- Verify service URLs are correct
- Check if services are accessible from your browser
- Ensure services are running on expected ports
- Check for CORS or security restrictions

### Debug Commands

```bash
# Test individual service endpoints
curl -v http://localhost:9090/api/v1/status/config
curl -v http://localhost:3000/api/health
curl -v http://localhost:3100/ready
curl -v http://localhost:9093/api/v2/status
curl -v http://localhost:9100/metrics
curl -v http://localhost:8080/healthz

# Check service logs
docker logs prometheus
docker logs grafana
docker logs loki
docker logs alertmanager
docker logs node-exporter
docker logs cadvisor

# Check network connectivity
netstat -tlnp | grep -E "(9090|3000|3100|9093|9100|8080)"
```

## API Reference

### Health API Methods

#### `checkAllServices()`
Checks the health of all configured services.

```typescript
const healthData = await healthAPI.checkAllServices();
// Returns: HealthCheckResult
```

#### `checkService(serviceName: string)`
Checks the health of a specific service.

```typescript
const serviceHealth = await healthAPI.checkService('Prometheus');
// Returns: ServiceHealth
```

#### `getQuickLinks()`
Gets the list of available quick links.

```typescript
const links = healthAPI.getQuickLinks();
// Returns: Array<QuickLink>
```

### React Hook Usage

#### `useHealthMonitoring()`
Custom React hook for health monitoring.

```typescript
import { useHealthMonitoring } from '@/lib/hooks/use-health-monitoring';

function MyComponent() {
  const {
    healthData,        // Current health data
    loading,           // Loading state
    error,             // Error state
    refresh,           // Refresh function
    checkSingleService, // Check single service
    quickLinks         // Quick links data
  } = useHealthMonitoring();

  // Use the data in your component
}
```

### Data Types

#### `ServiceHealth`
```typescript
interface ServiceHealth {
  name: string;           // Service name
  url: string;            // Service URL
  status: 'up' | 'down' | 'checking'; // Health status
  responseTime?: number;  // Response time in ms
  lastChecked: Date;      // Last check timestamp
  error?: string;         // Error message if down
  endpoint: string;       // Health check endpoint
  description: string;    // Service description
}
```

#### `HealthCheckResult`
```typescript
interface HealthCheckResult {
  services: ServiceHealth[];                    // All service health data
  overallStatus: 'healthy' | 'degraded' | 'unhealthy'; // Overall status
  lastUpdated: Date;                           // Last update timestamp
}
```

## Best Practices

### 1. Service Configuration

- **Use Environment Variables**: Configure service URLs through environment variables
- **Consistent Naming**: Use consistent service names across configurations
- **Proper Endpoints**: Use appropriate health check endpoints for each service
- **Timeout Settings**: Set appropriate timeouts for different service types

### 2. Monitoring Strategy

- **Regular Checks**: Use automatic refresh for continuous monitoring
- **Manual Refresh**: Provide manual refresh options for immediate updates
- **Error Handling**: Implement proper error handling and user feedback
- **Performance Tracking**: Monitor response times for performance insights

### 3. User Experience

- **Clear Status Indicators**: Use clear visual indicators for service status
- **Detailed Information**: Provide detailed error messages and service information
- **Quick Access**: Make external services easily accessible through quick links
- **Responsive Design**: Ensure the interface works on all screen sizes

### 4. Security

- **External Links**: Use proper security attributes for external links
- **Error Information**: Don't expose sensitive information in error messages
- **Network Security**: Ensure proper network security for service communication
- **Access Control**: Implement appropriate access controls for service endpoints

### 5. Performance

- **Parallel Checks**: Use parallel health checks for better performance
- **Caching**: Implement appropriate caching for health check results
- **Rate Limiting**: Avoid overwhelming services with too frequent checks
- **Resource Management**: Monitor resource usage of health check processes

## Production Considerations

### 1. High Availability

- **Multiple Instances**: Run multiple instances of monitoring services
- **Load Balancing**: Use load balancers for service access
- **Failover**: Implement failover mechanisms for critical services
- **Backup Services**: Have backup services for critical monitoring functions

### 2. Scalability

- **Service Discovery**: Use service discovery for dynamic service configuration
- **Horizontal Scaling**: Scale services horizontally as needed
- **Resource Monitoring**: Monitor resource usage and scale accordingly
- **Performance Optimization**: Optimize health check performance for large deployments

### 3. Security

- **Authentication**: Implement authentication for service endpoints
- **Authorization**: Use proper authorization for service access
- **Encryption**: Use TLS encryption for service communication
- **Network Policies**: Implement network policies for service access

### 4. Monitoring

- **Health Check Monitoring**: Monitor the health check system itself
- **Performance Metrics**: Track performance metrics for health checks
- **Alerting**: Set up alerts for service health issues
- **Logging**: Implement comprehensive logging for troubleshooting

## Support

For issues and questions:

1. Check the troubleshooting section above
2. Review service logs for specific error messages
3. Test individual service endpoints manually
4. Check network connectivity and firewall settings
5. Open an issue in the project repository

## Additional Resources

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [Loki Documentation](https://grafana.com/docs/loki/)
- [Alertmanager Documentation](https://prometheus.io/docs/alerting/latest/alertmanager/)
- [Node Exporter Documentation](https://github.com/prometheus/node_exporter)
- [cAdvisor Documentation](https://github.com/google/cadvisor)
