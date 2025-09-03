"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  Settings, 
  Save, 
  TestTube, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Eye,
  EyeOff,
  Loader2
} from 'lucide-react'
import { 
  PluginConfiguration, 
  ConfigurationProperty, 
  PluginManager 
} from '@/lib/plugins'

interface PluginConfigurationProps {
  pluginManager: PluginManager
  instance: PluginConfiguration
  onSave: (config: PluginConfiguration) => void
  onTest: (config: PluginConfiguration) => Promise<boolean>
}

export default function PluginConfigurationComponent({
  pluginManager,
  instance,
  onSave,
  onTest
}: PluginConfigurationProps) {
  const [config, setConfig] = useState<Record<string, any>>(instance.config)
  const [credentials, setCredentials] = useState<Record<string, any>>(instance.credentials || {})
  const [isSaving, setIsSaving] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showCredentials, setShowCredentials] = useState<Record<string, boolean>>({})

  const plugin = pluginManager.registry.getPlugin(instance.pluginId)
  if (!plugin) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Plugin not found</AlertDescription>
      </Alert>
    )
  }

  const handleSave = async () => {
    setIsSaving(true)
    setError(null)
    
    try {
      const updatedConfig: PluginConfiguration = {
        ...instance,
        config,
        credentials,
        lastUpdated: new Date()
      }
      
      await onSave(updatedConfig)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save configuration')
    } finally {
      setIsSaving(false)
    }
  }

  const handleTest = async () => {
    setIsTesting(true)
    setError(null)
    
    try {
      const testConfig: PluginConfiguration = {
        ...instance,
        config,
        credentials
      }
      
      const result = await onTest(testConfig)
      setTestResult(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to test connection')
      setTestResult(false)
    } finally {
      setIsTesting(false)
    }
  }

  const renderConfigField = (key: string, property: ConfigurationProperty) => {
    const value = config[key] ?? property.default
    const isRequired = plugin.metadata.configurationSchema.required.includes(key)

    const handleChange = (newValue: any) => {
      setConfig(prev => ({ ...prev, [key]: newValue }))
    }

    switch (property.type) {
      case 'string':
        if (property.format === 'uri') {
          return (
            <div key={key} className="space-y-2">
              <Label htmlFor={key} className="flex items-center gap-2">
                {property.description}
                {isRequired && <span className="text-red-500">*</span>}
              </Label>
              <Input
                id={key}
                type="url"
                value={value || ''}
                onChange={(e) => handleChange(e.target.value)}
                placeholder={property.description}
                required={isRequired}
              />
            </div>
          )
        }
        return (
          <div key={key} className="space-y-2">
            <Label htmlFor={key} className="flex items-center gap-2">
              {property.description}
              {isRequired && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={key}
              type="text"
              value={value || ''}
              onChange={(e) => handleChange(e.target.value)}
              placeholder={property.description}
              required={isRequired}
              minLength={property.minLength}
              maxLength={property.maxLength}
            />
          </div>
        )

      case 'number':
        return (
          <div key={key} className="space-y-2">
            <Label htmlFor={key} className="flex items-center gap-2">
              {property.description}
              {isRequired && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={key}
              type="number"
              value={value || ''}
              onChange={(e) => handleChange(Number(e.target.value))}
              placeholder={property.description}
              required={isRequired}
              min={property.minimum}
              max={property.maximum}
            />
          </div>
        )

      case 'boolean':
        return (
          <div key={key} className="flex items-center justify-between">
            <Label htmlFor={key} className="flex items-center gap-2">
              {property.description}
              {isRequired && <span className="text-red-500">*</span>}
            </Label>
            <Switch
              id={key}
              checked={value || false}
              onCheckedChange={handleChange}
            />
          </div>
        )

      case 'array':
        return (
          <div key={key} className="space-y-2">
            <Label htmlFor={key} className="flex items-center gap-2">
              {property.description}
              {isRequired && <span className="text-red-500">*</span>}
            </Label>
            <Textarea
              id={key}
              value={Array.isArray(value) ? value.join('\n') : ''}
              onChange={(e) => handleChange(e.target.value.split('\n').filter(item => item.trim()))}
              placeholder={`Enter each item on a new line\n${property.description}`}
              rows={3}
            />
          </div>
        )

      default:
        return (
          <div key={key} className="space-y-2">
            <Label htmlFor={key} className="flex items-center gap-2">
              {property.description}
              {isRequired && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={key}
              type="text"
              value={value || ''}
              onChange={(e) => handleChange(e.target.value)}
              placeholder={property.description}
              required={isRequired}
            />
          </div>
        )
    }
  }

  const renderCredentialsField = (key: string, isSecret: boolean = false) => {
    const value = credentials[key] || ''
    const showPassword = showCredentials[key] || false

    return (
      <div key={key} className="space-y-2">
        <Label htmlFor={`cred-${key}`} className="flex items-center gap-2">
          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
          <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <Input
            id={`cred-${key}`}
            type={isSecret && !showPassword ? 'password' : 'text'}
            value={value}
            onChange={(e) => setCredentials(prev => ({ ...prev, [key]: e.target.value }))}
            placeholder={`Enter ${key}`}
            required
          />
          {isSecret && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowCredentials(prev => ({ ...prev, [key]: !showPassword }))}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Plugin Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Plugin Configuration
          </CardTitle>
          <CardDescription>
            Configure settings for {plugin.metadata.name} v{plugin.metadata.version}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Plugin ID</Label>
              <p className="text-sm text-muted-foreground">{instance.pluginId}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Instance ID</Label>
              <p className="text-sm text-muted-foreground">{instance.instanceId}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Status</Label>
              <Badge variant={instance.enabled ? 'default' : 'secondary'}>
                {instance.enabled ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
            <div>
              <Label className="text-sm font-medium">Last Updated</Label>
              <p className="text-sm text-muted-foreground">
                {instance.lastUpdated.toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Test Result */}
      {testResult !== null && (
        <Alert variant={testResult ? 'default' : 'destructive'}>
          {testResult ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <XCircle className="h-4 w-4" />
          )}
          <AlertDescription>
            {testResult ? 'Connection test successful' : 'Connection test failed'}
          </AlertDescription>
        </Alert>
      )}

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration Settings</CardTitle>
          <CardDescription>
            Configure the plugin settings according to your environment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(plugin.metadata.configurationSchema.properties).map(([key, property]) =>
            renderConfigField(key, property)
          )}
        </CardContent>
      </Card>

      {/* Credentials */}
      <Card>
        <CardHeader>
          <CardTitle>Credentials</CardTitle>
          <CardDescription>
            Provide authentication credentials for the plugin
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {renderCredentialsField('username')}
          {renderCredentialsField('password', true)}
          {renderCredentialsField('apiToken', true)}
          {renderCredentialsField('accessKey', true)}
          {renderCredentialsField('secretKey', true)}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="flex-1"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Configuration
            </>
          )}
        </Button>
        <Button
          variant="outline"
          onClick={handleTest}
          disabled={isTesting}
        >
          {isTesting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Testing...
            </>
          ) : (
            <>
              <TestTube className="h-4 w-4 mr-2" />
              Test Connection
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
