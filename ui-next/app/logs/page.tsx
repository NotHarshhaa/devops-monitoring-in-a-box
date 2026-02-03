"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  FileText,
  Search,
  Filter,
  Download,
  RefreshCw,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  ChevronDown,
  ChevronRight,
  Zap,
  Activity,
  Database,
  Terminal,
  Layers,
  Tag
} from "lucide-react"
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
      return 'bg-gradient-to-r from-red-500 to-rose-600 text-white'
    case 'warn':
    case 'warning':
      return 'bg-gradient-to-r from-yellow-500 to-amber-600 text-white'
    case 'info':
      return 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white'
    case 'debug':
      return 'bg-gradient-to-r from-gray-500 to-slate-600 text-white'
    default:
      return 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
  }
}

const getSeverityIcon = (severity: string) => {
  switch (severity?.toLowerCase()) {
    case 'error':
    case 'fatal':
      return XCircle
    case 'warn':
    case 'warning':
      return AlertTriangle
    case 'info':
      return Info
    case 'debug':
      return Terminal
    default:
      return CheckCircle
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-blue-900/20">
      <div className="px-2 sm:px-4 py-3 sm:py-6 max-w-7xl mx-auto space-y-3 sm:space-y-6">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border border-gray-200 dark:border-gray-700 shadow-xl bg-white dark:bg-gray-900 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-700 dark:via-indigo-700 dark:to-purple-700 text-white p-4 sm:p-8">
              <div className="flex items-center justify-between">
                <div className="space-y-2 sm:space-y-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-2 sm:p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                      <FileText className="h-5 w-5 sm:h-7 sm:w-7 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl sm:text-3xl lg:text-4xl font-bold">
                        System Logs
                      </CardTitle>
                      <CardDescription className="mt-1 sm:mt-2 text-blue-100 text-sm sm:text-base">
                        Real-time log aggregation from Loki
                      </CardDescription>
                    </div>
                  </div>
                </div>
                <div className="hidden sm:block">
                  <Badge className="bg-white/20 text-white border-white/30 px-3 py-1.5 font-semibold text-sm">
                    <Activity className="h-3 w-3 mr-1" />
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
                  className="text-center p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Database className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-blue-600 dark:text-blue-400">
                    {logs.length}
                  </div>
                  <div className="text-xs sm:text-sm text-blue-700 dark:text-blue-300">Total Logs</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="text-center p-3 sm:p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Layers className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-green-600 dark:text-green-400">
                    {namespaces.length}
                  </div>
                  <div className="text-xs sm:text-sm text-green-700 dark:text-green-300">Namespaces</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                  className="text-center p-3 sm:p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-800"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Tag className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-purple-600 dark:text-purple-400">
                    {jobs.length}
                  </div>
                  <div className="text-xs sm:text-sm text-purple-700 dark:text-purple-300">Jobs</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                  className="text-center p-3 sm:p-4 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl border border-orange-200 dark:border-orange-800"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-orange-600 dark:text-orange-400">
                    {filters.timeRange}
                  </div>
                  <div className="text-xs sm:text-sm text-orange-700 dark:text-orange-300">Time Range</div>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
                <div className="lg:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search logs..."
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="pl-10 h-9 sm:h-10 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600"
                    />
                  </div>
                </div>

                <Select value={filters.timeRange} onValueChange={(value) => setFilters({ timeRange: value })}>
                  <SelectTrigger className="h-9 sm:h-10 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600">
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
                  <SelectTrigger className="h-9 sm:h-10 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600">
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
                  <SelectTrigger className="h-9 sm:h-10 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600">
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
                  className="gap-1.5 h-9 sm:h-10 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800" 
                  onClick={refresh}
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Refresh</span>
                  <span className="sm:hidden">Sync</span>
                </Button>

                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-1.5 h-9 sm:h-10 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Export</span>
                  <span className="sm:hidden">Save</span>
                </Button>

                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                  <Activity className="h-3 w-3 mr-1" />
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
          <Card className="border border-gray-200 dark:border-gray-700 shadow-lg bg-white dark:bg-gray-900">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                    <Terminal className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
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
                    <XCircle className="h-8 w-8 sm:h-12 sm:w-12 text-red-500" />
                    <span className="text-sm sm:text-base text-red-600 dark:text-red-400">
                      {error}
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={refresh}
                      className="gap-1.5"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Retry
                    </Button>
                  </div>
                </div>
              ) : loading && logs.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <RefreshCw className="h-8 w-8 sm:h-12 sm:w-12 animate-spin text-blue-600" />
                    <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                      Loading logs...
                    </span>
                  </div>
                </div>
              ) : logs.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <FileText className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
                    <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
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
                      <Filter className="h-4 w-4" />
                      Clear Filters
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  {logs.map((log, index) => {
                    const logId = getLogId(log, index)
                    const isExpanded = expandedLogs.has(logId)
                    const SeverityIcon = getSeverityIcon(log.labels?.severity || 'info')
                    const severity = log.labels?.severity || 'info'
                    
                    return (
                      <motion.div
                        key={logId}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-md transition-all duration-200"
                      >
                        <div 
                          className="p-3 sm:p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                          onClick={() => toggleLogExpansion(logId)}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-1">
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4 text-gray-400" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-gray-400" />
                              )}
                            </div>
                            
                            <div className="flex-shrink-0">
                              <div className={`p-1.5 rounded-lg ${getSeverityColor(severity)}`}>
                                <SeverityIcon className="h-3 w-3 sm:h-4 sm:w-4" />
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
                              
                              <div className="text-sm text-gray-900 dark:text-white font-mono break-all">
                                {log.line}
                              </div>
                              
                              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
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
                            className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3 sm:p-4"
                          >
                            <div className="space-y-2">
                              <div>
                                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Labels:</span>
                                <div className="mt-1 flex flex-wrap gap-1">
                                  {Object.entries(log.labels || {}).map(([key, value]) => (
                                    <Badge key={key} variant="outline" className="text-xs">
                                      {key}={value}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Timestamp:</span>
                                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
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
