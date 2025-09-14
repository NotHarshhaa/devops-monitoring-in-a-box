"use client"

import React, { memo } from "react"
import { cn } from "@/lib/utils"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

const Skeleton = memo(({ className, ...props }: SkeletonProps) => (
  <div
    className={cn(
      "animate-pulse rounded-md bg-muted",
      className
    )}
    {...props}
  />
))

Skeleton.displayName = "Skeleton"

// Predefined skeleton components for common patterns
export const CardSkeleton = memo(() => (
  <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
    <div className="p-6">
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="mt-4 space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <Skeleton className="h-3 w-4/6" />
      </div>
    </div>
  </div>
))

CardSkeleton.displayName = "CardSkeleton"

export const MetricsCardSkeleton = memo(() => (
  <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
    <div className="p-4 sm:p-6">
      <div className="flex items-center space-x-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-6 w-16" />
        </div>
      </div>
      <div className="mt-3">
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  </div>
))

MetricsCardSkeleton.displayName = "MetricsCardSkeleton"

export const ChartSkeleton = memo(({ height = 200 }: { height?: number }) => (
  <div className="w-full" style={{ height }}>
    <Skeleton className="h-full w-full rounded-md" />
  </div>
))

ChartSkeleton.displayName = "ChartSkeleton"

export const TableSkeleton = memo(({ rows = 5 }: { rows?: number }) => (
  <div className="space-y-3">
    <div className="flex space-x-4">
      <Skeleton className="h-4 w-1/4" />
      <Skeleton className="h-4 w-1/4" />
      <Skeleton className="h-4 w-1/4" />
      <Skeleton className="h-4 w-1/4" />
    </div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex space-x-4">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
      </div>
    ))}
  </div>
))

TableSkeleton.displayName = "TableSkeleton"

export const ListSkeleton = memo(({ items = 3 }: { items?: number }) => (
  <div className="space-y-3">
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} className="flex items-center space-x-3">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    ))}
  </div>
))

ListSkeleton.displayName = "ListSkeleton"

export { Skeleton }
