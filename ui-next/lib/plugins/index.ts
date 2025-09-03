// Plugin System Exports
export * from './types'
export * from './registry'
export * from './manager'

// Plugin implementations
export { AWSCloudWatchPlugin } from './aws-cloudwatch'
export { JenkinsPlugin } from './jenkins'
export { GitHubActionsPlugin } from './github-actions'

// Plugin factory function
import { Plugin } from './types'
import { AWSCloudWatchPlugin } from './aws-cloudwatch'
import { JenkinsPlugin } from './jenkins'
import { GitHubActionsPlugin } from './github-actions'

export function createPlugin(pluginId: string): Plugin | null {
  switch (pluginId) {
    case 'aws-cloudwatch':
      return new AWSCloudWatchPlugin()
    case 'jenkins':
      return new JenkinsPlugin()
    case 'github-actions':
      return new GitHubActionsPlugin()
    default:
      console.warn(`Unknown plugin ID: ${pluginId}`)
      return null
  }
}

// Default plugin manager instance
import { DefaultPluginManager } from './manager'

let pluginManagerInstance: DefaultPluginManager | null = null

export function getPluginManager(): DefaultPluginManager {
  if (!pluginManagerInstance) {
    pluginManagerInstance = new DefaultPluginManager()
    
    // Register default plugins
    pluginManagerInstance.registry.register(new AWSCloudWatchPlugin())
    pluginManagerInstance.registry.register(new JenkinsPlugin())
    pluginManagerInstance.registry.register(new GitHubActionsPlugin())
  }
  
  return pluginManagerInstance
}
