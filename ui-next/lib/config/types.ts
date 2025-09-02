// Configuration types for the DevOps Monitoring System

export interface DashboardConfig {
  refresh_interval?: string;
  title?: string;
  description?: string;
  theme?: 'light' | 'dark' | 'system';
}

export interface MetricConfig {
  name: string;
  query: string;
  unit?: string;
  chart?: 'line' | 'area' | 'bar' | 'stacked' | 'composed';
  description?: string;
  thresholds?: {
    warning?: number;
    critical?: number;
  };
  color?: string;
  enabled?: boolean;
  group?: string;
}

export interface LogsConfig {
  default_query?: string;
  limit?: number;
  time_range?: string;
  refresh_interval?: string;
  filters?: {
    jobs?: string[];
    namespaces?: string[];
    severity_levels?: string[];
  };
}

export interface AlertsConfig {
  severity_levels?: string[];
  refresh_interval?: string;
  filters?: {
    services?: string[];
    statuses?: string[];
  };
}

export interface ServicesConfig {
  prometheus?: {
    url?: string;
    enabled?: boolean;
  };
  grafana?: {
    url?: string;
    enabled?: boolean;
  };
  loki?: {
    url?: string;
    enabled?: boolean;
  };
  alertmanager?: {
    url?: string;
    enabled?: boolean;
  };
}

export interface MonitoringConfig {
  dashboard: DashboardConfig;
  metrics: MetricConfig[];
  logs: LogsConfig;
  alerts: AlertsConfig;
  services?: ServicesConfig;
  version?: string;
  created_at?: string;
  updated_at?: string;
}

// Configuration validation schemas
export interface ConfigValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// Configuration update types
export interface ConfigUpdate {
  type: 'dashboard' | 'metrics' | 'logs' | 'alerts' | 'services';
  data: Partial<MonitoringConfig>;
}

// Default configuration
export const DEFAULT_CONFIG: MonitoringConfig = {
  dashboard: {
    refresh_interval: '15s',
    title: 'DevOps Monitor',
    description: 'System monitoring dashboard',
    theme: 'system',
  },
  metrics: [
    {
      name: 'CPU Usage',
      query: '100 - (avg by(instance)(irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)',
      unit: '%',
      chart: 'line',
      description: 'Current CPU utilization across all instances',
      thresholds: {
        warning: 70,
        critical: 85,
      },
      color: '#3b82f6',
      enabled: true,
      group: 'System',
    },
    {
      name: 'Memory Usage',
      query: '(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100',
      unit: '%',
      chart: 'line',
      description: 'Current memory utilization',
      thresholds: {
        warning: 80,
        critical: 90,
      },
      color: '#10b981',
      enabled: true,
      group: 'System',
    },
    {
      name: 'Disk Usage',
      query: '100 - ((node_filesystem_avail_bytes * 100) / node_filesystem_size_bytes)',
      unit: '%',
      chart: 'line',
      description: 'Current disk utilization',
      thresholds: {
        warning: 80,
        critical: 90,
      },
      color: '#f59e0b',
      enabled: true,
      group: 'System',
    },
    {
      name: 'Network Traffic',
      query: 'rate(node_network_receive_bytes_total[5m]) + rate(node_network_transmit_bytes_total[5m])',
      unit: 'bytes/s',
      chart: 'area',
      description: 'Network traffic (inbound + outbound)',
      color: '#8b5cf6',
      enabled: true,
      group: 'Network',
    },
  ],
  logs: {
    default_query: '{job="varlogs"}',
    limit: 100,
    time_range: '1h',
    refresh_interval: '10s',
    filters: {
      jobs: [],
      namespaces: [],
      severity_levels: ['error', 'warning', 'info'],
    },
  },
  alerts: {
    severity_levels: ['critical', 'warning', 'info'],
    refresh_interval: '5s',
    filters: {
      services: [],
      statuses: ['firing', 'resolved'],
    },
  },
  services: {
    prometheus: {
      url: 'http://localhost:9090',
      enabled: true,
    },
    grafana: {
      url: 'http://localhost:3000',
      enabled: true,
    },
    loki: {
      url: 'http://localhost:3100',
      enabled: true,
    },
    alertmanager: {
      url: 'http://localhost:9093',
      enabled: true,
    },
  },
  version: '1.0.0',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};
