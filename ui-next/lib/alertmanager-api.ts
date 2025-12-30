import { HttpClient } from './http-client';
import { config } from './config';

export interface AlertmanagerAlert {
  id: string;
  status: {
    state: 'active' | 'suppressed' | 'unprocessed';
    silencedBy: string[];
    inhibitedBy: string[];
  };
  labels: Record<string, string>;
  annotations: Record<string, string>;
  startsAt: string;
  endsAt: string;
  updatedAt: string;
  generatorURL: string;
  fingerprint: string;
}

export interface AlertmanagerSilence {
  id: string;
  status: {
    state: 'active' | 'expired' | 'pending';
  };
  updatedAt: string;
  comment: string;
  createdBy: string;
  startsAt: string;
  endsAt: string;
  matchers: Array<{
    name: string;
    value: string;
    isRegex: boolean;
  }>;
}

export interface AlertmanagerStatus {
  cluster: {
    peers: Array<{
      name: string;
      address: string;
    }>;
  };
  config: {
    original: string;
  };
  uptime: string;
  versionInfo: {
    version: string;
    revision: string;
    branch: string;
    buildUser: string;
    buildDate: string;
    goVersion: string;
  };
}

export class AlertmanagerAPI {
  private httpClient: HttpClient;

  constructor(baseURL?: string) {
    this.httpClient = new HttpClient({
      serviceName: 'alertmanager',
      customConfig: baseURL ? { url: baseURL } as any : undefined,
    });
  }

  private async query<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    return this.httpClient.get<T>(endpoint, { params });
  }

  /**
   * Get all active alerts from Alertmanager
   */
  async getAlerts(): Promise<AlertmanagerAlert[]> {
    const alerts = await this.query<AlertmanagerAlert[]>('/api/v2/alerts');
    return alerts;
  }

  /**
   * Get alert status and configuration
   */
  async getStatus(): Promise<AlertmanagerStatus> {
    return await this.query<AlertmanagerStatus>('/api/v2/status');
  }

  /**
   * Get all silences
   */
  async getSilences(): Promise<AlertmanagerSilence[]> {
    return await this.query<AlertmanagerSilence[]>('/api/v2/silences');
  }

  /**
   * Create a new silence
   */
  async createSilence(silence: {
    comment: string;
    createdBy: string;
    startsAt: string;
    endsAt: string;
    matchers: Array<{
      name: string;
      value: string;
      isRegex: boolean;
    }>;
  }): Promise<{ silenceID: string }> {
    try {
      const response = await axios.post(`${this.baseURL}/api/v2/silences`, silence, {
        timeout: 30000
      });
      return response.data;
    } catch (error) {
      console.error('Alertmanager create silence error:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to create silence: ${error.response?.data?.message || error.message}`);
      }
      throw new Error(`Failed to create silence: ${error}`);
    }
  }

  /**
   * Delete a silence by ID
   */
  async deleteSilence(silenceId: string): Promise<void> {
    try {
      await axios.delete(`${this.baseURL}/api/v2/silence/${silenceId}`, {
        timeout: 30000
      });
    } catch (error) {
      console.error('Alertmanager delete silence error:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to delete silence: ${error.response?.data?.message || error.message}`);
      }
      throw new Error(`Failed to delete silence: ${error}`);
    }
  }

  /**
   * Extract alert name from labels
   */
  extractAlertName(labels: Record<string, string>): string {
    return labels.alertname || labels.alert || 'Unknown Alert';
  }

  /**
   * Extract severity from labels
   */
  extractSeverity(labels: Record<string, string>): string {
    return labels.severity || labels.priority || 'info';
  }

  /**
   * Extract service name from labels
   */
  extractServiceName(labels: Record<string, string>): string {
    return labels.service || 
           labels.job || 
           labels.instance || 
           labels.container_name || 
           'unknown';
  }

  /**
   * Get alert summary from annotations
   */
  getAlertSummary(annotations: Record<string, string>): string {
    return annotations.summary || 
           annotations.description || 
           annotations.message || 
           'No summary available';
  }

  /**
   * Get alert description from annotations
   */
  getAlertDescription(annotations: Record<string, string>): string {
    return annotations.description || 
           annotations.summary || 
           annotations.message || 
           'No description available';
  }

  /**
   * Format timestamp for display
   */
  formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    return date.toLocaleString();
  }

  /**
   * Calculate duration between two timestamps
   */
  calculateDuration(startTime: string, endTime?: string): string {
    const start = new Date(startTime).getTime();
    const end = endTime ? new Date(endTime).getTime() : Date.now();
    const durationMs = end - start;

    const seconds = Math.floor(durationMs / 1000);
    if (seconds < 60) return `${seconds}s`;

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ${minutes % 60}m`;

    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
  }

  /**
   * Get alert value from annotations or labels
   */
  getAlertValue(alert: AlertmanagerAlert): string {
    // Try to get value from annotations first
    if (alert.annotations.value) {
      return alert.annotations.value;
    }
    
    // Try to get value from labels
    if (alert.labels.value) {
      return alert.labels.value;
    }
    
    // Try to extract from description
    const description = this.getAlertDescription(alert.annotations);
    const valueMatch = description.match(/(\d+(?:\.\d+)?[a-zA-Z%]*)/);
    if (valueMatch) {
      return valueMatch[1];
    }
    
    return 'N/A';
  }

  /**
   * Check if alert is firing (active)
   */
  isAlertFiring(alert: AlertmanagerAlert): boolean {
    return alert.status.state === 'active';
  }

  /**
   * Check if alert is suppressed
   */
  isAlertSuppressed(alert: AlertmanagerAlert): boolean {
    return alert.status.state === 'suppressed';
  }

  /**
   * Get unique services from alerts
   */
  getUniqueServices(alerts: AlertmanagerAlert[]): string[] {
    const services = new Set<string>();
    alerts.forEach(alert => {
      const service = this.extractServiceName(alert.labels);
      if (service !== 'unknown') {
        services.add(service);
      }
    });
    return Array.from(services).sort();
  }

  /**
   * Get unique severities from alerts
   */
  getUniqueSeverities(alerts: AlertmanagerAlert[]): string[] {
    const severities = new Set<string>();
    alerts.forEach(alert => {
      const severity = this.extractSeverity(alert.labels);
      severities.add(severity);
    });
    return Array.from(severities).sort();
  }

  /**
   * Filter alerts by search query
   */
  filterAlertsBySearch(alerts: AlertmanagerAlert[], searchQuery: string): AlertmanagerAlert[] {
    if (!searchQuery.trim()) {
      return alerts;
    }

    const query = searchQuery.toLowerCase();
    return alerts.filter(alert => {
      const name = this.extractAlertName(alert.labels).toLowerCase();
      const summary = this.getAlertSummary(alert.annotations).toLowerCase();
      const description = this.getAlertDescription(alert.annotations).toLowerCase();
      const service = this.extractServiceName(alert.labels).toLowerCase();

      return name.includes(query) || 
             summary.includes(query) || 
             description.includes(query) || 
             service.includes(query);
    });
  }

  /**
   * Filter alerts by severity
   */
  filterAlertsBySeverity(alerts: AlertmanagerAlert[], severity: string): AlertmanagerAlert[] {
    if (severity === 'all') {
      return alerts;
    }
    return alerts.filter(alert => this.extractSeverity(alert.labels) === severity);
  }

  /**
   * Filter alerts by status
   */
  filterAlertsByStatus(alerts: AlertmanagerAlert[], status: string): AlertmanagerAlert[] {
    if (status === 'all') {
      return alerts;
    }
    return alerts.filter(alert => alert.status.state === status);
  }

  /**
   * Filter alerts by service
   */
  filterAlertsByService(alerts: AlertmanagerAlert[], service: string): AlertmanagerAlert[] {
    if (service === 'all') {
      return alerts;
    }
    return alerts.filter(alert => this.extractServiceName(alert.labels) === service);
  }
}

export const alertmanagerAPI = new AlertmanagerAPI();
