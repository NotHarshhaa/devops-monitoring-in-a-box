import { describe, expect, it } from 'vitest';
import type { NotificationsConfig } from '@/lib/config/types';
import {
  REDACTED,
  mergeNotificationSecrets,
  redactNotificationsConfig,
} from '@/lib/server/notifications-redact';

function sampleConfig(): NotificationsConfig {
  return {
    enabled: true,
    channels: {
      slack: {
        enabled: true,
        webhook_url: 'https://hooks.slack.com/services/T000/B000/XXXXsecret',
        default_channel: '#alerts',
      },
      teams: {
        enabled: false,
        webhook_url: '',
      },
      email: {
        enabled: true,
        smtp: {
          host: 'smtp.example.com',
          port: 587,
          secure: false,
          auth: { user: 'alerts@example.com', pass: 'super-secret-password' },
        },
        from: 'alerts@example.com',
        to: ['ops@example.com'],
      },
      webhook: {
        enabled: true,
        endpoints: [
          {
            name: 'pagerduty',
            url: 'https://events.pagerduty.com/v2/enqueue?token=abc123',
            headers: { Authorization: 'Bearer tok' },
          },
        ],
      },
    },
  };
}

describe('redactNotificationsConfig', () => {
  it('masks a populated webhook URL and flags it as set', () => {
    const redacted = redactNotificationsConfig(sampleConfig());
    expect(redacted.channels?.slack.webhook_url).toBe(REDACTED);
    expect(redacted.channels?.slack.webhook_url_set).toBe(true);
  });

  it('reports an empty webhook URL as not set', () => {
    const redacted = redactNotificationsConfig(sampleConfig());
    expect(redacted.channels?.teams.webhook_url).toBe('');
    expect(redacted.channels?.teams.webhook_url_set).toBe(false);
  });

  it('masks the SMTP password but keeps non-secret SMTP settings', () => {
    const redacted = redactNotificationsConfig(sampleConfig());
    expect(redacted.channels?.email.smtp?.auth?.pass).toBe(REDACTED);
    expect(redacted.channels?.email.smtp_password_set).toBe(true);
    expect(redacted.channels?.email.smtp?.host).toBe('smtp.example.com');
    expect(redacted.channels?.email.smtp?.auth?.user).toBe('alerts@example.com');
  });

  it('masks custom endpoint URLs and header values', () => {
    const redacted = redactNotificationsConfig(sampleConfig());
    const endpoint = redacted.channels?.webhook.endpoints?.[0];
    expect(endpoint?.url).toBe(REDACTED);
    expect(endpoint?.headers?.Authorization).toBe(REDACTED);
    expect(endpoint?.name).toBe('pagerduty');
  });

  it('never leaks a secret value anywhere in the serialised payload', () => {
    const serialised = JSON.stringify(redactNotificationsConfig(sampleConfig()));
    for (const secret of [
      'XXXXsecret',
      'super-secret-password',
      'token=abc123',
      'Bearer tok',
    ]) {
      expect(serialised).not.toContain(secret);
    }
  });

  it('handles a configuration with no channels', () => {
    expect(redactNotificationsConfig({ enabled: false })).toEqual({
      enabled: false,
      channels: {},
    });
  });
});

describe('mergeNotificationSecrets', () => {
  // Without this behaviour, loading the settings page (redacted) and pressing
  // save would overwrite every credential with the mask.
  it('restores the stored secret when the client returns the mask', () => {
    const current = sampleConfig();
    const incoming = redactNotificationsConfig(current) as unknown as NotificationsConfig;

    const merged = mergeNotificationSecrets(incoming, current);

    expect(merged.channels?.slack?.webhook_url).toBe(
      'https://hooks.slack.com/services/T000/B000/XXXXsecret'
    );
    expect(merged.channels?.email?.smtp?.auth?.pass).toBe('super-secret-password');
    expect(merged.channels?.webhook?.endpoints?.[0].url).toBe(
      'https://events.pagerduty.com/v2/enqueue?token=abc123'
    );
    expect(merged.channels?.webhook?.endpoints?.[0].headers?.Authorization).toBe('Bearer tok');
  });

  it('applies a genuinely new secret', () => {
    const current = sampleConfig();
    const incoming: NotificationsConfig = {
      enabled: true,
      channels: {
        slack: { enabled: true, webhook_url: 'https://hooks.slack.com/services/NEW' },
      },
    };

    const merged = mergeNotificationSecrets(incoming, current);
    expect(merged.channels?.slack?.webhook_url).toBe('https://hooks.slack.com/services/NEW');
  });

  it('keeps channels that were omitted from the update', () => {
    const current = sampleConfig();
    const incoming: NotificationsConfig = {
      enabled: true,
      channels: { slack: { enabled: false, webhook_url: REDACTED } },
    };

    const merged = mergeNotificationSecrets(incoming, current);
    expect(merged.channels?.email?.smtp?.auth?.pass).toBe('super-secret-password');
    expect(merged.channels?.slack?.enabled).toBe(false);
  });

  it('strips the read-only markers added by redaction', () => {
    const current = sampleConfig();
    const incoming = redactNotificationsConfig(current) as unknown as NotificationsConfig;

    const merged = mergeNotificationSecrets(incoming, current);
    expect(merged.channels?.slack).not.toHaveProperty('webhook_url_set');
    expect(merged.channels?.email).not.toHaveProperty('smtp_password_set');
  });

  it('preserves non-secret edits made alongside masked secrets', () => {
    const current = sampleConfig();
    const incoming = redactNotificationsConfig(current) as unknown as NotificationsConfig;
    incoming.channels!.slack!.default_channel = '#incidents';

    const merged = mergeNotificationSecrets(incoming, current);
    expect(merged.channels?.slack?.default_channel).toBe('#incidents');
    expect(merged.channels?.slack?.webhook_url).toBe(
      'https://hooks.slack.com/services/T000/B000/XXXXsecret'
    );
  });
});
