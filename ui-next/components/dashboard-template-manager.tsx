"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { HugeiconsIcon } from "@hugeicons/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { 
  PlusSignIcon, 
  Download01Icon, 
  Settings01Icon, 
  Delete02Icon, 
  Edit02Icon,
  EyeIcon,
  Share01Icon,
  Copy01Icon,
  CheckmarkCircle01Icon,
  DashboardSpeed01Icon,
  SparklesIcon,
  Layers01Icon,
  CodeSquareIcon,
  StarIcon,
  Clock01Icon,
  UserGroupIcon,
  ArrowRight01Icon
} from "@hugeicons/core-free-icons"
import { DashboardTemplateMarketplace } from "./dashboard-template-marketplace"
import { TemplateImportService, type GitHubImportResult } from "@/lib/template-import-service"
import { type DashboardTemplate } from "@/lib/dashboard-templates"
import { toast } from "@/hooks/use-toast"

interface DashboardTemplateManagerProps {
  onTemplateSelect: (template: DashboardTemplate) => void
  onTemplateCreate: (template: DashboardTemplate) => void
}

export function DashboardTemplateManager({ onTemplateSelect, onTemplateCreate }: DashboardTemplateManagerProps) {
  const [activeTab, setActiveTab] = useState("marketplace")
  const [importedTemplates, setImportedTemplates] = useState<DashboardTemplate[]>([])
  const [copiedTemplateId, setCopiedTemplateId] = useState<string | null>(null)

  const handleImportTemplate = (template: DashboardTemplate) => {
    setImportedTemplates(prev => [...prev, template])
    onTemplateCreate(template)
    
    toast({
      title: "Template Imported",
      description: `${template.name} has been imported and dashboard created!`,
    })
  }

  const handleGitHubImport = async (url: string) => {
    try {
      const result: GitHubImportResult = await TemplateImportService.importFromGitHub(url)
      
      if (result.success && result.template) {
        handleImportTemplate(result.template)
      } else {
        toast({
          title: "Import Failed",
          description: result.error || "Failed to import template from GitHub",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Import Error",
        description: "An error occurred while importing the template",
        variant: "destructive"
      })
    }
  }

  const handleDeleteTemplate = (templateId: string) => {
    setImportedTemplates(prev => prev.filter(t => t.id !== templateId))
    toast({
      title: "Template Deleted",
      description: "Template has been removed from your collection",
    })
  }

  const handleCopyTemplate = async (template: DashboardTemplate) => {
    try {
      const jsonString = TemplateImportService.exportTemplate(template)
      await navigator.clipboard.writeText(jsonString)
      setCopiedTemplateId(template.id)
      
      setTimeout(() => setCopiedTemplateId(null), 2000)
      
      toast({
        title: "Template Copied",
        description: "Template JSON has been copied to clipboard",
      })
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy template to clipboard",
        variant: "destructive"
      })
    }
  }

  const handleShareTemplate = (template: DashboardTemplate) => {
    toast({
      title: "Share Feature",
      description: "Template sharing feature coming soon!",
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border border-border bg-card overflow-hidden">
        <CardHeader className="text-foreground p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 sm:p-3 bg-card border border-border">
                <HugeiconsIcon icon={DashboardSpeed01Icon} className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
              </div>
              <div>
                <CardTitle className="text-lg sm:text-xl font-bold">Template Manager</CardTitle>
                <CardDescription className="text-muted-foreground text-xs sm:text-sm mt-1">
                  Create, import, and manage dashboard templates
                </CardDescription>
              </div>
            </div>
            <Button 
              onClick={() => setActiveTab("marketplace")}
              className="gap-2 bg-card hover:bg-muted text-foreground border border-border text-xs sm:text-sm"
            >
              <HugeiconsIcon icon={PlusSignIcon} className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Browse Templates</span>
              <span className="sm:hidden">Browse</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-muted p-1">
              <TabsTrigger 
                value="marketplace" 
                className="text-xs sm:text-sm font-medium"
              >
                <HugeiconsIcon icon={Download01Icon} className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Marketplace</span>
                <span className="sm:hidden">Browse</span>
              </TabsTrigger>
              <TabsTrigger 
                value="my-templates" 
                className="text-xs sm:text-sm font-medium"
              >
                <HugeiconsIcon icon={Layers01Icon} className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">My Templates</span>
                <span className="sm:hidden">Mine</span>
              </TabsTrigger>
              <TabsTrigger 
                value="create" 
                className="text-xs sm:text-sm font-medium"
              >
                <HugeiconsIcon icon={PlusSignIcon} className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Create New</span>
                <span className="sm:hidden">Create</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="marketplace" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
              <DashboardTemplateMarketplace
                onImportTemplate={handleImportTemplate}
                onImportFromGitHub={handleGitHubImport}
              />
            </TabsContent>

            <TabsContent value="my-templates" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                {importedTemplates.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="col-span-full"
                  >
                    <Card className="border border-border">
                      <CardContent className="text-center py-8 sm:py-12">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.5, delay: 0.2 }}
                          className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-4 sm:mb-6"
                        >
                          <HugeiconsIcon icon={Download01Icon} className="h-8 w-8 sm:h-10 sm:w-10 text-foreground" />
                        </motion.div>
                        <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2 sm:mb-4">
                          No templates yet
                        </h3>
                        <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 max-w-md mx-auto">
                          Import templates from the marketplace to get started with your dashboard
                        </p>
                        <Button 
                          onClick={() => setActiveTab("marketplace")}
                          className="gap-2 text-foreground border border-border bg-card hover:bg-muted text-xs sm:text-sm"
                        >
                          <HugeiconsIcon icon={Download01Icon} className="h-3 w-3 sm:h-4 sm:w-4" />
                          Browse Templates
                          <HugeiconsIcon icon={ArrowRight01Icon} className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ) : (
                  importedTemplates.map((template, index) => (
                    <motion.div
                      key={template.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      whileHover={{ y: -4, scale: 1.02 }}
                      className="h-full"
                    >
                      <Card className="h-full transition-all duration-300 border border-border bg-card overflow-hidden group">
                        <CardHeader className="p-3 sm:p-4 pb-2 sm:pb-4">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-sm sm:text-lg font-semibold text-foreground truncate transition-colors">
                                {template.name}
                              </CardTitle>
                              <CardDescription className="mt-1 text-xs sm:text-sm text-muted-foreground line-clamp-2">
                                {template.description}
                              </CardDescription>
                            </div>
                            <Badge className="text-foreground border border-border text-xs">
                              {template.category}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="p-3 sm:p-4 pt-0 space-y-3 sm:space-y-4">
                          <div className="flex flex-wrap gap-1 sm:gap-2">
                            {template.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs border-border">
                                {tag}
                              </Badge>
                            ))}
                          </div>

                          <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <HugeiconsIcon icon={Clock01Icon} className="h-3 w-3" />
                              <span>{template.estimatedSetupTime}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <HugeiconsIcon icon={UserGroupIcon} className="h-3 w-3" />
                              <span>{template.author}</span>
                            </div>
                          </div>

                          <div className="flex gap-1.5 sm:gap-2">
                            <Button 
                              size="sm" 
                              onClick={() => onTemplateSelect(template)}
                              className="flex-1 gap-1 text-xs bg-card border border-border hover:bg-muted text-foreground"
                            >
                              <HugeiconsIcon icon={EyeIcon} className="h-3 w-3" />
                              <span className="hidden sm:inline">View</span>
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleCopyTemplate(template)}
                              className="gap-1 text-xs border-border hover:bg-muted"
                            >
                              {copiedTemplateId === template.id ? (
                                <HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-3 w-3 text-foreground" />
                              ) : (
                                <HugeiconsIcon icon={Copy01Icon} className="h-3 w-3" />
                              )}
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleShareTemplate(template)}
                              className="gap-1 text-xs border-border hover:bg-muted"
                            >
                              <HugeiconsIcon icon={Share01Icon} className="h-3 w-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleDeleteTemplate(template.id)}
                              className="gap-1 text-xs border-border hover:bg-muted"
                            >
                              <HugeiconsIcon icon={Delete02Icon} className="h-3 w-3" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="create" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
              <Card className="border border-border">
                <CardHeader className="p-4 sm:p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3">
                      <HugeiconsIcon icon={SparklesIcon} className="h-5 w-5 text-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-lg sm:text-xl font-bold text-foreground">
                        Create Custom Template
                      </CardTitle>
                      <CardDescription className="text-sm sm:text-base text-muted-foreground">
                        Build your own dashboard template from scratch
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <div className="text-center py-8 sm:py-12">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-4 sm:mb-6"
                    >
                      <HugeiconsIcon icon={Edit02Icon} className="h-8 w-8 sm:h-10 sm:w-10 text-foreground" />
                    </motion.div>
                    <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2 sm:mb-4">
                      Template Builder
                    </h3>
                    <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 max-w-md mx-auto">
                      Create custom dashboard templates with our visual builder and drag-and-drop interface
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                      <Button className="gap-2 text-foreground border border-border bg-card hover:bg-muted text-xs sm:text-sm">
                        <HugeiconsIcon icon={Edit02Icon} className="h-3 w-3 sm:h-4 sm:w-4" />
                        Start Building
                        <HugeiconsIcon icon={ArrowRight01Icon} className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                      <Button variant="outline" className="gap-2 text-xs sm:text-sm border-border hover:bg-muted">
                        <HugeiconsIcon icon={CodeSquareIcon} className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">Import Code</span>
                        <span className="sm:hidden">Import</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  )
}
