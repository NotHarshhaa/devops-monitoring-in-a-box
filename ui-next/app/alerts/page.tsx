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
  Search,
  Loader2,
  ChevronDown,
  ChevronRight,
  ExternalLink
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
import { useAlertmanagerAlerts } from "@/lib/hooks/use-alertmanager-alerts"
import { alertmanagerAPI } from "@/lib/alertmanager-api"

// Alert component for expandable details
interface AlertCardProps {
  alert: any;
  isExpanded: boolean;
  onToggle: () => void;
}

const AlertCard: React.FC<AlertCardProps> = ({ alert, isExpanded, onToggle }) => {
  const alertName = alertmanagerAPI.extractAlertName(alert.labels);
  const severity = alertmanagerAPI.extractSeverity(alert.labels);
  const serviceName = alertmanagerAPI.extractServiceName(alert.labels);
  const summary = alertmanagerAPI.getAlertSummary(alert.annotations);
  const description = alertmanagerAPI.getAlertDescription(alert.annotations);
  const value = alertmanagerAPI.getAlertValue(alert);
  const isFiring = alertmanagerAPI.isAlertFiring(alert);
  const isSuppressed = alertmanagerAPI.isAlertSuppressed(alert);

  return (
    <Card className={`overflow-hidden border-l-4 ${
      severity === "critical" ? "border-l-red-500" :
      severity === "warning" ? "border-l-yellow-500" :
      "border-l-blue-500"
    }`}>
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between">
          <div className="flex items-center gap-2">
            {getSeverityIcon(severity)}
            <CardTitle className="text-lg">{alertName}</CardTitle>
          </div>
          <div className="flex gap-2">
            {getStatusBadge(isFiring ? 'firing' : isSuppressed ? 'suppressed' : 'resolved')}
            {getSeverityBadge(severity)}
          </div>
        </div>
        <CardDescription className="text-sm">
          {summary}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0 pb-2">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-2 md:gap-x-4 text-sm">
          <div>
            <p className="text-muted-foreground">Service</p>
            <p className="font-medium">{serviceName}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Value</p>
            <p className="font-medium">{value}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Duration</p>
            <p className="font-medium">
              {alertmanagerAPI.calculateDuration(alert.startsAt, alert.endsAt)}
            </p>
          </div>
          <div className="md:col-span-3">
            <p className="text-muted-foreground">Description</p>
            <p>{description}</p>
          </div>
          {Object.keys(alert.labels).length > 0 && (
            <div className="md:col-span-3">
              <p className="text-muted-foreground mb-1">Labels</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(alert.labels).map(([key, value]) => (
                  <Badge key={key} variant="secondary">
                    {key}={String(value)}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Expandable details */}
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t"
          >
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Annotations</p>
                <div className="space-y-1">
                  {Object.entries(alert.annotations).map(([key, value]) => (
                    <div key={key} className="text-sm">
                      <span className="font-medium">{key}:</span> {String(value)}
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Timestamps</p>
                <div className="space-y-1 text-sm">
                  <div>
                    <span className="font-medium">Started:</span> {alertmanagerAPI.formatTimestamp(alert.startsAt)}
                  </div>
                  <div>
                    <span className="font-medium">Updated:</span> {alertmanagerAPI.formatTimestamp(alert.updatedAt)}
                  </div>
                  {alert.endsAt && (
                    <div>
                      <span className="font-medium">Ends:</span> {alertmanagerAPI.formatTimestamp(alert.endsAt)}
                    </div>
                  )}
                </div>
              </div>

              {alert.generatorURL && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Generator URL</p>
                  <a 
                    href={alert.generatorURL} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <ExternalLink className="h-3 w-3" />
                    View in Prometheus
                  </a>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </CardContent>
      <CardFooter className="p-4 flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          <Clock className="h-3 w-3 inline mr-1" />
          {isFiring
            ? `Started at ${alertmanagerAPI.formatTimestamp(alert.startsAt)}`
            : `Resolved at ${alertmanagerAPI.formatTimestamp(alert.endsAt || alert.updatedAt)}`
          }
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 gap-1"
            onClick={onToggle}
          >
            {isExpanded ? (
              <>
                <ChevronDown className="h-3 w-3" />
                Less
              </>
            ) : (
              <>
                <ChevronRight className="h-3 w-3" />
                Details
              </>
            )}
          </Button>
          <Button variant="outline" size="sm" className="h-8 gap-1">
            <MessageSquare className="h-3 w-3" />
            Comment
          </Button>
          <Button variant="outline" size="sm" className="h-8 gap-1">
            <VolumeX className="h-3 w-3" />
            Silence
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

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
  const {
    alerts,
    loading,
    error,
    services,
    severities,
    refresh,
    setFilters,
    filters,
    filteredAlerts,
    stats,
  } = useAlertmanagerAlerts()

  const [expandedAlerts, setExpandedAlerts] = React.useState<Set<string>>(new Set())

  const handleSearchChange = (value: string) => {
    setFilters({ searchQuery: value })
  }

  const handleSeverityChange = (value: string) => {
    setFilters({ severity: value })
  }

  const handleStatusChange = (value: string) => {
    setFilters({ status: value })
  }

  const handleServiceChange = (value: string) => {
    setFilters({ service: value })
  }

  const toggleAlertExpansion = (alertId: string) => {
    setExpandedAlerts(prev => {
      const newSet = new Set(prev)
      if (newSet.has(alertId)) {
        newSet.delete(alertId)
      } else {
        newSet.add(alertId)
      }
      return newSet
    })
  }

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
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-1" 
            onClick={refresh}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
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
                  <p className="text-2xl font-bold text-red-900 dark:text-red-200">{stats.firing}</p>
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
                  <p className="text-2xl font-bold text-green-900 dark:text-green-200">{stats.total - stats.firing - stats.suppressed}</p>
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
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-200">{stats.suppressed}</p>
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
                  value={filters.searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
              </div>
              <Button onClick={refresh} disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Search"
                )}
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Severity</label>
                <Select value={filters.severity} onValueChange={handleSeverityChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severities</SelectItem>
                    {severities.map((severity) => (
                      <SelectItem key={severity} value={severity}>
                        {severity.charAt(0).toUpperCase() + severity.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Status</label>
                <Select value={filters.status} onValueChange={handleStatusChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suppressed">Suppressed</SelectItem>
                    <SelectItem value="unprocessed">Unprocessed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Service</label>
                <Select value={filters.service} onValueChange={handleServiceChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Services</SelectItem>
                    {services.map((service) => (
                      <SelectItem key={service} value={service}>
                        {service}
                      </SelectItem>
                    ))}
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
            {error ? (
              <span className="text-red-500">Error: {error}</span>
            ) : loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading alerts...
              </span>
            ) : (
              `Showing ${filteredAlerts.length} alerts`
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredAlerts.map((alert) => (
              <motion.div
                key={alert.fingerprint}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <AlertCard
                  alert={alert}
                  isExpanded={expandedAlerts.has(alert.fingerprint)}
                  onToggle={() => toggleAlertExpansion(alert.fingerprint)}
                />
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
