"use client"

import React from "react"
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
  Heart
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Services', href: '/services', icon: Server },
  { name: 'Metrics', href: '/metrics', icon: BarChart3 },
  { name: 'Logs', href: '/logs', icon: FileText },
  { name: 'Alerts', href: '/alerts', icon: Bell },
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

export function Sidebar() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [isDesktop, setIsDesktop] = React.useState(false)
  const pathname = usePathname()

  // Check if we're on desktop
  React.useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 1024)
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

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          id="menu-button"
          variant="outline"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close menu" : "Open menu"}
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
          "w-[280px] bg-background/95 backdrop-blur-sm border-r border-border/50 overflow-hidden",
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
          width: '280px'
        }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border/50">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-md bg-primary">
                <Activity className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold">DevOps Monitor</h1>
                <p className="text-sm text-muted-foreground">Monitoring in a Box</p>
              </div>
            </div>
            <div className="hidden lg:block">
              <ThemeToggle />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "relative flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  <span className="truncate">{item.name}</span>
                  {isActive && (
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
              )
            })}
          </nav>

          {/* Service Status */}
          <div className="p-4 border-t border-border/50">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
              Service Status
            </h3>
            <div className="space-y-2">
              {serviceStatus.map((service) => (
                <div key={service.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 min-w-0">
                    <service.icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm truncate">{service.name}</span>
                  </div>
                  <div className="flex items-center space-x-1 flex-shrink-0">
                    <span className={cn(
                      "relative flex h-2 w-2 rounded-full",
                      service.status === 'healthy' ? "bg-green-500" : "bg-red-500"
                    )}>
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
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border/50 text-center">
            <p className="text-xs text-muted-foreground flex items-center justify-center">
              Built with <Heart className="h-3 w-3 mx-1 text-red-500" /> by Harshhaa
            </p>
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
}
