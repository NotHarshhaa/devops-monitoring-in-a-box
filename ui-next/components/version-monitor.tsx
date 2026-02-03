"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  RefreshCw, 
  Download, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  Info,
  Clock,
  Container,
  Zap,
  Shield,
  TrendingUp,
  Package,
  Activity,
  Cpu,
  Database} from "lucide-react"
import { VersionMonitorService, type ComponentVersion } from "@/lib/version-monitor"
import { toast } from "@/hooks/use-toast"

interface VersionMonitorProps {
  showDetails?: boolean
  autoRefresh?: boolean
  refreshInterval?: number
}

export function VersionMonitor({ 
  showDetails = true, 
  autoRefresh = false, 
  refreshInterval = 300000 // 5 minutes
}: VersionMonitorProps) {
  const [versions, setVersions] = useState<ComponentVersion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const [useDemoData, setUseDemoData] = useState(false)

  const fetchVersions = async () => {
    setIsLoading(true)
    try {
      const versionData = await VersionMonitorService.getAllVersions()
      
      // Check if we got any real data or if we should use demo data
      const hasRealData = versionData.some(v => v.currentVersion !== 'Unknown' && v.status === 'healthy')
      
      if (hasRealData) {
        setVersions(versionData)
        setUseDemoData(false)
      } else {
        // Use demo data if services are not running
        setVersions(VersionMonitorService.getDemoVersions())
        setUseDemoData(true)
      }
      
      setLastRefresh(new Date())
    } catch (error) {
      console.error('Failed to fetch versions:', error)
      // Fallback to demo data
      setVersions(VersionMonitorService.getDemoVersions())
      setUseDemoData(true)
      setLastRefresh(new Date())
      
      toast({
        title: "Using Demo Data",
        description: "Services not running, showing demo version information",
        variant: "default"
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchVersions()
  }, [])

  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(fetchVersions, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [autoRefresh, refreshInterval])

  const getStatusIcon = (component: ComponentVersion) => {
    const status = VersionMonitorService.getVersionStatus(component)
    
    switch (status.status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  const getStatusBadge = (component: ComponentVersion) => {
    const status = VersionMonitorService.getVersionStatus(component)
    
    let variant: "default" | "secondary" | "destructive" | "outline" = "outline"
    if (status.status === 'success') variant = "default"
    if (status.status === 'warning') variant = "secondary"
    if (status.status === 'error') variant = "destructive"
    
    return (
      <Badge variant={variant} className="text-xs">
        {status.message}
      </Badge>
    )
  }

  const getComponentIcon = (name: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      'Prometheus': <Activity className="h-5 w-5" />,
      'Grafana': <TrendingUp className="h-5 w-5" />,
      'Loki': <Database className="h-5 w-5" />,
      'AlertManager': <AlertTriangle className="h-5 w-5" />,
      'Node Exporter': <Cpu className="h-5 w-5" />,
      'Docker': <Container className="h-5 w-5" />,
      'Kubernetes': <Shield className="h-5 w-5" />,
    }
    return iconMap[name] || <Package className="h-5 w-5" />
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getUpdateProgress = (component: ComponentVersion) => {
    if (!component.updateAvailable) return 100
    // Simulate progress based on version difference
    const current = parseFloat(component.currentVersion.replace('v', ''))
    const latest = parseFloat(component.latestVersion.replace('v', ''))
    return Math.min((current / latest) * 100, 95)
  }

  const upToDateCount = versions.filter(v => v.isUpToDate).length
  const updateAvailableCount = versions.filter(v => v.updateAvailable).length
  const errorCount = versions.filter(v => v.status === 'error').length

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Package className="h-6 w-6 text-blue-600" />
              Component Versions
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Monitor current and latest versions of monitoring components
            </p>
          </div>
          <div className="flex items-center gap-3">
            {useDemoData && (
              <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
                Demo Data
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={fetchVersions}
              disabled={isLoading}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{upToDateCount}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Up to Date</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{updateAvailableCount}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Updates Available</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">{errorCount}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Errors</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{versions.length}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Components</div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Last Refresh Info */}
      {lastRefresh && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
        >
          <Clock className="h-4 w-4" />
          <span>Last updated: {formatDate(lastRefresh.toISOString())}</span>
        </motion.div>
      )}

      {/* Enhanced Version Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence>
          {versions.map((component, index) => (
            <motion.div
              key={component.name}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="h-full"
            >
              <Card className="h-full hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 shadow-lg bg-white dark:bg-gray-900 overflow-hidden">
                <CardHeader className="pb-2 sm:pb-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-3 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 rounded-xl shadow-lg">
                        <div className="text-white">
                          {getComponentIcon(component.name)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white truncate">{component.name}</CardTitle>
                        <div className="flex items-center gap-1 sm:gap-2 mt-1 sm:mt-2">
                          {getStatusIcon(component)}
                          {getStatusBadge(component)}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-3 sm:p-6 space-y-3 sm:space-y-4">
                  {/* Version Progress */}
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Update Progress</span>
                      <span className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">{getUpdateProgress(component)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 sm:h-3 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${getUpdateProgress(component)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Version Information */}
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-center justify-between p-2 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Current Version</span>
                      </div>
                      <Badge variant="outline" className="font-mono text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-1 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600">
                        v{component.currentVersion}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Latest Version</span>
                      </div>
                      <Badge variant="outline" className="font-mono text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-1 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600">
                        v{component.latestVersion}
                      </Badge>
                    </div>
                  </div>

                  {/* Update Status */}
                  {component.updateAvailable && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-2 sm:p-4 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/30 dark:to-amber-900/30 rounded-xl border border-orange-200 dark:border-orange-800"
                    >
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="p-1.5 sm:p-2 bg-orange-500 rounded-lg">
                          <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-xs sm:text-sm font-semibold text-orange-800 dark:text-orange-200">
                            <span className="hidden sm:inline">Update Available</span>
                            <span className="sm:hidden">Update</span>
                          </span>
                          <p className="text-xs text-orange-700 dark:text-orange-300 mt-0.5 sm:mt-1 truncate">
                            v{component.currentVersion} → v{component.latestVersion}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 sm:gap-3 pt-2">
                    {component.downloadUrl && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 gap-1 sm:gap-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 text-xs sm:text-sm"
                        onClick={() => window.open(component.downloadUrl, '_blank')}
                      >
                        <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">Download</span>
                        <span className="sm:hidden">Get</span>
                      </Button>
                    )}
                    {component.dockerImage && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 gap-1 sm:gap-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 text-xs sm:text-sm"
                        onClick={() => {
                          navigator.clipboard.writeText(component.dockerImage!)
                          toast({
                            title: "Copied to Clipboard",
                            description: `Docker image: ${component.dockerImage}`,
                          })
                        }}
                      >
                        <Container className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">Docker</span>
                        <span className="sm:hidden">Copy</span>
                      </Button>
                    )}
                  </div>

                  {/* Additional Details */}
                  {showDetails && (
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Status</span>
                        <span className="text-xs font-bold capitalize text-gray-900 dark:text-white">{component.status}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Last Checked</span>
                        <span className="text-xs font-bold text-gray-900 dark:text-white">{formatDate(component.lastChecked)}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
