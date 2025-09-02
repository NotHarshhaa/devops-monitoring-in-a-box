// Configuration parser and validation utilities

import { 
  MonitoringConfig, 
  ConfigValidationResult, 
  DEFAULT_CONFIG,
  MetricConfig,
  LogsConfig,
  AlertsConfig,
  DashboardConfig,
  ServicesConfig
} from './types';

export class ConfigParser {
  /**
   * Parse configuration from JSON string
   */
  static parseConfig(jsonString: string): MonitoringConfig {
    try {
      const parsed = JSON.parse(jsonString);
      return this.validateAndMerge(parsed);
    } catch (error) {
      console.error('Failed to parse configuration:', error);
      throw new Error(`Invalid JSON configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Parse configuration from object
   */
  static parseConfigFromObject(config: any): MonitoringConfig {
    return this.validateAndMerge(config);
  }

  /**
   * Validate and merge configuration with defaults
   */
  private static validateAndMerge(config: any): MonitoringConfig {
    const validation = this.validateConfig(config);
    
    if (!validation.valid) {
      throw new Error(`Configuration validation failed: ${validation.errors.join(', ')}`);
    }

    // Merge with defaults
    const mergedConfig = this.deepMerge(DEFAULT_CONFIG, config);
    
    // Add metadata
    mergedConfig.updated_at = new Date().toISOString();
    
    return mergedConfig;
  }

  /**
   * Validate configuration structure
   */
  static validateConfig(config: any): ConfigValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check if config is an object
    if (!config || typeof config !== 'object') {
      errors.push('Configuration must be an object');
      return { valid: false, errors, warnings };
    }

    // Validate dashboard config
    if (config.dashboard) {
      this.validateDashboardConfig(config.dashboard, errors, warnings);
    }

    // Validate metrics config
    if (config.metrics) {
      this.validateMetricsConfig(config.metrics, errors, warnings);
    }

    // Validate logs config
    if (config.logs) {
      this.validateLogsConfig(config.logs, errors, warnings);
    }

    // Validate alerts config
    if (config.alerts) {
      this.validateAlertsConfig(config.alerts, errors, warnings);
    }

    // Validate services config
    if (config.services) {
      this.validateServicesConfig(config.services, errors, warnings);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate dashboard configuration
   */
  private static validateDashboardConfig(dashboard: any, errors: string[], warnings: string[]): void {
    if (typeof dashboard !== 'object') {
      errors.push('Dashboard configuration must be an object');
      return;
    }

    if (dashboard.refresh_interval && typeof dashboard.refresh_interval !== 'string') {
      errors.push('Dashboard refresh_interval must be a string');
    }

    if (dashboard.title && typeof dashboard.title !== 'string') {
      errors.push('Dashboard title must be a string');
    }

    if (dashboard.description && typeof dashboard.description !== 'string') {
      errors.push('Dashboard description must be a string');
    }

    if (dashboard.theme && !['light', 'dark', 'system'].includes(dashboard.theme)) {
      errors.push('Dashboard theme must be one of: light, dark, system');
    }
  }

  /**
   * Validate metrics configuration
   */
  private static validateMetricsConfig(metrics: any, errors: string[], warnings: string[]): void {
    if (!Array.isArray(metrics)) {
      errors.push('Metrics configuration must be an array');
      return;
    }

    metrics.forEach((metric: any, index: number) => {
      if (typeof metric !== 'object') {
        errors.push(`Metric at index ${index} must be an object`);
        return;
      }

      if (!metric.name || typeof metric.name !== 'string') {
        errors.push(`Metric at index ${index} must have a valid name`);
      }

      if (!metric.query || typeof metric.query !== 'string') {
        errors.push(`Metric at index ${index} must have a valid query`);
      }

      if (metric.unit && typeof metric.unit !== 'string') {
        errors.push(`Metric at index ${index} unit must be a string`);
      }

      if (metric.chart && !['line', 'area', 'bar', 'stacked', 'composed'].includes(metric.chart)) {
        errors.push(`Metric at index ${index} chart type must be one of: line, area, bar, stacked, composed`);
      }

      if (metric.thresholds) {
        if (typeof metric.thresholds !== 'object') {
          errors.push(`Metric at index ${index} thresholds must be an object`);
        } else {
          if (metric.thresholds.warning !== undefined && typeof metric.thresholds.warning !== 'number') {
            errors.push(`Metric at index ${index} warning threshold must be a number`);
          }
          if (metric.thresholds.critical !== undefined && typeof metric.thresholds.critical !== 'number') {
            errors.push(`Metric at index ${index} critical threshold must be a number`);
          }
        }
      }

      if (metric.color && typeof metric.color !== 'string') {
        errors.push(`Metric at index ${index} color must be a string`);
      }

      if (metric.enabled !== undefined && typeof metric.enabled !== 'boolean') {
        errors.push(`Metric at index ${index} enabled must be a boolean`);
      }
    });
  }

  /**
   * Validate logs configuration
   */
  private static validateLogsConfig(logs: any, errors: string[], warnings: string[]): void {
    if (typeof logs !== 'object') {
      errors.push('Logs configuration must be an object');
      return;
    }

    if (logs.default_query && typeof logs.default_query !== 'string') {
      errors.push('Logs default_query must be a string');
    }

    if (logs.limit !== undefined && (typeof logs.limit !== 'number' || logs.limit < 1)) {
      errors.push('Logs limit must be a positive number');
    }

    if (logs.time_range && typeof logs.time_range !== 'string') {
      errors.push('Logs time_range must be a string');
    }

    if (logs.refresh_interval && typeof logs.refresh_interval !== 'string') {
      errors.push('Logs refresh_interval must be a string');
    }

    if (logs.filters) {
      if (typeof logs.filters !== 'object') {
        errors.push('Logs filters must be an object');
      } else {
        if (logs.filters.jobs && !Array.isArray(logs.filters.jobs)) {
          errors.push('Logs filters jobs must be an array');
        }
        if (logs.filters.namespaces && !Array.isArray(logs.filters.namespaces)) {
          errors.push('Logs filters namespaces must be an array');
        }
        if (logs.filters.severity_levels && !Array.isArray(logs.filters.severity_levels)) {
          errors.push('Logs filters severity_levels must be an array');
        }
      }
    }
  }

  /**
   * Validate alerts configuration
   */
  private static validateAlertsConfig(alerts: any, errors: string[], warnings: string[]): void {
    if (typeof alerts !== 'object') {
      errors.push('Alerts configuration must be an object');
      return;
    }

    if (alerts.severity_levels && !Array.isArray(alerts.severity_levels)) {
      errors.push('Alerts severity_levels must be an array');
    }

    if (alerts.refresh_interval && typeof alerts.refresh_interval !== 'string') {
      errors.push('Alerts refresh_interval must be a string');
    }

    if (alerts.filters) {
      if (typeof alerts.filters !== 'object') {
        errors.push('Alerts filters must be an object');
      } else {
        if (alerts.filters.services && !Array.isArray(alerts.filters.services)) {
          errors.push('Alerts filters services must be an array');
        }
        if (alerts.filters.statuses && !Array.isArray(alerts.filters.statuses)) {
          errors.push('Alerts filters statuses must be an array');
        }
      }
    }
  }

  /**
   * Validate services configuration
   */
  private static validateServicesConfig(services: any, errors: string[], warnings: string[]): void {
    if (typeof services !== 'object') {
      errors.push('Services configuration must be an object');
      return;
    }

    const validServices = ['prometheus', 'grafana', 'loki', 'alertmanager'];
    
    Object.keys(services).forEach(serviceName => {
      if (!validServices.includes(serviceName)) {
        warnings.push(`Unknown service: ${serviceName}`);
      }

      const service = services[serviceName];
      if (typeof service !== 'object') {
        errors.push(`Service ${serviceName} configuration must be an object`);
        return;
      }

      if (service.url && typeof service.url !== 'string') {
        errors.push(`Service ${serviceName} url must be a string`);
      }

      if (service.enabled !== undefined && typeof service.enabled !== 'boolean') {
        errors.push(`Service ${serviceName} enabled must be a boolean`);
      }
    });
  }

  /**
   * Deep merge two objects
   */
  private static deepMerge(target: any, source: any): any {
    const result = { ...target };

    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }

    return result;
  }

  /**
   * Convert configuration to JSON string
   */
  static configToJson(config: MonitoringConfig): string {
    return JSON.stringify(config, null, 2);
  }

  /**
   * Parse refresh interval string to milliseconds
   */
  static parseRefreshInterval(interval: string): number {
    const match = interval.match(/^(\d+)([smhd])$/);
    if (!match) {
      throw new Error(`Invalid refresh interval format: ${interval}`);
    }

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 's':
        return value * 1000;
      case 'm':
        return value * 60 * 1000;
      case 'h':
        return value * 60 * 60 * 1000;
      case 'd':
        return value * 24 * 60 * 60 * 1000;
      default:
        throw new Error(`Unsupported time unit: ${unit}`);
    }
  }

  /**
   * Format milliseconds to refresh interval string
   */
  static formatRefreshInterval(milliseconds: number): string {
    if (milliseconds < 1000) {
      return `${milliseconds}ms`;
    } else if (milliseconds < 60000) {
      return `${Math.round(milliseconds / 1000)}s`;
    } else if (milliseconds < 3600000) {
      return `${Math.round(milliseconds / 60000)}m`;
    } else if (milliseconds < 86400000) {
      return `${Math.round(milliseconds / 3600000)}h`;
    } else {
      return `${Math.round(milliseconds / 86400000)}d`;
    }
  }
}
