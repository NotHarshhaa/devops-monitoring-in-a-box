"use client"

import React from "react"
import { motion } from "framer-motion"
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Clock,
  Calendar,
  Download,
  ArrowUpDown,
  Filter,
  RefreshCw
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
    allMetricsRange.cpuRange.data || [],
    allMetricsRange.memoryRange.data || [],
    allMetricsRange.diskRange.data || []
  )

  const networkTrafficData = allMetricsRange.networkRange.data || []

  return (
    <div className="space-y-4 sm:space-y-6 pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="min-w-0 flex-1"
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">Metrics</h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            Real-time system performance metrics from Prometheus
          </p>
        </motion.div>

        <div className="flex flex-wrap items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[120px] sm:w-[140px] h-9 sm:h-10">
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

          <Button variant="outline" size="sm" className="gap-1.5 h-9 sm:h-10" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          <Button variant="outline" size="sm" className="gap-1.5 h-9 sm:h-10">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        </div>
      </div>

      {/* Real-time Metrics Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <MetricsOverview />
      </motion.div>

      {/* System Load Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-8"
      >
        <SystemLoadOverview />
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="mb-6">
        <TabsList className="h-10 sm:h-11 w-full grid grid-cols-2 sm:grid-cols-5">
          <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
          <TabsTrigger value="cpu" className="text-xs sm:text-sm">CPU</TabsTrigger>
          <TabsTrigger value="memory" className="text-xs sm:text-sm">Memory</TabsTrigger>
          <TabsTrigger value="disk" className="text-xs sm:text-sm">Disk</TabsTrigger>
          <TabsTrigger value="network" className="text-xs sm:text-sm">Network</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-2"
            >
              <MetricsChart
                title="System Resource Usage"
                description="CPU, memory, and disk utilization over time"
                data={systemResourceData}
                dataKeys={[
                  { key: 'cpu', color: '#3b82f6', name: 'CPU' },
                  { key: 'memory', color: '#10b981', name: 'Memory' },
                  { key: 'disk', color: '#f59e0b', name: 'Disk' },
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
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Resource Distribution</CardTitle>
                  <CardDescription>
                    Current system resource allocation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {allCurrentMetrics.data ? (
                      <>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs sm:text-sm text-muted-foreground">CPU</span>
                            <span className="text-sm sm:text-base font-medium">{allCurrentMetrics.data.cpu.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2 sm:h-2.5">
                            <div 
                              className="bg-blue-500 h-2 sm:h-2.5 rounded-full transition-all duration-300"
                              style={{ width: `${allCurrentMetrics.data.cpu}%` }}
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs sm:text-sm text-muted-foreground">Memory</span>
                            <span className="text-sm sm:text-base font-medium">{allCurrentMetrics.data.memory.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2 sm:h-2.5">
                            <div 
                              className="bg-green-500 h-2 sm:h-2.5 rounded-full transition-all duration-300"
                              style={{ width: `${allCurrentMetrics.data.memory}%` }}
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs sm:text-sm text-muted-foreground">Disk</span>
                            <span className="text-sm sm:text-base font-medium">{allCurrentMetrics.data.disk.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2 sm:h-2.5">
                            <div 
                              className="bg-yellow-500 h-2 sm:h-2.5 rounded-full transition-all duration-300"
                              style={{ width: `${allCurrentMetrics.data.disk}%` }}
                            />
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center text-muted-foreground py-8 sm:py-12">
                        {allCurrentMetrics.isLoading ? (
                          <div className="flex flex-col items-center justify-center gap-3">
                            <RefreshCw className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-primary" />
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <MetricsChart
                title="Network Traffic"
                description="Inbound and outbound network traffic"
                data={networkTrafficData}
                dataKeys={[
                  { key: 'inbound', color: '#3b82f6', name: 'Inbound' },
                  { key: 'outbound', color: '#ef4444', name: 'Outbound' },
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
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Memory Usage Breakdown</CardTitle>
                  <CardDescription>
                    Memory usage by type
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {allCurrentMetrics.data ? (
                      <>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs sm:text-sm text-muted-foreground">Used</span>
                            <span className="text-sm sm:text-base font-medium">{allCurrentMetrics.data.memory.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2 sm:h-2.5">
                            <div 
                              className="bg-green-500 h-2 sm:h-2.5 rounded-full transition-all duration-300"
                              style={{ width: `${allCurrentMetrics.data.memory}%` }}
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs sm:text-sm text-muted-foreground">Available</span>
                            <span className="text-sm sm:text-base font-medium">{(100 - allCurrentMetrics.data.memory).toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2 sm:h-2.5">
                            <div 
                              className="bg-blue-500 h-2 sm:h-2.5 rounded-full transition-all duration-300"
                              style={{ width: `${100 - allCurrentMetrics.data.memory}%` }}
                            />
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center text-muted-foreground py-8 sm:py-12">
                        {allCurrentMetrics.isLoading ? (
                          <div className="flex flex-col items-center justify-center gap-3">
                            <RefreshCw className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-primary" />
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
        <TabsContent value="cpu">
          <div className="grid gap-6">
            <MetricsChart
              title="CPU Usage Over Time"
              description="Detailed CPU utilization metrics"
              data={allMetricsRange.cpuRange.data || []}
              dataKeys={[
                { key: 'value', color: '#3b82f6', name: 'CPU Usage' },
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Current Usage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold">
                      {allCurrentMetrics.data?.cpu ? `${allCurrentMetrics.data.cpu.toFixed(1)}%` : '--'}
                    </div>
                    <div className="flex items-center text-green-500">
                      <TrendingDown className="h-4 w-4 mr-1" />
                      <span className="text-sm">Real-time</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Average Load</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-xl font-bold">
                        {allCurrentMetrics.data?.load.load1 ? allCurrentMetrics.data.load.load1.toFixed(1) : '--'}
                      </div>
                      <div className="text-sm text-muted-foreground">1 min</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold">
                        {allCurrentMetrics.data?.load.load5 ? allCurrentMetrics.data.load.load5.toFixed(1) : '--'}
                      </div>
                      <div className="text-sm text-muted-foreground">5 min</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold">
                        {allCurrentMetrics.data?.load.load15 ? allCurrentMetrics.data.load.load15.toFixed(1) : '--'}
                      </div>
                      <div className="text-sm text-muted-foreground">15 min</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      allCurrentMetrics.data?.cpu && allCurrentMetrics.data.cpu > 80 
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        : allCurrentMetrics.data?.cpu && allCurrentMetrics.data.cpu > 60
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    }`}>
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
        <TabsContent value="memory">
          <div className="grid gap-6">
            <MetricsChart
              title="Memory Usage Over Time"
              description="RAM utilization over time"
              data={allMetricsRange.memoryRange.data || []}
              dataKeys={[
                { key: 'value', color: '#10b981', name: 'Memory Usage' },
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Memory Details</CardTitle>
                  <CardDescription>
                    Current memory statistics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Total Usage</span>
                      <span className="font-medium">
                        {allCurrentMetrics.data?.memory ? `${allCurrentMetrics.data.memory.toFixed(1)}%` : '--'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${allCurrentMetrics.data?.memory || 0}%` }}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Available</span>
                      <span className="font-medium">
                        {allCurrentMetrics.data?.memory ? `${(100 - allCurrentMetrics.data.memory).toFixed(1)}%` : '--'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Memory Status</CardTitle>
                  <CardDescription>
                    Memory health indicator
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      allCurrentMetrics.data?.memory && allCurrentMetrics.data.memory > 90 
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        : allCurrentMetrics.data?.memory && allCurrentMetrics.data.memory > 75
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    }`}>
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
        <TabsContent value="disk">
          <div className="grid gap-6">
            <MetricsChart
              title="Disk Usage Over Time"
              description="Storage metrics and I/O operations"
              data={allMetricsRange.diskRange.data || []}
              dataKeys={[
                { key: 'value', color: '#f59e0b', name: 'Disk Usage' },
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Disk Details</CardTitle>
                  <CardDescription>
                    Current disk statistics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Storage Used</span>
                      <span className="font-medium">
                        {allCurrentMetrics.data?.disk ? `${allCurrentMetrics.data.disk.toFixed(1)}%` : '--'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${allCurrentMetrics.data?.disk || 0}%` }}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Available</span>
                      <span className="font-medium">
                        {allCurrentMetrics.data?.disk ? `${(100 - allCurrentMetrics.data.disk).toFixed(1)}%` : '--'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Disk Status</CardTitle>
                  <CardDescription>
                    Storage health indicator
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      allCurrentMetrics.data?.disk && allCurrentMetrics.data.disk > 90 
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        : allCurrentMetrics.data?.disk && allCurrentMetrics.data.disk > 80
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    }`}>
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
        <TabsContent value="network">
          <div className="grid gap-6">
            <MetricsChart
              title="Network Traffic Over Time"
              description="Network throughput and connections"
              data={allMetricsRange.networkRange.data || []}
              dataKeys={[
                { key: 'inbound', color: '#3b82f6', name: 'Inbound' },
                { key: 'outbound', color: '#ef4444', name: 'Outbound' },
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Network Details</CardTitle>
                  <CardDescription>
                    Current network statistics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Inbound</span>
                      <span className="font-medium">
                        {allCurrentMetrics.data?.network ? `${allCurrentMetrics.data.network.inbound.toFixed(2)} MB/s` : '--'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Outbound</span>
                      <span className="font-medium">
                        {allCurrentMetrics.data?.network ? `${allCurrentMetrics.data.network.outbound.toFixed(2)} MB/s` : '--'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Total</span>
                      <span className="font-medium">
                        {allCurrentMetrics.data?.network ? `${(allCurrentMetrics.data.network.inbound + allCurrentMetrics.data.network.outbound).toFixed(2)} MB/s` : '--'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Network Status</CardTitle>
                  <CardDescription>
                    Connection health indicator
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      Active
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Network interfaces are operational
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
