/**
 * Server-only upstream proxy helper.
 *
 * The browser must never talk to Prometheus / Loki / Alertmanager directly:
 *  - In Docker/Kubernetes the upstream hostnames (`prometheus`, `loki`, ...) are
 *    only resolvable from inside the container network, so direct browser calls
 *    fail outright.
 *  - Direct calls are cross-origin, so they need CORS to be opened up on every
 *    monitoring backend.
 *  - It forces the monitoring backends to be published to the user's network.
 *
 * Instead the browser calls `/api/proxy/<service>/<upstream path>` and this
 * module forwards the request server-side. Every request is matched against an
 * explicit allowlist so that mutating and administrative upstream endpoints
 * (for example Prometheus' `admin/tsdb/delete_series`, which is enabled by
 * `--web.enable-admin-api`, or Loki's `push`) can never be reached through the
 * proxy.
 */

import { serviceConfigManager, type ServiceConnectionConfig } from '../service-config';

export const UPSTREAM_SERVICES = ['prometheus', 'loki', 'alertmanager'] as const;

export type UpstreamService = (typeof UPSTREAM_SERVICES)[number];

export type UpstreamMethod = 'GET' | 'POST' | 'DELETE';

/** Methods the proxy is willing to forward at all. */
export const SUPPORTED_METHODS: readonly UpstreamMethod[] = ['GET', 'POST', 'DELETE'];

interface RouteRule {
  /** Matched against the normalised upstream path (no leading slash). */
  pattern: RegExp;
  methods: readonly UpstreamMethod[];
  /**
   * True when the rule changes upstream state. Mutating rules require a
   * privileged role, read-only rules only require a signed-in user.
   */
  mutating?: boolean;
}

/**
 * Read-only Prometheus HTTP API surface used by the dashboard.
 * `query` and `query_range` accept POST as well because long PromQL
 * expressions exceed practical URL length limits - that is still a read.
 */
const PROMETHEUS_RULES: readonly RouteRule[] = [
  { pattern: /^api\/v1\/(query|query_range)$/, methods: ['GET', 'POST'] },
  {
    pattern: /^api\/v1\/(series|labels|metadata|targets|rules|alerts|alertmanagers)$/,
    methods: ['GET'],
  },
  { pattern: /^api\/v1\/label\/[A-Za-z_][A-Za-z0-9_]*\/values$/, methods: ['GET'] },
  { pattern: /^api\/v1\/targets\/metadata$/, methods: ['GET'] },
  {
    pattern: /^api\/v1\/status\/(config|flags|runtimeinfo|buildinfo|tsdb|walreplay)$/,
    methods: ['GET'],
  },
  { pattern: /^-\/(healthy|ready)$/, methods: ['GET'] },
];

/**
 * Loki read API. `loki/api/v1/push` is deliberately absent: the dashboard never
 * writes logs, and exposing push through an authenticated proxy would let any
 * signed-in user forge log lines.
 */
const LOKI_RULES: readonly RouteRule[] = [
  {
    pattern: /^loki\/api\/v1\/(query|query_range|labels|series|tail)$/,
    methods: ['GET'],
  },
  { pattern: /^loki\/api\/v1\/label$/, methods: ['GET'] },
  { pattern: /^loki\/api\/v1\/label\/[^/]+\/values$/, methods: ['GET'] },
  { pattern: /^loki\/api\/v1\/index\/(stats|volume|volume_range)$/, methods: ['GET'] },
  { pattern: /^ready$/, methods: ['GET'] },
];

/**
 * Alertmanager v2 API. Silence creation/expiry is exposed because the alerts
 * page needs it, but it is marked mutating so it is gated behind a role.
 */
const ALERTMANAGER_RULES: readonly RouteRule[] = [
  {
    pattern: /^api\/v2\/(status|receivers|alerts|alerts\/groups|silences)$/,
    methods: ['GET'],
  },
  { pattern: /^api\/v2\/silence\/[A-Za-z0-9._-]+$/, methods: ['GET'] },
  { pattern: /^api\/v2\/silences$/, methods: ['POST'], mutating: true },
  { pattern: /^api\/v2\/silence\/[A-Za-z0-9._-]+$/, methods: ['DELETE'], mutating: true },
  { pattern: /^-\/(healthy|ready)$/, methods: ['GET'] },
];

const RULES: Record<UpstreamService, readonly RouteRule[]> = {
  prometheus: PROMETHEUS_RULES,
  loki: LOKI_RULES,
  alertmanager: ALERTMANAGER_RULES,
};

export function isUpstreamService(value: string): value is UpstreamService {
  return (UPSTREAM_SERVICES as readonly string[]).includes(value);
}

export function isSupportedMethod(value: string): value is UpstreamMethod {
  return (SUPPORTED_METHODS as readonly string[]).includes(value);
}

/**
 * Join and validate the catch-all route segments into an upstream path.
 *
 * Returns `null` for anything that could escape the intended upstream path:
 * empty segments, traversal, embedded separators, NUL bytes, scheme-like
 * segments or invalid percent-encoding.
 */
export function normalizeUpstreamPath(segments: readonly string[]): string | null {
  if (!segments || segments.length === 0) {
    return null;
  }

  const decoded: string[] = [];

  for (const segment of segments) {
    if (typeof segment !== 'string' || segment.length === 0) {
      return null;
    }

    let value: string;
    try {
      value = decodeURIComponent(segment);
    } catch {
      // Malformed percent-encoding.
      return null;
    }

    if (
      value === '.' ||
      value === '..' ||
      value.includes('/') ||
      value.includes('\\') ||
      value.includes('\0') ||
      value.includes('#') ||
      value.includes('?')
    ) {
      return null;
    }

    decoded.push(value);
  }

  return decoded.join('/');
}

export interface UpstreamDecision {
  allowed: boolean;
  /** True when the matched rule changes upstream state. */
  mutating: boolean;
  reason?: string;
}

const DENIED: UpstreamDecision = { allowed: false, mutating: false, reason: 'not_allowed' };

/**
 * Decide whether `method path` may be forwarded to `service`.
 * Anything not explicitly listed is denied.
 */
export function checkUpstreamRequest(
  service: UpstreamService,
  path: string,
  method: string
): UpstreamDecision {
  if (!isSupportedMethod(method)) {
    return { allowed: false, mutating: false, reason: 'method_not_supported' };
  }

  const rules = RULES[service];
  if (!rules) {
    return { allowed: false, mutating: false, reason: 'unknown_service' };
  }

  for (const rule of rules) {
    if (rule.pattern.test(path) && rule.methods.includes(method)) {
      return { allowed: true, mutating: rule.mutating === true };
    }
  }

  return DENIED;
}

/**
 * Build the absolute upstream URL. Path segments are re-encoded so that a
 * validated segment cannot alter the URL structure.
 */
export function buildUpstreamUrl(
  service: UpstreamService,
  path: string,
  search?: string
): string {
  const base = serviceConfigManager
    .getServiceConfig(service as keyof ServiceConnectionConfig)
    .url.replace(/\/+$/, '');

  const encoded = path
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');

  const query = search && search !== '?' ? (search.startsWith('?') ? search : `?${search}`) : '';

  return `${base}/${encoded}${query}`;
}

export interface ForwardOptions {
  service: UpstreamService;
  path: string;
  method: UpstreamMethod;
  search?: string;
  body?: string;
  contentType?: string | null;
  /** Overrides the per-service configured timeout. */
  timeoutMs?: number;
}

export interface ForwardResult {
  status: number;
  body: string;
  contentType: string;
}

/**
 * Forward an already-authorised request to the upstream service.
 *
 * Connection failures are translated into 502/504 with a JSON body so the
 * dashboard can render a meaningful message instead of a parse error.
 */
export async function forwardToUpstream(options: ForwardOptions): Promise<ForwardResult> {
  const { service, path, method, search, body, contentType } = options;
  const serviceCfg = serviceConfigManager.getServiceConfig(
    service as keyof ServiceConnectionConfig
  );

  if (serviceCfg.enabled === false) {
    return {
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({
        status: 'error',
        errorType: 'service_disabled',
        error: `${service} is disabled by configuration`,
      }),
    };
  }

  const url = buildUpstreamUrl(service, path, search);
  const timeoutMs = options.timeoutMs ?? serviceCfg.timeout ?? 30000;

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined && contentType) {
    headers['Content-Type'] = contentType;
  }

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: method === 'GET' ? undefined : body,
      cache: 'no-store',
      signal: AbortSignal.timeout(timeoutMs),
    });

    return {
      status: response.status,
      contentType: response.headers.get('content-type') ?? 'application/json',
      body: await response.text(),
    };
  } catch (error) {
    const isTimeout =
      error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError');

    return {
      status: isTimeout ? 504 : 502,
      contentType: 'application/json',
      body: JSON.stringify({
        status: 'error',
        errorType: isTimeout ? 'timeout' : 'upstream_unreachable',
        error: isTimeout
          ? `${service} did not respond within ${timeoutMs}ms`
          : `Unable to reach ${service}. Check that the service is running and reachable from the dashboard.`,
      }),
    };
  }
}
