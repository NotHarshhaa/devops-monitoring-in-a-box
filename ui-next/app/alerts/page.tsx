"use client"

import React from "react"
import { motion } from "framer-motion"
import {
  Bell,
  AlertTriangle,
  Info,
  CheckCircle,
  Clock,
  Filter,
  RefreshCw,
  Calendar,
  ArrowUpDown,
  VolumeX,
  MessageSquare,
  AlertCircle,
  X,
  Search
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"

// Mock alert data
const alerts = [
  {
    id: "1",
    name: "HighCPUUsage",
    status: "firing",
    severity: "critical",
    service: "node-exporter",
    summary: "CPU usage above 90% for 5 minutes",
    description: "Server is experiencing high CPU load which may impact performance",
    value: "95%",
    startedAt: "2023-07-01T11:45:30Z",
    lastUpdatedAt: "2023-07-01T12:30:45Z",
    labels: ["production", "high-priority"],
    annotations: {
      runbook: "https://runbooks.example.com/high-cpu",
      dashboard: "https://grafana.example.com/d/node-exporter"
    }
  },
  {
    id: "2",
    name: "LowDiskSpace",
    status: "firing",
    severity: "warning",
    service: "node-exporter",
    summary: "Disk usage above 85% on /data",
    description: "Free disk space is running low on the /data volume",
    value: "87%",
    startedAt: "2023-07-01T10:15:00Z",
    lastUpdatedAt: "2023-07-01T12:30:45Z",
    labels: ["production", "medium-priority"],
    annotations: {
      runbook: "https://runbooks.example.com/low-disk",
      dashboard: "https://grafana.example.com/d/disk-usage"
    }
  },
  {
    id: "3",
    name: "PrometheusTargetDown",
    status: "firing",
    severity: "critical",
    service: "prometheus",
    summary: "Prometheus target is down",
    description: "Prometheus cannot scrape metrics from node-exporter",
    value: "Down for 10m",
    startedAt: "2023-07-01T12:20:15Z",
    lastUpdatedAt: "2023-07-01T12:30:45Z",
    labels: ["production", "high-priority"],
    annotations: {
      runbook: "https://runbooks.example.com/prometheus-targets",
      dashboard: "https://grafana.example.com/d/prometheus"
    }
  },
  {
    id: "4",
    name: "APIHighLatency",
    status: "firing",
    severity: "warning",
    service: "api-service",
    summary: "API response time above 500ms",
    description: "The API service is experiencing high latency",
    value: "723ms",
    startedAt: "2023-07-01T12:10:00Z",
    lastUpdatedAt: "2023-07-01T12:30:45Z",
    labels: ["production", "medium-priority"],
    annotations: {
      runbook: "https://runbooks.example.com/api-latency",
      dashboard: "https://grafana.example.com/d/api-performance"
    }
  },
  {
    id: "5",
    name: "DatabaseConnections",
    status: "resolved",
    severity: "warning",
    service: "postgres",
    summary: "High number of database connections",
    description: "The number of active connections to the database is high",
    value: "120/150",
    startedAt: "2023-07-01T09:30:00Z",
    lastUpdatedAt: "2023-07-01T11:45:20Z",
    resolvedAt: "2023-07-01T11:45:20Z",
    labels: ["production", "medium-priority"],
    annotations: {
      runbook: "https://runbooks.example.com/db-connections",
      dashboard: "https://grafana.example.com/d/database"
    }
  },
  {
    id: "6",
    name: "ServiceRestart",
    status: "resolved",
    severity: "info",
    service: "web-server",
    summary: "Service restarted",
    description: "The web server service was restarted",
    value: "Restart completed",
    startedAt: "2023-07-01T10:05:15Z",
    lastUpdatedAt: "2023-07-01T10:10:30Z",
    resolvedAt: "2023-07-01T10:10:30Z",
    labels: ["production", "low-priority"],
    annotations: {
      runbook: "https://runbooks.example.com/service-restart",
      dashboard: "https://grafana.example.com/d/services"
    }
  }
]

const getSeverityBadge = (severity: string) => {
  switch (severity) {
    case "critical":
      return (
        <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
          Critical
        </Badge>
      )
    case "warning":
      return (
        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
          Warning
        </Badge>
      )
    case "info":
      return (
        <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
          Info
        </Badge>
      )
    default:
      return (
        <Badge variant="outline">
          {severity.charAt(0).toUpperCase() + severity.slice(1)}
        </Badge>
      )
  }
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "firing":
      return (
        <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
          Firing
        </Badge>
      )
    case "resolved":
      return (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
          Resolved
        </Badge>
      )
    case "suppressed":
      return (
        <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400">
          Suppressed
        </Badge>
      )
    default:
      return (
        <Badge>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      )
  }
}

const getSeverityIcon = (severity: string) => {
  switch (severity) {
    case "critical":
      return <AlertTriangle className="h-5 w-5 text-red-500" />
    case "warning":
      return <AlertCircle className="h-5 w-5 text-yellow-500" />
    case "info":
      return <Info className="h-5 w-5 text-blue-500" />
    default:
      return <Info className="h-5 w-5" />
  }
}

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp)
  return date.toLocaleString()
}

const formatDuration = (startTime: string, endTime?: string) => {
  const start = new Date(startTime).getTime()
  const end = endTime ? new Date(endTime).getTime() : Date.now()
  const durationMs = end - start

  const seconds = Math.floor(durationMs / 1000)
  if (seconds < 60) return `${seconds}s`

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ${minutes % 60}m`

  const days = Math.floor(hours / 24)
  return `${days}d ${hours % 24}h`
}

export default function AlertsPage() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [severity, setSeverity] = React.useState("all")
  const [status, setStatus] = React.useState("all")
  const [service, setService] = React.useState("all")

  // Filter alerts based on search and filters
  const filteredAlerts = alerts.filter((alert) => {
    // Search query
    if (
      searchQuery &&
      !alert.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !alert.summary.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !alert.description.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false
    }

    // Severity filter
    if (severity !== "all" && alert.severity !== severity) {
      return false
    }

    // Status filter
    if (status !== "all" && alert.status !== status) {
      return false
    }

    // Service filter
    if (service !== "all" && alert.service !== service) {
      return false
    }

    return true
  })

  // Count alerts by status
  const firingCount = alerts.filter(a => a.status === "firing").length
  const resolvedCount = alerts.filter(a => a.status === "resolved").length
  const suppressedCount = alerts.filter(a => a.status === "suppressed").length

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold">Alerts</h1>
          <p className="text-muted-foreground mt-2">
            Monitor and manage system alerts
          </p>
        </motion.div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="gap-1">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" className="gap-1">
            <Calendar className="h-4 w-4" />
            History
          </Button>
          <Button variant="outline" size="sm" className="gap-1">
                            <VolumeX className="h-4 w-4" />
            Silences
          </Button>
        </div>
      </div>

      {/* Alert stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-800 dark:text-red-300">Firing</p>
                  <p className="text-2xl font-bold text-red-900 dark:text-red-200">{firingCount}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500 dark:text-red-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-800 dark:text-green-300">Resolved</p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-200">{resolvedCount}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500 dark:text-green-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-300">Suppressed</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-200">{suppressedCount}</p>
                </div>
                <VolumeX className="h-8 w-8 text-gray-500 dark:text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Search and filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search alerts..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button>Search</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Severity</label>
                <Select value={severity} onValueChange={setSeverity}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severities</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Status</label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="firing">Firing</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="suppressed">Suppressed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Service</label>
                <Select value={service} onValueChange={setService}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Services</SelectItem>
                    <SelectItem value="node-exporter">Node Exporter</SelectItem>
                    <SelectItem value="prometheus">Prometheus</SelectItem>
                    <SelectItem value="api-service">API Service</SelectItem>
                    <SelectItem value="postgres">Postgres</SelectItem>
                    <SelectItem value="web-server">Web Server</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts list */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Alerts</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-1">
                <ArrowUpDown className="h-3 w-3" />
                Sort
              </Button>
              <Button variant="outline" size="sm" className="gap-1">
                <Filter className="h-3 w-3" />
                More Filters
              </Button>
            </div>
          </div>
          <CardDescription>
            Showing {filteredAlerts.length} alerts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredAlerts.map((alert) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className={`overflow-hidden border-l-4 ${
                  alert.severity === "critical" ? "border-l-red-500" :
                  alert.severity === "warning" ? "border-l-yellow-500" :
                  "border-l-blue-500"
                }`}>
                  <CardHeader className="p-4 pb-2">
                    <div className="flex justify-between">
                      <div className="flex items-center gap-2">
                        {getSeverityIcon(alert.severity)}
                        <CardTitle className="text-lg">{alert.name}</CardTitle>
                      </div>
                      <div className="flex gap-2">
                        {getStatusBadge(alert.status)}
                        {getSeverityBadge(alert.severity)}
                      </div>
                    </div>
                    <CardDescription className="text-sm">
                      {alert.summary}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 pb-2">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-y-2 md:gap-x-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Service</p>
                        <p className="font-medium">{alert.service}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Value</p>
                        <p className="font-medium">{alert.value}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Duration</p>
                        <p className="font-medium">
                          {formatDuration(alert.startedAt, alert.resolvedAt)}
                        </p>
                      </div>
                      <div className="md:col-span-3">
                        <p className="text-muted-foreground">Description</p>
                        <p>{alert.description}</p>
                      </div>
                      {alert.labels.length > 0 && (
                        <div className="md:col-span-3">
                          <p className="text-muted-foreground mb-1">Labels</p>
                          <div className="flex flex-wrap gap-2">
                            {alert.labels.map((label) => (
                              <Badge key={label} variant="secondary">
                                {label}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 inline mr-1" />
                      {alert.status === "resolved"
                        ? `Resolved at ${formatTimestamp(alert.resolvedAt!)}`
                        : `Started at ${formatTimestamp(alert.startedAt)}`
                      }
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="h-8 gap-1">
                        <MessageSquare className="h-3 w-3" />
                        Comment
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 gap-1">
                        <VolumeX className="h-3 w-3" />
                        Silence
                      </Button>
                      {alert.status === "firing" && (
                        <Button variant="outline" size="sm" className="h-8 gap-1">
                          <X className="h-3 w-3" />
                          Resolve
                        </Button>
                      )}
                    </div>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
