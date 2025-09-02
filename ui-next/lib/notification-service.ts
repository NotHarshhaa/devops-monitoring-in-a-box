import axios from 'axios'
import nodemailer from 'nodemailer'
import { NotificationsConfig, NotificationChannelConfig } from './config/types'

export class NotificationService {
  private config: NotificationsConfig | null = null
  private emailTransporter: nodemailer.Transporter | null = null

  constructor() {
    this.loadConfiguration()
  }

  private async loadConfiguration() {
    try {
      // Load from config.json or use default
      const configPath = process.env.CONFIG_PATH || './config.json'
      const fs = await import('fs')
      
      if (fs.existsSync(configPath)) {
        const configFile = fs.readFileSync(configPath, 'utf8')
        const fullConfig = JSON.parse(configFile)
        this.config = fullConfig.notifications || this.getDefaultConfig()
      } else {
        this.config = this.getDefaultConfig()
      }
      
      this.setupEmailTransporter()
    } catch (error) {
      console.error('Failed to load configuration:', error)
      this.config = this.getDefaultConfig()
    }
  }

  private getDefaultConfig(): NotificationsConfig {
    return {
      enabled: true,
      channels: {
        slack: {
          enabled: false,
          webhook_url: '',
          default_channel: '#alerts',
          username: 'DevOps Monitor',
          icon_emoji: ':bell:',
        },
        teams: {
          enabled: false,
          webhook_url: '',
          title: 'DevOps Monitor Alert',
        },
        discord: {
          enabled: false,
          webhook_url: '',
          username: 'DevOps Monitor',
          avatar_url: '',
        },
        email: {
          enabled: false,
          smtp: {
            host: 'localhost',
            port: 587,
            secure: false,
            auth: {
              user: '',
              pass: '',
            },
          },
          from: 'alerts@devops-monitoring.local',
          to: ['admin@devops-monitoring.local'],
        },
        webhook: {
          enabled: false,
          endpoints: [],
        },
      },
    }
  }

  private setupEmailTransporter() {
    if (this.config?.channels?.email?.enabled && this.config.channels.email.smtp) {
      this.emailTransporter = nodemailer.createTransport(this.config.channels.email.smtp)
    }
  }

  async getConfiguration(): Promise<NotificationsConfig> {
    if (!this.config) {
      await this.loadConfiguration()
    }
    return this.config || this.getDefaultConfig()
  }

  async updateConfiguration(newConfig: NotificationsConfig): Promise<void> {
    this.config = newConfig
    this.setupEmailTransporter()
    
    // Save to config file
    try {
      const configPath = process.env.CONFIG_PATH || './config.json'
      const fs = await import('fs')
      
      let fullConfig = {}
      if (fs.existsSync(configPath)) {
        const configFile = fs.readFileSync(configPath, 'utf8')
        fullConfig = JSON.parse(configFile)
      }
      
      fullConfig = { ...fullConfig, notifications: newConfig }
      fs.writeFileSync(configPath, JSON.stringify(fullConfig, null, 2))
    } catch (error) {
      console.error('Failed to save configuration:', error)
    }
  }

  async sendNotification(channel: string, message: any, severity = 'info', metadata = {}): Promise<any[]> {
    const results = []

    // Send to Slack
    if (this.config?.channels?.slack?.enabled) {
      try {
        const slackResult = await this.sendSlackNotification(message, severity, metadata)
        results.push({ channel: 'slack', success: true, result: slackResult })
      } catch (error) {
        console.error('Slack notification failed:', error)
        results.push({ channel: 'slack', success: false, error: error instanceof Error ? error.message : 'Unknown error' })
      }
    }

    // Send to Teams
    if (this.config?.channels?.teams?.enabled) {
      try {
        const teamsResult = await this.sendTeamsNotification(message, severity, metadata)
        results.push({ channel: 'teams', success: true, result: teamsResult })
      } catch (error) {
        console.error('Teams notification failed:', error)
        results.push({ channel: 'teams', success: false, error: error instanceof Error ? error.message : 'Unknown error' })
      }
    }

    // Send to Discord
    if (this.config?.channels?.discord?.enabled) {
      try {
        const discordResult = await this.sendDiscordNotification(message, severity, metadata)
        results.push({ channel: 'discord', success: true, result: discordResult })
      } catch (error) {
        console.error('Discord notification failed:', error)
        results.push({ channel: 'discord', success: false, error: error instanceof Error ? error.message : 'Unknown error' })
      }
    }

    // Send Email
    if (this.config?.channels?.email?.enabled) {
      try {
        const emailResult = await this.sendEmailNotification(message, severity, metadata)
        results.push({ channel: 'email', success: true, result: emailResult })
      } catch (error) {
        console.error('Email notification failed:', error)
        results.push({ channel: 'email', success: false, error: error instanceof Error ? error.message : 'Unknown error' })
      }
    }

    // Send to Webhooks
    if (this.config?.channels?.webhook?.enabled) {
      try {
        const webhookResult = await this.sendWebhookNotification(message, severity, metadata)
        results.push({ channel: 'webhook', success: true, result: webhookResult })
      } catch (error) {
        console.error('Webhook notification failed:', error)
        results.push({ channel: 'webhook', success: false, error: error instanceof Error ? error.message : 'Unknown error' })
      }
    }

    return results
  }

  async testNotification(channel: string): Promise<any> {
    const testMessage = {
      title: 'Test Notification',
      message: 'This is a test notification from DevOps Monitor',
      severity: 'info',
      timestamp: new Date().toISOString()
    }

    try {
      const result = await this.sendNotification(channel, testMessage, 'info')
      return { success: true, result }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  async processAlertWebhook(alertData: any): Promise<any[]> {
    const results = []

    // Process each alert
    for (const alert of alertData.alerts || []) {
      const message = {
        title: alert.annotations?.summary || alert.labels?.alertname || 'Alert',
        description: alert.annotations?.description || '',
        message: alert.annotations?.summary || alert.labels?.alertname || 'Alert'
      }

      const severity = alert.labels?.severity || 'info'
      const metadata = {
        instance: alert.labels?.instance,
        service: alert.labels?.service,
        component: alert.labels?.component,
        runbook_url: alert.annotations?.runbook_url,
        status: alert.status
      }

      const result = await this.sendNotification('all', message, severity, metadata)
      results.push(result)
    }

    return results
  }

  private async sendSlackNotification(message: any, severity: string, metadata: any): Promise<any> {
    const slackConfig = this.config?.channels?.slack
    if (!slackConfig?.webhook_url) {
      throw new Error('Slack webhook URL not configured')
    }

    const color = this.getSeverityColor(severity)
    const emoji = this.getSeverityEmoji(severity)

    const attachment: any = {
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
    }

    const payload = {
      channel: metadata.channel || slackConfig.default_channel,
      username: slackConfig.username,
      icon_emoji: slackConfig.icon_emoji,
      attachments: [attachment]
    }

    // Add metadata fields
    if (metadata.instance) {
      attachment.fields.push({
        title: 'Instance',
        value: metadata.instance,
        short: true
      })
    }

    if (metadata.service) {
      attachment.fields.push({
        title: 'Service',
        value: metadata.service,
        short: true
      })
    }

    if (metadata.runbook_url) {
      attachment.actions = [{
        type: 'button',
        text: 'View Runbook',
        url: metadata.runbook_url
      }]
    }

    const response = await axios.post(slackConfig.webhook_url, payload)
    return response.data
  }

  private async sendTeamsNotification(message: any, severity: string, metadata: any): Promise<any> {
    const teamsConfig = this.config?.channels?.teams
    if (!teamsConfig?.webhook_url) {
      throw new Error('Teams webhook URL not configured')
    }

    const color = this.getSeverityColor(severity)

    const section: any = {
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
    }

    const payload = {
      '@type': 'MessageCard',
      '@context': 'http://schema.org/extensions',
      themeColor: color,
      summary: message.title || 'DevOps Monitor Alert',
      sections: [section]
    }

    // Add metadata facts
    if (metadata.instance) {
      section.facts.push({
        name: 'Instance',
        value: metadata.instance
      })
    }

    if (metadata.service) {
      section.facts.push({
        name: 'Service',
        value: metadata.service
      })
    }

    if (metadata.runbook_url) {
      section.potentialAction = [{
        '@type': 'OpenUri',
        name: 'View Runbook',
        targets: [{
          os: 'default',
          uri: metadata.runbook_url
        }]
      }]
    }

    const response = await axios.post(teamsConfig.webhook_url, payload)
    return response.data
  }

  private async sendDiscordNotification(message: any, severity: string, metadata: any): Promise<any> {
    const discordConfig = this.config?.channels?.discord
    if (!discordConfig?.webhook_url) {
      throw new Error('Discord webhook URL not configured')
    }

    const color = this.getSeverityColorHex(severity)
    const emoji = this.getSeverityEmoji(severity)

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
    }

    // Add metadata fields
    if (metadata.instance) {
      payload.embeds[0].fields.push({
        name: 'Instance',
        value: metadata.instance,
        inline: true
      })
    }

    if (metadata.service) {
      payload.embeds[0].fields.push({
        name: 'Service',
        value: metadata.service,
        inline: true
      })
    }

    const response = await axios.post(discordConfig.webhook_url, payload)
    return response.data
  }

  private async sendEmailNotification(message: any, severity: string, metadata: any): Promise<any> {
    const emailConfig = this.config?.channels?.email
    if (!emailConfig || !this.emailTransporter) {
      throw new Error('Email not configured or transporter not available')
    }
    
    const mailOptions = {
      from: emailConfig.from,
      to: emailConfig.to?.join(', '),
      subject: `[${severity.toUpperCase()}] ${message.title || 'DevOps Monitor Alert'}`,
      html: this.generateEmailHTML(message, severity, metadata)
    }

    const result = await this.emailTransporter.sendMail(mailOptions)
    return result
  }

  private async sendWebhookNotification(message: any, severity: string, metadata: any): Promise<any[]> {
    const webhookConfig = this.config?.channels?.webhook
    if (!webhookConfig?.endpoints) {
      throw new Error('Webhook endpoints not configured')
    }

    const results = []

    for (const endpoint of webhookConfig.endpoints) {
      try {
        const payload = {
          message: message,
          severity: severity,
          metadata: metadata,
          timestamp: new Date().toISOString(),
          source: 'devops-monitor'
        }

        const response = await axios.post(endpoint.url || '', payload, {
          headers: endpoint.headers || {},
          timeout: endpoint.timeout || 5000
        })

        results.push({
          endpoint: endpoint.name || endpoint.url,
          success: true,
          status: response.status
        })
      } catch (error) {
        console.error(`Webhook notification failed for ${endpoint.url}:`, error)
        results.push({
          endpoint: endpoint.name || endpoint.url,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return results
  }

  private generateEmailHTML(message: any, severity: string, metadata: any): string {
    const color = this.getSeverityColor(severity)
    
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
    `
  }

  private getSeverityColor(severity: string): string {
    const colors = {
      critical: 'danger',
      warning: 'warning',
      info: 'good',
      resolved: 'good'
    }
    return colors[severity as keyof typeof colors] || 'good'
  }

  private getSeverityColorHex(severity: string): number {
    const colors = {
      critical: 0xff0000, // Red
      warning: 0xffa500,  // Orange
      info: 0x00ff00,     // Green
      resolved: 0x00ff00  // Green
    }
    return colors[severity as keyof typeof colors] || 0x00ff00
  }

  private getSeverityEmoji(severity: string): string {
    const emojis = {
      critical: '🚨',
      warning: '⚠️',
      info: 'ℹ️',
      resolved: '✅'
    }
    return emojis[severity as keyof typeof emojis] || 'ℹ️'
  }
}
