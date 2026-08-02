/**
 * Same-origin proxy for the monitoring backends.
 *
 *   /api/proxy/prometheus/api/v1/query          -> http://prometheus:9090/api/v1/query
 *   /api/proxy/loki/loki/api/v1/query_range     -> http://loki:3100/loki/api/v1/query_range
 *   /api/proxy/alertmanager/api/v2/alerts       -> http://alertmanager:9093/api/v2/alerts
 *
 * The upstream path is forwarded verbatim, which keeps the existing API client
 * code unchanged - only its base URL differs in the browser.
 *
 * Every request must be authenticated, and the path/method pair must appear in
 * the allowlist in `lib/server/upstream.ts`.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { requireAuth, WRITE_ROLES } from '@/lib/server/api-auth';
import {
  checkUpstreamRequest,
  forwardToUpstream,
  isSupportedMethod,
  isUpstreamService,
  normalizeUpstreamPath,
  type UpstreamMethod,
} from '@/lib/server/upstream';

export const dynamic = 'force-dynamic';

const NO_STORE = { 'Cache-Control': 'no-store' } as const;

interface RouteContext {
  params: Promise<{ service: string; path: string[] }>;
}

async function handle(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  const method = request.method.toUpperCase();

  if (!isSupportedMethod(method)) {
    return NextResponse.json(
      { error: 'method_not_allowed', message: `${method} is not proxied.` },
      { status: 405, headers: NO_STORE }
    );
  }

  const { service, path: segments } = await context.params;

  if (!isUpstreamService(service)) {
    return NextResponse.json(
      {
        error: 'unknown_service',
        message: `Unknown upstream '${service}'. Expected prometheus, loki or alertmanager.`,
      },
      { status: 404, headers: NO_STORE }
    );
  }

  const path = normalizeUpstreamPath(segments ?? []);
  if (path === null) {
    return NextResponse.json(
      { error: 'invalid_path', message: 'The requested upstream path is not valid.' },
      { status: 400, headers: NO_STORE }
    );
  }

  const decision = checkUpstreamRequest(service, path, method as UpstreamMethod);
  if (!decision.allowed) {
    return NextResponse.json(
      {
        error: 'endpoint_not_allowed',
        message: `${method} /${path} is not an allowed ${service} endpoint.`,
      },
      { status: 403, headers: NO_STORE }
    );
  }

  // Read-only calls need a signed-in user; mutating calls need a write role.
  const auth = await requireAuth(request, decision.mutating ? WRITE_ROLES : undefined);
  if (!auth.ok) {
    return auth.response;
  }

  const body = method === 'GET' ? undefined : await request.text();

  const result = await forwardToUpstream({
    service,
    path,
    method: method as UpstreamMethod,
    search: request.nextUrl.search,
    body,
    contentType: request.headers.get('content-type'),
  });

  return new NextResponse(result.body, {
    status: result.status,
    headers: {
      'Content-Type': result.contentType,
      ...NO_STORE,
    },
  });
}

export async function GET(request: NextRequest, context: RouteContext) {
  return handle(request, context);
}

export async function POST(request: NextRequest, context: RouteContext) {
  return handle(request, context);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  return handle(request, context);
}
