import { 
  Plugin, 
  PluginMetadata, 
  PluginCategory, 
  DataType, 
  ConfigurationSchema,
  DataFetchRequest,
  DataFetchResponse,
  RenderRequest,
  RenderResponse,
  PluginConfiguration,
  TimeRange,
  RenderType
} from './types'

// AWS CloudWatch Plugin
export class AWSCloudWatchPlugin implements Plugin {
  metadata: PluginMetadata = {
    id: 'aws-cloudwatch',
    name: 'AWS CloudWatch',
    version: '1.0.0',
    description: 'Monitor AWS CloudWatch metrics, logs, and alarms',
    author: 'DevOps Monitoring Team',
    category: PluginCategory.CLOUD_PROVIDER,
    icon: 'aws-cloudwatch-icon',
    tags: ['aws', 'cloudwatch', 'metrics', 'logs', 'alarms'],
    supportedDataTypes: [DataType.METRICS, DataType.LOGS, DataType.ALERTS],
    configurationSchema: {
      type: 'object',
      properties: {
        region: {
          type: 'string',
          description: 'AWS region (e.g., us-east-1)',
          default: 'us-east-1'
        },
        namespace: {
          type: 'string',
          description: 'CloudWatch namespace to monitor',
          default: 'AWS/EC2'
        },
        logGroupName: {
          type: 'string',
          description: 'CloudWatch Log Group name',
          default: '/aws/lambda/function-name'
        },
        metricNames: {
          type: 'array',
          description: 'List of metric names to fetch',
          items: {
            type: 'string',
            description: 'Metric name'
          },
          default: ['CPUUtilization', 'NetworkIn', 'NetworkOut']
        },
        dimensions: {
          type: 'object',
          description: 'Metric dimensions (key-value pairs)',
          properties: {
            InstanceId: {
              type: 'string',
              description: 'EC2 Instance ID'
            }
          }
        },
        refreshInterval: {
          type: 'number',
          description: 'Data refresh interval in seconds',
          minimum: 30,
          maximum: 3600,
          default: 300
        }
      },
      required: ['region']
    }
  }

  async fetchData(request: DataFetchRequest): Promise<DataFetchResponse> {
    const { dataType, timeRange, filters } = request
    
    try {
      switch (dataType) {
        case DataType.METRICS:
          return await this.fetchMetrics(request, timeRange, filters)
        case DataType.LOGS:
          return await this.fetchLogs(request, timeRange, filters)
        case DataType.ALERTS:
          return await this.fetchAlarms(request, timeRange, filters)
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

  async renderData(request: RenderRequest): Promise<RenderResponse> {
    const { dataType, data, renderType, options } = request
    
    try {
      switch (renderType) {
        case RenderType.CHART:
          return this.renderChart(dataType, data, options)
        case RenderType.TABLE:
          return this.renderTable(dataType, data, options)
        case RenderType.CARD:
          return this.renderCard(dataType, data, options)
        case RenderType.ALERT:
          return this.renderAlert(dataType, data, options)
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

  private async fetchMetrics(
    request: DataFetchRequest, 
    timeRange: TimeRange, 
    filters?: Record<string, any>
  ): Promise<DataFetchResponse> {
    // Mock CloudWatch metrics data
    const mockMetrics = [
      {
        timestamp: new Date(timeRange.start.getTime() + 0 * 60000),
        metricName: 'CPUUtilization',
        value: 45.2,
        unit: 'Percent',
        dimensions: { InstanceId: 'i-1234567890abcdef0' }
      },
      {
        timestamp: new Date(timeRange.start.getTime() + 5 * 60000),
        metricName: 'CPUUtilization',
        value: 52.8,
        unit: 'Percent',
        dimensions: { InstanceId: 'i-1234567890abcdef0' }
      },
      {
        timestamp: new Date(timeRange.start.getTime() + 10 * 60000),
        metricName: 'CPUUtilization',
        value: 38.1,
        unit: 'Percent',
        dimensions: { InstanceId: 'i-1234567890abcdef0' }
      },
      {
        timestamp: new Date(timeRange.start.getTime() + 0 * 60000),
        metricName: 'NetworkIn',
        value: 1024,
        unit: 'Bytes',
        dimensions: { InstanceId: 'i-1234567890abcdef0' }
      },
      {
        timestamp: new Date(timeRange.start.getTime() + 5 * 60000),
        metricName: 'NetworkIn',
        value: 2048,
        unit: 'Bytes',
        dimensions: { InstanceId: 'i-1234567890abcdef0' }
      }
    ]

    return {
      success: true,
      data: mockMetrics,
      metadata: {
        totalCount: mockMetrics.length,
        hasMore: false,
        fetchedAt: new Date(),
        timeRange
      }
    }
  }

  private async fetchLogs(
    request: DataFetchRequest, 
    timeRange: TimeRange, 
    filters?: Record<string, any>
  ): Promise<DataFetchResponse> {
    // Mock CloudWatch logs data
    const mockLogs = [
      {
        timestamp: new Date(timeRange.start.getTime() + 0 * 60000),
        message: 'Application started successfully',
        logStream: '2024/01/01/[$LATEST]abc123',
        level: 'INFO'
      },
      {
        timestamp: new Date(timeRange.start.getTime() + 2 * 60000),
        message: 'Processing request for user: user123',
        logStream: '2024/01/01/[$LATEST]abc123',
        level: 'INFO'
      },
      {
        timestamp: new Date(timeRange.start.getTime() + 5 * 60000),
        message: 'Database connection timeout',
        logStream: '2024/01/01/[$LATEST]abc123',
        level: 'ERROR'
      }
    ]

    return {
      success: true,
      data: mockLogs,
      metadata: {
        totalCount: mockLogs.length,
        hasMore: false,
        fetchedAt: new Date(),
        timeRange
      }
    }
  }

  private async fetchAlarms(
    request: DataFetchRequest, 
    timeRange: TimeRange, 
    filters?: Record<string, any>
  ): Promise<DataFetchResponse> {
    // Mock CloudWatch alarms data
    const mockAlarms = [
      {
        alarmName: 'High-CPU-Utilization',
        state: 'ALARM',
        stateReason: 'Threshold Crossed: 1 out of the last 1 datapoints [45.2] was greater than the threshold (40.0)',
        timestamp: new Date(timeRange.start.getTime() + 0 * 60000),
        metricName: 'CPUUtilization',
        threshold: 40.0,
        comparisonOperator: 'GreaterThanThreshold'
      },
      {
        alarmName: 'Low-Disk-Space',
        state: 'OK',
        stateReason: 'Threshold Crossed: 1 out of the last 1 datapoints [85.0] was not greater than the threshold (90.0)',
        timestamp: new Date(timeRange.start.getTime() + 0 * 60000),
        metricName: 'DiskSpaceUtilization',
        threshold: 90.0,
        comparisonOperator: 'GreaterThanThreshold'
      }
    ]

    return {
      success: true,
      data: mockAlarms,
      metadata: {
        totalCount: mockAlarms.length,
        hasMore: false,
        fetchedAt: new Date(),
        timeRange
      }
    }
  }

  private renderChart(dataType: DataType, data: any[], options?: any): RenderResponse {
    const chartType = options?.chartType || 'line'
    
    return {
      success: true,
      component: 'CloudWatchChart',
      props: {
        data,
        chartType,
        dataType,
        title: `AWS CloudWatch ${dataType} Chart`,
        xAxisKey: 'timestamp',
        yAxisKey: 'value',
        colorScheme: 'aws'
      }
    }
  }

  private renderTable(dataType: DataType, data: any[], options?: any): RenderResponse {
    const columns = options?.columns || this.getDefaultColumns(dataType)
    
    return {
      success: true,
      component: 'CloudWatchTable',
      props: {
        data,
        columns,
        dataType,
        title: `AWS CloudWatch ${dataType} Data`,
        sortable: true,
        filterable: true
      }
    }
  }

  private renderCard(dataType: DataType, data: any[], options?: any): RenderResponse {
    const latestData = data[data.length - 1]
    
    return {
      success: true,
      component: 'CloudWatchCard',
      props: {
        title: `Latest ${dataType}`,
        value: latestData?.value || latestData?.state || 'N/A',
        unit: latestData?.unit || '',
        trend: this.calculateTrend(data),
        status: this.getStatusColor(latestData),
        icon: 'aws-cloudwatch-icon'
      }
    }
  }

  private renderAlert(dataType: DataType, data: any[], options?: any): RenderResponse {
    const alerts = data.filter(item => item.state === 'ALARM')
    
    return {
      success: true,
      component: 'CloudWatchAlert',
      props: {
        alerts,
        title: `AWS CloudWatch Alarms`,
        severity: 'warning',
        showDetails: true
      }
    }
  }

  private getDefaultColumns(dataType: DataType): string[] {
    switch (dataType) {
      case DataType.METRICS:
        return ['timestamp', 'metricName', 'value', 'unit', 'dimensions']
      case DataType.LOGS:
        return ['timestamp', 'level', 'message', 'logStream']
      case DataType.ALERTS:
        return ['alarmName', 'state', 'stateReason', 'timestamp', 'metricName']
      default:
        return []
    }
  }

  private calculateTrend(data: any[]): 'up' | 'down' | 'stable' {
    if (data.length < 2) return 'stable'
    
    const first = data[0]?.value || 0
    const last = data[data.length - 1]?.value || 0
    
    if (last > first * 1.1) return 'up'
    if (last < first * 0.9) return 'down'
    return 'stable'
  }

  private getStatusColor(data: any): 'success' | 'warning' | 'error' {
    if (data?.state === 'ALARM') return 'error'
    if (data?.state === 'INSUFFICIENT_DATA') return 'warning'
    return 'success'
  }

  // Lifecycle methods
  async onInstall(config: PluginConfiguration): Promise<void> {
    console.log(`AWS CloudWatch plugin installed for instance: ${config.instanceId}`)
  }

  async onUninstall(config: PluginConfiguration): Promise<void> {
    console.log(`AWS CloudWatch plugin uninstalled for instance: ${config.instanceId}`)
  }

  async onEnable(config: PluginConfiguration): Promise<void> {
    console.log(`AWS CloudWatch plugin enabled for instance: ${config.instanceId}`)
  }

  async onDisable(config: PluginConfiguration): Promise<void> {
    console.log(`AWS CloudWatch plugin disabled for instance: ${config.instanceId}`)
  }

  async onConfigurationChange(config: PluginConfiguration): Promise<void> {
    console.log(`AWS CloudWatch plugin configuration updated for instance: ${config.instanceId}`)
  }

  async healthCheck(config: PluginConfiguration): Promise<boolean> {
    // Mock health check - in real implementation, this would test AWS API connectivity
    return true
  }

  async testConnection(config: PluginConfiguration): Promise<boolean> {
    // Mock connection test - in real implementation, this would validate AWS credentials
    return true
  }
}
