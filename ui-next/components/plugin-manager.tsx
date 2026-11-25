"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { HugeiconsIcon } from '@hugeicons/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Modal } from '@/components/ui/modal'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  PlugIcon, 
  Settings01Icon, 
  PlayIcon, 
  PauseIcon, 
  Delete02Icon, 
  PlusSignIcon, 
  Search01Icon,
  CheckmarkCircle01Icon,
  AlertCircleIcon,
  CloudIcon,
  GitBranchIcon,
  Loading03Icon,
  EyeIcon
} from '@hugeicons/core-free-icons'
import { 
  PluginManager, 
  PluginConfiguration, 
  PluginCategory, 
  getPluginManager,
  Plugin as PluginInterface
} from '@/lib/plugins'
import PluginConfigurationComponent from './plugin-configuration'
import PluginDataViewer from './plugin-data-viewer'
import { toast } from '@/hooks/use-toast'

const PLUGIN_STORAGE_KEY = 'monitoring-plugin-instances'

export interface PluginManagerStats {
  available: number
  installed: number
  enabled: number
  categories: number
}

interface PluginManagerComponentProps {
  showHeader?: boolean
  onStatsChange?: (stats: PluginManagerStats) => void
  refreshSignal?: number
}

export default function PluginManagerComponent({
  showHeader = false,
  onStatsChange,
  refreshSignal = 0,
}: PluginManagerComponentProps) {
  const [pluginManager] = useState<PluginManager>(getPluginManager())
  const [availablePlugins, setAvailablePlugins] = useState<PluginInterface[]>([])
  const [installedPlugins, setInstalledPlugins] = useState<PluginConfiguration[]>([])
  const [activeTab, setActiveTab] = useState<'available' | 'installed'>('available')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<PluginCategory | 'all'>('all')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pendingInstallConfig, setPendingInstallConfig] = useState<PluginConfiguration | null>(null)
  const [editingInstance, setEditingInstance] = useState<PluginConfiguration | null>(null)
  const [viewingInstance, setViewingInstance] = useState<PluginConfiguration | null>(null)

  const sanitizeConfigForStorage = (cfg: Record<string, any>): Record<string, any> => {
    const cleaned: Record<string, any> = {}
    for (const [k, v] of Object.entries(cfg || {})) {
      if (/token|secret|password|apikey|accesskey/i.test(k)) continue
      cleaned[k] = v
    }
    return cleaned
  }

  const persistInstances = (instances: PluginConfiguration[]) => {
    try {
      // Never persist plaintext tokens/secrets into localStorage
      const safeInstances = instances.map((item) => ({
        pluginId: item.pluginId,
        instanceId: item.instanceId,
        name: item.name,
        enabled: item.enabled,
        config: sanitizeConfigForStorage(item.config),
        lastUpdated: item.lastUpdated instanceof Date ? item.lastUpdated.toISOString() : item.lastUpdated,
      }))
      localStorage.setItem(PLUGIN_STORAGE_KEY, JSON.stringify(safeInstances))
    } catch {
      // Ignore storage errors
    }
  }

  const syncStats = (plugins: PluginInterface[], instances: PluginConfiguration[]) => {
    onStatsChange?.({
      available: plugins.length,
      installed: instances.length,
      enabled: instances.filter((p) => p.enabled).length,
      categories: new Set(plugins.map((p) => p.metadata.category)).size,
    })
  }

  const loadPlugins = async () => {
    setIsLoading(true)
    try {
      const plugins = pluginManager.registry.getAllPlugins()
      let instances = pluginManager.getPluginInstances()

      if (instances.length === 0) {
        try {
          const saved = localStorage.getItem(PLUGIN_STORAGE_KEY)
          if (saved) {
            const parsed = JSON.parse(saved)
            if (Array.isArray(parsed)) {
              for (const raw of parsed) {
                try {
                  await pluginManager.installPlugin(raw.pluginId, {
                    pluginId: raw.pluginId,
                    instanceId: raw.instanceId,
                    name: raw.name,
                    enabled: Boolean(raw.enabled),
                    config: raw.config || {},
                    lastUpdated: raw.lastUpdated ? new Date(raw.lastUpdated) : new Date(),
                  })
                } catch {
                  // Skip entries whose required config changed or invalid
                }
              }
              instances = pluginManager.getPluginInstances()
            }
          }
        } catch {
          // Ignore corrupted storage
        }
      }
      
      setAvailablePlugins(plugins)
      setInstalledPlugins(instances)
      syncStats(plugins, instances)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load plugins')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadPlugins()
    }, 0)
    return () => window.clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshSignal])

  const createInstanceId = (pluginId: string) =>
    `${pluginId}-${new Date().getTime()}`

  const handleInstallPlugin = (pluginId: string) => {
    const plugin = pluginManager.registry.getPlugin(pluginId)
    if (!plugin) {
      setError(`Plugin ${pluginId} not found`)
      return
    }

    const draftConfig: PluginConfiguration = {
      pluginId,
      instanceId: createInstanceId(pluginId),
      name: `${plugin.metadata.name} Instance`,
      enabled: true,
      config: getDefaultConfig(plugin),
      lastUpdated: new Date()
    }
    setPendingInstallConfig(draftConfig)
  }

  const handleSaveNewInstall = async (config: PluginConfiguration) => {
    setIsLoading(true)
    try {
      await pluginManager.installPlugin(config.pluginId, config)
      const instances = pluginManager.getPluginInstances()
      persistInstances(instances)
      await loadPlugins()
      setPendingInstallConfig(null)
      setActiveTab('installed')
      setError(null)
      toast({
        title: 'Plugin installed',
        description: `${config.name} has been configured and added.`,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to install plugin'
      toast({
        title: 'Configuration invalid',
        description: message,
        variant: 'destructive',
      })
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateExistingConfig = async (updated: PluginConfiguration) => {
    setIsLoading(true)
    try {
      await pluginManager.updatePluginConfiguration(updated.pluginId, updated.instanceId, updated)
      const instances = pluginManager.getPluginInstances()
      persistInstances(instances)
      await loadPlugins()
      setEditingInstance(null)
      toast({
        title: 'Plugin updated',
        description: `${updated.name} settings were saved.`,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update plugin'
      toast({
        title: 'Update failed',
        description: message,
        variant: 'destructive',
      })
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const handleTestPluginConnection = async (config: PluginConfiguration): Promise<boolean> => {
    const plugin = pluginManager.registry.getPlugin(config.pluginId)
    if (!plugin) return false
    if (plugin.testConnection) {
      return await plugin.testConnection(config)
    }
    return plugin.metadata.configurationSchema.required.every(
      (field) => config.config[field] !== undefined && config.config[field] !== ''
    )
  }

  const handleUninstallPlugin = async (pluginId: string, instanceId: string) => {
    setIsLoading(true)
    try {
      await pluginManager.uninstallPlugin(pluginId, instanceId)
      const instances = pluginManager.getPluginInstances()
      persistInstances(instances)
      await loadPlugins()
      setError(null)
      toast({
        title: 'Plugin uninstalled',
        description: `Instance ${instanceId} was removed.`,
      })
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
      const instances = pluginManager.getPluginInstances()
      persistInstances(instances)
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
        return <HugeiconsIcon icon={CloudIcon} className="h-5 w-5" />
      case PluginCategory.CI_CD:
        return <HugeiconsIcon icon={GitBranchIcon} className="h-5 w-5" />
      case PluginCategory.MONITORING:
        return <HugeiconsIcon icon={Settings01Icon} className="h-5 w-5" />
      default:
        return <HugeiconsIcon icon={PlugIcon} className="h-5 w-5" />
    }
  }

  const getCategoryColor = (category: PluginCategory) => {
    switch (category) {
      case PluginCategory.CLOUD_PROVIDER:
        return 'bg-muted text-foreground'
      case PluginCategory.CI_CD:
        return 'bg-muted text-foreground'
      case PluginCategory.MONITORING:
        return 'bg-muted text-foreground'
      case PluginCategory.LOGGING:
        return 'bg-muted text-foreground'
      case PluginCategory.ALERTING:
        return 'bg-muted text-foreground'
      case PluginCategory.INFRASTRUCTURE:
        return 'bg-muted text-muted-foreground'
      default:
        return 'bg-muted text-muted-foreground'
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
        <HugeiconsIcon icon={Loading03Icon} className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading plugins...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {showHeader && (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-3xl font-bold text-foreground">Plugin Manager</h1>
              <p className="text-muted-foreground mt-2">
                Install and manage data source plugins for your monitoring dashboard
              </p>
            </motion.div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border border-border bg-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-foreground">Available Plugins</CardTitle>
                <HugeiconsIcon icon={PlugIcon} className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{availablePlugins.length}</div>
                <p className="text-xs text-muted-foreground">Total plugins in registry</p>
              </CardContent>
            </Card>
            <Card className="border border-border bg-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-foreground">Installed Instances</CardTitle>
                <HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{installedPlugins.length}</div>
                <p className="text-xs text-muted-foreground">Active plugin instances</p>
              </CardContent>
            </Card>
            <Card className="border border-border bg-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-foreground">Enabled</CardTitle>
                <HugeiconsIcon icon={PlayIcon} className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{installedPlugins.filter(p => p.enabled).length}</div>
                <p className="text-xs text-muted-foreground">Currently active</p>
              </CardContent>
            </Card>
            <Card className="border border-border bg-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-foreground">Categories</CardTitle>
                <HugeiconsIcon icon={Settings01Icon} className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{new Set(availablePlugins.map(p => p.metadata.category)).size}</div>
                <p className="text-xs text-muted-foreground">Different categories</p>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <HugeiconsIcon icon={AlertCircleIcon} className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Plugin Management Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'available' | 'installed')} className="space-y-4">
        <TabsList className="bg-muted p-1">
          <TabsTrigger value="available">Available Plugins ({availablePlugins.length})</TabsTrigger>
          <TabsTrigger value="installed">Installed Instances ({installedPlugins.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-4">
          {/* Search and Filter */}
          <div className="flex flex-col xl:flex-row xl:items-center gap-3">
            <div className="w-full xl:max-w-sm">
              <div className="relative">
                <HugeiconsIcon icon={Search01Icon} className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search plugins..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-card border-border"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
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
          <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
            {filteredPlugins.map((plugin) => (
              <motion.div
                key={plugin.metadata.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="h-full border border-border bg-card">
                  <CardHeader>
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="p-2 bg-muted border border-border shrink-0">
                          {getPluginIcon(plugin.metadata.category)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <CardTitle className="text-lg text-foreground break-words leading-snug">{plugin.metadata.name}</CardTitle>
                          <CardDescription className="text-sm text-muted-foreground">
                            v{plugin.metadata.version}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge className={`px-2 py-0.5 border border-border shrink-0 ${getCategoryColor(plugin.metadata.category)}`}>
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
                      <div className="text-sm font-medium text-foreground">Supported Data Types:</div>
                      <div className="flex flex-wrap gap-1">
                        {plugin.metadata.supportedDataTypes.map(dataType => (
                          <Badge key={dataType} variant="outline" className="text-xs border-border">
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
                        className="gap-1.5"
                      >
                        <HugeiconsIcon icon={PlusSignIcon} className="h-4 w-4" />
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
                  <Card className="border border-border bg-card">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-muted border border-border">
                            {getPluginIcon(plugin.metadata.category)}
                          </div>
                          <div>
                            <CardTitle className="text-lg text-foreground">{instance.name}</CardTitle>
                            <CardDescription className="text-muted-foreground">
                              {plugin.metadata.name} v{plugin.metadata.version}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant={instance.enabled ? 'default' : 'secondary'} className="px-2 py-0.5">
                            {instance.enabled ? 'Enabled' : 'Disabled'}
                          </Badge>
                          <div className="flex flex-wrap gap-1.5">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setViewingInstance(instance)}
                              className="gap-1 border-border hover:bg-muted"
                              aria-label={`View data for ${instance.name}`}
                            >
                              <HugeiconsIcon icon={EyeIcon} className="h-3.5 w-3.5" />
                              <span className="hidden sm:inline">Data</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingInstance(instance)}
                              className="gap-1 border-border hover:bg-muted"
                              aria-label={`Configure ${instance.name}`}
                            >
                              <HugeiconsIcon icon={Settings01Icon} className="h-3.5 w-3.5" />
                              <span className="hidden sm:inline">Configure</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleTogglePlugin(
                                instance.pluginId, 
                                instance.instanceId, 
                                !instance.enabled
                              )}
                              disabled={isLoading}
                              className="border-border hover:bg-muted"
                              aria-label={instance.enabled ? `Disable ${instance.name}` : `Enable ${instance.name}`}
                            >
                              {instance.enabled ? (
                                <HugeiconsIcon icon={PauseIcon} className="h-4 w-4" />
                              ) : (
                                <HugeiconsIcon icon={PlayIcon} className="h-4 w-4" />
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
                              className="border-border hover:bg-muted"
                              aria-label={`Uninstall ${instance.name}`}
                            >
                              <HugeiconsIcon icon={Delete02Icon} className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-foreground">Instance ID</Label>
                          <p className="text-sm text-muted-foreground">{instance.instanceId}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-foreground">Last Updated</Label>
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
              <Card className="border border-border bg-card">
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <HugeiconsIcon icon={PlugIcon} className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No plugins installed</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Install plugins from the Available Plugins tab to start monitoring your infrastructure.
                  </p>
                  <Button variant="outline" onClick={() => setActiveTab('available')} className="border-border hover:bg-muted">
                    Browse Available Plugins
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Install & Configure Modal */}
      <Modal
        open={Boolean(pendingInstallConfig)}
        onClose={() => setPendingInstallConfig(null)}
        title={`Configure & Install ${pendingInstallConfig?.name || 'Plugin'}`}
        description="Provide required plugin settings and optional credentials before installing."
        className="max-w-2xl"
      >
        {pendingInstallConfig && (
          <PluginConfigurationComponent
            pluginManager={pluginManager}
            instance={pendingInstallConfig}
            onSave={handleSaveNewInstall}
            onTest={handleTestPluginConnection}
            onCancel={() => setPendingInstallConfig(null)}
            submitLabel="Install Plugin"
          />
        )}
      </Modal>

      {/* Edit Configuration Modal */}
      <Modal
        open={Boolean(editingInstance)}
        onClose={() => setEditingInstance(null)}
        title={`Edit ${editingInstance?.name || 'Plugin'}`}
        description="Update configuration fields or test connectivity."
        className="max-w-2xl"
      >
        {editingInstance && (
          <PluginConfigurationComponent
            pluginManager={pluginManager}
            instance={editingInstance}
            onSave={handleUpdateExistingConfig}
            onTest={handleTestPluginConnection}
            onCancel={() => setEditingInstance(null)}
          />
        )}
      </Modal>

      {/* View Plugin Data Modal */}
      <Modal
        open={Boolean(viewingInstance)}
        onClose={() => setViewingInstance(null)}
        title={`Plugin Data — ${viewingInstance?.name || ''}`}
        description="Inspect metrics, logs, or events collected by this plugin instance."
        className="max-w-4xl"
      >
        {viewingInstance && <PluginDataViewer instance={viewingInstance} />}
      </Modal>
    </div>
  )
}
