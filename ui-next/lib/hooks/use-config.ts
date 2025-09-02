// React hook for configuration management

import { useState, useEffect, useCallback } from 'react';
import { MonitoringConfig, ConfigValidationResult, ConfigUpdate } from '../config/types';
import { configManager } from '../config/manager';

export function useConfig() {
  const [config, setConfig] = useState<MonitoringConfig>(configManager.getConfig());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to configuration changes
  useEffect(() => {
    const unsubscribe = configManager.addListener((newConfig) => {
      setConfig(newConfig);
      setError(null);
    });

    return unsubscribe;
  }, []);

  // Update configuration
  const updateConfig = useCallback(async (update: ConfigUpdate): Promise<ConfigValidationResult> => {
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
  }, []);

  // Load configuration from JSON
  const loadFromJson = useCallback(async (jsonString: string): Promise<ConfigValidationResult> => {
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
  }, []);

  // Load configuration from object
  const loadFromObject = useCallback(async (configObject: any): Promise<ConfigValidationResult> => {
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
  }, []);

  // Export configuration
  const exportConfig = useCallback(() => {
    return configManager.exportToJson();
  }, []);

  // Reset to default
  const resetToDefault = useCallback(() => {
    configManager.resetToDefault();
  }, []);

  // Get specific configuration sections
  const getDashboardConfig = useCallback(() => {
    return configManager.getDashboardConfig();
  }, []);

  const getMetricsConfig = useCallback(() => {
    return configManager.getMetricsConfig();
  }, []);

  const getLogsConfig = useCallback(() => {
    return configManager.getLogsConfig();
  }, []);

  const getAlertsConfig = useCallback(() => {
    return configManager.getAlertsConfig();
  }, []);

  const getServicesConfig = useCallback(() => {
    return configManager.getServicesConfig();
  }, []);

  // Get refresh interval
  const getRefreshInterval = useCallback(() => {
    return configManager.getRefreshInterval();
  }, []);

  // Get metrics by group
  const getMetricsByGroup = useCallback(() => {
    return configManager.getMetricsByGroup();
  }, []);

  // Get enabled services
  const getEnabledServices = useCallback(() => {
    return configManager.getEnabledServices();
  }, []);

  // Get configuration summary
  const getConfigSummary = useCallback(() => {
    return configManager.getConfigSummary();
  }, []);

  // Validate current configuration
  const validateConfig = useCallback(() => {
    return configManager.validateCurrentConfig();
  }, []);

  return {
    // State
    config,
    isLoading,
    error,
    
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
