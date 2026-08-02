"use client"

import React from "react"
import { motion } from "framer-motion"
import {
  BarChart3,
  TrendingDown,
  Download,
  RefreshCw,
  Activity,
  Cpu,
  HardDrive,
  Wifi,
  Monitor,
  Database,
  Shield,
  Gauge
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { MetricsOverview, SystemLoadOverview } from "@/components/metrics-overview"
import { MetricsChart } from "@/components/metrics-chart"
import { 
  useAllMetricsRange, 
  getTimeRange,
  useAllCurrentMetrics 
} from "@/lib/hooks/use-prometheus-metrics"
import { useQueryClient } from "@tanstack/react-query"

// Time range options
const timeRangeData = [
  { name: "1h", value: 1 },
  { name: "6h", value: 6 },
  { name: "12h", value: 12 },
  { name: "1d", value: 24 },
  { name: "7d", value: 168 },
  { name: "30d", value: 720 }
]

export default function MetricsPage() {
  const [timeRange, setTimeRange] = React.useState("24")
  const queryClient = useQueryClient()
  
  // Get time range for charts
  const { start, end } = getTimeRange(timeRange)
  
  // Fetch metrics data
  const allMetricsRange = useAllMetricsRange(timeRange)
  const allCurrentMetrics = useAllCurrentMetrics()

  // Handle manual refresh
  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['all-current-metrics'] })
    queryClient.invalidateQueries({ queryKey: ['cpu-usage-range'] })
    queryClient.invalidateQueries({ queryKey: ['memory-usage-range'] })
    queryClient.invalidateQueries({ queryKey: ['disk-usage-range'] })
    queryClient.invalidateQueries({ queryKey: ['network-traffic-range'] })
  }

  // Prepare chart data
  const prepareChartData = (cpuData: any[], memoryData: any[], diskData: any[]) => {
    const timeMap = new Map()
    
    // Merge all data by timestamp
    ;[cpuData, memoryData, diskData].forEach((dataArray, index) => {
      dataArray.forEach((item: any) => {
        const time = item.time
        if (!timeMap.has(time)) {
          timeMap.set(time, { time })
        }
        const entry = timeMap.get(time)
        if (index === 0) entry.cpu = item.value
        else if (index === 1) entry.memory = item.value
        else if (index === 2) entry.disk = item.value
      })
    })
    
    return Array.from(timeMap.values()).sort((a, b) => a.time - b.time)
  }

  const systemResourceData = prepareChartData(
    allMetricsRange.cpuRange.data ?? [],
    allMetricsRange.memoryRange.data ?? [],
    allMetricsRange.diskRange.data ?? []
  )

  const networkTrafficData = allMetricsRange.networkRange.data ?? []

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="px-2 sm:px-4 py-3 sm:py-6 max-w-7xl mx-auto space-y-3 sm:space-y-6">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border border-border dark:border-border bg-card dark:bg-card overflow-hidden">
            <CardHeader className="text-foreground p-4 sm:p-8">
              <div className="flex items-center justify-between">
                <div className="space-y-2 sm:space-y-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-2 sm:p-3 bg-card">
                      <BarChart3 className="h-5 w-5 sm:h-7 sm:w-7 text-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-xl sm:text-3xl lg:text-4xl font-bold">
                        System Metrics
                      </CardTitle>
                      <CardDescription className="mt-1 sm:mt-2 text-foreground text-sm sm:text-base">
                        Real-time performance monitoring from Prometheus
                      </CardDescription>
                    </div>
                  </div>
                </div>
                <div className="hidden sm:block">
                  <Badge className="bg-card text-foreground border-border px-3 py-1.5 font-semibold text-sm">
                    <Activity className="h-3 w-3 mr-1" />
                    Live Data
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="text-center p-3 sm:p-4 border border-border"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-muted rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Cpu className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-foreground">
                    {allCurrentMetrics.data?.cpu ? `${allCurrentMetrics.data.cpu.toFixed(1)}%` : '--'}
                  </div>
                  <div className="text-xs sm:text-sm text-foreground">CPU Usage</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="text-center p-3 sm:p-4 border border-border"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-muted rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Database className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-foreground">
                    {allCurrentMetrics.data?.memory ? `${allCurrentMetrics.data.memory.toFixed(1)}%` : '--'}
                  </div>
                  <div className="text-xs sm:text-sm text-foreground">Memory</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                  className="text-center p-3 sm:p-4 border border-border"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-muted rounded-lg flex items-center justify-center mx-auto mb-2">
                    <HardDrive className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-foreground">
                    {allCurrentMetrics.data?.disk ? `${allCurrentMetrics.data.disk.toFixed(1)}%` : '--'}
                  </div>
                  <div className="text-xs sm:text-sm text-foreground">Disk Usage</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                  className="text-center p-3 sm:p-4 border border-border"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-muted rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Wifi className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-foreground">
                    {allCurrentMetrics.data?.network ? `${(allCurrentMetrics.data.network.inbound + allCurrentMetrics.data.network.outbound).toFixed(1)} MB/s` : '--'}
                  </div>
                  <div className="text-xs sm:text-sm text-foreground">Network</div>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4"
        >
          <div className="flex flex-wrap items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[120px] sm:w-[140px] h-9 sm:h-10 bg-card dark:bg-card border-border dark:border-border">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                {timeRangeData.map((range) => (
                  <SelectItem key={range.name} value={range.value.toString()}>
                    Last {range.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1.5 h-9 sm:h-10 bg-card dark:bg-card border-border dark:border-border hover:bg-muted dark:hover:bg-muted" 
              onClick={handleRefresh}
            >
              <RefreshCw className="h-4 w-4" />
              <span className="hidden sm:inline">Refresh</span>
              <span className="sm:hidden">Sync</span>
            </Button>

            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1.5 h-9 sm:h-10 bg-card dark:bg-card border-border dark:border-border hover:bg-muted dark:hover:bg-muted"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
              <span className="sm:hidden">Save</span>
            </Button>
          </div>

          <Badge className="bg-muted text-foreground">
            <Activity className="h-3 w-3 mr-1" />
            Live Monitoring
          </Badge>
        </motion.div>

        {/* Real-time Metrics Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <MetricsOverview />
        </motion.div>

        {/* System Load Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <SystemLoadOverview />
        </motion.div>

        {/* Enhanced Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Tabs defaultValue="overview" className="space-y-4 sm:space-y-6">
            <TabsList className="h-10 sm:h-11 w-full grid grid-cols-2 sm:grid-cols-5 bg-muted dark:bg-muted p-1">
              <TabsTrigger value="overview" className="data-[state=active]:bg-card dark:data-[state=active]:bg-muted rounded-lg text-xs sm:text-sm font-medium gap-1 sm:gap-2">
                <Monitor className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Overview</span>
                <span className="sm:hidden">All</span>
              </TabsTrigger>
              <TabsTrigger value="cpu" className="data-[state=active]:bg-card dark:data-[state=active]:bg-muted rounded-lg text-xs sm:text-sm font-medium gap-1 sm:gap-2">
                <Cpu className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">CPU</span>
                <span className="sm:hidden">CPU</span>
              </TabsTrigger>
              <TabsTrigger value="memory" className="data-[state=active]:bg-card dark:data-[state=active]:bg-muted rounded-lg text-xs sm:text-sm font-medium gap-1 sm:gap-2">
                <Database className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Memory</span>
                <span className="sm:hidden">RAM</span>
              </TabsTrigger>
              <TabsTrigger value="disk" className="data-[state=active]:bg-card dark:data-[state=active]:bg-muted rounded-lg text-xs sm:text-sm font-medium gap-1 sm:gap-2">
                <HardDrive className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Disk</span>
                <span className="sm:hidden">I/O</span>
              </TabsTrigger>
              <TabsTrigger value="network" className="data-[state=active]:bg-card dark:data-[state=active]:bg-muted rounded-lg text-xs sm:text-sm font-medium gap-1 sm:gap-2">
                <Wifi className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Network</span>
                <span className="sm:hidden">Net</span>
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="lg:col-span-2"
                >
                  <Card className="border border-border dark:border-border bg-card dark:bg-card transition-all duration-300">
                    <MetricsChart
                      title="System Resource Usage"
                      description="CPU, memory, and disk utilization over time"
                      data={systemResourceData}
                      dataKeys={[
                        { key: 'cpu', color: '#525252', name: 'CPU' },
                        { key: 'memory', color: '#737373', name: 'Memory' },
                        { key: 'disk', color: '#a3a3a3', name: 'Disk' },
                      ]}
                      isLoading={allMetricsRange.isLoading}
                      isError={allMetricsRange.isError}
                      errorMessage="Failed to load system resource data"
                      onRefresh={handleRefresh}
                      height={350}
                      yAxisDomain={[0, 100]}
                      formatYAxis={(value) => `${value}%`}
                      formatTooltip={(value, name) => [`${value.toFixed(1)}%`, name]}
                    />
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Card className="border border-border dark:border-border bg-card dark:bg-card transition-all duration-300">
                    <CardHeader className="p-4 sm:p-6">
                      <CardTitle className="flex items-center gap-2 text-muted-foreground dark:text-foreground">
                        <div className="p-2">
                          <Gauge className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
                        </div>
                        Resource Distribution
                      </CardTitle>
                      <CardDescription className="text-muted-foreground dark:text-muted-foreground">
                        Current system resource allocation
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6">
                      <div className="space-y-4">
                        {allCurrentMetrics.data ? (
                          <>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs sm:text-sm text-muted-foreground dark:text-muted-foreground">CPU</span>
                                <span className="text-sm sm:text-base font-medium text-muted-foreground dark:text-foreground">{allCurrentMetrics.data.cpu.toFixed(1)}%</span>
                              </div>
                              <div className="w-full bg-muted dark:bg-muted rounded-full h-2 sm:h-2.5">
                                <div 
                                  className="h-2 sm:h-2.5 rounded-full transition-all duration-300"
                                  style={{ width: `${allCurrentMetrics.data.cpu}%` }}
                                />
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs sm:text-sm text-muted-foreground dark:text-muted-foreground">Memory</span>
                                <span className="text-sm sm:text-base font-medium text-muted-foreground dark:text-foreground">{allCurrentMetrics.data.memory.toFixed(1)}%</span>
                              </div>
                              <div className="w-full bg-muted dark:bg-muted rounded-full h-2 sm:h-2.5">
                                <div 
                                  className="h-2 sm:h-2.5 rounded-full transition-all duration-300"
                                  style={{ width: `${allCurrentMetrics.data.memory}%` }}
                                />
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs sm:text-sm text-muted-foreground dark:text-muted-foreground">Disk</span>
                                <span className="text-sm sm:text-base font-medium text-muted-foreground dark:text-foreground">{allCurrentMetrics.data.disk.toFixed(1)}%</span>
                              </div>
                              <div className="w-full bg-muted dark:bg-muted rounded-full h-2 sm:h-2.5">
                                <div 
                                  className="h-2 sm:h-2.5 rounded-full transition-all duration-300"
                                  style={{ width: `${allCurrentMetrics.data.disk}%` }}
                                />
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="text-center text-muted-foreground dark:text-muted-foreground py-8 sm:py-12">
                            {allCurrentMetrics.isLoading ? (
                              <div className="flex flex-col items-center justify-center gap-3">
                                <RefreshCw className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-foreground" />
                                <span className="text-sm sm:text-base">Loading...</span>
                              </div>
                            ) : (
                              <span className="text-sm sm:text-base">No data available</span>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <Card className="border border-border dark:border-border bg-card dark:bg-card transition-all duration-300">
                    <MetricsChart
                      title="Network Traffic"
                      description="Inbound and outbound network traffic"
                      data={networkTrafficData}
                      dataKeys={[
                        { key: 'inbound', color: '#525252', name: 'Inbound' },
                        { key: 'outbound', color: '#262626', name: 'Outbound' },
                      ]}
                      isLoading={allMetricsRange.networkRange.isLoading}
                      isError={allMetricsRange.networkRange.isError}
                      errorMessage="Failed to load network traffic data"
                      onRefresh={handleRefresh}
                      chartType="area"
                      height={300}
                      formatYAxis={(value) => `${value.toFixed(1)} MB/s`}
                      formatTooltip={(value, name) => [`${value.toFixed(2)} MB/s`, name]}
                    />
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <Card className="border border-border dark:border-border bg-card dark:bg-card transition-all duration-300">
                    <CardHeader className="p-4 sm:p-6">
                      <CardTitle className="flex items-center gap-2 text-muted-foreground dark:text-foreground">
                        <div className="p-2">
                          <Database className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
                        </div>
                        Memory Usage Breakdown
                      </CardTitle>
                      <CardDescription className="text-muted-foreground dark:text-muted-foreground">
                        Memory usage by type
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6">
                      <div className="space-y-4">
                        {allCurrentMetrics.data ? (
                          <>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs sm:text-sm text-muted-foreground dark:text-muted-foreground">Used</span>
                                <span className="text-sm sm:text-base font-medium text-muted-foreground dark:text-foreground">{allCurrentMetrics.data.memory.toFixed(1)}%</span>
                              </div>
                              <div className="w-full bg-muted dark:bg-muted rounded-full h-2 sm:h-2.5">
                                <div 
                                  className="h-2 sm:h-2.5 rounded-full transition-all duration-300"
                                  style={{ width: `${allCurrentMetrics.data.memory}%` }}
                                />
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs sm:text-sm text-muted-foreground dark:text-muted-foreground">Available</span>
                                <span className="text-sm sm:text-base font-medium text-muted-foreground dark:text-foreground">{(100 - allCurrentMetrics.data.memory).toFixed(1)}%</span>
                              </div>
                              <div className="w-full bg-muted dark:bg-muted rounded-full h-2 sm:h-2.5">
                                <div 
                                  className="h-2 sm:h-2.5 rounded-full transition-all duration-300"
                                  style={{ width: `${100 - allCurrentMetrics.data.memory}%` }}
                                />
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="text-center text-muted-foreground dark:text-muted-foreground py-8 sm:py-12">
                            {allCurrentMetrics.isLoading ? (
                              <div className="flex flex-col items-center justify-center gap-3">
                                <RefreshCw className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-foreground" />
                                <span className="text-sm sm:text-base">Loading...</span>
                              </div>
                            ) : (
                              <span className="text-sm sm:text-base">No data available</span>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </TabsContent>

            {/* CPU Tab */}
            <TabsContent value="cpu" className="space-y-4 sm:space-y-6">
              <div className="grid gap-4 sm:gap-6">
                <Card className="border border-border dark:border-border bg-card dark:bg-card transition-all duration-300">
                  <MetricsChart
                    title="CPU Usage Over Time"
                    description="Detailed CPU utilization metrics"
                    data={allMetricsRange.cpuRange.data || []}
                    dataKeys={[
                      { key: 'value', color: '#525252', name: 'CPU Usage' },
                    ]}
                    isLoading={allMetricsRange.cpuRange.isLoading}
                    isError={allMetricsRange.cpuRange.isError}
                    errorMessage="Failed to load CPU usage data"
                    onRefresh={handleRefresh}
                    height={400}
                    yAxisDomain={[0, 100]}
                    formatYAxis={(value) => `${value}%`}
                    formatTooltip={(value, name) => [`${value.toFixed(1)}%`, name]}
                  />
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                  <Card className="border border-border dark:border-border bg-card dark:bg-card transition-all duration-300">
                    <CardHeader className="pb-2 p-4 sm:p-6">
                      <CardTitle className="text-lg text-muted-foreground dark:text-foreground flex items-center gap-2">
                        <Cpu className="h-5 w-5 text-foreground" />
                        Current Usage
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-center justify-between">
                        <div className="text-2xl sm:text-3xl font-bold text-muted-foreground dark:text-foreground">
                          {allCurrentMetrics.data?.cpu ? `${allCurrentMetrics.data.cpu.toFixed(1)}%` : '--'}
                        </div>
                        <div className="flex items-center text-foreground">
                          <TrendingDown className="h-4 w-4 mr-1" />
                          <span className="text-xs sm:text-sm">Real-time</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border border-border dark:border-border bg-card dark:bg-card transition-all duration-300">
                    <CardHeader className="pb-2 p-4 sm:p-6">
                      <CardTitle className="text-lg text-muted-foreground dark:text-foreground flex items-center gap-2">
                        <Activity className="h-5 w-5 text-foreground" />
                        Average Load
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6">
                      <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
                        <div>
                          <div className="text-lg sm:text-xl font-bold text-muted-foreground dark:text-foreground">
                            {allCurrentMetrics.data?.load.load1 ? allCurrentMetrics.data.load.load1.toFixed(1) : '--'}
                          </div>
                          <div className="text-xs sm:text-sm text-muted-foreground dark:text-muted-foreground">1 min</div>
                        </div>
                        <div>
                          <div className="text-lg sm:text-xl font-bold text-muted-foreground dark:text-foreground">
                            {allCurrentMetrics.data?.load.load5 ? allCurrentMetrics.data.load.load5.toFixed(1) : '--'}
                          </div>
                          <div className="text-xs sm:text-sm text-muted-foreground dark:text-muted-foreground">5 min</div>
                        </div>
                        <div>
                          <div className="text-lg sm:text-xl font-bold text-muted-foreground dark:text-foreground">
                            {allCurrentMetrics.data?.load.load15 ? allCurrentMetrics.data.load.load15.toFixed(1) : '--'}
                          </div>
                          <div className="text-xs sm:text-sm text-muted-foreground dark:text-muted-foreground">15 min</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border border-border dark:border-border bg-card dark:bg-card transition-all duration-300">
                    <CardHeader className="pb-2 p-4 sm:p-6">
                      <CardTitle className="text-lg text-muted-foreground dark:text-foreground flex items-center gap-2">
                        <Shield className="h-5 w-5 text-foreground" />
                        Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6">
                      <div className="text-center">
                        <div className={`inline-flex items-center px-3 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium ${ allCurrentMetrics.data?.cpu && allCurrentMetrics.data.cpu > 80 ? 'bg-muted text-foreground' : 'bg-muted text-muted-foreground' }`}>
                          {allCurrentMetrics.data?.cpu && allCurrentMetrics.data.cpu > 80 
                            ? 'High'
                            : allCurrentMetrics.data?.cpu && allCurrentMetrics.data.cpu > 60
                            ? 'Moderate'
                            : 'Normal'
                          }
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Memory Tab */}
            <TabsContent value="memory" className="space-y-4 sm:space-y-6">
              <div className="grid gap-4 sm:gap-6">
                <Card className="border border-border dark:border-border bg-card dark:bg-card transition-all duration-300">
                  <MetricsChart
                    title="Memory Usage Over Time"
                    description="RAM utilization over time"
                    data={allMetricsRange.memoryRange.data || []}
                    dataKeys={[
                      { key: 'value', color: '#737373', name: 'Memory Usage' },
                    ]}
                    isLoading={allMetricsRange.memoryRange.isLoading}
                    isError={allMetricsRange.memoryRange.isError}
                    errorMessage="Failed to load memory usage data"
                    onRefresh={handleRefresh}
                    height={400}
                    yAxisDomain={[0, 100]}
                    formatYAxis={(value) => `${value}%`}
                    formatTooltip={(value, name) => [`${value.toFixed(1)}%`, name]}
                  />
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <Card className="border border-border dark:border-border bg-card dark:bg-card transition-all duration-300">
                    <CardHeader className="p-4 sm:p-6">
                      <CardTitle className="flex items-center gap-2 text-muted-foreground dark:text-foreground">
                        <div className="p-2">
                          <Database className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
                        </div>
                        Memory Details
                      </CardTitle>
                      <CardDescription className="text-muted-foreground dark:text-muted-foreground">
                        Current memory statistics
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground dark:text-muted-foreground">Total Usage</span>
                          <span className="font-medium text-muted-foreground dark:text-foreground">
                            {allCurrentMetrics.data?.memory ? `${allCurrentMetrics.data.memory.toFixed(1)}%` : '--'}
                          </span>
                        </div>
                        <div className="w-full bg-muted dark:bg-muted rounded-full h-2 sm:h-2.5">
                          <div 
                            className="h-2 sm:h-2.5 rounded-full transition-all duration-300"
                            style={{ width: `${allCurrentMetrics.data?.memory || 0}%` }}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground dark:text-muted-foreground">Available</span>
                          <span className="font-medium text-muted-foreground dark:text-foreground">
                            {allCurrentMetrics.data?.memory ? `${(100 - allCurrentMetrics.data.memory).toFixed(1)}%` : '--'}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border border-border dark:border-border bg-card dark:bg-card transition-all duration-300">
                    <CardHeader className="p-4 sm:p-6">
                      <CardTitle className="flex items-center gap-2 text-muted-foreground dark:text-foreground">
                        <div className="p-2">
                          <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
                        </div>
                        Memory Status
                      </CardTitle>
                      <CardDescription className="text-muted-foreground dark:text-muted-foreground">
                        Memory health indicator
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6">
                      <div className="text-center">
                        <div className={`inline-flex items-center px-3 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium ${ allCurrentMetrics.data?.memory && allCurrentMetrics.data.memory > 90 ? 'bg-muted text-foreground' : 'bg-muted text-muted-foreground' }`}>
                          {allCurrentMetrics.data?.memory && allCurrentMetrics.data.memory > 90 
                            ? 'Critical'
                            : allCurrentMetrics.data?.memory && allCurrentMetrics.data.memory > 75
                            ? 'Warning'
                            : 'Healthy'
                          }
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Disk Tab */}
            <TabsContent value="disk" className="space-y-4 sm:space-y-6">
              <div className="grid gap-4 sm:gap-6">
                <Card className="border border-border dark:border-border bg-card dark:bg-card transition-all duration-300">
                  <MetricsChart
                    title="Disk Usage Over Time"
                    description="Storage metrics and I/O operations"
                    data={allMetricsRange.diskRange.data || []}
                    dataKeys={[
                      { key: 'value', color: '#a3a3a3', name: 'Disk Usage' },
                    ]}
                    isLoading={allMetricsRange.diskRange.isLoading}
                    isError={allMetricsRange.diskRange.isError}
                    errorMessage="Failed to load disk usage data"
                    onRefresh={handleRefresh}
                    height={400}
                    yAxisDomain={[0, 100]}
                    formatYAxis={(value) => `${value}%`}
                    formatTooltip={(value, name) => [`${value.toFixed(1)}%`, name]}
                  />
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <Card className="border border-border dark:border-border bg-card dark:bg-card transition-all duration-300">
                    <CardHeader className="p-4 sm:p-6">
                      <CardTitle className="flex items-center gap-2 text-muted-foreground dark:text-foreground">
                        <div className="p-2">
                          <HardDrive className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
                        </div>
                        Disk Details
                      </CardTitle>
                      <CardDescription className="text-muted-foreground dark:text-muted-foreground">
                        Current disk statistics
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground dark:text-muted-foreground">Storage Used</span>
                          <span className="font-medium text-muted-foreground dark:text-foreground">
                            {allCurrentMetrics.data?.disk ? `${allCurrentMetrics.data.disk.toFixed(1)}%` : '--'}
                          </span>
                        </div>
                        <div className="w-full bg-muted dark:bg-muted rounded-full h-2 sm:h-2.5">
                          <div 
                            className="h-2 sm:h-2.5 rounded-full transition-all duration-300"
                            style={{ width: `${allCurrentMetrics.data?.disk || 0}%` }}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground dark:text-muted-foreground">Available</span>
                          <span className="font-medium text-muted-foreground dark:text-foreground">
                            {allCurrentMetrics.data?.disk ? `${(100 - allCurrentMetrics.data.disk).toFixed(1)}%` : '--'}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border border-border dark:border-border bg-card dark:bg-card transition-all duration-300">
                    <CardHeader className="p-4 sm:p-6">
                      <CardTitle className="flex items-center gap-2 text-muted-foreground dark:text-foreground">
                        <div className="p-2">
                          <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
                        </div>
                        Disk Status
                      </CardTitle>
                      <CardDescription className="text-muted-foreground dark:text-muted-foreground">
                        Storage health indicator
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6">
                      <div className="text-center">
                        <div className={`inline-flex items-center px-3 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium ${ allCurrentMetrics.data?.disk && allCurrentMetrics.data.disk > 90 ? 'bg-muted text-foreground' : 'bg-muted text-muted-foreground' }`}>
                          {allCurrentMetrics.data?.disk && allCurrentMetrics.data.disk > 90 
                            ? 'Critical'
                            : allCurrentMetrics.data?.disk && allCurrentMetrics.data.disk > 80
                            ? 'Warning'
                            : 'Healthy'
                          }
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Network Tab */}
            <TabsContent value="network" className="space-y-4 sm:space-y-6">
              <div className="grid gap-4 sm:gap-6">
                <Card className="border border-border dark:border-border bg-card dark:bg-card transition-all duration-300">
                  <MetricsChart
                    title="Network Traffic Over Time"
                    description="Network throughput and connections"
                    data={allMetricsRange.networkRange.data || []}
                    dataKeys={[
                      { key: 'inbound', color: '#525252', name: 'Inbound' },
                      { key: 'outbound', color: '#262626', name: 'Outbound' },
                    ]}
                    isLoading={allMetricsRange.networkRange.isLoading}
                    isError={allMetricsRange.networkRange.isError}
                    errorMessage="Failed to load network traffic data"
                    onRefresh={handleRefresh}
                    chartType="area"
                    height={400}
                    formatYAxis={(value) => `${value.toFixed(1)} MB/s`}
                    formatTooltip={(value, name) => [`${value.toFixed(2)} MB/s`, name]}
                  />
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <Card className="border border-border dark:border-border bg-card dark:bg-card transition-all duration-300">
                    <CardHeader className="p-4 sm:p-6">
                      <CardTitle className="flex items-center gap-2 text-muted-foreground dark:text-foreground">
                        <div className="p-2">
                          <Wifi className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
                        </div>
                        Network Details
                      </CardTitle>
                      <CardDescription className="text-muted-foreground dark:text-muted-foreground">
                        Current network statistics
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground dark:text-muted-foreground">Inbound</span>
                          <span className="font-medium text-muted-foreground dark:text-foreground">
                            {allCurrentMetrics.data?.network ? `${allCurrentMetrics.data.network.inbound.toFixed(2)} MB/s` : '--'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground dark:text-muted-foreground">Outbound</span>
                          <span className="font-medium text-muted-foreground dark:text-foreground">
                            {allCurrentMetrics.data?.network ? `${allCurrentMetrics.data.network.outbound.toFixed(2)} MB/s` : '--'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground dark:text-muted-foreground">Total</span>
                          <span className="font-medium text-muted-foreground dark:text-foreground">
                            {allCurrentMetrics.data?.network ? `${(allCurrentMetrics.data.network.inbound + allCurrentMetrics.data.network.outbound).toFixed(2)} MB/s` : '--'}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border border-border dark:border-border bg-card dark:bg-card transition-all duration-300">
                    <CardHeader className="p-4 sm:p-6">
                      <CardTitle className="flex items-center gap-2 text-muted-foreground dark:text-foreground">
                        <div className="p-2">
                          <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
                        </div>
                        Network Status
                      </CardTitle>
                      <CardDescription className="text-muted-foreground dark:text-muted-foreground">
                        Connection health indicator
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6">
                      <div className="text-center">
                        <div className="inline-flex items-center px-3 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium text-foreground">
                          Active
                        </div>
                        <p className="text-sm text-muted-foreground dark:text-muted-foreground mt-2">
                          Network interfaces are operational
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}
