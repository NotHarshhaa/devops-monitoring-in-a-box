// Multi-tenant configuration management system

import { 
  MonitoringConfig, 
  ConfigValidationResult, 
  ConfigUpdate,
  DEFAULT_CONFIG 
} from './types';
import { ConfigParser } from './parser';

export class MultiTenantConfigManager {
  private configs: Map<string, MonitoringConfig> = new Map();
  private listeners: Map<string, Array<(config: MonitoringConfig) => void>> = new Map();

  constructor() {
    // Initialize with default config
    this.configs.set('default', DEFAULT_CONFIG);
  }

  /**
   * Get configuration for a specific user
   */
  getConfig(userId: string): MonitoringConfig {
    return this.configs.get(userId) || { ...DEFAULT_CONFIG };
  }

  /**
   * Update configuration for a specific user
   */
  updateConfig(userId: string, update: ConfigUpdate): ConfigValidationResult {
    try {
      const currentConfig = this.getConfig(userId);
      const newConfig = this.applyUpdate(currentConfig, update);
      const validation = ConfigParser.validateConfig(newConfig);
      
      if (validation.valid) {
        this.configs.set(userId, newConfig);
        this.notifyListeners(userId, newConfig);
      }
      
      return validation;
    } catch (error) {
      return {
        valid: false,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        warnings: [],
      };
    }
  }

  /**
   * Load configuration from JSON for a specific user
   */
  loadFromJson(userId: string, jsonString: string): ConfigValidationResult {
    try {
      const config = ConfigParser.parseConfig(jsonString);
      const validation = ConfigParser.validateConfig(config);
      
      if (validation.valid) {
        this.configs.set(userId, config);
        this.notifyListeners(userId, config);
      }
      
      return validation;
    } catch (error) {
      return {
        valid: false,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        warnings: [],
      };
    }
  }

  /**
   * Load configuration from object for a specific user
   */
  loadFromObject(userId: string, configObject: any): ConfigValidationResult {
    try {
      const config = ConfigParser.parseConfig(JSON.stringify(configObject));
      const validation = ConfigParser.validateConfig(config);
      
      if (validation.valid) {
        this.configs.set(userId, config);
        this.notifyListeners(userId, config);
      }
      
      return validation;
    } catch (error) {
      return {
        valid: false,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        warnings: [],
      };
    }
  }

  /**
   * Export configuration to JSON for a specific user
   */
  exportToJson(userId: string): string {
    const config = this.getConfig(userId);
    return JSON.stringify(config, null, 2);
  }

  /**
   * Reset configuration to default for a specific user
   */
  resetToDefault(userId: string): void {
    this.configs.set(userId, { ...DEFAULT_CONFIG });
    this.notifyListeners(userId, this.getConfig(userId));
  }

  /**
   * Get specific configuration sections for a user
   */
  getDashboardConfig(userId: string) {
    return this.getConfig(userId).dashboard;
  }

  getMetricsConfig(userId: string) {
    return this.getConfig(userId).metrics || [];
  }

  getLogsConfig(userId: string) {
    return this.getConfig(userId).logs;
  }

  getAlertsConfig(userId: string) {
    return this.getConfig(userId).alerts;
  }

  getServicesConfig(userId: string) {
    return this.getConfig(userId).services;
  }

  /**
   * Get refresh interval for a user
   */
  getRefreshInterval(userId: string): number {
    const dashboardConfig = this.getDashboardConfig(userId);
    return ConfigParser.parseRefreshInterval(dashboardConfig?.refresh_interval || '15s');
  }

  /**
   * Get metrics grouped by category for a user
   */
  getMetricsByGroup(userId: string): Record<string, any[]> {
    const metrics = this.getMetricsConfig(userId);
    return metrics.reduce((acc, metric) => {
      const group = metric.group || 'Uncategorized';
      if (!acc[group]) {
        acc[group] = [];
      }
      acc[group].push(metric);
      return acc;
    }, {} as Record<string, any[]>);
  }

  /**
   * Get enabled services for a user
   */
  getEnabledServices(userId: string): any[] {
    const servicesConfig = this.getServicesConfig(userId);
    if (!servicesConfig) return [];
    
    const services = [];
    if (servicesConfig.prometheus?.enabled) services.push({ name: 'prometheus', ...servicesConfig.prometheus });
    if (servicesConfig.grafana?.enabled) services.push({ name: 'grafana', ...servicesConfig.grafana });
    if (servicesConfig.loki?.enabled) services.push({ name: 'loki', ...servicesConfig.loki });
    if (servicesConfig.alertmanager?.enabled) services.push({ name: 'alertmanager', ...servicesConfig.alertmanager });
    
    return services;
  }

  /**
   * Get configuration summary for a user
   */
  getConfigSummary(userId: string) {
    const config = this.getConfig(userId);
    const metrics = this.getMetricsConfig(userId);
    const services = this.getEnabledServices(userId);
    const groups = Object.keys(this.getMetricsByGroup(userId));

    return {
      version: config.version || '1.0.0',
      created_at: config.created_at || new Date().toISOString(),
      updated_at: config.updated_at || new Date().toISOString(),
      dashboard: {
        title: config.dashboard?.title || 'DevOps Monitor',
        refresh_interval: config.dashboard?.refresh_interval || '15s'
      },
      metrics: {
        total: metrics.length,
        enabled: metrics.filter(m => m.enabled !== false).length,
        groups: groups.length
      },
      services: {
        total: services.length,
        enabled: services.length
      },
      logs: {
        default_query: config.logs?.default_query || '{job="varlogs"}',
        limit: config.logs?.limit || 100
      },
      alerts: {
        severity_levels: config.alerts?.severity_levels?.length || 2
      }
    };
  }

  /**
   * Validate current configuration for a user
   */
  validateCurrentConfig(userId: string): ConfigValidationResult {
    const config = this.getConfig(userId);
    return ConfigParser.validateConfig(config);
  }

  /**
   * Subscribe to configuration changes for a user
   */
  addListener(userId: string, listener: (config: MonitoringConfig) => void): () => void {
    if (!this.listeners.has(userId)) {
      this.listeners.set(userId, []);
    }
    
    this.listeners.get(userId)!.push(listener);
    
    // Return unsubscribe function
    return () => {
      const userListeners = this.listeners.get(userId);
      if (userListeners) {
        const index = userListeners.indexOf(listener);
        if (index > -1) {
          userListeners.splice(index, 1);
        }
      }
    };
  }

  /**
   * Apply configuration update
   */
  private applyUpdate(config: MonitoringConfig, update: ConfigUpdate): MonitoringConfig {
    const newConfig = { ...config };

    if (update.data.dashboard) {
      newConfig.dashboard = { ...config.dashboard, ...update.data.dashboard };
    }

    if (update.data.metrics) {
      newConfig.metrics = update.data.metrics;
    }

    if (update.data.logs) {
      newConfig.logs = { ...config.logs, ...update.data.logs };
    }

    if (update.data.alerts) {
      newConfig.alerts = { ...config.alerts, ...update.data.alerts };
    }

    if (update.data.services) {
      newConfig.services = { ...config.services, ...update.data.services };
    }

    if (update.data.notifications) {
      newConfig.notifications = { ...config.notifications, ...update.data.notifications };
    }

    newConfig.updated_at = new Date().toISOString();

    return newConfig;
  }

  /**
   * Notify listeners of configuration changes
   */
  private notifyListeners(userId: string, config: MonitoringConfig): void {
    const userListeners = this.listeners.get(userId);
    if (userListeners) {
      userListeners.forEach(listener => listener(config));
    }
  }

  /**
   * Get all user configurations (for admin purposes)
   */
  getAllConfigs(): Record<string, MonitoringConfig> {
    const result: Record<string, MonitoringConfig> = {};
    this.configs.forEach((config, userId) => {
      result[userId] = config;
    });
    return result;
  }

  /**
   * Delete configuration for a user
   */
  deleteConfig(userId: string): boolean {
    const deleted = this.configs.delete(userId);
    if (deleted) {
      this.listeners.delete(userId);
    }
    return deleted;
  }

  /**
   * Copy configuration from one user to another
   */
  copyConfig(fromUserId: string, toUserId: string): boolean {
    const sourceConfig = this.configs.get(fromUserId);
    if (sourceConfig) {
      this.configs.set(toUserId, { ...sourceConfig });
      this.notifyListeners(toUserId, this.getConfig(toUserId));
      return true;
    }
    return false;
  }
}

// Global instance
export const multiTenantConfigManager = new MultiTenantConfigManager();
