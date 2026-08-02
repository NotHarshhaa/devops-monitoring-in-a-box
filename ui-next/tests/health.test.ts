import { describe, expect, it } from 'vitest';
import {
  redactHealthReport,
  summarize,
  type HealthReport,
  type ServiceProbe,
} from '@/lib/server/health';

function probeStub(name: string, status: ServiceProbe['status']): ServiceProbe {
  return {
    key: name.toLowerCase(),
    name,
    description: `${name} service`,
    status,
    responseTime: 12,
    url: `http://${name.toLowerCase()}:9090`,
    publicUrl: `http://localhost:9090`,
    endpoint: '/-/healthy',
    error: status === 'down' ? 'Connection refused' : undefined,
  };
}

describe('summarize', () => {
  it('is healthy when everything is up', () => {
    const result = summarize([probeStub('Prometheus', 'up'), probeStub('Loki', 'up')]);
    expect(result.upstreamStatus).toBe('healthy');
    expect(result.summary).toEqual({ total: 2, up: 2, down: 0, disabled: 0 });
  });

  it('is degraded when some are down', () => {
    const result = summarize([probeStub('Prometheus', 'up'), probeStub('Loki', 'down')]);
    expect(result.upstreamStatus).toBe('degraded');
    expect(result.summary).toEqual({ total: 2, up: 1, down: 1, disabled: 0 });
  });

  // The previous threshold reported "degraded" when every single service was
  // down in a two-service stack, because 1 >= 2 * 0.5 was evaluated on stale
  // counts. Everything down must be unhealthy.
  it('is unhealthy when all are down', () => {
    const result = summarize([probeStub('Prometheus', 'down'), probeStub('Loki', 'down')]);
    expect(result.upstreamStatus).toBe('unhealthy');
    expect(result.summary).toEqual({ total: 2, up: 0, down: 2, disabled: 0 });
  });

  it('ignores disabled services when deciding overall status', () => {
    const result = summarize([probeStub('Prometheus', 'up'), probeStub('Loki', 'disabled')]);
    expect(result.upstreamStatus).toBe('healthy');
    expect(result.summary).toEqual({ total: 2, up: 1, down: 0, disabled: 1 });
  });

  it('is healthy for an empty stack rather than throwing', () => {
    const result = summarize([]);
    expect(result.upstreamStatus).toBe('healthy');
    expect(result.summary).toEqual({ total: 0, up: 0, down: 0, disabled: 0 });
  });
});

describe('redactHealthReport', () => {
  const report: HealthReport = {
    status: 'ok',
    upstreamStatus: 'degraded',
    version: '2.5.0',
    uptimeSeconds: 42,
    timestamp: '2026-01-01T00:00:00.000Z',
    services: [probeStub('Prometheus', 'up'), probeStub('Loki', 'down')],
    summary: { total: 2, up: 1, down: 1, disabled: 0 },
  };

  it('removes internal addresses and error detail', () => {
    const redacted = redactHealthReport(report);

    for (const service of redacted.services) {
      expect(service.url).toBeUndefined();
      expect(service.publicUrl).toBeUndefined();
      expect(service.endpoint).toBeUndefined();
      expect(service.error).toBeUndefined();
    }
    expect(JSON.stringify(redacted)).not.toContain('Connection refused');
  });

  it('keeps the status information a healthcheck needs', () => {
    const redacted = redactHealthReport(report);

    expect(redacted.status).toBe('ok');
    expect(redacted.upstreamStatus).toBe('degraded');
    expect(redacted.services.map((s) => s.status)).toEqual(['up', 'down']);
    expect(redacted.services.map((s) => s.name)).toEqual(['Prometheus', 'Loki']);
  });
});
