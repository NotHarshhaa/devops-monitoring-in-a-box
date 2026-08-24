"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { HugeiconsIcon } from '@hugeicons/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  RefreshIcon, 
  Download01Icon, 
  Analytics01Icon, 
  Table01Icon, 
  Alert02Icon,
  CheckmarkCircle01Icon,
  Clock01Icon,
  Loading03Icon,
  EyeIcon,
  FilterIcon
} from '@hugeicons/core-free-icons'
import { 
  PluginManager, 
  PluginConfiguration, 
  DataType, 
  RenderType, 
  TimeRange, 
  getPluginManager 
} from '@/lib/plugins'

interface PluginDataViewerProps {
  instance: PluginConfiguration
}

export default function PluginDataViewer({ instance }: PluginDataViewerProps) {
  const [pluginManager] = useState<PluginManager>(getPluginManager())
  const [selectedDataType, setSelectedDataType] = useState<DataType>(DataType.METRICS)
  const [selectedRenderType, setSelectedRenderType] = useState<RenderType>(RenderType.CHART)
  const [timeRange, setTimeRange] = useState<TimeRange>({
    start: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
    end: new Date()
  })
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastFetched, setLastFetched] = useState<Date | null>(null)

  const plugin = pluginManager.registry.getPlugin(instance.pluginId)

  const supportedDataTypes = plugin?.metadata.supportedDataTypes ?? []

  useEffect(() => {
    if (supportedDataTypes.length > 0 && !supportedDataTypes.includes(selectedDataType)) {
      setSelectedDataType(supportedDataTypes[0])
    }
  }, [supportedDataTypes, selectedDataType])

  const fetchData = async () => {
    if (!plugin) {
      return
    }

    if (!instance.enabled) {
      setError('Plugin instance is disabled')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await pluginManager.fetchDataFromPlugin({
        pluginId: instance.pluginId,
        instanceId: instance.instanceId,
        dataType: selectedDataType,
        timeRange,
        filters: {},
        aggregation: {
          method: 'avg',
          interval: '5m'
        }
      })

      if (response.success) {
        setData(response.data)
        setLastFetched(new Date())
      } else {
        setError(response.error || 'Failed to fetch data')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDataType, timeRange])

  if (!plugin) {
    return (
      <Alert variant="destructive">
        <HugeiconsIcon icon={Alert02Icon} className="h-4 w-4" />
        <AlertDescription>Plugin not found</AlertDescription>
      </Alert>
    )
  }

  const handleTimeRangeChange = (range: string) => {
    const now = new Date()
    let start: Date

    switch (range) {
      case '1h':
        start = new Date(now.getTime() - 60 * 60 * 1000)
        break
      case '6h':
        start = new Date(now.getTime() - 6 * 60 * 60 * 1000)
        break
      case '24h':
        start = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        break
      case '7d':
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      default:
        start = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    }

    setTimeRange({ start, end: now })
  }

  const getDataTypeIcon = (dataType: DataType) => {
    switch (dataType) {
      case DataType.METRICS:
        return <HugeiconsIcon icon={Analytics01Icon} className="h-4 w-4" />
      case DataType.LOGS:
        return <HugeiconsIcon icon={Table01Icon} className="h-4 w-4" />
      case DataType.ALERTS:
        return <HugeiconsIcon icon={Alert02Icon} className="h-4 w-4" />
      case DataType.EVENTS:
        return <HugeiconsIcon icon={Clock01Icon} className="h-4 w-4" />
      case DataType.TRACES:
        return <HugeiconsIcon icon={EyeIcon} className="h-4 w-4" />
      default:
        return <HugeiconsIcon icon={Analytics01Icon} className="h-4 w-4" />
    }
  }

  const getRenderTypeIcon = (renderType: RenderType) => {
    switch (renderType) {
      case RenderType.CHART:
        return <HugeiconsIcon icon={Analytics01Icon} className="h-4 w-4" />
      case RenderType.TABLE:
        return <HugeiconsIcon icon={Table01Icon} className="h-4 w-4" />
      case RenderType.CARD:
        return <HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-4 w-4" />
      case RenderType.ALERT:
        return <HugeiconsIcon icon={Alert02Icon} className="h-4 w-4" />
      default:
        return <HugeiconsIcon icon={Analytics01Icon} className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{instance.name}</h2>
          <p className="text-muted-foreground">
            Data from {plugin.metadata.name} plugin
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={instance.enabled ? 'default' : 'secondary'}>
            {instance.enabled ? 'Enabled' : 'Disabled'}
          </Badge>
          {lastFetched && (
            <div className="text-sm text-muted-foreground">
              Last updated: {lastFetched.toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <Card className="border border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <HugeiconsIcon icon={FilterIcon} className="h-5 w-5" />
            Data Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Data Type</label>
              <Select value={selectedDataType} onValueChange={(value) => setSelectedDataType(value as DataType)}>
                <SelectTrigger className="bg-card border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {supportedDataTypes.map(dataType => (
                    <SelectItem key={dataType} value={dataType}>
                      <div className="flex items-center gap-2">
                        {getDataTypeIcon(dataType)}
                        {dataType}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Render Type</label>
              <Select value={selectedRenderType} onValueChange={(value) => setSelectedRenderType(value as RenderType)}>
                <SelectTrigger className="bg-card border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={RenderType.CHART}>
                    <div className="flex items-center gap-2">
                      {getRenderTypeIcon(RenderType.CHART)}
                      Chart
                    </div>
                  </SelectItem>
                  <SelectItem value={RenderType.TABLE}>
                    <div className="flex items-center gap-2">
                      {getRenderTypeIcon(RenderType.TABLE)}
                      Table
                    </div>
                  </SelectItem>
                  <SelectItem value={RenderType.CARD}>
                    <div className="flex items-center gap-2">
                      {getRenderTypeIcon(RenderType.CARD)}
                      Card
                    </div>
                  </SelectItem>
                  <SelectItem value={RenderType.ALERT}>
                    <div className="flex items-center gap-2">
                      {getRenderTypeIcon(RenderType.ALERT)}
                      Alert
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Time Range</label>
              <Select defaultValue="24h" onValueChange={handleTimeRangeChange}>
                <SelectTrigger className="bg-card border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">Last Hour</SelectItem>
                  <SelectItem value="6h">Last 6 Hours</SelectItem>
                  <SelectItem value="24h">Last 24 Hours</SelectItem>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Actions</label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchData}
                  disabled={isLoading || !instance.enabled}
                  className="border-border hover:bg-muted"
                >
                  {isLoading ? (
                    <HugeiconsIcon icon={Loading03Icon} className="h-4 w-4 animate-spin" />
                  ) : (
                    <HugeiconsIcon icon={RefreshIcon} className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={data.length === 0}
                  className="border-border hover:bg-muted"
                >
                  <HugeiconsIcon icon={Download01Icon} className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <HugeiconsIcon icon={Alert02Icon} className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Data Display */}
      <Card className="border border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            {getDataTypeIcon(selectedDataType)}
            {selectedDataType} Data
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {data.length} records found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <HugeiconsIcon icon={Loading03Icon} className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading data...</span>
            </div>
          ) : data.length === 0 ? (
            <div className="text-center py-8">
              <HugeiconsIcon icon={Analytics01Icon} className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No data available</h3>
              <p className="text-muted-foreground">
                {instance.enabled 
                  ? 'No data found for the selected time range and filters.'
                  : 'Plugin instance is disabled. Enable it to fetch data.'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.slice(0, 6).map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className="border border-border bg-card">
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-foreground">
                              {item.metricName || item.eventType || item.level || 'Data Point'}
                            </span>
                            <Badge variant="outline" className="text-xs border-border">
                              {selectedDataType}
                            </Badge>
                          </div>
                          <div className="text-2xl font-bold text-foreground">
                            {item.value || item.status || item.conclusion || 'N/A'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {item.timestamp && new Date(item.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {data.length > 6 && (
                <div className="text-center">
                  <Button variant="outline" className="border-border hover:bg-muted">
                    View All {data.length} Records
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
