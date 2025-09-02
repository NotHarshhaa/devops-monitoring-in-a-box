"use client"

import React from "react"
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
  Settings
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
import { ThemeToggle } from "@/components/theme-toggle"
import { DynamicMetrics, MetricsConfigSummary } from "@/components/dynamic-metrics"
import { useDashboardConfig } from "@/lib/hooks/use-config"

// Mock data - in real app, this would come from React Query API calls
const systemMetrics = {
  cpu: 45,
  memory: 67,
  disk: 23,
  network: 12
}

const chartData = [
  { time: "00:00", cpu: 30, memory: 50, disk: 20 },
  { time: "04:00", cpu: 45, memory: 60, disk: 22 },
  { time: "08:00", cpu: 65, memory: 70, disk: 25 },
  { time: "12:00", cpu: 80, memory: 75, disk: 28 },
  { time: "16:00", cpu: 70, memory: 72, disk: 26 },
  { time: "20:00", cpu: 55, memory: 65, disk: 24 },
  { time: "24:00", cpu: 40, memory: 58, disk: 21 },
]

const recentAlerts = [
  { id: 1, severity: "warning", message: "High CPU usage detected", time: "2 minutes ago" },
  { id: 2, severity: "info", message: "System backup completed", time: "1 hour ago" },
  { id: 3, severity: "error", message: "Disk space low", time: "3 hours ago" },
]

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
  switch (severity) {
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

export default function DashboardPage() {
  const { dashboardConfig, isLoading, error } = useDashboardConfig();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:items-center sm:justify-between gap-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="min-w-0 flex-1 pr-4"
        >
          <h1 className="text-2xl sm:text-3xl font-bold break-words">
            {dashboardConfig?.title || 'Dashboard'}
          </h1>
          <p className="text-muted-foreground mt-2 break-words">
            {dashboardConfig?.description || 'Monitor your system health and performance'}
          </p>
        </motion.div>
        <div className="flex-shrink-0 lg:block hidden">
          <ThemeToggle />
        </div>
      </div>

      {/* Fixed Theme Toggle for Mobile */}
      <div className="theme-toggle-mobile lg:hidden">
        <ThemeToggle />
      </div>

      {/* Dynamic Metrics */}
      <DynamicMetrics 
        showCards={true}
        showCharts={false}
        groupBy={false}
      />

      {/* Configuration Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <MetricsConfigSummary />
      </motion.div>

      {/* Dynamic Charts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <DynamicMetrics 
          showCards={false}
          showCharts={true}
          groupBy={true}
        />
      </motion.div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {/* Recent Alerts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Alerts</CardTitle>
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                View All
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentAlerts.map((alert) => (
                  <div key={alert.id} className="flex items-start space-x-3">
                    <div
                      className={`p-2 rounded-full ${getSeverityColor(alert.severity)}`}
                    >
                      {getSeverityIcon(alert.severity)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{alert.message}</p>
                      <p className="text-xs text-muted-foreground">{alert.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full">View All Metrics</Button>
              <Button variant="outline" className="w-full">Manage Alerts</Button>
              <Button variant="outline" className="w-full">System Settings</Button>
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
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <a
                    href="http://localhost:9090"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary font-medium hover:underline flex items-center min-w-0"
                  >
                    <Cpu className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">Prometheus</span>
                  </a>
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <div className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </div>
                    <span className="text-sm text-green-600 dark:text-green-500">Healthy</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <a
                    href="http://localhost:3000"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary font-medium hover:underline flex items-center min-w-0"
                  >
                    <HardDrive className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">Grafana</span>
                  </a>
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <div className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </div>
                    <span className="text-sm text-green-600 dark:text-green-500">Healthy</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <a
                    href="http://localhost:3100"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary font-medium hover:underline flex items-center min-w-0"
                  >
                    <Network className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">Loki</span>
                  </a>
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <div className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </div>
                    <span className="text-sm text-green-600 dark:text-green-500">Healthy</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
