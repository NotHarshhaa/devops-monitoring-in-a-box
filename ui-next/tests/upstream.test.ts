import { describe, expect, it } from 'vitest';
import {
  buildUpstreamUrl,
  checkUpstreamRequest,
  isSupportedMethod,
  isUpstreamService,
  normalizeUpstreamPath,
} from '@/lib/server/upstream';

describe('isUpstreamService', () => {
  it('accepts the three proxied backends', () => {
    expect(isUpstreamService('prometheus')).toBe(true);
    expect(isUpstreamService('loki')).toBe(true);
    expect(isUpstreamService('alertmanager')).toBe(true);
  });

  it('rejects anything else', () => {
    expect(isUpstreamService('grafana')).toBe(false);
    expect(isUpstreamService('')).toBe(false);
    expect(isUpstreamService('PROMETHEUS')).toBe(false);
  });
});

describe('isSupportedMethod', () => {
  it('allows only GET, POST and DELETE', () => {
    expect(isSupportedMethod('GET')).toBe(true);
    expect(isSupportedMethod('POST')).toBe(true);
    expect(isSupportedMethod('DELETE')).toBe(true);
    expect(isSupportedMethod('PUT')).toBe(false);
    expect(isSupportedMethod('PATCH')).toBe(false);
    expect(isSupportedMethod('OPTIONS')).toBe(false);
  });
});

describe('normalizeUpstreamPath', () => {
  it('joins valid segments', () => {
    expect(normalizeUpstreamPath(['api', 'v1', 'query'])).toBe('api/v1/query');
  });

  it('decodes percent-encoded segments', () => {
    expect(normalizeUpstreamPath(['api', 'v1', 'label', 'job%20name', 'values'])).toBe(
      'api/v1/label/job name/values'
    );
  });

  it('rejects an empty segment list', () => {
    expect(normalizeUpstreamPath([])).toBeNull();
  });

  it.each([
    ['traversal', ['api', '..', 'admin']],
    ['single dot', ['api', '.']],
    ['empty segment', ['api', '', 'query']],
    ['encoded separator', ['api', '%2f..%2fadmin']],
    ['backslash', ['api', 'v1\\query']],
    ['null byte', ['api', 'v1%00']],
    ['fragment', ['api', 'v1#frag']],
    ['query string', ['api', 'v1?x=1']],
    ['malformed encoding', ['api', '%zz']],
  ])('rejects %s', (_label, segments) => {
    expect(normalizeUpstreamPath(segments as string[])).toBeNull();
  });
});

describe('checkUpstreamRequest - Prometheus', () => {
  it('allows instant and range queries over GET and POST', () => {
    for (const path of ['api/v1/query', 'api/v1/query_range']) {
      expect(checkUpstreamRequest('prometheus', path, 'GET')).toEqual({
        allowed: true,
        mutating: false,
      });
      expect(checkUpstreamRequest('prometheus', path, 'POST')).toEqual({
        allowed: true,
        mutating: false,
      });
    }
  });

  it('allows metadata and status reads', () => {
    for (const path of [
      'api/v1/labels',
      'api/v1/series',
      'api/v1/targets',
      'api/v1/rules',
      'api/v1/alerts',
      'api/v1/metadata',
      'api/v1/label/job/values',
      'api/v1/status/config',
      'api/v1/status/tsdb',
      '-/healthy',
    ]) {
      expect(checkUpstreamRequest('prometheus', path, 'GET').allowed).toBe(true);
    }
  });

  // The compose stack can enable --web.enable-admin-api; the proxy must never
  // expose destructive endpoints even when it is on.
  it('denies the admin API', () => {
    expect(
      checkUpstreamRequest('prometheus', 'api/v1/admin/tsdb/delete_series', 'POST').allowed
    ).toBe(false);
    expect(
      checkUpstreamRequest('prometheus', 'api/v1/admin/tsdb/clean_tombstones', 'POST').allowed
    ).toBe(false);
    expect(checkUpstreamRequest('prometheus', 'api/v1/admin/tsdb/snapshot', 'POST').allowed).toBe(
      false
    );
  });

  it('denies lifecycle and write endpoints', () => {
    expect(checkUpstreamRequest('prometheus', '-/reload', 'POST').allowed).toBe(false);
    expect(checkUpstreamRequest('prometheus', '-/quit', 'POST').allowed).toBe(false);
    expect(checkUpstreamRequest('prometheus', 'api/v1/write', 'POST').allowed).toBe(false);
  });

  it('denies DELETE entirely', () => {
    expect(checkUpstreamRequest('prometheus', 'api/v1/query', 'DELETE').allowed).toBe(false);
  });

  it('denies unsupported methods', () => {
    expect(checkUpstreamRequest('prometheus', 'api/v1/query', 'PUT')).toEqual({
      allowed: false,
      mutating: false,
      reason: 'method_not_supported',
    });
  });
});

describe('checkUpstreamRequest - Loki', () => {
  it('allows log reads', () => {
    for (const path of [
      'loki/api/v1/query',
      'loki/api/v1/query_range',
      'loki/api/v1/labels',
      'loki/api/v1/label/job/values',
      'loki/api/v1/index/stats',
      'ready',
    ]) {
      expect(checkUpstreamRequest('loki', path, 'GET').allowed).toBe(true);
    }
  });

  // Allowing push would let any signed-in user forge log lines.
  it('denies the push endpoint', () => {
    expect(checkUpstreamRequest('loki', 'loki/api/v1/push', 'POST').allowed).toBe(false);
    expect(checkUpstreamRequest('loki', 'loki/api/v1/push', 'GET').allowed).toBe(false);
  });

  it('denies the delete API', () => {
    expect(checkUpstreamRequest('loki', 'loki/api/v1/delete', 'POST').allowed).toBe(false);
    expect(checkUpstreamRequest('loki', 'loki/api/v1/delete', 'DELETE').allowed).toBe(false);
  });
});

describe('checkUpstreamRequest - Alertmanager', () => {
  it('allows alert and silence reads without marking them mutating', () => {
    expect(checkUpstreamRequest('alertmanager', 'api/v2/alerts', 'GET')).toEqual({
      allowed: true,
      mutating: false,
    });
    expect(checkUpstreamRequest('alertmanager', 'api/v2/silences', 'GET')).toEqual({
      allowed: true,
      mutating: false,
    });
    expect(checkUpstreamRequest('alertmanager', 'api/v2/status', 'GET').allowed).toBe(true);
  });

  it('marks silence creation and deletion as mutating', () => {
    expect(checkUpstreamRequest('alertmanager', 'api/v2/silences', 'POST')).toEqual({
      allowed: true,
      mutating: true,
    });
    expect(
      checkUpstreamRequest('alertmanager', 'api/v2/silence/9f8b1c2d-0000-4aaa-bbbb-1234567890ab', 'DELETE')
    ).toEqual({ allowed: true, mutating: true });
  });

  it('rejects silence ids containing path characters', () => {
    expect(checkUpstreamRequest('alertmanager', 'api/v2/silence/../../status', 'DELETE').allowed).toBe(
      false
    );
  });
});

describe('buildUpstreamUrl', () => {
  it('joins the configured base with the path', () => {
    expect(buildUpstreamUrl('prometheus', 'api/v1/query')).toMatch(/\/api\/v1\/query$/);
  });

  it('appends a query string, adding the leading question mark when absent', () => {
    expect(buildUpstreamUrl('prometheus', 'api/v1/query', '?query=up')).toMatch(/\?query=up$/);
    expect(buildUpstreamUrl('prometheus', 'api/v1/query', 'query=up')).toMatch(/\?query=up$/);
  });

  it('ignores an empty query string', () => {
    expect(buildUpstreamUrl('prometheus', 'api/v1/query', '?')).not.toContain('?');
    expect(buildUpstreamUrl('prometheus', 'api/v1/query', '')).not.toContain('?');
  });

  it('re-encodes path segments so they cannot alter the URL structure', () => {
    const url = buildUpstreamUrl('prometheus', 'api/v1/label/weird name/values');
    expect(url).toContain('weird%20name');
  });
});
