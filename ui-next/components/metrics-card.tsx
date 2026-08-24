import React, { memo, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  ArrowUpRight01Icon,
  ArrowDownRight01Icon,
  AlertCircleIcon,
  Loading03Icon
} from '@hugeicons/core-free-icons'
import { cn } from '@/lib/utils'

interface MetricsCardProps {
  title: string
  description: string
  value: number | string
  unit?: string
  percentage?: number
  trend?: 'up' | 'down' | 'stable'
  trendValue?: string
  isLoading?: boolean
  isError?: boolean
  errorMessage?: string
  className?: string
  icon?: React.ReactNode
  color?: 'default' | 'success' | 'warning' | 'danger'
}

export const MetricsCard = memo(function MetricsCard({
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
  icon
}: MetricsCardProps) {
  const formatValue = useCallback((val: number | string) => {
    if (typeof val === 'number') {
      if (val >= 1000) return (val / 1000).toFixed(1) + 'k'
      return val.toFixed(1)
    }
    return val
  }, [])

  if (isLoading) {
    return (
      <Card className={cn('border-border bg-card', className)}>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            {icon && <div className="text-muted-foreground">{icon}</div>}
            <CardTitle className="text-base sm:text-lg">{title}</CardTitle>
          </div>
          <CardDescription className="text-sm">{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-16 items-center justify-center">
            <HugeiconsIcon icon={Loading03Icon} className="size-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isError) {
    return (
      <Card className={cn('border-border bg-card', className)}>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            {icon && <div className="text-muted-foreground">{icon}</div>}
            <CardTitle className="text-base sm:text-lg">{title}</CardTitle>
          </div>
          <CardDescription className="text-sm">{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-muted-foreground">
            <HugeiconsIcon icon={AlertCircleIcon} className="size-4" />
            <span className="text-sm">{errorMessage}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('border-border bg-card', className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            {icon && (
              <div className="shrink-0 text-muted-foreground">{icon}</div>
            )}
            <CardTitle className="truncate text-base sm:text-lg">{title}</CardTitle>
          </div>
          {trend && (
            <Badge variant="outline" className="gap-1 text-xs">
              {trend === 'up' ? (
                <HugeiconsIcon icon={ArrowUpRight01Icon} className="size-3" />
              ) : (
                <HugeiconsIcon icon={ArrowDownRight01Icon} className="size-3" />
              )}
              <span className="hidden sm:inline">{trendValue}</span>
            </Badge>
          )}
        </div>
        <CardDescription className="text-sm">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {formatValue(value)}
            </span>
            {unit && (
              <span className="text-base text-muted-foreground sm:text-lg">
                {unit}
              </span>
            )}
          </div>

          {percentage !== undefined && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Usage</span>
                <span className="font-medium">{percentage.toFixed(1)}%</span>
              </div>
              <Progress value={percentage} className="h-2" />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>0%</span>
                <span>100%</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
})
