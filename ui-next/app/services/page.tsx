"use client"

import React from "react"
import { motion } from "framer-motion"
import { 
  Server, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw, 
  ExternalLink,
  Loader2,
  Clock,
  Activity,
  Shield,
  Zap,
  Database} from "lucide-react"
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
        return <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0">Up</Badge>
      case "down":
        return <Badge className="bg-gradient-to-r from-red-500 to-rose-600 text-white border-0">Down</Badge>
      case "checking":
        return <Badge className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white border-0">Checking</Badge>
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
      <Card className="h-full flex flex-col border border-gray-200 dark:border-gray-700 shadow-lg bg-white dark:bg-gray-900 hover:shadow-xl transition-all duration-300 overflow-hidden group">
        <CardHeader className="pb-3 p-4 sm:p-6 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-3">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                <Server className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="text-base sm:text-lg truncate text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {service.name}
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm mt-1 line-clamp-2 text-gray-600 dark:text-gray-400">
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
            <TabsList className="mb-4 h-9 sm:h-10 w-full grid grid-cols-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
              <TabsTrigger value="overview" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 rounded-lg text-xs sm:text-sm font-medium">Overview</TabsTrigger>
              <TabsTrigger value="details" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 rounded-lg text-xs sm:text-sm font-medium">Details</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Status</p>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(service.status)}
                    <p className="text-xs sm:text-sm font-medium capitalize text-gray-900 dark:text-white">{service.status}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Port</p>
                  <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">{getPortFromUrl(service.url)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Response Time</p>
                  <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                    {service.responseTime ? healthAPI.formatResponseTime(service.responseTime) : 'N/A'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Last Checked</p>
                  <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                    {new Date(service.lastChecked).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="details" className="space-y-3 sm:space-y-4">
              <div className="space-y-2">
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium">Endpoint</p>
                <p className="text-xs sm:text-sm font-mono bg-gray-100 dark:bg-gray-800 p-2 sm:p-3 rounded-lg break-all text-gray-900 dark:text-white">{service.endpoint}</p>
              </div>
              <div className="space-y-2">
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium">URL</p>
                <p className="text-xs sm:text-sm font-mono bg-gray-100 dark:bg-gray-800 p-2 sm:p-3 rounded-lg break-all text-gray-900 dark:text-white">{service.url}</p>
              </div>
              {service.error && (
                <div className="space-y-2">
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium">Error</p>
                  <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 sm:p-3 rounded-lg break-words">{service.error}</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-between gap-2 pt-4 p-4 sm:p-6">
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-1.5 w-full sm:w-auto h-9 hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-900/20"
            onClick={() => onOpenExternal(service.url)}
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Open</span>
            <span className="sm:hidden">View</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-1.5 w-full sm:w-auto h-9 hover:bg-green-50 hover:border-green-300 dark:hover:bg-green-900/20"
            onClick={onRefresh}
          >
            <RefreshCw className="h-3.5 w-3.5" />
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
    <Card className="border border-gray-200 dark:border-gray-700 shadow-lg bg-white dark:bg-gray-900 hover:shadow-xl transition-all duration-300">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 sm:gap-3 text-gray-900 dark:text-white">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
            <ExternalLink className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          </div>
          <span className="text-lg sm:text-xl">Quick Links</span>
        </CardTitle>
        <CardDescription className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
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
                className="w-full justify-start gap-3 h-auto p-3 sm:p-4 hover:bg-purple-50 hover:border-purple-300 dark:hover:bg-purple-900/20 group"
                onClick={() => onOpenExternal(link.url)}
              >
                <span className="text-lg sm:text-xl group-hover:scale-110 transition-transform duration-300">{link.icon}</span>
                <div className="text-left flex-1 min-w-0">
                  <div className="font-medium text-sm sm:text-base text-gray-900 dark:text-white truncate">{link.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{link.description}</div>
                </div>
                <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-purple-600 transition-colors flex-shrink-0" />
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-900 dark:to-green-900/20">
      <div className="px-2 sm:px-4 py-3 sm:py-6 max-w-7xl mx-auto space-y-3 sm:space-y-6">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border border-gray-200 dark:border-gray-700 shadow-xl bg-white dark:bg-gray-900 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 dark:from-green-700 dark:via-emerald-700 dark:to-teal-700 text-white p-4 sm:p-8">
              <div className="flex items-center justify-between">
                <div className="space-y-2 sm:space-y-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-2 sm:p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                      <Shield className="h-5 w-5 sm:h-7 sm:w-7 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl sm:text-3xl lg:text-4xl font-bold">
                        Service Health
                      </CardTitle>
                      <CardDescription className="mt-1 sm:mt-2 text-green-100 text-sm sm:text-base">
                        Monitor and manage your DevOps services health status
                      </CardDescription>
                    </div>
                  </div>
                </div>
                <div className="hidden sm:block">
                  <Badge className="bg-white/20 text-white border-white/30 px-3 py-1.5 font-semibold text-sm">
                    <Activity className="h-3 w-3 mr-1" />
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
                  className="text-center p-3 sm:p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Server className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-green-600 dark:text-green-400">
                    {healthData?.services.filter(s => s.status === 'up').length || 0}
                  </div>
                  <div className="text-xs sm:text-sm text-green-700 dark:text-green-300">Services Up</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="text-center p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-200 dark:border-blue-800"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-blue-600 dark:text-blue-400">
                    {healthData?.services.length || 0}
                  </div>
                  <div className="text-xs sm:text-sm text-blue-700 dark:text-blue-300">Total Services</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                  className="text-center p-3 sm:p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-800"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-purple-600 dark:text-purple-400">
                    {healthData?.services.filter(s => s.responseTime && s.responseTime < 100).length || 0}
                  </div>
                  <div className="text-xs sm:text-sm text-purple-700 dark:text-purple-300">Fast Response</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                  className="text-center p-3 sm:p-4 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl border border-orange-200 dark:border-orange-800"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-orange-600 dark:text-orange-400">24/7</div>
                  <div className="text-xs sm:text-sm text-orange-700 dark:text-orange-300">Monitoring</div>
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
            className="gap-2 h-9 sm:h-10 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
            onClick={refresh}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
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
            <TabsList className="grid w-full grid-cols-2 h-10 sm:h-11 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
              <TabsTrigger value="health" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 rounded-lg text-sm font-medium gap-2">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Service Health</span>
                <span className="sm:hidden">Health</span>
              </TabsTrigger>
              <TabsTrigger value="versions" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 rounded-lg text-sm font-medium gap-2">
                <Database className="h-4 w-4" />
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
                  <Card className="border border-gray-200 dark:border-gray-700 shadow-lg bg-white dark:bg-gray-900 overflow-hidden">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="text-3xl sm:text-4xl flex-shrink-0">
                            {healthAPI.getOverallStatusIcon(healthData.overallStatus)}
                          </div>
                          <div className="min-w-0">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Overall Status</h2>
                            <p className={`text-base sm:text-lg font-medium ${healthAPI.getOverallStatusColor(healthData.overallStatus)}`}>
                              {healthData.overallStatus.charAt(0).toUpperCase() + healthData.overallStatus.slice(1)}
                            </p>
                          </div>
                        </div>
                        <div className="text-left sm:text-right w-full sm:w-auto">
                          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Last Updated</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {healthData.lastUpdated.toLocaleTimeString()}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
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
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-2">Service Health Status</h2>
                      <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
                        Real-time health monitoring of all monitoring services
                      </p>
                    </div>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      <Activity className="h-3 w-3 mr-1" />
                      Live
                    </Badge>
                  </div>
                  
                  {loading && !healthData ? (
                    <div className="flex items-center justify-center py-12 sm:py-16">
                      <div className="text-center">
                        <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 animate-spin mx-auto mb-4 text-green-600" />
                        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">Checking service health...</p>
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
                    <Card className="border border-gray-200 dark:border-gray-700">
                      <CardContent className="p-8 sm:p-12 text-center">
                        <AlertTriangle className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">No health data available</p>
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
