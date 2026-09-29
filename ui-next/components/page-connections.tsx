'use client'

import Link from 'next/link'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowRight01Icon } from '@hugeicons/core-free-icons'
import { cn } from '@/lib/utils'

export interface PageConnection {
  href: string
  label: string
  /** Hugeicons icon component, e.g. Analytics01Icon */
  icon: any
}

/**
 * Consistent cross-page navigation row. Every page declares the pages most
 * related to it, so users can hop between Metrics, Logs, Alerts, Services
 * and Settings without going back through the sidebar.
 */
export function PageConnections({
  links,
  className
}: {
  links: PageConnection[]
  className?: string
}) {
  if (!links || links.length === 0) return null

  return (
    <nav
      aria-label="Related pages"
      className={cn('flex flex-wrap items-center gap-2', className)}
    >
      <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        Go to
      </span>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="group flex items-center gap-1.5 border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <HugeiconsIcon icon={link.icon} className="size-3.5 shrink-0" />
          <span>{link.label}</span>
          <HugeiconsIcon
            icon={ArrowRight01Icon}
            className="size-3 opacity-0 transition-opacity group-hover:opacity-100"
          />
        </Link>
      ))}
    </nav>
  )
}
