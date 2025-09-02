// React hook for configuration management

import { useState, useEffect, useCallback } from 'react';
import { MonitoringConfig, ConfigValidationResult, ConfigUpdate } from '../config/types';
import { configManager } from '../config/manager';

export function useConfig() {
  const [config, setConfig] = useState<MonitoringConfig>(() => {
    // Only access configManager on client side
    if (typeof window !== 'undefined') {
      return configManager.getConfig();
    }
    // Return default config for SSR
    return {
      dashboard: { refresh_interval: '15s' },
      metrics: [],
      logs: { default_query: '{job="varlogs"}', limit: 100 },
      alerts: { severity_levels: ['critical', 'warning'] },
      version: '1.0.0',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Subscribe to configuration changes
  useEffect(() => {
    setIsClient(true);
    
    if (typeof window !== 'undefined') {
      const unsubscribe = configManager.addListener((newConfig) => {
        setConfig(newConfig);
        setError(null);
      });

      return unsubscribe;
    }
  }, []);

  // Update configuration
  const updateConfig = useCallback(async (update: ConfigUpdate): Promise<ConfigValidationResult> => {
    if (!isClient) {
      return {
        valid: false,
        errors: ['Configuration updates are only available on the client side'],
        warnings: [],
      };
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = configManager.updateConfig(update);
      
      if (!result.valid) {
        setError(result.errors.join(', '));
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return {
        valid: false,
        errors: [errorMessage],
        warnings: [],
      };
    } finally {
      setIsLoading(false);
    }
  }, [isClient]);

  // Load configuration from JSON
  const loadFromJson = useCallback(async (jsonString: string): Promise<ConfigValidationResult> => {
    if (!isClient) {
      return {
        valid: false,
        errors: ['Configuration loading is only available on the client side'],
        warnings: [],
      };
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = configManager.loadFromJson(jsonString);
      
      if (!result.valid) {
        setError(result.errors.join(', '));
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return {
        valid: false,
        errors: [errorMessage],
        warnings: [],
      };
    } finally {
      setIsLoading(false);
    }
  }, [isClient]);

  // Load configuration from object
  const loadFromObject = useCallback(async (configObject: any): Promise<ConfigValidationResult> => {
    if (!isClient) {
      return {
        valid: false,
        errors: ['Configuration loading is only available on the client side'],
        warnings: [],
      };
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = configManager.loadFromObject(configObject);
      
      if (!result.valid) {
        setError(result.errors.join(', '));
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return {
        valid: false,
        errors: [errorMessage],
        warnings: [],
      };
    } finally {
      setIsLoading(false);
    }
  }, [isClient]);

  // Export configuration
  const exportConfig = useCallback(() => {
    if (!isClient) {
      return JSON.stringify({
        dashboard: { refresh_interval: '15s' },
        metrics: [],
        logs: { default_query: '{job="varlogs"}', limit: 100 },
        alerts: { severity_levels: ['critical', 'warning'] },
        version: '1.0.0',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, null, 2);
    }
    return configManager.exportToJson();
  }, [isClient]);

  // Reset to default
  const resetToDefault = useCallback(() => {
    if (isClient) {
      configManager.resetToDefault();
    }
  }, [isClient]);

  // Get specific configuration sections
  const getDashboardConfig = useCallback(() => {
    if (!isClient) {
      return { refresh_interval: '15s' };
    }
    return configManager.getDashboardConfig();
  }, [isClient]);

  const getMetricsConfig = useCallback(() => {
    if (!isClient) {
      return [];
    }
    return configManager.getMetricsConfig();
  }, [isClient]);

  const getLogsConfig = useCallback(() => {
    if (!isClient) {
      return { default_query: '{job="varlogs"}', limit: 100 };
    }
    return configManager.getLogsConfig();
  }, [isClient]);

  const getAlertsConfig = useCallback(() => {
    if (!isClient) {
      return { severity_levels: ['critical', 'warning'] };
    }
    return configManager.getAlertsConfig();
  }, [isClient]);

  const getServicesConfig = useCallback(() => {
    if (!isClient) {
      return {};
    }
    return configManager.getServicesConfig();
  }, [isClient]);

  // Get refresh interval
  const getRefreshInterval = useCallback(() => {
    if (!isClient) {
      return 15000; // 15 seconds
    }
    return configManager.getRefreshInterval();
  }, [isClient]);

  // Get metrics by group
  const getMetricsByGroup = useCallback(() => {
    if (!isClient) {
      return {};
    }
    return configManager.getMetricsByGroup();
  }, [isClient]);

  // Get enabled services
  const getEnabledServices = useCallback(() => {
    if (!isClient) {
      return [];
    }
    return configManager.getEnabledServices();
  }, [isClient]);

  // Get configuration summary
  const getConfigSummary = useCallback(() => {
    if (!isClient) {
      return {
        version: '1.0.0',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        dashboard: { title: 'DevOps Monitor', refresh_interval: '15s' },
        metrics: { total: 0, enabled: 0, groups: 0 },
        services: { total: 0, enabled: 0 },
        logs: { default_query: '{job="varlogs"}', limit: 100 },
        alerts: { severity_levels: 2 },
      };
    }
    return configManager.getConfigSummary();
  }, [isClient]);

  // Validate current configuration
  const validateConfig = useCallback(() => {
    if (!isClient) {
      return { valid: true, errors: [], warnings: [] };
    }
    return configManager.validateCurrentConfig();
  }, [isClient]);

  return {
    // State
    config,
    isLoading,
    error,
    isClient,
    
    // Actions
    updateConfig,
    loadFromJson,
    loadFromObject,
    exportConfig,
    resetToDefault,
    
    // Getters
    getDashboardConfig,
    getMetricsConfig,
    getLogsConfig,
    getAlertsConfig,
    getServicesConfig,
    getRefreshInterval,
    getMetricsByGroup,
    getEnabledServices,
    getConfigSummary,
    validateConfig,
  };
}

// Hook for dashboard configuration
export function useDashboardConfig() {
  const { getDashboardConfig, updateConfig, isLoading, error } = useConfig();
  
  const updateDashboardConfig = useCallback((dashboardConfig: Partial<MonitoringConfig['dashboard']>) => {
    return updateConfig({
      type: 'dashboard',
      data: { dashboard: dashboardConfig },
    });
  }, [updateConfig]);

  return {
    dashboardConfig: getDashboardConfig(),
    updateDashboardConfig,
    isLoading,
    error,
  };
}

// Hook for metrics configuration
export function useMetricsConfig() {
  const { getMetricsConfig, updateConfig, isLoading, error, getMetricsByGroup } = useConfig();
  
  const updateMetricsConfig = useCallback((metrics: MonitoringConfig['metrics']) => {
    return updateConfig({
      type: 'metrics',
      data: { metrics },
    });
  }, [updateConfig]);

  const addMetric = useCallback((metric: MonitoringConfig['metrics'][0]) => {
    const currentMetrics = getMetricsConfig();
    return updateMetricsConfig([...currentMetrics, metric]);
  }, [getMetricsConfig, updateMetricsConfig]);

  const updateMetric = useCallback((index: number, metric: Partial<MonitoringConfig['metrics'][0]>) => {
    const currentMetrics = getMetricsConfig();
    const updatedMetrics = [...currentMetrics];
    updatedMetrics[index] = { ...updatedMetrics[index], ...metric };
    return updateMetricsConfig(updatedMetrics);
  }, [getMetricsConfig, updateMetricsConfig]);

  const removeMetric = useCallback((index: number) => {
    const currentMetrics = getMetricsConfig();
    const updatedMetrics = currentMetrics.filter((_, i) => i !== index);
    return updateMetricsConfig(updatedMetrics);
  }, [getMetricsConfig, updateMetricsConfig]);

  return {
    metricsConfig: getMetricsConfig(),
    metricsByGroup: getMetricsByGroup(),
    updateMetricsConfig,
    addMetric,
    updateMetric,
    removeMetric,
    isLoading,
    error,
  };
}

// Hook for logs configuration
export function useLogsConfig() {
  const { getLogsConfig, updateConfig, isLoading, error } = useConfig();
  
  const updateLogsConfig = useCallback((logsConfig: Partial<MonitoringConfig['logs']>) => {
    return updateConfig({
      type: 'logs',
      data: { logs: logsConfig },
    });
  }, [updateConfig]);

  return {
    logsConfig: getLogsConfig(),
    updateLogsConfig,
    isLoading,
    error,
  };
}

// Hook for alerts configuration
export function useAlertsConfig() {
  const { getAlertsConfig, updateConfig, isLoading, error } = useConfig();
  
  const updateAlertsConfig = useCallback((alertsConfig: Partial<MonitoringConfig['alerts']>) => {
    return updateConfig({
      type: 'alerts',
      data: { alerts: alertsConfig },
    });
  }, [updateConfig]);

  return {
    alertsConfig: getAlertsConfig(),
    updateAlertsConfig,
    isLoading,
    error,
  };
}

// Hook for services configuration
export function useServicesConfig() {
  const { getServicesConfig, updateConfig, isLoading, error, getEnabledServices } = useConfig();
  
  const updateServicesConfig = useCallback((servicesConfig: Partial<MonitoringConfig['services']>) => {
    return updateConfig({
      type: 'services',
      data: { services: servicesConfig },
    });
  }, [updateConfig]);

  return {
    servicesConfig: getServicesConfig(),
    enabledServices: getEnabledServices(),
    updateServicesConfig,
    isLoading,
    error,
  };
}
