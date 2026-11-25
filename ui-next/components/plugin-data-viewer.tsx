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
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts'
import { 
  PluginManager, 
  PluginConfiguration, 
  DataType, 
  RenderType, 
  TimeRange, 
  getPluginManager 
} from '@/lib/plugins'
import { toast } from '@/hooks/use-toast'

interface PluginDataViewerProps {
  instance: PluginConfiguration
}

export default function PluginDataViewer({ instance }: PluginDataViewerProps) {
  const [pluginManager] = useState<PluginManager>(getPluginManager())
  const [selectedDataType, setSelectedDataType] = useState<DataType>(DataType.METRICS)
  const [selectedRenderType, setSelectedRenderType] = useState<RenderType>(RenderType.CARD)
  const [timeRange, setTimeRange] = useState<TimeRange>(() => ({
    start: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
    end: new Date()
  }))
  const [data, setData] = useState<any[]>([])
  const [showAll, setShowAll] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastFetched, setLastFetched] = useState<Date | null>(null)

  const plugin = pluginManager.registry.getPlugin(instance.pluginId)

  const supportedDataTypes = React.useMemo(
    () => plugin?.metadata.supportedDataTypes ?? [],
    [plugin]
  )

  useEffect(() => {
    if (supportedDataTypes.length > 0 && !supportedDataTypes.includes(selectedDataType)) {
      const timer = window.setTimeout(() => {
        setSelectedDataType(supportedDataTypes[0])
      }, 0)
      return () => window.clearTimeout(timer)
    }
  }, [supportedDataTypes, selectedDataType])

  const fetchData = React.useCallback(async () => {
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
  }, [plugin, instance.enabled, instance.pluginId, instance.instanceId, pluginManager, selectedDataType, timeRange])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchData()
    }, 0)
    return () => window.clearTimeout(timer)
  }, [fetchData])

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
                  aria-label="Refresh plugin data"
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
                  onClick={() => {
                    if (data.length === 0) return
                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `${instance.pluginId}-${selectedDataType.toLowerCase()}-data.json`
                    a.click()
                    URL.revokeObjectURL(url)
                    toast({
                      title: 'Plugin data exported',
                      description: `Downloaded ${data.length} ${selectedDataType} records as JSON.`,
                    })
                  }}
                  disabled={data.length === 0}
                  className="border-border hover:bg-muted"
                  aria-label="Export plugin data"
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
              {selectedRenderType === RenderType.CHART && (
                (() => {
                  const chartSeries = (showAll ? data : data.slice(0, 12))
                    .map((item, idx) => ({
                      label: String(item.metricName || item.eventType || item.level || `#${idx + 1}`).slice(0, 18),
                      value: typeof item.value === 'number' ? item.value : Number(item.value),
                    }))
                    .filter((pt) => Number.isFinite(pt.value))

                  if (chartSeries.length === 0) {
                    return (
                      <div className="p-4 border border-border bg-muted/40 text-xs text-muted-foreground">
                        Selected records are non-numeric — showing card breakdown below.
                      </div>
                    )
                  }

                  return (
                    <div className="h-64 w-full border border-border p-3">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartSeries}>
                          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                          <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                          <YAxis tick={{ fontSize: 10 }} />
                          <Tooltip contentStyle={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', borderRadius: '0px' }} />
                          <Bar dataKey="value" fill="var(--foreground)" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )
                })()
              )}

              {selectedRenderType === RenderType.TABLE ? (
                <div className="overflow-x-auto border border-border">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="border-b border-border bg-muted/50 text-muted-foreground">
                      <tr>
                        <th className="p-2.5 font-medium">Name / Event</th>
                        <th className="p-2.5 font-medium">Value / Status</th>
                        <th className="p-2.5 font-medium">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(showAll ? data : data.slice(0, 10)).map((item, index) => (
                        <tr key={index} className="border-b border-border last:border-0">
                          <td className="p-2.5 font-medium text-foreground">
                            {item.metricName || item.eventType || item.level || item.message || 'Data Point'}
                          </td>
                          <td className="p-2.5 font-mono text-foreground">
                            {item.value ?? item.status ?? item.conclusion ?? 'N/A'}
                          </td>
                          <td className="p-2.5 text-muted-foreground">
                            {item.timestamp ? new Date(item.timestamp).toLocaleString() : '--'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : selectedRenderType === RenderType.ALERT ? (
                <div className="space-y-2">
                  {(showAll ? data : data.slice(0, 10)).map((item, index) => (
                    <div key={index} className="flex items-start justify-between gap-3 p-3 border border-border bg-card">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <HugeiconsIcon icon={Alert02Icon} className="h-4 w-4 text-foreground shrink-0" />
                          <span className="text-sm font-medium text-foreground truncate">
                            {item.metricName || item.eventType || item.message || 'Event'}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {item.timestamp ? new Date(item.timestamp).toLocaleString() : 'No timestamp'}
                        </p>
                      </div>
                      <Badge variant="outline" className="px-2 py-0.5 text-xs shrink-0">
                        {item.status ?? item.conclusion ?? item.level ?? String(item.value ?? 'INFO')}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(showAll ? data : data.slice(0, 6)).map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: Math.min(index, 6) * 0.05 }}
                    >
                      <Card className="border border-border bg-card">
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-sm font-medium text-foreground truncate">
                                {item.metricName || item.eventType || item.level || 'Data Point'}
                              </span>
                              <Badge variant="outline" className="px-2 py-0.5 text-xs border-border shrink-0">
                                {selectedDataType}
                              </Badge>
                            </div>
                            <div className="text-2xl font-bold text-foreground">
                              {item.value ?? item.status ?? item.conclusion ?? 'N/A'}
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
              )}

              {data.length > 6 && (
                <div className="text-center">
                  <Button
                    variant="outline"
                    onClick={() => setShowAll(prev => !prev)}
                    className="border-border hover:bg-muted"
                  >
                    {showAll ? 'Show Fewer Records' : `View All ${data.length} Records`}
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
