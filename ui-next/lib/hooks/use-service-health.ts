import { useQuery } from '@tanstack/react-query';
import { healthAPI, HealthCheckResult } from '../health-api';

export function useServiceHealth() {
  return useQuery<HealthCheckResult>({
    queryKey: ['service-health'],
    queryFn: () => healthAPI.checkAllServices(),
    refetchInterval: 30000, // Check every 30 seconds
    staleTime: 30000,
    retry: 2,
    retryDelay: 1000,
  });
}

