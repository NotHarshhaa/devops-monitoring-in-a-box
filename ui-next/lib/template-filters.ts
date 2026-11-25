import type { DashboardTemplate } from "./dashboard-templates"

export interface TemplateFilterOptions {
  category?: string
  difficulty?: string
  searchQuery?: string
}

/**
 * Combines category, difficulty, and free-text query filters without letting
 * one criterion discard another.
 */
export function filterDashboardTemplates(
  templates: DashboardTemplate[],
  { category = "all", difficulty = "all", searchQuery = "" }: TemplateFilterOptions
): DashboardTemplate[] {
  const normalizedQuery = searchQuery.trim().toLowerCase()

  return templates.filter((template) => {
    if (category !== "all" && template.category !== category) {
      return false
    }
    if (difficulty !== "all" && template.difficulty !== difficulty) {
      return false
    }
    if (!normalizedQuery) {
      return true
    }

    const searchableFields = [
      template.name,
      template.description,
      template.category,
      template.author,
      ...(template.tags ?? []),
    ]
    return searchableFields.some((field) =>
      field.toLowerCase().includes(normalizedQuery)
    )
  })
}
