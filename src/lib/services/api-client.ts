/**
 * Cliente API base
 * Proporciona métodos para hacer peticiones HTTP a la API
 */

import {
  ApiResponse,
  ApiError,
  RequestOptions,
  FetchError,
  HttpMethod,
} from '../types/api';

export class APIClient {
  private baseUrl: string;
  private defaultTimeout: number = 30000;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  private buildUrl(endpoint: string, params?: Record<string, string | number | boolean>): string {
    const url = new URL(`${this.baseUrl}${endpoint}`, typeof window !== 'undefined' ? window.location.origin : '');
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    return url.toString().replace(typeof window !== 'undefined' ? window.location.origin : '', '');
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');
    let data: unknown;

    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const error: FetchError = new Error(
        typeof data === 'object' && data !== null && 'message' in data
          ? (data as Record<string, unknown>).message as string
          : `HTTP ${response.status}`
      );
      error.status = response.status;
      error.response = response;
      error.data = data;
      throw error;
    }

    return data as T;
  }

  async request<T>(
    method: HttpMethod,
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { params, timeout = this.defaultTimeout, ...fetchOptions } = options;
    const url = this.buildUrl(endpoint, params);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...fetchOptions.headers,
        },
        signal: controller.signal,
        ...fetchOptions,
      });

      return await this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        const timeoutError: FetchError = new Error('Solicitud agotada');
        timeoutError.status = 408;
        throw timeoutError;
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  get<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>('GET', endpoint, options);
  }

  post<T>(endpoint: string, data?: unknown, options: RequestOptions = {}): Promise<T> {
    return this.request<T>('POST', endpoint, {
      ...options,
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  put<T>(endpoint: string, data?: unknown, options: RequestOptions = {}): Promise<T> {
    return this.request<T>('PUT', endpoint, {
      ...options,
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  patch<T>(endpoint: string, data?: unknown, options: RequestOptions = {}): Promise<T> {
    return this.request<T>('PATCH', endpoint, {
      ...options,
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  delete<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>('DELETE', endpoint, options);
  }

  async getResponse<T>(
    method: HttpMethod,
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    try {
      const data = await this.request<T>(method, endpoint, options);
      return {
        success: true,
        data,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const fetchError = error as FetchError;
      return {
        success: false,
        error: {
          code: 'API_ERROR',
          message: fetchError.message,
          statusCode: fetchError.status || 500,
          details: fetchError.data as Record<string, unknown> | undefined,
        },
        timestamp: new Date().toISOString(),
      };
    }
  }
}

export const apiClient = new APIClient();
