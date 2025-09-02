import { useState, useEffect, useCallback } from 'react';
import { alertmanagerAPI, AlertmanagerAlert } from '../alertmanager-api';

export interface AlertFilters {
  searchQuery: string;
  severity: string;
  status: string;
  service: string;
}

export interface UseAlertmanagerAlertsReturn {
  alerts: AlertmanagerAlert[];
  loading: boolean;
  error: string | null;
  services: string[];
  severities: string[];
  refresh: () => void;
  setFilters: (filters: Partial<AlertFilters>) => void;
  filters: AlertFilters;
  filteredAlerts: AlertmanagerAlert[];
  stats: {
    firing: number;
    suppressed: number;
    total: number;
  };
}

export function useAlertmanagerAlerts(): UseAlertmanagerAlertsReturn {
  const [alerts, setAlerts] = useState<AlertmanagerAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [services, setServices] = useState<string[]>([]);
  const [severities, setSeverities] = useState<string[]>([]);
  
  const [filters, setFiltersState] = useState<AlertFilters>({
    searchQuery: '',
    severity: 'all',
    status: 'all',
    service: 'all',
  });

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const alertData = await alertmanagerAPI.getAlerts();
      setAlerts(alertData);
      
      // Update available services and severities
      const uniqueServices = alertmanagerAPI.getUniqueServices(alertData);
      const uniqueSeverities = alertmanagerAPI.getUniqueSeverities(alertData);
      
      setServices(uniqueServices);
      setSeverities(uniqueSeverities);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch alerts');
      console.error('Error fetching alerts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const setFilters = useCallback((newFilters: Partial<AlertFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  }, []);

  const refresh = useCallback(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  // Apply filters to alerts
  const filteredAlerts = useCallback(() => {
    let filtered = alerts;

    // Apply search filter
    if (filters.searchQuery) {
      filtered = alertmanagerAPI.filterAlertsBySearch(filtered, filters.searchQuery);
    }

    // Apply severity filter
    if (filters.severity !== 'all') {
      filtered = alertmanagerAPI.filterAlertsBySeverity(filtered, filters.severity);
    }

    // Apply status filter
    if (filters.status !== 'all') {
      filtered = alertmanagerAPI.filterAlertsByStatus(filtered, filters.status);
    }

    // Apply service filter
    if (filters.service !== 'all') {
      filtered = alertmanagerAPI.filterAlertsByService(filtered, filters.service);
    }

    return filtered;
  }, [alerts, filters]);

  // Calculate stats
  const stats = useCallback(() => {
    const firing = alerts.filter(alert => alertmanagerAPI.isAlertFiring(alert)).length;
    const suppressed = alerts.filter(alert => alertmanagerAPI.isAlertSuppressed(alert)).length;
    const total = alerts.length;

    return { firing, suppressed, total };
  }, [alerts]);

  // Fetch alerts on mount
  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAlerts();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchAlerts]);

  return {
    alerts,
    loading,
    error,
    services,
    severities,
    refresh,
    setFilters,
    filters,
    filteredAlerts: filteredAlerts(),
    stats: stats(),
  };
}
