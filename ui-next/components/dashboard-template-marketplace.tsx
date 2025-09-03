"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Search, 
  Download, 
  Star, 
  Clock, 
  User, 
  Tag,
  Github,
  Filter,
  Grid3X3,
  List,
  Zap,
  Database,
  Server,
  Container,
  Globe
} from "lucide-react"
import { dashboardTemplates, getTemplatesByCategory, searchTemplates, type DashboardTemplate } from "@/lib/dashboard-templates"
import { toast } from "@/hooks/use-toast"

interface TemplateMarketplaceProps {
  onImportTemplate: (template: DashboardTemplate) => void
  onImportFromGitHub: (url: string) => void
}

export function DashboardTemplateMarketplace({ onImportTemplate, onImportFromGitHub }: TemplateMarketplaceProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [difficultyFilter, setDifficultyFilter] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [githubUrl, setGithubUrl] = useState("")

  const filteredTemplates = useMemo(() => {
    let templates = dashboardTemplates

    // Filter by category
    if (selectedCategory !== "all") {
      templates = getTemplatesByCategory(selectedCategory)
    }

    // Filter by difficulty
    if (difficultyFilter !== "all") {
      templates = templates.filter(template => template.difficulty === difficultyFilter)
    }

    // Search filter
    if (searchQuery) {
      templates = searchTemplates(searchQuery)
    }

    return templates
  }, [searchQuery, selectedCategory, difficultyFilter])

  const handleImportTemplate = (template: DashboardTemplate) => {
    onImportTemplate(template)
    toast({
      title: "Template Imported",
      description: `${template.name} has been imported successfully!`,
    })
  }

  const handleGitHubImport = () => {
    if (!githubUrl) {
      toast({
        title: "Error",
        description: "Please enter a GitHub URL",
        variant: "destructive"
      })
      return
    }

    onImportFromGitHub(githubUrl)
    toast({
      title: "GitHub Import Started",
      description: "Importing template from GitHub...",
    })
    setGithubUrl("")
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'kubernetes': return <Container className="h-4 w-4" />
      case 'database': return <Database className="h-4 w-4" />
      case 'web-server': return <Globe className="h-4 w-4" />
      case 'system': return <Server className="h-4 w-4" />
      default: return <Zap className="h-4 w-4" />
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Dashboard Templates</h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            Pre-built monitoring dashboards for common use cases
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("grid")}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* GitHub Import Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Github className="h-5 w-5" />
            <span>Import from GitHub</span>
          </CardTitle>
          <CardDescription>
            Import dashboard templates from GitHub repositories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Input
              placeholder="https://github.com/user/repo/blob/main/dashboard.json"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleGitHubImport}>
              <Download className="h-4 w-4 mr-2" />
              Import
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 sm:gap-4">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-3 sm:gap-4">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="kubernetes">Kubernetes</SelectItem>
              <SelectItem value="database">Database</SelectItem>
              <SelectItem value="web-server">Web Server</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>

          <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Templates Grid/List */}
      <AnimatePresence mode="wait">
        {viewMode === "grid" ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
          >
            {filteredTemplates.map((template) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        {getCategoryIcon(template.category)}
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                      </div>
                      <Badge className={getDifficultyColor(template.difficulty)}>
                        {template.difficulty}
                      </Badge>
                    </div>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {template.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                      {template.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{template.tags.length - 3} more
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <span>{template.estimatedSetupTime}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span>{template.author}</span>
                      </div>
                    </div>

                    <Button 
                      onClick={() => handleImportTemplate(template)}
                      className="w-full"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Import Template
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {filteredTemplates.map((template) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {getCategoryIcon(template.category)}
                        <div>
                          <h3 className="font-semibold">{template.name}</h3>
                          <p className="text-sm text-muted-foreground">{template.description}</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <Badge className={getDifficultyColor(template.difficulty)}>
                              {template.difficulty}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              <Clock className="h-3 w-3 inline mr-1" />
                              {template.estimatedSetupTime}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              <User className="h-3 w-3 inline mr-1" />
                              {template.author}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button onClick={() => handleImportTemplate(template)}>
                        <Download className="h-4 w-4 mr-2" />
                        Import
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <div className="text-muted-foreground">
            <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No templates found</h3>
            <p>Try adjusting your search criteria or filters</p>
          </div>
        </div>
      )}
    </div>
  )
}
