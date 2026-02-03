"use client"

import React, { Suspense, lazy, useState } from "react"
import { motion } from "framer-motion"
import {
  Cpu,
  HardDrive,
  AlertTriangle,
  Clock,
  Bell,
  Settings,
  Activity,
  Zap,
  Database,
  Server,
  BarChart3,
  PieChart,
  Globe,
  Wifi,
  RefreshCw,
  Download,
  Eye,
  Filter,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  AlertCircle,
  Info,
  X
} from "lucide-react"
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
  { name: "API", value: 35, color: "#3b82f6" },
  { name: "Database", value: 25, color: "#10b981" },
  { name: "Cache", value: 20, color: "#f59e0b" },
  { name: "Storage", value: 15, color: "#8b5cf6" },
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
      <Card className="h-full hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 overflow-hidden group">
        <CardContent className="p-3 sm:p-6">
          <div className="flex items-start justify-between mb-2 sm:mb-4">
            <div className={`p-2 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br ${iconBgColor.replace('bg-', 'from-').replace('dark:', 'dark:to-')} flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
              <div className={iconColor}>{icon}</div>
            </div>
            <div className={`flex items-center text-xs font-bold px-2 py-1 sm:px-3 sm:py-1.5 rounded-full border ${
              isPositive 
                ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700' 
                : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700'
            }`}>
              {isPositive ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
              <span className="hidden sm:inline">{trendValue}</span>
              <span className="sm:hidden">{trendValue.replace('+', '').replace('-', '')}</span>
            </div>
          </div>
          
          <div className="space-y-2 sm:space-y-3">
            <div>
              <p className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">{title}</p>
              <p className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
            </div>
            
            {description && (
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium">{description}</p>
            )}
            
            {progress !== undefined && (
              <div className="space-y-1 sm:space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Usage</span>
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 sm:h-3 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ease-out ${
                      progress > 80 ? 'bg-red-500' : 
                      progress > 60 ? 'bg-yellow-500' : 
                      'bg-green-500'
                    }`}
                    style={{ width: `${progress}%` }}
                  ></div>
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
        return <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4" />
      case "error":
        return <X className="h-3 w-3 sm:h-4 sm:w-4" />
      case "warning":
        return <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" />
      case "info":
        return <Info className="h-3 w-3 sm:h-4 sm:w-4" />
      default:
        return <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800"
      case "error":
        return "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800"
      case "warning":
        return "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800"
      case "info":
        return "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800"
      default:
        return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700"
    }
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
      <div className={`p-2 sm:p-3 rounded-lg border ${getSeverityColor(alert.severity)} hover:shadow-md transition-all duration-200`}>
        <div className="flex items-start gap-2 sm:gap-3">
          <div className={`p-1.5 sm:p-2 rounded-lg flex-shrink-0 ${getSeverityColor(alert.severity)}`}>
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
            <MoreHorizontal className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

// Enhanced Service Status Card with mobile-responsive design
function ServiceStatusCard({ service }: { service: typeof services[0] }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "bg-green-500"
      case "warning":
        return "bg-yellow-500"
      case "error":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusGradient = (status: string) => {
    switch (status) {
      case "healthy":
        return "from-green-500 to-emerald-600"
      case "warning":
        return "from-yellow-500 to-orange-600"
      case "error":
        return "from-red-500 to-rose-600"
      default:
        return "from-gray-500 to-slate-600"
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "healthy":
        return <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-700 text-xs">Healthy</Badge>
      case "warning":
        return <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-700 text-xs">Warning</Badge>
      case "error":
        return <Badge variant="destructive" className="text-xs">Error</Badge>
      default:
        return <Badge variant="outline" className="text-xs">Unknown</Badge>
    }
  }

  const getServiceIcon = (name: string) => {
    if (name.includes("API")) return <Globe className="h-3 w-3 sm:h-4 sm:w-4" />
    if (name.includes("Database")) return <Database className="h-3 w-3 sm:h-4 sm:w-4" />
    if (name.includes("Cache")) return <Zap className="h-3 w-3 sm:h-4 sm:w-4" />
    if (name.includes("Storage")) return <HardDrive className="h-3 w-3 sm:h-4 sm:w-4" />
    return <Server className="h-3 w-3 sm:h-4 sm:w-4" />
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <Card className="hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 overflow-hidden">
        <CardContent className="p-3 sm:p-5">
          {/* Service Header */}
          <div className="flex items-center justify-between mb-2 sm:mb-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className={`relative flex h-2 w-2 sm:h-3 sm:w-3`}>
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${getStatusColor(service.status)} opacity-75`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 sm:h-3 sm:w-3 ${getStatusColor(service.status)}`}></span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`p-1.5 sm:p-2 rounded-lg bg-gradient-to-r ${getStatusGradient(service.status)}`}>
                  <div className="text-white">
                    {getServiceIcon(service.name)}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">{service.name}</h3>
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
            <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-1 sm:gap-2">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Uptime</span>
              </div>
              <div className="text-right">
                <div className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">{service.uptime}%</div>
                <div className="w-12 sm:w-16 h-1 bg-gray-200 dark:bg-gray-700 rounded-full mt-1">
                  <div 
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: `${service.uptime}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Response Time */}
            <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-1 sm:gap-2">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full"></div>
                <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Response</span>
              </div>
              <div className="text-right">
                <div className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">{service.responseTime}ms</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                  {service.responseTime < 50 ? 'Excellent' : service.responseTime < 100 ? 'Good' : 'Slow'}
                </div>
              </div>
            </div>

            {/* Requests */}
            <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-1 sm:gap-2">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-500 rounded-full"></div>
                <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Requests</span>
              </div>
              <div className="text-right">
                <div className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">{service.requests.toLocaleString()}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">Last 24h</div>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-1 sm:gap-2">
                <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${getStatusColor(service.status)}`}></div>
                <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Status</span>
              </div>
              <div className="text-right">
                <div className="text-xs sm:text-sm font-bold capitalize text-gray-900 dark:text-white">{service.status}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">Real-time</div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-gray-200 dark:border-gray-700">
            <Button variant="outline" size="sm" className="w-full gap-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 text-xs sm:text-sm">
              <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-6 space-y-3 sm:space-y-6">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl shadow-sm border p-3 sm:p-6"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                {dashboardConfig?.title || 'Dashboard'}
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
                Real-time monitoring and performance metrics
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
              <VersionBadge variant="compact" />
              <div className="flex items-center gap-2">
                <select 
                  value={selectedTimeRange} 
                  onChange={(e) => setSelectedTimeRange(e.target.value)}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="1h">Last Hour</option>
                  <option value="24h">Last 24 Hours</option>
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                </select>
                <Button variant="outline" size="sm" className="gap-2 text-xs sm:text-sm">
                  <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Refresh</span>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

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
              icon={<Cpu className="h-5 w-5 sm:h-6 sm:w-6" />}
              iconColor="text-blue-600"
              iconBgColor="bg-blue-100 dark:bg-blue-900/30"
              description="Average"
              progress={systemMetrics.cpu}
            />
            <StatCard
              title="Memory"
              value={`${systemMetrics.memory}%`}
              trend="down"
              trendValue="-3%"
              icon={<Database className="h-5 w-5 sm:h-6 sm:w-6" />}
              iconColor="text-green-600"
              iconBgColor="bg-green-100 dark:bg-green-900/30"
              description="8GB/12GB"
              progress={systemMetrics.memory}
            />
            <StatCard
              title="Disk"
              value={`${systemMetrics.disk}%`}
              trend="up"
              trendValue="+2%"
              icon={<HardDrive className="h-5 w-5 sm:h-6 sm:w-6" />}
              iconColor="text-purple-600"
              iconBgColor="bg-purple-100 dark:bg-purple-900/30"
              description="120GB/500GB"
              progress={systemMetrics.disk}
            />
            <StatCard
              title="Network"
              value={`${systemMetrics.network}MB/s`}
              trend="up"
              trendValue="+12%"
              icon={<Wifi className="h-5 w-5 sm:h-6 sm:w-6" />}
              iconColor="text-orange-600"
              iconBgColor="bg-orange-100 dark:bg-orange-900/30"
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
            <Card className="border border-gray-200 dark:border-gray-700 shadow-xl bg-white dark:bg-gray-900 overflow-hidden h-full">
              <CardHeader className="bg-gradient-to-r from-green-600 to-teal-600 dark:from-green-700 dark:to-teal-700 text-white p-3 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl font-bold">
                      <div className="p-1.5 sm:p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                        <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                      </div>
                      <span className="hidden sm:inline">Performance Trends</span>
                      <span className="sm:hidden">Performance</span>
                    </CardTitle>
                    <CardDescription className="mt-1 sm:mt-2 text-green-100 text-xs sm:text-sm">
                      <span className="hidden sm:inline">System metrics over time</span>
                      <span className="sm:hidden">Metrics over time</span>
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2 border-white/20 bg-white/10 text-white hover:bg-white/20 text-xs sm:text-sm">
                    <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
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
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="cpu" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                      <Area type="monotone" dataKey="memory" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                      <Area type="monotone" dataKey="network" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-3 sm:mt-4 grid grid-cols-3 gap-2 sm:gap-4">
                  <div className="p-2 sm:p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-xs sm:text-sm font-medium text-blue-800 dark:text-blue-200">CPU</span>
                    </div>
                    <div className="text-lg sm:text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                      {systemMetrics.cpu}%
                    </div>
                    <div className="text-xs text-blue-700 dark:text-blue-300 hidden sm:block">Current</div>
                  </div>
                  <div className="p-2 sm:p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
                      <span className="text-xs sm:text-sm font-medium text-green-800 dark:text-green-200">Memory</span>
                    </div>
                    <div className="text-lg sm:text-xl font-bold text-green-600 dark:text-green-400 mt-1">
                      {systemMetrics.memory}%
                    </div>
                    <div className="text-xs text-green-700 dark:text-green-300 hidden sm:block">Current</div>
                  </div>
                  <div className="p-2 sm:p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-orange-500 rounded-full"></div>
                      <span className="text-xs sm:text-sm font-medium text-orange-800 dark:text-orange-200">Network</span>
                    </div>
                    <div className="text-lg sm:text-xl font-bold text-orange-600 dark:text-orange-400 mt-1">
                      {systemMetrics.network}MB/s
                    </div>
                    <div className="text-xs text-orange-700 dark:text-orange-300 hidden sm:block">Current</div>
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
            <Card className="border border-gray-200 dark:border-gray-700 shadow-xl bg-white dark:bg-gray-900 overflow-hidden h-full">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-700 dark:to-pink-700 text-white p-3 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl font-bold">
                      <div className="p-1.5 sm:p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                        <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                      </div>
                      <span className="hidden sm:inline">Traffic & Errors</span>
                      <span className="sm:hidden">Traffic</span>
                    </CardTitle>
                    <CardDescription className="mt-1 sm:mt-2 text-purple-100 text-xs sm:text-sm">
                      <span className="hidden sm:inline">Weekly request volume and error rates</span>
                      <span className="sm:hidden">Weekly requests & errors</span>
                    </CardDescription>
                  </div>
                  <Badge className="bg-white/20 text-white border-white/30 px-2 py-1 sm:px-3 sm:py-1 font-semibold text-xs sm:text-sm">
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
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="requests" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                      <Bar dataKey="errors" fill="#ef4444" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-3 sm:mt-4 grid grid-cols-2 gap-2 sm:gap-4">
                  <div className="p-2 sm:p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-xs sm:text-sm font-medium text-blue-800 dark:text-blue-200">Total Requests</span>
                    </div>
                    <div className="text-lg sm:text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                      {trafficData.reduce((sum, day) => sum + day.requests, 0).toLocaleString()}
                    </div>
                  </div>
                  <div className="p-2 sm:p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full"></div>
                      <span className="text-xs sm:text-sm font-medium text-red-800 dark:text-red-200">Total Errors</span>
                    </div>
                    <div className="text-lg sm:text-xl font-bold text-red-600 dark:text-red-400 mt-1">
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
            <Card className="border border-gray-200 dark:border-gray-700 shadow-xl bg-white dark:bg-gray-900 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 text-white p-3 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl font-bold">
                      <div className="p-1.5 sm:p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                        <Server className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                      </div>
                      <span className="hidden sm:inline">Services Status</span>
                      <span className="sm:hidden">Services</span>
                    </CardTitle>
                    <CardDescription className="mt-1 sm:mt-2 text-blue-100 text-xs sm:text-sm">
                      <span className="hidden sm:inline">Real-time service health monitoring</span>
                      <span className="sm:hidden">Service health</span>
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2 border-white/20 bg-white/10 text-white hover:bg-white/20 text-xs sm:text-sm">
                    <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
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
            <Card className="border border-gray-200 dark:border-gray-700 shadow-xl bg-white dark:bg-gray-900 overflow-hidden h-full">
              <CardHeader className="bg-gradient-to-r from-orange-600 to-red-600 dark:from-orange-700 dark:to-red-700 text-white p-3 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl font-bold">
                      <div className="p-1.5 sm:p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                        <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                      </div>
                      <span className="hidden sm:inline">Recent Alerts</span>
                      <span className="sm:hidden">Alerts</span>
                    </CardTitle>
                    <CardDescription className="mt-1 sm:mt-2 text-orange-100 text-xs sm:text-sm">
                      <span className="hidden sm:inline">Latest system notifications</span>
                      <span className="sm:hidden">System notifications</span>
                    </CardDescription>
                  </div>
                  <Badge className="bg-white/20 text-white border-white/30 px-2 py-1 sm:px-3 sm:py-1 font-semibold text-xs sm:text-sm">
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
                <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button variant="outline" size="sm" className="w-full gap-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 text-xs sm:text-sm">
                    <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
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
            <Card className="border border-gray-200 dark:border-gray-700 shadow-xl bg-white dark:bg-gray-900 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-700 dark:to-blue-700 text-white p-3 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl font-bold">
                      <div className="p-1.5 sm:p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                        <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                      </div>
                      <span className="hidden sm:inline">Dynamic Metrics</span>
                      <span className="sm:hidden">Metrics</span>
                    </CardTitle>
                    <CardDescription className="mt-1 sm:mt-2 text-cyan-100 text-xs sm:text-sm">
                      <span className="hidden sm:inline">Real-time system performance metrics</span>
                      <span className="sm:hidden">Real-time metrics</span>
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2 border-white/20 bg-white/10 text-white hover:bg-white/20 text-xs sm:text-sm">
                    <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Configure</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-3 sm:p-6">
                <Suspense fallback={
                  <div className="space-y-3 sm:space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3 sm:gap-4">
                        <Skeleton className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg" />
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
            <Card className="border border-gray-200 dark:border-gray-700 shadow-xl bg-white dark:bg-gray-900 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-700 dark:to-purple-700 text-white p-3 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl font-bold">
                      <div className="p-1.5 sm:p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                        <PieChart className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                      </div>
                      <span className="hidden sm:inline">Service Distribution</span>
                      <span className="sm:hidden">Distribution</span>
                    </CardTitle>
                    <CardDescription className="mt-1 sm:mt-2 text-indigo-100 text-xs sm:text-sm">
                      <span className="hidden sm:inline">Resource allocation across services</span>
                      <span className="sm:hidden">Resource allocation</span>
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2 border-white/20 bg-white/10 text-white hover:bg-white/20 text-xs sm:text-sm">
                    <Filter className="h-3 w-3 sm:h-4 sm:w-4" />
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
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {serviceDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
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
                      className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
                    >
                      <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full" style={{ backgroundColor: service.color }}></div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{service.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">{service.value}% allocation</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 sm:hidden">{service.value}%</div>
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
            <Card className="border border-gray-200 dark:border-gray-700 shadow-xl bg-white dark:bg-gray-900 overflow-hidden">
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
            <Card className="border border-gray-200 dark:border-gray-700 shadow-xl bg-white dark:bg-gray-900 overflow-hidden">
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
    </div>
  )
}
