"use client"

import React, { Suspense, lazy, useState } from "react"
import { motion } from "framer-motion"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  CpuIcon,
  HardDriveIcon,
  Alert02Icon,
  Clock01Icon,
  Notification01Icon,
  Settings01Icon,
  Activity01Icon,
  FlashIcon,
  DatabaseIcon,
  CloudServerIcon,
  Analytics01Icon,
  PieChartIcon,
  GlobeIcon,
  WifiIcon,
  RefreshIcon,
  Download01Icon,
  EyeIcon,
  FilterIcon,
  Calendar01Icon,
  ArrowUpRight01Icon,
  ArrowDownRight01Icon,
  MoreHorizontalIcon,
  AlertCircleIcon,
  InformationCircleIcon,
  Cancel01Icon
} from "@hugeicons/core-free-icons"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { useMultiTenantDashboardConfig } from "@/lib/hooks/use-multi-tenant-config"
import { VersionBadge } from "@/components/version-badge"

// Lazy load heavy components for better performance
const DynamicMetrics = lazy(() => import("@/components/dynamic-metrics").then(module => ({ default: module.DynamicMetrics })))
const MetricsConfigSummary = lazy(() => import("@/components/dynamic-metrics").then(module => ({ default: module.MetricsConfigSummary })))
const VersionMonitor = lazy(() => import("@/components/version-monitor").then(module => ({ default: module.VersionMonitor })))

// Enhanced mock data with more realistic metrics
const systemMetrics = {
  cpu: 45,
  memory: 67,
  disk: 23,
  network: 12,
  uptime: 99.9,
  requests: 12543,
  errors: 0.02,
  responseTime: 145
}

const performanceData = [
  { time: "00:00", cpu: 30, memory: 50, disk: 20, network: 15 },
  { time: "04:00", cpu: 45, memory: 60, disk: 22, network: 18 },
  { time: "08:00", cpu: 65, memory: 70, disk: 25, network: 25 },
  { time: "12:00", cpu: 80, memory: 75, disk: 28, network: 35 },
  { time: "16:00", cpu: 70, memory: 72, disk: 26, network: 30 },
  { time: "20:00", cpu: 55, memory: 65, disk: 24, network: 20 },
  { time: "24:00", cpu: 40, memory: 58, disk: 21, network: 12 },
]

const trafficData = [
  { name: "Mon", requests: 4000, errors: 240 },
  { name: "Tue", requests: 3000, errors: 139 },
  { name: "Wed", requests: 2000, errors: 380 },
  { name: "Thu", requests: 2780, errors: 390 },
  { name: "Fri", requests: 1890, errors: 480 },
  { name: "Sat", requests: 2390, errors: 380 },
  { name: "Sun", requests: 3490, errors: 430 },
]

const serviceDistribution = [
  { name: "API", value: 35, color: "#525252" },
  { name: "Database", value: 25, color: "#737373" },
  { name: "Cache", value: 20, color: "#a3a3a3" },
  { name: "Storage", value: 15, color: "#404040" },
  { name: "Other", value: 5, color: "#6b7280" },
]

const recentAlerts = [
  { id: 1, severity: "critical", message: "Database connection pool exhausted", time: "2 minutes ago", service: "Database" },
  { id: 2, severity: "warning", message: "High memory usage detected", time: "15 minutes ago", service: "API Server" },
  { id: 3, severity: "info", message: "System backup completed successfully", time: "1 hour ago", service: "Backup Service" },
  { id: 4, severity: "error", message: "Failed to connect to external service", time: "3 hours ago", service: "Integration" },
]

const services = [
  { name: "API Gateway", status: "healthy", uptime: 99.9, responseTime: 45, requests: 1234 },
  { name: "Database", status: "healthy", uptime: 99.8, responseTime: 23, requests: 567 },
  { name: "Cache Service", status: "warning", uptime: 98.5, responseTime: 12, requests: 890 },
  { name: "File Storage", status: "healthy", uptime: 99.7, responseTime: 67, requests: 234 },
]

// Enhanced Stat Card with mobile-responsive design
function StatCard({ 
  title, 
  value, 
  trend, 
  trendValue, 
  icon, 
  iconColor, 
  iconBgColor,
  description,
  progress
}: {
  title: string
  value: string | number
  trend: string
  trendValue: string
  icon: React.ReactNode
  iconColor: string
  iconBgColor: string
  description?: string
  progress?: number
}) {
  const isPositive = trend === "up"
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -4, scale: 1.02, transition: { duration: 0.2 } }}
      className="h-full"
    >
      <Card className="h-full border-border bg-card">
        <CardContent className="p-4 sm:p-5">
          <div className="mb-3 flex items-start justify-between gap-2 sm:mb-4">
            <div className={`flex size-9 shrink-0 items-center justify-center border border-border bg-background sm:size-10 ${iconBgColor}`}>
              <div className={iconColor}>{icon}</div>
            </div>
            <div
              className={`flex items-center border px-2 py-1 text-[11px] font-semibold ${ isPositive ? 'border-border text-foreground' : 'border-destructive/40 text-destructive' }`}
            >
              {isPositive ? (
                <HugeiconsIcon icon={ArrowUpRight01Icon} className="mr-1 size-3" />
              ) : (
                <HugeiconsIcon icon={ArrowDownRight01Icon} className="mr-1 size-3" />
              )}
              <span>{trendValue}</span>
            </div>
          </div>

          <div className="space-y-2 sm:space-y-3">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                {title}
              </p>
              <p className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
                {value}
              </p>
            </div>

            {description && (
              <p className="text-xs text-muted-foreground sm:text-sm">{description}</p>
            )}

            {progress !== undefined && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">Usage</span>
                  <span className="text-[11px] font-medium">{progress}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden border border-border bg-muted">
                  <div
                    className={`h-full transition-all duration-500 ${
                      progress > 80 ? 'bg-foreground' : 'bg-muted-foreground'
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Enhanced Alert Card with mobile-responsive design
function AlertCard({ alert }: { alert: typeof recentAlerts[0] }) {
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <HugeiconsIcon icon={Alert02Icon} className="h-3 w-3 sm:h-4 sm:w-4" />
      case "error":
        return <HugeiconsIcon icon={Cancel01Icon} className="h-3 w-3 sm:h-4 sm:w-4" />
      case "warning":
        return <HugeiconsIcon icon={AlertCircleIcon} className="h-3 w-3 sm:h-4 sm:w-4" />
      case "info":
        return <HugeiconsIcon icon={InformationCircleIcon} className="h-3 w-3 sm:h-4 sm:w-4" />
      default:
        return <HugeiconsIcon icon={Clock01Icon} className="h-3 w-3 sm:h-4 sm:w-4" />
    }
  }

  const getSeverityColor = (severity: string) => {
    return 'border-border bg-muted text-foreground'
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical":
        return <Badge variant="destructive" className="text-xs">Critical</Badge>
      case "error":
        return <Badge variant="destructive" className="text-xs">Error</Badge>
      case "warning":
        return <Badge variant="secondary" className="text-xs">Warning</Badge>
      case "info":
        return <Badge variant="default" className="text-xs">Info</Badge>
      default:
        return <Badge variant="outline" className="text-xs">Unknown</Badge>
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ x: 4 }}
    >
      <div className={`p-2 sm:p-3 border border-border ${getSeverityColor(alert.severity)} transition-all duration-200`}>
        <div className="flex items-start gap-2 sm:gap-3">
          <div className={`p-1.5 sm:p-2 border border-border flex-shrink-0 ${getSeverityColor(alert.severity)}`}>
            {getSeverityIcon(alert.severity)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 sm:gap-2 mb-1">
              {getSeverityBadge(alert.severity)}
              <span className="text-xs text-muted-foreground hidden sm:inline">{alert.service}</span>
            </div>
            <p className="text-xs sm:text-sm font-medium break-words">{alert.message}</p>
            <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
          </div>
          <Button variant="ghost" size="sm" className="h-6 w-6 sm:h-8 sm:w-8 p-0">
            <HugeiconsIcon icon={MoreHorizontalIcon} className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

// Enhanced Service Status Card with mobile-responsive design
function ServiceStatusCard({ service }: { service: typeof services[0] }) {
  const getStatusColor = (_status: string) => 'bg-foreground'

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "healthy":
        return <Badge className="bg-muted text-foreground border-border text-xs">Healthy</Badge>
      case "warning":
        return <Badge className="bg-muted text-foreground border-border text-xs">Warning</Badge>
      case "error":
        return <Badge variant="destructive" className="text-xs">Error</Badge>
      default:
        return <Badge variant="outline" className="text-xs">Unknown</Badge>
    }
  }

  const getServiceIcon = (name: string) => {
    if (name.includes("API")) return <HugeiconsIcon icon={GlobeIcon} className="h-3 w-3 sm:h-4 sm:w-4" />
    if (name.includes("Database")) return <HugeiconsIcon icon={DatabaseIcon} className="h-3 w-3 sm:h-4 sm:w-4" />
    if (name.includes("Cache")) return <HugeiconsIcon icon={FlashIcon} className="h-3 w-3 sm:h-4 sm:w-4" />
    if (name.includes("Storage")) return <HugeiconsIcon icon={HardDriveIcon} className="h-3 w-3 sm:h-4 sm:w-4" />
    return <HugeiconsIcon icon={CloudServerIcon} className="h-3 w-3 sm:h-4 sm:w-4" />
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <Card className="border-border bg-card overflow-hidden">
        <CardContent className="p-3 sm:p-5">
          {/* Service Header */}
          <div className="flex items-center justify-between mb-2 sm:mb-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className={`relative flex h-2 w-2 sm:h-3 sm:w-3`}>
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${getStatusColor(service.status)} opacity-75`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 sm:h-3 sm:w-3 ${getStatusColor(service.status)}`}></span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`p-1.5 sm:p-2 border border-border bg-background`}>
                  <div className="text-foreground">
                    {getServiceIcon(service.name)}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-muted-foreground dark:text-foreground text-sm sm:text-base">{service.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusBadge(service.status)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Service Metrics */}
          <div className="space-y-2 sm:space-y-3">
            {/* Uptime */}
            <div className="flex items-center justify-between p-2 sm:p-3 bg-muted dark:bg-muted border border-border dark:border-border">
              <div className="flex items-center gap-1 sm:gap-2">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-muted rounded-full"></div>
                <span className="text-xs sm:text-sm font-medium text-muted-foreground dark:text-muted-foreground">Uptime</span>
              </div>
              <div className="text-right">
                <div className="text-xs sm:text-sm font-bold text-muted-foreground dark:text-foreground">{service.uptime}%</div>
                <div className="w-12 sm:w-16 h-1 bg-muted dark:bg-muted mt-1">
                  <div 
                    className="h-full bg-foreground"
                    style={{ width: `${service.uptime}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Response Time */}
            <div className="flex items-center justify-between p-2 sm:p-3 bg-muted dark:bg-muted border border-border dark:border-border">
              <div className="flex items-center gap-1 sm:gap-2">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-muted rounded-full"></div>
                <span className="text-xs sm:text-sm font-medium text-muted-foreground dark:text-muted-foreground">Response</span>
              </div>
              <div className="text-right">
                <div className="text-xs sm:text-sm font-bold text-muted-foreground dark:text-foreground">{service.responseTime}ms</div>
                <div className="text-xs text-muted-foreground dark:text-muted-foreground hidden sm:block">
                  {service.responseTime < 50 ? 'Excellent' : service.responseTime < 100 ? 'Good' : 'Slow'}
                </div>
              </div>
            </div>

            {/* Requests */}
            <div className="flex items-center justify-between p-2 sm:p-3 bg-muted dark:bg-muted border border-border dark:border-border">
              <div className="flex items-center gap-1 sm:gap-2">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-muted rounded-full"></div>
                <span className="text-xs sm:text-sm font-medium text-muted-foreground dark:text-muted-foreground">Requests</span>
              </div>
              <div className="text-right">
                <div className="text-xs sm:text-sm font-bold text-muted-foreground dark:text-foreground">{service.requests.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground dark:text-muted-foreground hidden sm:block">Last 24h</div>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center justify-between p-2 sm:p-3 bg-muted dark:bg-muted border border-border dark:border-border">
              <div className="flex items-center gap-1 sm:gap-2">
                <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${getStatusColor(service.status)}`}></div>
                <span className="text-xs sm:text-sm font-medium text-muted-foreground dark:text-muted-foreground">Status</span>
              </div>
              <div className="text-right">
                <div className="text-xs sm:text-sm font-bold capitalize text-muted-foreground dark:text-foreground">{service.status}</div>
                <div className="text-xs text-muted-foreground dark:text-muted-foreground hidden sm:block">Real-time</div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-border dark:border-border">
            <Button variant="outline" size="sm" className="w-full gap-2 border-border dark:border-border hover:bg-muted dark:hover:bg-muted text-xs sm:text-sm">
              <HugeiconsIcon icon={EyeIcon} className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">View Details</span>
              <span className="sm:hidden">Details</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default function DashboardPage() {
  const { dashboardConfig, isLoading, error } = useMultiTenantDashboardConfig();
  const [selectedTimeRange, setSelectedTimeRange] = useState("24h");

  return (
    <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col gap-3 border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div>
              <h1 className="text-lg font-semibold tracking-tight sm:text-xl">
                {dashboardConfig?.title || 'Overview'}
              </h1>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Real-time metrics, services, and alerts
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <VersionBadge variant="compact" />
                <select 
                  value={selectedTimeRange} 
                  onChange={(e) => setSelectedTimeRange(e.target.value)}
                  className="h-9 border border-border bg-background px-3 text-xs sm:text-sm"
                >
                  <option value="1h">Last Hour</option>
                  <option value="24h">Last 24 Hours</option>
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                </select>
                <Button variant="outline" size="sm" className="gap-2">
                  <HugeiconsIcon icon={RefreshIcon} className="size-3.5" />
                  <span className="hidden sm:inline">Refresh</span>
                </Button>
            </div>
        </div>

        {/* Key Metrics Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            <StatCard
              title="CPU"
              value={`${systemMetrics.cpu}%`}
              trend="up"
              trendValue="+5%"
              icon={<HugeiconsIcon icon={CpuIcon} className="h-5 w-5 sm:h-6 sm:w-6" />}
              iconColor="text-foreground"
              iconBgColor=""
              description="Average"
              progress={systemMetrics.cpu}
            />
            <StatCard
              title="Memory"
              value={`${systemMetrics.memory}%`}
              trend="down"
              trendValue="-3%"
              icon={<HugeiconsIcon icon={DatabaseIcon} className="h-5 w-5 sm:h-6 sm:w-6" />}
              iconColor="text-foreground"
              iconBgColor=""
              description="8GB/12GB"
              progress={systemMetrics.memory}
            />
            <StatCard
              title="Disk"
              value={`${systemMetrics.disk}%`}
              trend="up"
              trendValue="+2%"
              icon={<HugeiconsIcon icon={HardDriveIcon} className="h-5 w-5 sm:h-6 sm:w-6" />}
              iconColor="text-foreground"
              iconBgColor=""
              description="120GB/500GB"
              progress={systemMetrics.disk}
            />
            <StatCard
              title="Network"
              value={`${systemMetrics.network}MB/s`}
              trend="up"
              trendValue="+12%"
              icon={<HugeiconsIcon icon={WifiIcon} className="h-5 w-5 sm:h-6 sm:w-6" />}
              iconColor="text-foreground"
              iconBgColor=""
              description="Total"
            />
          </div>
        </motion.div>

        {/* Performance Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
          {/* Performance Trends Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="h-full border-border bg-card overflow-hidden">
              <CardHeader className="border-b border-border bg-card p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl font-bold">
                      <div className="flex size-8 items-center justify-center border border-border bg-background">
                        <HugeiconsIcon icon={Activity01Icon} className="size-4 text-foreground" />
                      </div>
                      <span className="hidden sm:inline">Performance Trends</span>
                      <span className="sm:hidden">Performance</span>
                    </CardTitle>
                    <CardDescription className="mt-1 sm:mt-2 text-muted-foreground text-xs sm:text-sm">
                      <span className="hidden sm:inline">System metrics over time</span>
                      <span className="sm:hidden">Metrics over time</span>
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2 text-xs sm:text-sm">
                    <HugeiconsIcon icon={EyeIcon} className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">View Details</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-3 sm:p-6">
                <div className="h-[200px] sm:h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip contentStyle={{ backgroundColor: "var(--background)", borderColor: "var(--border)", borderRadius: "0px" }} />
                      <Legend />
                      <Area type="monotone" dataKey="cpu" stackId="1" stroke="var(--chart-1, #525252)" fill="var(--chart-1, #525252)" fillOpacity={0.6} />
                      <Area type="monotone" dataKey="memory" stackId="1" stroke="var(--chart-2, #737373)" fill="var(--chart-2, #737373)" fillOpacity={0.6} />
                      <Area type="monotone" dataKey="network" stackId="1" stroke="var(--chart-3, #a3a3a3)" fill="var(--chart-3, #a3a3a3)" fillOpacity={0.6} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-3 sm:mt-4 grid grid-cols-3 gap-2 sm:gap-4">
                  <div className="p-2 sm:p-3 bg-muted border border-border">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-foreground"></div>
                      <span className="text-xs sm:text-sm font-medium text-foreground">CPU</span>
                    </div>
                    <div className="text-lg sm:text-xl font-bold text-foreground mt-1">
                      {systemMetrics.cpu}%
                    </div>
                    <div className="text-xs text-foreground hidden sm:block">Current</div>
                  </div>
                  <div className="p-2 sm:p-3 bg-muted border border-border">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-foreground"></div>
                      <span className="text-xs sm:text-sm font-medium text-foreground">Memory</span>
                    </div>
                    <div className="text-lg sm:text-xl font-bold text-foreground mt-1">
                      {systemMetrics.memory}%
                    </div>
                    <div className="text-xs text-foreground hidden sm:block">Current</div>
                  </div>
                  <div className="p-2 sm:p-3 bg-muted border border-border">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-foreground"></div>
                      <span className="text-xs sm:text-sm font-medium text-foreground">Network</span>
                    </div>
                    <div className="text-lg sm:text-xl font-bold text-foreground mt-1">
                      {systemMetrics.network}MB/s
                    </div>
                    <div className="text-xs text-foreground hidden sm:block">Current</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Traffic & Errors Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="h-full border-border bg-card overflow-hidden">
              <CardHeader className="border-b border-border bg-card p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl font-bold">
                      <div className="flex size-8 items-center justify-center border border-border bg-background">
                        <HugeiconsIcon icon={Analytics01Icon} className="size-4 text-foreground" />
                      </div>
                      <span className="hidden sm:inline">Traffic & Errors</span>
                      <span className="sm:hidden">Traffic</span>
                    </CardTitle>
                    <CardDescription className="mt-1 sm:mt-2 text-muted-foreground text-xs sm:text-sm">
                      <span className="hidden sm:inline">Weekly request volume and error rates</span>
                      <span className="sm:hidden">Weekly requests & errors</span>
                    </CardDescription>
                  </div>
                  <Badge className="px-2 py-1 text-xs font-semibold sm:px-3 sm:text-sm">
                    7 days
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-3 sm:p-6">
                <div className="h-[200px] sm:h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={trafficData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip contentStyle={{ backgroundColor: "var(--background)", borderColor: "var(--border)", borderRadius: "0px" }} />
                      <Legend />
                      <Bar dataKey="requests" fill="var(--chart-1, #525252)" radius={[0, 0, 0, 0]} />
                      <Bar dataKey="errors" fill="var(--chart-2, #262626)" radius={[0, 0, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-3 sm:mt-4 grid grid-cols-2 gap-2 sm:gap-4">
                  <div className="p-2 sm:p-3 bg-muted border border-border">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-foreground"></div>
                      <span className="text-xs sm:text-sm font-medium text-foreground">Total Requests</span>
                    </div>
                    <div className="text-lg sm:text-xl font-bold text-foreground mt-1">
                      {trafficData.reduce((sum, day) => sum + day.requests, 0).toLocaleString()}
                    </div>
                  </div>
                  <div className="p-2 sm:p-3 bg-muted border border-border">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-foreground"></div>
                      <span className="text-xs sm:text-sm font-medium text-foreground">Total Errors</span>
                    </div>
                    <div className="text-lg sm:text-xl font-bold text-foreground mt-1">
                      {trafficData.reduce((sum, day) => sum + day.errors, 0).toLocaleString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Services Status & Alerts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-6">
          {/* Services Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="lg:col-span-2"
          >
            <Card className="border-border bg-card overflow-hidden">
              <CardHeader className="border-b border-border bg-card p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl font-bold">
                      <div className="flex size-8 items-center justify-center border border-border bg-background">
                        <HugeiconsIcon icon={CloudServerIcon} className="size-4 text-foreground" />
                      </div>
                      <span className="hidden sm:inline">Services Status</span>
                      <span className="sm:hidden">Services</span>
                    </CardTitle>
                    <CardDescription className="mt-1 sm:mt-2 text-muted-foreground text-xs sm:text-sm">
                      <span className="hidden sm:inline">Real-time service health monitoring</span>
                      <span className="sm:hidden">Service health</span>
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2 text-xs sm:text-sm">
                    <HugeiconsIcon icon={Settings01Icon} className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Configure</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-3 sm:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  {services.map((service, index) => (
                    <ServiceStatusCard key={index} service={service} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Alerts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card className="h-full border-border bg-card overflow-hidden">
              <CardHeader className="border-b border-border bg-card p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl font-bold">
                      <div className="flex size-8 items-center justify-center border border-border bg-background">
                        <HugeiconsIcon icon={Notification01Icon} className="size-4 text-foreground" />
                      </div>
                      <span className="hidden sm:inline">Recent Alerts</span>
                      <span className="sm:hidden">Alerts</span>
                    </CardTitle>
                    <CardDescription className="mt-1 sm:mt-2 text-muted-foreground text-xs sm:text-sm">
                      <span className="hidden sm:inline">Latest system notifications</span>
                      <span className="sm:hidden">System notifications</span>
                    </CardDescription>
                  </div>
                  <Badge className="px-2 py-1 text-xs font-semibold sm:px-3 sm:text-sm">
                    {recentAlerts.length} active
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-3 sm:p-6">
                <div className="space-y-2 sm:space-y-3 max-h-64 sm:max-h-96 overflow-y-auto">
                  {recentAlerts.map((alert) => (
                    <AlertCard key={alert.id} alert={alert} />
                  ))}
                </div>
                <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border dark:border-border">
                  <Button variant="outline" size="sm" className="w-full gap-2 border-border dark:border-border hover:bg-muted dark:hover:bg-muted text-xs sm:text-sm">
                    <HugeiconsIcon icon={EyeIcon} className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">View All Alerts</span>
                    <span className="sm:hidden">All Alerts</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Bottom Row - Dynamic Components */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
          {/* Dynamic Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Card className="border-border bg-card overflow-hidden">
              <CardHeader className="border-b border-border bg-card p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl font-bold">
                      <div className="flex size-8 items-center justify-center border border-border bg-background">
                        <HugeiconsIcon icon={Analytics01Icon} className="size-4 text-foreground" />
                      </div>
                      <span className="hidden sm:inline">Dynamic Metrics</span>
                      <span className="sm:hidden">Metrics</span>
                    </CardTitle>
                    <CardDescription className="mt-1 sm:mt-2 text-muted-foreground text-xs sm:text-sm">
                      <span className="hidden sm:inline">Real-time system performance metrics</span>
                      <span className="sm:hidden">Real-time metrics</span>
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2 text-xs sm:text-sm">
                    <HugeiconsIcon icon={Settings01Icon} className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Configure</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-3 sm:p-6">
                <Suspense fallback={
                  <div className="space-y-3 sm:space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3 sm:gap-4">
                        <Skeleton className="h-8 w-8 sm:h-10 sm:w-10" />
                        <div className="space-y-1.5 sm:space-y-2 flex-1">
                          <Skeleton className="h-3 sm:h-4 w-full" />
                          <Skeleton className="h-2.5 sm:h-3 w-3/4" />
                        </div>
                      </div>
                    ))}
                  </div>
                }>
                  <DynamicMetrics 
                    showCards={true}
                    showCharts={false}
                    groupBy={false}
                  />
                </Suspense>
              </CardContent>
            </Card>
          </motion.div>

          {/* Service Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <Card className="border-border bg-card overflow-hidden">
              <CardHeader className="border-b border-border bg-card p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl font-bold">
                      <div className="flex size-8 items-center justify-center border border-border bg-background">
                        <HugeiconsIcon icon={PieChartIcon} className="size-4 text-foreground" />
                      </div>
                      <span className="hidden sm:inline">Service Distribution</span>
                      <span className="sm:hidden">Distribution</span>
                    </CardTitle>
                    <CardDescription className="mt-1 sm:mt-2 text-muted-foreground text-xs sm:text-sm">
                      <span className="hidden sm:inline">Resource allocation across services</span>
                      <span className="sm:hidden">Resource allocation</span>
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2 text-xs sm:text-sm">
                    <HugeiconsIcon icon={FilterIcon} className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Filter</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-3 sm:p-6">
                <div className="h-[200px] sm:h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={serviceDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => {
                          const displayName = name.length > 8 ? name.substring(0, 8) + '...' : name;
                          return `${displayName} ${(percent * 100).toFixed(0)}%`
                        }}
                        outerRadius={typeof window !== 'undefined' && window.innerWidth < 640 ? 60 : 80}
                        fill="#737373"
                        dataKey="value"
                      >
                        {serviceDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: "var(--background)", borderColor: "var(--border)", borderRadius: "0px" }} />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 sm:mt-6 grid grid-cols-2 gap-2 sm:gap-3">
                  {serviceDistribution.map((service, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2, delay: 0.8 + index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-muted dark:bg-muted border border-border dark:border-border transition-shadow"
                    >
                      <div className="w-3 h-3 sm:w-4 sm:h-4" style={{ backgroundColor: service.color }}></div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs sm:text-sm font-medium text-muted-foreground dark:text-muted-foreground truncate">{service.name}</div>
                        <div className="text-xs text-muted-foreground dark:text-muted-foreground hidden sm:block">{service.value}% allocation</div>
                        <div className="text-xs text-muted-foreground dark:text-muted-foreground sm:hidden">{service.value}%</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Configuration Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <Suspense fallback={
            <Card className="border-border bg-card overflow-hidden">
              <CardContent className="p-3 sm:p-6">
                <Skeleton className="h-24 sm:h-32 w-full" />
              </CardContent>
            </Card>
          }>
            <MetricsConfigSummary />
          </Suspense>
        </motion.div>

        {/* Version Monitor */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
        >
          <Suspense fallback={
            <Card className="border-border bg-card overflow-hidden">
              <CardContent className="p-3 sm:p-6">
                <Skeleton className="h-24 sm:h-32 w-full" />
              </CardContent>
            </Card>
          }>
            <VersionMonitor 
              showDetails={false}
              autoRefresh={false}
            />
          </Suspense>
        </motion.div>
    </div>
  )
}
