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

// GitHub Actions Plugin
export class GitHubActionsPlugin implements Plugin {
  metadata: PluginMetadata = {
    id: 'github-actions',
    name: 'GitHub Actions',
    version: '1.0.0',
    description: 'Monitor GitHub Actions workflows, runs, and deployments',
    author: 'DevOps Monitoring Team',
    category: PluginCategory.CI_CD,
    icon: 'github-actions-icon',
    tags: ['github', 'actions', 'workflows', 'ci-cd', 'deployments'],
    supportedDataTypes: [DataType.METRICS, DataType.EVENTS, DataType.LOGS],
    configurationSchema: {
      type: 'object',
      properties: {
        repository: {
          type: 'string',
          description: 'GitHub repository (owner/repo)',
          pattern: '^[a-zA-Z0-9._-]+/[a-zA-Z0-9._-]+$',
          default: 'owner/repository'
        },
        personalAccessToken: {
          type: 'string',
          description: 'GitHub Personal Access Token',
          minLength: 1
        },
        workflowNames: {
          type: 'array',
          description: 'List of workflow names to monitor',
          items: {
            type: 'string',
            description: 'Workflow name'
          },
          default: ['CI', 'Deploy', 'Test']
        },
        includeWorkflowLogs: {
          type: 'boolean',
          description: 'Include workflow logs in data fetch',
          default: true
        },
        includeDeployments: {
          type: 'boolean',
          description: 'Include deployment data',
          default: true
        },
        refreshInterval: {
          type: 'number',
          description: 'Data refresh interval in seconds',
          minimum: 30,
          maximum: 3600,
          default: 120
        }
      },
      required: ['repository', 'personalAccessToken']
    }
  }

  async fetchData(request: DataFetchRequest): Promise<DataFetchResponse> {
    const { dataType, timeRange, filters } = request
    
    try {
      switch (dataType) {
        case DataType.METRICS:
          return await this.fetchWorkflowMetrics(request, timeRange, filters)
        case DataType.EVENTS:
          return await this.fetchWorkflowEvents(request, timeRange, filters)
        case DataType.LOGS:
          return await this.fetchWorkflowLogs(request, timeRange, filters)
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

  private async fetchWorkflowMetrics(
    request: DataFetchRequest, 
    timeRange: TimeRange, 
    filters?: Record<string, any>
  ): Promise<DataFetchResponse> {
    // Mock GitHub Actions workflow metrics data
    const mockMetrics = [
      {
        timestamp: new Date(timeRange.start.getTime() + 0 * 60000),
        workflowName: 'CI',
        runId: 1234567890,
        runNumber: 42,
        status: 'completed',
        conclusion: 'success',
        duration: 300000, // 5 minutes
        jobs: [
          {
            name: 'test',
            status: 'completed',
            conclusion: 'success',
            duration: 120000
          },
          {
            name: 'build',
            status: 'completed',
            conclusion: 'success',
            duration: 180000
          }
        ],
        trigger: {
          type: 'push',
          branch: 'main',
          commit: 'abc123def456',
          author: 'developer@example.com'
        }
      },
      {
        timestamp: new Date(timeRange.start.getTime() + 30 * 60000),
        workflowName: 'Deploy',
        runId: 1234567891,
        runNumber: 43,
        status: 'completed',
        conclusion: 'success',
        duration: 600000, // 10 minutes
        jobs: [
          {
            name: 'deploy-staging',
            status: 'completed',
            conclusion: 'success',
            duration: 300000
          },
          {
            name: 'deploy-production',
            status: 'completed',
            conclusion: 'success',
            duration: 300000
          }
        ],
        trigger: {
          type: 'workflow_dispatch',
          branch: 'main',
          commit: 'def456ghi789',
          author: 'admin@example.com'
        }
      },
      {
        timestamp: new Date(timeRange.start.getTime() + 60 * 60000),
        workflowName: 'Test',
        runId: 1234567892,
        runNumber: 44,
        status: 'completed',
        conclusion: 'failure',
        duration: 240000, // 4 minutes
        jobs: [
          {
            name: 'unit-tests',
            status: 'completed',
            conclusion: 'failure',
            duration: 120000
          },
          {
            name: 'integration-tests',
            status: 'completed',
            conclusion: 'failure',
            duration: 120000
          }
        ],
        trigger: {
          type: 'pull_request',
          branch: 'feature/new-feature',
          commit: 'ghi789jkl012',
          author: 'developer@example.com'
        }
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

  private async fetchWorkflowEvents(
    request: DataFetchRequest, 
    timeRange: TimeRange, 
    filters?: Record<string, any>
  ): Promise<DataFetchResponse> {
    // Mock GitHub Actions workflow events data
    const mockEvents = [
      {
        timestamp: new Date(timeRange.start.getTime() + 0 * 60000),
        eventType: 'workflow_run_started',
        workflowName: 'CI',
        runId: 1234567890,
        runNumber: 42,
        actor: 'developer@example.com',
        repository: 'owner/repository',
        branch: 'main',
        commit: 'abc123def456'
      },
      {
        timestamp: new Date(timeRange.start.getTime() + 5 * 60000),
        eventType: 'workflow_run_completed',
        workflowName: 'CI',
        runId: 1234567890,
        runNumber: 42,
        conclusion: 'success',
        duration: 300000,
        repository: 'owner/repository',
        branch: 'main',
        commit: 'abc123def456'
      },
      {
        timestamp: new Date(timeRange.start.getTime() + 30 * 60000),
        eventType: 'workflow_run_started',
        workflowName: 'Deploy',
        runId: 1234567891,
        runNumber: 43,
        actor: 'admin@example.com',
        repository: 'owner/repository',
        branch: 'main',
        commit: 'def456ghi789'
      },
      {
        timestamp: new Date(timeRange.start.getTime() + 40 * 60000),
        eventType: 'deployment_created',
        workflowName: 'Deploy',
        runId: 1234567891,
        runNumber: 43,
        environment: 'staging',
        deploymentId: 789012345,
        repository: 'owner/repository',
        branch: 'main',
        commit: 'def456ghi789'
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

  private async fetchWorkflowLogs(
    request: DataFetchRequest, 
    timeRange: TimeRange, 
    filters?: Record<string, any>
  ): Promise<DataFetchResponse> {
    // Mock GitHub Actions workflow logs data
    const mockLogs = [
      {
        timestamp: new Date(timeRange.start.getTime() + 0 * 60000),
        workflowName: 'CI',
        runId: 1234567890,
        runNumber: 42,
        jobName: 'test',
        stepName: 'Run tests',
        level: 'INFO',
        message: 'Starting test suite...',
        logEntry: 'Starting test suite...'
      },
      {
        timestamp: new Date(timeRange.start.getTime() + 1 * 60000),
        workflowName: 'CI',
        runId: 1234567890,
        runNumber: 42,
        jobName: 'test',
        stepName: 'Run tests',
        level: 'INFO',
        message: 'Running 150 tests...',
        logEntry: 'Running 150 tests...'
      },
      {
        timestamp: new Date(timeRange.start.getTime() + 2 * 60000),
        workflowName: 'CI',
        runId: 1234567890,
        runNumber: 42,
        jobName: 'test',
        stepName: 'Run tests',
        level: 'WARN',
        message: '2 tests failed',
        logEntry: 'FAIL testUserLogin (0.5s)\nFAIL testDataValidation (0.3s)'
      },
      {
        timestamp: new Date(timeRange.start.getTime() + 3 * 60000),
        workflowName: 'CI',
        runId: 1234567890,
        runNumber: 42,
        jobName: 'build',
        stepName: 'Build application',
        level: 'INFO',
        message: 'Build completed successfully',
        logEntry: 'Build completed successfully'
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
      component: 'GitHubActionsChart',
      props: {
        data,
        chartType,
        dataType,
        title: `GitHub Actions ${dataType} Chart`,
        xAxisKey: 'timestamp',
        yAxisKey: dataType === DataType.METRICS ? 'duration' : 'runNumber',
        colorScheme: 'github'
      }
    }
  }

  private renderTable(dataType: DataType, data: any[], options?: any): RenderResponse {
    const columns = options?.columns || this.getDefaultColumns(dataType)
    
    return {
      success: true,
      component: 'GitHubActionsTable',
      props: {
        data,
        columns,
        dataType,
        title: `GitHub Actions ${dataType} Data`,
        sortable: true,
        filterable: true,
        showWorkflowStatus: true
      }
    }
  }

  private renderCard(dataType: DataType, data: any[], options?: any): RenderResponse {
    const latestData = data[data.length - 1]
    
    return {
      success: true,
      component: 'GitHubActionsCard',
      props: {
        title: `Latest ${dataType}`,
        value: latestData?.conclusion || latestData?.eventType || 'N/A',
        subtitle: latestData?.workflowName || '',
        duration: latestData?.duration ? this.formatDuration(latestData.duration) : '',
        status: this.getStatusColor(latestData),
        icon: 'github-actions-icon',
        runNumber: latestData?.runNumber,
        branch: latestData?.branch
      }
    }
  }

  private renderAlert(dataType: DataType, data: any[], options?: any): RenderResponse {
    const failures = data.filter(item => item.conclusion === 'failure')
    
    return {
      success: true,
      component: 'GitHubActionsAlert',
      props: {
        alerts: failures,
        title: `GitHub Actions Workflow Failures`,
        severity: failures.length > 0 ? 'error' : 'success',
        showDetails: true
      }
    }
  }

  private getDefaultColumns(dataType: DataType): string[] {
    switch (dataType) {
      case DataType.METRICS:
        return ['timestamp', 'workflowName', 'runNumber', 'status', 'conclusion', 'duration', 'trigger']
      case DataType.EVENTS:
        return ['timestamp', 'eventType', 'workflowName', 'runNumber', 'actor', 'repository', 'branch']
      case DataType.LOGS:
        return ['timestamp', 'workflowName', 'runNumber', 'jobName', 'stepName', 'level', 'message']
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
    if (data?.conclusion === 'failure') return 'error'
    if (data?.conclusion === 'cancelled') return 'warning'
    if (data?.conclusion === 'success') return 'success'
    if (data?.level === 'WARN') return 'warning'
    if (data?.level === 'ERROR') return 'error'
    return 'success'
  }

  // Lifecycle methods
  async onInstall(config: PluginConfiguration): Promise<void> {
    console.log(`GitHub Actions plugin installed for instance: ${config.instanceId}`)
  }

  async onUninstall(config: PluginConfiguration): Promise<void> {
    console.log(`GitHub Actions plugin uninstalled for instance: ${config.instanceId}`)
  }

  async onEnable(config: PluginConfiguration): Promise<void> {
    console.log(`GitHub Actions plugin enabled for instance: ${config.instanceId}`)
  }

  async onDisable(config: PluginConfiguration): Promise<void> {
    console.log(`GitHub Actions plugin disabled for instance: ${config.instanceId}`)
  }

  async onConfigurationChange(config: PluginConfiguration): Promise<void> {
    console.log(`GitHub Actions plugin configuration updated for instance: ${config.instanceId}`)
  }

  async healthCheck(config: PluginConfiguration): Promise<boolean> {
    // Mock health check - in real implementation, this would test GitHub API connectivity
    return true
  }

  async testConnection(config: PluginConfiguration): Promise<boolean> {
    // Mock connection test - in real implementation, this would validate GitHub token and repository access
    return true
  }
}
