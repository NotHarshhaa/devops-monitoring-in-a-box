'use client'

import React, { memo, useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  DashboardSquare01Icon,
  Layout01Icon,
  CloudServerIcon,
  Analytics01Icon,
  File01Icon,
  Notification01Icon,
  Settings01Icon,
  Cancel01Icon,
  Activity01Icon,
  DatabaseIcon,
  ComputerIcon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Plug01Icon
} from '@hugeicons/core-free-icons'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { VersionBadge } from '@/components/version-badge'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: DashboardSquare01Icon },
  { name: 'Templates', href: '/templates', icon: Layout01Icon },
  { name: 'Services', href: '/services', icon: CloudServerIcon },
  { name: 'Metrics', href: '/metrics', icon: Analytics01Icon },
  { name: 'Logs', href: '/logs', icon: File01Icon },
  { name: 'Alerts', href: '/alerts', icon: Notification01Icon },
  { name: 'Plugins', href: '/plugins', icon: Plug01Icon },
  { name: 'Settings', href: '/settings', icon: Settings01Icon }
]

const serviceStatus = [
  { name: 'Prometheus', status: 'healthy', icon: DatabaseIcon },
  { name: 'Grafana', status: 'healthy', icon: Analytics01Icon },
  { name: 'Loki', status: 'healthy', icon: File01Icon },
  { name: 'Node Exporter', status: 'healthy', icon: ComputerIcon }
]

const NavigationItem = memo(function NavigationItem({
  item,
  isActive,
  isCollapsed,
  onNavigate
}: {
  item: (typeof navigation)[0]
  isActive: boolean
  isCollapsed: boolean
  onNavigate?: () => void
}) {
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      title={isCollapsed ? item.name : undefined}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 text-sm transition-colors',
        isCollapsed && 'justify-center px-2',
        isActive
          ? 'border-r-2 border-foreground bg-muted text-foreground'
          : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
      )}
    >
      <HugeiconsIcon icon={item.icon} className="size-4 shrink-0" />
      {!isCollapsed && <span className="font-medium">{item.name}</span>}
    </Link>
  )
})

const ServiceStatusItem = memo(function ServiceStatusItem({
  service,
  isCollapsed
}: {
  service: (typeof serviceStatus)[0]
  isCollapsed: boolean
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-2.5 px-3 py-2',
        isCollapsed && 'justify-center px-2'
      )}
      title={isCollapsed ? `${service.name}: ${service.status}` : undefined}
    >
      <span className="size-1.5 shrink-0 rounded-full bg-foreground" />
      <HugeiconsIcon icon={service.icon} className="size-3.5 shrink-0 text-muted-foreground" />
      {!isCollapsed && (
        <>
          <span className="flex-1 truncate text-xs">{service.name}</span>
          <span className="font-mono text-[10px] text-muted-foreground uppercase">
            ok
          </span>
        </>
      )}
    </div>
  )
})

type SidebarProps = {
  mobileOpen?: boolean
  onMobileOpenChange?: (open: boolean) => void
}

export const Sidebar = memo(function Sidebar({
  mobileOpen = false,
  onMobileOpenChange
}: SidebarProps) {
  const [isDesktop, setIsDesktop] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const checkScreenSize = () => {
      const desktop = window.innerWidth >= 1024
      setIsDesktop(desktop)
      if (!desktop) setIsCollapsed(false)
    }
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  useEffect(() => {
    if (!isDesktop) onMobileOpenChange?.(false)
  }, [pathname, isDesktop, onMobileOpenChange])

  const closeMobile = useCallback(() => {
    onMobileOpenChange?.(false)
  }, [onMobileOpenChange])

  const navigationItems = useMemo(
    () =>
      navigation.map((item) => (
        <NavigationItem
          key={item.name}
          item={item}
          isActive={pathname === item.href || pathname.startsWith(`${item.href}/`)}
          isCollapsed={isCollapsed}
          onNavigate={closeMobile}
        />
      )),
    [pathname, isCollapsed, closeMobile]
  )

  const serviceStatusItems = useMemo(
    () =>
      serviceStatus.map((service) => (
        <ServiceStatusItem
          key={service.name}
          service={service}
          isCollapsed={isCollapsed}
        />
      )),
    [isCollapsed]
  )

  const width = isDesktop ? (isCollapsed ? 72 : 256) : 256
  const isOpen = isDesktop || mobileOpen

  return (
    <>
      <aside
        className={cn(
          'fixed top-0 left-0 z-40 flex h-screen flex-col border-r border-border bg-card transition-transform duration-200 lg:relative lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        style={{ width, minWidth: width, maxWidth: width }}
        role="navigation"
        aria-label="Dashboard navigation"
      >
        <div className="flex h-14 items-center justify-between gap-2 border-b border-border px-3">
          {isCollapsed ? (
            <button
              type="button"
              onClick={() => setIsCollapsed(false)}
              className="mx-auto flex size-9 items-center justify-center border border-border hover:bg-muted"
              aria-label="Expand sidebar"
            >
              <HugeiconsIcon icon={Activity01Icon} className="size-4" />
            </button>
          ) : (
            <>
              <Link href="/dashboard" className="flex min-w-0 items-center gap-2.5">
                <span className="flex size-8 shrink-0 items-center justify-center border border-border bg-background">
                  <HugeiconsIcon icon={Activity01Icon} className="size-3.5" />
                </span>
                <span className="truncate text-sm font-semibold">Monitor</span>
              </Link>
              <div className="flex items-center gap-1">
                {isDesktop && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsCollapsed(true)}
                    aria-label="Collapse sidebar"
                  >
                    <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
                  </Button>
                )}
                {!isDesktop && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={closeMobile}
                    aria-label="Close navigation"
                  >
                    <HugeiconsIcon icon={Cancel01Icon} className="size-4" />
                  </Button>
                )}
              </div>
            </>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto py-2">
          <p
            className={cn(
              'px-3 pb-2 text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase',
              isCollapsed && 'text-center'
            )}
          >
            {isCollapsed ? 'Nav' : 'Menu'}
          </p>
          <div className="space-y-0.5">{navigationItems}</div>
        </nav>

        <div className="border-t border-border py-2">
          {!isCollapsed && (
            <p className="px-3 pb-1 text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
              Stack
            </p>
          )}
          {serviceStatusItems}
        </div>

        <div className="border-t border-border px-3 py-3">
          {!isCollapsed ? (
            <VersionBadge variant="compact" />
          ) : (
            <button
              type="button"
              onClick={() => setIsCollapsed(false)}
              className="mx-auto flex size-8 items-center justify-center text-muted-foreground hover:text-foreground"
              aria-label="Expand sidebar"
            >
              <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" />
            </button>
          )}
        </div>
      </aside>

      {mobileOpen && !isDesktop && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          aria-label="Close navigation overlay"
          onClick={closeMobile}
        />
      )}
    </>
  )
})
