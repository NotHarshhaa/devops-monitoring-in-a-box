"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Bell,
  Save,
  TestTube,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Mail,
  MessageSquare,
  Hash,
  Webhook,
  Settings
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { NotificationsConfig, NotificationChannelConfig } from "@/lib/config/types"

interface NotificationSettingsProps {
  config?: NotificationsConfig
  onConfigChange?: (config: NotificationsConfig) => void
}

export function NotificationSettings({ config, onConfigChange }: NotificationSettingsProps) {
  const { toast } = useToast()
  const [notificationsConfig, setNotificationsConfig] = useState<NotificationsConfig>({
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
  })

  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({})
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (config) {
      setNotificationsConfig(config)
    }
  }, [config])

  const handleConfigChange = (updates: Partial<NotificationsConfig>) => {
    const newConfig = { ...notificationsConfig, ...updates }
    setNotificationsConfig(newConfig)
    onConfigChange?.(newConfig)
  }

  const handleChannelChange = (channel: keyof NonNullable<NotificationsConfig['channels']>, updates: Partial<NotificationChannelConfig>) => {
    const newConfig = {
      ...notificationsConfig,
      channels: {
        ...notificationsConfig.channels,
        [channel]: {
          ...(notificationsConfig.channels?.[channel] || {}),
          ...updates,
        },
      },
    }
    setNotificationsConfig(newConfig)
    onConfigChange?.(newConfig)
  }

  const togglePasswordVisibility = (field: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  const addWebhookEndpoint = () => {
    const newEndpoint = {
      name: '',
      url: '',
      headers: {},
      timeout: 5000,
    }
    
    handleChannelChange('webhook', {
      endpoints: [...(notificationsConfig.channels?.webhook?.endpoints || []), newEndpoint]
    })
  }

  const removeWebhookEndpoint = (index: number) => {
    const endpoints = notificationsConfig.channels?.webhook?.endpoints || []
    handleChannelChange('webhook', {
      endpoints: endpoints.filter((_, i) => i !== index)
    })
  }

  const updateWebhookEndpoint = (index: number, updates: any) => {
    const endpoints = notificationsConfig.channels?.webhook?.endpoints || []
    const newEndpoints = endpoints.map((endpoint, i) => 
      i === index ? { ...endpoint, ...updates } : endpoint
    )
    handleChannelChange('webhook', { endpoints: newEndpoints })
  }

  const testNotification = async (channel: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/notifications/test/${channel}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        toast({
          title: "Test notification sent",
          description: `Test notification sent to ${channel} successfully`,
        })
      } else {
        throw new Error('Test notification failed')
      }
    } catch (error) {
      toast({
        title: "Test notification failed",
        description: `Failed to send test notification to ${channel}`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const saveConfiguration = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notificationsConfig),
      })

      if (response.ok) {
        toast({
          title: "Configuration saved",
          description: "Notification settings have been saved successfully",
        })
      } else {
        throw new Error('Failed to save configuration')
      }
    } catch (error) {
      toast({
        title: "Save failed",
        description: "Failed to save notification configuration",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6" />
            Notification Settings
          </h2>
          <p className="text-muted-foreground">
            Configure notification channels for alerts and monitoring events
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={saveConfiguration}
            disabled={isLoading}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            Save Configuration
          </Button>
        </div>
      </div>

      {/* Global Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Global Settings
          </CardTitle>
          <CardDescription>
            Configure global notification settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notifications-enabled">Enable Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Enable or disable all notification channels
              </p>
            </div>
            <Switch
              id="notifications-enabled"
              checked={notificationsConfig.enabled}
              onCheckedChange={(enabled) => handleConfigChange({ enabled })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Channels */}
      <Tabs defaultValue="slack" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="slack" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Slack
          </TabsTrigger>
          <TabsTrigger value="teams" className="flex items-center gap-2">
            <Hash className="h-4 w-4" />
            Teams
          </TabsTrigger>
          <TabsTrigger value="discord" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Discord
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email
          </TabsTrigger>
          <TabsTrigger value="webhook" className="flex items-center gap-2">
            <Webhook className="h-4 w-4" />
            Webhook
          </TabsTrigger>
        </TabsList>

        {/* Slack Configuration */}
        <TabsContent value="slack">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Slack Configuration
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={notificationsConfig.channels?.slack?.enabled}
                    onCheckedChange={(enabled) => handleChannelChange('slack', { enabled })}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => testNotification('slack')}
                    disabled={isLoading || !notificationsConfig.channels?.slack?.enabled}
                    className="gap-2"
                  >
                    <TestTube className="h-4 w-4" />
                    Test
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>
                Configure Slack webhook integration for notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="slack-webhook">Webhook URL</Label>
                  <Input
                    id="slack-webhook"
                    type="url"
                    placeholder="https://hooks.slack.com/services/..."
                    value={notificationsConfig.channels?.slack?.webhook_url || ''}
                    onChange={(e) => handleChannelChange('slack', { webhook_url: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slack-channel">Default Channel</Label>
                  <Input
                    id="slack-channel"
                    placeholder="#alerts"
                    value={notificationsConfig.channels?.slack?.default_channel || ''}
                    onChange={(e) => handleChannelChange('slack', { default_channel: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="slack-username">Username</Label>
                  <Input
                    id="slack-username"
                    placeholder="DevOps Monitor"
                    value={notificationsConfig.channels?.slack?.username || ''}
                    onChange={(e) => handleChannelChange('slack', { username: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slack-emoji">Icon Emoji</Label>
                  <Input
                    id="slack-emoji"
                    placeholder=":bell:"
                    value={notificationsConfig.channels?.slack?.icon_emoji || ''}
                    onChange={(e) => handleChannelChange('slack', { icon_emoji: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Teams Configuration */}
        <TabsContent value="teams">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Hash className="h-5 w-5" />
                  Microsoft Teams Configuration
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={notificationsConfig.channels?.teams?.enabled}
                    onCheckedChange={(enabled) => handleChannelChange('teams', { enabled })}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => testNotification('teams')}
                    disabled={isLoading || !notificationsConfig.channels?.teams?.enabled}
                    className="gap-2"
                  >
                    <TestTube className="h-4 w-4" />
                    Test
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>
                Configure Microsoft Teams webhook integration for notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="teams-webhook">Webhook URL</Label>
                <Input
                  id="teams-webhook"
                  type="url"
                  placeholder="https://outlook.office.com/webhook/..."
                  value={notificationsConfig.channels?.teams?.webhook_url || ''}
                  onChange={(e) => handleChannelChange('teams', { webhook_url: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="teams-title">Title</Label>
                <Input
                  id="teams-title"
                  placeholder="DevOps Monitor Alert"
                  value={notificationsConfig.channels?.teams?.title || ''}
                  onChange={(e) => handleChannelChange('teams', { title: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Discord Configuration */}
        <TabsContent value="discord">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Discord Configuration
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={notificationsConfig.channels?.discord?.enabled}
                    onCheckedChange={(enabled) => handleChannelChange('discord', { enabled })}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => testNotification('discord')}
                    disabled={isLoading || !notificationsConfig.channels?.discord?.enabled}
                    className="gap-2"
                  >
                    <TestTube className="h-4 w-4" />
                    Test
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>
                Configure Discord webhook integration for notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="discord-webhook">Webhook URL</Label>
                  <Input
                    id="discord-webhook"
                    type="url"
                    placeholder="https://discord.com/api/webhooks/..."
                    value={notificationsConfig.channels?.discord?.webhook_url || ''}
                    onChange={(e) => handleChannelChange('discord', { webhook_url: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discord-username">Username</Label>
                  <Input
                    id="discord-username"
                    placeholder="DevOps Monitor"
                    value={notificationsConfig.channels?.discord?.username || ''}
                    onChange={(e) => handleChannelChange('discord', { username: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="discord-avatar">Avatar URL</Label>
                <Input
                  id="discord-avatar"
                  type="url"
                  placeholder="https://example.com/avatar.png"
                  value={notificationsConfig.channels?.discord?.avatar_url || ''}
                  onChange={(e) => handleChannelChange('discord', { avatar_url: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Configuration */}
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Email Configuration
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={notificationsConfig.channels?.email?.enabled}
                    onCheckedChange={(enabled) => handleChannelChange('email', { enabled })}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => testNotification('email')}
                    disabled={isLoading || !notificationsConfig.channels?.email?.enabled}
                    className="gap-2"
                  >
                    <TestTube className="h-4 w-4" />
                    Test
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>
                Configure SMTP email settings for notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email-host">SMTP Host</Label>
                  <Input
                    id="email-host"
                    placeholder="smtp.gmail.com"
                    value={notificationsConfig.channels?.email?.smtp?.host || ''}
                    onChange={(e) => handleChannelChange('email', {
                      smtp: { ...notificationsConfig.channels?.email?.smtp, host: e.target.value }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-port">SMTP Port</Label>
                  <Input
                    id="email-port"
                    type="number"
                    placeholder="587"
                    value={notificationsConfig.channels?.email?.smtp?.port || ''}
                    onChange={(e) => handleChannelChange('email', {
                      smtp: { ...notificationsConfig.channels?.email?.smtp, port: parseInt(e.target.value) }
                    })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email-user">Username</Label>
                  <Input
                    id="email-user"
                    placeholder="user@example.com"
                    value={notificationsConfig.channels?.email?.smtp?.auth?.user || ''}
                    onChange={(e) => handleChannelChange('email', {
                      smtp: {
                        ...notificationsConfig.channels?.email?.smtp,
                        auth: { ...notificationsConfig.channels?.email?.smtp?.auth, user: e.target.value }
                      }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-pass">Password</Label>
                  <div className="relative">
                    <Input
                      id="email-pass"
                      type={showPasswords.email ? "text" : "password"}
                      placeholder="password"
                      value={notificationsConfig.channels?.email?.smtp?.auth?.pass || ''}
                      onChange={(e) => handleChannelChange('email', {
                        smtp: {
                          ...notificationsConfig.channels?.email?.smtp,
                          auth: { ...notificationsConfig.channels?.email?.smtp?.auth, pass: e.target.value }
                        }
                      })}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => togglePasswordVisibility('email')}
                    >
                      {showPasswords.email ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email-from">From Address</Label>
                  <Input
                    id="email-from"
                    type="email"
                    placeholder="alerts@example.com"
                    value={notificationsConfig.channels?.email?.from || ''}
                    onChange={(e) => handleChannelChange('email', { from: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-to">To Addresses (comma-separated)</Label>
                  <Input
                    id="email-to"
                    placeholder="admin@example.com,team@example.com"
                    value={notificationsConfig.channels?.email?.to?.join(', ') || ''}
                    onChange={(e) => handleChannelChange('email', { to: e.target.value.split(',').map(s => s.trim()) })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Webhook Configuration */}
        <TabsContent value="webhook">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Webhook className="h-5 w-5" />
                  Webhook Configuration
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={notificationsConfig.channels?.webhook?.enabled}
                    onCheckedChange={(enabled) => handleChannelChange('webhook', { enabled })}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => testNotification('webhook')}
                    disabled={isLoading || !notificationsConfig.channels?.webhook?.enabled}
                    className="gap-2"
                  >
                    <TestTube className="h-4 w-4" />
                    Test
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>
                Configure custom webhook endpoints for notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Webhook Endpoints</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addWebhookEndpoint}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Endpoint
                </Button>
              </div>
              
              {notificationsConfig.channels?.webhook?.endpoints?.map((endpoint, index) => (
                <Card key={index} className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h5 className="text-sm font-medium">Endpoint {index + 1}</h5>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeWebhookEndpoint(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`webhook-name-${index}`}>Name</Label>
                        <Input
                          id={`webhook-name-${index}`}
                          placeholder="Custom Webhook"
                          value={endpoint.name || ''}
                          onChange={(e) => updateWebhookEndpoint(index, { name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`webhook-timeout-${index}`}>Timeout (ms)</Label>
                        <Input
                          id={`webhook-timeout-${index}`}
                          type="number"
                          placeholder="5000"
                          value={endpoint.timeout || ''}
                          onChange={(e) => updateWebhookEndpoint(index, { timeout: parseInt(e.target.value) })}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`webhook-url-${index}`}>URL</Label>
                      <Input
                        id={`webhook-url-${index}`}
                        type="url"
                        placeholder="https://example.com/webhook"
                        value={endpoint.url || ''}
                        onChange={(e) => updateWebhookEndpoint(index, { url: e.target.value })}
                      />
                    </div>
                  </div>
                </Card>
              ))}
              
              {(!notificationsConfig.channels?.webhook?.endpoints || notificationsConfig.channels.webhook.endpoints.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  <Webhook className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No webhook endpoints configured</p>
                  <p className="text-sm">Click "Add Endpoint" to create your first webhook</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
