import { serviceConfigManager, isBrowser } from './service-config';

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

/** Shape returned by GET /api/health. */
interface HealthApiResponse {
  upstreamStatus: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  services: Array<{
    key: string;
    name: string;
    description: string;
    status: 'up' | 'down' | 'disabled';
    responseTime: number;
    url?: string;
    publicUrl?: string;
    endpoint?: string;
    error?: string;
  }>;
}

/**
 * Client-side view of stack health.
 *
 * Probing happens on the server (see `lib/server/health.ts`) and is exposed via
 * `/api/health`. The browser cannot probe the services itself: in Docker the
 * upstream hostnames are container-internal, and the requests would be
 * cross-origin.
 */
export class HealthAPI {
  private async fetchReport(): Promise<HealthApiResponse> {
    if (!isBrowser()) {
      throw new Error(
        'HealthAPI is browser-only; call collectHealth() from lib/server/health on the server.'
      );
    }

    const response = await fetch('/api/health', {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Health check failed with HTTP ${response.status}`);
    }

    return (await response.json()) as HealthApiResponse;
  }

  /**
   * Check health of all services
   */
  async checkAllServices(): Promise<HealthCheckResult> {
    const report = await this.fetchReport();
    const lastUpdated = report.timestamp ? new Date(report.timestamp) : new Date();

    const services: ServiceHealth[] = (report.services ?? [])
      // "disabled" has no equivalent in the UI model and is not actionable.
      .filter((service) => service.status !== 'disabled')
      .map((service) => ({
        name: service.name,
        url: service.publicUrl || service.url || '',
        status: service.status === 'up' ? 'up' : 'down',
        responseTime: service.responseTime,
        lastChecked: lastUpdated,
        error: service.error,
        endpoint: service.endpoint ?? '',
        description: service.description,
      }));

    return {
      services,
      overallStatus: report.upstreamStatus ?? 'unhealthy',
      lastUpdated,
    };
  }

  /**
   * Check health of a specific service
   */
  async checkService(serviceName: string): Promise<ServiceHealth> {
    const { services } = await this.checkAllServices();
    const service = services.find((s) => s.name === serviceName);

    if (!service) {
      throw new Error(`Service ${serviceName} not found`);
    }

    return service;
  }

  /**
   * Get service URLs for quick links
   */
  getServiceUrls(): Record<string, string> {
    const configs = serviceConfigManager.getAllConfigs();
    const urls: Record<string, string> = {
      'Prometheus': configs.prometheus.publicUrl,
      'Grafana': configs.grafana.publicUrl,
      'Loki': configs.loki.publicUrl,
      'Alertmanager': configs.alertmanager.publicUrl,
    };

    if (configs.nodeExporter?.enabled) {
      urls['Node Exporter'] = configs.nodeExporter.publicUrl;
    }

    if (configs.cadvisor?.enabled) {
      urls['cAdvisor'] = configs.cadvisor.publicUrl;
    }

    if (configs.blackbox?.enabled) {
      urls['Blackbox Exporter'] = configs.blackbox.publicUrl;
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
        url: configs.grafana.publicUrl,
        description: 'Open Grafana dashboards',
        icon: '📊'
      },
      {
        name: 'Prometheus',
        url: configs.prometheus.publicUrl,
        description: 'Open Prometheus query interface',
        icon: '🔍'
      },
      {
        name: 'Alertmanager',
        url: configs.alertmanager.publicUrl,
        description: 'Open Alertmanager web UI',
        icon: '🚨'
      },
      {
        name: 'Loki',
        url: configs.loki.publicUrl,
        description: 'Open Loki query interface',
        icon: '📝'
      }
    ];

    if (configs.nodeExporter?.enabled) {
      links.push({
        name: 'Node Exporter',
        url: configs.nodeExporter.publicUrl,
        description: 'Open Node Exporter metrics',
        icon: '📈'
      });
    }

    if (configs.cadvisor?.enabled) {
      links.push({
        name: 'cAdvisor',
        url: configs.cadvisor.publicUrl,
        description: 'Open cAdvisor container metrics',
        icon: '🐳'
      });
    }

    if (configs.blackbox?.enabled) {
      links.push({
        name: 'Blackbox Exporter',
        url: configs.blackbox.publicUrl,
        description: 'Open Blackbox Exporter probe status',
        icon: '🛰️'
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
        return 'text-foreground';
      case 'down':
        return 'text-foreground';
      case 'checking':
        return 'text-foreground';
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
        return 'text-foreground';
      case 'degraded':
        return 'text-foreground';
      case 'unhealthy':
        return 'text-foreground';
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
