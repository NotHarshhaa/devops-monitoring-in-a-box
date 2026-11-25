"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { HugeiconsIcon } from "@hugeicons/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Modal } from "@/components/ui/modal"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { 
  PlusSignIcon, 
  Download01Icon, 
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
  Clock01Icon,
  UserGroupIcon,
  ArrowRight01Icon
} from "@hugeicons/core-free-icons"
import { DashboardTemplateMarketplace } from "./dashboard-template-marketplace"
import { TemplateImportService, type GitHubImportResult } from "@/lib/template-import-service"
import { type DashboardTemplate } from "@/lib/dashboard-templates"
import { toast } from "@/hooks/use-toast"

const TEMPLATES_STORAGE_KEY = "monitoring-imported-templates"

interface DashboardTemplateManagerProps {
  onTemplateSelect: (template: DashboardTemplate) => void
  onTemplateCreate: (template: DashboardTemplate) => void
  activeTab?: string
  onTabChange?: (tab: string) => void
  onTemplatesCountChange?: (count: number) => void
}

export function DashboardTemplateManager({
  onTemplateSelect,
  onTemplateCreate,
  activeTab: controlledActiveTab,
  onTabChange,
  onTemplatesCountChange,
}: DashboardTemplateManagerProps) {
  const [internalTab, setInternalTab] = useState("marketplace")
  const activeTab = controlledActiveTab ?? internalTab
  const setActiveTab = (tab: string) => {
    setInternalTab(tab)
    onTabChange?.(tab)
  }

  const [importedTemplates, setImportedTemplates] = useState<DashboardTemplate[]>([])
  const [copiedTemplateId, setCopiedTemplateId] = useState<string | null>(null)
  const [previewTemplate, setPreviewTemplate] = useState<DashboardTemplate | null>(null)
  const [importModalOpen, setImportModalOpen] = useState(false)
  const [importJsonText, setImportJsonText] = useState("")
  const [builderOpen, setBuilderOpen] = useState(false)
  const [customDraft, setCustomDraft] = useState({
    name: "",
    description: "",
    category: "system" as DashboardTemplate["category"],
    difficulty: "beginner" as DashboardTemplate["difficulty"],
    tags: "custom, prometheus",
    metricTitle: "CPU Usage (%)",
    metricQuery: '100 - (avg(rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)',
    metricUnit: "%",
  })

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved = localStorage.getItem(TEMPLATES_STORAGE_KEY)
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed)) {
            setImportedTemplates(parsed)
            onTemplatesCountChange?.(parsed.length)
          }
        }
      } catch {
        // Ignore invalid persisted templates
      }
    }, 0)
    return () => window.clearTimeout(timer)
  }, [onTemplatesCountChange])

  const persistTemplates = (next: DashboardTemplate[]) => {
    setImportedTemplates(next)
    onTemplatesCountChange?.(next.length)
    try {
      localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(next))
    } catch {
      // Ignore storage errors
    }
  }

  const handleImportTemplate = (template: DashboardTemplate) => {
    const alreadyExists = importedTemplates.some((t) => t.id === template.id)
    const entry: DashboardTemplate = alreadyExists
      ? { ...template, id: `${template.id}-${Date.now()}`, name: `${template.name} (Copy)` }
      : template
    persistTemplates([...importedTemplates, entry])
    onTemplateCreate(entry)
    setActiveTab("my-templates")
    
    toast({
      title: "Template Imported",
      description: `${entry.name} has been added to My Templates.`,
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
    } catch {
      toast({
        title: "Import Error",
        description: "An error occurred while importing the template",
        variant: "destructive"
      })
    }
  }

  const handleDeleteTemplate = (templateId: string) => {
    persistTemplates(importedTemplates.filter(t => t.id !== templateId))
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

  const handleShareTemplate = async (template: DashboardTemplate) => {
    try {
      const jsonString = TemplateImportService.exportTemplate(template)
      await navigator.clipboard.writeText(jsonString)
      toast({
        title: "Template JSON copied for sharing",
        description: `Copied ${template.name} configuration to clipboard.`,
      })
    } catch {
      toast({
        title: "Share failed",
        description: "Clipboard access is unavailable.",
        variant: "destructive",
      })
    }
  }

  const handleCreateCustomTemplate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!customDraft.name.trim() || !customDraft.metricQuery.trim()) {
      toast({
        title: "Missing required fields",
        description: "Please provide both a template name and a PromQL query.",
        variant: "destructive",
      })
      return
    }
    const panelTitle = customDraft.metricTitle.trim() || "Custom Metric"
    const newTemplate: DashboardTemplate = {
      id: `custom-${Date.now()}`,
      name: customDraft.name.trim(),
      description: customDraft.description.trim() || "Custom monitoring dashboard template",
      category: customDraft.category,
      tags: customDraft.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      thumbnail: "/templates/custom.png",
      author: "Custom Builder",
      version: "1.0.0",
      difficulty: customDraft.difficulty,
      estimatedSetupTime: "5 min",
      requirements: ["Prometheus"],
      metrics: [panelTitle],
      lastUpdated: new Date().toISOString().split("T")[0],
      config: {
        panels: [
          {
            id: 1,
            title: panelTitle,
            type: "stat",
            targets: [
              {
                expr: customDraft.metricQuery.trim(),
                legendFormat: customDraft.metricUnit.trim()
                  ? `${panelTitle} (${customDraft.metricUnit.trim()})`
                  : panelTitle,
              },
            ],
            gridPos: { h: 8, w: 12, x: 0, y: 0 },
          },
        ],
        variables: [],
        annotations: [],
        refresh: "30s",
        timeRange: {
          from: "now-1h",
          to: "now",
        },
      },
    }

    handleImportTemplate(newTemplate)
    setBuilderOpen(false)
    setCustomDraft((prev) => ({ ...prev, name: "", description: "" }))
  }

  const handleJsonImportSubmit = () => {
    const result = TemplateImportService.importFromJSON(importJsonText)
    if (!result.success || !result.template) {
      toast({
        title: "Invalid template JSON",
        description: result.error || "Could not parse the template JSON.",
        variant: "destructive",
      })
      return
    }
    handleImportTemplate(result.template)
    setImportJsonText("")
    setImportModalOpen(false)
  }

  const handleInspectTemplate = (template: DashboardTemplate) => {
    setPreviewTemplate(template)
    onTemplateSelect(template)
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
                onPreviewTemplate={handleInspectTemplate}
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
                          className="gap-2 text-xs sm:text-sm"
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
                              onClick={() => handleInspectTemplate(template)}
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
                  {builderOpen ? (
                    <form onSubmit={handleCreateCustomTemplate} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="tpl-name">Template Name *</Label>
                          <Input
                            id="tpl-name"
                            value={customDraft.name}
                            onChange={(e) => setCustomDraft(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="e.g. API Gateway Latency"
                            className="bg-card border-border"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="tpl-tags">Tags (comma-separated)</Label>
                          <Input
                            id="tpl-tags"
                            value={customDraft.tags}
                            onChange={(e) => setCustomDraft(prev => ({ ...prev, tags: e.target.value }))}
                            placeholder="api, prometheus, latency"
                            className="bg-card border-border"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Category</Label>
                          <Select
                            value={customDraft.category}
                            onValueChange={(val) => setCustomDraft(prev => ({ ...prev, category: val as DashboardTemplate["category"] }))}
                          >
                            <SelectTrigger className="bg-card border-border">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="system">System</SelectItem>
                              <SelectItem value="kubernetes">Kubernetes</SelectItem>
                              <SelectItem value="database">Database</SelectItem>
                              <SelectItem value="web-server">Web Server</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Difficulty</Label>
                          <Select
                            value={customDraft.difficulty}
                            onValueChange={(val) => setCustomDraft(prev => ({ ...prev, difficulty: val as DashboardTemplate["difficulty"] }))}
                          >
                            <SelectTrigger className="bg-card border-border">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="beginner">Beginner</SelectItem>
                              <SelectItem value="intermediate">Intermediate</SelectItem>
                              <SelectItem value="advanced">Advanced</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tpl-desc">Description</Label>
                        <Textarea
                          id="tpl-desc"
                          value={customDraft.description}
                          onChange={(e) => setCustomDraft(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="What this dashboard tracks..."
                          className="bg-card border-border"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-border pt-4">
                        <div className="space-y-2">
                          <Label htmlFor="tpl-metric-title">Primary Metric Title</Label>
                          <Input
                            id="tpl-metric-title"
                            value={customDraft.metricTitle}
                            onChange={(e) => setCustomDraft(prev => ({ ...prev, metricTitle: e.target.value }))}
                            className="bg-card border-border"
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="tpl-metric-query">PromQL Query *</Label>
                          <Input
                            id="tpl-metric-query"
                            value={customDraft.metricQuery}
                            onChange={(e) => setCustomDraft(prev => ({ ...prev, metricQuery: e.target.value }))}
                            className="bg-card border-border font-mono text-xs"
                            required
                          />
                        </div>
                      </div>
                      <div className="flex flex-wrap justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={() => setBuilderOpen(false)} className="border-border hover:bg-muted">
                          Cancel
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setImportModalOpen(true)} className="border-border hover:bg-muted gap-2">
                          <HugeiconsIcon icon={CodeSquareIcon} className="h-4 w-4" />
                          Import JSON Instead
                        </Button>
                        <Button type="submit" className="gap-2">
                          <HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-4 w-4" />
                          Save Template
                        </Button>
                      </div>
                    </form>
                  ) : (
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
                      Create custom dashboard templates with PromQL metrics or import a JSON definition
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                      <Button onClick={() => setBuilderOpen(true)} className="gap-2 text-xs sm:text-sm">
                        <HugeiconsIcon icon={Edit02Icon} className="h-3 w-3 sm:h-4 sm:w-4" />
                        Start Building
                        <HugeiconsIcon icon={ArrowRight01Icon} className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                      <Button variant="outline" onClick={() => setImportModalOpen(true)} className="gap-2 text-xs sm:text-sm border-border hover:bg-muted">
                        <HugeiconsIcon icon={CodeSquareIcon} className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">Import Code</span>
                        <span className="sm:hidden">Import</span>
                      </Button>
                    </div>
                  </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Template Details Preview Modal */}
      <Modal
        open={Boolean(previewTemplate)}
        onClose={() => setPreviewTemplate(null)}
        title={previewTemplate?.name || "Template Preview"}
        description={previewTemplate?.description}
        className="max-w-2xl"
      >
        {previewTemplate && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="px-2 py-0.5">{previewTemplate.category}</Badge>
              <Badge variant="outline" className="px-2 py-0.5">{previewTemplate.difficulty}</Badge>
              <Badge variant="outline" className="px-2 py-0.5">{previewTemplate.estimatedSetupTime}</Badge>
              <Badge variant="outline" className="px-2 py-0.5">v{previewTemplate.version}</Badge>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-foreground">
                Included Panels &amp; Queries ({previewTemplate.config.panels?.length ?? 0})
              </h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {(previewTemplate.config.panels ?? []).length > 0 ? (
                  previewTemplate.config.panels.map((panel: any, idx: number) => (
                    <div key={panel.id ?? idx} className="p-3 border border-border bg-muted/40 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium text-foreground">{panel.title || `Panel ${idx + 1}`}</span>
                        {panel.type && <Badge variant="secondary" className="text-xs px-2 py-0.5">{panel.type}</Badge>}
                      </div>
                      {(panel.targets ?? []).map((target: any, tIdx: number) => (
                        <p key={tIdx} className="text-xs font-mono text-muted-foreground break-all">
                          {target.expr || target.query || 'PromQL target'}
                        </p>
                      ))}
                    </div>
                  ))
                ) : (
                  (previewTemplate.metrics ?? []).map((metricName, idx) => (
                    <div key={idx} className="p-2.5 border border-border bg-muted/40 text-xs font-mono text-foreground">
                      {metricName}
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button variant="outline" onClick={() => handleCopyTemplate(previewTemplate)} className="gap-2 border-border hover:bg-muted">
                <HugeiconsIcon icon={Copy01Icon} className="h-4 w-4" />
                Copy JSON
              </Button>
              <Button
                onClick={() => {
                  const target = previewTemplate
                  setPreviewTemplate(null)
                  handleImportTemplate(target)
                }}
                className="gap-2"
              >
                <HugeiconsIcon icon={Download01Icon} className="h-4 w-4" />
                Import to My Templates
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Import JSON Modal */}
      <Modal
        open={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        title="Import Template JSON"
        description="Paste a dashboard template JSON payload to validate and add it to My Templates."
        className="max-w-xl"
      >
        <div className="space-y-4">
          <Textarea
            value={importJsonText}
            onChange={(e) => setImportJsonText(e.target.value)}
            placeholder='{"id":"custom-1","name":"My Dashboard","description":"Prometheus view","category":"system","config":{"panels":[],"variables":[],"annotations":[],"refresh":"30s","timeRange":{"from":"now-1h","to":"now"}},"metrics":["up"]}'
            rows={8}
            className="bg-card border-border font-mono text-xs"
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setImportModalOpen(false)} className="border-border hover:bg-muted">
              Cancel
            </Button>
            <Button onClick={handleJsonImportSubmit} disabled={!importJsonText.trim()} className="gap-2">
              <HugeiconsIcon icon={Download01Icon} className="h-4 w-4" />
              Import JSON
            </Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  )
}
