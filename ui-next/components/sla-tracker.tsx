"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Activity01Icon,
  CheckmarkCircle01Icon,
  Alert02Icon,
  Clock01Icon,
  Analytics01Icon,
  Shield01Icon,
  Download01Icon,
  ArrowUpRight01Icon
} from "@hugeicons/core-free-icons"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"

interface SLAServiceTarget {
  name: string;
  targetUptime: number; // e.g. 99.9%
  uptime24h: number;
  uptime7d: number;
  uptime30d: number;
  status: "operational" | "degraded" | "outage";
  mttrMinutes: number;
  outagesCount: number;
  historyBars: number[]; // 30 daily buckets (1 = 100%, 0.8 = degraded, 0 = down)
}

const DEFAULT_SLA_TARGETS: SLAServiceTarget[] = [
  {
    name: "Prometheus Metrics Engine",
    targetUptime: 99.95,
    uptime24h: 100.0,
    uptime7d: 99.98,
    uptime30d: 99.95,
    status: "operational",
    mttrMinutes: 2.1,
    outagesCount: 0,
    historyBars: Array(30).fill(1)
  },
  {
    name: "Grafana Visualization",
    targetUptime: 99.9,
    uptime24h: 100.0,
    uptime7d: 99.95,
    uptime30d: 99.92,
    status: "operational",
    mttrMinutes: 3.5,
    outagesCount: 1,
    historyBars: [...Array(24).fill(1), 0.95, ...Array(5).fill(1)]
  },
  {
    name: "Loki Log Aggregator",
    targetUptime: 99.9,
    uptime24h: 100.0,
    uptime7d: 99.99,
    uptime30d: 99.94,
    status: "operational",
    mttrMinutes: 1.8,
    outagesCount: 0,
    historyBars: Array(30).fill(1)
  },
  {
    name: "Alertmanager Dispatcher",
    targetUptime: 99.99,
    uptime24h: 100.0,
    uptime7d: 100.0,
    uptime30d: 99.99,
    status: "operational",
    mttrMinutes: 0.5,
    outagesCount: 0,
    historyBars: Array(30).fill(1)
  },
  {
    name: "DevOps Monitoring UI",
    targetUptime: 99.9,
    uptime24h: 100.0,
    uptime7d: 99.96,
    uptime30d: 99.91,
    status: "operational",
    mttrMinutes: 4.2,
    outagesCount: 1,
    historyBars: [...Array(18).fill(1), 0.9, ...Array(11).fill(1)]
  }
]

export function SLATracker() {
  const [services] = useState<SLAServiceTarget[]>(DEFAULT_SLA_TARGETS)

  const overall30dUptime = (
    services.reduce((acc, s) => acc + s.uptime30d, 0) / services.length
  ).toFixed(3)

  const getStatusBadge = (status: SLAServiceTarget["status"]) => {
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
            Degraded Performance
          </Badge>
        )
      case "outage":
        return (
          <Badge variant="outline" className="border-destructive text-destructive bg-destructive/10 gap-1">
            <HugeiconsIcon icon={Alert02Icon} className="size-3" />
            Active Outage
          </Badge>
        )
    }
  }

  const getBarColor = (val: number) => {
    if (val >= 0.99) return "bg-emerald-500 hover:bg-emerald-400"
    if (val >= 0.8) return "bg-amber-500 hover:bg-amber-400"
    return "bg-destructive hover:bg-destructive/80"
  }

  return (
    <div className="space-y-6">
      {/* SLA Header & Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-border bg-card">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-muted-foreground block">Overall 30-Day SLA</span>
                <span className="text-2xl font-bold text-foreground mt-1 block">{overall30dUptime}%</span>
              </div>
              <div className="p-2.5 bg-muted border border-border">
                <HugeiconsIcon icon={Analytics01Icon} className="size-5 text-foreground" />
              </div>
            </div>
            <span className="text-xs text-emerald-500 flex items-center gap-1 mt-2">
              <HugeiconsIcon icon={ArrowUpRight01Icon} className="size-3" />
              Exceeding 99.9% commitment
            </span>
          </CardContent>
        </Card>

        <Card className="border border-border bg-card">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-muted-foreground block">Active Outages</span>
                <span className="text-2xl font-bold text-foreground mt-1 block">0 Services</span>
              </div>
              <div className="p-2.5 bg-muted border border-border">
                <HugeiconsIcon icon={CheckmarkCircle01Icon} className="size-5 text-emerald-500" />
              </div>
            </div>
            <span className="text-xs text-muted-foreground mt-2 block">All systems operational</span>
          </CardContent>
        </Card>

        <Card className="border border-border bg-card">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-muted-foreground block">Mean Time to Recovery (MTTR)</span>
                <span className="text-2xl font-bold text-foreground mt-1 block">2.4 mins</span>
              </div>
              <div className="p-2.5 bg-muted border border-border">
                <HugeiconsIcon icon={Clock01Icon} className="size-5 text-foreground" />
              </div>
            </div>
            <span className="text-xs text-muted-foreground mt-2 block">Rolling 30-day average</span>
          </CardContent>
        </Card>

        <Card className="border border-border bg-card">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-muted-foreground block">Uptime Commitment Tier</span>
                <span className="text-2xl font-bold text-foreground mt-1 block">Tier-1 Enterprise</span>
              </div>
              <div className="p-2.5 bg-muted border border-border">
                <HugeiconsIcon icon={Shield01Icon} className="size-5 text-foreground" />
              </div>
            </div>
            <span className="text-xs text-muted-foreground mt-2 block">99.95% Target SLA</span>
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
                Service Uptime & Availability Heatmap (Past 30 Days)
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-1">
                Monitored via Blackbox Exporter synthetic probes with automatic SLO tracking.
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
              key={service.name}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: idx * 0.05 }}
              className="space-y-2 border-b border-border pb-5 last:border-0 last:pb-0"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-foreground">{service.name}</span>
                  {getStatusBadge(service.status)}
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <div>
                    <span className="text-muted-foreground mr-1">24h:</span>
                    <span className="font-bold text-foreground">{service.uptime24h}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground mr-1">7d:</span>
                    <span className="font-bold text-foreground">{service.uptime7d}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground mr-1">30d:</span>
                    <span className="font-bold text-foreground">{service.uptime30d}%</span>
                  </div>
                </div>
              </div>

              {/* 30-day timeline bars */}
              <div className="flex items-center gap-1 pt-1">
                {service.historyBars.map((bar, bIdx) => (
                  <div
                    key={bIdx}
                    title={`Day ${30 - bIdx}: ${(bar * 100).toFixed(1)}% uptime`}
                    className={`h-6 flex-1 transition-all ${getBarColor(bar)} cursor-pointer`}
                  />
                ))}
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>30 days ago</span>
                <span>Today</span>
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
