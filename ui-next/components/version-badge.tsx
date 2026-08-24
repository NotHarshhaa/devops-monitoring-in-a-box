'use client'

import { Badge } from '@/components/ui/badge'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  InformationCircleIcon,
  FlashIcon,
  PaintBoardIcon,
  SmartPhone01Icon,
  DashboardSpeed01Icon,
  Rocket01Icon
} from '@hugeicons/core-free-icons'
import { cn } from '@/lib/utils'

interface VersionBadgeProps {
  variant?: 'default' | 'compact' | 'detailed'
  className?: string
}

const VERSION = '2.5.0'
const RELEASE_DATE = 'February 2026'

const features = [
  { icon: PaintBoardIcon, label: 'Complete UI Overhaul' },
  { icon: FlashIcon, label: '50% Faster Performance' },
  { icon: SmartPhone01Icon, label: 'Enhanced Mobile Experience' },
  { icon: DashboardSpeed01Icon, label: 'Optimized Animations' }
]

export function VersionBadge({
  variant = 'default',
  className
}: VersionBadgeProps) {
  if (variant === 'compact') {
    return (
      <Badge variant="outline" className={cn('font-medium', className)}>
        <HugeiconsIcon icon={Rocket01Icon} className="mr-1 size-3" />
        v{VERSION}
      </Badge>
    )
  }

  if (variant === 'detailed') {
    return (
      <div className={cn('border border-border bg-card p-5', className)}>
        <div className="mb-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center border border-border bg-background">
              <HugeiconsIcon icon={Rocket01Icon} className="size-5" />
            </span>
            <div>
              <h3 className="text-base font-semibold">Version {VERSION}</h3>
              <p className="text-sm text-muted-foreground">Major UI Overhaul</p>
            </div>
          </div>
          <Badge variant="secondary">Latest</Badge>
        </div>

        <div className="mb-5 grid gap-3 sm:grid-cols-2">
          {features.map((feature) => (
            <div
              key={feature.label}
              className="flex items-center gap-3 border border-border bg-background p-3"
            >
              <span className="flex size-9 items-center justify-center border border-border">
                <HugeiconsIcon icon={feature.icon} className="size-4" />
              </span>
              <p className="text-sm font-medium">{feature.label}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Released {RELEASE_DATE}</span>
          <span>Major Release</span>
        </div>
      </div>
    )
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 border border-border bg-card px-3 py-1.5 text-sm font-medium',
        className
      )}
    >
      <HugeiconsIcon icon={Rocket01Icon} className="size-3.5" />
      v{VERSION}
    </span>
  )
}

export function VersionInfo() {
  const changelog = [
    {
      category: 'UI/UX',
      items: [
        'Redesigned pages with consistent dashboard layouts',
        'Monochrome sera theme across shell and panels',
        'Improved responsive layout and mobile navigation',
        'Better accessibility and keyboard navigation'
      ]
    },
    {
      category: 'Performance',
      items: [
        'Faster route and shell loading',
        'Reduced sidebar lag',
        'Better component memoization',
        'Leaner animation usage'
      ]
    },
    {
      category: 'Technical',
      items: [
        'Modern React patterns and component architecture',
        'Enhanced error handling and user feedback',
        'Optimized bundle size and loading performance',
        'Consistent dark mode and theme tokens'
      ]
    }
  ]

  return (
    <div className="space-y-6">
      <div className="space-y-3 text-center">
        <span className="mx-auto flex size-16 items-center justify-center border border-border bg-card">
          <HugeiconsIcon icon={Rocket01Icon} className="size-8" />
        </span>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Version {VERSION}
          </h1>
          <p className="text-muted-foreground">Major UI Overhaul Release</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Released {RELEASE_DATE}
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => (
          <div
            key={feature.label}
            className="border border-border bg-card p-5 text-center"
          >
            <span className="mx-auto mb-3 flex size-10 items-center justify-center border border-border bg-background">
              <HugeiconsIcon icon={feature.icon} className="size-5" />
            </span>
            <h3 className="text-sm font-semibold">{feature.label}</h3>
          </div>
        ))}
      </div>

      <div className="border border-border bg-card p-5">
        <h2 className="mb-5 flex items-center text-base font-semibold">
          <HugeiconsIcon icon={InformationCircleIcon} className="mr-2 size-4" />
          What&apos;s New
        </h2>
        <div className="space-y-5">
          {changelog.map((section) => (
            <div key={section.category}>
              <h3 className="mb-2 text-sm font-semibold">{section.category}</h3>
              <ul className="space-y-2">
                {section.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-foreground" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
