// Configuration management system

import { 
  MonitoringConfig, 
  ConfigValidationResult, 
  ConfigUpdate,
  DEFAULT_CONFIG 
} from './types';
import { ConfigParser } from './parser';

export class ConfigManager {
  private config: MonitoringConfig;
  private listeners: Array<(config: MonitoringConfig) => void> = [];

  constructor(initialConfig?: MonitoringConfig) {
    this.config = initialConfig || DEFAULT_CONFIG;
  }

  /**
   * Get current configuration
   */
  getConfig(): MonitoringConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(update: ConfigUpdate): ConfigValidationResult {
    try {
      const newConfig = this.applyUpdate(this.config, update);
      const validation = ConfigParser.validateConfig(newConfig);
      
      if (validation.valid) {
        this.config = newConfig;
        this.config.updated_at = new Date().toISOString();
        this.notifyListeners();
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
   * Load configuration from JSON string
   */
  loadFromJson(jsonString: string): ConfigValidationResult {
    try {
      const newConfig = ConfigParser.parseConfig(jsonString);
      const validation = ConfigParser.validateConfig(newConfig);
      
      if (validation.valid) {
        this.config = newConfig;
        this.notifyListeners();
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
   * Load configuration from object
   */
  loadFromObject(config: any): ConfigValidationResult {
    try {
      const newConfig = ConfigParser.parseConfigFromObject(config);
      const validation = ConfigParser.validateConfig(newConfig);
      
      if (validation.valid) {
        this.config = newConfig;
        this.notifyListeners();
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
   * Export configuration as JSON string
   */
  exportToJson(): string {
    return ConfigParser.configToJson(this.config);
  }

  /**
   * Reset to default configuration
   */
  resetToDefault(): void {
    this.config = { ...DEFAULT_CONFIG };
    this.config.updated_at = new Date().toISOString();
    this.notifyListeners();
  }

  /**
   * Add configuration change listener
   */
  addListener(listener: (config: MonitoringConfig) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Get dashboard configuration
   */
  getDashboardConfig() {
    return this.config.dashboard;
  }

  /**
   * Get metrics configuration
   */
  getMetricsConfig() {
    return this.config.metrics.filter(metric => metric.enabled !== false);
  }

  /**
   * Get logs configuration
   */
  getLogsConfig() {
    return this.config.logs;
  }

  /**
   * Get alerts configuration
   */
  getAlertsConfig() {
    return this.config.alerts;
  }

  /**
   * Get services configuration
   */
  getServicesConfig() {
    return this.config.services;
  }

  /**
   * Get refresh interval in milliseconds
   */
  getRefreshInterval(): number {
    const interval = this.config.dashboard.refresh_interval || '15s';
    return ConfigParser.parseRefreshInterval(interval);
  }

  /**
   * Get metrics by group
   */
  getMetricsByGroup(): Record<string, any[]> {
    const metrics = this.getMetricsConfig();
    const grouped: Record<string, any[]> = {};
    
    metrics.forEach(metric => {
      const group = metric.group || 'Other';
      if (!grouped[group]) {
        grouped[group] = [];
      }
      grouped[group].push(metric);
    });
    
    return grouped;
  }

  /**
   * Get enabled services
   */
  getEnabledServices(): string[] {
    const services = this.config.services;
    if (!services) return [];
    
    return Object.entries(services)
      .filter(([_, config]) => config.enabled !== false)
      .map(([name, _]) => name);
  }

  /**
   * Apply configuration update
   */
  private applyUpdate(config: MonitoringConfig, update: ConfigUpdate): MonitoringConfig {
    const newConfig = { ...config };
    
    switch (update.type) {
      case 'dashboard':
        newConfig.dashboard = { ...config.dashboard, ...update.data.dashboard };
        break;
      case 'metrics':
        if (update.data.metrics) {
          newConfig.metrics = update.data.metrics;
        }
        break;
      case 'logs':
        newConfig.logs = { ...config.logs, ...update.data.logs };
        break;
      case 'alerts':
        newConfig.alerts = { ...config.alerts, ...update.data.alerts };
        break;
      case 'services':
        newConfig.services = { ...config.services, ...update.data.services };
        break;
    }
    
    return newConfig;
  }

  /**
   * Notify all listeners of configuration changes
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.getConfig());
      } catch (error) {
        console.error('Error in configuration listener:', error);
      }
    });
  }

  /**
   * Validate current configuration
   */
  validateCurrentConfig(): ConfigValidationResult {
    return ConfigParser.validateConfig(this.config);
  }

  /**
   * Get configuration summary
   */
  getConfigSummary() {
    const metrics = this.getMetricsConfig();
    const services = this.getEnabledServices();
    
    return {
      version: this.config.version,
      created_at: this.config.created_at,
      updated_at: this.config.updated_at,
      dashboard: {
        title: this.config.dashboard.title,
        refresh_interval: this.config.dashboard.refresh_interval,
      },
      metrics: {
        total: metrics.length,
        enabled: metrics.filter(m => m.enabled !== false).length,
        groups: Object.keys(this.getMetricsByGroup()).length,
      },
      services: {
        total: services.length,
        enabled: services.length,
      },
      logs: {
        default_query: this.config.logs.default_query,
        limit: this.config.logs.limit,
      },
      alerts: {
        severity_levels: this.config.alerts.severity_levels?.length || 0,
      },
    };
  }
}

// Global configuration manager instance
export const configManager = new ConfigManager();
