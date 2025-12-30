import { HttpClient } from './http-client';
import { config } from './config';

export interface PrometheusQueryResponse {
  status: string;
  data: {
    resultType: string;
    result: Array<{
      metric: Record<string, string>;
      value: [number, string];
    }>;
  };
}

export interface PrometheusRangeResponse {
  status: string;
  data: {
    resultType: string;
    result: Array<{
      metric: Record<string, string>;
      values: Array<[number, string]>;
    }>;
  };
}

export class PrometheusAPI {
  private httpClient: HttpClient;

  constructor(baseURL?: string) {
    this.httpClient = new HttpClient({
      serviceName: 'prometheus',
      customConfig: baseURL ? { url: baseURL } as any : undefined,
    });
  }

  private async query<T>(query: string, time?: number): Promise<T> {
    const params: Record<string, string> = { query };
    if (time) {
      params.time = time.toString();
    }

    return this.httpClient.get<T>('/api/v1/query', { params });
  }

  private async queryRange<T>(query: string, start: number, end: number, step: string): Promise<T> {
    const params = {
      query,
      start: start.toString(),
      end: end.toString(),
      step,
    };

    return this.httpClient.get<T>('/api/v1/query_range', { params });
  }

  // CPU Usage
  async getCPUUsage(): Promise<number> {
    const response = await this.query<PrometheusQueryResponse>(
      '100 - (avg by (instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)'
    );
    
    if (response.data.result.length > 0) {
      return parseFloat(response.data.result[0].value[1]);
    }
    return 0;
  }

  async getCPUUsageRange(start: number, end: number): Promise<Array<{ time: number; value: number }>> {
    const response = await this.queryRange<PrometheusRangeResponse>(
      '100 - (avg by (instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)',
      start,
      end,
      '1m'
    );

    if (response.data.result.length > 0) {
      return response.data.result[0].values.map(([timestamp, value]) => ({
        time: timestamp * 1000, // Convert to milliseconds
        value: parseFloat(value),
      }));
    }
    return [];
  }

  // Memory Usage
  async getMemoryUsage(): Promise<number> {
    const response = await this.query<PrometheusQueryResponse>(
      '(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100'
    );
    
    if (response.data.result.length > 0) {
      return parseFloat(response.data.result[0].value[1]);
    }
    return 0;
  }

  async getMemoryUsageRange(start: number, end: number): Promise<Array<{ time: number; value: number }>> {
    const response = await this.queryRange<PrometheusRangeResponse>(
      '(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100',
      start,
      end,
      '1m'
    );

    if (response.data.result.length > 0) {
      return response.data.result[0].values.map(([timestamp, value]) => ({
        time: timestamp * 1000,
        value: parseFloat(value),
      }));
    }
    return [];
  }

  // Disk Usage
  async getDiskUsage(): Promise<number> {
    const response = await this.query<PrometheusQueryResponse>(
      '(1 - (node_filesystem_avail_bytes{mountpoint="/",fstype!="rootfs"} / node_filesystem_size_bytes{mountpoint="/",fstype!="rootfs"})) * 100'
    );
    
    if (response.data.result.length > 0) {
      return parseFloat(response.data.result[0].value[1]);
    }
    return 0;
  }

  async getDiskUsageRange(start: number, end: number): Promise<Array<{ time: number; value: number }>> {
    const response = await this.queryRange<PrometheusRangeResponse>(
      '(1 - (node_filesystem_avail_bytes{mountpoint="/",fstype!="rootfs"} / node_filesystem_size_bytes{mountpoint="/",fstype!="rootfs"})) * 100',
      start,
      end,
      '1m'
    );

    if (response.data.result.length > 0) {
      return response.data.result[0].values.map(([timestamp, value]) => ({
        time: timestamp * 1000,
        value: parseFloat(value),
      }));
    }
    return [];
  }

  // Network Traffic
  async getNetworkTraffic(): Promise<{ inbound: number; outbound: number }> {
    const [inboundResponse, outboundResponse] = await Promise.all([
      this.query<PrometheusQueryResponse>(
        'rate(node_network_receive_bytes_total[5m]) / 1024 / 1024'
      ),
      this.query<PrometheusQueryResponse>(
        'rate(node_network_transmit_bytes_total[5m]) / 1024 / 1024'
      ),
    ]);

    const inbound = inboundResponse.data.result.length > 0 
      ? parseFloat(inboundResponse.data.result[0].value[1]) 
      : 0;
    const outbound = outboundResponse.data.result.length > 0 
      ? parseFloat(outboundResponse.data.result[0].value[1]) 
      : 0;

    return { inbound, outbound };
  }

  async getNetworkTrafficRange(start: number, end: number): Promise<Array<{ time: number; inbound: number; outbound: number }>> {
    const [inboundResponse, outboundResponse] = await Promise.all([
      this.queryRange<PrometheusRangeResponse>(
        'rate(node_network_receive_bytes_total[5m]) / 1024 / 1024',
        start,
        end,
        '1m'
      ),
      this.queryRange<PrometheusRangeResponse>(
        'rate(node_network_transmit_bytes_total[5m]) / 1024 / 1024',
        start,
        end,
        '1m'
      ),
    ]);

    const inboundData = inboundResponse.data.result.length > 0 ? inboundResponse.data.result[0].values : [];
    const outboundData = outboundResponse.data.result.length > 0 ? outboundResponse.data.result[0].values : [];

    // Merge the data by timestamp
    const mergedData: Record<number, { inbound: number; outbound: number }> = {};

    inboundData.forEach(([timestamp, value]) => {
      const time = timestamp * 1000;
      mergedData[time] = { ...mergedData[time], inbound: parseFloat(value) };
    });

    outboundData.forEach(([timestamp, value]) => {
      const time = timestamp * 1000;
      mergedData[time] = { ...mergedData[time], outbound: parseFloat(value) };
    });

    return Object.entries(mergedData)
      .map(([time, data]) => ({
        time: parseInt(time),
        inbound: data.inbound || 0,
        outbound: data.outbound || 0,
      }))
      .sort((a, b) => a.time - b.time);
  }

  // System Load
  async getSystemLoad(): Promise<{ load1: number; load5: number; load15: number }> {
    const response = await this.query<PrometheusQueryResponse>(
      'node_load1, node_load5, node_load15'
    );

    const result = { load1: 0, load5: 0, load15: 0 };

    response.data.result.forEach((item) => {
      const value = parseFloat(item.value[1]);
      if (item.metric.__name__ === 'node_load1') result.load1 = value;
      else if (item.metric.__name__ === 'node_load5') result.load5 = value;
      else if (item.metric.__name__ === 'node_load15') result.load15 = value;
    });

    return result;
  }

  // Get all current metrics at once
  async getAllCurrentMetrics() {
    const [cpu, memory, disk, network, load] = await Promise.all([
      this.getCPUUsage(),
      this.getMemoryUsage(),
      this.getDiskUsage(),
      this.getNetworkTraffic(),
      this.getSystemLoad(),
    ]);

    return {
      cpu,
      memory,
      disk,
      network,
      load,
    };
  }
}

export const prometheusAPI = new PrometheusAPI();
