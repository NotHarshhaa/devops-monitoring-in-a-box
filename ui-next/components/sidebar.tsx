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
  Layout,
  Plug,
  AlertCircle,
  CheckCircle
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserMenu } from "@/components/user-menu"
import { VersionBadge } from "@/components/version-badge"

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home, color: 'from-blue-500 to-indigo-600' },
  { name: 'Templates', href: '/templates', icon: Layout, color: 'from-purple-500 to-pink-600' },
  { name: 'Services', href: '/services', icon: Server, color: 'from-green-500 to-emerald-600' },
  { name: 'Metrics', href: '/metrics', icon: BarChart3, color: 'from-orange-500 to-red-600' },
  { name: 'Logs', href: '/logs', icon: FileText, color: 'from-indigo-500 to-blue-600' },
  { name: 'Alerts', href: '/alerts', icon: Bell, color: 'from-red-500 to-pink-600' },
  { name: 'Plugins', href: '/plugins', icon: Plug, color: 'from-yellow-500 to-orange-600' },
  { name: 'Settings', href: '/settings', icon: Settings, color: 'from-gray-500 to-slate-600' },
]

const serviceStatus = [
  { name: 'Prometheus', status: 'healthy', icon: Database, color: 'from-orange-500 to-red-600' },
  { name: 'Grafana', status: 'healthy', icon: BarChart3, color: 'from-blue-500 to-indigo-600' },
  { name: 'Loki', status: 'healthy', icon: FileText, color: 'from-indigo-500 to-blue-600' },
  { name: 'Node Exporter', status: 'healthy', icon: Monitor, color: 'from-green-500 to-emerald-600' },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case 'healthy':
      return 'text-green-500 bg-green-100 dark:bg-green-900/20';
    case 'warning':
      return 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/20';
    case 'error':
      return 'text-red-500 bg-red-100 dark:bg-red-900/20';
    default:
      return 'text-gray-500 bg-gray-100 dark:bg-gray-900/20';
  }
}

// Modern navigation item matching page styles - optimized for performance
const NavigationItem = memo(({ item, isActive, isCollapsed }: { 
  item: typeof navigation[0], 
  isActive: boolean, 
  isCollapsed: boolean 
}) => (
  <Link
    href={item.href}
    className={cn(
      "group relative block transition-all duration-200",
      isCollapsed ? "mx-2 mb-3" : "mb-3"
    )}
    title={isCollapsed ? item.name : undefined}
    aria-current={isActive ? "page" : undefined}
  >
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl transition-all duration-200",
        isActive
          ? "shadow-lg shadow-blue-500/20 dark:shadow-blue-400/25"
          : "shadow-md hover:shadow-lg"
      )}
    >
      {/* Background with gradient */}
      <div className={cn(
        "relative p-4 rounded-2xl transition-all duration-200",
        isActive
          ? `bg-gradient-to-r ${item.color} text-white`
          : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
      )}>
        {/* Active state gradient overlay */}
        {isActive && (
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent" />
        )}
        
        {/* Content */}
        <div className={cn(
          "relative flex items-center",
          isCollapsed ? "justify-center" : "justify-between"
        )}>
          {/* Icon with gradient background */}
          <div className={cn(
            "flex items-center justify-center transition-all duration-200",
            isActive
              ? "w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl"
              : "w-10 h-10 bg-gray-100 dark:bg-gray-700 group-hover:bg-gray-200 dark:group-hover:bg-gray-600 rounded-xl"
          )}>
            <item.icon className={cn(
              "h-5 w-5 transition-colors duration-200",
              isActive
                ? "text-white"
                : "text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white"
            )} />
          </div>
          
          {/* Text content */}
          {!isCollapsed && (
            <div className="flex-1 ml-4">
              <h3 className={cn(
                "font-semibold transition-colors duration-200",
                isActive
                  ? "text-white"
                  : "text-gray-900 dark:text-white"
              )}>
                {item.name}
              </h3>
              {isActive && (
                <div className="h-0.5 bg-white/30 rounded-full mt-1" />
              )}
            </div>
          )}
          
          {/* Decorative element */}
          {!isActive && (
            <div className={cn(
              "absolute top-2 right-2 w-2 h-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gradient-to-r",
              item.color
            )} />
          )}
        </div>
      </div>
    </div>
  </Link>
))

NavigationItem.displayName = "NavigationItem"

// Modern service status item - optimized for performance
const ServiceStatusItem = memo(({ service, isCollapsed }: { 
  service: typeof serviceStatus[0], 
  isCollapsed: boolean 
}) => (
  <div className={cn(
    "relative overflow-hidden rounded-2xl transition-all duration-200",
    isCollapsed ? "mx-2 mb-3" : "mb-3"
  )}>
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 shadow-md hover:shadow-lg transition-all duration-200">
      <div className={cn(
        "flex items-center",
        isCollapsed ? "justify-center" : "justify-between"
      )}>
        <div className="flex items-center space-x-3">
          <div className={cn(
            "w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-white",
            service.color
          )}>
            <service.icon className="h-5 w-5" />
          </div>
          {!isCollapsed && (
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {service.name}
              </p>
              <div className="flex items-center space-x-1 mt-1">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  getStatusColor(service.status).split(' ')[0]
                )} />
                <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {service.status}
                </span>
              </div>
            </div>
          )}
        </div>
        
        {!isCollapsed && (
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center",
            getStatusColor(service.status)
          )}>
            {service.status === 'healthy' ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
          </div>
        )}
      </div>
    </div>
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
      {/* Modern Mobile Menu Button - optimized */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          id="menu-button"
          variant="outline"
          size="icon"
          onClick={toggleSidebar}
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
          className="h-12 w-12 rounded-2xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border-gray-200/50 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={isOpen ? "close" : "menu"}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {isOpen ? <X size={20} className="text-gray-700 dark:text-gray-300" /> : <Menu size={20} className="text-gray-700 dark:text-gray-300" />}
            </motion.div>
          </AnimatePresence>
        </Button>
      </div>

      {/* Modern Sidebar with Page-Style Design - optimized */}
      <motion.div
        id="sidebar"
        className={cn(
          "fixed lg:relative top-0 left-0 h-screen bg-gradient-to-b from-gray-50/95 to-white/95 dark:from-gray-900/95 dark:to-gray-800/95 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-700 overflow-hidden transition-all duration-300 ease-out z-40",
          isDesktop ? "shadow-lg" : "shadow-xl"
        )}
        initial={{ x: isDesktop ? 0 : -320 }}
        animate={{ 
          x: isDesktop ? 0 : (isOpen ? 0 : -320)
        }}
        transition={{ 
          type: "tween",
          duration: 0.3,
          ease: "easeOut"
        }}
        style={{ 
          width: isDesktop ? (isCollapsed ? 80 : 320) : 320,
          minWidth: isDesktop ? (isCollapsed ? 80 : 320) : 320,
          maxWidth: isDesktop ? (isCollapsed ? 80 : 320) : 320
        }}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex flex-col h-full">
          {/* Enhanced Header matching page styles - optimized */}
          <div className={cn(
            "relative overflow-hidden border-b border-gray-200/50 dark:border-gray-700",
            isCollapsed ? "p-4" : "p-6"
          )}>
            {/* Gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-purple-500/10 dark:from-blue-500/5 dark:via-indigo-500/3 dark:to-purple-500/5" />
            
            <div className="relative z-10">
              {isCollapsed ? (
                <button
                  onClick={expandSidebar}
                  className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
                >
                  <Activity className="h-7 w-7" />
                </button>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg flex items-center justify-center">
                      <Activity className="h-7 w-7" />
                    </div>
                    <div>
                      <h1 className="text-xl font-bold text-gray-900 dark:text-white">DevOps Monitor</h1>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Infrastructure Dashboard</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {isDesktop && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleCollapse}
                        className="h-10 w-10 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                        aria-label="Collapse sidebar"
                      >
                        <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      </Button>
                    )}
                    <ThemeToggle />
                    <UserMenu />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Navigation with modern spacing - optimized for scroll */}
          <div className={cn(
            "flex-1 overflow-y-auto py-6",
            isCollapsed ? "px-2" : "px-4"
          )}>
            <div className="space-y-2">
              {navigationItems}
            </div>
          </div>

          {/* Enhanced Service Status Section - optimized */}
          <div className={cn(
            "border-t border-gray-200/50 dark:border-gray-700 bg-gradient-to-b from-gray-50/50 to-blue-50/30 dark:from-gray-800/50 dark:to-blue-900/20",
            isCollapsed ? "p-4" : "p-6"
          )}>
            {!isCollapsed && (
              <div className="mb-4">
                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center">
                  <div className="w-2 h-2 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full mr-2 shadow-lg shadow-green-500/25"></div>
                  Service Status
                </h3>
              </div>
            )}
            <div className="space-y-2">
              {serviceStatusItems}
            </div>
          </div>

          {/* Enhanced Footer - optimized with version */}
          <div className={cn(
            "border-t border-gray-200/50 dark:border-gray-700 bg-gradient-to-b from-blue-50/30 to-gray-50/50 dark:from-blue-900/20 dark:to-gray-800/50 p-6 text-center",
            isCollapsed ? "p-4" : ""
          )}>
            {!isCollapsed ? (
              <div className="space-y-4">
                <VersionBadge variant="compact" className="mx-auto" />
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <span>Built with</span>
                  <Heart className="h-4 w-4 text-red-500 animate-pulse" />
                  <span>by Harshhaa</span>
                </div>
              </div>
            ) : (
              <div className="flex justify-center space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-100 to-pink-100 dark:from-red-900/30 dark:to-pink-900/30 flex items-center justify-center">
                  <Heart className="h-5 w-5 text-red-500 animate-pulse" />
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Overlay for mobile - optimized */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
})

Sidebar.displayName = "Sidebar"
