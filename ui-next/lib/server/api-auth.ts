/**
 * Authentication and authorisation helpers for route handlers.
 *
 * The Next.js proxy (middleware) matcher deliberately excludes `/api`, because
 * redirecting an API call to the sign-in page produces an HTML response that
 * breaks every client. API routes therefore enforce access here and return
 * proper 401/403 JSON instead.
 */

import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';
import { getAuthSecret } from '../auth-secret';

export type Role = 'ADMIN' | 'EDITOR' | 'VIEWER';

/** Roles permitted to change state (silences, notification config, test sends). */
export const WRITE_ROLES: readonly Role[] = ['ADMIN', 'EDITOR'];

export interface ApiIdentity {
  subject: string;
  email?: string;
  role: Role;
}

export interface AuthSuccess {
  ok: true;
  identity: ApiIdentity;
}

export interface AuthFailure {
  ok: false;
  response: NextResponse;
}

export type AuthResult = AuthSuccess | AuthFailure;

function normalizeRole(value: unknown): Role {
  return value === 'ADMIN' || value === 'EDITOR' ? value : 'VIEWER';
}

function unauthorized(message: string): NextResponse {
  return NextResponse.json(
    { error: 'unauthorized', message },
    { status: 401, headers: { 'Cache-Control': 'no-store' } }
  );
}

function forbidden(message: string): NextResponse {
  return NextResponse.json(
    { error: 'forbidden', message },
    { status: 403, headers: { 'Cache-Control': 'no-store' } }
  );
}

/**
 * Resolve the caller's identity from the NextAuth JWT cookie.
 * Returns `null` when the request is anonymous.
 */
export async function getIdentity(request: NextRequest): Promise<ApiIdentity | null> {
  const secret = getAuthSecret();

  const token = await getToken({ req: request, secret });
  if (!token?.sub) {
    return null;
  }

  return {
    subject: token.sub,
    email: typeof token.email === 'string' ? token.email : undefined,
    role: normalizeRole((token as { role?: unknown }).role),
  };
}

/**
 * Require a signed-in caller, optionally holding one of `allowedRoles`.
 */
export async function requireAuth(
  request: NextRequest,
  allowedRoles?: readonly Role[]
): Promise<AuthResult> {
  const identity = await getIdentity(request);

  if (!identity) {
    return { ok: false, response: unauthorized('Sign in to access this endpoint.') };
  }

  if (allowedRoles && !allowedRoles.includes(identity.role)) {
    return {
      ok: false,
      response: forbidden(`Requires one of: ${allowedRoles.join(', ')}.`),
    };
  }

  return { ok: true, identity };
}

/**
 * Constant-time string comparison, used for shared-secret checks so that a
 * timing side channel cannot be used to recover the token byte by byte.
 */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

/**
 * Verify a machine-to-machine caller (Alertmanager) against
 * `ALERT_WEBHOOK_TOKEN`.
 *
 * When the variable is unset the webhook stays open so that existing
 * deployments keep working, but a warning is logged. Set the variable to
 * require `Authorization: Bearer <token>` or `X-Webhook-Token`.
 */
export function verifyWebhookToken(request: NextRequest): boolean {
  const expected = process.env.ALERT_WEBHOOK_TOKEN;

  if (!expected) {
    console.warn(
      'ALERT_WEBHOOK_TOKEN is not set - /api/notifications/webhook accepts unauthenticated posts. ' +
        'Set ALERT_WEBHOOK_TOKEN to require a shared secret.'
    );
    return true;
  }

  const header = request.headers.get('authorization');
  const bearer = header?.toLowerCase().startsWith('bearer ') ? header.slice(7).trim() : null;
  const provided = bearer ?? request.headers.get('x-webhook-token');

  return typeof provided === 'string' && safeEqual(provided, expected);
}

export { unauthorized, forbidden };
