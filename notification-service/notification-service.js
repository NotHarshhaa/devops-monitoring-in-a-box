#!/usr/bin/env node

/**
 * DevOps Monitoring Notification Service
 * Handles notifications for Slack, Teams, Discord, Email, and Webhooks
 */

const express = require('express');
const axios = require('axios');
const nodemailer = require('nodemailer');
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');
const winston = require('winston');

// Configure logging
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'notification-service.log' })
  ]
});

class NotificationService {
  constructor() {
    this.app = express();
    this.config = null;
    this.emailTransporter = null;
    this.setupMiddleware();
    this.loadConfiguration();
    this.setupRoutes();
  }

  setupMiddleware() {
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));
    
    // CORS middleware
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      if (req.method === 'OPTIONS') {
        res.sendStatus(200);
      } else {
        next();
      }
    });
  }

  loadConfiguration() {
    try {
      const configPath = path.join(__dirname, '..', 'config.yaml');
      if (fs.existsSync(configPath)) {
        const configFile = fs.readFileSync(configPath, 'utf8');
        this.config = yaml.load(configFile);
        logger.info('Configuration loaded successfully');
      } else {
        // Load from config.json as fallback
        const configJsonPath = path.join(__dirname, '..', 'config.json');
        if (fs.existsSync(configJsonPath)) {
          const configFile = fs.readFileSync(configJsonPath, 'utf8');
          this.config = JSON.parse(configFile);
          logger.info('Configuration loaded from JSON fallback');
        } else {
          this.config = this.getDefaultConfig();
          logger.warn('Using default configuration');
        }
      }
      
      this.setupEmailTransporter();
    } catch (error) {
      logger.error('Failed to load configuration:', error);
      this.config = this.getDefaultConfig();
    }
  }

  getDefaultConfig() {
    return {
      notifications: {
        enabled: true,
        channels: {
          slack: {
            enabled: false,
            webhook_url: '',
            default_channel: '#alerts',
            username: 'DevOps Monitor',
            icon_emoji: ':bell:'
          },
          teams: {
            enabled: false,
            webhook_url: '',
            title: 'DevOps Monitor Alert'
          },
          discord: {
            enabled: false,
            webhook_url: '',
            username: 'DevOps Monitor',
            avatar_url: ''
          },
          email: {
            enabled: false,
            smtp: {
              host: 'localhost',
              port: 587,
              secure: false,
              auth: {
                user: '',
                pass: ''
              }
            },
            from: 'alerts@devops-monitoring.local',
            to: ['admin@devops-monitoring.local']
          },
          webhook: {
            enabled: false,
            endpoints: []
          }
        }
      }
    };
  }

  setupEmailTransporter() {
    if (this.config.notifications?.channels?.email?.enabled) {
      const emailConfig = this.config.notifications.channels.email;
      this.emailTransporter = nodemailer.createTransporter(emailConfig.smtp);
      logger.info('Email transporter configured');
    }
  }

  setupRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ status: 'healthy', timestamp: new Date().toISOString() });
    });

    // Send notification endpoint
    this.app.post('/notify', async (req, res) => {
      try {
        const { channel, message, severity = 'info', metadata = {} } = req.body;
        
        if (!channel || !message) {
          return res.status(400).json({ error: 'Channel and message are required' });
        }

        const result = await this.sendNotification(channel, message, severity, metadata);
        res.json({ success: true, result });
      } catch (error) {
        logger.error('Notification failed:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // Send alert notification (Alertmanager webhook)
    this.app.post('/webhook', async (req, res) => {
      try {
        const alertData = req.body;
        logger.info('Received alert webhook:', alertData);

        const result = await this.processAlertWebhook(alertData);
        res.json({ success: true, result });
      } catch (error) {
        logger.error('Alert webhook processing failed:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // Configuration endpoint
    this.app.get('/config', (req, res) => {
      res.json(this.config.notifications);
    });

    this.app.put('/config', (req, res) => {
      try {
        this.config.notifications = { ...this.config.notifications, ...req.body };
        this.saveConfiguration();
        this.setupEmailTransporter();
        res.json({ success: true, config: this.config.notifications });
      } catch (error) {
        logger.error('Configuration update failed:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // Test notification endpoint
    this.app.post('/test/:channel', async (req, res) => {
      try {
        const { channel } = req.params;
        const testMessage = {
          title: 'Test Notification',
          message: 'This is a test notification from DevOps Monitor',
          severity: 'info',
          timestamp: new Date().toISOString()
        };

        const result = await this.sendNotification(channel, testMessage, 'info');
        res.json({ success: true, result });
      } catch (error) {
        logger.error('Test notification failed:', error);
        res.status(500).json({ error: error.message });
      }
    });
  }

  async sendNotification(channel, message, severity = 'info', metadata = {}) {
    const results = [];

    // Send to Slack
    if (this.config.notifications?.channels?.slack?.enabled) {
      try {
        const slackResult = await this.sendSlackNotification(message, severity, metadata);
        results.push({ channel: 'slack', success: true, result: slackResult });
      } catch (error) {
        logger.error('Slack notification failed:', error);
        results.push({ channel: 'slack', success: false, error: error.message });
      }
    }

    // Send to Teams
    if (this.config.notifications?.channels?.teams?.enabled) {
      try {
        const teamsResult = await this.sendTeamsNotification(message, severity, metadata);
        results.push({ channel: 'teams', success: true, result: teamsResult });
      } catch (error) {
        logger.error('Teams notification failed:', error);
        results.push({ channel: 'teams', success: false, error: error.message });
      }
    }

    // Send to Discord
    if (this.config.notifications?.channels?.discord?.enabled) {
      try {
        const discordResult = await this.sendDiscordNotification(message, severity, metadata);
        results.push({ channel: 'discord', success: true, result: discordResult });
      } catch (error) {
        logger.error('Discord notification failed:', error);
        results.push({ channel: 'discord', success: false, error: error.message });
      }
    }

    // Send Email
    if (this.config.notifications?.channels?.email?.enabled) {
      try {
        const emailResult = await this.sendEmailNotification(message, severity, metadata);
        results.push({ channel: 'email', success: true, result: emailResult });
      } catch (error) {
        logger.error('Email notification failed:', error);
        results.push({ channel: 'email', success: false, error: error.message });
      }
    }

    // Send to Webhooks
    if (this.config.notifications?.channels?.webhook?.enabled) {
      try {
        const webhookResult = await this.sendWebhookNotification(message, severity, metadata);
        results.push({ channel: 'webhook', success: true, result: webhookResult });
      } catch (error) {
        logger.error('Webhook notification failed:', error);
        results.push({ channel: 'webhook', success: false, error: error.message });
      }
    }

    return results;
  }

  async sendSlackNotification(message, severity, metadata) {
    const slackConfig = this.config.notifications.channels.slack;
    const color = this.getSeverityColor(severity);
    const emoji = this.getSeverityEmoji(severity);

    const payload = {
      channel: metadata.channel || slackConfig.default_channel,
      username: slackConfig.username,
      icon_emoji: slackConfig.icon_emoji,
      attachments: [{
        color: color,
        title: `${emoji} ${message.title || 'Alert'}`,
        text: message.message || message.description || '',
        fields: [
          {
            title: 'Severity',
            value: severity.toUpperCase(),
            short: true
          },
          {
            title: 'Timestamp',
            value: new Date().toISOString(),
            short: true
          }
        ],
        footer: 'DevOps Monitor',
        ts: Math.floor(Date.now() / 1000)
      }]
    };

    // Add metadata fields
    if (metadata.instance) {
      payload.attachments[0].fields.push({
        title: 'Instance',
        value: metadata.instance,
        short: true
      });
    }

    if (metadata.service) {
      payload.attachments[0].fields.push({
        title: 'Service',
        value: metadata.service,
        short: true
      });
    }

    if (metadata.runbook_url) {
      payload.attachments[0].actions = [{
        type: 'button',
        text: 'View Runbook',
        url: metadata.runbook_url
      }];
    }

    const response = await axios.post(slackConfig.webhook_url, payload);
    return response.data;
  }

  async sendTeamsNotification(message, severity, metadata) {
    const teamsConfig = this.config.notifications.channels.teams;
    const color = this.getSeverityColor(severity);

    const payload = {
      '@type': 'MessageCard',
      '@context': 'http://schema.org/extensions',
      themeColor: color,
      summary: message.title || 'DevOps Monitor Alert',
      sections: [{
        activityTitle: `${message.title || 'Alert'}`,
        activitySubtitle: `Severity: ${severity.toUpperCase()}`,
        activityImage: 'https://via.placeholder.com/64x64/0078d4/ffffff?text=!',
        text: message.message || message.description || '',
        facts: [
          {
            name: 'Timestamp',
            value: new Date().toISOString()
          }
        ],
        markdown: true
      }]
    };

    // Add metadata facts
    if (metadata.instance) {
      payload.sections[0].facts.push({
        name: 'Instance',
        value: metadata.instance
      });
    }

    if (metadata.service) {
      payload.sections[0].facts.push({
        name: 'Service',
        value: metadata.service
      });
    }

    if (metadata.runbook_url) {
      payload.sections[0].potentialAction = [{
        '@type': 'OpenUri',
        name: 'View Runbook',
        targets: [{
          os: 'default',
          uri: metadata.runbook_url
        }]
      }];
    }

    const response = await axios.post(teamsConfig.webhook_url, payload);
    return response.data;
  }

  async sendDiscordNotification(message, severity, metadata) {
    const discordConfig = this.config.notifications.channels.discord;
    const color = this.getSeverityColorHex(severity);
    const emoji = this.getSeverityEmoji(severity);

    const payload = {
      username: discordConfig.username,
      avatar_url: discordConfig.avatar_url,
      embeds: [{
        title: `${emoji} ${message.title || 'Alert'}`,
        description: message.message || message.description || '',
        color: color,
        timestamp: new Date().toISOString(),
        fields: [
          {
            name: 'Severity',
            value: severity.toUpperCase(),
            inline: true
          }
        ],
        footer: {
          text: 'DevOps Monitor'
        }
      }]
    };

    // Add metadata fields
    if (metadata.instance) {
      payload.embeds[0].fields.push({
        name: 'Instance',
        value: metadata.instance,
        inline: true
      });
    }

    if (metadata.service) {
      payload.embeds[0].fields.push({
        name: 'Service',
        value: metadata.service,
        inline: true
      });
    }

    const response = await axios.post(discordConfig.webhook_url, payload);
    return response.data;
  }

  async sendEmailNotification(message, severity, metadata) {
    const emailConfig = this.config.notifications.channels.email;
    
    const mailOptions = {
      from: emailConfig.from,
      to: emailConfig.to.join(', '),
      subject: `[${severity.toUpperCase()}] ${message.title || 'DevOps Monitor Alert'}`,
      html: this.generateEmailHTML(message, severity, metadata)
    };

    const result = await this.emailTransporter.sendMail(mailOptions);
    return result;
  }

  async sendWebhookNotification(message, severity, metadata) {
    const webhookConfig = this.config.notifications.channels.webhook;
    const results = [];

    for (const endpoint of webhookConfig.endpoints) {
      try {
        const payload = {
          message: message,
          severity: severity,
          metadata: metadata,
          timestamp: new Date().toISOString(),
          source: 'devops-monitor'
        };

        const response = await axios.post(endpoint.url, payload, {
          headers: endpoint.headers || {},
          timeout: endpoint.timeout || 5000
        });

        results.push({
          endpoint: endpoint.name || endpoint.url,
          success: true,
          status: response.status
        });
      } catch (error) {
        logger.error(`Webhook notification failed for ${endpoint.url}:`, error);
        results.push({
          endpoint: endpoint.name || endpoint.url,
          success: false,
          error: error.message
        });
      }
    }

    return results;
  }

  async processAlertWebhook(alertData) {
    const results = [];

    // Process each alert
    for (const alert of alertData.alerts || []) {
      const message = {
        title: alert.annotations?.summary || alert.labels?.alertname || 'Alert',
        description: alert.annotations?.description || '',
        message: alert.annotations?.summary || alert.labels?.alertname || 'Alert'
      };

      const severity = alert.labels?.severity || 'info';
      const metadata = {
        instance: alert.labels?.instance,
        service: alert.labels?.service,
        component: alert.labels?.component,
        runbook_url: alert.annotations?.runbook_url,
        status: alert.status
      };

      const result = await this.sendNotification('all', message, severity, metadata);
      results.push(result);
    }

    return results;
  }

  generateEmailHTML(message, severity, metadata) {
    const color = this.getSeverityColor(severity);
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>DevOps Monitor Alert</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .header { background-color: ${color}; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { padding: 20px; }
          .footer { padding: 20px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; font-size: 12px; color: #666; }
          .metadata { background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin: 15px 0; }
          .metadata-item { margin: 5px 0; }
          .metadata-label { font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${message.title || 'DevOps Monitor Alert'}</h1>
            <p>Severity: ${severity.toUpperCase()}</p>
          </div>
          <div class="content">
            <p>${message.message || message.description || ''}</p>
            <div class="metadata">
              <div class="metadata-item">
                <span class="metadata-label">Timestamp:</span> ${new Date().toISOString()}
              </div>
              ${metadata.instance ? `<div class="metadata-item"><span class="metadata-label">Instance:</span> ${metadata.instance}</div>` : ''}
              ${metadata.service ? `<div class="metadata-item"><span class="metadata-label">Service:</span> ${metadata.service}</div>` : ''}
              ${metadata.component ? `<div class="metadata-item"><span class="metadata-label">Component:</span> ${metadata.component}</div>` : ''}
            </div>
          </div>
          <div class="footer">
            <p>This alert was generated by DevOps Monitor</p>
            ${metadata.runbook_url ? `<p><a href="${metadata.runbook_url}">View Runbook</a></p>` : ''}
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getSeverityColor(severity) {
    const colors = {
      critical: 'danger',
      warning: 'warning',
      info: 'good',
      resolved: 'good'
    };
    return colors[severity] || 'good';
  }

  getSeverityColorHex(severity) {
    const colors = {
      critical: 0xff0000, // Red
      warning: 0xffa500,  // Orange
      info: 0x00ff00,     // Green
      resolved: 0x00ff00  // Green
    };
    return colors[severity] || 0x00ff00;
  }

  getSeverityEmoji(severity) {
    const emojis = {
      critical: '🚨',
      warning: '⚠️',
      info: 'ℹ️',
      resolved: '✅'
    };
    return emojis[severity] || 'ℹ️';
  }

  saveConfiguration() {
    try {
      const configPath = path.join(__dirname, '..', 'config.yaml');
      const yamlContent = yaml.dump(this.config, { indent: 2 });
      fs.writeFileSync(configPath, yamlContent);
      logger.info('Configuration saved successfully');
    } catch (error) {
      logger.error('Failed to save configuration:', error);
    }
  }

  start(port = 5001) {
    this.app.listen(port, () => {
      logger.info(`Notification service started on port ${port}`);
    });
  }
}

// Start the service if this file is run directly
if (require.main === module) {
  const service = new NotificationService();
  service.start(process.env.PORT || 5001);
}

module.exports = NotificationService;
