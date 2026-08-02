import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextRequest } from 'next/server';
import { safeEqual, verifyWebhookToken } from '@/lib/server/api-auth';

/** Minimal NextRequest stand-in: verifyWebhookToken only reads headers. */
function requestWith(headers: Record<string, string>): NextRequest {
  const map = new Headers(headers);
  return { headers: map } as unknown as NextRequest;
}

describe('safeEqual', () => {
  it('matches identical strings', () => {
    expect(safeEqual('token', 'token')).toBe(true);
  });

  it('rejects different values and lengths', () => {
    expect(safeEqual('token', 'tokeN')).toBe(false);
    expect(safeEqual('token', 'token-extra')).toBe(false);
    expect(safeEqual('', 'x')).toBe(false);
  });
});

describe('verifyWebhookToken', () => {
  let saved: string | undefined;

  beforeEach(() => {
    saved = process.env.ALERT_WEBHOOK_TOKEN;
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    if (saved === undefined) {
      delete process.env.ALERT_WEBHOOK_TOKEN;
    } else {
      process.env.ALERT_WEBHOOK_TOKEN = saved;
    }
  });

  // Backwards compatibility: existing deployments must keep working, but the
  // open state has to be announced.
  it('allows any caller when no token is configured, and warns', () => {
    delete process.env.ALERT_WEBHOOK_TOKEN;
    expect(verifyWebhookToken(requestWith({}))).toBe(true);
    expect(console.warn).toHaveBeenCalled();
  });

  it('accepts a matching bearer token', () => {
    process.env.ALERT_WEBHOOK_TOKEN = 'shared-secret';
    expect(verifyWebhookToken(requestWith({ authorization: 'Bearer shared-secret' }))).toBe(true);
  });

  it('accepts a case-insensitive bearer scheme', () => {
    process.env.ALERT_WEBHOOK_TOKEN = 'shared-secret';
    expect(verifyWebhookToken(requestWith({ authorization: 'bearer shared-secret' }))).toBe(true);
  });

  it('accepts the X-Webhook-Token header', () => {
    process.env.ALERT_WEBHOOK_TOKEN = 'shared-secret';
    expect(verifyWebhookToken(requestWith({ 'x-webhook-token': 'shared-secret' }))).toBe(true);
  });

  it('rejects a wrong or missing token once configured', () => {
    process.env.ALERT_WEBHOOK_TOKEN = 'shared-secret';
    expect(verifyWebhookToken(requestWith({ authorization: 'Bearer nope' }))).toBe(false);
    expect(verifyWebhookToken(requestWith({ 'x-webhook-token': 'nope' }))).toBe(false);
    expect(verifyWebhookToken(requestWith({}))).toBe(false);
  });

  it('does not treat a non-bearer authorization header as a token', () => {
    process.env.ALERT_WEBHOOK_TOKEN = 'shared-secret';
    expect(verifyWebhookToken(requestWith({ authorization: 'Basic shared-secret' }))).toBe(false);
  });
});
