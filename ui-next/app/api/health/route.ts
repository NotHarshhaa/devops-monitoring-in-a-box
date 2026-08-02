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
 *   GET /api/health?strict=true  503 when any upstream is down (for uptime probes)
 *
 * Unauthenticated responses omit internal service URLs and error details;
 * signed-in callers receive the full report, which is what the Services page
 * renders.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getIdentity } from '@/lib/server/api-auth';
import { collectHealth, redactHealthReport } from '@/lib/server/health';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const strict = request.nextUrl.searchParams.get('strict') === 'true';

  let report;
  try {
    report = await collectHealth();
  } catch (error) {
    // The dashboard is still alive; report the probing failure explicitly.
    return NextResponse.json(
      {
        status: 'ok',
        upstreamStatus: 'unhealthy',
        error: error instanceof Error ? error.message : 'Health probing failed',
        timestamp: new Date().toISOString(),
      },
      { status: strict ? 503 : 200, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const identity = await getIdentity(request).catch(() => null);
  const body = identity ? report : redactHealthReport(report);

  const status = strict && report.upstreamStatus !== 'healthy' ? 503 : 200;

  return NextResponse.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  });
}

/** Lightweight liveness probe for orchestrators that only need a status code. */
export async function HEAD() {
  return new NextResponse(null, {
    status: 200,
    headers: { 'Cache-Control': 'no-store' },
  });
}
