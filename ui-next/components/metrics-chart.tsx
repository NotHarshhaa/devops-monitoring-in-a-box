import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertCircle, Loader2 } from "lucide-react";
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
} from "recharts";
import { cn } from "@/lib/utils";

interface MetricsChartProps {
  title: string;
  description: string;
  data: Array<{ time: number; [key: string]: number }>;
  dataKeys: Array<{ key: string; color: string; name: string }>;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  onRefresh?: () => void;
  className?: string;
  chartType?: 'line' | 'area' | 'bar';
  height?: number;
  showLegend?: boolean;
  yAxisDomain?: [number, number];
  formatYAxis?: (value: number) => string;
  formatTooltip?: (value: number, name: string) => [string, string];
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
  className,
  chartType = 'line',
  height = 300,
  showLegend = true,
  yAxisDomain,
  formatYAxis,
  formatTooltip,
}: MetricsChartProps) {
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
      <Card className={cn("relative overflow-hidden", className)}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
            {onRefresh && (
              <Button variant="outline" size="sm" onClick={onRefresh} disabled>
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center" style={{ height }}>
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className={cn("relative overflow-hidden border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950", className)}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
            {onRefresh && (
              <Button variant="outline" size="sm" onClick={onRefresh}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center gap-2 text-red-600 dark:text-red-400" style={{ height }}>
            <AlertCircle className="h-6 w-6" />
            <span>{errorMessage}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className={cn("relative overflow-hidden", className)}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
            {onRefresh && (
              <Button variant="outline" size="sm" onClick={onRefresh}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center text-muted-foreground" style={{ height }}>
            No data available
          </div>
        </CardContent>
      </Card>
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
      },
      formatter: formatTooltipValue,
    };

    const gridProps = {
      strokeDasharray: "3 3",
      strokeOpacity: 0.2,
    };

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
          {dataKeys.map(({ key, color, name }) => (
            <Area
              key={key}
              type="monotone"
              dataKey={key}
              stackId="1"
              stroke={color}
              fill={color}
              fillOpacity={0.3}
              name={name}
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
          {dataKeys.map(({ key, color, name }) => (
            <Bar
              key={key}
              dataKey={key}
              fill={color}
              name={name}
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
        {dataKeys.map(({ key, color, name }) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            stroke={color}
            strokeWidth={2}
            activeDot={{ r: 6 }}
            name={name}
          />
        ))}
      </LineChart>
    );
  };

  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          {onRefresh && (
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
