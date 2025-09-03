"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  RefreshCw, 
  Download, 
  ExternalLink, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  Info,
  Clock,
  GitBranch,
  Calendar,
  Container
} from "lucide-react"
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
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Info className="h-4 w-4 text-blue-500" />
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Component Versions</h2>
          <p className="text-muted-foreground">
            Monitor current and latest versions of monitoring components
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {useDemoData && (
            <Badge variant="outline" className="text-xs">
              Demo Data
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={fetchVersions}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Last Refresh Info */}
      {lastRefresh && (
        <div className="text-sm text-muted-foreground flex items-center space-x-2">
          <Clock className="h-4 w-4" />
          <span>Last updated: {formatDate(lastRefresh.toISOString())}</span>
        </div>
      )}

      {/* Version Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {versions.map((component, index) => (
            <motion.div
              key={component.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(component)}
                      <CardTitle className="text-lg">{component.name}</CardTitle>
                    </div>
                    {getStatusBadge(component)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Version Information */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Current Version</span>
                      <Badge variant="outline" className="font-mono text-xs">
                        v{component.currentVersion}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Latest Version</span>
                      <Badge variant="outline" className="font-mono text-xs">
                        v{component.latestVersion}
                      </Badge>
                    </div>
                  </div>

                  {/* Update Status */}
                  {component.updateAvailable && (
                    <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                        <span className="text-sm font-medium text-orange-800 dark:text-orange-200">
                          Update Available
                        </span>
                      </div>
                      <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                        Upgrade from v{component.currentVersion} to v{component.latestVersion}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    {component.downloadUrl && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => window.open(component.downloadUrl, '_blank')}
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                    )}
                    {component.dockerImage && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          navigator.clipboard.writeText(component.dockerImage!)
                          toast({
                            title: "Copied to Clipboard",
                            description: `Docker image: ${component.dockerImage}`,
                          })
                        }}
                      >
                        <Container className="h-3 w-3 mr-1" />
                        Docker
                      </Button>
                    )}
                  </div>

                  {/* Additional Details */}
                  {showDetails && (
                    <div className="pt-2 border-t space-y-1">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Status</span>
                        <span className="capitalize">{component.status}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Last Checked</span>
                        <span>{formatDate(component.lastChecked)}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Version Summary</CardTitle>
          <CardDescription>
            Overview of component version status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {versions.filter(v => v.isUpToDate).length}
              </div>
              <div className="text-sm text-muted-foreground">Up to Date</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {versions.filter(v => v.updateAvailable).length}
              </div>
              <div className="text-sm text-muted-foreground">Updates Available</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {versions.filter(v => v.status === 'error').length}
              </div>
              <div className="text-sm text-muted-foreground">Errors</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {versions.length}
              </div>
              <div className="text-sm text-muted-foreground">Total Components</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
