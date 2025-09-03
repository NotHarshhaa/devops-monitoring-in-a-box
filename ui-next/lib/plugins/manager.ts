import { 
  PluginManager, 
  PluginRegistry, 
  PluginConfiguration, 
  DataFetchRequest, 
  DataFetchResponse, 
  RenderRequest, 
  RenderResponse,
  Plugin
} from './types'
import { DefaultPluginRegistry } from './registry'

export class DefaultPluginManager implements PluginManager {
  public registry: PluginRegistry
  private pluginInstances: Map<string, PluginConfiguration[]> = new Map()

  constructor(registry?: PluginRegistry) {
    this.registry = registry || new DefaultPluginRegistry()
  }

  async installPlugin(pluginId: string, config: PluginConfiguration): Promise<void> {
    const plugin = this.registry.getPlugin(pluginId)
    if (!plugin) {
      throw new Error(`Plugin '${pluginId}' is not registered`)
    }

    // Validate configuration against schema
    this.validateConfiguration(plugin, config)

    // Store plugin instance
    if (!this.pluginInstances.has(pluginId)) {
      this.pluginInstances.set(pluginId, [])
    }
    
    const instances = this.pluginInstances.get(pluginId)!
    instances.push(config)

    // Call plugin lifecycle method
    if (plugin.onInstall) {
      await plugin.onInstall(config)
    }

    console.log(`Plugin '${pluginId}' instance '${config.instanceId}' installed successfully`)
  }

  async uninstallPlugin(pluginId: string, instanceId: string): Promise<void> {
    const plugin = this.registry.getPlugin(pluginId)
    if (!plugin) {
      throw new Error(`Plugin '${pluginId}' is not registered`)
    }

    const instances = this.pluginInstances.get(pluginId)
    if (!instances) {
      throw new Error(`No instances found for plugin '${pluginId}'`)
    }

    const instanceIndex = instances.findIndex(instance => instance.instanceId === instanceId)
    if (instanceIndex === -1) {
      throw new Error(`Instance '${instanceId}' not found for plugin '${pluginId}'`)
    }

    const config = instances[instanceIndex]

    // Call plugin lifecycle method
    if (plugin.onUninstall) {
      await plugin.onUninstall(config)
    }

    // Remove instance
    instances.splice(instanceIndex, 1)
    if (instances.length === 0) {
      this.pluginInstances.delete(pluginId)
    }

    console.log(`Plugin '${pluginId}' instance '${instanceId}' uninstalled successfully`)
  }

  async enablePlugin(pluginId: string, instanceId: string): Promise<void> {
    const config = this.getPluginInstance(pluginId, instanceId)
    const plugin = this.registry.getPlugin(pluginId)
    
    if (!plugin) {
      throw new Error(`Plugin '${pluginId}' is not registered`)
    }

    config.enabled = true
    config.lastUpdated = new Date()

    // Call plugin lifecycle method
    if (plugin.onEnable) {
      await plugin.onEnable(config)
    }

    console.log(`Plugin '${pluginId}' instance '${instanceId}' enabled`)
  }

  async disablePlugin(pluginId: string, instanceId: string): Promise<void> {
    const config = this.getPluginInstance(pluginId, instanceId)
    const plugin = this.registry.getPlugin(pluginId)
    
    if (!plugin) {
      throw new Error(`Plugin '${pluginId}' is not registered`)
    }

    config.enabled = false
    config.lastUpdated = new Date()

    // Call plugin lifecycle method
    if (plugin.onDisable) {
      await plugin.onDisable(config)
    }

    console.log(`Plugin '${pluginId}' instance '${instanceId}' disabled`)
  }

  async updatePluginConfiguration(
    pluginId: string, 
    instanceId: string, 
    updates: Partial<PluginConfiguration>
  ): Promise<void> {
    const config = this.getPluginInstance(pluginId, instanceId)
    const plugin = this.registry.getPlugin(pluginId)
    
    if (!plugin) {
      throw new Error(`Plugin '${pluginId}' is not registered`)
    }

    // Merge updates
    const updatedConfig = { ...config, ...updates, lastUpdated: new Date() }

    // Validate updated configuration
    this.validateConfiguration(plugin, updatedConfig)

    // Update stored configuration
    const instances = this.pluginInstances.get(pluginId)!
    const instanceIndex = instances.findIndex(instance => instance.instanceId === instanceId)
    instances[instanceIndex] = updatedConfig

    // Call plugin lifecycle method
    if (plugin.onConfigurationChange) {
      await plugin.onConfigurationChange(updatedConfig)
    }

    console.log(`Plugin '${pluginId}' instance '${instanceId}' configuration updated`)
  }

  getPluginInstances(pluginId?: string): PluginConfiguration[] {
    if (pluginId) {
      return this.pluginInstances.get(pluginId) || []
    }

    const allInstances: PluginConfiguration[] = []
    this.pluginInstances.forEach(instances => {
      allInstances.push(...instances)
    })
    return allInstances
  }

  async fetchDataFromPlugin(request: DataFetchRequest): Promise<DataFetchResponse> {
    const plugin = this.registry.getPlugin(request.pluginId)
    if (!plugin) {
      throw new Error(`Plugin '${request.pluginId}' is not registered`)
    }

    const config = this.getPluginInstance(request.pluginId, request.instanceId)
    if (!config.enabled) {
      throw new Error(`Plugin instance '${request.instanceId}' is disabled`)
    }

    try {
      return await plugin.fetchData(request)
    } catch (error) {
      console.error(`Error fetching data from plugin '${request.pluginId}':`, error)
      return {
        success: false,
        data: [],
        metadata: {
          totalCount: 0,
          hasMore: false,
          fetchedAt: new Date(),
          timeRange: request.timeRange
        },
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  async renderDataFromPlugin(request: RenderRequest): Promise<RenderResponse> {
    const plugin = this.registry.getPlugin(request.pluginId)
    if (!plugin) {
      throw new Error(`Plugin '${request.pluginId}' is not registered`)
    }

    const config = this.getPluginInstance(request.pluginId, request.instanceId)
    if (!config.enabled) {
      throw new Error(`Plugin instance '${request.instanceId}' is disabled`)
    }

    try {
      return await plugin.renderData(request)
    } catch (error) {
      console.error(`Error rendering data from plugin '${request.pluginId}':`, error)
      return {
        success: false,
        component: 'ErrorComponent',
        props: { error: error instanceof Error ? error.message : 'Unknown error' },
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  private getPluginInstance(pluginId: string, instanceId: string): PluginConfiguration {
    const instances = this.pluginInstances.get(pluginId)
    if (!instances) {
      throw new Error(`No instances found for plugin '${pluginId}'`)
    }

    const instance = instances.find(instance => instance.instanceId === instanceId)
    if (!instance) {
      throw new Error(`Instance '${instanceId}' not found for plugin '${pluginId}'`)
    }

    return instance
  }

  private validateConfiguration(plugin: Plugin, config: PluginConfiguration): void {
    const schema = plugin.metadata.configurationSchema
    
    // Check required fields
    for (const requiredField of schema.required) {
      if (!(requiredField in config.config)) {
        throw new Error(`Required configuration field '${requiredField}' is missing`)
      }
    }

    // Validate field types and constraints
    for (const [fieldName, fieldSchema] of Object.entries(schema.properties)) {
      const value = config.config[fieldName]
      
      if (value === undefined) {
        continue // Optional field
      }

      this.validateField(fieldName, value, fieldSchema)
    }
  }

  private validateField(fieldName: string, value: any, schema: any): void {
    // Type validation
    if (schema.type === 'string' && typeof value !== 'string') {
      throw new Error(`Field '${fieldName}' must be a string`)
    }
    if (schema.type === 'number' && typeof value !== 'number') {
      throw new Error(`Field '${fieldName}' must be a number`)
    }
    if (schema.type === 'boolean' && typeof value !== 'boolean') {
      throw new Error(`Field '${fieldName}' must be a boolean`)
    }

    // String constraints
    if (schema.type === 'string') {
      if (schema.minLength && value.length < schema.minLength) {
        throw new Error(`Field '${fieldName}' must be at least ${schema.minLength} characters`)
      }
      if (schema.maxLength && value.length > schema.maxLength) {
        throw new Error(`Field '${fieldName}' must be at most ${schema.maxLength} characters`)
      }
    }

    // Number constraints
    if (schema.type === 'number') {
      if (schema.minimum !== undefined && value < schema.minimum) {
        throw new Error(`Field '${fieldName}' must be at least ${schema.minimum}`)
      }
      if (schema.maximum !== undefined && value > schema.maximum) {
        throw new Error(`Field '${fieldName}' must be at most ${schema.maximum}`)
      }
    }

    // Enum validation
    if (schema.enum && !schema.enum.includes(value)) {
      throw new Error(`Field '${fieldName}' must be one of: ${schema.enum.join(', ')}`)
    }
  }
}
