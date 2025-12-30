"use client"

import React, { useState, useMemo } from "react"
import { motion } from "framer-motion"
import {
  FileText,
  Search,
  RefreshCw,
  Calendar,
  Clock,
  AlertCircle,
  Info,
  AlertTriangle,
  X,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Loader2
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { useLokiLogs } from "@/lib/hooks/use-loki-logs"
import { lokiAPI, LokiLogEntry } from "@/lib/loki-api"
import { useQuery } from "@tanstack/react-query"
import { serviceConfigManager } from "@/lib/service-config"

// Log entry component
interface LogEntryProps {
  log: LokiLogEntry;
  isExpanded: boolean;
  onToggle: () => void;
}

const LogEntry: React.FC<LogEntryProps> = ({ log, isExpanded, onToggle }) => {
  const timestamp = new Date(parseInt(log.timestamp) / 1000000)
  const serviceName = lokiAPI.extractServiceName(log.labels)
  const logLevel = lokiAPI.extractLogLevel(log.line, log.labels)
  
  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'error':
      case 'fatal':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
      case 'warn':
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
      case 'info':
        return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
      case 'debug':
      case 'trace':
        return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800'
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800'
    }
  }

  const getLevelIcon = (level: string) => {
    switch (level.toLowerCase()) {
      case 'error':
      case 'fatal':
        return <AlertCircle className="h-4 w-4" />
      case 'warn':
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />
      case 'info':
        return <Info className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  return (
    <Card className="overflow-hidden border-l-4 border-l-gray-300 dark:border-l-gray-700 hover:border-l-blue-500 dark:hover:border-l-blue-400 transition-colors">
      <CardHeader className="p-4 sm:p-6 pb-3 cursor-pointer" onClick={onToggle}>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
          <div className="flex items-start gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="flex-shrink-0 mt-0.5">
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={`${getLevelColor(logLevel)} border`}>
                  <div className="flex items-center gap-1">
                    {getLevelIcon(logLevel)}
                    <span className="uppercase text-xs font-medium">{logLevel}</span>
                  </div>
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {serviceName}
                </Badge>
              </div>
              <p className="text-sm sm:text-base font-mono break-words mt-2 text-foreground">
                {log.line.length > 200 ? `${log.line.substring(0, 200)}...` : log.line}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 text-xs sm:text-sm text-muted-foreground">
            <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>{timestamp.toLocaleString()}</span>
          </div>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="space-y-4">
            <div>
              <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-2">Full Log Message</p>
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm font-mono break-words whitespace-pre-wrap">{log.line}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Timestamp</p>
                <p className="text-sm">{timestamp.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Service</p>
                <p className="text-sm">{serviceName}</p>
              </div>
            </div>
            {Object.keys(log.labels).length > 0 && (
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-2">Labels</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(log.labels).map(([key, value]) => (
                    <Badge key={key} variant="outline" className="text-xs">
                      {key}={value}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  )
}

// Time range options
const timeRangeOptions = [
  { name: "Last 15 minutes", value: "15m" },
  { name: "Last 1 hour", value: "1h" },
  { name: "Last 6 hours", value: "6h" },
  { name: "Last 24 hours", value: "24h" },
  { name: "Last 7 days", value: "7d" },
]

export default function LogsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedJob, setSelectedJob] = useState("all")
  const [selectedNamespace, setSelectedNamespace] = useState("all")
  const [selectedSeverity, setSelectedSeverity] = useState("all")
  const [timeRange, setTimeRange] = useState("1h")
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set())
  const [limit, setLimit] = useState(100)

  // Fetch available jobs and namespaces
  const { data: jobs = [] } = useQuery({
    queryKey: ['loki-jobs'],
    queryFn: () => lokiAPI.getJobs(),
    refetchInterval: 60000, // Refresh every minute
  })

  const { data: namespaces = [] } = useQuery({
    queryKey: ['loki-namespaces'],
    queryFn: () => lokiAPI.getNamespaces(),
    refetchInterval: 60000,
  })

  const { data: severityLevels = [] } = useQuery({
    queryKey: ['loki-severity-levels'],
    queryFn: () => lokiAPI.getSeverityLevels(),
    refetchInterval: 60000,
  })

  // Build query from filters
  const logQuery = useMemo(() => {
    return lokiAPI.buildQuery({
      searchQuery,
      job: selectedJob,
      namespace: selectedNamespace,
      severity: selectedSeverity,
      timeRange,
    })
  }, [searchQuery, selectedJob, selectedNamespace, selectedSeverity, timeRange])

  // Get time range in nanoseconds
  const { start, end } = useMemo(() => {
    return lokiAPI.getTimeRange(timeRange)
  }, [timeRange])

  // Fetch logs
  const { data: logs = [], isLoading, error, refetch } = useLokiLogs({
    query: logQuery,
    limit,
    start,
    end,
    refetchInterval: 15000, // Refresh every 15 seconds
  })

  // Filter logs by search query (client-side for better UX)
  const filteredLogs = useMemo(() => {
    if (!searchQuery.trim()) return logs
    
    const query = searchQuery.toLowerCase()
    return logs.filter(log => 
      log.line.toLowerCase().includes(query) ||
      Object.values(log.labels).some(label => label.toLowerCase().includes(query))
    )
  }, [logs, searchQuery])

  const toggleLogExpansion = (logId: string) => {
    setExpandedLogs(prev => {
      const next = new Set(prev)
      if (next.has(logId)) {
        next.delete(logId)
      } else {
        next.add(logId)
      }
      return next
    })
  }

  const lokiConfig = serviceConfigManager.getServiceConfig('loki')

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
            Logs
          </h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base break-words">
            View and search logs from all services
          </p>
        </motion.div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <a
            href={lokiConfig.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="sm">
              <ExternalLink className="h-4 w-4 mr-2" />
              Loki UI
            </Button>
          </a>
        </div>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Filters</CardTitle>
            <CardDescription>
              Filter logs by service, namespace, severity, or search query
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search logs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <Select value={selectedJob} onValueChange={setSelectedJob}>
                <SelectTrigger>
                  <SelectValue placeholder="Job" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Jobs</SelectItem>
                  {jobs.map((job) => (
                    <SelectItem key={job} value={job}>
                      {job}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedNamespace} onValueChange={setSelectedNamespace}>
                <SelectTrigger>
                  <SelectValue placeholder="Namespace" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Namespaces</SelectItem>
                  {namespaces.map((ns) => (
                    <SelectItem key={ns} value={ns}>
                      {ns}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
                <SelectTrigger>
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {severityLevels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3 mt-4">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[200px]">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeRangeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={limit.toString()} onValueChange={(v) => setLimit(parseInt(v))}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="50">50 logs</SelectItem>
                  <SelectItem value="100">100 logs</SelectItem>
                  <SelectItem value="200">200 logs</SelectItem>
                  <SelectItem value="500">500 logs</SelectItem>
                </SelectContent>
              </Select>
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear Search
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Logs List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg sm:text-xl">Log Entries</CardTitle>
              <CardDescription className="mt-1">
                {isLoading ? (
                  "Loading logs..."
                ) : error ? (
                  `Error: ${error instanceof Error ? error.message : 'Failed to load logs'}`
                ) : (
                  `Showing ${filteredLogs.length} of ${logs.length} log entries`
                )}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading && logs.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
                <p className="text-lg font-medium text-foreground mb-2">Failed to load logs</p>
                <p className="text-sm text-muted-foreground mb-4">
                  {error instanceof Error ? error.message : 'Unknown error occurred'}
                </p>
                <Button onClick={() => refetch()} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-foreground mb-2">No logs found</p>
                <p className="text-sm text-muted-foreground">
                  {searchQuery || selectedJob !== 'all' || selectedNamespace !== 'all' || selectedSeverity !== 'all'
                    ? 'Try adjusting your filters'
                    : 'No logs available for the selected time range'}
                </p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {filteredLogs.map((log, index) => (
                  <LogEntry
                    key={`${log.timestamp}-${index}`}
                    log={log}
                    isExpanded={expandedLogs.has(`${log.timestamp}-${index}`)}
                    onToggle={() => toggleLogExpansion(`${log.timestamp}-${index}`)}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

