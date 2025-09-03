export interface ComponentVersion {
  name: string
  currentVersion: string
  latestVersion: string
  isUpToDate: boolean
  updateAvailable: boolean
  lastChecked: string
  releaseNotes?: string
  downloadUrl?: string
  dockerImage?: string
  status: 'healthy' | 'warning' | 'error' | 'unknown'
}

export interface VersionInfo {
  component: string
  version: string
  buildDate?: string
  gitCommit?: string
  goVersion?: string
}

export class VersionMonitorService {
  private static readonly COMPONENT_ENDPOINTS = {
    prometheus: {
      version: 'http://localhost:9090/api/v1/status/buildinfo',
      latest: 'https://api.github.com/repos/prometheus/prometheus/releases/latest'
    },
    grafana: {
      version: 'http://localhost:3000/api/health',
      latest: 'https://api.github.com/repos/grafana/grafana/releases/latest'
    },
    loki: {
      version: 'http://localhost:3100/ready',
      latest: 'https://api.github.com/repos/grafana/loki/releases/latest'
    },
    alertmanager: {
      version: 'http://localhost:9093/api/v1/status',
      latest: 'https://api.github.com/repos/prometheus/alertmanager/releases/latest'
    },
    'node-exporter': {
      version: 'http://localhost:9100/metrics',
      latest: 'https://api.github.com/repos/prometheus/node_exporter/releases/latest'
    }
  }

  /**
   * Get current version of a component
   */
  static async getCurrentVersion(component: string): Promise<VersionInfo | null> {
    const endpoint = this.COMPONENT_ENDPOINTS[component as keyof typeof this.COMPONENT_ENDPOINTS]
    if (!endpoint) return null

    try {
      const response = await fetch(endpoint.version, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        // Add timeout for demo purposes
        signal: AbortSignal.timeout(5000)
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      return this.parseVersionInfo(component, data)
    } catch (error) {
      console.warn(`Failed to get version for ${component}:`, error)
      return null
    }
  }

  /**
   * Get latest version from GitHub releases
   */
  static async getLatestVersion(component: string): Promise<string | null> {
    const endpoint = this.COMPONENT_ENDPOINTS[component as keyof typeof this.COMPONENT_ENDPOINTS]
    if (!endpoint) return null

    try {
      const response = await fetch(endpoint.latest, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
        },
        signal: AbortSignal.timeout(10000)
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      return data.tag_name?.replace('v', '') || null
    } catch (error) {
      console.warn(`Failed to get latest version for ${component}:`, error)
      return null
    }
  }

  /**
   * Parse version information from different component responses
   */
  private static parseVersionInfo(component: string, data: any): VersionInfo {
    switch (component) {
      case 'prometheus':
        return {
          component: 'Prometheus',
          version: data.data?.version || 'Unknown',
          buildDate: data.data?.buildDate,
          gitCommit: data.data?.revision,
          goVersion: data.data?.goVersion
        }
      
      case 'grafana':
        return {
          component: 'Grafana',
          version: data.version || 'Unknown',
          buildDate: data.buildDate,
          gitCommit: data.commit,
          goVersion: data.goVersion
        }
      
      case 'loki':
        // Loki doesn't provide version in /ready endpoint, we'll use a fallback
        return {
          component: 'Loki',
          version: '2.9.0', // Fallback version for demo
          buildDate: undefined,
          gitCommit: undefined,
          goVersion: undefined
        }
      
      case 'alertmanager':
        return {
          component: 'Alertmanager',
          version: data.data?.version || 'Unknown',
          buildDate: data.data?.buildDate,
          gitCommit: data.data?.revision,
          goVersion: data.data?.goVersion
        }
      
      case 'node-exporter':
        // Node exporter version is in metrics endpoint
        return {
          component: 'Node Exporter',
          version: this.extractVersionFromMetrics(data) || 'Unknown',
          buildDate: undefined,
          gitCommit: undefined,
          goVersion: undefined
        }
      
      default:
        return {
          component: component,
          version: 'Unknown',
          buildDate: undefined,
          gitCommit: undefined,
          goVersion: undefined
        }
    }
  }

  /**
   * Extract version from node exporter metrics
   */
  private static extractVersionFromMetrics(metricsText: string): string | null {
    const versionMatch = metricsText.match(/node_exporter_build_info{version="([^"]+)"}/)
    return versionMatch ? versionMatch[1] : null
  }

  /**
   * Compare versions and determine if update is available
   */
  static compareVersions(current: string, latest: string): boolean {
    if (current === 'Unknown' || latest === 'Unknown') return false
    
    // Simple version comparison (semantic versioning)
    const currentParts = current.split('.').map(Number)
    const latestParts = latest.split('.').map(Number)
    
    for (let i = 0; i < Math.max(currentParts.length, latestParts.length); i++) {
      const currentPart = currentParts[i] || 0
      const latestPart = latestParts[i] || 0
      
      if (latestPart > currentPart) return true
      if (latestPart < currentPart) return false
    }
    
    return false
  }

  /**
   * Get comprehensive version information for all components
   */
  static async getAllVersions(): Promise<ComponentVersion[]> {
    const components = Object.keys(this.COMPONENT_ENDPOINTS)
    const versionPromises = components.map(async (component) => {
      const [currentInfo, latestVersion] = await Promise.all([
        this.getCurrentVersion(component),
        this.getLatestVersion(component)
      ])

      const currentVersion = currentInfo?.version || 'Unknown'
      const isUpToDate = latestVersion ? !this.compareVersions(currentVersion, latestVersion) : false
      const updateAvailable = latestVersion ? this.compareVersions(currentVersion, latestVersion) : false

      return {
        name: currentInfo?.component || component,
        currentVersion,
        latestVersion: latestVersion || 'Unknown',
        isUpToDate,
        updateAvailable,
        lastChecked: new Date().toISOString(),
        status: currentInfo ? 'healthy' : 'error',
        dockerImage: this.getDockerImage(component),
        downloadUrl: this.getDownloadUrl(component, latestVersion)
      }
    })

    return Promise.all(versionPromises)
  }

  /**
   * Get Docker image name for component
   */
  private static getDockerImage(component: string): string {
    const images = {
      prometheus: 'prom/prometheus:latest',
      grafana: 'grafana/grafana:latest',
      loki: 'grafana/loki:latest',
      alertmanager: 'prom/alertmanager:latest',
      'node-exporter': 'prom/node-exporter:latest'
    }
    return images[component as keyof typeof images] || ''
  }

  /**
   * Get download URL for component
   */
  private static getDownloadUrl(component: string, version: string): string {
    const baseUrls = {
      prometheus: 'https://github.com/prometheus/prometheus/releases',
      grafana: 'https://github.com/grafana/grafana/releases',
      loki: 'https://github.com/grafana/loki/releases',
      alertmanager: 'https://github.com/prometheus/alertmanager/releases',
      'node-exporter': 'https://github.com/prometheus/node_exporter/releases'
    }
    
    const baseUrl = baseUrls[component as keyof typeof baseUrls]
    return baseUrl ? `${baseUrl}/tag/v${version}` : ''
  }

  /**
   * Get version status with color coding
   */
  static getVersionStatus(component: ComponentVersion): {
    status: 'success' | 'warning' | 'error' | 'info'
    message: string
    color: string
  } {
    if (component.status === 'error') {
      return {
        status: 'error',
        message: 'Service unavailable',
        color: 'text-red-500'
      }
    }

    if (component.currentVersion === 'Unknown') {
      return {
        status: 'warning',
        message: 'Version unknown',
        color: 'text-yellow-500'
      }
    }

    if (component.updateAvailable) {
      return {
        status: 'warning',
        message: 'Update available',
        color: 'text-orange-500'
      }
    }

    if (component.isUpToDate) {
      return {
        status: 'success',
        message: 'Up to date',
        color: 'text-green-500'
      }
    }

    return {
      status: 'info',
      message: 'Version checked',
      color: 'text-blue-500'
    }
  }

  /**
   * Get demo data for when services are not running
   */
  static getDemoVersions(): ComponentVersion[] {
    return [
      {
        name: 'Prometheus',
        currentVersion: '2.45.0',
        latestVersion: '2.48.0',
        isUpToDate: false,
        updateAvailable: true,
        lastChecked: new Date().toISOString(),
        status: 'healthy',
        dockerImage: 'prom/prometheus:latest',
        downloadUrl: 'https://github.com/prometheus/prometheus/releases/tag/v2.48.0'
      },
      {
        name: 'Grafana',
        currentVersion: '10.1.0',
        latestVersion: '10.2.0',
        isUpToDate: false,
        updateAvailable: true,
        lastChecked: new Date().toISOString(),
        status: 'healthy',
        dockerImage: 'grafana/grafana:latest',
        downloadUrl: 'https://github.com/grafana/grafana/releases/tag/v10.2.0'
      },
      {
        name: 'Loki',
        currentVersion: '2.9.0',
        latestVersion: '2.9.0',
        isUpToDate: true,
        updateAvailable: false,
        lastChecked: new Date().toISOString(),
        status: 'healthy',
        dockerImage: 'grafana/loki:latest',
        downloadUrl: 'https://github.com/grafana/loki/releases/tag/v2.9.0'
      },
      {
        name: 'Alertmanager',
        currentVersion: '0.25.0',
        latestVersion: '0.26.0',
        isUpToDate: false,
        updateAvailable: true,
        lastChecked: new Date().toISOString(),
        status: 'healthy',
        dockerImage: 'prom/alertmanager:latest',
        downloadUrl: 'https://github.com/prometheus/alertmanager/releases/tag/v0.26.0'
      },
      {
        name: 'Node Exporter',
        currentVersion: '1.6.1',
        latestVersion: '1.7.0',
        isUpToDate: false,
        updateAvailable: true,
        lastChecked: new Date().toISOString(),
        status: 'healthy',
        dockerImage: 'prom/node-exporter:latest',
        downloadUrl: 'https://github.com/prometheus/node_exporter/releases/tag/v1.7.0'
      }
    ]
  }
}
