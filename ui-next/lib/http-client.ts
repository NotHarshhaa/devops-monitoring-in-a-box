/**
 * Enhanced HTTP Client with Retry Logic and Error Handling
 * Provides consistent HTTP request handling across all service APIs
 */

import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import { ServiceConfig, serviceConfigManager, resolveClientBaseURL } from './service-config';

export interface RetryOptions {
  retries: number;
  retryDelay: number;
  retryCondition?: (error: AxiosError) => boolean;
}

export interface HttpClientOptions {
  serviceName: keyof import('./service-config').ServiceConnectionConfig;
  customConfig?: Partial<ServiceConfig>;
}

/**
 * Enhanced HTTP Client with retry logic and better error handling
 */
export class HttpClient {
  private axiosInstance: AxiosInstance;
  private serviceConfig: ServiceConfig;
  private serviceName: string;
  /** Base URL actually used for requests: the proxy path in the browser. */
  private baseURL: string;

  constructor(options: HttpClientOptions) {
    const config = serviceConfigManager.getServiceConfig(options.serviceName);
    this.serviceConfig = { ...config, ...options.customConfig };
    this.serviceName = options.serviceName;

    // In the browser, monitoring backends are reached through the same-origin
    // authenticated proxy (/api/proxy/<service>) rather than directly: Docker
    // hostnames are not resolvable client-side and direct calls would be
    // cross-origin. An explicit customConfig.url always wins.
    this.baseURL = options.customConfig?.url
      ? this.serviceConfig.url
      : resolveClientBaseURL(options.serviceName, this.serviceConfig.url);

    // Create axios instance with default config
    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      timeout: this.serviceConfig.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Add request interceptor for logging
    this.axiosInstance.interceptors.request.use(
      (config) => {
        if (process.env.NODE_ENV === 'development') {
          console.log(`[${this.serviceName}] Request:`, config.method?.toUpperCase(), config.url);
        }
        return config;
      },
      (error) => {
        console.error(`[${this.serviceName}] Request error:`, error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => {
        // Update connection cache on success
        serviceConfigManager.updateConnectionCache(this.serviceName, true);
        return response;
      },
      async (error: AxiosError) => {
        // Update connection cache on error
        serviceConfigManager.updateConnectionCache(this.serviceName, false);

        // Log error details only for non-connection errors in development
        if (process.env.NODE_ENV === 'development') {
          if (!this.isSoftConnectivityError(error)) {
            const data = error.response?.data as { error?: string; errorType?: string } | undefined;
            // Single string so Next.js overlay doesn't render an empty `{}`
            console.error(
              `[${this.serviceName}] Response error: ` +
                `${error.response?.status ?? 'no-status'} ${error.response?.statusText ?? ''}`.trim() +
                ` — ${data?.error || data?.errorType || error.message || 'unknown error'}`
            );
          }
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * True when the upstream is down/unreachable (or the browser cannot reach
   * the proxy). Includes proxied 502/503/504 bodies from our API route so
   * those don't spam the console as "response errors".
   */
  private isSoftConnectivityError(error: AxiosError): boolean {
    if (
      error.code === 'ECONNREFUSED' ||
      error.code === 'ERR_NETWORK' ||
      error.code === 'ECONNABORTED' ||
      error.code === 'ERR_CANCELED' ||
      error.message?.includes('Network Error') ||
      error.message?.includes('fetch failed') ||
      error.message?.includes('connect ECONNREFUSED') ||
      error.message?.includes('Unable to connect')
    ) {
      return true;
    }

    const status = error.response?.status;
    const data = error.response?.data as { errorType?: string } | undefined;
    if (
      (status === 502 || status === 503 || status === 504) &&
      (data?.errorType === 'upstream_unreachable' ||
        data?.errorType === 'timeout' ||
        data?.errorType === 'service_disabled')
    ) {
      return true;
    }

    // No HTTP response at all → treat as connectivity
    return status === undefined && !error.response?.data;
  }

  /**
   * Check if error should be retried
   */
  private shouldRetry(error: AxiosError, attempt: number, maxRetries: number): boolean {
    if (attempt >= maxRetries) {
      return false;
    }

    // Don't hammer a down stack (proxy 502 upstream_unreachable, etc.)
    if (this.isSoftConnectivityError(error)) {
      return false;
    }

    // Retry on network errors
    if (!error.response) {
      return true;
    }

    // Retry on 5xx errors (server errors)
    if (error.response.status >= 500 && error.response.status < 600) {
      return true;
    }

    // Retry on 408 (Request Timeout)
    if (error.response.status === 408) {
      return true;
    }

    // Retry on 429 (Too Many Requests)
    if (error.response.status === 429) {
      return true;
    }

    return false;
  }

  /**
   * Calculate retry delay with exponential backoff
   */
  private calculateRetryDelay(attempt: number, baseDelay: number): number {
    return Math.min(baseDelay * Math.pow(2, attempt), 10000); // Max 10 seconds
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Make HTTP request with retry logic
   */
  async request<T = any>(config: AxiosRequestConfig): Promise<T> {
    const maxRetries = this.serviceConfig.retries;
    let lastError: AxiosError | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await this.axiosInstance.request<T>(config);
        return response.data;
      } catch (error) {
        lastError = error as AxiosError;

        // Check if we should retry
        if (!this.shouldRetry(lastError, attempt, maxRetries)) {
          throw this.formatError(lastError);
        }

        // Calculate delay before retry
        if (attempt < maxRetries) {
          const delay = this.calculateRetryDelay(attempt, this.serviceConfig.retryDelay);
          if (process.env.NODE_ENV === 'development') {
            console.warn(
              `[${this.serviceName}] Request failed (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${delay}ms...`
            );
          }
          await this.sleep(delay);
        }
      }
    }

    // All retries exhausted
    throw this.formatError(lastError!);
  }

  /**
   * Format error for better error messages
   */
  private formatError(error: AxiosError): Error {
    if (this.isSoftConnectivityError(error)) {
      const data = error.response?.data as { error?: string } | undefined;
      return new Error(
        data?.error ||
          `Unable to connect to ${this.serviceName}. Service may not be running.`
      );
    }

    if (!error.response) {
      return new Error(
        `Failed to connect to ${this.serviceName} at ${this.baseURL}. ` +
        `Please check if the service is running and accessible.`
      );
    }

    const status = error.response.status;
    const statusText = error.response.statusText;
    const data = error.response.data as any;

    if (status === 401) {
      return new Error(
        `Your session has expired. Sign in again to query ${this.serviceName}.`
      );
    }

    if (status === 403) {
      return new Error(
        data?.message ||
          `You are not permitted to perform this ${this.serviceName} request.`
      );
    }

    let message = `${this.serviceName} returned ${status} ${statusText}`;
    
    if (data?.message) {
      message += `: ${data.message}`;
    } else if (data?.error) {
      message += `: ${data.error}`;
    }

    return new Error(message);
  }

  /**
   * GET request
   */
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'GET', url });
  }

  /**
   * POST request
   */
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'POST', url, data });
  }

  /**
   * PUT request
   */
  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'PUT', url, data });
  }

  /**
   * DELETE request
   */
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'DELETE', url });
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    if (!this.serviceConfig.healthCheckEndpoint) {
      return false;
    }

    try {
      await this.get(this.serviceConfig.healthCheckEndpoint, { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get base URL
   */
  getBaseURL(): string {
    return this.baseURL;
  }

  /**
   * Get the configured upstream URL (server-side address of the service)
   */
  getUpstreamURL(): string {
    return this.serviceConfig.url;
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<ServiceConfig>): void {
    this.serviceConfig = { ...this.serviceConfig, ...updates };
    if (updates.url) {
      this.baseURL = updates.url;
      this.axiosInstance.defaults.baseURL = this.baseURL;
    }
    this.axiosInstance.defaults.timeout = this.serviceConfig.timeout;
  }
}

