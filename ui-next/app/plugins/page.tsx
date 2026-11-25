"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  PuzzleIcon,
  Settings01Icon,
  Activity01Icon,
  Download01Icon,
  RefreshIcon,
  PlugIcon,
  DashboardSquare01Icon
} from "@hugeicons/core-free-icons"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import PluginManagerComponent, { type PluginManagerStats } from '@/components/plugin-manager'
import { PageConnections } from '@/components/page-connections'
import { toast } from '@/hooks/use-toast'

export default function PluginsPage() {
  const [stats, setStats] = useState<PluginManagerStats>({
    available: 0,
    installed: 0,
    enabled: 0,
    categories: 0,
  })
  const [refreshSignal, setRefreshSignal] = useState(0)

  const handleRefresh = () => {
    setRefreshSignal((prev) => prev + 1)
    toast({
      title: 'Plugins refreshed',
      description: 'Reloaded registered plugin catalog and installed instances.',
    })
  }
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="px-2 sm:px-4 py-3 sm:py-6 max-w-7xl mx-auto space-y-3 sm:space-y-6">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border border-border bg-card overflow-hidden">
            <CardHeader className="text-foreground p-4 sm:p-8">
              <div className="flex items-center justify-between">
                <div className="space-y-2 sm:space-y-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-2 sm:p-3 bg-card border border-border">
                      <HugeiconsIcon icon={PuzzleIcon} className="h-5 w-5 sm:h-7 sm:w-7 text-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-xl sm:text-3xl lg:text-4xl font-bold">
                        Plugin Manager
                      </CardTitle>
                      <CardDescription className="mt-1 sm:mt-2 text-muted-foreground text-sm sm:text-base">
                        Manage and configure monitoring plugins
                      </CardDescription>
                    </div>
                  </div>
                </div>
                <div className="hidden sm:block">
                  <Badge className="bg-card text-foreground border-border px-3 py-1.5 font-semibold text-sm">
                    <HugeiconsIcon icon={Activity01Icon} className="h-3 w-3 mr-1" />
                    Plugin System
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="text-center p-3 sm:p-4 border border-border"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-muted border border-border flex items-center justify-center mx-auto mb-2">
                    <HugeiconsIcon icon={PlugIcon} className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-foreground">
                    {stats.available}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Available</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="text-center p-3 sm:p-4 border border-border"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-muted border border-border flex items-center justify-center mx-auto mb-2">
                    <HugeiconsIcon icon={Download01Icon} className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-foreground">
                    {stats.installed}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Installed</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                  className="text-center p-3 sm:p-4 border border-border"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-muted border border-border flex items-center justify-center mx-auto mb-2">
                    <HugeiconsIcon icon={Activity01Icon} className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-foreground">
                    {stats.enabled}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Active</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                  className="text-center p-3 sm:p-4 border border-border"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-muted border border-border flex items-center justify-center mx-auto mb-2">
                    <HugeiconsIcon icon={Settings01Icon} className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-foreground">
                    {stats.categories}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Categories</div>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Cross-page navigation */}
        <PageConnections
          links={[
            { href: '/dashboard', label: 'Dashboard', icon: DashboardSquare01Icon },
            { href: '/settings', label: 'Settings', icon: Settings01Icon },
          ]}
        />

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4"
        >
          <div className="flex flex-wrap items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              className="gap-1.5 h-9 sm:h-10 bg-card border-border hover:bg-muted"
            >
              <HugeiconsIcon icon={RefreshIcon} className="h-4 w-4" />
              <span className="hidden sm:inline">Refresh Catalog</span>
              <span className="sm:hidden">Sync</span>
            </Button>
          </div>

          <Badge className="px-2.5 py-0.5 border border-border bg-muted text-foreground">
            <HugeiconsIcon icon={Activity01Icon} className="h-3 w-3 mr-1" />
            {stats.installed > 0 ? `${stats.enabled}/${stats.installed} Active` : 'Registry Ready'}
          </Badge>
        </motion.div>

        {/* Plugin Manager Component */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="border border-border bg-card">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl text-foreground">
                <div className="p-2">
                  <HugeiconsIcon icon={Settings01Icon} className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
                </div>
                Plugin Configuration
              </CardTitle>
              <CardDescription className="mt-1 text-sm text-muted-foreground">
                Install, configure, and manage monitoring plugins
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <PluginManagerComponent
                showHeader={false}
                onStatsChange={setStats}
                refreshSignal={refreshSignal}
              />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
