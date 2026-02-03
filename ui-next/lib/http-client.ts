/**
 * Enhanced HTTP Client with Retry Logic and Error Handling
 * Provides consistent HTTP request handling across all service APIs
 */

import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import { ServiceConfig, serviceConfigManager } from './service-config';

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

  constructor(options: HttpClientOptions) {
    const config = serviceConfigManager.getServiceConfig(options.serviceName);
    this.serviceConfig = { ...config, ...options.customConfig };
    this.serviceName = options.serviceName;

    // Create axios instance with default config
    this.axiosInstance = axios.create({
      baseURL: this.serviceConfig.url,
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
          // Suppress connection errors when services aren't running
          const isConnectionError = 
            error.code === 'ECONNREFUSED' || 
            error.code === 'ERR_NETWORK' ||
            error.message?.includes('Network Error') ||
            error.message?.includes('fetch failed') ||
            error.message?.includes('connect ECONNREFUSED') ||
            error.message?.includes('Unable to connect') ||
            (error.response?.status === undefined && !error.response?.data);
          
          if (!isConnectionError) {
            console.error(`[${this.serviceName}] Response error:`, {
              status: error.response?.status,
              statusText: error.response?.statusText,
              data: error.response?.data,
              message: error.message,
            });
          }
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Check if error should be retried
   */
  private shouldRetry(error: AxiosError, attempt: number, maxRetries: number): boolean {
    if (attempt >= maxRetries) {
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
    if (!error.response) {
      // Network error - check if it's a connection error
      const isConnectionError = 
        error.code === 'ECONNREFUSED' || 
        error.code === 'ERR_NETWORK' ||
        error.message?.includes('Network Error') ||
        error.message?.includes('fetch failed') ||
        error.message?.includes('connect ECONNREFUSED');

      if (isConnectionError) {
        // For connection errors, return a simpler message that won't be logged to console
        return new Error(`Unable to connect to ${this.serviceName}. Service may not be running.`);
      }

      // Other network errors
      return new Error(
        `Failed to connect to ${this.serviceName} at ${this.serviceConfig.url}. ` +
        `Please check if the service is running and accessible.`
      );
    }

    const status = error.response.status;
    const statusText = error.response.statusText;
    const data = error.response.data as any;

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
    return this.serviceConfig.url;
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<ServiceConfig>): void {
    this.serviceConfig = { ...this.serviceConfig, ...updates };
    this.axiosInstance.defaults.baseURL = this.serviceConfig.url;
    this.axiosInstance.defaults.timeout = this.serviceConfig.timeout;
  }
}

