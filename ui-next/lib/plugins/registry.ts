import { Plugin, PluginRegistry, PluginCategory, DataType } from './types'

export class DefaultPluginRegistry implements PluginRegistry {
  private plugins: Map<string, Plugin> = new Map()

  register(plugin: Plugin): void {
    if (this.plugins.has(plugin.metadata.id)) {
      throw new Error(`Plugin with ID '${plugin.metadata.id}' is already registered`)
    }
    
    this.plugins.set(plugin.metadata.id, plugin)
    console.log(`Plugin '${plugin.metadata.name}' (${plugin.metadata.id}) registered successfully`)
  }

  unregister(pluginId: string): void {
    const plugin = this.plugins.get(pluginId)
    if (!plugin) {
      throw new Error(`Plugin with ID '${pluginId}' is not registered`)
    }
    
    this.plugins.delete(pluginId)
    console.log(`Plugin '${plugin.metadata.name}' (${pluginId}) unregistered successfully`)
  }

  getPlugin(pluginId: string): Plugin | undefined {
    return this.plugins.get(pluginId)
  }

  getAllPlugins(): Plugin[] {
    return Array.from(this.plugins.values())
  }

  getPluginsByCategory(category: PluginCategory): Plugin[] {
    return this.getAllPlugins().filter(plugin => 
      plugin.metadata.category === category
    )
  }

  getPluginsByDataType(dataType: DataType): Plugin[] {
    return this.getAllPlugins().filter(plugin => 
      plugin.metadata.supportedDataTypes.includes(dataType)
    )
  }

  getPluginCount(): number {
    return this.plugins.size
  }

  isRegistered(pluginId: string): boolean {
    return this.plugins.has(pluginId)
  }
}
