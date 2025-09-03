# Dashboard Template Management Guide

## Overview

The Dashboard Template Management system allows you to create, import, share, and manage monitoring dashboard templates. This feature enables rapid deployment of pre-configured dashboards for various monitoring scenarios, from Kubernetes clusters to database monitoring.

## Table of Contents

- [Getting Started](#getting-started)
- [Template Marketplace](#template-marketplace)
- [Template Categories](#template-categories)
- [Importing Templates](#importing-templates)
- [Creating Custom Templates](#creating-custom-templates)
- [Managing Your Templates](#managing-your-templates)
- [Template Configuration](#template-configuration)
- [GitHub Integration](#github-integration)
- [Sharing Templates](#sharing-templates)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)
- [API Reference](#api-reference)

## Getting Started

### Accessing Template Management

1. Navigate to the **Templates** page in the application sidebar
2. You'll see three main tabs:
   - **Marketplace**: Browse and import pre-built templates
   - **My Templates**: Manage your imported and custom templates
   - **Create New**: Build custom templates from scratch

### Template Structure

Each dashboard template contains:

```typescript
interface DashboardTemplate {
  id: string                    // Unique template identifier
  name: string                  // Display name
  description: string           // Template description
  category: TemplateCategory    // Template category
  tags: string[]               // Searchable tags
  thumbnail: string            // Preview image
  config: {                    // Dashboard configuration
    panels: any[]              // Dashboard panels/widgets
    variables: any[]           // Template variables
    annotations: any[]         // Annotations
    refresh: string            // Refresh interval
    timeRange: {               // Default time range
      from: string
      to: string
    }
  }
  metrics: string[]            // Required metrics
  requirements: string[]       // Prerequisites
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedSetupTime: string   // Setup time estimate
  author: string              // Template author
  version: string             // Template version
  lastUpdated: string         // Last update date
}
```

## Template Marketplace

### Browsing Templates

The marketplace provides access to a curated collection of monitoring templates:

#### **Search and Filter**
- **Search**: Use the search bar to find templates by name, description, or tags
- **Category Filter**: Filter by template category (Kubernetes, Database, Web Server, System, Custom)
- **Difficulty Filter**: Filter by complexity level (Beginner, Intermediate, Advanced)
- **View Modes**: Switch between grid and list view

#### **Template Information**
Each template card displays:
- **Thumbnail**: Visual preview of the dashboard
- **Name & Description**: Template title and purpose
- **Category Badge**: Template category
- **Difficulty Level**: Complexity indicator
- **Setup Time**: Estimated configuration time
- **Author**: Template creator
- **Tags**: Searchable keywords
- **Metrics**: Required metrics list

### Template Categories

#### **Kubernetes Templates**
- **Kubernetes Cluster Overview**: Comprehensive cluster monitoring
- **Pod Monitoring**: Individual pod performance tracking
- **Node Resources**: Node-level resource utilization
- **Service Mesh**: Istio/Linkerd monitoring
- **Helm Charts**: Application deployment monitoring

**Required Metrics:**
```
container_cpu_usage_seconds_total
container_memory_working_set_bytes
kube_pod_status_phase
kube_node_status_condition
kube_deployment_status_replicas
```

#### **Database Templates**
- **PostgreSQL Monitoring**: Database performance and health
- **MySQL Monitoring**: MySQL-specific metrics
- **Redis Monitoring**: Cache performance tracking
- **MongoDB Monitoring**: Document database metrics
- **Database Cluster**: Multi-instance database monitoring

**Required Metrics:**
```
postgresql_stat_database_tup_returned
mysql_global_status_queries
redis_connected_clients
mongodb_connections_current
```

#### **Web Server Templates**
- **Nginx Monitoring**: Web server performance
- **Apache Monitoring**: Apache HTTP server metrics
- **Load Balancer**: Traffic distribution monitoring
- **CDN Performance**: Content delivery metrics
- **SSL Certificate**: Certificate expiration tracking

**Required Metrics:**
```
nginx_http_requests_total
apache_accesses_total
haproxy_backend_servers
ssl_certificate_expiry_seconds
```

#### **System Templates**
- **Linux System**: OS-level monitoring
- **Windows System**: Windows server monitoring
- **Docker Containers**: Container runtime metrics
- **Network Monitoring**: Network interface statistics
- **Disk Usage**: Storage utilization tracking

**Required Metrics:**
```
node_cpu_seconds_total
node_memory_MemAvailable_bytes
node_filesystem_size_bytes
node_network_receive_bytes_total
```

## Importing Templates

### From Marketplace

1. **Browse Templates**: Navigate to the Marketplace tab
2. **Select Template**: Click on a template card to view details
3. **Review Requirements**: Check metrics and prerequisites
4. **Import Template**: Click "Import Template" button
5. **Configure Dashboard**: Set up data sources and variables

### From GitHub

1. **GitHub Import**: Use the GitHub import feature
2. **Provide URL**: Enter the GitHub repository URL
3. **Template Detection**: System automatically detects template files
4. **Import Process**: Template is downloaded and imported
5. **Validation**: System validates template structure

```typescript
// Example GitHub import
const githubUrl = "https://github.com/user/monitoring-templates"
await TemplateImportService.importFromGitHub(githubUrl)
```

### Template Validation

Before import, templates are validated for:
- **Structure**: Required fields and proper format
- **Metrics**: Availability of required metrics
- **Dependencies**: Required data sources and exporters
- **Compatibility**: Version compatibility checks

## Creating Custom Templates

### Template Builder

1. **Start Creation**: Click "Create New" tab
2. **Basic Information**: Fill in template metadata
3. **Dashboard Design**: Add panels and configure layout
4. **Variables**: Define template variables
5. **Metrics**: Specify required metrics
6. **Requirements**: List prerequisites
7. **Save Template**: Save as custom template

### Panel Configuration

#### **Panel Types**
- **Stat Panels**: Single metric displays
- **Graph Panels**: Time-series visualizations
- **Table Panels**: Tabular data display
- **Heatmap Panels**: Heat map visualizations
- **Gauge Panels**: Gauge-style metrics
- **Bar Gauge Panels**: Bar chart gauges

#### **Panel Properties**
```typescript
interface Panel {
  id: number
  title: string
  type: 'stat' | 'graph' | 'table' | 'heatmap' | 'gauge'
  targets: Target[]
  gridPos: { h: number, w: number, x: number, y: number }
  options?: PanelOptions
}

interface Target {
  expr: string        // Prometheus query expression
  legendFormat?: string
  refId?: string
}
```

### Template Variables

Define dynamic variables for template customization:

```typescript
interface TemplateVariable {
  name: string
  type: 'query' | 'interval' | 'custom'
  query?: string
  options?: VariableOption[]
  current: { value: string, text: string }
}

// Example variables
const variables = [
  {
    name: 'cluster',
    type: 'query',
    query: 'label_values(kube_pod_info, cluster)',
    current: { value: 'All', text: 'All' }
  },
  {
    name: 'namespace',
    type: 'query',
    query: 'label_values(kube_pod_info, namespace)',
    current: { value: 'All', text: 'All' }
  }
]
```

## Managing Your Templates

### My Templates Tab

The "My Templates" section provides:

#### **Template Actions**
- **View**: Preview template configuration
- **Edit**: Modify template settings
- **Duplicate**: Create a copy of the template
- **Share**: Generate shareable link
- **Delete**: Remove template from collection
- **Export**: Download template as JSON

#### **Template Status**
- **Imported**: Templates from marketplace
- **Custom**: User-created templates
- **Shared**: Templates shared by others
- **Favorites**: Starred templates

### Template Organization

#### **Categories**
Organize templates by:
- **Category**: Kubernetes, Database, Web Server, System, Custom
- **Difficulty**: Beginner, Intermediate, Advanced
- **Author**: Template creator
- **Last Used**: Recent usage tracking

#### **Search and Filter**
- **Quick Search**: Find templates by name or tags
- **Advanced Filters**: Filter by multiple criteria
- **Sort Options**: Sort by name, date, popularity

## Template Configuration

### Dashboard Configuration

#### **Time Range**
```typescript
timeRange: {
  from: 'now-1h',    // Relative time
  to: 'now'
}

// Or absolute time
timeRange: {
  from: '2024-01-01T00:00:00Z',
  to: '2024-01-01T23:59:59Z'
}
```

#### **Refresh Intervals**
```typescript
refresh: '30s'       // 30 seconds
refresh: '1m'        // 1 minute
refresh: '5m'        // 5 minutes
refresh: '15m'       // 15 minutes
refresh: '1h'        // 1 hour
```

#### **Annotations**
```typescript
annotations: [
  {
    name: 'Deployments',
    datasource: 'Prometheus',
    expr: 'increase(deployment_created_total[1h])',
    titleFormat: 'Deployment: {{value}}',
    textFormat: 'New deployment detected'
  }
]
```

### Metrics Configuration

#### **Prometheus Queries**
```typescript
// CPU usage percentage
expr: '100 - (avg by (instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)'

// Memory usage percentage
expr: '(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100'

// Disk usage percentage
expr: '100 - ((node_filesystem_avail_bytes * 100) / node_filesystem_size_bytes)'
```

#### **Metric Labels**
```typescript
// Use labels for filtering
expr: 'kube_pod_status_phase{namespace="production"}'

// Multiple label filters
expr: 'container_cpu_usage_seconds_total{container!="POD",container!=""}'
```

## GitHub Integration

### Importing from GitHub

#### **Supported Formats**
- **JSON Files**: Standard template format
- **YAML Files**: Alternative template format
- **Directory Structure**: Organized template collections

#### **Repository Structure**
```
monitoring-templates/
├── kubernetes/
│   ├── cluster-overview.json
│   ├── pod-monitoring.json
│   └── node-resources.json
├── database/
│   ├── postgresql.json
│   ├── mysql.json
│   └── redis.json
└── README.md
```

#### **Import Process**
1. **Repository URL**: Provide GitHub repository URL
2. **Template Detection**: System scans for template files
3. **Validation**: Validates template structure
4. **Import**: Downloads and imports templates
5. **Configuration**: Sets up imported templates

### Template Sharing

#### **Export to GitHub**
1. **Create Repository**: Set up GitHub repository
2. **Export Template**: Use export functionality
3. **Upload Files**: Commit template files
4. **Documentation**: Add README and documentation
5. **Share URL**: Provide repository URL to others

#### **Template Format**
```json
{
  "id": "custom-template",
  "name": "Custom Monitoring Dashboard",
  "description": "Custom template for specific monitoring needs",
  "category": "custom",
  "tags": ["custom", "monitoring"],
  "config": {
    "panels": [...],
    "variables": [...],
    "annotations": [...],
    "refresh": "30s",
    "timeRange": {
      "from": "now-1h",
      "to": "now"
    }
  },
  "metrics": ["custom_metric_total"],
  "requirements": ["Custom Exporter"],
  "difficulty": "intermediate",
  "estimatedSetupTime": "15 minutes",
  "author": "Your Name",
  "version": "1.0.0",
  "lastUpdated": "2024-01-01T00:00:00Z"
}
```

## Sharing Templates

### Share Options

#### **Internal Sharing**
- **Team Access**: Share with team members
- **Organization**: Share across organization
- **Permissions**: Control read/write access

#### **Public Sharing**
- **Template Marketplace**: Submit to public marketplace
- **GitHub Repository**: Share via GitHub
- **Export/Import**: Manual template sharing

### Template Documentation

#### **Required Documentation**
- **Setup Instructions**: Step-by-step setup guide
- **Prerequisites**: Required software and configurations
- **Metrics**: List of required metrics
- **Troubleshooting**: Common issues and solutions

#### **Example Documentation**
```markdown
# Kubernetes Cluster Overview Template

## Description
Comprehensive monitoring dashboard for Kubernetes clusters.

## Prerequisites
- Prometheus server
- Kubernetes cluster
- Node Exporter
- cAdvisor

## Setup Instructions
1. Install Prometheus
2. Configure Kubernetes service discovery
3. Import this template
4. Configure data sources

## Required Metrics
- container_cpu_usage_seconds_total
- container_memory_working_set_bytes
- kube_pod_status_phase

## Troubleshooting
- Ensure all required exporters are running
- Check Prometheus configuration
- Verify metric availability
```

## Best Practices

### Template Design

#### **Panel Layout**
- **Logical Grouping**: Group related metrics together
- **Visual Hierarchy**: Use size and position for importance
- **Consistent Sizing**: Maintain consistent panel dimensions
- **Responsive Design**: Ensure mobile compatibility

#### **Metric Selection**
- **Relevant Metrics**: Choose metrics that provide actionable insights
- **Performance Impact**: Consider query performance
- **Data Availability**: Ensure metrics are available
- **Documentation**: Document metric purposes

### Template Development

#### **Naming Conventions**
- **Descriptive Names**: Use clear, descriptive names
- **Consistent Formatting**: Follow naming conventions
- **Version Control**: Include version information
- **Tag Usage**: Use relevant tags for searchability

#### **Configuration Management**
- **Variables**: Use variables for flexibility
- **Defaults**: Provide sensible defaults
- **Validation**: Validate configuration inputs
- **Error Handling**: Handle missing data gracefully

### Performance Optimization

#### **Query Optimization**
- **Efficient Queries**: Use optimized Prometheus queries
- **Appropriate Intervals**: Set suitable refresh intervals
- **Data Retention**: Consider data retention policies
- **Caching**: Implement query result caching

#### **Resource Usage**
- **Panel Limits**: Limit number of panels per dashboard
- **Query Complexity**: Keep queries simple and efficient
- **Refresh Rates**: Use appropriate refresh intervals
- **Memory Usage**: Monitor memory consumption

## Troubleshooting

### Common Issues

#### **Template Import Failures**
- **Invalid Format**: Check template JSON structure
- **Missing Fields**: Ensure all required fields are present
- **Version Compatibility**: Verify template version compatibility
- **Network Issues**: Check network connectivity

#### **Missing Metrics**
- **Exporter Status**: Verify exporter is running
- **Prometheus Configuration**: Check Prometheus configuration
- **Metric Names**: Verify metric names are correct
- **Service Discovery**: Ensure service discovery is working

#### **Dashboard Rendering Issues**
- **Data Source**: Verify data source configuration
- **Query Syntax**: Check Prometheus query syntax
- **Time Range**: Ensure appropriate time range
- **Permissions**: Check data source permissions

### Debug Mode

Enable debug mode for detailed logging:

```typescript
// Enable debug logging
const debugMode = process.env.NODE_ENV === 'development'

if (debugMode) {
  console.log('Template import debug info:', {
    template: templateData,
    validation: validationResults,
    metrics: availableMetrics
  })
}
```

### Logs and Monitoring

#### **Application Logs**
- **Import Logs**: Track template import process
- **Error Logs**: Monitor for import errors
- **Performance Logs**: Track import performance
- **Usage Logs**: Monitor template usage

#### **Template Health**
- **Metric Availability**: Monitor metric availability
- **Query Performance**: Track query execution times
- **Error Rates**: Monitor query error rates
- **User Feedback**: Collect user feedback

## API Reference

### Template Import Service

```typescript
class TemplateImportService {
  static async importFromGitHub(url: string): Promise<GitHubImportResult>
  static async importFromFile(file: File): Promise<ImportResult>
  static async validateTemplate(template: DashboardTemplate): Promise<ValidationResult>
  static async exportTemplate(template: DashboardTemplate): Promise<ExportResult>
}

interface GitHubImportResult {
  success: boolean
  template?: DashboardTemplate
  error?: string
  warnings?: string[]
}
```

### Template Manager

```typescript
interface TemplateManager {
  importTemplate(template: DashboardTemplate): Promise<void>
  exportTemplate(templateId: string): Promise<DashboardTemplate>
  deleteTemplate(templateId: string): Promise<void>
  shareTemplate(templateId: string, options: ShareOptions): Promise<string>
  getTemplates(filters?: TemplateFilters): Promise<DashboardTemplate[]>
  getTemplate(templateId: string): Promise<DashboardTemplate>
}
```

### Template Validation

```typescript
interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
}

interface ValidationError {
  field: string
  message: string
  code: string
}

interface ValidationWarning {
  field: string
  message: string
  suggestion?: string
}
```

## Advanced Features

### Template Versioning

#### **Version Management**
- **Semantic Versioning**: Use semantic version numbers
- **Change Tracking**: Track template changes
- **Backward Compatibility**: Maintain compatibility
- **Migration Scripts**: Provide migration utilities

#### **Version History**
```typescript
interface TemplateVersion {
  version: string
  changes: string[]
  breakingChanges: boolean
  migrationGuide?: string
  releaseDate: string
}
```

### Template Marketplace

#### **Community Templates**
- **User Submissions**: Community-contributed templates
- **Quality Control**: Template review process
- **Rating System**: User ratings and reviews
- **Featured Templates**: Highlighted templates

#### **Template Categories**
- **Official**: Officially supported templates
- **Community**: Community-contributed templates
- **Experimental**: Beta and experimental templates
- **Deprecated**: Outdated templates

### Integration APIs

#### **External Integrations**
- **Grafana**: Import Grafana dashboards
- **Prometheus**: Direct Prometheus integration
- **Kubernetes**: Kubernetes-native templates
- **Cloud Providers**: Cloud-specific templates

#### **Custom Data Sources**
```typescript
interface CustomDataSource {
  type: string
  name: string
  url: string
  authentication?: AuthenticationConfig
  customQueries?: QueryTemplate[]
}
```

---

*This guide covers the complete dashboard template management system. For specific template configurations or advanced usage, refer to the individual template documentation or contact the development team.*
