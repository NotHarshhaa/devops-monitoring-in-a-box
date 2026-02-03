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
  Search,
  Loader2,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Shield,
  Activity,
  Database} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`overflow-hidden border border-gray-200 dark:border-gray-700 shadow-lg bg-white dark:bg-gray-900 hover:shadow-xl transition-all duration-300 ${
        severity === "critical" ? "border-l-4 border-l-red-500" :
        severity === "warning" ? "border-l-4 border-l-yellow-500" :
        "border-l-4 border-l-blue-500"
      }`}>
      <CardHeader className="p-4 sm:p-6 pb-3">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
          <div className="flex items-start gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="flex-shrink-0 mt-0.5">
              {getSeverityIcon(severity)}
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base sm:text-lg break-words text-gray-900 dark:text-white">{alertName}</CardTitle>
              <CardDescription className="text-xs sm:text-sm mt-1 break-words text-gray-600 dark:text-gray-400">
                {summary}
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
            {getStatusBadge(isFiring ? 'firing' : isSuppressed ? 'suppressed' : 'resolved')}
            {getSeverityBadge(severity)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0 pb-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-sm">
          <div className="space-y-1">
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Service</p>
            <p className="text-sm sm:text-base font-medium break-words text-gray-900 dark:text-white">{serviceName}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Value</p>
            <p className="text-sm sm:text-base font-medium break-words text-gray-900 dark:text-white">{value}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Duration</p>
            <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
              {alertmanagerAPI.calculateDuration(alert.startsAt, alert.endsAt)}
            </p>
          </div>
          <div className="sm:col-span-3 space-y-1">
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Description</p>
            <p className="text-sm sm:text-base break-words text-gray-900 dark:text-white">{description}</p>
          </div>
          {Object.keys(alert.labels).length > 0 && (
            <div className="sm:col-span-3 space-y-2">
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium">Labels</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(alert.labels).map(([key, value]) => (
                  <Badge key={key} variant="secondary" className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
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
            className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
          >
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Annotations</p>
                <div className="space-y-1">
                  {Object.entries(alert.annotations).map(([key, value]) => (
                    <div key={key} className="text-sm text-gray-900 dark:text-white">
                      <span className="font-medium">{key}:</span> {String(value)}
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Timestamps</p>
                <div className="space-y-1 text-sm text-gray-900 dark:text-white">
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Generator URL</p>
                  <a 
                    href={alert.generatorURL} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
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
      <CardFooter className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20">
        <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
          <span className="break-words">
            {isFiring
              ? `Started at ${alertmanagerAPI.formatTimestamp(alert.startsAt)}`
              : `Resolved at ${alertmanagerAPI.formatTimestamp(alert.endsAt || alert.updatedAt)}`
            }
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-1.5 h-8 sm:h-9 flex-1 sm:flex-initial bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
            onClick={onToggle}
          >
            {isExpanded ? (
              <>
                <ChevronDown className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Less</span>
                <span className="sm:hidden">Collapse</span>
              </>
            ) : (
              <>
                <ChevronRight className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Details</span>
                <span className="sm:hidden">Expand</span>
              </>
            )}
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 h-8 sm:h-9 flex-1 sm:flex-initial bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800">
            <MessageSquare className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Comment</span>
            <span className="sm:hidden">Comment</span>
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 h-8 sm:h-9 flex-1 sm:flex-initial bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800">
            <VolumeX className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Silence</span>
            <span className="sm:hidden">Silence</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
    </motion.div>
  );
};

const getSeverityBadge = (severity: string) => {
  switch (severity) {
    case "critical":
      return (
        <Badge className="bg-gradient-to-r from-red-500 to-rose-600 text-white">
          Critical
        </Badge>
      )
    case "warning":
      return (
        <Badge className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white">
          Warning
        </Badge>
      )
    case "info":
      return (
        <Badge className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white">
          Info
        </Badge>
      )
    default:
      return (
        <Badge className="bg-gradient-to-r from-gray-500 to-slate-600 text-white">
          {severity.charAt(0).toUpperCase() + severity.slice(1)}
        </Badge>
      )
  }
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "firing":
      return (
        <Badge className="bg-gradient-to-r from-red-500 to-rose-600 text-white">
          Firing
        </Badge>
      )
    case "resolved":
      return (
        <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
          Resolved
        </Badge>
      )
    case "suppressed":
      return (
        <Badge className="bg-gradient-to-r from-gray-500 to-slate-600 text-white">
          Suppressed
        </Badge>
      )
    default:
      return (
        <Badge className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      )
  }
}

const getSeverityIcon = (severity: string) => {
  switch (severity) {
    case "critical":
      return <div className="p-2 bg-gradient-to-br from-red-500 to-rose-600 rounded-lg"><AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-white" /></div>
    case "warning":
      return <div className="p-2 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-lg"><AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-white" /></div>
    case "info":
      return <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg"><Info className="h-4 w-4 sm:h-5 sm:w-5 text-white" /></div>
    default:
      return <div className="p-2 bg-gradient-to-br from-gray-500 to-slate-600 rounded-lg"><Info className="h-4 w-4 sm:h-5 sm:w-5 text-white" /></div>
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-900 dark:to-red-900/20">
      <div className="px-2 sm:px-4 py-3 sm:py-6 max-w-7xl mx-auto space-y-3 sm:space-y-6">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border border-gray-200 dark:border-gray-700 shadow-xl bg-white dark:bg-gray-900 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 dark:from-red-700 dark:via-orange-700 dark:to-yellow-700 text-white p-4 sm:p-8">
              <div className="flex items-center justify-between">
                <div className="space-y-2 sm:space-y-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-2 sm:p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                      <Bell className="h-5 w-5 sm:h-7 sm:w-7 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl sm:text-3xl lg:text-4xl font-bold">
                        System Alerts
                      </CardTitle>
                      <CardDescription className="mt-1 sm:mt-2 text-red-100 text-sm sm:text-base">
                        Monitor and manage system alerts from Alertmanager
                      </CardDescription>
                    </div>
                  </div>
                </div>
                <div className="hidden sm:block">
                  <Badge className="bg-white/20 text-white border-white/30 px-3 py-1.5 font-semibold text-sm">
                    <Activity className="h-3 w-3 mr-1" />
                    Live Monitoring
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
                  className="text-center p-3 sm:p-4 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-xl border border-red-200 dark:border-red-800"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-red-600 dark:text-red-400">
                    {stats.firing}
                  </div>
                  <div className="text-xs sm:text-sm text-red-700 dark:text-red-300">Firing</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="text-center p-3 sm:p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-green-600 dark:text-green-400">
                    {stats.total - stats.firing - stats.suppressed}
                  </div>
                  <div className="text-xs sm:text-sm text-green-700 dark:text-green-300">Resolved</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                  className="text-center p-3 sm:p-4 bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20 rounded-xl border border-gray-200 dark:border-gray-800"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <VolumeX className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-gray-600 dark:text-gray-400">
                    {stats.suppressed}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">Suppressed</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                  className="text-center p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Database className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-blue-600 dark:text-blue-400">
                    {services.length}
                  </div>
                  <div className="text-xs sm:text-sm text-blue-700 dark:text-blue-300">Services</div>
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
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1.5 h-9 sm:h-10 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800" 
              onClick={refresh}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">Refresh</span>
              <span className="sm:hidden">Sync</span>
            </Button>

            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1.5 h-9 sm:h-10 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">History</span>
              <span className="sm:hidden">Hist</span>
            </Button>

            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1.5 h-9 sm:h-10 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <VolumeX className="h-4 w-4" />
              <span className="hidden sm:inline">Silences</span>
              <span className="sm:hidden">Quiet</span>
            </Button>
          </div>

          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            <Activity className="h-3 w-3 mr-1" />
            {loading ? 'Loading...' : 'Live'}
          </Badge>
        </motion.div>

        {/* Enhanced Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="border border-gray-200 dark:border-gray-700 shadow-lg bg-white dark:bg-gray-900">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                  <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                Filters & Search
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search alerts..."
                      className="pl-9 h-9 sm:h-10 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600"
                      value={filters.searchQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                    />
                  </div>
                  <Button 
                    onClick={refresh} 
                    disabled={loading} 
                    className="h-9 sm:h-10 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Search className="h-4 w-4 mr-2" />
                    )}
                    Search
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Severity</label>
                    <Select value={filters.severity} onValueChange={handleSeverityChange}>
                      <SelectTrigger className="h-9 sm:h-10 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600">
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
                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                    <Select value={filters.status} onValueChange={handleStatusChange}>
                      <SelectTrigger className="h-9 sm:h-10 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600">
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
                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Service</label>
                    <Select value={filters.service} onValueChange={handleServiceChange}>
                      <SelectTrigger className="h-9 sm:h-10 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600">
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
        </motion.div>

        {/* Enhanced Alerts List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="border border-gray-200 dark:border-gray-700 shadow-lg bg-white dark:bg-gray-900">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl text-gray-900 dark:text-white">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                      <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                    Alert Entries
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {error ? (
                      <span className="text-red-600 dark:text-red-400 text-sm">Error: {error}</span>
                    ) : loading ? (
                      <span className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading alerts...
                      </span>
                    ) : (
                      <span className="text-sm text-gray-600 dark:text-gray-400">Showing {filteredAlerts.length} alert{filteredAlerts.length !== 1 ? 's' : ''}</span>
                    )}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button variant="outline" size="sm" className="gap-1.5 h-9 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <ArrowUpDown className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Sort</span>
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1.5 h-9 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <Filter className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">More Filters</span>
                    <span className="sm:hidden">Filters</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-3 sm:space-y-4">
                {filteredAlerts.length === 0 && !loading ? (
                  <div className="text-center py-8 sm:py-12">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <AlertCircle className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
                      <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">No alerts found</span>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setFilters({ 
                          searchQuery: '', 
                          severity: 'all', 
                          status: 'all', 
                          service: 'all' 
                        })}
                        className="gap-1.5"
                      >
                        <Filter className="h-4 w-4" />
                        Clear Filters
                      </Button>
                    </div>
                  </div>
                ) : (
                  filteredAlerts.map((alert, index) => (
                    <motion.div
                      key={alert.fingerprint}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                    >
                      <AlertCard
                        alert={alert}
                        isExpanded={expandedAlerts.has(alert.fingerprint)}
                        onToggle={() => toggleAlertExpansion(alert.fingerprint)}
                      />
                    </motion.div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
