// Multi-tenant configuration hook

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { MonitoringConfig, ConfigValidationResult, ConfigUpdate } from '../config/types';
import { multiTenantConfigManager } from '../config/multi-tenant-manager';

export function useMultiTenantConfig() {
  const { data: session } = useSession();
  const userId = (session?.user as any)?.id || 'anonymous';
  
  const [config, setConfig] = useState<MonitoringConfig>(() => {
    // Only access configManager on client side
    if (typeof window !== 'undefined') {
      return multiTenantConfigManager.getConfig(userId);
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
      const unsubscribe = multiTenantConfigManager.addListener(userId, (newConfig) => {
        setConfig(newConfig);
        setError(null);
      });

      return unsubscribe;
    }
  }, [userId]);

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
      const result = multiTenantConfigManager.updateConfig(userId, update);
      
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
  }, [isClient, userId]);

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
      const result = multiTenantConfigManager.loadFromJson(userId, jsonString);
      
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
  }, [isClient, userId]);

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
      const result = multiTenantConfigManager.loadFromObject(userId, configObject);
      
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
  }, [isClient, userId]);

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
    return multiTenantConfigManager.exportToJson(userId);
  }, [isClient, userId]);

  // Reset to default
  const resetToDefault = useCallback(() => {
    if (isClient) {
      multiTenantConfigManager.resetToDefault(userId);
    }
  }, [isClient, userId]);

  // Get specific configuration sections
  const getDashboardConfig = useCallback(() => {
    if (!isClient) {
      return { refresh_interval: '15s' };
    }
    return multiTenantConfigManager.getDashboardConfig(userId);
  }, [isClient, userId]);

  const getMetricsConfig = useCallback(() => {
    if (!isClient) {
      return [];
    }
    return multiTenantConfigManager.getMetricsConfig(userId);
  }, [isClient, userId]);

  const getLogsConfig = useCallback(() => {
    if (!isClient) {
      return { default_query: '{job="varlogs"}', limit: 100 };
    }
    return multiTenantConfigManager.getLogsConfig(userId);
  }, [isClient, userId]);

  const getAlertsConfig = useCallback(() => {
    if (!isClient) {
      return { severity_levels: ['critical', 'warning'] };
    }
    return multiTenantConfigManager.getAlertsConfig(userId);
  }, [isClient, userId]);

  const getServicesConfig = useCallback(() => {
    if (!isClient) {
      return {};
    }
    return multiTenantConfigManager.getServicesConfig(userId);
  }, [isClient, userId]);

  // Get refresh interval
  const getRefreshInterval = useCallback(() => {
    if (!isClient) {
      return 15000; // 15 seconds
    }
    return multiTenantConfigManager.getRefreshInterval(userId);
  }, [isClient, userId]);

  // Get metrics by group
  const getMetricsByGroup = useCallback(() => {
    if (!isClient) {
      return {};
    }
    return multiTenantConfigManager.getMetricsByGroup(userId);
  }, [isClient, userId]);

  // Get enabled services
  const getEnabledServices = useCallback(() => {
    if (!isClient) {
      return [];
    }
    return multiTenantConfigManager.getEnabledServices(userId);
  }, [isClient, userId]);

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
    return multiTenantConfigManager.getConfigSummary(userId);
  }, [isClient, userId]);

  // Validate current configuration
  const validateConfig = useCallback(() => {
    if (!isClient) {
      return { valid: true, errors: [], warnings: [] };
    }
    return multiTenantConfigManager.validateCurrentConfig(userId);
  }, [isClient, userId]);

  return {
    // State
    config,
    isLoading,
    error,
    isClient,
    userId,
    
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

// Convenience hooks for specific configuration sections
export function useMultiTenantDashboardConfig() {
  const { getDashboardConfig, isLoading, error, isClient } = useMultiTenantConfig();
  return { 
    dashboardConfig: getDashboardConfig(), 
    isLoading, 
    error, 
    isClient 
  };
}

export function useMultiTenantMetricsConfig() {
  const { 
    getMetricsConfig, 
    getMetricsByGroup, 
    getConfigSummary, 
    updateConfig, 
    isLoading, 
    error, 
    isClient 
  } = useMultiTenantConfig();

  const metrics = getMetricsConfig();
  const metricsByGroup = getMetricsByGroup();
  const summary = getConfigSummary();

  const addMetric = useCallback((metric: any) => {
    const currentMetrics = getMetricsConfig();
    return updateConfig({ type: 'metrics', data: { metrics: [...currentMetrics, metric] } });
  }, [getMetricsConfig, updateConfig]);

  const updateMetric = useCallback((index: number, updatedMetric: any) => {
    const currentMetrics = getMetricsConfig();
    const newMetrics = [...currentMetrics];
    newMetrics[index] = updatedMetric;
    return updateConfig({ type: 'metrics', data: { metrics: newMetrics } });
  }, [getMetricsConfig, updateConfig]);

  const deleteMetric = useCallback((index: number) => {
    const currentMetrics = getMetricsConfig();
    const newMetrics = currentMetrics.filter((_, i) => i !== index);
    return updateConfig({ type: 'metrics', data: { metrics: newMetrics } });
  }, [getMetricsConfig, updateConfig]);

  return { 
    metrics, 
    metricsByGroup, 
    summary, 
    addMetric, 
    updateMetric, 
    deleteMetric, 
    isLoading, 
    error, 
    isClient 
  };
}

export function useMultiTenantLogsConfig() {
  const { getLogsConfig, isLoading, error, isClient } = useMultiTenantConfig();
  return { 
    logsConfig: getLogsConfig(), 
    isLoading, 
    error, 
    isClient 
  };
}

export function useMultiTenantAlertsConfig() {
  const { getAlertsConfig, isLoading, error, isClient } = useMultiTenantConfig();
  return { 
    alertsConfig: getAlertsConfig(), 
    isLoading, 
    error, 
    isClient 
  };
}

export function useMultiTenantServicesConfig() {
  const { getServicesConfig, isLoading, error, isClient } = useMultiTenantConfig();
  return { 
    servicesConfig: getServicesConfig(), 
    isLoading, 
    error, 
    isClient 
  };
}
