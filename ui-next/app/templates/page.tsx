"use client"

import { motion } from "framer-motion"
import { HugeiconsIcon } from "@hugeicons/react"
import { DashboardTemplateManager } from "@/components/dashboard-template-manager"
import { type DashboardTemplate } from "@/lib/dashboard-templates"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  DashboardSpeed01Icon, 
  SparklesIcon, 
  Download01Icon,
  ArrowRight01Icon,
  FlashIcon,
  PaintBoardIcon,
  Layers01Icon
} from "@hugeicons/core-free-icons"

export default function TemplatesPage() {
  const handleTemplateSelect = (template: DashboardTemplate) => {
    console.log("Selected template:", template)
  }

  const handleTemplateCreate = (template: DashboardTemplate) => {
    console.log("Creating dashboard from template:", template)
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
                      <HugeiconsIcon icon={DashboardSpeed01Icon} className="h-5 w-5 sm:h-7 sm:w-7 text-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-xl sm:text-3xl lg:text-4xl font-bold">
                        Dashboard Templates
                      </CardTitle>
                      <CardDescription className="mt-1 sm:mt-2 text-muted-foreground text-sm sm:text-base">
                        Browse, create, and manage stunning dashboard templates
                      </CardDescription>
                    </div>
                  </div>
                </div>
                <div className="hidden sm:block">
                  <Badge className="bg-card text-foreground border-border px-3 py-1.5 font-semibold text-sm">
                    <HugeiconsIcon icon={SparklesIcon} className="h-3 w-3 mr-1" />
                    Pro Templates
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
                    <HugeiconsIcon icon={DashboardSpeed01Icon} className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-foreground">50+</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Templates</div>
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
                  <div className="text-lg sm:text-xl font-bold text-foreground">10k+</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Downloads</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                  className="text-center p-3 sm:p-4 border border-border"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-muted border border-border flex items-center justify-center mx-auto mb-2">
                    <HugeiconsIcon icon={FlashIcon} className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-foreground">Instant</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Setup</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                  className="text-center p-3 sm:p-4 border border-border"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-muted border border-border flex items-center justify-center mx-auto mb-2">
                    <HugeiconsIcon icon={PaintBoardIcon} className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-foreground">Custom</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Designs</div>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4"
        >
          <Card className="border border-border bg-card transition-all duration-300 group cursor-pointer">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 group-hover:scale-110 transition-transform duration-300">
                  <HugeiconsIcon icon={Download01Icon} className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground text-sm sm:text-base">Browse Templates</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">Explore marketplace</p>
                </div>
                <HugeiconsIcon icon={ArrowRight01Icon} className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground transition-colors" />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border bg-card transition-all duration-300 group cursor-pointer">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 group-hover:scale-110 transition-transform duration-300">
                  <HugeiconsIcon icon={Layers01Icon} className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground text-sm sm:text-base">My Templates</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">Manage collection</p>
                </div>
                <HugeiconsIcon icon={ArrowRight01Icon} className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground transition-colors" />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border bg-card transition-all duration-300 group cursor-pointer">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 group-hover:scale-110 transition-transform duration-300">
                  <HugeiconsIcon icon={SparklesIcon} className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground text-sm sm:text-base">Create New</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">Build custom</p>
                </div>
                <HugeiconsIcon icon={ArrowRight01Icon} className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground transition-colors" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Template Manager */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <DashboardTemplateManager
            onTemplateSelect={handleTemplateSelect}
            onTemplateCreate={handleTemplateCreate}
          />
        </motion.div>
      </div>
    </div>
  )
}
