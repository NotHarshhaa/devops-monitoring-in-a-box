import { useQuery } from '@tanstack/react-query';
import { lokiAPI, LokiLogEntry } from '../loki-api';

export interface UseLokiLogsOptions {
  query?: string;
  limit?: number;
  start?: number;
  end?: number;
  refetchInterval?: number;
}

export function useLokiLogs(options: UseLokiLogsOptions = {}) {
  const {
    query = '{job=~".+"}',
    limit = 50,
    start,
    end,
    refetchInterval = 30000, // 30 seconds
  } = options;

  return useQuery<LokiLogEntry[]>({
    queryKey: ['loki-logs', query, limit, start, end],
    queryFn: () => lokiAPI.queryLogs({
      query,
      limit,
      start,
      end,
      direction: 'backward',
    }),
    refetchInterval,
    staleTime: refetchInterval,
    retry: 2,
    retryDelay: 1000,
  });
}

export function useRecentLogs(limit: number = 20) {
  const end = Date.now() * 1000000; // Convert to nanoseconds
  const start = end - (3600 * 1000000000); // Last hour

  return useLokiLogs({
    query: '{job=~".+"}',
    limit,
    start,
    end,
    refetchInterval: 15000, // Refresh every 15 seconds
  });
}
