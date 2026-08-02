import { useQuery } from '@tanstack/react-query';
import { prometheusAPI } from '../prometheus-api';
import { config } from '../config';
import { pollingInterval } from './polling';

type MetricPoint = { time: number; value: number };
type NetworkPoint = { time: number; inbound: number; outbound: number };

const refreshMs = config.prometheus.refreshInterval;

function usePrometheusQuery<T>(
  queryKey: readonly unknown[],
  queryFn: () => Promise<T>,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey,
    queryFn,
    refetchInterval: pollingInterval(refreshMs),
    staleTime: refreshMs,
    retry: 0,
    refetchOnWindowFocus: false,
    enabled: options?.enabled,
  });
}

// Hook for current CPU usage
export function useCPUUsage() {
  return usePrometheusQuery(['cpu-usage'], () => prometheusAPI.getCPUUsage());
}

// Hook for CPU usage over time range
export function useCPUUsageRange(start: number, end: number) {
  return usePrometheusQuery<MetricPoint[]>(
    ['cpu-usage-range', start, end],
    () => prometheusAPI.getCPUUsageRange(start, end),
    { enabled: start > 0 && end > 0 }
  );
}

// Hook for current memory usage
export function useMemoryUsage() {
  return usePrometheusQuery(['memory-usage'], () => prometheusAPI.getMemoryUsage());
}

// Hook for memory usage over time range
export function useMemoryUsageRange(start: number, end: number) {
  return usePrometheusQuery<MetricPoint[]>(
    ['memory-usage-range', start, end],
    () => prometheusAPI.getMemoryUsageRange(start, end),
    { enabled: start > 0 && end > 0 }
  );
}

// Hook for current disk usage
export function useDiskUsage() {
  return usePrometheusQuery(['disk-usage'], () => prometheusAPI.getDiskUsage());
}

// Hook for disk usage over time range
export function useDiskUsageRange(start: number, end: number) {
  return usePrometheusQuery<MetricPoint[]>(
    ['disk-usage-range', start, end],
    () => prometheusAPI.getDiskUsageRange(start, end),
    { enabled: start > 0 && end > 0 }
  );
}

// Hook for current network traffic
export function useNetworkTraffic() {
  return usePrometheusQuery(['network-traffic'], () => prometheusAPI.getNetworkTraffic());
}

// Hook for network traffic over time range
export function useNetworkTrafficRange(start: number, end: number) {
  return usePrometheusQuery<NetworkPoint[]>(
    ['network-traffic-range', start, end],
    () => prometheusAPI.getNetworkTrafficRange(start, end),
    { enabled: start > 0 && end > 0 }
  );
}

// Hook for system load
export function useSystemLoad() {
  return usePrometheusQuery(['system-load'], () => prometheusAPI.getSystemLoad());
}

// Hook for all current metrics at once
export function useAllCurrentMetrics() {
  return usePrometheusQuery(['all-current-metrics'], () => prometheusAPI.getAllCurrentMetrics());
}

// Utility function to get time range based on selection
export function getTimeRange(timeRangeValue: string): { start: number; end: number } {
  const now = Math.floor(Date.now() / 1000);
  const hours = parseInt(timeRangeValue);
  const start = now - (hours * 60 * 60);
  
  return { start, end: now };
}

// Hook for all metrics over a time range
export function useAllMetricsRange(timeRangeValue: string) {
  const { start, end } = getTimeRange(timeRangeValue);
  
  const cpuRange = useCPUUsageRange(start, end);
  const memoryRange = useMemoryUsageRange(start, end);
  const diskRange = useDiskUsageRange(start, end);
  const networkRange = useNetworkTrafficRange(start, end);

  return {
    cpuRange,
    memoryRange,
    diskRange,
    networkRange,
    isLoading: cpuRange.isLoading || memoryRange.isLoading || diskRange.isLoading || networkRange.isLoading,
    isError: cpuRange.isError || memoryRange.isError || diskRange.isError || networkRange.isError,
  };
}
