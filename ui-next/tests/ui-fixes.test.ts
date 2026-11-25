import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextRequest } from 'next/server';
import { parseSslTarget } from '@/lib/ssl-target';
import { filterDashboardTemplates } from '@/lib/template-filters';
import { dashboardTemplates } from '@/lib/dashboard-templates';
import { TemplateImportService } from '@/lib/template-import-service';
import { POST as forgotPasswordPost } from '@/app/api/auth/forgot-password/route';
import { DefaultPluginManager } from '@/lib/plugins/manager';
import { GitHubActionsPlugin } from '@/lib/plugins/github-actions';

function jsonRequest(body: unknown, rawText?: string): NextRequest {
  if (rawText !== undefined) {
    return {
      json: async () => JSON.parse(rawText),
    } as unknown as NextRequest;
  }
  return {
    json: async () => body,
  } as unknown as NextRequest;
}

describe('parseSslTarget', () => {
  it('defaults to port 443 for bare hostnames and URLs', () => {
    expect(parseSslTarget('example.com')).toEqual({ host: 'example.com', port: 443 });
    expect(parseSslTarget('https://api.example.com/health')).toEqual({
      host: 'api.example.com',
      port: 443,
    });
  });

  it('extracts embedded :port and supports IPv6 brackets', () => {
    expect(parseSslTarget('example.com:8443')).toEqual({ host: 'example.com', port: 8443 });
    expect(parseSslTarget('[::1]:9443')).toEqual({ host: '::1', port: 9443 });
  });

  it('prefers explicit port when valid', () => {
    expect(parseSslTarget('example.com:8443', 9000)).toEqual({
      host: 'example.com',
      port: 9000,
    });
  });

  it('rejects empty hosts and out-of-range or non-numeric ports', () => {
    expect(parseSslTarget('')).toBeNull();
    expect(parseSslTarget('example.com:0')).toBeNull();
    expect(parseSslTarget('example.com:65536')).toBeNull();
    expect(parseSslTarget('example.com:abc')).toBeNull();
    expect(parseSslTarget('example.com', '70000')).toBeNull();
  });
});

describe('filterDashboardTemplates', () => {
  it('combines category, difficulty, and searchQuery instead of wiping earlier filters', () => {
    const result = filterDashboardTemplates(dashboardTemplates, {
      category: 'database',
      difficulty: 'beginner',
      searchQuery: 'postgresql',
    });

    expect(result.length).toBeGreaterThan(0);
    expect(
      result.every(
        (tpl) => tpl.category === 'database' && tpl.difficulty === 'beginner'
      )
    ).toBe(true);

    // Search query matching a kubernetes template must still respect database category
    const mismatch = filterDashboardTemplates(dashboardTemplates, {
      category: 'database',
      difficulty: 'all',
      searchQuery: 'kubernetes',
    });
    expect(mismatch).toHaveLength(0);

    // Difficulty mismatch should yield zero even if searchQuery matches
    const wrongDifficulty = filterDashboardTemplates(dashboardTemplates, {
      category: 'database',
      difficulty: 'advanced',
      searchQuery: 'postgresql',
    });
    expect(wrongDifficulty).toHaveLength(0);
  });

  it('returns all templates when filters are set to defaults', () => {
    const result = filterDashboardTemplates(dashboardTemplates, {});
    expect(result).toHaveLength(dashboardTemplates.length);
  });
});

describe('TemplateImportService.importFromJSON', () => {
  it('imports a valid serialized template', () => {
    const raw = TemplateImportService.exportTemplate(dashboardTemplates[0]);
    const res = TemplateImportService.importFromJSON(raw);
    expect(res.success).toBe(true);
    expect(res.template?.id).toBe(dashboardTemplates[0].id);
  });

  it('returns an explicit error on invalid JSON or missing required fields', () => {
    const badJson = TemplateImportService.importFromJSON('{not-json');
    expect(badJson.success).toBe(false);
    expect(badJson.error).toBeTruthy();

    const missingFields = TemplateImportService.importFromJSON(
      JSON.stringify({ name: 'Incomplete' })
    );
    expect(missingFields.success).toBe(false);
    expect(missingFields.error).toContain('Missing required field');
  });
});

describe('POST /api/auth/forgot-password', () => {
  let savedDemoAuth: string | undefined;

  beforeEach(() => {
    savedDemoAuth = process.env.ENABLE_DEMO_AUTH;
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    if (savedDemoAuth === undefined) {
      delete process.env.ENABLE_DEMO_AUTH;
    } else {
      process.env.ENABLE_DEMO_AUTH = savedDemoAuth;
    }
    vi.restoreAllMocks();
  });

  it('returns 400 JSON for malformed JSON or invalid email addresses', async () => {
    const badPayload = await forgotPasswordPost(jsonRequest(null, '{bad'));
    expect(badPayload.status).toBe(400);

    const invalidEmail = await forgotPasswordPost(jsonRequest({ email: 'not-an-email' }));
    expect(invalidEmail.status).toBe(400);
    const data = await invalidEmail.json();
    expect(data.message).toMatch(/valid email/i);
  });

  it('returns 200 JSON in demo mode and 501 JSON when demo auth is disabled', async () => {
    process.env.ENABLE_DEMO_AUTH = 'true';
    const demoRes = await forgotPasswordPost(jsonRequest({ email: 'demo@example.com' }));
    expect(demoRes.status).toBe(200);
    const demoBody = await demoRes.json();
    expect(demoBody.ok).toBe(true);
    expect(demoBody.demo).toBe(true);

    process.env.ENABLE_DEMO_AUTH = 'false';
    const prodRes = await forgotPasswordPost(jsonRequest({ email: 'user@example.com' }));
    expect(prodRes.status).toBe(501);
    const prodBody = await prodRes.json();
    expect(prodBody.message).toMatch(/disabled/i);
  });
});

describe('DefaultPluginManager lifecycle', () => {
  it('validates required plugin fields and manages instance lifecycle cleanly', async () => {
    const manager = new DefaultPluginManager();
    manager.registry.register(new GitHubActionsPlugin());

    await expect(
      manager.installPlugin('github-actions', {
        pluginId: 'github-actions',
        instanceId: 'gh-invalid',
        name: 'Missing Token',
        enabled: true,
        config: { repository: 'octocat/hello-world' },
        lastUpdated: new Date(),
      })
    ).rejects.toThrow(/personalAccessToken/);

    await manager.installPlugin('github-actions', {
      pluginId: 'github-actions',
      instanceId: 'gh-1',
      name: 'My GitHub Repo',
      enabled: true,
      config: {
        repository: 'octocat/hello-world',
        personalAccessToken: 'test-token',
      },
      lastUpdated: new Date(),
    });

    expect(manager.getPluginInstances('github-actions')).toHaveLength(1);

    await manager.disablePlugin('github-actions', 'gh-1');
    expect(manager.getPluginInstances('github-actions')[0].enabled).toBe(false);

    await manager.enablePlugin('github-actions', 'gh-1');
    expect(manager.getPluginInstances('github-actions')[0].enabled).toBe(true);

    await manager.uninstallPlugin('github-actions', 'gh-1');
    expect(manager.getPluginInstances('github-actions')).toHaveLength(0);
  });
});
