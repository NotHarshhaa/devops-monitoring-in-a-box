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
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-md bg-primary/10">
              <Server className="h-5 w-5 text-primary" />
            </div>
            <CardTitle>{service.name}</CardTitle>
          </div>
          <div className="flex space-x-2">
            {getStatusBadge(service.status)}
          </div>
        </div>
        <CardDescription>{service.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <div className="flex items-center gap-2">
                  {getStatusIcon(service.status)}
                  <p className="text-sm font-medium capitalize">{service.status}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Port</p>
                <p className="text-sm font-medium">{getPortFromUrl(service.url)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Response Time</p>
                <p className="text-sm font-medium">
                  {service.responseTime ? healthAPI.formatResponseTime(service.responseTime) : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Checked</p>
                <p className="text-sm font-medium">
                  {new Date(service.lastChecked).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="details" className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Endpoint</p>
              <p className="text-sm font-mono bg-muted p-2 rounded">{service.endpoint}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">URL</p>
              <p className="text-sm font-mono bg-muted p-2 rounded break-all">{service.url}</p>
            </div>
            {service.error && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Error</p>
                <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{service.error}</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-1"
          onClick={() => onOpenExternal(service.url)}
        >
          <ExternalLink className="h-3 w-3" />
          Open
        </Button>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-1"
            onClick={onRefresh}
          >
            <RefreshCw className="h-3 w-3" />
            Refresh
          </Button>
        </div>
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
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold">Service Health</h1>
          <p className="text-muted-foreground mt-2">
            Monitor and manage your DevOps services health status
          </p>
        </motion.div>
        <Button 
          variant="outline" 
          className="gap-2"
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
      </div>

      {/* Tabs for Health and Versions */}
      <Tabs defaultValue="health" className="space-y-6">
        <TabsList>
          <TabsTrigger value="health">Service Health</TabsTrigger>
          <TabsTrigger value="versions">Component Versions</TabsTrigger>
        </TabsList>

        <TabsContent value="health" className="space-y-6">

      {/* Overall Status */}
      {healthData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-4xl">
                    {healthAPI.getOverallStatusIcon(healthData.overallStatus)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Overall Status</h2>
                    <p className={`text-lg font-medium ${healthAPI.getOverallStatusColor(healthData.overallStatus)}`}>
                      {healthData.overallStatus.charAt(0).toUpperCase() + healthData.overallStatus.slice(1)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Last Updated</p>
                  <p className="text-sm font-medium">
                    {healthData.lastUpdated.toLocaleTimeString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
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
          className="mb-6"
        >
          <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-900/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <p className="text-red-700 dark:text-red-400">
                  Error: {error}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Services Health */}
        <div className="lg:col-span-2">
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">Service Health Status</h2>
            <p className="text-muted-foreground">
              Real-time health monitoring of all monitoring services
            </p>
          </div>
          
          {loading && !healthData ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Checking service health...</p>
              </div>
            </div>
          ) : healthData ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <CardContent className="p-8 text-center">
                <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No health data available</p>
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
