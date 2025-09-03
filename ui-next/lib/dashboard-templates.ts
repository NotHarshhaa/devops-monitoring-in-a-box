export interface DashboardTemplate {
  id: string
  name: string
  description: string
  category: 'kubernetes' | 'database' | 'web-server' | 'system' | 'custom'
  tags: string[]
  thumbnail: string
  config: {
    panels: any[]
    variables: any[]
    annotations: any[]
    refresh: string
    timeRange: {
      from: string
      to: string
    }
  }
  metrics: string[]
  requirements: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedSetupTime: string
  author: string
  version: string
  lastUpdated: string
}

export const dashboardTemplates: DashboardTemplate[] = [
  {
    id: 'kubernetes-cluster-overview',
    name: 'Kubernetes Cluster Overview',
    description: 'Comprehensive monitoring dashboard for Kubernetes clusters including pods, nodes, and resource utilization.',
    category: 'kubernetes',
    tags: ['kubernetes', 'pods', 'nodes', 'resources', 'cluster'],
    thumbnail: '/templates/kubernetes-overview.png',
    config: {
      panels: [
        {
          id: 1,
          title: 'Cluster CPU Usage',
          type: 'stat',
          targets: [
            {
              expr: 'sum(rate(container_cpu_usage_seconds_total{container!="POD",container!=""}[5m])) / sum(machine_cpu_cores) * 100',
              legendFormat: 'CPU Usage %'
            }
          ],
          gridPos: { h: 8, w: 6, x: 0, y: 0 }
        },
        {
          id: 2,
          title: 'Cluster Memory Usage',
          type: 'stat',
          targets: [
            {
              expr: 'sum(container_memory_working_set_bytes{container!="POD",container!=""}) / sum(machine_memory_bytes) * 100',
              legendFormat: 'Memory Usage %'
            }
          ],
          gridPos: { h: 8, w: 6, x: 6, y: 0 }
        },
        {
          id: 3,
          title: 'Pod Status',
          type: 'table',
          targets: [
            {
              expr: 'kube_pod_status_phase',
              legendFormat: '{{namespace}}/{{pod}}'
            }
          ],
          gridPos: { h: 8, w: 12, x: 12, y: 0 }
        }
      ],
      variables: [
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
      ],
      annotations: [],
      refresh: '30s',
      timeRange: {
        from: 'now-1h',
        to: 'now'
      }
    },
    metrics: [
      'container_cpu_usage_seconds_total',
      'container_memory_working_set_bytes',
      'kube_pod_status_phase',
      'kube_node_status_condition'
    ],
    requirements: [
      'kube-state-metrics',
      'cAdvisor',
      'kubelet metrics'
    ],
    difficulty: 'intermediate',
    estimatedSetupTime: '15-30 minutes',
    author: 'DevOps Monitoring Team',
    version: '1.0.0',
    lastUpdated: '2024-01-15'
  },
  {
    id: 'mysql-postgresql-database',
    name: 'MySQL/PostgreSQL Database Monitoring',
    description: 'Database performance monitoring including connections, queries, and resource usage.',
    category: 'database',
    tags: ['mysql', 'postgresql', 'database', 'performance', 'queries'],
    thumbnail: '/templates/database-monitoring.png',
    config: {
      panels: [
        {
          id: 1,
          title: 'Active Connections',
          type: 'graph',
          targets: [
            {
              expr: 'mysql_global_status_threads_connected',
              legendFormat: 'MySQL Connections'
            },
            {
              expr: 'pg_stat_database_numbackends',
              legendFormat: 'PostgreSQL Connections'
            }
          ],
          gridPos: { h: 8, w: 12, x: 0, y: 0 }
        },
        {
          id: 2,
          title: 'Query Performance',
          type: 'graph',
          targets: [
            {
              expr: 'rate(mysql_global_status_queries[5m])',
              legendFormat: 'MySQL QPS'
            },
            {
              expr: 'rate(pg_stat_database_tup_returned[5m])',
              legendFormat: 'PostgreSQL QPS'
            }
          ],
          gridPos: { h: 8, w: 12, x: 12, y: 0 }
        }
      ],
      variables: [
        {
          name: 'database',
          type: 'query',
          query: 'label_values(mysql_up, instance)',
          current: { value: 'All', text: 'All' }
        }
      ],
      annotations: [],
      refresh: '30s',
      timeRange: {
        from: 'now-1h',
        to: 'now'
      }
    },
    metrics: [
      'mysql_global_status_threads_connected',
      'mysql_global_status_queries',
      'pg_stat_database_numbackends',
      'pg_stat_database_tup_returned'
    ],
    requirements: [
      'MySQL Exporter',
      'PostgreSQL Exporter'
    ],
    difficulty: 'beginner',
    estimatedSetupTime: '10-20 minutes',
    author: 'DevOps Monitoring Team',
    version: '1.0.0',
    lastUpdated: '2024-01-15'
  },
  {
    id: 'nginx-apache-webserver',
    name: 'Nginx/Apache Web Server Monitoring',
    description: 'Web server performance monitoring including requests, response times, and error rates.',
    category: 'web-server',
    tags: ['nginx', 'apache', 'webserver', 'http', 'performance'],
    thumbnail: '/templates/webserver-monitoring.png',
    config: {
      panels: [
        {
          id: 1,
          title: 'Request Rate',
          type: 'graph',
          targets: [
            {
              expr: 'rate(nginx_http_requests_total[5m])',
              legendFormat: 'Nginx RPS'
            },
            {
              expr: 'rate(apache_accesses_total[5m])',
              legendFormat: 'Apache RPS'
            }
          ],
          gridPos: { h: 8, w: 12, x: 0, y: 0 }
        },
        {
          id: 2,
          title: 'Response Time',
          type: 'graph',
          targets: [
            {
              expr: 'histogram_quantile(0.95, rate(nginx_http_request_duration_seconds_bucket[5m]))',
              legendFormat: 'Nginx 95th percentile'
            }
          ],
          gridPos: { h: 8, w: 12, x: 12, y: 0 }
        }
      ],
      variables: [
        {
          name: 'server',
          type: 'query',
          query: 'label_values(nginx_up, instance)',
          current: { value: 'All', text: 'All' }
        }
      ],
      annotations: [],
      refresh: '30s',
      timeRange: {
        from: 'now-1h',
        to: 'now'
      }
    },
    metrics: [
      'nginx_http_requests_total',
      'nginx_http_request_duration_seconds',
      'apache_accesses_total',
      'apache_workers'
    ],
    requirements: [
      'Nginx Exporter',
      'Apache Exporter'
    ],
    difficulty: 'beginner',
    estimatedSetupTime: '10-15 minutes',
    author: 'DevOps Monitoring Team',
    version: '1.0.0',
    lastUpdated: '2024-01-15'
  },
  {
    id: 'node-exporter-basics',
    name: 'Node Exporter System Basics',
    description: 'Essential system monitoring with CPU, memory, disk, and network metrics.',
    category: 'system',
    tags: ['node-exporter', 'system', 'cpu', 'memory', 'disk', 'network'],
    thumbnail: '/templates/node-exporter.png',
    config: {
      panels: [
        {
          id: 1,
          title: 'CPU Usage',
          type: 'graph',
          targets: [
            {
              expr: '100 - (avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)',
              legendFormat: 'CPU Usage %'
            }
          ],
          gridPos: { h: 8, w: 6, x: 0, y: 0 }
        },
        {
          id: 2,
          title: 'Memory Usage',
          type: 'graph',
          targets: [
            {
              expr: '(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100',
              legendFormat: 'Memory Usage %'
            }
          ],
          gridPos: { h: 8, w: 6, x: 6, y: 0 }
        },
        {
          id: 3,
          title: 'Disk Usage',
          type: 'graph',
          targets: [
            {
              expr: '100 - ((node_filesystem_avail_bytes * 100) / node_filesystem_size_bytes)',
              legendFormat: 'Disk Usage %'
            }
          ],
          gridPos: { h: 8, w: 6, x: 12, y: 0 }
        },
        {
          id: 4,
          title: 'Network Traffic',
          type: 'graph',
          targets: [
            {
              expr: 'rate(node_network_receive_bytes_total[5m])',
              legendFormat: 'Receive {{device}}'
            },
            {
              expr: 'rate(node_network_transmit_bytes_total[5m])',
              legendFormat: 'Transmit {{device}}'
            }
          ],
          gridPos: { h: 8, w: 6, x: 18, y: 0 }
        }
      ],
      variables: [
        {
          name: 'instance',
          type: 'query',
          query: 'label_values(node_uname_info, instance)',
          current: { value: 'All', text: 'All' }
        }
      ],
      annotations: [],
      refresh: '30s',
      timeRange: {
        from: 'now-1h',
        to: 'now'
      }
    },
    metrics: [
      'node_cpu_seconds_total',
      'node_memory_MemAvailable_bytes',
      'node_memory_MemTotal_bytes',
      'node_filesystem_avail_bytes',
      'node_filesystem_size_bytes',
      'node_network_receive_bytes_total',
      'node_network_transmit_bytes_total'
    ],
    requirements: [
      'Node Exporter'
    ],
    difficulty: 'beginner',
    estimatedSetupTime: '5-10 minutes',
    author: 'DevOps Monitoring Team',
    version: '1.0.0',
    lastUpdated: '2024-01-15'
  }
]

export const getTemplatesByCategory = (category: string) => {
  return dashboardTemplates.filter(template => template.category === category)
}

export const getTemplateById = (id: string) => {
  return dashboardTemplates.find(template => template.id === id)
}

export const searchTemplates = (query: string) => {
  const lowercaseQuery = query.toLowerCase()
  return dashboardTemplates.filter(template => 
    template.name.toLowerCase().includes(lowercaseQuery) ||
    template.description.toLowerCase().includes(lowercaseQuery) ||
    template.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  )
}
