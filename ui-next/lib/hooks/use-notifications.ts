import { useState, useEffect } from 'react'
import { NotificationsConfig } from '@/lib/config/types'

interface NotificationTestResult {
  success: boolean
  result?: any
  error?: string
}

interface NotificationService {
  sendNotification: (channel: string, message: any, severity?: string, metadata?: any) => Promise<NotificationTestResult[]>
  testNotification: (channel: string) => Promise<NotificationTestResult>
  getConfiguration: () => Promise<NotificationsConfig>
  updateConfiguration: (config: NotificationsConfig) => Promise<void>
}

export function useNotifications() {
  const [config, setConfig] = useState<NotificationsConfig | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const notificationService: NotificationService = {
    sendNotification: async (channel: string, message: any, severity = 'info', metadata = {}) => {
      try {
        const response = await fetch('/api/notifications/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            channel,
            message,
            severity,
            metadata,
          }),
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()
        return result.result || []
      } catch (error) {
        console.error('Failed to send notification:', error)
        throw error
      }
    },

    testNotification: async (channel: string) => {
      try {
        const response = await fetch(`/api/notifications/test/${channel}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()
        return {
          success: result.success,
          result: result.result,
        }
      } catch (error) {
        console.error('Failed to test notification:', error)
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      }
    },

    getConfiguration: async () => {
      try {
        const response = await fetch('/api/notifications')
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()
        return result
      } catch (error) {
        console.error('Failed to get notification configuration:', error)
        throw error
      }
    },

    updateConfiguration: async (newConfig: NotificationsConfig) => {
      try {
        const response = await fetch('/api/notifications', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newConfig),
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()
        return result
      } catch (error) {
        console.error('Failed to update notification configuration:', error)
        throw error
      }
    },
  }

  const loadConfiguration = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const configData = await notificationService.getConfiguration()
      setConfig(configData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load configuration')
    } finally {
      setIsLoading(false)
    }
  }

  const updateConfiguration = async (newConfig: NotificationsConfig) => {
    setIsLoading(true)
    setError(null)
    
    try {
      await notificationService.updateConfiguration(newConfig)
      setConfig(newConfig)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update configuration')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const testNotification = async (channel: string) => {
    try {
      return await notificationService.testNotification(channel)
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to test notification',
      }
    }
  }

  const sendNotification = async (channel: string, message: any, severity = 'info', metadata = {}) => {
    try {
      return await notificationService.sendNotification(channel, message, severity, metadata)
    } catch (err) {
      throw err
    }
  }

  useEffect(() => {
    loadConfiguration()
  }, [])

  return {
    config,
    isLoading,
    error,
    loadConfiguration,
    updateConfiguration,
    testNotification,
    sendNotification,
    notificationService,
  }
}
