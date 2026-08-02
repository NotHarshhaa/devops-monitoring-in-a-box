'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Activity, Menu } from 'lucide-react'
import { useState } from 'react'
import { ThemeToggle } from '@/components/theme-toggle'
import { UserMenu } from '@/components/user-menu'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const Sidebar = dynamic(
  () => import('@/components/sidebar').then((m) => m.Sidebar),
  {
    ssr: false,
    loading: () => (
      <aside className="hidden h-full w-64 shrink-0 border-r border-border bg-card lg:block" />
    )
  }
)

const titles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/templates': 'Templates',
  '/services': 'Services',
  '/metrics': 'Metrics',
  '/logs': 'Logs',
  '/alerts': 'Alerts',
  '/plugins': 'Plugins',
  '/settings': 'Settings',
  '/profile': 'Profile',
  '/admin': 'Admin',
  '/version': 'Version'
}

function isPublicPath(pathname: string) {
  return (
    pathname === '/' ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/api')
  )
}

function PublicHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center border border-border bg-background">
            <Activity className="size-4" />
          </span>
          <span className="text-sm font-semibold tracking-wide">
            Monitoring in a Box
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="outline" size="sm" asChild>
            <Link href="/auth/signin">Sign In</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}

function DashboardHeader({
  title,
  onOpenSidebar
}: {
  title: string
  onOpenSidebar: () => void
}) {
  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border bg-card/95 px-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          className="lg:hidden"
          onClick={onOpenSidebar}
          aria-label="Open navigation"
        >
          <Menu className="size-4" />
        </Button>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold tracking-wide">{title}</p>
          <p className="hidden text-[11px] text-muted-foreground sm:block">
            Infrastructure monitoring
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const showDashboard = !isPublicPath(pathname)
  const [mobileOpen, setMobileOpen] = useState(false)
  const title =
    titles[pathname] ||
    titles[Object.keys(titles).find((key) => pathname.startsWith(key)) || ''] ||
    'Monitoring'

  if (!showDashboard) {
    return (
      <div className="relative z-10 bg-background">
        <PublicHeader />
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
          {children}
        </main>
      </div>
    )
  }

  return (
    <div className="relative z-10 flex h-screen overflow-hidden bg-background">
      <Sidebar
        mobileOpen={mobileOpen}
        onMobileOpenChange={setMobileOpen}
      />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <DashboardHeader
          title={title}
          onOpenSidebar={() => setMobileOpen(true)}
        />
        <main
          className={cn(
            'main-content min-w-0 flex-1 overflow-x-hidden overflow-y-auto',
            'bg-muted/20 p-4 sm:p-6 lg:p-8'
          )}
        >
          <div className="mx-auto max-w-[1600px]">{children}</div>
        </main>
      </div>
    </div>
  )
}
