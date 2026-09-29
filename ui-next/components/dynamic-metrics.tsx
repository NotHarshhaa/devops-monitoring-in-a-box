// Dynamic metrics component that renders cards and charts based on configuration.
// Values are queried live from Prometheus using each metric's configured PromQL
// expression — the previous implementation generated Math.random() values during
// render, so numbers flickered on every re-render.

import React from "react";
import { motion } from "framer-motion";
import { useQueries } from "@tanstack/react-query";
import { useMultiTenantMetricsConfig } from "@/lib/hooks/use-multi-tenant-config";
import { prometheusAPI } from "@/lib/prometheus-api";
import { config } from "@/lib/config";
import { MetricsCard } from "./metrics-card";
import { MetricsChart } from "./metrics-chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Loading03Icon,
  AlertCircleIcon,
  Settings01Icon,
  CheckmarkCircle01Icon,
  RefreshIcon,
  Download01Icon,
  Activity01Icon,
  Alert02Icon
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { ClientOnly } from "./client-only";
import Link from "next/link";

interface DynamicMetricsProps {
  className?: string;
  showCharts?: boolean;
  showCards?: boolean;
  groupBy?: boolean;
}

interface MetricLiveState {
  value: number | null;
  isLoading: boolean;
  isError: boolean;
  rangeData: Array<{ time: number; value: number }>;
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

  const refreshMs = config.prometheus.refreshInterval;
  const enabledMetrics = (metrics ?? []).filter(m => m.query);

  // One live Prometheus instant query per configured metric
  const valueQueries = useQueries({
    queries: enabledMetrics.map((metric) => ({
      queryKey: ['dynamic-metric-value', metric.name, metric.query],
      queryFn: () => prometheusAPI.getInstantVector(metric.query),
      refetchInterval: refreshMs,
      staleTime: refreshMs,
      retry: 0,
      refetchOnWindowFocus: false,
    })),
  });

  // Range queries for the chart view (only fetched when charts are shown)
  const rangeQueries = useQueries({
    queries: (showCharts ? enabledMetrics : []).map((metric) => {
      const end = Math.floor(Date.now() / 1000);
      const start = end - 60 * 60; // last hour
      return {
        queryKey: ['dynamic-metric-range', metric.name, metric.query, start],
        queryFn: () => prometheusAPI.getRangeMatrix(metric.query, start, end),
        refetchInterval: refreshMs * 6,
        staleTime: refreshMs,
        retry: 0,
        refetchOnWindowFocus: false,
      };
    }),
  });

  const liveStates = new Map<string, MetricLiveState>();
  enabledMetrics.forEach((metric, i) => {
    const q = valueQueries[i];
    const result = q?.data;
    const first = Array.isArray(result) && result.length > 0 ? result[0] : null;
    const rawValue = first ? parseFloat(first.value[1]) : null;
    liveStates.set(metric.name, {
      value: rawValue !== null && !Number.isNaN(rawValue) ? rawValue : null,
      isLoading: !!q?.isLoading,
      isError: !!q?.isError,
      rangeData: [],
    });
  });
  if (showCharts) {
    enabledMetrics.forEach((metric, i) => {
      const state = liveStates.get(metric.name);
      if (!state) return;
      const q = rangeQueries[i];
      const matrix = q?.data;
      const series = Array.isArray(matrix) && matrix.length > 0 ? matrix[0] : null;
      state.rangeData = series
        ? series.values.map(([t, v]) => ({ time: t * 1000, value: parseFloat(v) }))
        : [];
    });
  }

  if (isLoading) {
      return (
    <ClientOnly fallback={
      <div className={cn("space-y-6", className)}>
        <div className="flex items-center justify-center h-32">
          <HugeiconsIcon icon={Loading03Icon} className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    }>
      <div className={cn("space-y-6", className)}>
        <div className="flex items-center justify-center h-32">
          <HugeiconsIcon icon={Loading03Icon} className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    </ClientOnly>
  );
  }

  if (error) {
    return (
      <ClientOnly fallback={
        <div className={cn("space-y-6", className)}>
          <Card className="border-border bg-muted">
            <CardContent className="flex items-center gap-2 text-foreground p-6">
              <HugeiconsIcon icon={AlertCircleIcon} className="h-6 w-6" />
              <span>Failed to load metrics configuration</span>
            </CardContent>
          </Card>
        </div>
      }>
        <div className={cn("space-y-6", className)}>
          <Card className="border-border bg-muted">
            <CardContent className="flex items-center gap-2 text-foreground p-6">
              <HugeiconsIcon icon={AlertCircleIcon} className="h-6 w-6" />
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
                <HugeiconsIcon icon={Settings01Icon} className="h-8 w-8 mx-auto mb-2" />
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
                <HugeiconsIcon icon={Settings01Icon} className="h-8 w-8 mx-auto mb-2" />
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
    const live = liveStates.get(metric.name);
    const value = live?.value ?? null;
    const noData = !live?.isLoading && !live?.isError && value === null;

    return (
      <motion.div key={`${metric.name}-${index}`} variants={itemVariants}>
        <MetricsCard
          title={metric.name}
          description={metric.description || `Monitor ${metric.name.toLowerCase()}`}
          value={value === null ? '--' : value}
          unit={metric.unit || ''}
          percentage={metric.unit === '%' && value !== null ? value : undefined}
          isLoading={!!live?.isLoading}
          isError={!!live?.isError || noData}
          errorMessage={live?.isError ? 'Failed to load metric' : 'No data returned for this metric'}
          color={value !== null ? getMetricColor(value, metric.thresholds) : 'default'}
        />
      </motion.div>
    );
  };

  const renderMetricChart = (metric: any, index: number) => {
    const live = liveStates.get(metric.name);
    const chartData = live?.rangeData ?? [];

    return (
      <motion.div key={`chart-${metric.name}-${index}`} variants={itemVariants}>
        <MetricsChart
          title={metric.name}
          description={metric.description || `Chart for ${metric.name.toLowerCase()}`}
          data={chartData}
          dataKeys={[
            {
              key: 'value',
              color: metric.color || '#525252',
              name: metric.name,
            }
          ]}
          chartType={metric.chart || 'line'}
          height={300}
          showLegend={true}
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
            <HugeiconsIcon icon={Loading03Icon} className="h-8 w-8 animate-spin text-muted-foreground" />
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

  const metricsWithCharts = metrics.filter(m => m.chart);

  return (
    <ClientOnly fallback={
      <div className={cn("space-y-6", className)}>
        <div className="flex items-center justify-center h-32">
          <HugeiconsIcon icon={Loading03Icon} className="h-8 w-8 animate-spin text-muted-foreground" />
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
        
        {showCharts && metricsWithCharts.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            {metricsWithCharts.map((metric, index) => renderMetricChart(metric, index))}
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

// Summary component to show overall configuration health
export function DynamicMetricsSummary({ 
  tenantId, 
  userId, 
  service 
}: { 
  tenantId?: string; 
  userId?: string; 
  service?: string; 
} = {}) {
  const { metrics, metricsByGroup, isLoading, error } = useMultiTenantMetricsConfig();

  if (isLoading) {
    return (
      <ClientOnly fallback={
        <Card className="border border-border bg-card">
          <CardContent className="flex items-center justify-center h-20">
            <HugeiconsIcon icon={Loading03Icon} className="h-6 w-6 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      }>
        <Card className="border border-border bg-card">
          <CardContent className="flex items-center justify-center h-20">
            <HugeiconsIcon icon={Loading03Icon} className="h-6 w-6 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      </ClientOnly>
    );
  }

  if (error) {
    return (
      <ClientOnly fallback={
        <Card className="border border-border bg-muted">
          <CardContent className="flex items-center gap-2 text-foreground p-4">
            <HugeiconsIcon icon={AlertCircleIcon} className="h-5 w-5" />
            <span className="text-sm">Configuration error</span>
          </CardContent>
        </Card>
      }>
        <Card className="border border-border bg-muted">
          <CardContent className="flex items-center gap-2 text-foreground p-4">
            <HugeiconsIcon icon={AlertCircleIcon} className="h-5 w-5" />
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
    if (error) return { status: 'error', color: 'text-foreground', bg: 'bg-muted', message: 'Configuration Error' };
    if (enabledMetrics === 0) return { status: 'warning', color: 'text-foreground', bg: 'bg-muted', message: 'No Metrics Enabled' };
    if (enabledMetrics < totalMetrics * 0.5) return { status: 'warning', color: 'text-foreground', bg: 'bg-muted', message: 'Partially Configured' };
    return { status: 'healthy', color: 'text-foreground', bg: 'bg-muted', message: 'Well Configured' };
  };

  const healthStatus = getHealthStatus();

  return (
    <ClientOnly fallback={
      <Card className="border border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <HugeiconsIcon icon={Settings01Icon} className="h-5 w-5" />
            Metrics Configuration
          </CardTitle>
          <CardDescription>
            Loading configuration summary...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-20">
            <HugeiconsIcon icon={Loading03Icon} className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    }>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border border-border bg-card overflow-hidden">
          <CardHeader className="text-foreground p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl font-bold">
                  <div className="p-2 sm:p-3 bg-muted">
                    <HugeiconsIcon icon={Settings01Icon} className="h-4 w-4 sm:h-6 sm:w-6 text-foreground" />
                  </div>
                  <span className="hidden sm:inline">Metrics Configuration</span>
                  <span className="sm:hidden">Metrics Config</span>
                </CardTitle>
                <CardDescription className="mt-1 sm:mt-2 text-muted-foreground text-xs sm:text-sm">
                  <span className="hidden sm:inline">Current metrics configuration and health status</span>
                  <span className="sm:hidden">Configuration & health</span>
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={`${ healthStatus.status === 'healthy' ? 'bg-foreground text-background' : 'bg-muted text-foreground' } border border-border px-2 py-1 sm:px-3 sm:py-1 font-semibold text-xs sm:text-sm`}>
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
                className="p-3 sm:p-6 border border-border text-center transition-shadow"
              >
                <div className="text-xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2">{totalMetrics}</div>
                <div className="text-xs sm:text-sm font-medium text-foreground">Total Metrics</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="p-3 sm:p-6 border border-border text-center transition-shadow"
              >
                <div className="text-xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2">{enabledMetrics}</div>
                <div className="text-xs sm:text-sm font-medium text-foreground">Enabled</div>
                <div className="mt-2 sm:mt-3">
                  <div className="w-full bg-muted rounded-full h-1.5 sm:h-2">
                    <div 
                      className="bg-muted h-1.5 sm:h-2 rounded-full transition-all duration-500"
                      style={{ width: `${totalMetrics > 0 ? (enabledMetrics / totalMetrics) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                className="p-3 sm:p-6 border border-border text-center transition-shadow"
              >
                <div className="text-xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2">{groups.length}</div>
                <div className="text-xs sm:text-sm font-medium text-foreground">Groups</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.4 }}
                className="p-3 sm:p-6 border border-border text-center transition-shadow"
              >
                <div className="text-xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2">{metricsWithCharts}</div>
                <div className="text-xs sm:text-sm font-medium text-foreground">With Charts</div>
              </motion.div>
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.5 }}
                className="p-3 sm:p-5 border border-border transition-shadow"
              >
                <div className="flex items-center gap-2 sm:gap-4">
                  <div className="p-2 sm:p-3 bg-muted">
                    <HugeiconsIcon icon={Activity01Icon} className="h-4 w-4 sm:h-6 sm:w-6 text-foreground" />
                  </div>
                  <div>
                    <div className="text-lg sm:text-2xl font-bold text-foreground">{realTimeMetrics}</div>
                    <div className="text-sm font-medium text-foreground">Real-time Metrics</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.6 }}
                className="p-3 sm:p-5 border border-border transition-shadow"
              >
                <div className="flex items-center gap-2 sm:gap-4">
                  <div className="p-2 sm:p-3 bg-muted">
                    <HugeiconsIcon icon={Alert02Icon} className="h-4 w-4 sm:h-6 sm:w-6 text-foreground" />
                  </div>
                  <div>
                    <div className="text-lg sm:text-2xl font-bold text-foreground">{metricsWithThresholds}</div>
                    <div className="text-xs sm:text-sm font-medium text-foreground">With Thresholds</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.7 }}
                className="p-3 sm:p-5 border border-border transition-shadow"
              >
                <div className="flex items-center gap-2 sm:gap-4">
                  <div className="p-2 sm:p-3 bg-muted">
                    <HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-4 w-4 sm:h-6 sm:w-6 text-foreground" />
                  </div>
                  <div>
                    <div className="text-lg sm:text-2xl font-bold text-foreground">
                      {Math.round((enabledMetrics / totalMetrics) * 100) || 0}%
                    </div>
                    <div className="text-xs sm:text-sm font-medium text-foreground">Configuration Health</div>
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
                className="bg-muted dark:bg-muted p-3 sm:p-6 border border-border dark:border-border"
              >
                <div className="flex items-center justify-between mb-3 sm:mb-6">
                  <h3 className="text-lg sm:text-xl font-bold text-muted-foreground dark:text-foreground flex items-center gap-2">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-muted rounded-full"></div>
                    <span className="hidden sm:inline">Metric Groups</span>
                    <span className="sm:hidden">Groups</span>
                  </h3>
                  <Badge variant="outline" className="px-3 py-1 bg-card dark:bg-card border-border dark:border-border">
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
                      className="bg-card dark:bg-card p-4 border border-border dark:border-border flex items-center justify-between transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full"></div>
                        <span className="font-semibold text-muted-foreground dark:text-muted-foreground">{group}</span>
                      </div>
                      <Badge variant="secondary" className="px-2 py-1 bg-muted dark:bg-muted text-muted-foreground dark:text-muted-foreground">
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
              className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-border dark:border-border"
            >
              <Link href="/settings" className="w-full sm:w-auto">
                <Button variant="outline" className="gap-2 border-border dark:border-border hover:bg-muted dark:hover:bg-muted w-full sm:w-auto">
                  <HugeiconsIcon icon={Settings01Icon} className="h-4 w-4" />
                  Configure Metrics
                </Button>
              </Link>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </ClientOnly>
  );
}

export const MetricsConfigSummary = DynamicMetricsSummary;
