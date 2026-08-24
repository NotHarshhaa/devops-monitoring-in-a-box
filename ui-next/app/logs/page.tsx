"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  File01Icon,
  Search01Icon,
  FilterIcon,
  Download01Icon,
  RefreshIcon,
  Clock01Icon,
  Alert02Icon,
  CheckmarkCircle01Icon,
  CancelCircleIcon,
  InformationCircleIcon,
  ArrowDown01Icon,
  ArrowRight01Icon,
  FlashIcon,
  Activity01Icon,
  DatabaseIcon,
  CodeSquareIcon,
  Layers01Icon,
  Tag01Icon
} from "@hugeicons/core-free-icons"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { useLokiLogs } from "@/lib/hooks/use-loki-logs"

// Time range options
const timeRangeData = [
  { name: "15m", value: "15m" },
  { name: "1h", value: "1h" },
  { name: "6h", value: "6h" },
  { name: "12h", value: "12h" },
  { name: "1d", value: "1d" },
  { name: "7d", value: "7d" }
]

// Severity level colors
const getSeverityColor = (severity: string) => {
  switch (severity?.toLowerCase()) {
    case 'error':
    case 'fatal':
      return 'text-foreground'
    case 'warn':
    case 'warning':
      return 'text-foreground'
    case 'info':
      return 'text-foreground'
    case 'debug':
      return 'text-foreground'
    default:
      return 'text-foreground'
  }
}

const getSeverityIcon = (severity: string) => {
  switch (severity?.toLowerCase()) {
    case 'error':
    case 'fatal':
      return CancelCircleIcon
    case 'warn':
    case 'warning':
      return Alert02Icon
    case 'info':
      return InformationCircleIcon
    case 'debug':
      return CodeSquareIcon
    default:
      return CheckmarkCircle01Icon
  }
}

export default function LogsPage() {
  const { 
    logs, 
    loading, 
    error, 
    jobs, 
    namespaces, 
    severityLevels, 
    refresh, 
    setFilters, 
    filters 
  } = useLokiLogs()

  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState(filters.searchQuery)

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    setFilters({ searchQuery: value })
  }

  const toggleLogExpansion = (logId: string) => {
    const newExpanded = new Set(expandedLogs)
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId)
    } else {
      newExpanded.add(logId)
    }
    setExpandedLogs(newExpanded)
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  const getLogId = (log: any, index: number) => {
    return `${log.timestamp}-${index}`
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
                      <HugeiconsIcon icon={File01Icon} className="h-5 w-5 sm:h-7 sm:w-7 text-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-xl sm:text-3xl lg:text-4xl font-bold">
                        System Logs
                      </CardTitle>
                      <CardDescription className="mt-1 sm:mt-2 text-muted-foreground text-sm sm:text-base">
                        Real-time log aggregation from Loki
                      </CardDescription>
                    </div>
                  </div>
                </div>
                <div className="hidden sm:block">
                  <Badge className="bg-card text-foreground border-border px-3 py-1.5 font-semibold text-sm">
                    <HugeiconsIcon icon={Activity01Icon} className="h-3 w-3 mr-1" />
                    Live Logs
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
                    <HugeiconsIcon icon={DatabaseIcon} className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-foreground">
                    {logs.length}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Total Logs</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="text-center p-3 sm:p-4 border border-border"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-muted border border-border flex items-center justify-center mx-auto mb-2">
                    <HugeiconsIcon icon={Layers01Icon} className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-foreground">
                    {namespaces.length}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Namespaces</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                  className="text-center p-3 sm:p-4 border border-border"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-muted border border-border flex items-center justify-center mx-auto mb-2">
                    <HugeiconsIcon icon={Tag01Icon} className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-foreground">
                    {jobs.length}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Jobs</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                  className="text-center p-3 sm:p-4 border border-border"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-muted border border-border flex items-center justify-center mx-auto mb-2">
                    <HugeiconsIcon icon={FlashIcon} className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-foreground">
                    {filters.timeRange}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Time Range</div>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters and Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-3 sm:space-y-4"
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
                <div className="lg:col-span-2">
                  <div className="relative">
                    <HugeiconsIcon icon={Search01Icon} className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search logs..."
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="pl-10 h-9 sm:h-10 bg-card border-border"
                    />
                  </div>
                </div>

                <Select value={filters.timeRange} onValueChange={(value) => setFilters({ timeRange: value })}>
                  <SelectTrigger className="h-9 sm:h-10 bg-card border-border">
                    <SelectValue placeholder="Time Range" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeRangeData.map((range) => (
                      <SelectItem key={range.value} value={range.value}>
                        Last {range.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filters.namespace} onValueChange={(value) => setFilters({ namespace: value })}>
                  <SelectTrigger className="h-9 sm:h-10 bg-card border-border">
                    <SelectValue placeholder="Namespace" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Namespaces</SelectItem>
                    {namespaces.map((namespace) => (
                      <SelectItem key={namespace} value={namespace}>
                        {namespace}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filters.severity} onValueChange={(value) => setFilters({ severity: value })}>
                  <SelectTrigger className="h-9 sm:h-10 bg-card border-border">
                    <SelectValue placeholder="Severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    {severityLevels.map((severity) => (
                      <SelectItem key={severity} value={severity}>
                        {severity}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-wrap items-center gap-2 mt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-1.5 h-9 sm:h-10 bg-card border-border hover:bg-muted" 
                  onClick={refresh}
                  disabled={loading}
                >
                  <HugeiconsIcon icon={RefreshIcon} className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Refresh</span>
                  <span className="sm:hidden">Sync</span>
                </Button>

                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-1.5 h-9 sm:h-10 bg-card border-border hover:bg-muted"
                >
                  <HugeiconsIcon icon={Download01Icon} className="h-4 w-4" />
                  <span className="hidden sm:inline">Export</span>
                  <span className="sm:hidden">Save</span>
                </Button>

                <Badge className="bg-muted text-foreground">
                  <HugeiconsIcon icon={Activity01Icon} className="h-3 w-3 mr-1" />
                  {loading ? 'Loading...' : 'Live'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Logs Display */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="border border-border bg-card">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <div className="p-2">
                    <HugeiconsIcon icon={CodeSquareIcon} className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
                  </div>
                  Log Entries
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs sm:text-sm">
                    {logs.length} entries
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              {error ? (
                <div className="text-center py-8 sm:py-12">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <HugeiconsIcon icon={CancelCircleIcon} className="h-8 w-8 sm:h-12 sm:w-12 text-foreground" />
                    <span className="text-sm sm:text-base text-foreground">
                      {error}
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={refresh}
                      className="gap-1.5"
                    >
                      <HugeiconsIcon icon={RefreshIcon} className="h-4 w-4" />
                      Retry
                    </Button>
                  </div>
                </div>
              ) : loading && logs.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <HugeiconsIcon icon={RefreshIcon} className="h-8 w-8 sm:h-12 sm:w-12 animate-spin text-foreground" />
                    <span className="text-sm sm:text-base text-muted-foreground">
                      Loading logs...
                    </span>
                  </div>
                </div>
              ) : logs.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <HugeiconsIcon icon={File01Icon} className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground" />
                    <span className="text-sm sm:text-base text-muted-foreground">
                      No logs found for the selected filters
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setFilters({ 
                        searchQuery: '', 
                        job: 'all', 
                        namespace: 'all', 
                        severity: 'all', 
                        timeRange: '1h' 
                      })}
                      className="gap-1.5"
                    >
                      <HugeiconsIcon icon={FilterIcon} className="h-4 w-4" />
                      Clear Filters
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  {logs.map((log, index) => {
                    const logId = getLogId(log, index)
                    const isExpanded = expandedLogs.has(logId)
                    const severityIconName = getSeverityIcon(log.labels?.severity || 'info')
                    const severity = log.labels?.severity || 'info'
                    
                    return (
                      <motion.div
                        key={logId}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                        className="border border-border overflow-hidden transition-all duration-200"
                      >
                        <div 
                          className="p-3 sm:p-4 cursor-pointer hover:bg-muted"
                          onClick={() => toggleLogExpansion(logId)}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-1">
                              {isExpanded ? (
                                <HugeiconsIcon icon={ArrowDown01Icon} className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <HugeiconsIcon icon={ArrowRight01Icon} className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                            
                            <div className="flex-shrink-0">
                              <div className={`p-1.5 border border-border ${getSeverityColor(severity)}`}>
                                <HugeiconsIcon icon={severityIconName} className="h-3 w-3 sm:h-4 sm:w-4" />
                              </div>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge className={`text-xs ${getSeverityColor(severity)}`}>
                                  {severity.toUpperCase()}
                                </Badge>
                                {log.labels?.job && (
                                  <Badge variant="outline" className="text-xs">
                                    {log.labels.job}
                                  </Badge>
                                )}
                                {log.labels?.namespace && (
                                  <Badge variant="outline" className="text-xs">
                                    {log.labels.namespace}
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="text-sm text-foreground font-mono break-all">
                                {log.line}
                              </div>
                              
                              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <HugeiconsIcon icon={Clock01Icon} className="h-3 w-3" />
                                  {formatTimestamp(log.timestamp)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="border-t border-border bg-muted p-3 sm:p-4"
                          >
                            <div className="space-y-2">
                              <div>
                                <span className="text-xs font-semibold text-muted-foreground">Labels:</span>
                                <div className="mt-1 flex flex-wrap gap-1">
                                  {Object.entries(log.labels || {}).map(([key, value]) => (
                                    <Badge key={key} variant="outline" className="text-xs">
                                      {key}={value}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <span className="text-xs font-semibold text-muted-foreground">Timestamp:</span>
                                <span className="ml-2 text-xs text-muted-foreground">
                                  {log.timestamp}
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
