import { useState, useEffect, useCallback, useRef } from 'react';
import { lokiAPI, LokiAPI, LokiLogEntry } from '../loki-api';

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
  /** Live tail: poll Loki for newly ingested entries every few seconds */
  isLive: boolean;
  setIsLive: (live: boolean) => void;
  /** True when a live poll found and appended new entries (for a subtle UI pulse) */
  liveIndicator: boolean;
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
  const [isLive, setIsLive] = useState(false);
  const [liveIndicator, setLiveIndicator] = useState(false);
  const lastSeenTimestampRef = useRef<string | null>(null);
  const latestLogsRef = useRef<LokiLogEntry[]>([]);
  const latestLiveRequestIdRef = useRef(0);

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
      latestLogsRef.current = logEntries;
      // Keep the live-tail anchor in sync with manual fetches/refreshes
      lastSeenTimestampRef.current = logEntries[0]?.timestamp ?? null;
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

  // Live tail: poll Loki for entries newer than the newest one we hold.
  // Uses query_range with direction=forward through the same proxy; when the
  // tab is hidden polling pauses to save requests.
  useEffect(() => {
    if (!isLive) {
      setLiveIndicator(false);
      return;
    }

    // Anchor the tail at the newest loaded entry (or "now" when the list is
    // empty) so the first poll only fetches genuinely new lines.
    if (!lastSeenTimestampRef.current) {
      lastSeenTimestampRef.current =
        latestLogsRef.current[0]?.timestamp ?? (Date.now() * 1_000_000).toString();
    }

    let cancelled = false;

    const poll = async () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
      const requestId = ++latestLiveRequestIdRef.current;
      try {
        const query = lokiAPI.buildQuery(filters);
        const lastSeenNs = parseInt(lastSeenTimestampRef.current ?? '0', 10);
        const start = (lastSeenNs > 0 ? lastSeenNs + 1 : Date.now() * 1_000_000 - 60 * 1e9);
        const end = Date.now() * 1_000_000;

        const incoming = await lokiAPI.queryLogs({
          query,
          start,
          end,
          limit: 100,
          direction: 'forward',
        });
        if (cancelled || requestId !== latestLiveRequestIdRef.current) return;

        if (incoming.length > 0) {
          lastSeenTimestampRef.current = incoming[incoming.length - 1].timestamp;
          setLogs((prev) => LokiAPI.mergeLogEntries(prev, incoming.slice().reverse()));
          setLiveIndicator(true);
          window.setTimeout(() => {
            if (!cancelled) setLiveIndicator(false);
          }, 1200);
        }
      } catch {
        // Transient errors during tailing are non-fatal; the next poll retries.
      }
    };

    poll();
    const interval = setInterval(poll, 3000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [isLive, filters]);

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
    isLive,
    setIsLive,
    liveIndicator,
  };
}
