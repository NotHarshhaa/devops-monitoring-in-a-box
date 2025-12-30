"use client"

import React from "react"
import { motion } from "framer-motion"
import { 
  Server, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw, 
  Play, 
  Pause, 
  ThumbsUp,
  ExternalLink,
  Loader2,
  Clock,
  Activity
} from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useHealthMonitoring } from "@/lib/hooks/use-health-monitoring"
import { healthAPI } from "@/lib/health-api"
import { VersionMonitor } from "@/components/version-monitor"

// Service Health Component
interface ServiceHealthCardProps {
  service: any;
  onRefresh: () => void;
  onOpenExternal: (url: string) => void;
}

const ServiceHealthCard: React.FC<ServiceHealthCardProps> = ({ 
  service, 
  onRefresh, 
  onOpenExternal 
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "up":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "down":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "checking":
        return <Loader2 className="h-4 w-4 text-yellow-500 animate-spin" />
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "up":
        return <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Up</Badge>
      case "down":
        return <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">Down</Badge>
      case "checking":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">Checking</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getPortFromUrl = (url: string): string => {
    try {
      const urlObj = new URL(url);
      return urlObj.port || (urlObj.protocol === 'https:' ? '443' : '80');
    } catch {
      return 'N/A';
    }
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
              <Server className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base sm:text-lg truncate">{service.name}</CardTitle>
              <CardDescription className="text-xs sm:text-sm mt-1 line-clamp-2">{service.description}</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {getStatusBadge(service.status)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <Tabs defaultValue="overview">
          <TabsList className="mb-4 h-9 sm:h-10 w-full grid grid-cols-2">
            <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
            <TabsTrigger value="details" className="text-xs sm:text-sm">Details</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1">
                <p className="text-xs sm:text-sm text-muted-foreground">Status</p>
                <div className="flex items-center gap-2">
                  {getStatusIcon(service.status)}
                  <p className="text-xs sm:text-sm font-medium capitalize">{service.status}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs sm:text-sm text-muted-foreground">Port</p>
                <p className="text-xs sm:text-sm font-medium">{getPortFromUrl(service.url)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs sm:text-sm text-muted-foreground">Response Time</p>
                <p className="text-xs sm:text-sm font-medium">
                  {service.responseTime ? healthAPI.formatResponseTime(service.responseTime) : 'N/A'}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs sm:text-sm text-muted-foreground">Last Checked</p>
                <p className="text-xs sm:text-sm font-medium">
                  {new Date(service.lastChecked).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="details" className="space-y-3 sm:space-y-4">
            <div className="space-y-2">
              <p className="text-xs sm:text-sm text-muted-foreground font-medium">Endpoint</p>
              <p className="text-xs sm:text-sm font-mono bg-muted p-2 sm:p-3 rounded break-all">{service.endpoint}</p>
            </div>
            <div className="space-y-2">
              <p className="text-xs sm:text-sm text-muted-foreground font-medium">URL</p>
              <p className="text-xs sm:text-sm font-mono bg-muted p-2 sm:p-3 rounded break-all">{service.url}</p>
            </div>
            {service.error && (
              <div className="space-y-2">
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">Error</p>
                <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 sm:p-3 rounded break-words">{service.error}</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between gap-2 pt-4">
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-1.5 w-full sm:w-auto h-9"
          onClick={() => onOpenExternal(service.url)}
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Open
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-1.5 w-full sm:w-auto h-9"
          onClick={onRefresh}
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </Button>
      </CardFooter>
    </Card>
  )
}

// Quick Links Component
interface QuickLinksProps {
  quickLinks: Array<{
    name: string;
    url: string;
    description: string;
    icon: string;
  }>;
  onOpenExternal: (url: string) => void;
}

const QuickLinks: React.FC<QuickLinksProps> = ({ quickLinks, onOpenExternal }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ExternalLink className="h-5 w-5" />
          Quick Links
        </CardTitle>
        <CardDescription>
          Quick access to external monitoring services
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {quickLinks.map((link, index) => (
            <motion.div
              key={link.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-auto p-4"
                onClick={() => onOpenExternal(link.url)}
              >
                <span className="text-lg">{link.icon}</span>
                <div className="text-left">
                  <div className="font-medium">{link.name}</div>
                  <div className="text-xs text-muted-foreground">{link.description}</div>
                </div>
                <ExternalLink className="h-4 w-4 ml-auto" />
              </Button>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default function ServicesPage() {
  const {
    healthData,
    loading,
    error,
    refresh,
    checkSingleService,
    quickLinks
  } = useHealthMonitoring()

  const handleOpenExternal = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const handleRefreshService = async (serviceName: string) => {
    try {
      await checkSingleService(serviceName)
    } catch (err) {
      console.error(`Failed to refresh ${serviceName}:`, err)
    }
  }

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
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">Service Health</h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            Monitor and manage your DevOps services health status
          </p>
        </motion.div>
        <Button 
          variant="outline" 
          size="sm"
          className="gap-2 h-9 sm:h-10"
          onClick={refresh}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          <span className="hidden sm:inline">Refresh</span>
        </Button>
      </div>

      {/* Tabs for Health and Versions */}
      <Tabs defaultValue="health" className="space-y-4 sm:space-y-6">
        <TabsList className="grid w-full grid-cols-2 h-10 sm:h-11">
          <TabsTrigger value="health" className="text-sm">Service Health</TabsTrigger>
          <TabsTrigger value="versions" className="text-sm">Component Versions</TabsTrigger>
        </TabsList>

        <TabsContent value="health" className="space-y-6">

      {/* Overall Status */}
      {healthData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="text-3xl sm:text-4xl flex-shrink-0">
                    {healthAPI.getOverallStatusIcon(healthData.overallStatus)}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-xl sm:text-2xl font-bold">Overall Status</h2>
                    <p className={`text-base sm:text-lg font-medium ${healthAPI.getOverallStatusColor(healthData.overallStatus)}`}>
                      {healthData.overallStatus.charAt(0).toUpperCase() + healthData.overallStatus.slice(1)}
                    </p>
                  </div>
                </div>
                <div className="text-left sm:text-right w-full sm:w-auto">
                  <p className="text-xs sm:text-sm text-muted-foreground">Last Updated</p>
                  <p className="text-sm font-medium">
                    {healthData.lastUpdated.toLocaleTimeString()}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {healthData.services.filter(s => s.status === 'up').length} of {healthData.services.length} services up
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Error State */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-900/20">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm sm:text-base font-medium text-red-700 dark:text-red-400 mb-1">Error</p>
                  <p className="text-sm text-red-600 dark:text-red-500 break-words">
                    {error}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Services Health */}
        <div className="lg:col-span-2 space-y-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold mb-2">Service Health Status</h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Real-time health monitoring of all monitoring services
            </p>
          </div>
          
          {loading && !healthData ? (
            <div className="flex items-center justify-center py-12 sm:py-16">
              <div className="text-center">
                <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-sm sm:text-base text-muted-foreground">Checking service health...</p>
              </div>
            </div>
          ) : healthData ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {healthData.services.map((service, index) => (
                <motion.div
                  key={service.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <ServiceHealthCard
                    service={service}
                    onRefresh={() => handleRefreshService(service.name)}
                    onOpenExternal={handleOpenExternal}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 sm:p-12 text-center">
                <AlertTriangle className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm sm:text-base text-muted-foreground">No health data available</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Quick Links */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <QuickLinks
              quickLinks={quickLinks}
              onOpenExternal={handleOpenExternal}
            />
          </motion.div>
        </div>
      </div>
        </TabsContent>

        <TabsContent value="versions" className="space-y-6">
          <VersionMonitor 
            showDetails={true}
            autoRefresh={true}
            refreshInterval={300000}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
