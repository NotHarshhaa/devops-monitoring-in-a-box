/**
 * Server-side health probing for the monitoring stack.
 *
 * This runs on the Next.js server so it can reach container-network hostnames
 * (`http://prometheus:9090`) that a browser cannot resolve. The browser gets
 * the aggregated result from `/api/health`.
 */

import { serviceConfigManager, type ServiceConnectionConfig } from '../service-config';

export type ServiceStatus = 'up' | 'down' | 'disabled';

export type OverallStatus = 'healthy' | 'degraded' | 'unhealthy';

export interface ProbeTarget {
  key: keyof ServiceConnectionConfig;
  name: string;
  description: string;
  /** Optional services are only probed when explicitly enabled. */
  optional?: boolean;
}

export interface ServiceProbe {
  key: string;
  name: string;
  description: string;
  status: ServiceStatus;
  responseTime: number;
  /** Present only for authorised callers. */
  url?: string;
  publicUrl?: string;
  endpoint?: string;
  httpStatus?: number;
  error?: string;
}

export interface HealthReport {
  /** Liveness of the dashboard process itself - always "ok" if this responds. */
  status: 'ok';
  /** Aggregated status of the monitored upstreams. */
  upstreamStatus: OverallStatus;
  version: string;
  uptimeSeconds: number;
  timestamp: string;
  services: ServiceProbe[];
  summary: { total: number; up: number; down: number; disabled: number };
}

const PROBE_TARGETS: readonly ProbeTarget[] = [
  { key: 'prometheus', name: 'Prometheus', description: 'Metrics collection and storage' },
  { key: 'grafana', name: 'Grafana', description: 'Visualization and dashboards' },
  { key: 'loki', name: 'Loki', description: 'Log aggregation system' },
  { key: 'alertmanager', name: 'Alertmanager', description: 'Alert routing and management' },
  {
    key: 'nodeExporter',
    name: 'Node Exporter',
    description: 'Host system metrics',
    optional: true,
  },
  { key: 'cadvisor', name: 'cAdvisor', description: 'Container metrics', optional: true },
  {
    key: 'blackbox',
    name: 'Blackbox Exporter',
    description: 'HTTP/TCP uptime probing',
    optional: true,
  },
];

const PROBE_TIMEOUT_MS = 5000;

async function probe(target: ProbeTarget): Promise<ServiceProbe | null> {
  let config;
  try {
    config = serviceConfigManager.getServiceConfig(target.key);
  } catch {
    return null;
  }

  if (!config) {
    return null;
  }

  const base: Omit<ServiceProbe, 'status' | 'responseTime'> = {
    key: String(target.key),
    name: target.name,
    description: target.description,
    url: config.url,
    publicUrl: config.publicUrl,
    endpoint: config.healthCheckEndpoint,
  };

  if (!config.enabled) {
    // Optional services that were never switched on are not part of the report.
    if (target.optional) {
      return null;
    }
    return { ...base, status: 'disabled', responseTime: 0 };
  }

  const endpoint = config.healthCheckEndpoint ?? '/';
  const url = `${config.url.replace(/\/+$/, '')}${endpoint}`;
  const startedAt = Date.now();

  try {
    const response = await fetch(url, {
      method: 'GET',
      cache: 'no-store',
      signal: AbortSignal.timeout(PROBE_TIMEOUT_MS),
    });

    // 4xx still proves the process is listening and routing requests.
    const status: ServiceStatus = response.status < 500 ? 'up' : 'down';

    return {
      ...base,
      status,
      httpStatus: response.status,
      responseTime: Date.now() - startedAt,
      error: status === 'down' ? `HTTP ${response.status} ${response.statusText}` : undefined,
    };
  } catch (error) {
    const isTimeout =
      error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError');

    return {
      ...base,
      status: 'down',
      responseTime: Date.now() - startedAt,
      error: isTimeout
        ? `No response within ${PROBE_TIMEOUT_MS}ms`
        : error instanceof Error
          ? error.message
          : 'Unknown error',
    };
  }
}

export function summarize(services: readonly ServiceProbe[]): {
  upstreamStatus: OverallStatus;
  summary: HealthReport['summary'];
} {
  const up = services.filter((s) => s.status === 'up').length;
  const down = services.filter((s) => s.status === 'down').length;
  const disabled = services.filter((s) => s.status === 'disabled').length;
  const considered = up + down;

  let upstreamStatus: OverallStatus;
  if (considered === 0 || down === 0) {
    upstreamStatus = 'healthy';
  } else if (up === 0) {
    upstreamStatus = 'unhealthy';
  } else {
    upstreamStatus = 'degraded';
  }

  return {
    upstreamStatus,
    summary: { total: services.length, up, down, disabled },
  };
}

/** Probe every configured service in parallel. */
export async function collectHealth(): Promise<HealthReport> {
  const results = await Promise.all(PROBE_TARGETS.map(probe));
  const services = results.filter((r): r is ServiceProbe => r !== null);
  const { upstreamStatus, summary } = summarize(services);

  return {
    status: 'ok',
    upstreamStatus,
    version: process.env.npm_package_version ?? process.env.APP_VERSION ?? '2.5.0',
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    services,
    summary,
  };
}

/**
 * Strip internal addresses and error details from a report so it can be served
 * to an unauthenticated caller (for example a container healthcheck).
 */
export function redactHealthReport(report: HealthReport): HealthReport {
  return {
    ...report,
    services: report.services.map(({ key, name, description, status, responseTime }) => ({
      key,
      name,
      description,
      status,
      responseTime,
    })),
  };
}

export { PROBE_TARGETS };
