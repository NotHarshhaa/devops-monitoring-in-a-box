// Configuration types for the DevOps Monitoring System

// Site Configuration Types
export interface SiteConfig {
  // Basic Site Information
  name: string;
  description: string;
  url: string;
  version: string;
  
  // SEO Configuration
  seo: {
    title: string;
    description: string;
    keywords: string[];
    author: string;
    robots: string;
    canonical: string;
    og: {
      title: string;
      description: string;
      type: string;
      image: string;
      url: string;
      site_name: string;
    };
    twitter: {
      card: string;
      site: string;
      creator: string;
      title: string;
      description: string;
      image: string;
    };
  };
  
  // Branding Configuration
  branding: {
    logo: {
      light: string;
      dark: string;
      favicon: string;
      apple_touch_icon: string;
    };
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      surface: string;
    };
    fonts: {
      primary: string;
      secondary: string;
    };
  };
  
  // Contact Information
  contact: {
    email: string;
    phone?: string;
    address?: string;
    social: {
      twitter?: string;
      linkedin?: string;
      github?: string;
      discord?: string;
    };
  };
  
  // Company Information
  company: {
    name: string;
    description: string;
    founded?: string;
    location?: string;
  };
  
  // Legal Information
  legal: {
    privacy_policy_url?: string;
    terms_of_service_url?: string;
    cookie_policy_url?: string;
    copyright: string;
  };
  
  // Feature Flags
  features: {
    analytics: boolean;
    notifications: boolean;
    multi_tenant: boolean;
    plugins: boolean;
    api_docs: boolean;
  };
}

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

export interface NotificationChannelConfig {
  enabled?: boolean;
  webhook_url?: string;
  default_channel?: string;
  username?: string;
  icon_emoji?: string;
  avatar_url?: string;
  title?: string;
  smtp?: {
    host?: string;
    port?: number;
    secure?: boolean;
    auth?: {
      user?: string;
      pass?: string;
    };
  };
  from?: string;
  to?: string[];
  endpoints?: Array<{
    name?: string;
    url?: string;
    headers?: Record<string, string>;
    timeout?: number;
  }>;
}

export interface NotificationsConfig {
  enabled?: boolean;
  channels?: {
    slack?: NotificationChannelConfig;
    teams?: NotificationChannelConfig;
    discord?: NotificationChannelConfig;
    email?: NotificationChannelConfig;
    webhook?: NotificationChannelConfig;
  };
}

export interface MonitoringConfig {
  dashboard: DashboardConfig;
  metrics: MetricConfig[];
  logs: LogsConfig;
  alerts: AlertsConfig;
  services?: ServicesConfig;
  notifications?: NotificationsConfig;
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
  type: 'dashboard' | 'metrics' | 'logs' | 'alerts' | 'services' | 'notifications';
  data: Partial<MonitoringConfig>;
}

// Default configuration
export const DEFAULT_CONFIG: MonitoringConfig = {
  dashboard: {
    refresh_interval: '15s',
    title: 'Monitoring in a Box',
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
  notifications: {
    enabled: true,
    channels: {
      slack: {
        enabled: false,
        webhook_url: '',
        default_channel: '#alerts',
        username: 'Monitoring in a Box',
        icon_emoji: ':bell:',
      },
      teams: {
        enabled: false,
        webhook_url: '',
        title: 'Monitoring in a Box Alert',
      },
      discord: {
        enabled: false,
        webhook_url: '',
        username: 'Monitoring in a Box',
        avatar_url: '',
      },
      email: {
        enabled: false,
        smtp: {
          host: 'localhost',
          port: 587,
          secure: false,
          auth: {
            user: '',
            pass: '',
          },
        },
        from: 'alerts@monitoringinabox.local',
        to: ['admin@monitoringinabox.local'],
      },
      webhook: {
        enabled: false,
        endpoints: [],
      },
    },
  },
  version: '1.0.0',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};
