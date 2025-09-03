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
    <div className="container mx-auto py-6">
      <DashboardTemplateManager
        onTemplateSelect={handleTemplateSelect}
        onTemplateCreate={handleTemplateCreate}
      />
    </div>
  )
}
