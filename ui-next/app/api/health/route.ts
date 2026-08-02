/**
 * Health endpoint.
 *
 * `docker-compose.yml` and the Dockerfile healthcheck both probe this route, so
 * it must stay reachable without authentication. It answers 200 whenever the
 * dashboard process itself is serving traffic - a downstream service being
 * unavailable must not mark the UI container unhealthy and take it out of
 * rotation.
 *
 *   GET /api/health              liveness + upstream summary
 *   GET /api/health?live=1       process liveness only (no upstream probes)
 *   GET /api/health?strict=true  503 when any upstream is down (for uptime probes)
 *   HEAD /api/health             process liveness only
 *
 * Unauthenticated responses omit internal service URLs and error details;
 * signed-in callers receive the full report, which is what the Services page
 * renders.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getIdentity } from '@/lib/server/api-auth';
import {
  collectHealth,
  redactHealthReport,
  HEALTH_PROBE_HEADER,
} from '@/lib/server/health';

export const dynamic = 'force-dynamic';

const NO_STORE = { 'Cache-Control': 'no-store' } as const;

function livenessBody() {
  return {
    status: 'ok' as const,
    timestamp: new Date().toISOString(),
  };
}

export async function GET(request: NextRequest) {
  const liveOnly =
    request.nextUrl.searchParams.get('live') === '1' ||
    request.nextUrl.searchParams.get('live') === 'true' ||
    request.headers.get(HEALTH_PROBE_HEADER) === '1';

  // Fast path: orchestrator liveness or an outbound probe that accidentally
  // hit this process (misconfigured Grafana URL on the same host:port).
  if (liveOnly) {
    return NextResponse.json(livenessBody(), { status: 200, headers: NO_STORE });
  }

  const strict = request.nextUrl.searchParams.get('strict') === 'true';
  const force = request.nextUrl.searchParams.get('refresh') === 'true';

  let report;
  try {
    report = await collectHealth({ force });
  } catch (error) {
    // The dashboard is still alive; report the probing failure explicitly.
    return NextResponse.json(
      {
        status: 'ok',
        upstreamStatus: 'unhealthy',
        error: error instanceof Error ? error.message : 'Health probing failed',
        timestamp: new Date().toISOString(),
      },
      { status: strict ? 503 : 200, headers: NO_STORE }
    );
  }

  const identity = await getIdentity(request).catch(() => null);
  const body = identity ? report : redactHealthReport(report);

  const status = strict && report.upstreamStatus !== 'healthy' ? 503 : 200;

  return NextResponse.json(body, {
    status,
    headers: NO_STORE,
  });
}

/** Lightweight liveness probe for orchestrators that only need a status code. */
export async function HEAD() {
  return new NextResponse(null, {
    status: 200,
    headers: NO_STORE,
  });
}
