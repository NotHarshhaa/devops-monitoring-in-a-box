import { useQuery } from '@tanstack/react-query';
import { prometheusAPI } from '../prometheus-api';
import { config } from '../config';

// Hook for current CPU usage
export function useCPUUsage() {
  return useQuery({
    queryKey: ['cpu-usage'],
    queryFn: () => prometheusAPI.getCPUUsage(),
    refetchInterval: config.prometheus.refreshInterval,
    staleTime: config.prometheus.refreshInterval,
    retry: 1, // Reduce retry attempts to prevent console spam
    retryDelay: 2000,
  });
}

// Hook for CPU usage over time range
export function useCPUUsageRange(start: number, end: number) {
  return useQuery({
    queryKey: ['cpu-usage-range', start, end],
    queryFn: () => prometheusAPI.getCPUUsageRange(start, end),
    refetchInterval: config.prometheus.refreshInterval,
    staleTime: config.prometheus.refreshInterval,
    retry: 1, // Reduce retry attempts
    retryDelay: 2000,
    enabled: start > 0 && end > 0,
  });
}

// Hook for current memory usage
export function useMemoryUsage() {
  return useQuery({
    queryKey: ['memory-usage'],
    queryFn: () => prometheusAPI.getMemoryUsage(),
    refetchInterval: config.prometheus.refreshInterval,
    staleTime: config.prometheus.refreshInterval,
    retry: 1, // Reduce retry attempts
    retryDelay: 2000,
  });
}

// Hook for memory usage over time range
export function useMemoryUsageRange(start: number, end: number) {
  return useQuery({
    queryKey: ['memory-usage-range', start, end],
    queryFn: () => prometheusAPI.getMemoryUsageRange(start, end),
    refetchInterval: config.prometheus.refreshInterval,
    staleTime: config.prometheus.refreshInterval,
    retry: 1, // Reduce retry attempts
    retryDelay: 2000,
    enabled: start > 0 && end > 0,
  });
}

// Hook for current disk usage
export function useDiskUsage() {
  return useQuery({
    queryKey: ['disk-usage'],
    queryFn: () => prometheusAPI.getDiskUsage(),
    refetchInterval: config.prometheus.refreshInterval,
    staleTime: config.prometheus.refreshInterval,
    retry: 1, // Reduce retry attempts
    retryDelay: 2000,
  });
}

// Hook for disk usage over time range
export function useDiskUsageRange(start: number, end: number) {
  return useQuery({
    queryKey: ['disk-usage-range', start, end],
    queryFn: () => prometheusAPI.getDiskUsageRange(start, end),
    refetchInterval: config.prometheus.refreshInterval,
    staleTime: config.prometheus.refreshInterval,
    retry: 1, // Reduce retry attempts
    retryDelay: 2000,
    enabled: start > 0 && end > 0,
  });
}

// Hook for current network traffic
export function useNetworkTraffic() {
  return useQuery({
    queryKey: ['network-traffic'],
    queryFn: () => prometheusAPI.getNetworkTraffic(),
    refetchInterval: config.prometheus.refreshInterval,
    staleTime: config.prometheus.refreshInterval,
    retry: 1, // Reduce retry attempts
    retryDelay: 2000,
  });
}

// Hook for network traffic over time range
export function useNetworkTrafficRange(start: number, end: number) {
  return useQuery({
    queryKey: ['network-traffic-range', start, end],
    queryFn: () => prometheusAPI.getNetworkTrafficRange(start, end),
    refetchInterval: config.prometheus.refreshInterval,
    staleTime: config.prometheus.refreshInterval,
    retry: 1, // Reduce retry attempts
    retryDelay: 2000,
    enabled: start > 0 && end > 0,
  });
}

// Hook for system load
export function useSystemLoad() {
  return useQuery({
    queryKey: ['system-load'],
    queryFn: () => prometheusAPI.getSystemLoad(),
    refetchInterval: config.prometheus.refreshInterval,
    staleTime: config.prometheus.refreshInterval,
    retry: 1, // Reduce retry attempts
    retryDelay: 2000,
  });
}

// Hook for all current metrics at once
export function useAllCurrentMetrics() {
  return useQuery({
    queryKey: ['all-current-metrics'],
    queryFn: () => prometheusAPI.getAllCurrentMetrics(),
    refetchInterval: config.prometheus.refreshInterval,
    staleTime: config.prometheus.refreshInterval,
    retry: 1, // Reduce retry attempts
    retryDelay: 2000,
  });
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
