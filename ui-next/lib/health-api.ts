import axios from 'axios';
import { serviceConfigManager } from './service-config';

export interface ServiceHealth {
  name: string;
  url: string;
  status: 'up' | 'down' | 'checking';
  responseTime?: number;
  lastChecked: Date;
  error?: string;
  endpoint: string;
  description: string;
}

export interface HealthCheckResult {
  services: ServiceHealth[];
  overallStatus: 'healthy' | 'degraded' | 'unhealthy';
  lastUpdated: Date;
}

export class HealthAPI {
  private services: Array<{
    name: string;
    url: string;
    endpoint: string;
    description: string;
  }> = [];

  constructor() {
    // Initialize services from centralized configuration
    const configs = serviceConfigManager.getAllConfigs();
    
    this.services = [
      {
        name: 'Prometheus',
        url: configs.prometheus.url,
        endpoint: configs.prometheus.healthCheckEndpoint || '/api/v1/status/config',
        description: 'Metrics collection and storage'
      },
      {
        name: 'Grafana',
        url: configs.grafana.url,
        endpoint: configs.grafana.healthCheckEndpoint || '/api/health',
        description: 'Visualization and dashboards'
      },
      {
        name: 'Loki',
        url: configs.loki.url,
        endpoint: configs.loki.healthCheckEndpoint || '/ready',
        description: 'Log aggregation system'
      },
      {
        name: 'Alertmanager',
        url: configs.alertmanager.url,
        endpoint: configs.alertmanager.healthCheckEndpoint || '/api/v2/status',
        description: 'Alert routing and management'
      },
    ];

    // Add optional services if enabled
    if (configs.nodeExporter?.enabled) {
      this.services.push({
        name: 'Node Exporter',
        url: configs.nodeExporter.url,
        endpoint: configs.nodeExporter.healthCheckEndpoint || '/metrics',
        description: 'System metrics collection'
      });
    }

    if (configs.cadvisor?.enabled) {
      this.services.push({
        name: 'cAdvisor',
        url: configs.cadvisor.url,
        endpoint: configs.cadvisor.healthCheckEndpoint || '/healthz',
        description: 'Container metrics collection'
      });
    }
  }

  private async checkServiceHealth(service: {
    name: string;
    url: string;
    endpoint: string;
    description: string;
  }): Promise<ServiceHealth> {
    const startTime = Date.now();
    const healthUrl = `${service.url}${service.endpoint}`;

    try {
      const response = await axios.get(healthUrl, {
        timeout: 5000, // 5 second timeout
        validateStatus: (status) => status < 500, // Accept 2xx, 3xx, 4xx as "up"
      });

      const responseTime = Date.now() - startTime;

      return {
        name: service.name,
        url: service.url,
        status: 'up',
        responseTime,
        lastChecked: new Date(),
        endpoint: service.endpoint,
        description: service.description
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      let errorMessage = 'Unknown error';

      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNREFUSED') {
          errorMessage = 'Connection refused - service may be down';
        } else if (error.code === 'ETIMEDOUT') {
          errorMessage = 'Request timeout - service may be slow or down';
        } else if (error.response) {
          errorMessage = `HTTP ${error.response.status}: ${error.response.statusText}`;
        } else {
          errorMessage = error.message;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      return {
        name: service.name,
        url: service.url,
        status: 'down',
        responseTime,
        lastChecked: new Date(),
        error: errorMessage,
        endpoint: service.endpoint,
        description: service.description
      };
    }
  }

  /**
   * Check health of all services
   */
  async checkAllServices(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    // Check all services in parallel
    const healthPromises = this.services.map(service => 
      this.checkServiceHealth(service)
    );

    const services = await Promise.all(healthPromises);
    const lastUpdated = new Date();

    // Determine overall status
    const upServices = services.filter(s => s.status === 'up').length;
    const totalServices = services.length;
    
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy';
    if (upServices === totalServices) {
      overallStatus = 'healthy';
    } else if (upServices >= totalServices * 0.5) {
      overallStatus = 'degraded';
    } else {
      overallStatus = 'unhealthy';
    }

    return {
      services,
      overallStatus,
      lastUpdated
    };
  }

  /**
   * Check health of a specific service
   */
  async checkService(serviceName: string): Promise<ServiceHealth> {
    const service = this.services.find(s => s.name === serviceName);
    if (!service) {
      throw new Error(`Service ${serviceName} not found`);
    }

    return this.checkServiceHealth(service);
  }

  /**
   * Get service URLs for quick links
   */
  getServiceUrls(): Record<string, string> {
    const configs = serviceConfigManager.getAllConfigs();
    const urls: Record<string, string> = {
      'Prometheus': configs.prometheus.url,
      'Grafana': configs.grafana.url,
      'Loki': configs.loki.url,
      'Alertmanager': configs.alertmanager.url,
    };
    
    if (configs.nodeExporter?.enabled) {
      urls['Node Exporter'] = configs.nodeExporter.url;
    }
    
    if (configs.cadvisor?.enabled) {
      urls['cAdvisor'] = configs.cadvisor.url;
    }
    
    return urls;
  }

  /**
   * Get quick links for external services
   */
  getQuickLinks(): Array<{
    name: string;
    url: string;
    description: string;
    icon: string;
  }> {
    const configs = serviceConfigManager.getAllConfigs();
    const links = [
      {
        name: 'Grafana',
        url: configs.grafana.url,
        description: 'Open Grafana dashboards',
        icon: '📊'
      },
      {
        name: 'Prometheus',
        url: configs.prometheus.url,
        description: 'Open Prometheus query interface',
        icon: '🔍'
      },
      {
        name: 'Alertmanager',
        url: configs.alertmanager.url,
        description: 'Open Alertmanager web UI',
        icon: '🚨'
      },
      {
        name: 'Loki',
        url: configs.loki.url,
        description: 'Open Loki query interface',
        icon: '📝'
      }
    ];
    
    if (configs.nodeExporter?.enabled) {
      links.push({
        name: 'Node Exporter',
        url: configs.nodeExporter.url,
        description: 'Open Node Exporter metrics',
        icon: '📈'
      });
    }
    
    if (configs.cadvisor?.enabled) {
      links.push({
        name: 'cAdvisor',
        url: configs.cadvisor.url,
        description: 'Open cAdvisor container metrics',
        icon: '🐳'
      });
    }
    
    return links;
  }

  /**
   * Format response time for display
   */
  formatResponseTime(responseTime: number): string {
    if (responseTime < 1000) {
      return `${responseTime}ms`;
    } else {
      return `${(responseTime / 1000).toFixed(2)}s`;
    }
  }

  /**
   * Get status icon for service
   */
  getStatusIcon(status: 'up' | 'down' | 'checking'): string {
    switch (status) {
      case 'up':
        return '✅';
      case 'down':
        return '❌';
      case 'checking':
        return '⏳';
      default:
        return '❓';
    }
  }

  /**
   * Get status color for UI
   */
  getStatusColor(status: 'up' | 'down' | 'checking'): string {
    switch (status) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      case 'checking':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  }

  /**
   * Get overall status color
   */
  getOverallStatusColor(status: 'healthy' | 'degraded' | 'unhealthy'): string {
    switch (status) {
      case 'healthy':
        return 'text-green-600';
      case 'degraded':
        return 'text-yellow-600';
      case 'unhealthy':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  }

  /**
   * Get overall status icon
   */
  getOverallStatusIcon(status: 'healthy' | 'degraded' | 'unhealthy'): string {
    switch (status) {
      case 'healthy':
        return '✅';
      case 'degraded':
        return '⚠️';
      case 'unhealthy':
        return '❌';
      default:
        return '❓';
    }
  }
}

export const healthAPI = new HealthAPI();
