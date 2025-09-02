import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertCircle, Loader2, Settings } from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  ComposedChart,
  Scatter,
  ScatterChart,
  Cell,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface MetricsChartProps {
  title: string;
  description: string;
  data: Array<{ time: number; [key: string]: number }>;
  dataKeys: Array<{ key: string; color: string; name: string; type?: 'line' | 'area' | 'bar' | 'scatter' }>;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  onRefresh?: () => void;
  onRefreshIntervalChange?: (interval: number) => void;
  className?: string;
  chartType?: 'line' | 'area' | 'bar' | 'composed' | 'stacked';
  height?: number;
  showLegend?: boolean;
  showRefreshInterval?: boolean;
  yAxisDomain?: [number, number];
  formatYAxis?: (value: number) => string;
  formatTooltip?: (value: number, name: string) => [string, string];
  stacked?: boolean;
  animationDuration?: number;
}

export function MetricsChart({
  title,
  description,
  data,
  dataKeys,
  isLoading = false,
  isError = false,
  errorMessage = 'Failed to load chart data',
  onRefresh,
  onRefreshIntervalChange,
  className,
  chartType = 'line',
  height = 300,
  showLegend = true,
  showRefreshInterval = true,
  yAxisDomain,
  formatYAxis,
  formatTooltip,
  stacked = false,
  animationDuration = 1000,
}: MetricsChartProps) {
  const [refreshInterval, setRefreshInterval] = React.useState(15000); // 15 seconds default

  const refreshIntervals = [
    { label: '5 seconds', value: 5000 },
    { label: '15 seconds', value: 15000 },
    { label: '1 minute', value: 60000 },
    { label: '5 minutes', value: 300000 },
    { label: 'Manual', value: 0 },
  ];

  const handleRefreshIntervalChange = (value: string) => {
    const interval = parseInt(value);
    setRefreshInterval(interval);
    onRefreshIntervalChange?.(interval);
  };
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const formatTooltipValue = (value: number, name: string) => {
    if (formatTooltip) {
      return formatTooltip(value, name);
    }
    return [value.toFixed(2), name];
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className={cn("relative overflow-hidden", className)}>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {showRefreshInterval && (
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-muted-foreground" />
                    <Select
                      value={refreshInterval.toString()}
                      onValueChange={handleRefreshIntervalChange}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {refreshIntervals.map((interval) => (
                          <SelectItem key={interval.value} value={interval.value.toString()}>
                            {interval.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {onRefresh && (
                  <Button variant="outline" size="sm" onClick={onRefresh} disabled>
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <motion.div 
              className="flex items-center justify-center" 
              style={{ height }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (isError) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className={cn("relative overflow-hidden border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950", className)}>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {showRefreshInterval && (
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-muted-foreground" />
                    <Select
                      value={refreshInterval.toString()}
                      onValueChange={handleRefreshIntervalChange}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {refreshIntervals.map((interval) => (
                          <SelectItem key={interval.value} value={interval.value.toString()}>
                            {interval.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {onRefresh && (
                  <Button variant="outline" size="sm" onClick={onRefresh}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <motion.div 
              className="flex items-center justify-center gap-2 text-red-600 dark:text-red-400" 
              style={{ height }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <AlertCircle className="h-6 w-6" />
              <span>{errorMessage}</span>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className={cn("relative overflow-hidden", className)}>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {showRefreshInterval && (
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-muted-foreground" />
                    <Select
                      value={refreshInterval.toString()}
                      onValueChange={handleRefreshIntervalChange}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {refreshIntervals.map((interval) => (
                          <SelectItem key={interval.value} value={interval.value.toString()}>
                            {interval.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {onRefresh && (
                  <Button variant="outline" size="sm" onClick={onRefresh}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <motion.div 
              className="flex items-center justify-center text-muted-foreground" 
              style={{ height }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              No data available
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 10, right: 30, left: 0, bottom: 0 },
    };

    const tooltipProps = {
      contentStyle: {
        backgroundColor: "var(--background)",
        borderColor: "var(--border)",
        borderRadius: "8px",
        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
      },
      formatter: formatTooltipValue,
    };

    const gridProps = {
      strokeDasharray: "3 3",
      strokeOpacity: 0.2,
    };

    const animationProps = {
      animationDuration: animationDuration,
      animationEasing: "ease-in-out",
    };

    if (chartType === 'stacked') {
      return (
        <AreaChart {...commonProps}>
          <CartesianGrid {...gridProps} />
          <XAxis 
            dataKey="time" 
            tickFormatter={formatTime}
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            domain={yAxisDomain}
            tickFormatter={formatYAxis}
            tick={{ fontSize: 12 }}
          />
          <Tooltip {...tooltipProps} labelFormatter={formatTime} />
          {showLegend && <Legend />}
          {dataKeys.map(({ key, color, name }, index) => (
            <Area
              key={key}
              type="monotone"
              dataKey={key}
              stackId="1"
              stroke={color}
              fill={color}
              fillOpacity={0.6}
              name={name}
              animationDuration={animationDuration}
              animationBegin={index * 100}
            />
          ))}
        </AreaChart>
      );
    }

    if (chartType === 'composed') {
      return (
        <ComposedChart {...commonProps}>
          <CartesianGrid {...gridProps} />
          <XAxis 
            dataKey="time" 
            tickFormatter={formatTime}
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            domain={yAxisDomain}
            tickFormatter={formatYAxis}
            tick={{ fontSize: 12 }}
          />
          <Tooltip {...tooltipProps} labelFormatter={formatTime} />
          {showLegend && <Legend />}
          {dataKeys.map(({ key, color, name, type = 'line' }, index) => {
            if (type === 'area') {
              return (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={key}
                  fill={color}
                  fillOpacity={0.3}
                  stroke={color}
                  name={name}
                  animationDuration={animationDuration}
                  animationBegin={index * 100}
                />
              );
            }
            if (type === 'bar') {
              return (
                <Bar
                  key={key}
                  dataKey={key}
                  fill={color}
                  name={name}
                  animationDuration={animationDuration}
                  animationBegin={index * 100}
                />
              );
            }
            if (type === 'scatter') {
              return (
                <Scatter
                  key={key}
                  dataKey={key}
                  fill={color}
                  name={name}
                />
              );
            }
            return (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={color}
                strokeWidth={2}
                activeDot={{ r: 6 }}
                name={name}
                animationDuration={animationDuration}
                animationBegin={index * 100}
              />
            );
          })}
        </ComposedChart>
      );
    }

    if (chartType === 'area') {
      return (
        <AreaChart {...commonProps}>
          <CartesianGrid {...gridProps} />
          <XAxis 
            dataKey="time" 
            tickFormatter={formatTime}
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            domain={yAxisDomain}
            tickFormatter={formatYAxis}
            tick={{ fontSize: 12 }}
          />
          <Tooltip {...tooltipProps} labelFormatter={formatTime} />
          {showLegend && <Legend />}
          {dataKeys.map(({ key, color, name }, index) => (
            <Area
              key={key}
              type="monotone"
              dataKey={key}
              stroke={color}
              fill={color}
              fillOpacity={0.3}
              name={name}
              animationDuration={animationDuration}
              animationBegin={index * 100}
            />
          ))}
        </AreaChart>
      );
    }

    if (chartType === 'bar') {
      return (
        <BarChart {...commonProps}>
          <CartesianGrid {...gridProps} />
          <XAxis 
            dataKey="time" 
            tickFormatter={formatTime}
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            domain={yAxisDomain}
            tickFormatter={formatYAxis}
            tick={{ fontSize: 12 }}
          />
          <Tooltip {...tooltipProps} labelFormatter={formatTime} />
          {showLegend && <Legend />}
          {dataKeys.map(({ key, color, name }, index) => (
            <Bar
              key={key}
              dataKey={key}
              fill={color}
              name={name}
              animationDuration={animationDuration}
              animationBegin={index * 100}
            />
          ))}
        </BarChart>
      );
    }

    // Default to line chart
    return (
      <LineChart {...commonProps}>
        <CartesianGrid {...gridProps} />
        <XAxis 
          dataKey="time" 
          tickFormatter={formatTime}
          tick={{ fontSize: 12 }}
        />
        <YAxis 
          domain={yAxisDomain}
          tickFormatter={formatYAxis}
          tick={{ fontSize: 12 }}
        />
        <Tooltip {...tooltipProps} labelFormatter={formatTime} />
        {showLegend && <Legend />}
        {dataKeys.map(({ key, color, name }, index) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            stroke={color}
            strokeWidth={2}
            activeDot={{ r: 6 }}
            name={name}
            animationDuration={animationDuration}
            animationBegin={index * 100}
          />
        ))}
      </LineChart>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className={cn("relative overflow-hidden", className)}>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {showRefreshInterval && (
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  <Select
                    value={refreshInterval.toString()}
                    onValueChange={handleRefreshIntervalChange}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {refreshIntervals.map((interval) => (
                        <SelectItem key={interval.value} value={interval.value.toString()}>
                          {interval.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {onRefresh && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onRefresh}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <motion.div 
            style={{ height }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <ResponsiveContainer width="100%" height="100%">
              {renderChart()}
            </ResponsiveContainer>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
