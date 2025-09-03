import { DashboardTemplate } from './dashboard-templates'

export interface GitHubImportResult {
  success: boolean
  template?: DashboardTemplate
  error?: string
}

export class TemplateImportService {
  /**
   * Import a dashboard template from a GitHub URL
   */
  static async importFromGitHub(url: string): Promise<GitHubImportResult> {
    try {
      // Parse GitHub URL to extract raw content URL
      const rawUrl = this.convertToRawUrl(url)
      
      // Fetch the template file
      const response = await fetch(rawUrl)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch template: ${response.statusText}`)
      }
      
      const templateData = await response.json()
      
      // Validate and convert to our template format
      const template = this.convertToTemplate(templateData, url)
      
      return {
        success: true,
        template
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * Convert GitHub URL to raw content URL
   */
  private static convertToRawUrl(url: string): string {
    // Handle different GitHub URL formats
    const patterns = [
      // https://github.com/user/repo/blob/branch/path/file.json
      /github\.com\/([^\/]+)\/([^\/]+)\/blob\/([^\/]+)\/(.+)/,
      // https://github.com/user/repo/blob/main/path/file.json
      /github\.com\/([^\/]+)\/([^\/]+)\/blob\/([^\/]+)\/(.+)/,
    ]

    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match) {
        const [, user, repo, branch, path] = match
        return `https://raw.githubusercontent.com/${user}/${repo}/${branch}/${path}`
      }
    }

    // If it's already a raw URL, return as is
    if (url.includes('raw.githubusercontent.com')) {
      return url
    }

    throw new Error('Invalid GitHub URL format')
  }

  /**
   * Convert external template format to our internal format
   */
  private static convertToTemplate(data: any, sourceUrl: string): DashboardTemplate {
    // Handle different template formats (Grafana JSON, custom formats, etc.)
    if (data.dashboard) {
      // Grafana dashboard format
      return this.convertFromGrafanaFormat(data.dashboard, sourceUrl)
    } else if (data.panels || data.config) {
      // Custom format
      return this.convertFromCustomFormat(data, sourceUrl)
    } else {
      // Assume it's already in our format
      return this.validateTemplate(data)
    }
  }

  /**
   * Convert Grafana dashboard format to our template format
   */
  private static convertFromGrafanaFormat(dashboard: any, sourceUrl: string): DashboardTemplate {
    return {
      id: `imported-${Date.now()}`,
      name: dashboard.title || 'Imported Dashboard',
      description: dashboard.description || 'Imported from GitHub',
      category: 'custom',
      tags: ['imported', 'github'],
      thumbnail: '/templates/imported.png',
      config: {
        panels: dashboard.panels || [],
        variables: dashboard.templating?.list || [],
        annotations: dashboard.annotations?.list || [],
        refresh: dashboard.refresh || '30s',
        timeRange: {
          from: dashboard.time?.from || 'now-1h',
          to: dashboard.time?.to || 'now'
        }
      },
      metrics: this.extractMetricsFromPanels(dashboard.panels || []),
      requirements: ['Custom setup required'],
      difficulty: 'intermediate',
      estimatedSetupTime: '15-30 minutes',
      author: 'GitHub Import',
      version: '1.0.0',
      lastUpdated: new Date().toISOString().split('T')[0]
    }
  }

  /**
   * Convert custom format to our template format
   */
  private static convertFromCustomFormat(data: any, sourceUrl: string): DashboardTemplate {
    return {
      id: `imported-${Date.now()}`,
      name: data.name || 'Imported Template',
      description: data.description || 'Imported from GitHub',
      category: data.category || 'custom',
      tags: data.tags || ['imported', 'github'],
      thumbnail: data.thumbnail || '/templates/imported.png',
      config: data.config || {
        panels: [],
        variables: [],
        annotations: [],
        refresh: '30s',
        timeRange: { from: 'now-1h', to: 'now' }
      },
      metrics: data.metrics || [],
      requirements: data.requirements || ['Custom setup required'],
      difficulty: data.difficulty || 'intermediate',
      estimatedSetupTime: data.estimatedSetupTime || '15-30 minutes',
      author: data.author || 'GitHub Import',
      version: data.version || '1.0.0',
      lastUpdated: new Date().toISOString().split('T')[0]
    }
  }

  /**
   * Validate and ensure template has required fields
   */
  private static validateTemplate(data: any): DashboardTemplate {
    const requiredFields = ['id', 'name', 'description', 'category', 'config']
    
    for (const field of requiredFields) {
      if (!data[field]) {
        throw new Error(`Missing required field: ${field}`)
      }
    }

    return data as DashboardTemplate
  }

  /**
   * Extract metrics from dashboard panels
   */
  private static extractMetricsFromPanels(panels: any[]): string[] {
    const metrics = new Set<string>()
    
    panels.forEach(panel => {
      if (panel.targets) {
        panel.targets.forEach((target: any) => {
          if (target.expr) {
            // Extract metric names from PromQL expressions
            const metricMatches = target.expr.match(/([a-zA-Z_][a-zA-Z0-9_]*)/g)
            if (metricMatches) {
              metricMatches.forEach((metric: string) => {
                if (metric.includes('_') && !metric.includes('(') && !metric.includes(')')) {
                  metrics.add(metric)
                }
              })
            }
          }
        })
      }
    })

    return Array.from(metrics)
  }

  /**
   * Export template to JSON format
   */
  static exportTemplate(template: DashboardTemplate): string {
    return JSON.stringify(template, null, 2)
  }

  /**
   * Import template from JSON string
   */
  static importFromJSON(jsonString: string): GitHubImportResult {
    try {
      const data = JSON.parse(jsonString)
      const template = this.validateTemplate(data)
      
      return {
        success: true,
        template
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Invalid JSON format'
      }
    }
  }

  /**
   * Get popular GitHub repositories with dashboard templates
   */
  static getPopularRepositories(): Array<{name: string, url: string, description: string}> {
    return [
      {
        name: 'Grafana Community Dashboards',
        url: 'https://github.com/grafana/grafana/tree/main/public/dashboards',
        description: 'Official Grafana community dashboards'
      },
      {
        name: 'Kubernetes Monitoring Mixin',
        url: 'https://github.com/kubernetes-monitoring/kubernetes-mixin',
        description: 'Kubernetes monitoring dashboards and alerts'
      },
      {
        name: 'Node Exporter Mixin',
        url: 'https://github.com/prometheus/node_exporter',
        description: 'Node Exporter monitoring dashboards'
      },
      {
        name: 'MySQL Exporter Mixin',
        url: 'https://github.com/prometheus/mysqld_exporter',
        description: 'MySQL monitoring dashboards'
      }
    ]
  }
}
