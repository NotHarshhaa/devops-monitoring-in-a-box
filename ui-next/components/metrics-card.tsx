import React, { memo, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricsCardProps {
  title: string;
  description: string;
  value: number | string;
  unit?: string;
  percentage?: number;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  className?: string;
  icon?: React.ReactNode;
  color?: 'default' | 'success' | 'warning' | 'danger';
}

export const MetricsCard = memo(({
  title,
  description,
  value,
  unit = '',
  percentage,
  trend,
  trendValue,
  isLoading = false,
  isError = false,
  errorMessage = 'Failed to load metric',
  className,
  icon,
  color = 'default'
}: MetricsCardProps) => {
  // Memoized color classes for better performance
  const colorClasses = useMemo(() => {
    switch (color) {
      case 'success':
        return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950';
      case 'danger':
        return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950';
      default:
        return '';
    }
  }, [color]);

  // Memoized progress color
  const progressColor = useMemo(() => {
    if (percentage === undefined) return 'bg-blue-500';
    if (percentage < 50) return 'bg-green-500';
    if (percentage < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  }, [percentage]);

  // Memoized value formatting
  const formatValue = useCallback((val: number | string) => {
    if (typeof val === 'number') {
      if (val >= 1000) {
        return (val / 1000).toFixed(1) + 'k';
      }
      return val.toFixed(1);
    }
    return val;
  }, []);

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card className={cn("relative overflow-hidden", className)}>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              {icon && <div className="text-muted-foreground">{icon}</div>}
              <CardTitle className="text-base sm:text-lg">{title}</CardTitle>
            </div>
            <CardDescription className="text-sm">{description}</CardDescription>
          </CardHeader>
          <CardContent>
            <motion.div 
              className="flex items-center justify-center h-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (isError) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card className={cn("relative overflow-hidden border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950", className)}>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              {icon && <div className="text-muted-foreground">{icon}</div>}
              <CardTitle className="text-base sm:text-lg">{title}</CardTitle>
            </div>
            <CardDescription className="text-sm">{description}</CardDescription>
          </CardHeader>
          <CardContent>
            <motion.div 
              className="flex items-center gap-2 text-red-600 dark:text-red-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{errorMessage}</span>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
        <Card className={cn("relative overflow-hidden transition-all duration-200 hover:shadow-md", colorClasses, className)}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {icon && <div className="text-muted-foreground flex-shrink-0">{icon}</div>}
              <CardTitle className="text-base sm:text-lg truncate">{title}</CardTitle>
            </div>
            {trend && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Badge 
                  variant="secondary" 
                  className={cn(
                    "gap-1 text-xs sm:text-sm",
                    trend === 'up' && "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900",
                    trend === 'down' && "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900"
                  )}
                >
                  {trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  <span className="hidden sm:inline">{trendValue}</span>
                </Badge>
              </motion.div>
            )}
          </div>
          <CardDescription className="text-sm">{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <motion.div 
              className="flex items-baseline gap-1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span className="text-2xl sm:text-3xl font-bold">{formatValue(value)}</span>
              {unit && <span className="text-base sm:text-lg text-muted-foreground">{unit}</span>}
            </motion.div>
            
            {percentage !== undefined && (
              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Usage</span>
                  <span className="font-medium">{percentage.toFixed(1)}%</span>
                </div>
                <Progress 
                  value={percentage} 
                  className="h-2" 
                />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>0%</span>
                  <span>100%</span>
                </div>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});

MetricsCard.displayName = "MetricsCard";
