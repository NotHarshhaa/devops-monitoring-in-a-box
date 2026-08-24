"use client"

import React from "react"
import { motion } from "framer-motion"
import { HugeiconsIcon } from "@hugeicons/react"
import { 
  CloudServerIcon, 
  CheckmarkCircle01Icon, 
  Alert02Icon, 
  RefreshIcon, 
  ArrowUpRight01Icon,
  Loading03Icon,
  Clock01Icon,
  Activity01Icon,
  Shield01Icon,
  FlashIcon,
  DatabaseIcon
} from "@hugeicons/core-free-icons"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
        return <HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-4 w-4 text-foreground" />
      case "down":
        return <HugeiconsIcon icon={Alert02Icon} className="h-4 w-4 text-foreground" />
      case "checking":
        return <HugeiconsIcon icon={Loading03Icon} className="h-4 w-4 text-foreground animate-spin" />
      default:
        return <HugeiconsIcon icon={Alert02Icon} className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "up":
        return <Badge className="text-foreground border border-border">Up</Badge>
      case "down":
        return <Badge className="text-foreground border border-border">Down</Badge>
      case "checking":
        return <Badge className="text-foreground border border-border">Checking</Badge>
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
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="h-full flex flex-col border border-border bg-card transition-all duration-300 overflow-hidden group">
        <CardHeader className="pb-3 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-3">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <div className="p-2 sm:p-3 flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                <HugeiconsIcon icon={CloudServerIcon} className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="text-base sm:text-lg truncate text-foreground transition-colors">
                  {service.name}
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm mt-1 line-clamp-2 text-muted-foreground">
                  {service.description}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {getStatusBadge(service.status)}
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-4 sm:p-6">
          <Tabs defaultValue="overview">
            <TabsList className="mb-4 h-9 sm:h-10 w-full grid grid-cols-2 bg-muted p-1">
              <TabsTrigger value="overview" className="text-xs sm:text-sm font-medium">Overview</TabsTrigger>
              <TabsTrigger value="details" className="text-xs sm:text-sm font-medium">Details</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm text-muted-foreground">Status</p>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(service.status)}
                    <p className="text-xs sm:text-sm font-medium capitalize text-foreground">{service.status}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm text-muted-foreground">Port</p>
                  <p className="text-xs sm:text-sm font-medium text-foreground">{getPortFromUrl(service.url)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm text-muted-foreground">Response Time</p>
                  <p className="text-xs sm:text-sm font-medium text-foreground">
                    {service.responseTime ? healthAPI.formatResponseTime(service.responseTime) : 'N/A'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm text-muted-foreground">Last Checked</p>
                  <p className="text-xs sm:text-sm font-medium text-foreground">
                    {new Date(service.lastChecked).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="details" className="space-y-3 sm:space-y-4">
              <div className="space-y-2">
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">Endpoint</p>
                <p className="text-xs sm:text-sm font-mono bg-muted p-2 sm:p-3 border border-border break-all text-foreground">{service.endpoint}</p>
              </div>
              <div className="space-y-2">
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">URL</p>
                <p className="text-xs sm:text-sm font-mono bg-muted p-2 sm:p-3 border border-border break-all text-foreground">{service.url}</p>
              </div>
              {service.error && (
                <div className="space-y-2">
                  <p className="text-xs sm:text-sm text-muted-foreground font-medium">Error</p>
                  <p className="text-xs sm:text-sm text-foreground bg-muted p-2 sm:p-3 border border-border break-words">{service.error}</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-between gap-2 pt-4 p-4 sm:p-6">
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-1.5 w-full sm:w-auto h-9 bg-card border-border hover:bg-muted"
            onClick={() => onOpenExternal(service.url)}
          >
            <HugeiconsIcon icon={ArrowUpRight01Icon} className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Open</span>
            <span className="sm:hidden">View</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-1.5 w-full sm:w-auto h-9 bg-card border-border hover:bg-muted"
            onClick={onRefresh}
          >
            <HugeiconsIcon icon={RefreshIcon} className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Refresh</span>
            <span className="sm:hidden">Check</span>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
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
    <Card className="border border-border bg-card transition-all duration-300">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 sm:gap-3 text-foreground">
          <div className="p-2">
            <HugeiconsIcon icon={ArrowUpRight01Icon} className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
          </div>
          <span className="text-lg sm:text-xl">Quick Links</span>
        </CardTitle>
        <CardDescription className="text-sm sm:text-base text-muted-foreground">
          Quick access to external monitoring services
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className="grid grid-cols-1 gap-3">
          {quickLinks.map((link, index) => (
            <motion.div
              key={link.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-auto p-3 sm:p-4 group border-border bg-card hover:bg-muted"
                onClick={() => onOpenExternal(link.url)}
              >
                <span className="text-lg sm:text-xl group-hover:scale-110 transition-transform duration-300">{link.icon}</span>
                <div className="text-left flex-1 min-w-0">
                  <div className="font-medium text-sm sm:text-base text-foreground truncate">{link.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{link.description}</div>
                </div>
                <HugeiconsIcon icon={ArrowUpRight01Icon} className="h-4 w-4 text-muted-foreground transition-colors flex-shrink-0" />
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
                      <HugeiconsIcon icon={Shield01Icon} className="h-5 w-5 sm:h-7 sm:w-7 text-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-xl sm:text-3xl lg:text-4xl font-bold">
                        Service Health
                      </CardTitle>
                      <CardDescription className="mt-1 sm:mt-2 text-muted-foreground text-sm sm:text-base">
                        Monitor and manage your DevOps services health status
                      </CardDescription>
                    </div>
                  </div>
                </div>
                <div className="hidden sm:block">
                  <Badge className="bg-card text-foreground border-border px-3 py-1.5 font-semibold text-sm">
                    <HugeiconsIcon icon={Activity01Icon} className="h-3 w-3 mr-1" />
                    Real-time
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
                    <HugeiconsIcon icon={CloudServerIcon} className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-foreground">
                    {healthData?.services.filter(s => s.status === 'up').length || 0}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Services Up</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="text-center p-3 sm:p-4 border border-border"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-muted border border-border flex items-center justify-center mx-auto mb-2">
                    <HugeiconsIcon icon={Activity01Icon} className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-foreground">
                    {healthData?.services.length || 0}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Total Services</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                  className="text-center p-3 sm:p-4 border border-border"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-muted border border-border flex items-center justify-center mx-auto mb-2">
                    <HugeiconsIcon icon={FlashIcon} className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-foreground">
                    {healthData?.services.filter(s => s.responseTime && s.responseTime < 100).length || 0}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Fast Response</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                  className="text-center p-3 sm:p-4 border border-border"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-muted border border-border flex items-center justify-center mx-auto mb-2">
                    <HugeiconsIcon icon={Clock01Icon} className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-foreground">24/7</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Monitoring</div>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Refresh Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex justify-end"
        >
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 h-9 sm:h-10 bg-card border-border hover:bg-muted"
            onClick={refresh}
            disabled={loading}
          >
            {loading ? (
              <HugeiconsIcon icon={Loading03Icon} className="h-4 w-4 animate-spin" />
            ) : (
              <HugeiconsIcon icon={RefreshIcon} className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">Refresh All</span>
            <span className="sm:hidden">Refresh</span>
          </Button>
        </motion.div>

        {/* Tabs for Health and Versions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Tabs defaultValue="health" className="space-y-4 sm:space-y-6">
            <TabsList className="grid w-full grid-cols-2 h-10 sm:h-11 bg-muted p-1">
              <TabsTrigger value="health" className="text-sm font-medium gap-2">
                <HugeiconsIcon icon={Shield01Icon} className="h-4 w-4" />
                <span className="hidden sm:inline">Service Health</span>
                <span className="sm:hidden">Health</span>
              </TabsTrigger>
              <TabsTrigger value="versions" className="text-sm font-medium gap-2">
                <HugeiconsIcon icon={DatabaseIcon} className="h-4 w-4" />
                <span className="hidden sm:inline">Component Versions</span>
                <span className="sm:hidden">Versions</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="health" className="space-y-4 sm:space-y-6">

              {/* Overall Status */}
              {healthData && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card className="border border-border bg-card overflow-hidden">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="text-3xl sm:text-4xl flex-shrink-0">
                            {healthAPI.getOverallStatusIcon(healthData.overallStatus)}
                          </div>
                          <div className="min-w-0">
                            <h2 className="text-xl sm:text-2xl font-bold text-foreground">Overall Status</h2>
                            <p className={`text-base sm:text-lg font-medium ${healthAPI.getOverallStatusColor(healthData.overallStatus)}`}>
                              {healthData.overallStatus.charAt(0).toUpperCase() + healthData.overallStatus.slice(1)}
                            </p>
                          </div>
                        </div>
                        <div className="text-left sm:text-right w-full sm:w-auto">
                          <p className="text-xs sm:text-sm text-muted-foreground">Last Updated</p>
                          <p className="text-sm font-medium text-foreground">
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
                  <Card className="border-border bg-muted">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-start gap-3">
                        <HugeiconsIcon icon={Alert02Icon} className="h-5 w-5 text-foreground flex-shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm sm:text-base font-medium text-foreground mb-1">Error</p>
                          <p className="text-sm text-foreground break-words">
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
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-2">Service Health Status</h2>
                      <p className="text-sm sm:text-base text-muted-foreground">
                        Real-time health monitoring of all monitoring services
                      </p>
                    </div>
                    <Badge className="bg-muted text-foreground">
                      <HugeiconsIcon icon={Activity01Icon} className="h-3 w-3 mr-1" />
                      Live
                    </Badge>
                  </div>
                  
                  {loading && !healthData ? (
                    <div className="flex items-center justify-center py-12 sm:py-16">
                      <div className="text-center">
                        <HugeiconsIcon icon={Loading03Icon} className="h-8 w-8 sm:h-10 sm:w-10 animate-spin mx-auto mb-4 text-foreground" />
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
                    <Card className="border border-border">
                      <CardContent className="p-8 sm:p-12 text-center">
                        <HugeiconsIcon icon={Alert02Icon} className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-4" />
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

            <TabsContent value="versions" className="space-y-4 sm:space-y-6">
              <VersionMonitor 
                showDetails={true}
                autoRefresh={true}
                refreshInterval={300000}
              />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}
