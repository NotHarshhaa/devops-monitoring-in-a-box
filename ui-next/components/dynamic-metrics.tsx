// Dynamic metrics component that generates cards and charts based on configuration

import React from "react";
import { motion } from "framer-motion";
import { useMultiTenantMetricsConfig } from "@/lib/hooks/use-multi-tenant-config";
import { MetricsCard } from "./metrics-card";
import { MetricsChart } from "./metrics-chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, Settings, CheckCircle, RefreshCw, Download, Activity, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { ClientOnly } from "./client-only";

interface DynamicMetricsProps {
  className?: string;
  showCharts?: boolean;
  showCards?: boolean;
  groupBy?: boolean;
}

export function DynamicMetrics({ 
  className, 
  showCharts = true, 
  showCards = true,
  groupBy = true 
}: DynamicMetricsProps) {
  const { 
    metrics, 
    metricsByGroup, 
    isLoading, 
    error 
  } = useMultiTenantMetricsConfig();

  if (isLoading) {
      return (
    <ClientOnly fallback={
      <div className={cn("space-y-6", className)}>
        <div className="flex items-center justify-center h-32">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    }>
      <div className={cn("space-y-6", className)}>
        <div className="flex items-center justify-center h-32">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    </ClientOnly>
  );
  }

  if (error) {
    return (
      <ClientOnly fallback={
        <div className={cn("space-y-6", className)}>
          <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
            <CardContent className="flex items-center gap-2 text-red-600 dark:text-red-400 p-6">
              <AlertCircle className="h-6 w-6" />
              <span>Failed to load metrics configuration</span>
            </CardContent>
          </Card>
        </div>
      }>
        <div className={cn("space-y-6", className)}>
          <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
            <CardContent className="flex items-center gap-2 text-red-600 dark:text-red-400 p-6">
              <AlertCircle className="h-6 w-6" />
              <span>Failed to load metrics configuration: {error}</span>
            </CardContent>
          </Card>
        </div>
      </ClientOnly>
    );
  }

  if (!metrics || metrics.length === 0) {
    return (
      <ClientOnly fallback={
        <div className={cn("space-y-6", className)}>
          <Card>
            <CardContent className="flex items-center justify-center h-32 text-muted-foreground">
              <div className="text-center">
                <Settings className="h-8 w-8 mx-auto mb-2" />
                <p>Loading metrics configuration...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      }>
        <div className={cn("space-y-6", className)}>
          <Card>
            <CardContent className="flex items-center justify-center h-32 text-muted-foreground">
              <div className="text-center">
                <Settings className="h-8 w-8 mx-auto mb-2" />
                <p>No metrics configured</p>
                <p className="text-sm">Add metrics in the configuration to see them here</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </ClientOnly>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  const renderMetricCard = (metric: any, index: number) => {
    // Mock data for demonstration - in real implementation, this would come from Prometheus
    const mockValue = Math.random() * 100;
    const mockTrend = Math.random() > 0.5 ? 'up' : 'down';
    const mockTrendValue = `${(Math.random() * 10).toFixed(1)}%`;

    return (
      <motion.div key={`${metric.name}-${index}`} variants={itemVariants}>
        <MetricsCard
          title={metric.name}
          description={metric.description || `Monitor ${metric.name.toLowerCase()}`}
          value={mockValue}
          unit={metric.unit || ''}
          percentage={metric.unit === '%' ? mockValue : undefined}
          trend={mockTrend}
          trendValue={mockTrendValue}
          isLoading={false}
          isError={false}
          color={getMetricColor(mockValue, metric.thresholds)}
        />
      </motion.div>
    );
  };

  const renderMetricChart = (metric: any, index: number) => {
    // Mock chart data for demonstration
    const mockData = generateMockChartData(metric.name);

    return (
      <motion.div key={`chart-${metric.name}-${index}`} variants={itemVariants}>
        <MetricsChart
          title={metric.name}
          description={metric.description || `Chart for ${metric.name.toLowerCase()}`}
          data={mockData}
          dataKeys={[
            {
              key: 'value',
              color: metric.color || '#3b82f6',
              name: metric.name,
            }
          ]}
          chartType={metric.chart || 'line'}
          height={300}
          showLegend={true}
          showRefreshInterval={true}
          formatYAxis={(value) => `${value.toFixed(1)}${metric.unit || ''}`}
          formatTooltip={(value, name) => [`${value.toFixed(2)}${metric.unit || ''}`, name]}
        />
      </motion.div>
    );
  };

  const renderGroup = (groupName: string, metrics: any[]) => {
    return (
      <motion.div key={groupName} variants={itemVariants}>
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">{groupName}</h2>
            <Badge variant="secondary">{metrics.length} metrics</Badge>
          </div>
          
          {showCards && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {metrics.map((metric, index) => renderMetricCard(metric, index))}
            </div>
          )}
          
          {showCharts && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
              {metrics.map((metric, index) => renderMetricChart(metric, index))}
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  if (groupBy && Object.keys(metricsByGroup).length > 0) {
    return (
      <ClientOnly fallback={
        <div className={cn("space-y-8", className)}>
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </div>
      }>
        <motion.div 
          className={cn("space-y-8", className)}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {Object.entries(metricsByGroup).map(([groupName, metrics]) => 
            renderGroup(groupName, metrics)
          )}
        </motion.div>
      </ClientOnly>
    );
  }

  return (
    <ClientOnly fallback={
      <div className={cn("space-y-6", className)}>
        <div className="flex items-center justify-center h-32">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    }>
      <motion.div 
        className={cn("space-y-6", className)}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {showCards && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {metrics.map((metric, index) => renderMetricCard(metric, index))}
          </div>
        )}
        
        {showCharts && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
            {metrics.map((metric, index) => renderMetricChart(metric, index))}
          </div>
        )}
      </motion.div>
    </ClientOnly>
  );
}

// Helper function to get metric color based on thresholds
function getMetricColor(value: number, thresholds?: { warning?: number; critical?: number }): 'default' | 'success' | 'warning' | 'danger' {
  if (!thresholds) return 'default';
  
  if (thresholds.critical && value >= thresholds.critical) return 'danger';
  if (thresholds.warning && value >= thresholds.warning) return 'warning';
  return 'success';
}

// Helper function to generate mock chart data
function generateMockChartData(metricName: string) {
  const data = [];
  const now = Date.now();
  const interval = 5 * 60 * 1000; // 5 minutes
  
  for (let i = 24; i >= 0; i--) {
    const timestamp = now - (i * interval);
    const baseValue = getBaseValueForMetric(metricName);
    const variation = (Math.random() - 0.5) * 20; // ±10% variation
    const value = Math.max(0, baseValue + variation);
    
    data.push({
      time: timestamp,
      value: value,
    });
  }
  
  return data;
}

// Helper function to get base value for different metrics
function getBaseValueForMetric(metricName: string): number {
  const baseValues: Record<string, number> = {
    'CPU Usage': 45,
    'Memory Usage': 67,
    'Disk Usage': 23,
    'Network Traffic': 12,
    'Load Average': 1.2,
    'Response Time': 150,
    'Error Rate': 0.5,
    'Throughput': 1000,
  };
  
  return baseValues[metricName] || 50;
}

// Component for displaying configuration summary
export function MetricsConfigSummary() {
  const { metrics, metricsByGroup, isLoading, error } = useMultiTenantMetricsConfig();

  if (isLoading) {
    return (
      <ClientOnly fallback={
        <Card>
          <CardContent className="flex items-center justify-center h-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      }>
        <Card>
          <CardContent className="flex items-center justify-center h-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      </ClientOnly>
    );
  }

  if (error) {
    return (
      <ClientOnly fallback={
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <CardContent className="flex items-center gap-2 text-red-600 dark:text-red-400 p-4">
            <AlertCircle className="h-5 w-5" />
            <span className="text-sm">Configuration error</span>
          </CardContent>
        </Card>
      }>
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <CardContent className="flex items-center gap-2 text-red-600 dark:text-red-400 p-4">
            <AlertCircle className="h-5 w-5" />
            <span className="text-sm">Configuration error: {error}</span>
          </CardContent>
        </Card>
      </ClientOnly>
    );
  }

  const totalMetrics = metrics.length;
  const enabledMetrics = metrics.filter(m => m.enabled !== false).length;
  const groups = Object.keys(metricsByGroup);
  const metricsWithCharts = metrics.filter(m => m.chart).length;
  const metricsWithThresholds = metrics.filter(m => m.thresholds).length;
  const realTimeMetrics = metrics.filter(m => (m as any).realTime).length;

  const getHealthStatus = () => {
    if (error) return { status: 'error', color: 'text-red-600', bg: 'bg-red-100', message: 'Configuration Error' };
    if (enabledMetrics === 0) return { status: 'warning', color: 'text-yellow-600', bg: 'bg-yellow-100', message: 'No Metrics Enabled' };
    if (enabledMetrics < totalMetrics * 0.5) return { status: 'warning', color: 'text-yellow-600', bg: 'bg-yellow-100', message: 'Partially Configured' };
    return { status: 'healthy', color: 'text-green-600', bg: 'bg-green-100', message: 'Well Configured' };
  };

  const healthStatus = getHealthStatus();

  return (
    <ClientOnly fallback={
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Metrics Configuration
          </CardTitle>
          <CardDescription>
            Loading configuration summary...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    }>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border border-gray-200 dark:border-gray-700 shadow-xl bg-white dark:bg-gray-900 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 text-white p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl font-bold">
                  <div className="p-2 sm:p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <Settings className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <span className="hidden sm:inline">Metrics Configuration</span>
                  <span className="sm:hidden">Metrics Config</span>
                </CardTitle>
                <CardDescription className="mt-1 sm:mt-2 text-blue-100 text-xs sm:text-sm">
                  <span className="hidden sm:inline">Current metrics configuration and health status</span>
                  <span className="sm:hidden">Configuration & health</span>
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={`${
                  healthStatus.status === 'healthy' ? 'bg-green-500 text-white' :
                  healthStatus.status === 'warning' ? 'bg-yellow-500 text-white' :
                  'bg-red-500 text-white'
                } border-0 px-2 py-1 sm:px-3 sm:py-1 font-semibold text-xs sm:text-sm`}>
                  {healthStatus.message}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            {/* Primary Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl p-3 sm:p-6 border border-blue-200 dark:border-blue-700 text-center hover:shadow-lg transition-shadow"
              >
                <div className="text-xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1 sm:mb-2">{totalMetrics}</div>
                <div className="text-xs sm:text-sm font-medium text-blue-800 dark:text-blue-200">Total Metrics</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-xl p-3 sm:p-6 border border-green-200 dark:border-green-700 text-center hover:shadow-lg transition-shadow"
              >
                <div className="text-xl sm:text-3xl font-bold text-green-600 dark:text-green-400 mb-1 sm:mb-2">{enabledMetrics}</div>
                <div className="text-xs sm:text-sm font-medium text-green-800 dark:text-green-200">Enabled</div>
                <div className="mt-2 sm:mt-3">
                  <div className="w-full bg-green-200 dark:bg-green-800 rounded-full h-1.5 sm:h-2">
                    <div 
                      className="bg-green-600 h-1.5 sm:h-2 rounded-full transition-all duration-500"
                      style={{ width: `${totalMetrics > 0 ? (enabledMetrics / totalMetrics) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-xl p-3 sm:p-6 border border-purple-200 dark:border-purple-700 text-center hover:shadow-lg transition-shadow"
              >
                <div className="text-xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1 sm:mb-2">{groups.length}</div>
                <div className="text-xs sm:text-sm font-medium text-purple-800 dark:text-purple-200">Groups</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.4 }}
                className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 rounded-xl p-3 sm:p-6 border border-orange-200 dark:border-orange-700 text-center hover:shadow-lg transition-shadow"
              >
                <div className="text-xl sm:text-3xl font-bold text-orange-600 dark:text-orange-400 mb-1 sm:mb-2">{metricsWithCharts}</div>
                <div className="text-xs sm:text-sm font-medium text-orange-800 dark:text-orange-200">With Charts</div>
              </motion.div>
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.5 }}
                className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/30 dark:to-blue-900/30 rounded-xl p-3 sm:p-5 border border-indigo-200 dark:border-indigo-700 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-2 sm:gap-4">
                  <div className="p-2 sm:p-3 bg-indigo-500 rounded-xl shadow-lg">
                    <Activity className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div>
                    <div className="text-lg sm:text-2xl font-bold text-indigo-600 dark:text-indigo-400">{realTimeMetrics}</div>
                    <div className="text-sm font-medium text-indigo-800 dark:text-indigo-200">Real-time Metrics</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.6 }}
                className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/30 dark:to-amber-900/30 rounded-xl p-3 sm:p-5 border border-orange-200 dark:border-orange-700 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-2 sm:gap-4">
                  <div className="p-2 sm:p-3 bg-orange-500 rounded-xl shadow-lg">
                    <AlertTriangle className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div>
                    <div className="text-lg sm:text-2xl font-bold text-orange-600 dark:text-orange-400">{metricsWithThresholds}</div>
                    <div className="text-xs sm:text-sm font-medium text-orange-800 dark:text-orange-200">With Thresholds</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.7 }}
                className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-xl p-3 sm:p-5 border border-green-200 dark:border-green-700 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-2 sm:gap-4">
                  <div className="p-2 sm:p-3 bg-green-500 rounded-xl shadow-lg">
                    <CheckCircle className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div>
                    <div className="text-lg sm:text-2xl font-bold text-green-600 dark:text-green-400">
                      {Math.round((enabledMetrics / totalMetrics) * 100) || 0}%
                    </div>
                    <div className="text-xs sm:text-sm font-medium text-green-800 dark:text-green-200">Configuration Health</div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Groups Section */}
            {groups.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.8 }}
                className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 sm:p-6 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center justify-between mb-3 sm:mb-6">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full"></div>
                    <span className="hidden sm:inline">Metric Groups</span>
                    <span className="sm:hidden">Groups</span>
                  </h3>
                  <Badge variant="outline" className="px-3 py-1 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600">
                    {groups.length} groups
                  </Badge>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groups.map((group, index) => (
                    <motion.div
                      key={group}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2, delay: 0.9 + index * 0.1 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-600 flex items-center justify-between hover:shadow-lg transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
                        <span className="font-semibold text-gray-900 dark:text-gray-100">{group}</span>
                      </div>
                      <Badge variant="secondary" className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                        {metricsByGroup[group].length}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Configuration Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 1.0 }}
              className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700"
            >
              <Button variant="outline" className="gap-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800">
                <Settings className="h-4 w-4" />
                Configure Metrics
              </Button>
              <Button variant="outline" className="gap-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800">
                <Download className="h-4 w-4" />
                Export Configuration
              </Button>
              <Button variant="outline" className="gap-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800">
                <RefreshCw className="h-4 w-4" />
                Refresh Status
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </ClientOnly>
  );
}
