import { useState, useEffect, useCallback, useRef } from 'react';
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

  const latestRequestIdRef = useRef(0);

  const fetchLogs = useCallback(async () => {
    // Guard against out-of-order responses: only the latest request wins
    const requestId = ++latestRequestIdRef.current;
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

      if (requestId !== latestRequestIdRef.current) return;
      setLogs(logEntries);
    } catch (err) {
      if (requestId !== latestRequestIdRef.current) return;
      // Loki unreachable is an expected condition (stack not running), not a
      // bug: surface it in the UI state without console.error noise.
      const message = err instanceof Error ? err.message : 'Failed to fetch logs';
      setError(message);
      console.warn('Loki logs unavailable:', message);
    } finally {
      if (requestId === latestRequestIdRef.current) {
        setLoading(false);
      }
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

  // Fetch logs when filters change, debounced so typing in the search box
  // does not fire one Loki query per keystroke
  useEffect(() => {
    const timer = setTimeout(fetchLogs, 300);
    return () => clearTimeout(timer);
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
