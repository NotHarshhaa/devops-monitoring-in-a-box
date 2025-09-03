# Plugin System Guide

## Overview

The DevOps Monitoring application includes a comprehensive plugin system that allows you to extend monitoring capabilities by integrating with various data sources like AWS CloudWatch, Jenkins, GitHub Actions, and more.

## Table of Contents

- [Architecture](#architecture)
- [Plugin Development](#plugin-development)
- [Available Plugins](#available-plugins)
- [Plugin Management](#plugin-management)
- [Configuration](#configuration)
- [Real-time Integration](#real-time-integration)
- [Troubleshooting](#troubleshooting)
- [API Reference](#api-reference)

## Architecture

### Core Components

The plugin system consists of several key components:

1. **Plugin Registry**: Manages available plugins
2. **Plugin Manager**: Handles plugin lifecycle (install/uninstall/enable/disable)
3. **Plugin Interface**: Standardized contract for data fetching and rendering
4. **Configuration System**: Schema-based configuration validation
5. **UI Components**: Plugin management and data visualization interfaces

### Plugin Contract

Every plugin must implement the `Plugin` interface:

```typescript
interface Plugin {
  metadata: PluginMetadata
  fetchData(request: DataFetchRequest): Promise<DataFetchResponse>
  renderData(request: RenderRequest): Promise<RenderResponse>
  
  // Optional lifecycle methods
  onInstall?(config: PluginConfiguration): Promise<void>
  onUninstall?(config: PluginConfiguration): Promise<void>
  onEnable?(config: PluginConfiguration): Promise<void>
  onDisable?(config: PluginConfiguration): Promise<void>
  onConfigurationChange?(config: PluginConfiguration): Promise<void>
  healthCheck?(config: PluginConfiguration): Promise<boolean>
  testConnection?(config: PluginConfiguration): Promise<boolean>
}
```

## Plugin Development

### Creating a New Plugin

1. **Define Plugin Metadata**:

```typescript
const metadata: PluginMetadata = {
  id: 'my-plugin',
  name: 'My Custom Plugin',
  version: '1.0.0',
  description: 'Description of what this plugin does',
  author: 'Your Name',
  category: PluginCategory.MONITORING,
  icon: 'my-plugin-icon',
  tags: ['custom', 'monitoring'],
  supportedDataTypes: [DataType.METRICS, DataType.LOGS],
  configurationSchema: {
    type: 'object',
    properties: {
      apiUrl: {
        type: 'string',
        description: 'API endpoint URL',
        format: 'uri'
      },
      apiKey: {
        type: 'string',
        description: 'API authentication key',
        minLength: 1
      }
    },
    required: ['apiUrl', 'apiKey']
  }
}
```

2. **Implement Data Fetching**:

```typescript
async fetchData(request: DataFetchRequest): Promise<DataFetchResponse> {
  const { dataType, timeRange, filters } = request
  
  try {
    switch (dataType) {
      case DataType.METRICS:
        return await this.fetchMetrics(request, timeRange, filters)
      case DataType.LOGS:
        return await this.fetchLogs(request, timeRange, filters)
      default:
        throw new Error(`Unsupported data type: ${dataType}`)
    }
  } catch (error) {
    return {
      success: false,
      data: [],
      metadata: {
        totalCount: 0,
        hasMore: false,
        fetchedAt: new Date(),
        timeRange
      },
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
```

3. **Implement Data Rendering**:

```typescript
async renderData(request: RenderRequest): Promise<RenderResponse> {
  const { dataType, data, renderType, options } = request
  
  try {
    switch (renderType) {
      case RenderType.CHART:
        return this.renderChart(dataType, data, options)
      case RenderType.TABLE:
        return this.renderTable(dataType, data, options)
      default:
        throw new Error(`Unsupported render type: ${renderType}`)
    }
  } catch (error) {
    return {
      success: false,
      component: 'ErrorComponent',
      props: { error: error instanceof Error ? error.message : 'Unknown error' },
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
```

4. **Register the Plugin**:

```typescript
// In lib/plugins/index.ts
import { MyCustomPlugin } from './my-custom-plugin'

export function createPlugin(pluginId: string): Plugin | null {
  switch (pluginId) {
    case 'my-plugin':
      return new MyCustomPlugin()
    // ... other plugins
  }
}

// Register in plugin manager
pluginManagerInstance.registry.register(new MyCustomPlugin())
```

### Configuration Schema

The configuration schema follows JSON Schema format:

```typescript
interface ConfigurationSchema {
  type: 'object'
  properties: Record<string, ConfigurationProperty>
  required: string[]
}

interface ConfigurationProperty {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object'
  description: string
  default?: any
  enum?: any[]
  format?: string
  pattern?: string
  minLength?: number
  maxLength?: number
  minimum?: number
  maximum?: number
  items?: ConfigurationProperty
  properties?: Record<string, ConfigurationProperty>
}
```

### Supported Data Types

- **METRICS**: Numerical data for charts and graphs
- **LOGS**: Text-based log entries
- **ALERTS**: Alert and notification data
- **EVENTS**: Event-based data (builds, deployments, etc.)
- **TRACES**: Distributed tracing data

### Render Types

- **CHART**: Line, bar, pie, area, scatter charts
- **TABLE**: Tabular data display
- **CARD**: Summary cards with key metrics
- **ALERT**: Alert and notification displays
- **LOG_ENTRY**: Individual log entry formatting
- **CUSTOM**: Custom component rendering

## Available Plugins

### AWS CloudWatch Plugin

**Purpose**: Monitor AWS CloudWatch metrics, logs, and alarms

**Configuration**:
- `region`: AWS region (e.g., us-east-1)
- `namespace`: CloudWatch namespace to monitor
- `logGroupName`: CloudWatch Log Group name
- `metricNames`: List of metric names to fetch
- `dimensions`: Metric dimensions (key-value pairs)
- `refreshInterval`: Data refresh interval in seconds

**Supported Data Types**: Metrics, Logs, Alerts

**Credentials**:
- `accessKey`: AWS Access Key ID
- `secretKey`: AWS Secret Access Key

### Jenkins CI/CD Plugin

**Purpose**: Monitor Jenkins builds, jobs, and pipeline status

**Configuration**:
- `baseUrl`: Jenkins server base URL
- `username`: Jenkins username
- `apiToken`: Jenkins API token
- `jobNames`: List of Jenkins job names to monitor
- `includeBuildLogs`: Include build logs in data fetch
- `refreshInterval`: Data refresh interval in seconds

**Supported Data Types**: Metrics, Events, Logs

**Credentials**:
- `username`: Jenkins username
- `apiToken`: Jenkins API token

### GitHub Actions Plugin

**Purpose**: Monitor GitHub Actions workflows, runs, and deployments

**Configuration**:
- `repository`: GitHub repository (owner/repo)
- `personalAccessToken`: GitHub Personal Access Token
- `workflowNames`: List of workflow names to monitor
- `includeWorkflowLogs`: Include workflow logs in data fetch
- `includeDeployments`: Include deployment data
- `refreshInterval`: Data refresh interval in seconds

**Supported Data Types**: Metrics, Events, Logs

**Credentials**:
- `personalAccessToken`: GitHub Personal Access Token

## Plugin Management

### Installing Plugins

1. Navigate to the **Plugins** page in the application
2. Browse available plugins by category
3. Click **Install** on the desired plugin
4. Configure the plugin instance with your settings
5. Test the connection to ensure it's working

### Managing Plugin Instances

- **Enable/Disable**: Toggle plugin instances on/off
- **Configure**: Update plugin settings and credentials
- **Test Connection**: Validate plugin configuration
- **Uninstall**: Remove plugin instances

### Plugin Categories

- **Cloud Provider**: AWS, Azure, GCP integrations
- **CI/CD**: Jenkins, GitHub Actions, GitLab CI
- **Monitoring**: Prometheus, Grafana, DataDog
- **Logging**: ELK Stack, Splunk, Fluentd
- **Alerting**: PagerDuty, Slack, Email
- **Infrastructure**: Kubernetes, Docker, Terraform

## Configuration

### Environment Variables

For real API integration, set up the following environment variables:

```env
# AWS CloudWatch
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1

# Jenkins
JENKINS_URL=http://your-jenkins.com
JENKINS_USERNAME=your_username
JENKINS_API_TOKEN=your_token

# GitHub Actions
GITHUB_TOKEN=your_personal_access_token
```

### Plugin Configuration

Each plugin instance has its own configuration:

```typescript
interface PluginConfiguration {
  pluginId: string
  instanceId: string
  name: string
  enabled: boolean
  config: Record<string, any>
  credentials?: Record<string, any>
  lastUpdated: Date
}
```

### Security Considerations

- **Credentials Storage**: Store sensitive credentials securely
- **API Rate Limits**: Respect API rate limits for external services
- **Error Handling**: Implement proper error handling for API failures
- **Validation**: Validate all configuration inputs

## Real-time Integration

### Current Status

The plugin system currently uses **mock data** for demonstration purposes. To enable real-time functionality:

### 1. Install Required Dependencies

```bash
npm install @aws-sdk/client-cloudwatch @octokit/rest axios
```

### 2. Replace Mock Data with Real API Calls

Example for AWS CloudWatch:

```typescript
import { CloudWatchClient, GetMetricStatisticsCommand } from '@aws-sdk/client-cloudwatch'

private async fetchRealMetrics(config: PluginConfiguration): Promise<any[]> {
  const client = new CloudWatchClient({
    region: config.config.region,
    credentials: {
      accessKeyId: config.credentials.accessKey,
      secretAccessKey: config.credentials.secretKey
    }
  })
  
  const command = new GetMetricStatisticsCommand({
    Namespace: config.config.namespace,
    MetricName: 'CPUUtilization',
    StartTime: timeRange.start,
    EndTime: timeRange.end,
    Period: 300,
    Statistics: ['Average']
  })
  
  const response = await client.send(command)
  return response.Datapoints || []
}
```

### 3. Implement Real-time Updates

```typescript
// Add to plugin manager
const startRealTimeUpdates = (instanceId: string, interval: number = 30000) => {
  setInterval(async () => {
    await fetchDataFromPlugin({
      pluginId: instance.pluginId,
      instanceId: instance.instanceId,
      dataType: selectedDataType,
      timeRange: { start: new Date(Date.now() - 60000), end: new Date() }
    })
  }, interval)
}
```

### 4. Add Error Handling

```typescript
try {
  const data = await fetchRealData(config)
  return { success: true, data }
} catch (error) {
  console.error('Plugin error:', error)
  return { 
    success: false, 
    data: [], 
    error: error.message 
  }
}
```

## Troubleshooting

### Common Issues

1. **Plugin Not Loading**
   - Check if plugin is properly registered
   - Verify plugin metadata is correct
   - Check browser console for errors

2. **Configuration Validation Errors**
   - Ensure all required fields are provided
   - Check field types and constraints
   - Validate credential formats

3. **Connection Test Failures**
   - Verify credentials are correct
   - Check network connectivity
   - Ensure API endpoints are accessible

4. **Data Not Loading**
   - Check if plugin instance is enabled
   - Verify time range settings
   - Check API rate limits

### Debug Mode

Enable debug mode for detailed logging:

```typescript
// In plugin configuration
debug: process.env.NODE_ENV === 'development'
```

### Logs

Check the following for debugging:
- Browser console for client-side errors
- Server logs for API errors
- Plugin-specific error messages

## API Reference

### PluginManager

```typescript
interface PluginManager {
  registry: PluginRegistry
  installPlugin(pluginId: string, config: PluginConfiguration): Promise<void>
  uninstallPlugin(pluginId: string, instanceId: string): Promise<void>
  enablePlugin(pluginId: string, instanceId: string): Promise<void>
  disablePlugin(pluginId: string, instanceId: string): Promise<void>
  updatePluginConfiguration(pluginId: string, instanceId: string, config: Partial<PluginConfiguration>): Promise<void>
  getPluginInstances(pluginId?: string): PluginConfiguration[]
  fetchDataFromPlugin(request: DataFetchRequest): Promise<DataFetchResponse>
  renderDataFromPlugin(request: RenderRequest): Promise<RenderResponse>
}
```

### DataFetchRequest

```typescript
interface DataFetchRequest {
  pluginId: string
  instanceId: string
  dataType: DataType
  timeRange: TimeRange
  filters?: Record<string, any>
  aggregation?: AggregationConfig
}
```

### RenderRequest

```typescript
interface RenderRequest {
  pluginId: string
  instanceId: string
  dataType: DataType
  data: any[]
  renderType: RenderType
  options?: RenderOptions
}
```

### TimeRange

```typescript
interface TimeRange {
  start: Date
  end: Date
  granularity?: '1m' | '5m' | '15m' | '1h' | '1d'
}
```

## Best Practices

1. **Error Handling**: Always implement proper error handling
2. **Rate Limiting**: Respect API rate limits
3. **Caching**: Implement appropriate caching strategies
4. **Validation**: Validate all inputs and configurations
5. **Documentation**: Document plugin functionality and configuration
6. **Testing**: Test plugins thoroughly before deployment
7. **Security**: Handle credentials securely
8. **Performance**: Optimize data fetching and rendering

## Contributing

To contribute new plugins:

1. Follow the plugin development guide
2. Implement proper error handling
3. Add comprehensive tests
4. Update documentation
5. Submit a pull request

## Support

For issues and questions:
- Check the troubleshooting section
- Review plugin documentation
- Check GitHub issues
- Contact the development team

---

*This guide covers the complete plugin system implementation. For specific plugin configurations or advanced usage, refer to the individual plugin documentation.*
