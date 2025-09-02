import { useState, useEffect, useCallback } from 'react';
import { lokiAPI, LokiLogEntry } from '../loki-api';

export interface LogFilters {
  searchQuery: string;
  job: string;
  namespace: string;
  severity: string;
  timeRange: string;
}

export interface UseLokiLogsReturn {
  logs: LokiLogEntry[];
  loading: boolean;
  error: string | null;
  jobs: string[];
  namespaces: string[];
  severityLevels: string[];
  refresh: () => void;
  setFilters: (filters: Partial<LogFilters>) => void;
  filters: LogFilters;
}

export function useLokiLogs(): UseLokiLogsReturn {
  const [logs, setLogs] = useState<LokiLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jobs, setJobs] = useState<string[]>([]);
  const [namespaces, setNamespaces] = useState<string[]>([]);
  const [severityLevels, setSeverityLevels] = useState<string[]>([]);
  
  const [filters, setFiltersState] = useState<LogFilters>({
    searchQuery: '',
    job: 'all',
    namespace: 'all',
    severity: 'all',
    timeRange: '1h',
  });

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const query = lokiAPI.buildQuery(filters);
      const { start, end } = lokiAPI.getTimeRange(filters.timeRange);
      
      const logEntries = await lokiAPI.queryLogs({
        query,
        start,
        end,
        limit: 1000,
        direction: 'backward',
      });

      setLogs(logEntries);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch logs');
      console.error('Error fetching logs:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchMetadata = useCallback(async () => {
    try {
      const [jobsData, namespacesData, severityData] = await Promise.all([
        lokiAPI.getJobs(),
        lokiAPI.getNamespaces(),
        lokiAPI.getSeverityLevels(),
      ]);

      setJobs(jobsData);
      setNamespaces(namespacesData);
      setSeverityLevels(severityData);
    } catch (err) {
      console.error('Error fetching metadata:', err);
    }
  }, []);

  const setFilters = useCallback((newFilters: Partial<LogFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  }, []);

  const refresh = useCallback(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Fetch metadata on mount
  useEffect(() => {
    fetchMetadata();
  }, [fetchMetadata]);

  // Fetch logs when filters change
  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return {
    logs,
    loading,
    error,
    jobs,
    namespaces,
    severityLevels,
    refresh,
    setFilters,
    filters,
  };
}
