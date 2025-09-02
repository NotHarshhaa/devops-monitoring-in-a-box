# Notifications & Integrations Guide

This guide explains how to configure and use the comprehensive notification system in the DevOps Monitoring in a Box project, including Slack, Teams, Discord, Email, and Webhook integrations.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Configuration](#configuration)
- [Notification Channels](#notification-channels)
- [API Reference](#api-reference)
- [Usage Examples](#usage-examples)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)

## Overview

The notification system provides a unified interface for sending alerts and notifications across multiple channels. It integrates seamlessly with Alertmanager and provides a modern web interface for configuration management.

### Key Features

- **Multi-Channel Support**: Slack, Microsoft Teams, Discord, Email, and Webhooks
- **Unified Configuration**: Single configuration file for all channels
- **Web Interface**: Modern UI for easy configuration management
- **Test Functionality**: Built-in testing for each notification channel
- **Alertmanager Integration**: Seamless integration with existing alerting
- **Custom Webhooks**: Support for custom webhook endpoints
- **Rich Formatting**: Rich message formatting for each platform

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Prometheus    │───▶│  Alertmanager   │───▶│ Notification    │
│                 │    │                 │    │ Service         │
│ • Alert rules   │    │ • Alert routing │    │                 │
│ • Alert firing  │    │ • Grouping      │    │ • Slack         │
│ • Alert sending │    │ • Silencing     │    │ • Teams         │
└─────────────────┘    └─────────────────┘    │ • Discord       │
                                              │ • Email         │
                                              │ • Webhooks      │
                                              └─────────────────┘
                                                       │
                                                       ▼
                                              ┌─────────────────┐
                                              │   End Users     │
                                              │                 │
                                              │ • Slack Channels│
                                              │ • Teams Channels│
                                              │ • Discord Servers│
                                              │ • Email Inboxes │
                                              │ • Custom Apps   │
                                              └─────────────────┘
```

## Configuration

### Configuration File (config.yaml)

The notification system is configured through the main `config.yaml` file:

```yaml
notifications:
  enabled: true
  channels:
    slack:
      enabled: false
      webhook_url: "https://hooks.slack.com/services/YOUR_SLACK_WEBHOOK_URL"
      default_channel: "#alerts"
      username: "DevOps Monitor"
      icon_emoji: ":bell:"
    
    teams:
      enabled: false
      webhook_url: "https://outlook.office.com/webhook/YOUR_TEAMS_WEBHOOK_URL"
      title: "DevOps Monitor Alert"
    
    discord:
      enabled: false
      webhook_url: "https://discord.com/api/webhooks/YOUR_DISCORD_WEBHOOK_URL"
      username: "DevOps Monitor"
      avatar_url: ""
    
    email:
      enabled: false
      smtp:
        host: "localhost"
        port: 587
        secure: false
        auth:
          user: "alerts@devops-monitoring.local"
          pass: "password"
      from: "alerts@devops-monitoring.local"
      to: ["admin@devops-monitoring.local", "team@devops-monitoring.local"]
    
    webhook:
      enabled: false
      endpoints:
        - name: "Custom Webhook 1"
          url: "http://custom-webhook:8080/alerts"
          headers:
            Content-Type: "application/json"
            Authorization: "Bearer YOUR_TOKEN"
          timeout: 5000
```

### Environment Variables

The notification service can also be configured using environment variables:

```bash
# Notification Service
NOTIFICATION_SERVICE_PORT=5001
NOTIFICATION_SERVICE_LOG_LEVEL=info

# Email Configuration
SMTP_HOST=localhost
SMTP_PORT=587
SMTP_USER=alerts@devops-monitoring.local
SMTP_PASS=password
SMTP_FROM=alerts@devops-monitoring.local

# Slack Configuration
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR_SLACK_WEBHOOK_URL
SLACK_DEFAULT_CHANNEL=#alerts

# Teams Configuration
TEAMS_WEBHOOK_URL=https://outlook.office.com/webhook/YOUR_TEAMS_WEBHOOK_URL

# Discord Configuration
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR_DISCORD_WEBHOOK_URL
```

## Notification Channels

### Slack Integration

Slack integration uses webhooks to send rich, formatted messages to Slack channels.

#### Setup

1. Create a Slack App in your workspace
2. Enable Incoming Webhooks
3. Create a webhook URL
4. Configure the webhook URL in the notification settings

#### Message Format

Slack messages include:
- Rich attachments with color coding based on severity
- Action buttons for runbook links
- Metadata fields (instance, service, component)
- Timestamps and source information

#### Configuration

```yaml
slack:
  enabled: true
  webhook_url: "https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX"
  default_channel: "#alerts"
  username: "DevOps Monitor"
  icon_emoji: ":bell:"
```

### Microsoft Teams Integration

Teams integration uses webhook connectors to send adaptive cards to Teams channels.

#### Setup

1. Go to your Teams channel
2. Click the "..." menu and select "Connectors"
3. Find "Incoming Webhook" and configure it
4. Copy the webhook URL
5. Configure the webhook URL in the notification settings

#### Message Format

Teams messages include:
- Adaptive cards with rich formatting
- Color-coded themes based on severity
- Fact tables with alert metadata
- Action buttons for runbook links

#### Configuration

```yaml
teams:
  enabled: true
  webhook_url: "https://outlook.office.com/webhook/..."
  title: "DevOps Monitor Alert"
```

### Discord Integration

Discord integration uses webhooks to send rich embeds to Discord channels.

#### Setup

1. Go to your Discord server settings
2. Navigate to "Integrations" → "Webhooks"
3. Create a new webhook
4. Copy the webhook URL
5. Configure the webhook URL in the notification settings

#### Message Format

Discord messages include:
- Rich embeds with color coding
- Field-based metadata display
- Footer with source information
- Custom username and avatar

#### Configuration

```yaml
discord:
  enabled: true
  webhook_url: "https://discord.com/api/webhooks/..."
  username: "DevOps Monitor"
  avatar_url: "https://example.com/avatar.png"
```

### Email Integration

Email integration uses SMTP to send HTML-formatted emails.

#### Setup

1. Configure SMTP server settings
2. Set up authentication credentials
3. Configure sender and recipient addresses
4. Test the connection

#### Message Format

Email messages include:
- HTML-formatted content
- Color-coded headers based on severity
- Structured metadata tables
- Responsive design for mobile devices

#### Configuration

```yaml
email:
  enabled: true
  smtp:
    host: "smtp.gmail.com"
    port: 587
    secure: false
    auth:
      user: "alerts@example.com"
      pass: "your-app-password"
  from: "alerts@example.com"
  to: ["admin@example.com", "team@example.com"]
```

### Webhook Integration

Webhook integration allows sending notifications to custom endpoints.

#### Setup

1. Create webhook endpoints in your applications
2. Configure authentication if required
3. Set up custom headers
4. Configure timeout settings

#### Message Format

Webhook payloads include:
- Standardized JSON structure
- Alert metadata and context
- Timestamp and source information
- Custom headers for authentication

#### Configuration

```yaml
webhook:
  enabled: true
  endpoints:
    - name: "Custom App"
      url: "https://api.example.com/webhooks/alerts"
      headers:
        Content-Type: "application/json"
        Authorization: "Bearer YOUR_TOKEN"
      timeout: 5000
    - name: "Internal System"
      url: "http://internal-system:8080/alerts"
      headers:
        Content-Type: "application/json"
      timeout: 3000
```

## API Reference

### Notification Service API

The notification service exposes a REST API for configuration and testing.

#### Endpoints

##### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

##### POST /notify
Send a notification to specified channels.

**Request:**
```json
{
  "channel": "all",
  "message": {
    "title": "Test Alert",
    "description": "This is a test alert"
  },
  "severity": "warning",
  "metadata": {
    "instance": "server-01",
    "service": "web-app"
  }
}
```

**Response:**
```json
{
  "success": true,
  "result": [
    {
      "channel": "slack",
      "success": true,
      "result": "ok"
    },
    {
      "channel": "email",
      "success": true,
      "result": "Message sent"
    }
  ]
}
```

##### POST /webhook
Alertmanager webhook endpoint for processing alerts.

**Request:**
```json
{
  "alerts": [
    {
      "status": "firing",
      "labels": {
        "alertname": "HighCPUUsage",
        "instance": "server-01",
        "severity": "warning"
      },
      "annotations": {
        "summary": "High CPU usage on server-01",
        "description": "CPU usage is above 80% for more than 5 minutes"
      }
    }
  ]
}
```

##### GET /config
Get current notification configuration.

**Response:**
```json
{
  "enabled": true,
  "channels": {
    "slack": {
      "enabled": true,
      "webhook_url": "https://hooks.slack.com/services/...",
      "default_channel": "#alerts"
    }
  }
}
```

##### PUT /config
Update notification configuration.

**Request:**
```json
{
  "enabled": true,
  "channels": {
    "slack": {
      "enabled": true,
      "webhook_url": "https://hooks.slack.com/services/...",
      "default_channel": "#alerts"
    }
  }
}
```

##### POST /test/{channel}
Test notification for a specific channel.

**Response:**
```json
{
  "success": true,
  "result": "Test notification sent successfully"
}
```

## Usage Examples

### Basic Alert Notification

```javascript
// Send a basic alert notification
const response = await fetch('http://localhost:5001/notify', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    channel: 'all',
    message: {
      title: 'High CPU Usage',
      description: 'CPU usage is above 80% on server-01'
    },
    severity: 'warning',
    metadata: {
      instance: 'server-01',
      service: 'web-app',
      component: 'cpu'
    }
  })
})
```

### Custom Webhook Integration

```javascript
// Send to custom webhook
const response = await fetch('http://localhost:5001/notify', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    channel: 'webhook',
    message: {
      title: 'Custom Alert',
      description: 'This is a custom alert'
    },
    severity: 'info',
    metadata: {
      custom_field: 'custom_value'
    }
  })
})
```

### Testing Notifications

```javascript
// Test Slack notification
const response = await fetch('http://localhost:5001/test/slack', {
  method: 'POST'
})

// Test email notification
const response = await fetch('http://localhost:5001/test/email', {
  method: 'POST'
})
```

### Configuration Management

```javascript
// Get current configuration
const config = await fetch('http://localhost:5001/config')
  .then(res => res.json())

// Update configuration
const response = await fetch('http://localhost:5001/config', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    enabled: true,
    channels: {
      slack: {
        enabled: true,
        webhook_url: 'https://hooks.slack.com/services/...',
        default_channel: '#alerts'
      }
    }
  })
})
```

## Troubleshooting

### Common Issues

#### Slack Notifications Not Working

1. **Check webhook URL**: Ensure the webhook URL is correct and active
2. **Verify permissions**: Make sure the webhook has permission to post to the channel
3. **Check channel name**: Ensure the channel exists and the bot has access
4. **Test webhook**: Use the test functionality in the UI

#### Email Notifications Failing

1. **SMTP settings**: Verify SMTP host, port, and authentication
2. **Firewall**: Check if SMTP ports are blocked
3. **Authentication**: Ensure username and password are correct
4. **TLS/SSL**: Verify security settings match your SMTP server

#### Teams Notifications Not Appearing

1. **Webhook URL**: Verify the Teams webhook URL is correct
2. **Channel permissions**: Ensure the webhook can post to the channel
3. **Message format**: Check if the message format is compatible with Teams

#### Discord Notifications Issues

1. **Webhook URL**: Verify the Discord webhook URL is valid
2. **Server permissions**: Ensure the webhook has permission to post
3. **Rate limits**: Check if you're hitting Discord's rate limits

#### Webhook Endpoints Not Responding

1. **URL accessibility**: Ensure the webhook URL is accessible
2. **Authentication**: Verify headers and authentication are correct
3. **Timeout settings**: Check if timeout is appropriate for your endpoint
4. **Response format**: Ensure your endpoint returns appropriate HTTP status codes

### Debugging

#### Enable Debug Logging

Set the log level to debug in the notification service:

```bash
export NOTIFICATION_SERVICE_LOG_LEVEL=debug
```

#### Check Service Logs

```bash
# View notification service logs
docker logs notification-service

# Follow logs in real-time
docker logs -f notification-service
```

#### Test Individual Components

```bash
# Test notification service health
curl http://localhost:5001/health

# Test specific channel
curl -X POST http://localhost:5001/test/slack

# Test webhook endpoint
curl -X POST http://localhost:5001/webhook \
  -H "Content-Type: application/json" \
  -d '{"alerts":[{"status":"firing","labels":{"alertname":"TestAlert"}}]}'
```

## Best Practices

### Configuration Management

1. **Use environment variables** for sensitive data like passwords and API keys
2. **Version control** your configuration files
3. **Test configurations** before deploying to production
4. **Use separate channels** for different severity levels

### Security

1. **Use HTTPS** for webhook URLs when possible
2. **Implement authentication** for custom webhook endpoints
3. **Rotate credentials** regularly
4. **Limit permissions** to only what's necessary

### Performance

1. **Set appropriate timeouts** for webhook endpoints
2. **Use connection pooling** for SMTP connections
3. **Implement rate limiting** to avoid overwhelming external services
4. **Monitor notification delivery** and success rates

### Monitoring

1. **Monitor notification service health** using the health endpoint
2. **Track notification delivery rates** and failures
3. **Set up alerts** for notification service failures
4. **Log notification attempts** for debugging

### Message Design

1. **Use consistent formatting** across all channels
2. **Include relevant metadata** in notifications
3. **Provide actionable information** in alerts
4. **Use appropriate severity levels** for different types of alerts

### Testing

1. **Test all channels** before deploying to production
2. **Use the built-in test functionality** regularly
3. **Test with real alert scenarios** to ensure proper formatting
4. **Validate webhook endpoints** independently

## Integration with Existing Systems

### Alertmanager Integration

The notification service integrates seamlessly with Alertmanager through webhook receivers. All existing Alertmanager configurations will work with the new notification service.

### Prometheus Integration

Alerts from Prometheus are automatically routed through Alertmanager to the notification service, providing a complete monitoring and alerting pipeline.

### Custom Applications

The notification service can be integrated with custom applications through:
- Direct API calls to the `/notify` endpoint
- Webhook receivers for custom alert sources
- Configuration management through the REST API

This comprehensive notification system provides a robust, scalable solution for alerting and notifications across multiple channels, with a modern web interface for easy management and configuration.
