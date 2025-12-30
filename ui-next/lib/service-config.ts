/**
 * Centralized Service Configuration Manager
 * Handles service discovery, connection management, and environment detection
 */

export interface ServiceConfig {
  url: string;
  enabled: boolean;
  timeout: number;
  retries: number;
  retryDelay: number;
  healthCheckEndpoint?: string;
}

export interface ServiceConnectionConfig {
  prometheus: ServiceConfig;
  grafana: ServiceConfig;
  loki: ServiceConfig;
  alertmanager: ServiceConfig;
  nodeExporter?: ServiceConfig;
  cadvisor?: ServiceConfig;
}

/**
 * Detect if we're running in Docker/containerized environment
 */
function isDockerEnvironment(): boolean {
  return (
    process.env.DOCKER_ENV === 'true' ||
    process.env.NODE_ENV === 'production' ||
    !!process.env.VERCEL ||
    !!process.env.KUBERNETES_SERVICE_HOST
  );
}

/**
 * Detect if we're in development mode
 */
function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development' && !isDockerEnvironment();
}

/**
 * Get service URL with environment-aware defaults
 */
function getServiceURL(
  envVar: string | undefined,
  defaultLocal: string,
  defaultDocker: string
): string {
  if (envVar) {
    return envVar;
  }
  return isDockerEnvironment() ? defaultDocker : defaultLocal;
}

/**
 * Centralized service configuration
 */
export const serviceConfig: ServiceConnectionConfig = {
  prometheus: {
    url: getServiceURL(
      process.env.NEXT_PUBLIC_PROMETHEUS_URL,
      'http://localhost:9090',
      'http://prometheus:9090' // Docker service name
    ),
    enabled: process.env.PROMETHEUS_ENABLED !== 'false',
    timeout: parseInt(process.env.PROMETHEUS_TIMEOUT || '30000', 10),
    retries: parseInt(process.env.PROMETHEUS_RETRIES || '3', 10),
    retryDelay: parseInt(process.env.PROMETHEUS_RETRY_DELAY || '1000', 10),
    healthCheckEndpoint: '/api/v1/status/config',
  },
  grafana: {
    url: getServiceURL(
      process.env.NEXT_PUBLIC_GRAFANA_URL,
      'http://localhost:3000',
      'http://grafana:3000' // Docker service name
    ),
    enabled: process.env.GRAFANA_ENABLED !== 'false',
    timeout: parseInt(process.env.GRAFANA_TIMEOUT || '30000', 10),
    retries: parseInt(process.env.GRAFANA_RETRIES || '3', 10),
    retryDelay: parseInt(process.env.GRAFANA_RETRY_DELAY || '1000', 10),
    healthCheckEndpoint: '/api/health',
  },
  loki: {
    url: getServiceURL(
      process.env.NEXT_PUBLIC_LOKI_URL,
      'http://localhost:3100',
      'http://loki:3100' // Docker service name
    ),
    enabled: process.env.LOKI_ENABLED !== 'false',
    timeout: parseInt(process.env.LOKI_TIMEOUT || '30000', 10),
    retries: parseInt(process.env.LOKI_RETRIES || '3', 10),
    retryDelay: parseInt(process.env.LOKI_RETRY_DELAY || '1000', 10),
    healthCheckEndpoint: '/ready',
  },
  alertmanager: {
    url: getServiceURL(
      process.env.NEXT_PUBLIC_ALERTMANAGER_URL,
      'http://localhost:9093',
      'http://alertmanager:9093' // Docker service name
    ),
    enabled: process.env.ALERTMANAGER_ENABLED !== 'false',
    timeout: parseInt(process.env.ALERTMANAGER_TIMEOUT || '30000', 10),
    retries: parseInt(process.env.ALERTMANAGER_RETRIES || '3', 10),
    retryDelay: parseInt(process.env.ALERTMANAGER_RETRY_DELAY || '1000', 10),
    healthCheckEndpoint: '/api/v2/status',
  },
  nodeExporter: {
    url: getServiceURL(
      process.env.NEXT_PUBLIC_NODE_EXPORTER_URL,
      'http://localhost:9100',
      'http://node-exporter:9100'
    ),
    enabled: process.env.NODE_EXPORTER_ENABLED === 'true',
    timeout: 10000,
    retries: 2,
    retryDelay: 500,
    healthCheckEndpoint: '/metrics',
  },
  cadvisor: {
    url: getServiceURL(
      process.env.NEXT_PUBLIC_CADVISOR_URL,
      'http://localhost:8080',
      'http://cadvisor:8080'
    ),
    enabled: process.env.CADVISOR_ENABLED === 'true',
    timeout: 10000,
    retries: 2,
    retryDelay: 500,
    healthCheckEndpoint: '/healthz',
  },
};

/**
 * Service Configuration Manager
 */
export class ServiceConfigManager {
  private static instance: ServiceConfigManager;
  private config: ServiceConnectionConfig;
  private connectionCache: Map<string, { connected: boolean; lastCheck: number }> = new Map();
  private readonly CACHE_TTL = 60000; // 1 minute cache

  private constructor() {
    this.config = serviceConfig;
    this.initializeCache();
  }

  public static getInstance(): ServiceConfigManager {
    if (!ServiceConfigManager.instance) {
      ServiceConfigManager.instance = new ServiceConfigManager();
    }
    return ServiceConfigManager.instance;
  }

  private initializeCache(): void {
    Object.keys(this.config).forEach((serviceName) => {
      this.connectionCache.set(serviceName, {
        connected: false,
        lastCheck: 0,
      });
    });
  }

  /**
   * Get configuration for a specific service
   */
  public getServiceConfig(serviceName: keyof ServiceConnectionConfig): ServiceConfig {
    const config = this.config[serviceName];
    if (!config) {
      throw new Error(`Service configuration not found: ${serviceName}`);
    }
    return config;
  }

  /**
   * Get all service configurations
   */
  public getAllConfigs(): ServiceConnectionConfig {
    return { ...this.config };
  }

  /**
   * Update service configuration dynamically
   */
  public updateServiceConfig(
    serviceName: keyof ServiceConnectionConfig,
    updates: Partial<ServiceConfig>
  ): void {
    const serviceConfig = this.config[serviceName];
    if (serviceConfig) {
      this.config[serviceName] = {
        ...serviceConfig,
        ...updates,
      } as ServiceConfig;
      // Clear cache when config changes
      this.connectionCache.delete(serviceName);
    }
  }

  /**
   * Check if service connection is cached and valid
   */
  public isConnectionCached(serviceName: string): boolean {
    const cached = this.connectionCache.get(serviceName);
    if (!cached) return false;
    return Date.now() - cached.lastCheck < this.CACHE_TTL;
  }

  /**
   * Update connection cache
   */
  public updateConnectionCache(serviceName: string, connected: boolean): void {
    this.connectionCache.set(serviceName, {
      connected,
      lastCheck: Date.now(),
    });
  }

  /**
   * Get cached connection status
   */
  public getCachedConnectionStatus(serviceName: string): boolean | null {
    if (!this.isConnectionCached(serviceName)) {
      return null;
    }
    return this.connectionCache.get(serviceName)?.connected ?? null;
  }

  /**
   * Clear connection cache for a service
   */
  public clearConnectionCache(serviceName?: string): void {
    if (serviceName) {
      this.connectionCache.delete(serviceName);
    } else {
      this.initializeCache();
    }
  }

  /**
   * Get environment information
   */
  public getEnvironmentInfo(): {
    isDocker: boolean;
    isDevelopment: boolean;
    isProduction: boolean;
  } {
    return {
      isDocker: isDockerEnvironment(),
      isDevelopment: isDevelopment(),
      isProduction: process.env.NODE_ENV === 'production',
    };
  }

  /**
   * Validate all service configurations
   */
  public validateConfigs(): {
    valid: boolean;
    errors: Array<{ service: string; error: string }>;
  } {
    const errors: Array<{ service: string; error: string }> = [];

    Object.entries(this.config).forEach(([serviceName, config]) => {
      if (!config.url) {
        errors.push({ service: serviceName, error: 'URL is required' });
      }
      if (!config.url.startsWith('http://') && !config.url.startsWith('https://')) {
        errors.push({ service: serviceName, error: 'URL must start with http:// or https://' });
      }
      if (config.timeout < 1000) {
        errors.push({ service: serviceName, error: 'Timeout must be at least 1000ms' });
      }
      if (config.retries < 0) {
        errors.push({ service: serviceName, error: 'Retries must be non-negative' });
      }
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

// Export singleton instance
export const serviceConfigManager = ServiceConfigManager.getInstance();

// Export helper functions
export { isDockerEnvironment, isDevelopment };

