"use client"

import React, { Suspense, lazy, memo, useMemo } from "react"
import { motion } from "framer-motion"
import {
  Cpu,
  HardDrive,
  Network,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Bell,
  Settings,
  FileText,
  ExternalLink
} from "lucide-react"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"

// Lazy load heavy components for better performance
const DynamicMetrics = lazy(() => import("@/components/dynamic-metrics").then(module => ({ default: module.DynamicMetrics })))
const MetricsConfigSummary = lazy(() => import("@/components/dynamic-metrics").then(module => ({ default: module.MetricsConfigSummary })))
const VersionMonitor = lazy(() => import("@/components/version-monitor").then(module => ({ default: module.VersionMonitor })))

import { useMultiTenantDashboardConfig } from "@/lib/hooks/use-multi-tenant-config"
import { useAllCurrentMetrics, getTimeRange } from "@/lib/hooks/use-prometheus-metrics"
import { useAlertmanagerAlerts } from "@/lib/hooks/use-alertmanager-alerts"
import { useServiceHealth } from "@/lib/hooks/use-service-health"
import { useRecentLogs } from "@/lib/hooks/use-loki-logs"
import { usePrometheusTargets } from "@/lib/hooks/use-prometheus-targets"
import { healthAPI } from "@/lib/health-api"

type StatCardProps = {
  title: string
  value: string | number
  trend: string
  trendValue: string
  icon: React.ReactNode
  iconColor: string
  iconBgColor: string
}

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: "easeOut",
    },
  }),
}

function StatCard({ title, value, trend, trendValue, icon, iconColor, iconBgColor }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center">
          <div className={`p-2 sm:p-3 rounded-full ${iconBgColor} flex-shrink-0`}>
            <div className={iconColor}>{icon}</div>
          </div>
          <div className="ml-3 sm:ml-4 min-w-0 flex-1">
            <p className="text-sm font-medium text-muted-foreground truncate">{title}</p>
            <p className="text-xl sm:text-2xl font-bold">{value}</p>
          </div>
        </div>
        <div className="mt-3 sm:mt-4">
          <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-green-500 flex-shrink-0" />
            <span className="truncate">{trendValue} from last hour</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function getSeverityIcon(severity: string) {
  switch (severity) {
    case "error":
      return <AlertTriangle className="h-4 w-4" />
    case "warning":
      return <AlertTriangle className="h-4 w-4" />
    case "info":
      return <CheckCircle className="h-4 w-4" />
    default:
      return <Clock className="h-4 w-4" />
  }
}

function getSeverityColor(severity: string) {
  switch (severity?.toLowerCase()) {
    case "critical":
    case "error":
      return "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
    case "warning":
      return "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400"
    case "info":
      return "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
    default:
      return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
  }
}

function formatTimeAgo(timestamp: string): string {
  try {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  } catch {
    return "Unknown"
  }
}

function getHealthStatusColor(status: 'up' | 'down' | 'checking'): string {
  switch (status) {
    case 'up':
      return 'bg-green-500'
    case 'down':
      return 'bg-red-500'
    default:
      return 'bg-yellow-500'
  }
}

function getHealthStatusText(status: 'up' | 'down' | 'checking'): string {
  switch (status) {
    case 'up':
      return 'Healthy'
    case 'down':
      return 'Down'
    default:
      return 'Checking'
  }
}

export default function DashboardPage() {
  const { dashboardConfig, isLoading, error } = useMultiTenantDashboardConfig();
  
  // Real monitoring data
  const currentMetrics = useAllCurrentMetrics()
  const alerts = useAlertmanagerAlerts()
  const serviceHealth = useServiceHealth()
  const recentLogs = useRecentLogs(10)
  const targets = usePrometheusTargets()
  
  // Get service URLs for links
  const serviceUrls = useMemo(() => healthAPI.getServiceUrls(), [])
  
  // Get recent alerts (firing first, then by time)
  const recentAlertsList = useMemo(() => {
    if (!alerts.alerts || alerts.alerts.length === 0) return []
    
    return alerts.alerts
      .filter(alert => alert.status.state === 'active' || alert.status.state === 'suppressed')
      .sort((a, b) => {
        // Firing alerts first
        if (a.status.state === 'active' && b.status.state !== 'active') return -1
        if (b.status.state === 'active' && a.status.state !== 'active') return 1
        // Then by time (newest first)
        return new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime()
      })
      .slice(0, 5)
      .map(alert => ({
        id: alert.id,
        severity: alert.labels.severity || alert.labels.alertname || 'info',
        message: alert.annotations.summary || alert.annotations.description || alert.labels.alertname || 'Alert',
        time: formatTimeAgo(alert.startsAt),
        state: alert.status.state
      }))
  }, [alerts.alerts])
  
  // Calculate target stats
  const targetStats = useMemo(() => {
    if (!targets.data) return { up: 0, down: 0, total: 0 }
    
    const up = targets.data.filter(t => t.health === 'up').length
    const down = targets.data.filter(t => t.health === 'down').length
    
    return {
      up,
      down,
      total: targets.data.length
    }
  }, [targets.data])

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
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold break-words text-foreground">
            {dashboardConfig?.title || 'Dashboard'}
          </h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base break-words">
            {dashboardConfig?.description || 'Monitor your system health and performance'}
          </p>
        </motion.div>
      </div>

      {/* Real System Metrics Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {/* CPU Usage */}
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center">
                <div className="p-2 sm:p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 flex-shrink-0">
                  <Cpu className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                  <p className="text-sm font-medium text-muted-foreground truncate">CPU Usage</p>
                  <p className="text-xl sm:text-2xl font-bold">
                    {currentMetrics.isLoading ? (
                      <Skeleton className="h-7 w-16 inline-block" />
                    ) : currentMetrics.error ? (
                      <span className="text-red-500">Error</span>
                    ) : (
                      `${(currentMetrics.data?.cpu || 0).toFixed(1)}%`
                    )}
                  </p>
                </div>
              </div>
              {currentMetrics.data?.load && (
                <div className="mt-3 sm:mt-4">
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Load: {currentMetrics.data.load.load1.toFixed(2)} / {currentMetrics.data.load.load5.toFixed(2)} / {currentMetrics.data.load.load15.toFixed(2)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Memory Usage */}
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center">
                <div className="p-2 sm:p-3 rounded-full bg-purple-100 dark:bg-purple-900/30 flex-shrink-0">
                  <HardDrive className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                  <p className="text-sm font-medium text-muted-foreground truncate">Memory Usage</p>
                  <p className="text-xl sm:text-2xl font-bold">
                    {currentMetrics.isLoading ? (
                      <Skeleton className="h-7 w-16 inline-block" />
                    ) : currentMetrics.error ? (
                      <span className="text-red-500">Error</span>
                    ) : (
                      `${(currentMetrics.data?.memory || 0).toFixed(1)}%`
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Disk Usage */}
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center">
                <div className="p-2 sm:p-3 rounded-full bg-green-100 dark:bg-green-900/30 flex-shrink-0">
                  <HardDrive className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                  <p className="text-sm font-medium text-muted-foreground truncate">Disk Usage</p>
                  <p className="text-xl sm:text-2xl font-bold">
                    {currentMetrics.isLoading ? (
                      <Skeleton className="h-7 w-16 inline-block" />
                    ) : currentMetrics.error ? (
                      <span className="text-red-500">Error</span>
                    ) : (
                      `${(currentMetrics.data?.disk || 0).toFixed(1)}%`
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Network Traffic */}
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center">
                <div className="p-2 sm:p-3 rounded-full bg-orange-100 dark:bg-orange-900/30 flex-shrink-0">
                  <Network className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                  <p className="text-sm font-medium text-muted-foreground truncate">Network</p>
                  <p className="text-xl sm:text-2xl font-bold">
                    {currentMetrics.isLoading ? (
                      <Skeleton className="h-7 w-16 inline-block" />
                    ) : currentMetrics.error ? (
                      <span className="text-red-500">Error</span>
                    ) : (
                      `${((currentMetrics.data?.network?.inbound || 0) + (currentMetrics.data?.network?.outbound || 0)).toFixed(1)} MB/s`
                    )}
                  </p>
                </div>
              </div>
              {currentMetrics.data?.network && (
                <div className="mt-3 sm:mt-4">
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    ↓ {(currentMetrics.data.network.inbound || 0).toFixed(1)} ↑ {(currentMetrics.data.network.outbound || 0).toFixed(1)} MB/s
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Dynamic Metrics */}
      <Suspense fallback={
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <Skeleton className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg flex-shrink-0" />
                  <div className="space-y-2 flex-1 min-w-0">
                    <Skeleton className="h-4 w-full max-w-[120px]" />
                    <Skeleton className="h-6 sm:h-7 w-full max-w-[80px]" />
                  </div>
                </div>
                <div className="mt-3 sm:mt-4">
                  <Skeleton className="h-3 w-full max-w-[100px]" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      }>
        <DynamicMetrics 
          showCards={true}
          showCharts={false}
          groupBy={false}
        />
      </Suspense>

      {/* Configuration Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Suspense fallback={<Card><CardContent><Skeleton className="h-32 w-full" /></CardContent></Card>}>
          <MetricsConfigSummary />
        </Suspense>
      </motion.div>

      {/* Dynamic Charts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Suspense fallback={<Card><CardContent><Skeleton className="h-64 w-full" /></CardContent></Card>}>
          <DynamicMetrics 
            showCards={false}
            showCharts={true}
            groupBy={true}
          />
        </Suspense>
      </motion.div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {/* Recent Alerts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg sm:text-xl">
                Recent Alerts
                {alerts.stats && alerts.stats.firing > 0 && (
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    ({alerts.stats.firing} firing)
                  </span>
                )}
              </CardTitle>
              <Link href="/alerts">
                <Button variant="outline" size="sm" className="h-8">
                  <Bell className="h-4 w-4 mr-1.5 sm:mr-2" />
                  <span className="hidden sm:inline">View All</span>
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {alerts.loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : alerts.error ? (
                <div className="text-sm text-muted-foreground text-center py-4">
                  Failed to load alerts: {alerts.error}
                </div>
              ) : recentAlertsList.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-4">
                  No active alerts
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {recentAlertsList.map((alert) => (
                    <div key={alert.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <div
                        className={`p-2 rounded-lg flex-shrink-0 ${getSeverityColor(alert.severity)}`}
                      >
                        {getSeverityIcon(alert.severity)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium break-words">{alert.message}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-muted-foreground">{alert.time}</p>
                          {alert.state === 'active' && (
                            <span className="text-xs px-1.5 py-0.5 rounded bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                              Firing
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Logs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.65 }}
        >
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg sm:text-xl">Recent Logs</CardTitle>
              <Link href="/logs">
                <Button variant="outline" size="sm" className="h-8">
                  <FileText className="h-4 w-4 mr-1.5 sm:mr-2" />
                  <span className="hidden sm:inline">View All</span>
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {recentLogs.isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : recentLogs.error ? (
                <div className="text-sm text-muted-foreground text-center py-4">
                  Failed to load logs
                </div>
              ) : !recentLogs.data || recentLogs.data.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-4">
                  No recent logs
                </div>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {recentLogs.data.slice(0, 5).map((log, idx) => (
                    <div key={idx} className="p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-start gap-2">
                        <Clock className="h-3 w-3 mt-0.5 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-mono break-words text-sm">{log.line}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {log.labels.job && <span className="mr-2">{log.labels.job}</span>}
                            {formatTimeAgo(new Date(parseInt(log.timestamp) / 1000000).toISOString())}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Prometheus Targets Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">
                Scrape Targets
                {targetStats.total > 0 && (
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    ({targetStats.up}/{targetStats.total} up)
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {targets.isLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : targets.error ? (
                <div className="text-sm text-muted-foreground text-center py-4">
                  Failed to load targets
                </div>
              ) : !targets.data || targets.data.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-4">
                  No targets configured
                </div>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {targets.data.slice(0, 8).map((target, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{target.labels.job || target.scrapePool}</p>
                        <p className="text-xs text-muted-foreground truncate">{target.scrapeUrl}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {(() => {
                          const healthStatus = target.health === 'unknown' ? 'checking' : target.health as 'up' | 'down' | 'checking'
                          return (
                            <>
                              {healthStatus === 'up' && (
                                <div className="relative flex h-2.5 w-2.5">
                                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${getHealthStatusColor(healthStatus)} opacity-75`}></span>
                                  <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${getHealthStatusColor(healthStatus)}`}></span>
                                </div>
                              )}
                              {healthStatus !== 'up' && (
                                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${getHealthStatusColor(healthStatus)}`}></span>
                              )}
                              <span className={`text-xs font-medium ${
                                healthStatus === 'up' ? 'text-green-600 dark:text-green-500' :
                                healthStatus === 'down' ? 'text-red-600 dark:text-red-500' :
                                'text-yellow-600 dark:text-yellow-500'
                              }`}>
                                {getHealthStatusText(healthStatus)}
                              </span>
                            </>
                          )
                        })()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* System Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="lg:col-span-2 xl:col-span-1"
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">
                Service Status
                {serviceHealth.data && (
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    ({serviceHealth.data.services.filter(s => s.status === 'up').length}/{serviceHealth.data.services.length} up)
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {serviceHealth.isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : serviceHealth.error ? (
                <div className="text-sm text-muted-foreground text-center py-4">
                  Failed to check service health
                </div>
              ) : !serviceHealth.data || serviceHealth.data.services.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-4">
                  No services configured
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {serviceHealth.data.services.map((service) => {
                    const iconMap: Record<string, React.ReactNode> = {
                      'Prometheus': <Cpu className="h-4 w-4 mr-2 flex-shrink-0" />,
                      'Grafana': <HardDrive className="h-4 w-4 mr-2 flex-shrink-0" />,
                      'Loki': <Network className="h-4 w-4 mr-2 flex-shrink-0" />,
                      'Alertmanager': <Bell className="h-4 w-4 mr-2 flex-shrink-0" />,
                    }
                    
                    return (
                      <div key={service.name} className="flex items-center justify-between gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                        <a
                          href={service.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary font-medium hover:underline flex items-center min-w-0 flex-1"
                        >
                          {iconMap[service.name] || <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />}
                          <span className="truncate">{service.name}</span>
                          <ExternalLink className="h-3 w-3 ml-1 opacity-50" />
                        </a>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {service.status === 'up' && (
                            <div className="relative flex h-2.5 w-2.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                            </div>
                          )}
                          {service.status === 'down' && (
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                          )}
                          {service.status === 'checking' && (
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-500"></span>
                          )}
                          <span className={`text-xs sm:text-sm font-medium ${
                            service.status === 'up' ? 'text-green-600 dark:text-green-500' :
                            service.status === 'down' ? 'text-red-600 dark:text-red-500' :
                            'text-yellow-600 dark:text-yellow-500'
                          }`}>
                            {getHealthStatusText(service.status)}
                          </span>
                          {service.responseTime && service.status === 'up' && (
                            <span className="text-xs text-muted-foreground">
                              {service.responseTime}ms
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Component Versions Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.9 }}
      >
        <Suspense fallback={<Card><CardContent><Skeleton className="h-32 w-full" /></CardContent></Card>}>
          <VersionMonitor 
            showDetails={false}
            autoRefresh={false}
          />
        </Suspense>
      </motion.div>
    </div>
  )
}
