"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Plug, 
  Settings, 
  Play, 
  Pause, 
  Trash2, 
  Plus, 
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  Cloud,
  GitBranch,
  Github,
  Loader2
} from 'lucide-react'
import { 
  PluginManager, 
  PluginConfiguration, 
  PluginCategory, 
  DataType,
  getPluginManager,
  Plugin as PluginInterface
} from '@/lib/plugins'

export default function PluginManagerComponent() {
  const [pluginManager] = useState<PluginManager>(getPluginManager())
  const [availablePlugins, setAvailablePlugins] = useState<PluginInterface[]>([])
  const [installedPlugins, setInstalledPlugins] = useState<PluginConfiguration[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<PluginCategory | 'all'>('all')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadPlugins()
  }, [])

  const loadPlugins = async () => {
    setIsLoading(true)
    try {
      const plugins = pluginManager.registry.getAllPlugins()
      const instances = pluginManager.getPluginInstances()
      
      setAvailablePlugins(plugins)
      setInstalledPlugins(instances)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load plugins')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInstallPlugin = async (pluginId: string) => {
    setIsLoading(true)
    try {
      const plugin = pluginManager.registry.getPlugin(pluginId)
      if (!plugin) {
        throw new Error(`Plugin ${pluginId} not found`)
      }

      const config: PluginConfiguration = {
        pluginId,
        instanceId: `${pluginId}-${Date.now()}`,
        name: `${plugin.metadata.name} Instance`,
        enabled: true,
        config: getDefaultConfig(plugin),
        lastUpdated: new Date()
      }

      await pluginManager.installPlugin(pluginId, config)
      await loadPlugins()
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to install plugin')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUninstallPlugin = async (pluginId: string, instanceId: string) => {
    setIsLoading(true)
    try {
      await pluginManager.uninstallPlugin(pluginId, instanceId)
      await loadPlugins()
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to uninstall plugin')
    } finally {
      setIsLoading(false)
    }
  }

  const handleTogglePlugin = async (pluginId: string, instanceId: string, enabled: boolean) => {
    setIsLoading(true)
    try {
      if (enabled) {
        await pluginManager.enablePlugin(pluginId, instanceId)
      } else {
        await pluginManager.disablePlugin(pluginId, instanceId)
      }
      await loadPlugins()
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle plugin')
    } finally {
      setIsLoading(false)
    }
  }

  const getDefaultConfig = (plugin: PluginInterface): Record<string, any> => {
    const config: Record<string, any> = {}
    const schema = plugin.metadata.configurationSchema
    
    for (const [key, property] of Object.entries(schema.properties)) {
      if (property.default !== undefined) {
        config[key] = property.default
      }
    }
    
    return config
  }

  const getPluginIcon = (category: PluginCategory) => {
    switch (category) {
      case PluginCategory.CLOUD_PROVIDER:
        return <Cloud className="h-5 w-5" />
      case PluginCategory.CI_CD:
        return <GitBranch className="h-5 w-5" />
      case PluginCategory.MONITORING:
        return <Settings className="h-5 w-5" />
      default:
        return <Plug className="h-5 w-5" />
    }
  }

  const getCategoryColor = (category: PluginCategory) => {
    switch (category) {
      case PluginCategory.CLOUD_PROVIDER:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case PluginCategory.CI_CD:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case PluginCategory.MONITORING:
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case PluginCategory.LOGGING:
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case PluginCategory.ALERTING:
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case PluginCategory.INFRASTRUCTURE:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const filteredPlugins = availablePlugins.filter(plugin => {
    const matchesSearch = plugin.metadata.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plugin.metadata.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plugin.metadata.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || plugin.metadata.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const getInstalledCount = (pluginId: string) => {
    return installedPlugins.filter(instance => instance.pluginId === pluginId).length
  }

  if (isLoading && availablePlugins.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading plugins...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold">Plugin Manager</h1>
          <p className="text-muted-foreground mt-2">
            Install and manage data source plugins for your monitoring dashboard
          </p>
        </motion.div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Plugins</CardTitle>
            <Plug className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availablePlugins.length}</div>
            <p className="text-xs text-muted-foreground">
              Total plugins in registry
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Installed Instances</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{installedPlugins.length}</div>
            <p className="text-xs text-muted-foreground">
              Active plugin instances
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enabled</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {installedPlugins.filter(p => p.enabled).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(availablePlugins.map(p => p.metadata.category)).size}
            </div>
            <p className="text-xs text-muted-foreground">
              Different categories
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Plugin Management Tabs */}
      <Tabs defaultValue="available" className="space-y-4">
        <TabsList>
          <TabsTrigger value="available">Available Plugins</TabsTrigger>
          <TabsTrigger value="installed">Installed Instances</TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-4">
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search plugins..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('all')}
              >
                All
              </Button>
              {Object.values(PluginCategory).map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category.replace('_', ' ')}
                </Button>
              ))}
            </div>
          </div>

          {/* Available Plugins Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlugins.map((plugin) => (
              <motion.div
                key={plugin.metadata.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          {getPluginIcon(plugin.metadata.category)}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{plugin.metadata.name}</CardTitle>
                          <CardDescription className="text-sm">
                            v{plugin.metadata.version}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge className={getCategoryColor(plugin.metadata.category)}>
                        {plugin.metadata.category.replace('_', ' ')}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      {plugin.metadata.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-1">
                      {plugin.metadata.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {plugin.metadata.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{plugin.metadata.tags.length - 3}
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm font-medium">Supported Data Types:</div>
                      <div className="flex flex-wrap gap-1">
                        {plugin.metadata.supportedDataTypes.map(dataType => (
                          <Badge key={dataType} variant="outline" className="text-xs">
                            {dataType}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="text-sm text-muted-foreground">
                        {getInstalledCount(plugin.metadata.id)} installed
                      </div>
                      <Button
                        onClick={() => handleInstallPlugin(plugin.metadata.id)}
                        disabled={isLoading}
                        size="sm"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Install
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="installed" className="space-y-4">
          {/* Installed Instances */}
          <div className="space-y-4">
            {installedPlugins.map((instance) => {
              const plugin = pluginManager.registry.getPlugin(instance.pluginId)
              if (!plugin) return null

              return (
                <motion.div
                  key={instance.instanceId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            {getPluginIcon(plugin.metadata.category)}
                          </div>
                          <div>
                            <CardTitle className="text-lg">{instance.name}</CardTitle>
                            <CardDescription>
                              {plugin.metadata.name} v{plugin.metadata.version}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={instance.enabled ? 'default' : 'secondary'}>
                            {instance.enabled ? 'Enabled' : 'Disabled'}
                          </Badge>
                          <div className="flex space-x-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleTogglePlugin(
                                instance.pluginId, 
                                instance.instanceId, 
                                !instance.enabled
                              )}
                              disabled={isLoading}
                            >
                              {instance.enabled ? (
                                <Pause className="h-4 w-4" />
                              ) : (
                                <Play className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUninstallPlugin(
                                instance.pluginId, 
                                instance.instanceId
                              )}
                              disabled={isLoading}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium">Instance ID</Label>
                          <p className="text-sm text-muted-foreground">{instance.instanceId}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Last Updated</Label>
                          <p className="text-sm text-muted-foreground">
                            {instance.lastUpdated.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
            
            {installedPlugins.length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <Plug className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No plugins installed</h3>
                  <p className="text-muted-foreground text-center">
                    Install plugins from the Available Plugins tab to start monitoring your infrastructure.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
