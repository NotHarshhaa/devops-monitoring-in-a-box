"use client"

import React, { memo, useCallback, useMemo } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Home,
  Server,
  BarChart3,
  FileText,
  Bell,
  Settings,
  Menu,
  X,
  Activity,
  Database,
  Monitor,
  Heart,
  ChevronLeft,
  ChevronRight,
  Layout,
  Plug
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserMenu } from "@/components/user-menu"

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Templates', href: '/templates', icon: Layout },
  { name: 'Services', href: '/services', icon: Server },
  { name: 'Metrics', href: '/metrics', icon: BarChart3 },
  { name: 'Logs', href: '/logs', icon: FileText },
  { name: 'Alerts', href: '/alerts', icon: Bell },
  { name: 'Plugins', href: '/plugins', icon: Plug },
  { name: 'Settings', href: '/settings', icon: Settings },
]

const serviceStatus = [
  { name: 'Prometheus', status: 'healthy', icon: Database },
  { name: 'Grafana', status: 'healthy', icon: BarChart3 },
  { name: 'Loki', status: 'healthy', icon: FileText },
  { name: 'Node Exporter', status: 'healthy', icon: Monitor },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case 'healthy':
      return 'text-green-500';
    case 'warning':
      return 'text-yellow-500';
    case 'error':
      return 'text-red-500';
    default:
      return 'text-gray-500';
  }
}

// Memoized navigation item component for better performance
const NavigationItem = memo(({ item, isActive, isCollapsed }: { 
  item: typeof navigation[0], 
  isActive: boolean, 
  isCollapsed: boolean 
}) => (
  <Link
    href={item.href}
    className={cn(
      "relative flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
      isActive
        ? "bg-primary/10 text-primary"
        : "text-muted-foreground hover:bg-muted hover:text-foreground",
      isCollapsed && "justify-center"
    )}
    title={isCollapsed ? item.name : undefined}
    aria-current={isActive ? "page" : undefined}
  >
    <item.icon className={cn("h-5 w-5 flex-shrink-0", !isCollapsed && "mr-3")} />
    <AnimatePresence>
      {!isCollapsed && (
        <motion.span
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: "auto" }}
          exit={{ opacity: 0, width: 0 }}
          transition={{ duration: 0.2 }}
          className="truncate overflow-hidden"
        >
          {item.name}
        </motion.span>
      )}
    </AnimatePresence>
    {isActive && !isCollapsed && (
      <motion.div
        className="absolute left-0 w-1 h-8 bg-primary rounded-r-full"
        layoutId="activeNav"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 350,
          damping: 30
        }}
      />
    )}
  </Link>
))

NavigationItem.displayName = "NavigationItem"

// Memoized service status item component
const ServiceStatusItem = memo(({ service, isCollapsed }: { 
  service: typeof serviceStatus[0], 
  isCollapsed: boolean 
}) => (
  <div className={cn(
    "flex items-center",
    isCollapsed ? "justify-center" : "justify-between"
  )}>
    <div className="flex items-center space-x-2 min-w-0">
      <service.icon className="h-4 w-4 text-muted-foreground flex-shrink-0" aria-hidden="true" />
      <AnimatePresence>
        {!isCollapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2 }}
            className="text-sm truncate overflow-hidden"
          >
            {service.name}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
    <AnimatePresence>
      {!isCollapsed && (
        <motion.div
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: "auto" }}
          exit={{ opacity: 0, width: 0 }}
          transition={{ duration: 0.2 }}
          className="flex items-center space-x-1 flex-shrink-0 overflow-hidden"
        >
          <span 
            className={cn(
              "relative flex h-2 w-2 rounded-full",
              service.status === 'healthy' ? "bg-green-500" : "bg-red-500"
            )}
            aria-label={`${service.name} status: ${service.status}`}
          >
            {service.status === 'healthy' && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-50" />
            )}
          </span>
          <span className={cn(
            "text-xs",
            getStatusColor(service.status)
          )}>
            {service.status === 'healthy' ? 'Healthy' : 'Error'}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
))

ServiceStatusItem.displayName = "ServiceStatusItem"

export const Sidebar = memo(() => {
  const [isOpen, setIsOpen] = React.useState(false)
  const [isDesktop, setIsDesktop] = React.useState(false)
  const [isCollapsed, setIsCollapsed] = React.useState(false)
  const pathname = usePathname()

  // Check if we're on desktop
  React.useEffect(() => {
    const checkScreenSize = () => {
      const desktop = window.innerWidth >= 1024
      setIsDesktop(desktop)
      // Auto-expand sidebar when switching to mobile
      if (!desktop) {
        setIsCollapsed(false)
      }
    }
    
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  // Close sidebar when route changes on mobile
  React.useEffect(() => {
    if (!isDesktop) {
      setIsOpen(false)
    }
  }, [pathname, isDesktop])

  // Close sidebar when clicking outside on mobile
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && !isDesktop) {
        const sidebar = document.getElementById('sidebar')
        const menuButton = document.getElementById('menu-button')
        if (sidebar && !sidebar.contains(event.target as Node) && 
            menuButton && !menuButton.contains(event.target as Node)) {
          setIsOpen(false)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, isDesktop])

  // Optimized callbacks
  const toggleSidebar = useCallback(() => {
    setIsOpen(!isOpen)
  }, [isOpen])

  const toggleCollapse = useCallback(() => {
    setIsCollapsed(!isCollapsed)
  }, [isCollapsed])

  const expandSidebar = useCallback(() => {
    setIsCollapsed(false)
  }, [])

  // Memoized navigation items
  const navigationItems = useMemo(() => 
    navigation.map((item) => (
      <NavigationItem
        key={item.name}
        item={item}
        isActive={pathname === item.href}
        isCollapsed={isCollapsed}
      />
    )), [pathname, isCollapsed]
  )

  // Memoized service status items
  const serviceStatusItems = useMemo(() =>
    serviceStatus.map((service) => (
      <ServiceStatusItem
        key={service.name}
        service={service}
        isCollapsed={isCollapsed}
      />
    )), [isCollapsed]
  )

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          id="menu-button"
          variant="outline"
          size="icon"
          onClick={toggleSidebar}
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
          className="bg-background/80 backdrop-blur-sm border-border/50"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={isOpen ? "close" : "menu"}
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 90 }}
              transition={{ duration: 0.2 }}
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </motion.div>
          </AnimatePresence>
        </Button>
      </div>

      {/* Sidebar */}
      <motion.div
        id="sidebar"
        className={cn(
          "bg-background/95 backdrop-blur-sm border-r border-border/50 overflow-hidden transition-all duration-300 ease-in-out",
          isDesktop 
            ? "relative z-auto" 
            : "fixed inset-y-0 left-0 z-40"
        )}
        initial={{ x: isDesktop ? 0 : -280 }}
        animate={{ 
          x: isDesktop ? 0 : (isOpen ? 0 : -280)
        }}
        transition={{ 
          type: "spring",
          stiffness: 300,
          damping: 30
        }}
        style={{ 
          width: isDesktop ? (isCollapsed ? 80 : 280) : 280,
          minWidth: isDesktop ? (isCollapsed ? 80 : 280) : 280,
          maxWidth: isDesktop ? (isCollapsed ? 80 : 280) : 280
        }}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className={cn(
            "flex items-center border-b border-border/50",
            isCollapsed ? "justify-center p-4" : "justify-between p-6"
          )}>
            {isCollapsed ? (
              <div className="flex items-center justify-center">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={expandSidebar}
                  className="h-10 w-10 p-0"
                  aria-label="Expand sidebar"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-md bg-primary">
                    <Activity className="h-6 w-6 text-primary-foreground" />
                  </div>
                </Button>
              </div>
            ) : (
              <>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-md bg-primary">
                    <Activity className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold">DevOps Monitor</h1>
                    <p className="text-sm text-muted-foreground">Monitoring in a Box</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  {isDesktop && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleCollapse}
                  className="h-8 w-8"
                  aria-label="Collapse sidebar"
                >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                  )}
                  <ThemeToggle />
                  <UserMenu />
                </div>
              </>
            )}
          </div>

          {/* Navigation */}
          <nav className={cn(
            "flex-1 space-y-1 overflow-y-auto",
            isCollapsed ? "p-2" : "p-4"
          )}>
            {navigationItems}
          </nav>

          {/* Service Status */}
          <div className={cn(
            "border-t border-border/50",
            isCollapsed ? "p-2" : "p-4"
          )}>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.h3
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3"
                >
                  Service Status
                </motion.h3>
              )}
            </AnimatePresence>
            <div className="space-y-2">
              {serviceStatusItems}
            </div>
          </div>

          {/* Footer */}
          <div className={cn(
            "border-t border-border/50 text-center",
            isCollapsed ? "p-2" : "p-4"
          )}>
            <AnimatePresence>
              {!isCollapsed ? (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-xs text-muted-foreground flex items-center justify-center"
                >
                  Built with <Heart className="h-3 w-3 mx-1 text-red-500" /> by Harshhaa
                </motion.p>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex justify-center"
                >
                  <Heart className="h-4 w-4 text-red-500" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Overlay for mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
})

Sidebar.displayName = "Sidebar"
