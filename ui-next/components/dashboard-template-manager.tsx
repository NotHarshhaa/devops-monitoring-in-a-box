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
  Check
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Templates</h1>
          <p className="text-muted-foreground">
            Create, import, and manage monitoring dashboard templates
          </p>
        </div>
        <Button onClick={() => setActiveTab("marketplace")}>
          <Plus className="h-4 w-4 mr-2" />
          Browse Templates
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
          <TabsTrigger value="my-templates">My Templates</TabsTrigger>
          <TabsTrigger value="create">Create New</TabsTrigger>
        </TabsList>

        <TabsContent value="marketplace" className="space-y-6">
          <DashboardTemplateMarketplace
            onImportTemplate={handleImportTemplate}
            onImportFromGitHub={handleGitHubImport}
          />
        </TabsContent>

        <TabsContent value="my-templates" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {importedTemplates.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="text-muted-foreground">
                  <Download className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No templates yet</h3>
                  <p>Import templates from the marketplace to get started</p>
                  <Button 
                    className="mt-4" 
                    onClick={() => setActiveTab("marketplace")}
                  >
                    Browse Templates
                  </Button>
                </div>
              </div>
            ) : (
              importedTemplates.map((template) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{template.name}</CardTitle>
                          <CardDescription>{template.description}</CardDescription>
                        </div>
                        <Badge variant="secondary">
                          {template.category}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {template.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{template.estimatedSetupTime}</span>
                        <span>{template.author}</span>
                      </div>

                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          onClick={() => onTemplateSelect(template)}
                          className="flex-1"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleCopyTemplate(template)}
                        >
                          {copiedTemplateId === template.id ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleShareTemplate(template)}
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDeleteTemplate(template.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create Custom Template</CardTitle>
              <CardDescription>
                Build your own dashboard template from scratch
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <div className="text-muted-foreground">
                  <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">Template Builder</h3>
                  <p className="mb-4">
                    Create custom dashboard templates with our visual builder
                  </p>
                  <Button>
                    <Edit className="h-4 w-4 mr-2" />
                    Start Building
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
