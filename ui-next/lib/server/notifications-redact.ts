/**
 * Redaction for notification configuration.
 *
 * `GET /api/notifications` previously returned the raw configuration, which
 * includes SMTP credentials and Slack/Teams/Discord webhook URLs. A webhook URL
 * is itself a bearer credential - anyone holding it can post into the channel -
 * so none of these values may leave the server.
 *
 * The UI only needs to know whether a secret is set, so each secret is replaced
 * with a mask and a `*_set` boolean is added alongside it.
 */

import type { NotificationsConfig, NotificationChannelConfig } from '../config/types';

export const REDACTED = '••••••••';

export interface RedactedChannelConfig extends NotificationChannelConfig {
  webhook_url_set?: boolean;
  smtp_password_set?: boolean;
}

export interface RedactedNotificationsConfig {
  enabled?: boolean;
  channels?: Record<string, RedactedChannelConfig>;
}

function hasValue(value: unknown): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

function redactChannel(channel: NotificationChannelConfig): RedactedChannelConfig {
  const redacted: RedactedChannelConfig = { ...channel };

  if ('webhook_url' in channel) {
    redacted.webhook_url_set = hasValue(channel.webhook_url);
    redacted.webhook_url = redacted.webhook_url_set ? REDACTED : '';
  }

  if (channel.smtp) {
    const passwordSet = hasValue(channel.smtp.auth?.pass);
    redacted.smtp = {
      ...channel.smtp,
      auth: channel.smtp.auth
        ? {
            ...channel.smtp.auth,
            pass: passwordSet ? REDACTED : '',
          }
        : undefined,
    };
    redacted.smtp_password_set = passwordSet;
  }

  if (Array.isArray(channel.endpoints)) {
    redacted.endpoints = channel.endpoints.map((endpoint) => ({
      ...endpoint,
      // URLs may embed tokens, and headers routinely carry Authorization.
      url: hasValue(endpoint.url) ? REDACTED : '',
      headers: endpoint.headers
        ? Object.fromEntries(Object.keys(endpoint.headers).map((key) => [key, REDACTED]))
        : undefined,
    }));
  }

  return redacted;
}

/** Produce a copy of the configuration that is safe to send to a client. */
export function redactNotificationsConfig(
  config: NotificationsConfig
): RedactedNotificationsConfig {
  if (!config?.channels) {
    return { enabled: config?.enabled, channels: {} };
  }

  const channels: Record<string, RedactedChannelConfig> = {};

  for (const [name, channel] of Object.entries(config.channels)) {
    if (channel) {
      channels[name] = redactChannel(channel as NotificationChannelConfig);
    }
  }

  return { enabled: config.enabled, channels };
}

/**
 * Merge an incoming update over the stored configuration, keeping the existing
 * secret whenever the client sends back the mask (or an unchanged placeholder)
 * instead of a real value. Without this, saving the settings form after a
 * redacted GET would wipe the credentials.
 */
export function mergeNotificationSecrets(
  incoming: NotificationsConfig,
  current: NotificationsConfig
): NotificationsConfig {
  const merged: NotificationsConfig = { ...incoming, channels: {} };
  const channelNames = new Set([
    ...Object.keys(incoming.channels ?? {}),
    ...Object.keys(current.channels ?? {}),
  ]);

  const incomingChannels = (incoming.channels ?? {}) as Record<
    string,
    NotificationChannelConfig | undefined
  >;
  const currentChannels = (current.channels ?? {}) as Record<
    string,
    NotificationChannelConfig | undefined
  >;

  for (const name of channelNames) {
    const next = incomingChannels[name];
    const prev = currentChannels[name];

    if (!next) {
      // Channel omitted from the update: keep what is stored.
      if (prev) {
        (merged.channels as Record<string, NotificationChannelConfig>)[name] = prev;
      }
      continue;
    }

    const resolved: NotificationChannelConfig = { ...next };

    if (next.webhook_url === REDACTED || next.webhook_url === undefined) {
      resolved.webhook_url = prev?.webhook_url;
    }

    if (next.smtp) {
      const pass = next.smtp.auth?.pass;
      resolved.smtp = {
        ...next.smtp,
        auth: {
          ...next.smtp.auth,
          pass: pass === REDACTED || pass === undefined ? prev?.smtp?.auth?.pass : pass,
        },
      };
    }

    if (Array.isArray(next.endpoints)) {
      resolved.endpoints = next.endpoints.map((endpoint, index) => {
        const previousEndpoint = prev?.endpoints?.[index];
        return {
          ...endpoint,
          url: endpoint.url === REDACTED ? previousEndpoint?.url : endpoint.url,
          headers: Object.fromEntries(
            Object.entries(endpoint.headers ?? {}).map(([key, value]) => [
              key,
              value === REDACTED ? (previousEndpoint?.headers?.[key] ?? '') : value,
            ])
          ),
        };
      });
    }

    // Strip the read-only markers added by redaction so they are never stored.
    delete (resolved as RedactedChannelConfig).webhook_url_set;
    delete (resolved as RedactedChannelConfig).smtp_password_set;

    (merged.channels as Record<string, NotificationChannelConfig>)[name] = resolved;
  }

  return merged;
}
