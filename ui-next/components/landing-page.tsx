'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  ComputerIcon,
  Analytics01Icon,
  File01Icon,
  Notification01Icon,
  Shield01Icon,
  ArrowUpRight01Icon,
  Activity01Icon
} from '@hugeicons/core-free-icons'

const features = [
  {
    title: 'Real-time Metrics',
    description:
      'Live system performance with Prometheus-backed dashboards.',
    icon: Analytics01Icon
  },
  {
    title: 'Centralized Logs',
    description: 'Search and correlate logs from Loki across services.',
    icon: File01Icon
  },
  {
    title: 'Smart Alerts',
    description: 'Route incidents fast with Alertmanager integrations.',
    icon: Notification01Icon
  }
]

const roles = [
  { title: 'Admin', description: 'Full platform control' },
  { title: 'Editor', description: 'Configure & operate' },
  { title: 'Viewer', description: 'Read-only observability' }
]

export function LandingPage() {
  return (
    <div className="space-y-8">
      <section className="border border-border bg-card p-6 sm:p-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-5">
            <p className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
              Monitoring platform
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl md:text-5xl">
              Observe infrastructure, services, and alerts in one dashboard.
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              Monitoring in a Box brings Prometheus, Grafana, Loki, and
              Alertmanager together with a multi-tenant control plane for
              DevOps and SRE teams.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button asChild>
                <Link href="/auth/signin">Open Dashboard</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/auth/signup">Create Account</Link>
              </Button>
            </div>
          </div>
          <div className="grid w-full max-w-sm grid-cols-2 gap-3">
            {[
              { label: 'Metrics', value: 'Live' },
              { label: 'Logs', value: 'Central' },
              { label: 'Alerts', value: 'Routed' },
              { label: 'Access', value: 'RBAC' }
            ].map((item) => (
              <div
                key={item.label}
                className="border border-border bg-background px-4 py-5"
              >
                <p className="text-[11px] tracking-wide text-muted-foreground uppercase">
                  {item.label}
                </p>
                <p className="mt-1 text-lg font-semibold">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border border-border bg-card">
        <div className="border-b border-border px-4 py-3 sm:px-6">
          <p className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
            Capabilities
          </p>
        </div>
        <ul>
          {features.map((feature, index) => (
            <li
              key={feature.title}
              className={
                index < features.length - 1 ? 'border-b border-border' : undefined
              }
            >
              <div className="flex items-start gap-4 px-4 py-5 sm:px-6">
                <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center border border-border bg-background">
                  <HugeiconsIcon icon={feature.icon} className="size-4" />
                </span>
                <div>
                  <h2 className="text-sm font-semibold sm:text-base">
                    {feature.title}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="grid gap-4 md:grid-cols-[1.2fr_1fr]">
        <div className="border border-border bg-card">
          <div className="flex items-center gap-2 border-b border-border px-4 py-3 sm:px-6">
            <HugeiconsIcon icon={Shield01Icon} className="size-3.5 text-muted-foreground" />
            <p className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
              Access control
            </p>
          </div>
          <ul>
            {roles.map((role, index) => (
              <li
                key={role.title}
                className={
                  index < roles.length - 1 ? 'border-b border-border' : undefined
                }
              >
                <div className="flex items-center justify-between px-4 py-4 sm:px-6">
                  <div>
                    <p className="text-sm font-medium">{role.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {role.description}
                    </p>
                  </div>
                  <HugeiconsIcon icon={ComputerIcon} className="size-3.5 text-muted-foreground/50" />
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col justify-between border border-border bg-card p-5 sm:p-6">
          <div className="space-y-3">
            <HugeiconsIcon icon={Activity01Icon} className="size-5" />
            <h2 className="text-lg font-semibold">Ready to operate</h2>
            <p className="text-sm text-muted-foreground">
              Sign in to manage services, inspect metrics, and respond to
              alerts from one control plane.
            </p>
          </div>
          <Button className="mt-6 w-full" asChild>
            <Link href="/auth/signin">
              Go to console
              <HugeiconsIcon icon={ArrowUpRight01Icon} className="size-3.5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
