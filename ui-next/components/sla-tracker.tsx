"use client"

import React from "react"
import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Activity01Icon,
  CheckmarkCircle01Icon,
  Alert02Icon,
  Clock01Icon,
  Analytics01Icon,
  ArrowUpRight01Icon
} from "@hugeicons/core-free-icons"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { prometheusAPI } from "@/lib/prometheus-api"

type ProbeStatus = "operational" | "degraded" | "outage";

interface ProbeSLA {
  instance: string;
  status: ProbeStatus;
  uptime24h: number | null;
  uptime7d: number | null;
  uptime30d: number | null;
  /** 30 daily buckets, oldest first; values are 0..1 uptime fractions */
  historyBars: number[];
}

interface ProbeWindowSeries {
  metric: Record<string, string>;
  value: [number, string];
}

interface ProbeRangeSeries {
  metric: Record<string, string>;
  values: Array<[number, string]>;
}

const REFRESH_MS = 60_000;

function instanceKey(metric: Record<string, string>): string {
  return metric.instance || metric.target || JSON.stringify(metric);
}

function parseWindow(result: ProbeWindowSeries[] | undefined): Map<string, number | null> {
  const map = new Map<string, number | null>();
  (result ?? []).forEach((series) => {
    const raw = series.value?.[1];
    map.set(instanceKey(series.metric), raw === undefined ? null : parseFloat(raw) * 100);
  });
  return map;
}

export function SLATracker() {
  // probe_success only exists for synthetic blackbox probes, so no job filter
  // is needed. Window uptimes are avg_over_time over the respective period.
  const currentQuery = useQuery<ProbeWindowSeries[]>({
    queryKey: ['sla-current'],
    queryFn: () => prometheusAPI.getInstantVector('probe_success'),
    refetchInterval: REFRESH_MS,
    staleTime: REFRESH_MS,
    retry: 0,
    refetchOnWindowFocus: false,
  });

  const uptime24hQuery = useQuery<ProbeWindowSeries[]>({
    queryKey: ['sla-uptime', '24h'],
    queryFn: () => prometheusAPI.getInstantVector('avg_over_time(probe_success[24h])'),
    refetchInterval: 5 * 60_000,
    staleTime: 5 * 60_000,
    retry: 0,
    refetchOnWindowFocus: false,
  });

  const uptime7dQuery = useQuery<ProbeWindowSeries[]>({
    queryKey: ['sla-uptime', '7d'],
    queryFn: () => prometheusAPI.getInstantVector('avg_over_time(probe_success[7d])'),
    refetchInterval: 5 * 60_000,
    staleTime: 5 * 60_000,
    retry: 0,
    refetchOnWindowFocus: false,
  });

  const uptime30dQuery = useQuery<ProbeWindowSeries[]>({
    queryKey: ['sla-uptime', '30d'],
    queryFn: () => prometheusAPI.getInstantVector('avg_over_time(probe_success[30d])'),
    refetchInterval: 5 * 60_000,
    staleTime: 5 * 60_000,
    retry: 0,
    refetchOnWindowFocus: false,
  });

  // One bar per day over the past 30 days
  const historyQuery = useQuery<ProbeRangeSeries[]>({
    queryKey: ['sla-history'],
    queryFn: () => {
      const end = Math.floor(Date.now() / 1000);
      const start = end - 30 * 24 * 3600;
      return prometheusAPI.getRangeMatrix('avg_over_time(probe_success[1d])', start, end, '86400');
    },
    refetchInterval: 30 * 60_000,
    staleTime: 30 * 60_000,
    retry: 0,
    refetchOnWindowFocus: false,
  });

  const isLoading =
    currentQuery.isLoading || uptime24hQuery.isLoading || uptime7dQuery.isLoading || uptime30dQuery.isLoading;
  const isError =
    currentQuery.isError || uptime24hQuery.isError || uptime7dQuery.isError || uptime30dQuery.isError;

  const services: ProbeSLA[] = (() => {
    const current = parseWindow(currentQuery.data);
    const up24 = parseWindow(uptime24hQuery.data);
    const up7 = parseWindow(uptime7dQuery.data);
    const up30 = parseWindow(uptime30dQuery.data);

    const historyByInstance = new Map<string, number[]>();
    (historyQuery.data ?? []).forEach((series) => {
      historyByInstance.set(
        instanceKey(series.metric),
        series.values.map(([, v]) => parseFloat(v))
      );
    });

    // Union of instances seen in any query, current status first
    const keys = new Set<string>([
      ...current.keys(),
      ...up24.keys(),
      ...up7.keys(),
      ...up30.keys(),
      ...historyByInstance.keys(),
    ]);

    return Array.from(keys).map((key) => {
      const now = current.get(key);
      const status: ProbeStatus =
        now == null ? 'degraded' : now >= 0.99 ? 'operational' : now > 0 ? 'degraded' : 'outage';
      return {
        instance: key,
        status,
        uptime24h: up24.get(key) ?? null,
        uptime7d: up7.get(key) ?? null,
        uptime30d: up30.get(key) ?? null,
        historyBars: historyByInstance.get(key) ?? [],
      };
    });
  })();

  const activeOutages = services.filter((s) => s.status === 'outage').length;
  const degraded = services.filter((s) => s.status === 'degraded').length;
  const reachableNow = services.filter((s) => (s.status === 'operational' ? 1 : 0)).length;

  const uptimeValues = services
    .map((s) => s.uptime30d)
    .filter((v): v is number => v != null);
  const overall30dUptime =
    uptimeValues.length > 0
      ? (uptimeValues.reduce((acc, v) => acc + v, 0) / uptimeValues.length).toFixed(3)
      : '--';

  const getStatusBadge = (status: ProbeStatus) => {
    switch (status) {
      case "operational":
        return (
          <Badge variant="outline" className="border-emerald-500 text-emerald-500 bg-emerald-500/10 gap-1">
            <HugeiconsIcon icon={CheckmarkCircle01Icon} className="size-3" />
            Operational
          </Badge>
        )
      case "degraded":
        return (
          <Badge variant="outline" className="border-amber-500 text-amber-500 bg-amber-500/10 gap-1">
            <HugeiconsIcon icon={Alert02Icon} className="size-3" />
            Degraded
          </Badge>
        )
      case "outage":
        return (
          <Badge variant="outline" className="border-destructive text-destructive bg-destructive/10 gap-1">
            <HugeiconsIcon icon={Alert02Icon} className="size-3" />
            Outage
          </Badge>
        )
    }
  }

  const getBarColor = (val: number) => {
    if (val >= 0.99) return "bg-emerald-500 hover:bg-emerald-400"
    if (val >= 0.8) return "bg-amber-500 hover:bg-amber-400"
    return "bg-destructive hover:bg-destructive/80"
  }

  const formatUptime = (value: number | null) => (value == null ? '--' : `${value.toFixed(2)}%`)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="border border-border bg-card">
              <CardContent className="p-4 sm:p-5">
                <Skeleton className="h-4 w-24 mb-3" />
                <Skeleton className="h-7 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="border border-border bg-card">
          <CardContent className="p-4 sm:p-6 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isError || services.length === 0) {
    return (
      <Card className="border border-border bg-card">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
            <HugeiconsIcon icon={Activity01Icon} className="size-5" />
            Service Uptime & Availability
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-1">
            Calculated from Blackbox Exporter probe_success data.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="text-center py-8 text-muted-foreground">
            <HugeiconsIcon icon={Alert02Icon} className="size-8 mx-auto mb-2" />
            <p className="text-sm">
              No probe data is available yet. Blackbox probes need to run for a while before
              uptime windows (24h/7d/30d) can be calculated.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* SLA Header & Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-border bg-card">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-muted-foreground block">Overall 30-Day Uptime</span>
                <span className="text-2xl font-bold text-foreground mt-1 block">{overall30dUptime}%</span>
              </div>
              <div className="p-2.5 bg-muted border border-border">
                <HugeiconsIcon icon={Analytics01Icon} className="size-5 text-foreground" />
              </div>
            </div>
            {uptimeValues.length > 0 && (
              <span className="text-xs text-muted-foreground flex items-center gap-1 mt-2">
                <HugeiconsIcon icon={ArrowUpRight01Icon} className="size-3" />
                Across {uptimeValues.length} probe{uptimeValues.length === 1 ? '' : 's'}
              </span>
            )}
          </CardContent>
        </Card>

        <Card className="border border-border bg-card">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-muted-foreground block">Probes Down Right Now</span>
                <span className="text-2xl font-bold text-foreground mt-1 block">
                  {activeOutages} of {services.length}
                </span>
              </div>
              <div className={`p-2.5 bg-muted border border-border ${activeOutages > 0 ? 'text-destructive' : 'text-emerald-500'}`}>
                <HugeiconsIcon icon={activeOutages > 0 ? Alert02Icon : CheckmarkCircle01Icon} className="size-5" />
              </div>
            </div>
            <span className="text-xs text-muted-foreground mt-2 block">
              {activeOutages > 0
                ? 'Active probe failures detected'
                : degraded > 0
                  ? `${degraded} probe${degraded === 1 ? '' : 's'} degraded`
                  : 'All probes operational'}
            </span>
          </CardContent>
        </Card>

        <Card className="border border-border bg-card">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-muted-foreground block">Reachable Now</span>
                <span className="text-2xl font-bold text-foreground mt-1 block">
                  {services.length > 0 ? Math.round((reachableNow / services.length) * 100) : 0}%
                </span>
              </div>
              <div className="p-2.5 bg-muted border border-border">
                <HugeiconsIcon icon={Clock01Icon} className="size-5 text-foreground" />
              </div>
            </div>
            <span className="text-xs text-muted-foreground mt-2 block">Latest probe_success values</span>
          </CardContent>
        </Card>

        <Card className="border border-border bg-card">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-muted-foreground block">Probes Monitored</span>
                <span className="text-2xl font-bold text-foreground mt-1 block">{services.length}</span>
              </div>
              <div className="p-2.5 bg-muted border border-border">
                <HugeiconsIcon icon={Activity01Icon} className="size-5 text-foreground" />
              </div>
            </div>
            <span className="text-xs text-muted-foreground mt-2 block">Synthetic blackbox targets</span>
          </CardContent>
        </Card>
      </div>

      {/* Service Uptime List */}
      <Card className="border border-border bg-card">
        <CardHeader className="p-4 sm:p-6 border-b border-border">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                <HugeiconsIcon icon={Activity01Icon} className="size-5" />
                Probe Uptime & Availability Heatmap (Past 30 Days)
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-1">
                Calculated live from Blackbox Exporter probe_success series in Prometheus.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="size-2 bg-emerald-500 inline-block" /> 100% Up
              </span>
              <span className="flex items-center gap-1">
                <span className="size-2 bg-amber-500 inline-block" /> Degraded
              </span>
              <span className="flex items-center gap-1">
                <span className="size-2 bg-destructive inline-block" /> Outage
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 space-y-6">
          {services.map((service, idx) => (
            <motion.div
              key={service.instance}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: Math.min(idx * 0.05, 0.3) }}
              className="space-y-2 border-b border-border pb-5 last:border-0 last:pb-0"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-semibold text-sm text-foreground truncate">{service.instance}</span>
                  {getStatusBadge(service.status)}
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <div>
                    <span className="text-muted-foreground mr-1">24h:</span>
                    <span className="font-bold text-foreground">{formatUptime(service.uptime24h)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground mr-1">7d:</span>
                    <span className="font-bold text-foreground">{formatUptime(service.uptime7d)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground mr-1">30d:</span>
                    <span className="font-bold text-foreground">{formatUptime(service.uptime30d)}</span>
                  </div>
                </div>
              </div>

              {/* 30-day timeline bars */}
              {service.historyBars.length > 0 ? (
                <div className="flex items-center gap-1 pt-1">
                  {service.historyBars.map((bar, bIdx) => (
                    <div
                      key={bIdx}
                      title={`Day ${service.historyBars.length - bIdx}: ${(bar * 100).toFixed(1)}% uptime`}
                      className={`h-6 flex-1 transition-all ${getBarColor(bar)} cursor-pointer`}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground pt-1">
                  Not enough history yet for a daily heatmap.
                </p>
              )}
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
