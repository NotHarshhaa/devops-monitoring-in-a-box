"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { HugeiconsIcon } from "@hugeicons/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  RefreshIcon, 
  Download01Icon, 
  CheckmarkCircle01Icon, 
  Alert02Icon, 
  CancelCircleIcon,
  InformationCircleIcon,
  Clock01Icon,
  PackageIcon,
  FlashIcon,
  Shield01Icon,
  Analytics01Icon,
  Activity01Icon,
  CpuIcon,
  DatabaseIcon
} from "@hugeicons/core-free-icons"
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
        return <HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-5 w-5 text-foreground" />
      case 'warning':
        return <HugeiconsIcon icon={Alert02Icon} className="h-5 w-5 text-foreground" />
      case 'error':
        return <HugeiconsIcon icon={CancelCircleIcon} className="h-5 w-5 text-foreground" />
      default:
        return <HugeiconsIcon icon={InformationCircleIcon} className="h-5 w-5 text-foreground" />
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
    const iconMap: Record<string, any> = {
      'Prometheus': Activity01Icon,
      'Grafana': Analytics01Icon,
      'Loki': DatabaseIcon,
      'AlertManager': Alert02Icon,
      'Node Exporter': CpuIcon,
      'Docker': PackageIcon,
      'Kubernetes': Shield01Icon,
    }
    const icon = iconMap[name] || PackageIcon
    return <HugeiconsIcon icon={icon} className="h-5 w-5" />
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
        className="p-6 border border-border bg-card"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <HugeiconsIcon icon={PackageIcon} className="h-6 w-6 text-foreground" />
              Component Versions
            </h2>
            <p className="text-muted-foreground mt-1">
              Monitor current and latest versions of monitoring components
            </p>
          </div>
          <div className="flex items-center gap-3">
            {useDemoData && (
              <Badge variant="outline" className="text-xs bg-muted text-foreground border-border">
                Demo Data
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={fetchVersions}
              disabled={isLoading}
              className="gap-2 bg-card border-border hover:bg-muted"
            >
              <HugeiconsIcon icon={RefreshIcon} className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
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
            className="bg-card p-4 border border-border"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted border border-border">
                <HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{upToDateCount}</div>
                <div className="text-sm text-muted-foreground">Up to Date</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-card p-4 border border-border"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted border border-border">
                <HugeiconsIcon icon={Alert02Icon} className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{updateAvailableCount}</div>
                <div className="text-sm text-muted-foreground">Updates Available</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="bg-card p-4 border border-border"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted border border-border">
                <HugeiconsIcon icon={CancelCircleIcon} className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{errorCount}</div>
                <div className="text-sm text-muted-foreground">Errors</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="bg-card p-4 border border-border"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted border border-border">
                <HugeiconsIcon icon={PackageIcon} className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{versions.length}</div>
                <div className="text-sm text-muted-foreground">Total Components</div>
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
          className="flex items-center gap-2 text-sm text-muted-foreground"
        >
          <HugeiconsIcon icon={Clock01Icon} className="h-4 w-4" />
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
              <Card className="h-full transition-all duration-300 border border-border bg-card overflow-hidden">
                <CardHeader className="pb-2 sm:pb-4 p-3 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="p-2 sm:p-3 border border-border bg-muted">
                        <div className="text-foreground">
                          {getComponentIcon(component.name)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-sm sm:text-lg font-semibold text-foreground truncate">{component.name}</CardTitle>
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
                      <span className="text-xs sm:text-sm font-medium text-muted-foreground">Update Progress</span>
                      <span className="text-xs sm:text-sm font-bold text-foreground">{getUpdateProgress(component)}%</span>
                    </div>
                    <div className="w-full bg-muted h-2 sm:h-3 overflow-hidden border border-border">
                      <div 
                        className="h-full bg-foreground transition-all duration-500 ease-out"
                        style={{ width: `${getUpdateProgress(component)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Version Information */}
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-center justify-between p-2 sm:p-4 bg-muted border border-border">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-foreground"></div>
                        <span className="text-xs sm:text-sm font-medium text-muted-foreground">Current Version</span>
                      </div>
                      <Badge variant="outline" className="font-mono text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-1 bg-card border-border">
                        v{component.currentVersion}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 sm:p-4 bg-muted border border-border">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-foreground"></div>
                        <span className="text-xs sm:text-sm font-medium text-muted-foreground">Latest Version</span>
                      </div>
                      <Badge variant="outline" className="font-mono text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-1 bg-card border-border">
                        v{component.latestVersion}
                      </Badge>
                    </div>
                  </div>

                  {/* Update Status */}
                  {component.updateAvailable && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-2 sm:p-4 border border-border bg-muted"
                    >
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="p-1.5 sm:p-2 bg-card border border-border">
                          <HugeiconsIcon icon={FlashIcon} className="h-3 w-3 sm:h-4 sm:w-4 text-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-xs sm:text-sm font-semibold text-foreground">
                            <span className="hidden sm:inline">Update Available</span>
                            <span className="sm:hidden">Update</span>
                          </span>
                          <p className="text-xs text-foreground mt-0.5 sm:mt-1 truncate">
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
                        className="flex-1 gap-1 sm:gap-2 border-border bg-card hover:bg-muted text-xs sm:text-sm"
                        onClick={() => window.open(component.downloadUrl, '_blank')}
                      >
                        <HugeiconsIcon icon={Download01Icon} className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">Download</span>
                        <span className="sm:hidden">Get</span>
                      </Button>
                    )}
                    {component.dockerImage && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 gap-1 sm:gap-2 border-border bg-card hover:bg-muted text-xs sm:text-sm"
                        onClick={() => {
                          navigator.clipboard.writeText(component.dockerImage!)
                          toast({
                            title: "Copied to Clipboard",
                            description: `Docker image: ${component.dockerImage}`,
                          })
                        }}
                      >
                        <HugeiconsIcon icon={PackageIcon} className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">Docker</span>
                        <span className="sm:hidden">Copy</span>
                      </Button>
                    )}
                  </div>

                  {/* Additional Details */}
                  {showDetails && (
                    <div className="pt-4 border-t border-border space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">Status</span>
                        <span className="text-xs font-bold capitalize text-foreground">{component.status}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">Last Checked</span>
                        <span className="text-xs font-bold text-foreground">{formatDate(component.lastChecked)}</span>
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
