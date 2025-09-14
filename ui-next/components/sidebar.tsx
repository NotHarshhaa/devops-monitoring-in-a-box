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
      "group relative flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 hover:scale-[1.02]",
      isActive
        ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-200 shadow-md shadow-blue-500/10 dark:shadow-blue-400/20 border border-blue-200 dark:border-blue-700"
        : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white hover:shadow-sm",
      isCollapsed && "justify-center"
    )}
    title={isCollapsed ? item.name : undefined}
    aria-current={isActive ? "page" : undefined}
  >
    <div className={cn(
      "flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200",
      isActive 
        ? "bg-blue-500 dark:bg-blue-600 shadow-lg shadow-blue-500/25 dark:shadow-blue-400/30" 
        : "bg-gray-100 dark:bg-gray-700 group-hover:bg-blue-100 dark:group-hover:bg-blue-800"
    )}>
      <item.icon className={cn(
        "h-4 w-4 flex-shrink-0 transition-colors duration-200",
        isActive 
          ? "text-white" 
          : "text-gray-600 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400",
        !isCollapsed && "mr-0"
      )} />
    </div>
    <AnimatePresence>
      {!isCollapsed && (
        <motion.span
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: "auto" }}
          exit={{ opacity: 0, width: 0 }}
          transition={{ duration: 0.2 }}
          className="truncate overflow-hidden ml-3"
        >
          {item.name}
        </motion.span>
      )}
    </AnimatePresence>
    {isActive && !isCollapsed && (
      <motion.div
        className="absolute left-0 w-1 h-10 bg-blue-500 dark:bg-blue-400 rounded-r-full shadow-lg shadow-blue-500/25 dark:shadow-blue-400/20"
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
    "group flex items-center p-3 rounded-xl transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800 hover:scale-[1.02]",
    isCollapsed ? "justify-center" : "justify-between"
  )}>
    <div className="flex items-center space-x-3 min-w-0">
      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 group-hover:bg-blue-100 dark:group-hover:bg-blue-800 transition-colors duration-200">
        <service.icon className="h-4 w-4 text-gray-600 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 flex-shrink-0 transition-colors duration-200" aria-hidden="true" />
      </div>
      <AnimatePresence>
        {!isCollapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2 }}
            className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate overflow-hidden"
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
          className="flex items-center space-x-2 flex-shrink-0 overflow-hidden"
        >
          <div className="flex items-center space-x-2">
            <span 
              className={cn(
                "relative flex h-3 w-3 rounded-full shadow-lg",
                service.status === 'healthy' ? "bg-green-500 shadow-green-500/25" : "bg-red-500 shadow-red-500/25"
              )}
              aria-label={`${service.name} status: ${service.status}`}
            >
              {service.status === 'healthy' && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              )}
            </span>
            <span className={cn(
              "text-xs font-medium px-2 py-1 rounded-full",
              service.status === 'healthy' 
                ? "text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/30" 
                : "text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/30"
            )}>
              {service.status === 'healthy' ? 'Healthy' : 'Error'}
            </span>
          </div>
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
      <div className={cn(
        "lg:hidden fixed z-50 transition-all duration-300",
        isOpen ? "top-4 right-4" : "top-4 left-4"
      )}>
        <Button
          id="menu-button"
          variant="outline"
          size="icon"
          onClick={toggleSidebar}
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
          className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-gray-200/50 dark:border-gray-700 shadow-lg shadow-gray-900/10 dark:shadow-black/30 hover:scale-105 transition-all duration-200 h-10 w-10"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={isOpen ? "close" : "menu"}
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 90 }}
              transition={{ duration: 0.2 }}
            >
              {isOpen ? <X size={22} className="text-gray-700 dark:text-gray-300" /> : <Menu size={22} className="text-gray-700 dark:text-gray-300" />}
            </motion.div>
          </AnimatePresence>
        </Button>
      </div>

      {/* Sidebar */}
      <motion.div
        id="sidebar"
        className={cn(
          "bg-white/95 dark:bg-gray-900 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-700 overflow-hidden transition-all duration-300 ease-in-out shadow-2xl shadow-gray-900/5 dark:shadow-black/30",
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
            "flex items-center border-b border-gray-200/60 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800",
            isCollapsed ? "justify-center p-4" : "justify-between p-6"
          )}>
            {isCollapsed ? (
              <div className="flex items-center justify-center">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={expandSidebar}
                  className="h-12 w-12 p-0 group hover:scale-105 transition-transform duration-200"
                  aria-label="Expand sidebar"
                >
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500 dark:bg-blue-600 shadow-lg shadow-blue-500/25 dark:shadow-blue-400/30 group-hover:shadow-xl group-hover:shadow-blue-500/30 dark:group-hover:shadow-blue-400/40 transition-all duration-200">
                    <Activity className="h-6 w-6 text-white" />
                  </div>
                </Button>
              </div>
            ) : (
              <>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500 dark:bg-blue-600 shadow-lg shadow-blue-500/25 dark:shadow-blue-400/30">
                    <Activity className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-gray-900 dark:text-white">DevOps Monitor</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Monitoring in a Box</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {isDesktop && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleCollapse}
                  className="h-9 w-9 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                  aria-label="Collapse sidebar"
                >
                      <ChevronLeft className="h-4 w-4 text-gray-600 dark:text-gray-300" />
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
            "border-t border-gray-200/60 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-800",
            isCollapsed ? "p-2" : "p-4"
          )}>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.h3
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center"
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
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
            "border-t border-gray-200/60 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-800 text-center",
            isCollapsed ? "p-2" : "p-4"
          )}>
            <AnimatePresence>
              {!isCollapsed ? (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-xs text-gray-600 dark:text-gray-400 flex items-center justify-center font-medium"
                >
                  Built with <Heart className="h-3 w-3 mx-1 text-red-500 animate-pulse" /> by 
                  <span className="ml-1 font-bold text-blue-600 dark:text-blue-400">Harshhaa</span>
                </motion.p>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex justify-center"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30">
                    <Heart className="h-4 w-4 text-red-500 animate-pulse" />
                  </div>
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
