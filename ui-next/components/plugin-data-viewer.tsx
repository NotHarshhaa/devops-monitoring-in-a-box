"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  RefreshCw, 
  Download, 
  BarChart3, 
  Table, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Loader2,
  Eye,
  Filter
} from 'lucide-react'
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
  if (!plugin) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>Plugin not found</AlertDescription>
      </Alert>
    )
  }

  const supportedDataTypes = plugin.metadata.supportedDataTypes

  useEffect(() => {
    if (supportedDataTypes.length > 0 && !supportedDataTypes.includes(selectedDataType)) {
      setSelectedDataType(supportedDataTypes[0])
    }
  }, [supportedDataTypes, selectedDataType])

  const fetchData = async () => {
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

  const renderData = async () => {
    if (data.length === 0) return null

    try {
      const response = await pluginManager.renderDataFromPlugin({
        pluginId: instance.pluginId,
        instanceId: instance.instanceId,
        dataType: selectedDataType,
        data,
        renderType: selectedRenderType,
        options: {
          chartType: 'line',
          limit: 100
        }
      })

      if (response.success) {
        return response
      } else {
        setError(response.error || 'Failed to render data')
        return null
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      return null
    }
  }

  useEffect(() => {
    fetchData()
  }, [selectedDataType, timeRange])

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
        return <BarChart3 className="h-4 w-4" />
      case DataType.LOGS:
        return <Table className="h-4 w-4" />
      case DataType.ALERTS:
        return <AlertTriangle className="h-4 w-4" />
      case DataType.EVENTS:
        return <Clock className="h-4 w-4" />
      case DataType.TRACES:
        return <Eye className="h-4 w-4" />
      default:
        return <BarChart3 className="h-4 w-4" />
    }
  }

  const getRenderTypeIcon = (renderType: RenderType) => {
    switch (renderType) {
      case RenderType.CHART:
        return <BarChart3 className="h-4 w-4" />
      case RenderType.TABLE:
        return <Table className="h-4 w-4" />
      case RenderType.CARD:
        return <CheckCircle className="h-4 w-4" />
      case RenderType.ALERT:
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <BarChart3 className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">{instance.name}</h2>
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Data Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Data Type</label>
              <Select value={selectedDataType} onValueChange={(value) => setSelectedDataType(value as DataType)}>
                <SelectTrigger>
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
              <label className="text-sm font-medium">Render Type</label>
              <Select value={selectedRenderType} onValueChange={(value) => setSelectedRenderType(value as RenderType)}>
                <SelectTrigger>
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
              <label className="text-sm font-medium">Time Range</label>
              <Select defaultValue="24h" onValueChange={handleTimeRangeChange}>
                <SelectTrigger>
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
              <label className="text-sm font-medium">Actions</label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchData}
                  disabled={isLoading || !instance.enabled}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={data.length === 0}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Data Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getDataTypeIcon(selectedDataType)}
            {selectedDataType} Data
          </CardTitle>
          <CardDescription>
            {data.length} records found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading data...</span>
            </div>
          ) : data.length === 0 ? (
            <div className="text-center py-8">
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No data available</h3>
              <p className="text-muted-foreground">
                {instance.enabled 
                  ? 'No data found for the selected time range and filters.'
                  : 'Plugin instance is disabled. Enable it to fetch data.'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Mock data display - in real implementation, this would render the actual plugin data */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.slice(0, 6).map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card>
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                              {item.metricName || item.eventType || item.level || 'Data Point'}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {selectedDataType}
                            </Badge>
                          </div>
                          <div className="text-2xl font-bold">
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
                  <Button variant="outline">
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
