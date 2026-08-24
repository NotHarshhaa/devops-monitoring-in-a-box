"use client"

import React from "react"
import { motion } from "framer-motion"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Notification01Icon,
  Alert02Icon,
  InformationCircleIcon,
  CheckmarkCircle01Icon,
  Clock01Icon,
  FilterIcon,
  RefreshIcon,
  Calendar01Icon,
  Sorting01Icon,
  VolumeMute01Icon,
  Message01Icon,
  AlertCircleIcon,
  Search01Icon,
  Loading03Icon,
  ArrowDown01Icon,
  ArrowRight01Icon,
  ArrowUpRight01Icon,
  Shield01Icon,
  Activity01Icon,
  DatabaseIcon
} from "@hugeicons/core-free-icons"
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
      <Card className={`overflow-hidden border border-border bg-card transition-all duration-300 ${ severity === "critical" ? "border-l-4 border-l-foreground" : "" }`}>
      <CardHeader className="p-4 sm:p-6 pb-3">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
          <div className="flex items-start gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="flex-shrink-0 mt-0.5">
              {getSeverityIcon(severity)}
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base sm:text-lg break-words text-foreground">{alertName}</CardTitle>
              <CardDescription className="text-xs sm:text-sm mt-1 break-words text-muted-foreground">
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
            <p className="text-xs sm:text-sm text-muted-foreground">Service</p>
            <p className="text-sm sm:text-base font-medium break-words text-foreground">{serviceName}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs sm:text-sm text-muted-foreground">Value</p>
            <p className="text-sm sm:text-base font-medium break-words text-foreground">{value}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs sm:text-sm text-muted-foreground">Duration</p>
            <p className="text-sm sm:text-base font-medium text-foreground">
              {alertmanagerAPI.calculateDuration(alert.startsAt, alert.endsAt)}
            </p>
          </div>
          <div className="sm:col-span-3 space-y-1">
            <p className="text-xs sm:text-sm text-muted-foreground">Description</p>
            <p className="text-sm sm:text-base break-words text-foreground">{description}</p>
          </div>
          {Object.keys(alert.labels).length > 0 && (
            <div className="sm:col-span-3 space-y-2">
              <p className="text-xs sm:text-sm text-muted-foreground font-medium">Labels</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(alert.labels).map(([key, value]) => (
                  <Badge key={key} variant="secondary" className="text-xs bg-muted text-muted-foreground">
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
            className="mt-4 pt-4 border-t border-border"
          >
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Annotations</p>
                <div className="space-y-1">
                  {Object.entries(alert.annotations).map(([key, value]) => (
                    <div key={key} className="text-sm text-foreground">
                      <span className="font-medium">{key}:</span> {String(value)}
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Timestamps</p>
                <div className="space-y-1 text-sm text-foreground">
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
                    className="text-sm text-foreground flex items-center gap-1"
                  >
                    <HugeiconsIcon icon={ArrowUpRight01Icon} className="h-3 w-3" />
                    View in Prometheus
                  </a>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </CardContent>
      <CardFooter className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5">
          <HugeiconsIcon icon={Clock01Icon} className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
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
            className="gap-1.5 h-8 sm:h-9 flex-1 sm:flex-initial bg-card border-border hover:bg-muted"
            onClick={onToggle}
          >
            {isExpanded ? (
              <>
                <HugeiconsIcon icon={ArrowDown01Icon} className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Less</span>
                <span className="sm:hidden">Collapse</span>
              </>
            ) : (
              <>
                <HugeiconsIcon icon={ArrowRight01Icon} className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Details</span>
                <span className="sm:hidden">Expand</span>
              </>
            )}
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 h-8 sm:h-9 flex-1 sm:flex-initial bg-card border-border hover:bg-muted">
            <HugeiconsIcon icon={Message01Icon} className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Comment</span>
            <span className="sm:hidden">Comment</span>
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 h-8 sm:h-9 flex-1 sm:flex-initial bg-card border-border hover:bg-muted">
            <HugeiconsIcon icon={VolumeMute01Icon} className="h-3.5 w-3.5" />
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
        <Badge className="text-foreground">
          Critical
        </Badge>
      )
    case "warning":
      return (
        <Badge className="text-foreground">
          Warning
        </Badge>
      )
    case "info":
      return (
        <Badge className="text-foreground">
          Info
        </Badge>
      )
    default:
      return (
        <Badge className="text-foreground">
          {severity.charAt(0).toUpperCase() + severity.slice(1)}
        </Badge>
      )
  }
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "firing":
      return (
        <Badge className="text-foreground">
          Firing
        </Badge>
      )
    case "resolved":
      return (
        <Badge className="text-foreground">
          Resolved
        </Badge>
      )
    case "suppressed":
      return (
        <Badge className="text-foreground">
          Suppressed
        </Badge>
      )
    default:
      return (
        <Badge className="text-foreground">
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      )
  }
}

const getSeverityIcon = (severity: string) => {
  switch (severity) {
    case "critical":
      return <div className="p-2 border border-border"><HugeiconsIcon icon={Alert02Icon} className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" /></div>
    case "warning":
      return <div className="p-2 border border-border"><HugeiconsIcon icon={AlertCircleIcon} className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" /></div>
    case "info":
      return <div className="p-2 border border-border"><HugeiconsIcon icon={InformationCircleIcon} className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" /></div>
    default:
      return <div className="p-2 border border-border"><HugeiconsIcon icon={InformationCircleIcon} className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" /></div>
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
    <div className="space-y-4 sm:space-y-6">
      <div className="px-2 sm:px-4 py-3 sm:py-6 max-w-7xl mx-auto space-y-3 sm:space-y-6">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border border-border bg-card overflow-hidden">
            <CardHeader className="text-foreground p-4 sm:p-8">
              <div className="flex items-center justify-between">
                <div className="space-y-2 sm:space-y-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-2 sm:p-3 bg-card border border-border">
                      <HugeiconsIcon icon={Notification01Icon} className="h-5 w-5 sm:h-7 sm:w-7 text-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-xl sm:text-3xl lg:text-4xl font-bold">
                        System Alerts
                      </CardTitle>
                      <CardDescription className="mt-1 sm:mt-2 text-muted-foreground text-sm sm:text-base">
                        Monitor and manage system alerts from Alertmanager
                      </CardDescription>
                    </div>
                  </div>
                </div>
                <div className="hidden sm:block">
                  <Badge className="bg-card text-foreground border-border px-3 py-1.5 font-semibold text-sm">
                    <HugeiconsIcon icon={Activity01Icon} className="h-3 w-3 mr-1" />
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
                  className="text-center p-3 sm:p-4 border border-border"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-muted border border-border flex items-center justify-center mx-auto mb-2">
                    <HugeiconsIcon icon={Alert02Icon} className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-foreground">
                    {stats.firing}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Firing</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="text-center p-3 sm:p-4 border border-border"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-muted border border-border flex items-center justify-center mx-auto mb-2">
                    <HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-foreground">
                    {stats.total - stats.firing - stats.suppressed}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Resolved</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                  className="text-center p-3 sm:p-4 border border-border"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-muted border border-border flex items-center justify-center mx-auto mb-2">
                    <HugeiconsIcon icon={VolumeMute01Icon} className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-foreground">
                    {stats.suppressed}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Suppressed</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                  className="text-center p-3 sm:p-4 border border-border"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-muted border border-border flex items-center justify-center mx-auto mb-2">
                    <HugeiconsIcon icon={DatabaseIcon} className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-foreground">
                    {services.length}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Services</div>
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
              className="gap-1.5 h-9 sm:h-10 bg-card border-border hover:bg-muted" 
              onClick={refresh}
              disabled={loading}
            >
              {loading ? (
                <HugeiconsIcon icon={Loading03Icon} className="h-4 w-4 animate-spin" />
              ) : (
                <HugeiconsIcon icon={RefreshIcon} className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">Refresh</span>
              <span className="sm:hidden">Sync</span>
            </Button>

            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1.5 h-9 sm:h-10 bg-card border-border hover:bg-muted"
            >
              <HugeiconsIcon icon={Calendar01Icon} className="h-4 w-4" />
              <span className="hidden sm:inline">History</span>
              <span className="sm:hidden">Hist</span>
            </Button>

            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1.5 h-9 sm:h-10 bg-card border-border hover:bg-muted"
            >
              <HugeiconsIcon icon={VolumeMute01Icon} className="h-4 w-4" />
              <span className="hidden sm:inline">Silences</span>
              <span className="sm:hidden">Quiet</span>
            </Button>
          </div>

          <Badge className="bg-muted text-foreground">
            <HugeiconsIcon icon={Activity01Icon} className="h-3 w-3 mr-1" />
            {loading ? 'Loading...' : 'Live'}
          </Badge>
        </motion.div>

        {/* Enhanced Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="border border-border bg-card">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-foreground">
                <div className="p-2">
                  <HugeiconsIcon icon={FilterIcon} className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
                </div>
                Filters & Search
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <HugeiconsIcon icon={Search01Icon} className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search alerts..."
                      className="pl-9 h-9 sm:h-10 bg-card border-border"
                      value={filters.searchQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                    />
                  </div>
                  <Button 
                    onClick={refresh} 
                    disabled={loading} 
                    className="h-9 sm:h-10 bg-muted text-foreground"
                  >
                    {loading ? (
                      <HugeiconsIcon icon={Loading03Icon} className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <HugeiconsIcon icon={Search01Icon} className="h-4 w-4 mr-2" />
                    )}
                    Search
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm font-medium text-muted-foreground">Severity</label>
                    <Select value={filters.severity} onValueChange={handleSeverityChange}>
                      <SelectTrigger className="h-9 sm:h-10 bg-card border-border">
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
                    <label className="text-xs sm:text-sm font-medium text-muted-foreground">Status</label>
                    <Select value={filters.status} onValueChange={handleStatusChange}>
                      <SelectTrigger className="h-9 sm:h-10 bg-card border-border">
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
                    <label className="text-xs sm:text-sm font-medium text-muted-foreground">Service</label>
                    <Select value={filters.service} onValueChange={handleServiceChange}>
                      <SelectTrigger className="h-9 sm:h-10 bg-card border-border">
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
          <Card className="border border-border bg-card">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl text-foreground">
                    <div className="p-2">
                      <HugeiconsIcon icon={Shield01Icon} className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
                    </div>
                    Alert Entries
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {error ? (
                      <span className="text-foreground text-sm">Error: {error}</span>
                    ) : loading ? (
                      <span className="flex items-center gap-2 text-sm text-muted-foreground">
                        <HugeiconsIcon icon={Loading03Icon} className="h-4 w-4 animate-spin" />
                        Loading alerts...
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">Showing {filteredAlerts.length} alert{filteredAlerts.length !== 1 ? 's' : ''}</span>
                    )}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button variant="outline" size="sm" className="gap-1.5 h-9 bg-card border-border hover:bg-muted">
                    <HugeiconsIcon icon={Sorting01Icon} className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Sort</span>
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1.5 h-9 bg-card border-border hover:bg-muted">
                    <HugeiconsIcon icon={FilterIcon} className="h-3.5 w-3.5" />
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
                      <HugeiconsIcon icon={AlertCircleIcon} className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground" />
                      <span className="text-sm sm:text-base text-muted-foreground">No alerts found</span>
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
                        <HugeiconsIcon icon={FilterIcon} className="h-4 w-4" />
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
