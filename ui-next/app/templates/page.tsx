"use client"

import { DashboardTemplateManager } from "@/components/dashboard-template-manager"
import { type DashboardTemplate } from "@/lib/dashboard-templates"

export default function TemplatesPage() {
  const handleTemplateSelect = (template: DashboardTemplate) => {
    // Handle template selection - could open in a modal or navigate to editor
    console.log("Selected template:", template)
  }

  const handleTemplateCreate = (template: DashboardTemplate) => {
    // Handle template creation - create new dashboard from template
    console.log("Creating dashboard from template:", template)
  }

  return (
    <div className="space-y-4 sm:space-y-6 pb-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">Dashboard Templates</h1>
        <p className="text-muted-foreground mt-2 text-sm sm:text-base">
          Browse and manage dashboard templates
        </p>
      </div>
      <DashboardTemplateManager
        onTemplateSelect={handleTemplateSelect}
        onTemplateCreate={handleTemplateCreate}
      />
    </div>
  )
}
