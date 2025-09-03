// Plugin System Types and Interfaces

export interface PluginMetadata {
  id: string
  name: string
  version: string
  description: string
  author: string
  category: PluginCategory
  icon?: string
  tags: string[]
  supportedDataTypes: DataType[]
  configurationSchema: ConfigurationSchema
}

export enum PluginCategory {
  CLOUD_PROVIDER = 'cloud_provider',
  CI_CD = 'ci_cd',
  MONITORING = 'monitoring',
  LOGGING = 'logging',
  ALERTING = 'alerting',
  INFRASTRUCTURE = 'infrastructure'
}

export enum DataType {
  METRICS = 'metrics',
  LOGS = 'logs',
  ALERTS = 'alerts',
  EVENTS = 'events',
  TRACES = 'traces'
}

export interface ConfigurationSchema {
  type: 'object'
  properties: Record<string, ConfigurationProperty>
  required: string[]
}

export interface ConfigurationProperty {
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

export interface PluginConfiguration {
  pluginId: string
  instanceId: string
  name: string
  enabled: boolean
  config: Record<string, any>
  credentials?: Record<string, any>
  lastUpdated: Date
}

// Data fetching interfaces
export interface DataFetchRequest {
  pluginId: string
  instanceId: string
  dataType: DataType
  timeRange: TimeRange
  filters?: Record<string, any>
  aggregation?: AggregationConfig
}

export interface TimeRange {
  start: Date
  end: Date
  granularity?: '1m' | '5m' | '15m' | '1h' | '1d'
}

export interface AggregationConfig {
  method: 'sum' | 'avg' | 'min' | 'max' | 'count'
  groupBy?: string[]
  interval?: string
}

export interface DataFetchResponse<T = any> {
  success: boolean
  data: T[]
  metadata: {
    totalCount: number
    hasMore: boolean
    nextCursor?: string
    fetchedAt: Date
    timeRange: TimeRange
  }
  error?: string
}

// Data rendering interfaces
export interface RenderRequest {
  pluginId: string
  instanceId: string
  dataType: DataType
  data: any[]
  renderType: RenderType
  options?: RenderOptions
}

export enum RenderType {
  CHART = 'chart',
  TABLE = 'table',
  CARD = 'card',
  ALERT = 'alert',
  LOG_ENTRY = 'log_entry',
  CUSTOM = 'custom'
}

export interface RenderOptions {
  chartType?: 'line' | 'bar' | 'pie' | 'area' | 'scatter'
  columns?: string[]
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  limit?: number
  customComponent?: string
}

export interface RenderResponse {
  success: boolean
  component: string // React component name or HTML
  props?: Record<string, any>
  error?: string
}

// Plugin lifecycle interfaces
export interface PluginLifecycle {
  onInstall?(config: PluginConfiguration): Promise<void>
  onUninstall?(config: PluginConfiguration): Promise<void>
  onEnable?(config: PluginConfiguration): Promise<void>
  onDisable?(config: PluginConfiguration): Promise<void>
  onConfigurationChange?(config: PluginConfiguration): Promise<void>
}

// Main plugin interface
export interface Plugin extends PluginLifecycle {
  metadata: PluginMetadata
  
  // Data fetching
  fetchData(request: DataFetchRequest): Promise<DataFetchResponse>
  
  // Data rendering
  renderData(request: RenderRequest): Promise<RenderResponse>
  
  // Health check
  healthCheck?(config: PluginConfiguration): Promise<boolean>
  
  // Test connection
  testConnection?(config: PluginConfiguration): Promise<boolean>
}

// Plugin registry interface
export interface PluginRegistry {
  register(plugin: Plugin): void
  unregister(pluginId: string): void
  getPlugin(pluginId: string): Plugin | undefined
  getAllPlugins(): Plugin[]
  getPluginsByCategory(category: PluginCategory): Plugin[]
  getPluginsByDataType(dataType: DataType): Plugin[]
}

// Plugin manager interface
export interface PluginManager {
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
