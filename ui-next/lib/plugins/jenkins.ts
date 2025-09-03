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

// Jenkins Plugin
export class JenkinsPlugin implements Plugin {
  metadata: PluginMetadata = {
    id: 'jenkins',
    name: 'Jenkins CI/CD',
    version: '1.0.0',
    description: 'Monitor Jenkins builds, jobs, and pipeline status',
    author: 'DevOps Monitoring Team',
    category: PluginCategory.CI_CD,
    icon: 'jenkins-icon',
    tags: ['jenkins', 'ci-cd', 'builds', 'pipelines', 'jobs'],
    supportedDataTypes: [DataType.METRICS, DataType.EVENTS, DataType.LOGS],
    configurationSchema: {
      type: 'object',
      properties: {
        baseUrl: {
          type: 'string',
          description: 'Jenkins server base URL',
          format: 'uri',
          default: 'http://localhost:8080'
        },
        username: {
          type: 'string',
          description: 'Jenkins username',
          minLength: 1
        },
        apiToken: {
          type: 'string',
          description: 'Jenkins API token',
          minLength: 1
        },
        jobNames: {
          type: 'array',
          description: 'List of Jenkins job names to monitor',
          items: {
            type: 'string',
            description: 'Job name'
          },
          default: ['main-pipeline', 'deploy-staging', 'deploy-production']
        },
        includeBuildLogs: {
          type: 'boolean',
          description: 'Include build logs in data fetch',
          default: true
        },
        refreshInterval: {
          type: 'number',
          description: 'Data refresh interval in seconds',
          minimum: 30,
          maximum: 3600,
          default: 60
        }
      },
      required: ['baseUrl', 'username', 'apiToken']
    }
  }

  async fetchData(request: DataFetchRequest): Promise<DataFetchResponse> {
    const { dataType, timeRange, filters } = request
    
    try {
      switch (dataType) {
        case DataType.METRICS:
          return await this.fetchBuildMetrics(request, timeRange, filters)
        case DataType.EVENTS:
          return await this.fetchBuildEvents(request, timeRange, filters)
        case DataType.LOGS:
          return await this.fetchBuildLogs(request, timeRange, filters)
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

  private async fetchBuildMetrics(
    request: DataFetchRequest, 
    timeRange: TimeRange, 
    filters?: Record<string, any>
  ): Promise<DataFetchResponse> {
    // Mock Jenkins build metrics data
    const mockMetrics = [
      {
        timestamp: new Date(timeRange.start.getTime() + 0 * 60000),
        jobName: 'main-pipeline',
        buildNumber: 123,
        duration: 180000, // 3 minutes
        status: 'SUCCESS',
        testResults: {
          total: 150,
          passed: 148,
          failed: 2,
          skipped: 0
        },
        codeCoverage: 85.5
      },
      {
        timestamp: new Date(timeRange.start.getTime() + 30 * 60000),
        jobName: 'deploy-staging',
        buildNumber: 45,
        duration: 120000, // 2 minutes
        status: 'SUCCESS',
        testResults: {
          total: 75,
          passed: 75,
          failed: 0,
          skipped: 0
        },
        codeCoverage: 92.1
      },
      {
        timestamp: new Date(timeRange.start.getTime() + 60 * 60000),
        jobName: 'main-pipeline',
        buildNumber: 124,
        duration: 240000, // 4 minutes
        status: 'FAILURE',
        testResults: {
          total: 150,
          passed: 140,
          failed: 10,
          skipped: 0
        },
        codeCoverage: 82.3
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

  private async fetchBuildEvents(
    request: DataFetchRequest, 
    timeRange: TimeRange, 
    filters?: Record<string, any>
  ): Promise<DataFetchResponse> {
    // Mock Jenkins build events data
    const mockEvents = [
      {
        timestamp: new Date(timeRange.start.getTime() + 0 * 60000),
        eventType: 'BUILD_STARTED',
        jobName: 'main-pipeline',
        buildNumber: 123,
        triggeredBy: 'user@example.com',
        branch: 'main',
        commit: 'abc123def456'
      },
      {
        timestamp: new Date(timeRange.start.getTime() + 3 * 60000),
        eventType: 'BUILD_COMPLETED',
        jobName: 'main-pipeline',
        buildNumber: 123,
        status: 'SUCCESS',
        duration: 180000,
        url: 'http://jenkins.example.com/job/main-pipeline/123/'
      },
      {
        timestamp: new Date(timeRange.start.getTime() + 30 * 60000),
        eventType: 'BUILD_STARTED',
        jobName: 'deploy-staging',
        buildNumber: 45,
        triggeredBy: 'main-pipeline',
        branch: 'staging',
        commit: 'def456ghi789'
      },
      {
        timestamp: new Date(timeRange.start.getTime() + 32 * 60000),
        eventType: 'BUILD_COMPLETED',
        jobName: 'deploy-staging',
        buildNumber: 45,
        status: 'SUCCESS',
        duration: 120000,
        url: 'http://jenkins.example.com/job/deploy-staging/45/'
      }
    ]

    return {
      success: true,
      data: mockEvents,
      metadata: {
        totalCount: mockEvents.length,
        hasMore: false,
        fetchedAt: new Date(),
        timeRange
      }
    }
  }

  private async fetchBuildLogs(
    request: DataFetchRequest, 
    timeRange: TimeRange, 
    filters?: Record<string, any>
  ): Promise<DataFetchResponse> {
    // Mock Jenkins build logs data
    const mockLogs = [
      {
        timestamp: new Date(timeRange.start.getTime() + 0 * 60000),
        jobName: 'main-pipeline',
        buildNumber: 123,
        stage: 'Build',
        level: 'INFO',
        message: 'Starting build process...',
        logEntry: '[INFO] Starting build process...'
      },
      {
        timestamp: new Date(timeRange.start.getTime() + 1 * 60000),
        jobName: 'main-pipeline',
        buildNumber: 123,
        stage: 'Test',
        level: 'INFO',
        message: 'Running unit tests...',
        logEntry: '[INFO] Running unit tests...'
      },
      {
        timestamp: new Date(timeRange.start.getTime() + 2 * 60000),
        jobName: 'main-pipeline',
        buildNumber: 123,
        stage: 'Test',
        level: 'WARN',
        message: '2 tests failed',
        logEntry: '[WARN] 2 tests failed: testUserLogin, testDataValidation'
      },
      {
        timestamp: new Date(timeRange.start.getTime() + 3 * 60000),
        jobName: 'main-pipeline',
        buildNumber: 123,
        stage: 'Deploy',
        level: 'INFO',
        message: 'Deployment completed successfully',
        logEntry: '[INFO] Deployment completed successfully'
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

  private renderChart(dataType: DataType, data: any[], options?: any): RenderResponse {
    const chartType = options?.chartType || 'line'
    
    return {
      success: true,
      component: 'JenkinsChart',
      props: {
        data,
        chartType,
        dataType,
        title: `Jenkins ${dataType} Chart`,
        xAxisKey: 'timestamp',
        yAxisKey: dataType === DataType.METRICS ? 'duration' : 'buildNumber',
        colorScheme: 'jenkins'
      }
    }
  }

  private renderTable(dataType: DataType, data: any[], options?: any): RenderResponse {
    const columns = options?.columns || this.getDefaultColumns(dataType)
    
    return {
      success: true,
      component: 'JenkinsTable',
      props: {
        data,
        columns,
        dataType,
        title: `Jenkins ${dataType} Data`,
        sortable: true,
        filterable: true,
        showJobStatus: true
      }
    }
  }

  private renderCard(dataType: DataType, data: any[], options?: any): RenderResponse {
    const latestData = data[data.length - 1]
    
    return {
      success: true,
      component: 'JenkinsCard',
      props: {
        title: `Latest ${dataType}`,
        value: latestData?.status || latestData?.eventType || 'N/A',
        subtitle: latestData?.jobName || '',
        duration: latestData?.duration ? this.formatDuration(latestData.duration) : '',
        status: this.getStatusColor(latestData),
        icon: 'jenkins-icon',
        buildNumber: latestData?.buildNumber
      }
    }
  }

  private renderAlert(dataType: DataType, data: any[], options?: any): RenderResponse {
    const failures = data.filter(item => item.status === 'FAILURE')
    
    return {
      success: true,
      component: 'JenkinsAlert',
      props: {
        alerts: failures,
        title: `Jenkins Build Failures`,
        severity: failures.length > 0 ? 'error' : 'success',
        showDetails: true
      }
    }
  }

  private getDefaultColumns(dataType: DataType): string[] {
    switch (dataType) {
      case DataType.METRICS:
        return ['timestamp', 'jobName', 'buildNumber', 'status', 'duration', 'testResults']
      case DataType.EVENTS:
        return ['timestamp', 'eventType', 'jobName', 'buildNumber', 'triggeredBy', 'status']
      case DataType.LOGS:
        return ['timestamp', 'jobName', 'buildNumber', 'stage', 'level', 'message']
      default:
        return []
    }
  }

  private formatDuration(milliseconds: number): string {
    const minutes = Math.floor(milliseconds / 60000)
    const seconds = Math.floor((milliseconds % 60000) / 1000)
    return `${minutes}m ${seconds}s`
  }

  private getStatusColor(data: any): 'success' | 'warning' | 'error' {
    if (data?.status === 'FAILURE') return 'error'
    if (data?.status === 'UNSTABLE') return 'warning'
    if (data?.status === 'SUCCESS') return 'success'
    if (data?.level === 'WARN') return 'warning'
    if (data?.level === 'ERROR') return 'error'
    return 'success'
  }

  // Lifecycle methods
  async onInstall(config: PluginConfiguration): Promise<void> {
    console.log(`Jenkins plugin installed for instance: ${config.instanceId}`)
  }

  async onUninstall(config: PluginConfiguration): Promise<void> {
    console.log(`Jenkins plugin uninstalled for instance: ${config.instanceId}`)
  }

  async onEnable(config: PluginConfiguration): Promise<void> {
    console.log(`Jenkins plugin enabled for instance: ${config.instanceId}`)
  }

  async onDisable(config: PluginConfiguration): Promise<void> {
    console.log(`Jenkins plugin disabled for instance: ${config.instanceId}`)
  }

  async onConfigurationChange(config: PluginConfiguration): Promise<void> {
    console.log(`Jenkins plugin configuration updated for instance: ${config.instanceId}`)
  }

  async healthCheck(config: PluginConfiguration): Promise<boolean> {
    // Mock health check - in real implementation, this would test Jenkins API connectivity
    return true
  }

  async testConnection(config: PluginConfiguration): Promise<boolean> {
    // Mock connection test - in real implementation, this would validate Jenkins credentials
    return true
  }
}
