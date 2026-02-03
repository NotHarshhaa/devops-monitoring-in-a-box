"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, 
  Download, 
  Settings, 
  Trash2, 
  Edit,
  Eye,
  Share2,
  Copy,
  Check,
  Layout,
  Sparkles,
  Layers,
  Code,
  Star,
  Clock,
  Users,
  ArrowRight
} from "lucide-react"
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
    // Add to imported templates
    setImportedTemplates(prev => [...prev, template])
    
    // Create dashboard from template
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
    // In a real implementation, this would share the template
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
      <Card className="border border-gray-200 dark:border-gray-700 shadow-xl bg-white dark:bg-gray-900 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-700 dark:to-purple-700 text-white p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 sm:p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <Layout className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg sm:text-xl font-bold">Template Manager</CardTitle>
                <CardDescription className="text-indigo-100 text-xs sm:text-sm mt-1">
                  Create, import, and manage dashboard templates
                </CardDescription>
              </div>
            </div>
            <Button 
              onClick={() => setActiveTab("marketplace")}
              className="gap-2 bg-white/20 hover:bg-white/30 text-white border-white/30 text-xs sm:text-sm"
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Browse Templates</span>
              <span className="sm:hidden">Browse</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
              <TabsTrigger 
                value="marketplace" 
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-md rounded-lg text-xs sm:text-sm font-medium"
              >
                <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Marketplace</span>
                <span className="sm:hidden">Browse</span>
              </TabsTrigger>
              <TabsTrigger 
                value="my-templates" 
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-md rounded-lg text-xs sm:text-sm font-medium"
              >
                <Layers className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">My Templates</span>
                <span className="sm:hidden">Mine</span>
              </TabsTrigger>
              <TabsTrigger 
                value="create" 
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-md rounded-lg text-xs sm:text-sm font-medium"
              >
                <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
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
                    <Card className="border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20">
                      <CardContent className="text-center py-8 sm:py-12">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.5, delay: 0.2 }}
                          className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6"
                        >
                          <Download className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                        </motion.div>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-4">
                          No templates yet
                        </h3>
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6 max-w-md mx-auto">
                          Import templates from the marketplace to get started with your dashboard
                        </p>
                        <Button 
                          onClick={() => setActiveTab("marketplace")}
                          className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs sm:text-sm"
                        >
                          <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                          Browse Templates
                          <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
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
                      <Card className="h-full hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden group">
                        <CardHeader className="p-3 sm:p-4 pb-2 sm:pb-4">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {template.name}
                              </CardTitle>
                              <CardDescription className="mt-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                {template.description}
                              </CardDescription>
                            </div>
                            <Badge className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0 text-xs">
                              {template.category}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="p-3 sm:p-4 pt-0 space-y-3 sm:space-y-4">
                          <div className="flex flex-wrap gap-1 sm:gap-2">
                            {template.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs border-gray-300 dark:border-gray-600">
                                {tag}
                              </Badge>
                            ))}
                          </div>

                          <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{template.estimatedSetupTime}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              <span>{template.author}</span>
                            </div>
                          </div>

                          <div className="flex gap-1.5 sm:gap-2">
                            <Button 
                              size="sm" 
                              onClick={() => onTemplateSelect(template)}
                              className="flex-1 gap-1 text-xs"
                            >
                              <Eye className="h-3 w-3" />
                              <span className="hidden sm:inline">View</span>
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleCopyTemplate(template)}
                              className="gap-1 text-xs"
                            >
                              {copiedTemplateId === template.id ? (
                                <Check className="h-3 w-3 text-green-600" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleShareTemplate(template)}
                              className="gap-1 text-xs"
                            >
                              <Share2 className="h-3 w-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleDeleteTemplate(template.id)}
                              className="gap-1 text-xs hover:text-red-600 hover:border-red-300"
                            >
                              <Trash2 className="h-3 w-3" />
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
              <Card className="border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                <CardHeader className="p-4 sm:p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                        Create Custom Template
                      </CardTitle>
                      <CardDescription className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
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
                      className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6"
                    >
                      <Edit className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                    </motion.div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-4">
                      Template Builder
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6 max-w-md mx-auto">
                      Create custom dashboard templates with our visual builder and drag-and-drop interface
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                      <Button className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xs sm:text-sm">
                        <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                        Start Building
                        <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                      <Button variant="outline" className="gap-2 text-xs sm:text-sm">
                        <Code className="h-3 w-3 sm:h-4 sm:w-4" />
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
