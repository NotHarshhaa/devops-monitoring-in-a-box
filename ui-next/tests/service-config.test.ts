import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * `service-config` reads process.env when the module is first evaluated, so each
 * scenario resets the module registry and re-imports it with a fresh
 * environment.
 */
async function loadServiceConfig(env: Record<string, string | undefined>) {
  vi.resetModules();

  for (const [key, value] of Object.entries(env)) {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }

  return import('@/lib/service-config');
}

const MANAGED_KEYS = [
  'DOCKER_ENV',
  'KUBERNETES_SERVICE_HOST',
  'VERCEL',
  'NODE_ENV',
  'PROMETHEUS_URL',
  'NEXT_PUBLIC_PROMETHEUS_URL',
  'LOKI_URL',
  'NEXT_PUBLIC_LOKI_URL',
] as const;

let saved: Record<string, string | undefined>;

beforeEach(() => {
  saved = Object.fromEntries(MANAGED_KEYS.map((key) => [key, process.env[key]]));
  for (const key of MANAGED_KEYS) {
    delete process.env[key];
  }
});

afterEach(() => {
  for (const [key, value] of Object.entries(saved)) {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
  vi.unstubAllGlobals();
});

describe('isDockerEnvironment', () => {
  it('is true when DOCKER_ENV is set', async () => {
    const mod = await loadServiceConfig({ DOCKER_ENV: 'true' });
    expect(mod.isDockerEnvironment()).toBe(true);
  });

  it('is true inside Kubernetes', async () => {
    const mod = await loadServiceConfig({ KUBERNETES_SERVICE_HOST: '10.0.0.1' });
    expect(mod.isDockerEnvironment()).toBe(true);
  });

  // Regression: NODE_ENV=production used to imply container hostnames, so a
  // plain `next start` or a Vercel deployment resolved Prometheus to
  // http://prometheus:9090 and could never connect.
  it('is false for a non-container production build', async () => {
    const mod = await loadServiceConfig({ NODE_ENV: 'production' });
    expect(mod.isDockerEnvironment()).toBe(false);
    expect(mod.serviceConfig.prometheus.url).toBe('http://localhost:9090');
  });

  it('is false on Vercel', async () => {
    const mod = await loadServiceConfig({ NODE_ENV: 'production', VERCEL: '1' });
    expect(mod.isDockerEnvironment()).toBe(false);
  });
});

describe('service URL resolution', () => {
  it('uses container hostnames inside Docker', async () => {
    const mod = await loadServiceConfig({ DOCKER_ENV: 'true' });
    expect(mod.serviceConfig.prometheus.url).toBe('http://prometheus:9090');
    expect(mod.serviceConfig.loki.url).toBe('http://loki:3100');
    expect(mod.serviceConfig.alertmanager.url).toBe('http://alertmanager:9093');
  });

  it('prefers the server-side override over everything else', async () => {
    const mod = await loadServiceConfig({
      DOCKER_ENV: 'true',
      PROMETHEUS_URL: 'http://prom.internal:9090',
      NEXT_PUBLIC_PROMETHEUS_URL: 'http://public:9090',
    });
    expect(mod.serviceConfig.prometheus.url).toBe('http://prom.internal:9090');
  });

  it('falls back to the legacy NEXT_PUBLIC_ variable for the upstream URL', async () => {
    const mod = await loadServiceConfig({
      DOCKER_ENV: 'true',
      NEXT_PUBLIC_PROMETHEUS_URL: 'http://legacy:9090',
    });
    expect(mod.serviceConfig.prometheus.url).toBe('http://legacy:9090');
  });

  // Browser links must never point at a container hostname.
  it('keeps publicUrl on localhost even inside Docker', async () => {
    const mod = await loadServiceConfig({ DOCKER_ENV: 'true' });
    expect(mod.serviceConfig.prometheus.publicUrl).toBe('http://localhost:9090');
    expect(mod.serviceConfig.grafana.publicUrl).toBe('http://localhost:3000');
  });

  it('uses NEXT_PUBLIC_ for publicUrl when provided', async () => {
    const mod = await loadServiceConfig({
      DOCKER_ENV: 'true',
      NEXT_PUBLIC_PROMETHEUS_URL: 'https://prom.example.com',
    });
    expect(mod.serviceConfig.prometheus.publicUrl).toBe('https://prom.example.com');
  });
});

describe('resolveClientBaseURL', () => {
  it('returns the upstream URL outside a browser', async () => {
    const mod = await loadServiceConfig({ DOCKER_ENV: 'true' });
    expect(mod.resolveClientBaseURL('prometheus', 'http://prometheus:9090')).toBe(
      'http://prometheus:9090'
    );
  });

  it('returns the same-origin proxy path in a browser', async () => {
    const mod = await loadServiceConfig({ DOCKER_ENV: 'true' });
    vi.stubGlobal('window', {} as unknown as Window);

    expect(mod.resolveClientBaseURL('prometheus', 'http://prometheus:9090')).toBe(
      '/api/proxy/prometheus'
    );
    expect(mod.resolveClientBaseURL('loki', 'http://loki:3100')).toBe('/api/proxy/loki');
    expect(mod.resolveClientBaseURL('alertmanager', 'http://alertmanager:9093')).toBe(
      '/api/proxy/alertmanager'
    );
  });

  // Grafana is opened directly in a new tab, not proxied.
  it('leaves non-proxied services untouched in a browser', async () => {
    const mod = await loadServiceConfig({ DOCKER_ENV: 'true' });
    vi.stubGlobal('window', {} as unknown as Window);

    expect(mod.resolveClientBaseURL('grafana', 'http://grafana:3000')).toBe('http://grafana:3000');
  });
});

describe('validateConfigs', () => {
  it('accepts the default configuration', async () => {
    const mod = await loadServiceConfig({ DOCKER_ENV: 'true' });
    const result = mod.serviceConfigManager.validateConfigs();
    expect(result.errors).toEqual([]);
    expect(result.valid).toBe(true);
  });
});
