# DevOps Monitor Notification Service

A comprehensive notification service for the DevOps Monitoring in a Box project that supports multiple notification channels including Slack, Microsoft Teams, Discord, Email, and custom webhooks.

## Features

- **Multi-Channel Support**: Send notifications to Slack, Teams, Discord, Email, and custom webhooks
- **Rich Formatting**: Platform-specific rich message formatting
- **Alertmanager Integration**: Seamless integration with Prometheus Alertmanager
- **REST API**: Complete REST API for configuration and testing
- **Web Interface**: Modern web UI for configuration management
- **Docker Support**: Containerized deployment with Docker
- **Health Monitoring**: Built-in health checks and monitoring
- **Test Functionality**: Built-in testing for all notification channels

## Quick Start

### Using Docker Compose

The notification service is included in the main docker-compose.yml file:

```bash
# Start the entire monitoring stack including notification service
docker-compose up -d

# Check if the notification service is running
docker logs notification-service
```

### Manual Installation

1. **Install Dependencies**
   ```bash
   cd notification-service
   npm install
   ```

2. **Configure**
   - Copy `config.yaml` to the project root
   - Update notification settings in the config file

3. **Start the Service**
   ```bash
   npm start
   ```

4. **Test the Service**
   ```bash
   npm run test-notifications
   ```

## Configuration

### Configuration File

The service reads configuration from `config.yaml` in the project root:

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
      to: ["admin@devops-monitoring.local"]
    
    webhook:
      enabled: false
      endpoints:
        - name: "Custom Webhook"
          url: "http://custom-webhook:8080/alerts"
          headers:
            Content-Type: "application/json"
          timeout: 5000
```

### Environment Variables

You can also configure the service using environment variables:

```bash
# Service Configuration
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

## API Reference

### Endpoints

#### Health Check
```http
GET /health
```

Returns the health status of the notification service.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### Send Notification
```http
POST /notify
```

Send a notification to specified channels.

**Request Body:**
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

#### Alertmanager Webhook
```http
POST /webhook
```

Process alerts from Alertmanager.

**Request Body:**
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

#### Get Configuration
```http
GET /config
```

Retrieve current notification configuration.

#### Update Configuration
```http
PUT /config
```

Update notification configuration.

#### Test Notification
```http
POST /test/{channel}
```

Test a specific notification channel.

**Channels:** `slack`, `teams`, `discord`, `email`, `webhook`

## Testing

### Test Scripts

The service includes comprehensive test scripts:

```bash
# Test all notification channels
npm run test-notifications

# Test specific channels
npm run test-slack
npm run test-teams
npm run test-discord
npm run test-email
npm run test-webhook

# Test health and configuration
npm run test-health
npm run test-config
```

### Manual Testing

You can also test the service manually using curl:

```bash
# Health check
curl http://localhost:5001/health

# Test Slack notification
curl -X POST http://localhost:5001/test/slack

# Send custom notification
curl -X POST http://localhost:5001/notify \
  -H "Content-Type: application/json" \
  -d '{
    "channel": "all",
    "message": {
      "title": "Test Alert",
      "description": "This is a test alert"
    },
    "severity": "warning"
  }'
```

## Integration

### Alertmanager Integration

The notification service integrates with Alertmanager through webhook receivers. Update your Alertmanager configuration:

```yaml
receivers:
  - name: 'default'
    webhook_configs:
      - url: 'http://notification-service:5001/webhook'
        send_resolved: true
```

### Web UI Integration

The notification service is integrated with the DevOps Monitor web UI. Access notification settings through:

1. Navigate to the Settings page
2. Click on the "Notifications" tab
3. Configure your notification channels
4. Test each channel using the built-in test functionality

## Development

### Local Development

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start in Development Mode**
   ```bash
   npm run dev
   ```

3. **Run Tests**
   ```bash
   npm test
   ```

### Adding New Notification Channels

To add a new notification channel:

1. **Add Channel Configuration**
   - Update the configuration types in `ui-next/lib/config/types.ts`
   - Add default configuration in the types file

2. **Implement Channel Logic**
   - Add the channel implementation in `notification-service.js`
   - Implement the `send{Channel}Notification` method

3. **Update UI**
   - Add the channel to the notification settings component
   - Update the configuration interface

4. **Add Tests**
   - Add test cases for the new channel
   - Update the test script

## Troubleshooting

### Common Issues

#### Service Not Starting
- Check if port 5001 is available
- Verify configuration file exists and is valid
- Check Docker logs: `docker logs notification-service`

#### Notifications Not Sending
- Verify webhook URLs are correct and accessible
- Check SMTP settings for email notifications
- Test individual channels using the test endpoints
- Check service logs for error messages

#### Configuration Issues
- Ensure configuration file is valid YAML
- Check environment variables are set correctly
- Verify all required fields are provided

### Debug Mode

Enable debug logging:

```bash
export NOTIFICATION_SERVICE_LOG_LEVEL=debug
```

### Logs

View service logs:

```bash
# Docker logs
docker logs -f notification-service

# Local development
tail -f notification-service.log
```

## Security

### Best Practices

1. **Use HTTPS** for webhook URLs when possible
2. **Implement authentication** for custom webhook endpoints
3. **Rotate credentials** regularly
4. **Limit permissions** to only what's necessary
5. **Use environment variables** for sensitive data

### Authentication

The service supports basic authentication for webhook endpoints:

```yaml
webhook:
  endpoints:
    - name: "Secure Webhook"
      url: "https://secure-api.example.com/webhooks"
      headers:
        Authorization: "Bearer YOUR_TOKEN"
        Content-Type: "application/json"
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:

1. Check the troubleshooting section
2. Review the documentation
3. Open an issue on GitHub
4. Check the logs for error messages

## Changelog

### Version 1.0.0
- Initial release
- Support for Slack, Teams, Discord, Email, and Webhook notifications
- REST API for configuration and testing
- Web UI integration
- Docker support
- Comprehensive test suite
