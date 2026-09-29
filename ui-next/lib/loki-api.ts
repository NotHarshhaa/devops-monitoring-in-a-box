import { HttpClient } from './http-client';
import { config } from './config';

export interface LokiLogEntry {
  timestamp: string;
  line: string;
  labels: Record<string, string>;
}

export interface LokiQueryResponse {
  status: string;
  data: {
    resultType: string;
    result: Array<{
      stream: Record<string, string>;
      values: Array<[string, string]>;
    }>;
    stats?: {
      summary: {
        totalBytesProcessed: number;
        totalLinesProcessed: number;
        totalEntriesReturned: number;
      };
    };
  };
}

export interface LokiLabelResponse {
  status: string;
  data: string[];
}

export interface LokiLabelValuesResponse {
  status: string;
  data: string[];
}

export interface LogQueryParams {
  query: string;
  start?: number;
  end?: number;
  limit?: number;
  direction?: 'forward' | 'backward';
}

export class LokiAPI {
  private httpClient: HttpClient;

  constructor(baseURL?: string) {
    this.httpClient = new HttpClient({
      serviceName: 'loki',
      customConfig: baseURL ? { url: baseURL } as any : undefined,
    });
  }

  private async query<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    return this.httpClient.get<T>(endpoint, { params });
  }

  /**
   * Query logs from Loki
   */
  async queryLogs(params: LogQueryParams): Promise<LokiLogEntry[]> {
    const queryParams: Record<string, any> = {
      query: params.query,
      limit: params.limit || config.loki.maxEntries,
      direction: params.direction || 'backward',
    };

    if (params.start) {
      queryParams.start = params.start;
    }
    if (params.end) {
      queryParams.end = params.end;
    }

    const response = await this.query<LokiQueryResponse>('/loki/api/v1/query_range', queryParams);
    
    if (response.status !== 'success') {
      throw new Error(`Loki query failed: ${response.status}`);
    }

    const logEntries: LokiLogEntry[] = [];
    
    response.data.result.forEach((stream) => {
      stream.values.forEach(([timestamp, line]) => {
        logEntries.push({
          timestamp,
          line,
          labels: stream.stream,
        });
      });
    });

    // Sort by timestamp (newest first)
    return logEntries.sort((a, b) => parseInt(b.timestamp) - parseInt(a.timestamp));
  }

  /**
   * Get available labels
   */
  async getLabels(): Promise<string[]> {
    const response = await this.query<LokiLabelResponse>('/loki/api/v1/labels');
    return response.data;
  }

  /**
   * Get values for a specific label
   */
  async getLabelValues(label: string): Promise<string[]> {
    const response = await this.query<LokiLabelValuesResponse>(`/loki/api/v1/label/${label}/values`);
    return response.data;
  }

  /**
   * Get available jobs (from job label)
   */
  async getJobs(): Promise<string[]> {
    try {
      return await this.getLabelValues('job');
    } catch (error) {
      console.warn('Failed to fetch jobs:', error);
      return [];
    }
  }

  /**
   * Get available namespaces (from namespace label or container_name)
   */
  async getNamespaces(): Promise<string[]> {
    try {
      const [namespaceValues, containerValues] = await Promise.all([
        this.getLabelValues('namespace').catch(() => []),
        this.getLabelValues('container_name').catch(() => [])
      ]);
      
      // Combine and deduplicate
      const allValues = Array.from(new Set([...namespaceValues, ...containerValues]));
      return allValues;
    } catch (error) {
      console.warn('Failed to fetch namespaces:', error);
      return [];
    }
  }

  /**
   * Get available severity levels (from level label)
   */
  async getSeverityLevels(): Promise<string[]> {
    try {
      return await this.getLabelValues('level');
    } catch (error) {
      console.warn('Failed to fetch severity levels:', error);
      return ['error', 'warn', 'info', 'debug'];
    }
  }

  /**
   * Build a LogQL query from filters
   */
  buildQuery(filters: {
    searchQuery?: string;
    job?: string;
    namespace?: string;
    severity?: string;
    timeRange?: string;
  }): string {
    let query = '{';
    const labelFilters: string[] = [];

    // Add label filters
    if (filters.job && filters.job !== 'all') {
      labelFilters.push(`job="${filters.job}"`);
    }
    
    if (filters.namespace && filters.namespace !== 'all') {
      // Try both namespace and container_name labels
      labelFilters.push(`(namespace="${filters.namespace}" or container_name="${filters.namespace}")`);
    }
    
    if (filters.severity && filters.severity !== 'all') {
      labelFilters.push(`level="${filters.severity}"`);
    }

    if (labelFilters.length > 0) {
      query += labelFilters.join(', ');
    } else {
      query += '__name__=~".+"'; // Match any logs
    }

    query += '}';

    // Add text search filter (escape backslashes and quotes so the
    // user input cannot break out of the LogQL string literal)
    if (filters.searchQuery && filters.searchQuery.trim()) {
      const safe = filters.searchQuery.trim().replace(/\\/g, '\\\\').replace(/"/g, '\\"');
      query += ` |= "${safe}"`;
    }

    return query;
  }

  /**
   * Get time range in nanoseconds from human readable format
   */
  getTimeRange(timeRange: string): { start: number; end: number } {
    const minutesByRange: Record<string, number> = {
      '15m': 15,
      '1h': 60,
      '6h': 360,
      '12h': 720,
      '24h': 1440,
      '1d': 1440,
      '7d': 7 * 1440,
    };
    const minutes = minutesByRange[timeRange] ?? 60;

    const end = Date.now() * 1000000; // Current time in nanoseconds
    const start = end - minutes * 60 * 1000 * 1000000;

    return { start, end };
  }

  /**
   * Format timestamp for display
   */
  formatTimestamp(timestamp: string): string {
    const date = new Date(parseInt(timestamp) / 1000000); // Convert from nanoseconds
    return date.toLocaleString();
  }

  /**
   * Extract service name from log labels
   */
  extractServiceName(labels: Record<string, string>): string {
    // Try different label keys that might contain service information
    return labels.job || 
           labels.service || 
           labels.container_name || 
           labels.namespace || 
           labels.instance || 
           'unknown';
  }

  /**
   * Extract log level from log line or labels
   */
  extractLogLevel(line: string, labels: Record<string, string>): string {
    // First try to get from labels
    if (labels.level) {
      return labels.level.toLowerCase();
    }

    // Try to extract from log line
    const levelMatch = line.match(/\b(ERROR|WARN|WARNING|INFO|DEBUG|FATAL|TRACE)\b/i);
    if (levelMatch) {
      const level = levelMatch[1].toLowerCase();
      return level === 'warning' ? 'warn' : level;
    }

    // Default to info if no level found
    return 'info';
  }
}

export const lokiAPI = new LokiAPI();
