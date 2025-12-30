import { useQuery } from '@tanstack/react-query';
import { prometheusAPI } from '../prometheus-api';
import { config } from '../config';

export interface PrometheusTarget {
  discoveredLabels: Record<string, string>;
  labels: Record<string, string>;
  scrapePool: string;
  scrapeUrl: string;
  lastError: string;
  lastScrape: string;
  lastScrapeDuration: number;
  health: 'up' | 'down' | 'unknown';
}

export function usePrometheusTargets() {
  return useQuery<PrometheusTarget[]>({
    queryKey: ['prometheus-targets'],
    queryFn: () => prometheusAPI.getTargets(),
    refetchInterval: config.prometheus.refreshInterval,
    staleTime: config.prometheus.refreshInterval,
    retry: 3,
    retryDelay: 1000,
  });
}

