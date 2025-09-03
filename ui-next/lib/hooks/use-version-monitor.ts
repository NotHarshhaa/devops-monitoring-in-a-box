import { useState, useEffect, useCallback } from 'react'
import { VersionMonitorService, type ComponentVersion } from '../version-monitor'

interface UseVersionMonitorOptions {
  autoRefresh?: boolean
  refreshInterval?: number
  useDemoData?: boolean
}

interface UseVersionMonitorReturn {
  versions: ComponentVersion[]
  isLoading: boolean
  error: string | null
  lastRefresh: Date | null
  refresh: () => Promise<void>
  useDemoData: boolean
}

export function useVersionMonitor({
  autoRefresh = false,
  refreshInterval = 300000, // 5 minutes
  useDemoData = false
}: UseVersionMonitorOptions = {}): UseVersionMonitorReturn {
  const [versions, setVersions] = useState<ComponentVersion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const [isDemoData, setIsDemoData] = useState(useDemoData)

  const fetchVersions = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      let versionData: ComponentVersion[]

      if (useDemoData) {
        versionData = VersionMonitorService.getDemoVersions()
        setIsDemoData(true)
      } else {
        versionData = await VersionMonitorService.getAllVersions()
        
        // Check if we got any real data
        const hasRealData = versionData.some(v => v.currentVersion !== 'Unknown' && v.status === 'healthy')
        
        if (!hasRealData) {
          // Fallback to demo data if no real data available
          versionData = VersionMonitorService.getDemoVersions()
          setIsDemoData(true)
        } else {
          setIsDemoData(false)
        }
      }

      setVersions(versionData)
      setLastRefresh(new Date())
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch versions'
      setError(errorMessage)
      
      // Fallback to demo data on error
      setVersions(VersionMonitorService.getDemoVersions())
      setIsDemoData(true)
      setLastRefresh(new Date())
    } finally {
      setIsLoading(false)
    }
  }, [useDemoData])

  const refresh = useCallback(async () => {
    await fetchVersions()
  }, [fetchVersions])

  useEffect(() => {
    fetchVersions()
  }, [fetchVersions])

  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(fetchVersions, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [autoRefresh, refreshInterval, fetchVersions])

  return {
    versions,
    isLoading,
    error,
    lastRefresh,
    refresh,
    useDemoData: isDemoData
  }
}
