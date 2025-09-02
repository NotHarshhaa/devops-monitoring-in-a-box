// Dynamic metrics component that generates cards and charts based on configuration

import React from "react";
import { motion } from "framer-motion";
import { useMetricsConfig } from "@/lib/hooks/use-config";
import { MetricsCard } from "./metrics-card";
import { MetricsChart } from "./metrics-chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

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
    metricsConfig, 
    metricsByGroup, 
    isLoading, 
    error 
  } = useMetricsConfig();

  if (isLoading) {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="flex items-center justify-center h-32">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("space-y-6", className)}>
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <CardContent className="flex items-center gap-2 text-red-600 dark:text-red-400 p-6">
            <AlertCircle className="h-6 w-6" />
            <span>Failed to load metrics configuration: {error}</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!metricsConfig || metricsConfig.length === 0) {
    return (
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
    );
  }

  return (
    <motion.div 
      className={cn("space-y-6", className)}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {showCards && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {metricsConfig.map((metric, index) => renderMetricCard(metric, index))}
        </div>
      )}
      
      {showCharts && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
          {metricsConfig.map((metric, index) => renderMetricChart(metric, index))}
        </div>
      )}
    </motion.div>
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
  const { metricsConfig, metricsByGroup, isLoading, error } = useMetricsConfig();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
        <CardContent className="flex items-center gap-2 text-red-600 dark:text-red-400 p-4">
          <AlertCircle className="h-5 w-5" />
          <span className="text-sm">Configuration error: {error}</span>
        </CardContent>
      </Card>
    );
  }

  const totalMetrics = metricsConfig.length;
  const enabledMetrics = metricsConfig.filter(m => m.enabled !== false).length;
  const groups = Object.keys(metricsByGroup);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Metrics Configuration
        </CardTitle>
        <CardDescription>
          Current metrics configuration summary
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{totalMetrics}</div>
            <div className="text-sm text-muted-foreground">Total Metrics</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{enabledMetrics}</div>
            <div className="text-sm text-muted-foreground">Enabled</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{groups.length}</div>
            <div className="text-sm text-muted-foreground">Groups</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {metricsConfig.filter(m => m.chart).length}
            </div>
            <div className="text-sm text-muted-foreground">With Charts</div>
          </div>
        </div>
        
        {groups.length > 0 && (
          <div className="mt-4">
            <div className="text-sm font-medium mb-2">Groups:</div>
            <div className="flex flex-wrap gap-2">
              {groups.map(group => (
                <Badge key={group} variant="outline">
                  {group} ({metricsByGroup[group].length})
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
