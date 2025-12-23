/**
 * Unified API Client
 * Single source of truth for all API calls
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success?: boolean;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

class ApiClient {
  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('access_token');
  }

  private getHeaders(includeAuth: boolean = true): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = this.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: `HTTP Error: ${response.status}`,
        statusCode: response.status,
      }));
      throw error;
    }

    const result = await response.json();
    // Extract data from response wrapper { data: T }
    return result.data !== undefined ? result.data : result;
  }

  // GET request
  async get<T>(endpoint: string, requiresAuth: boolean = true): Promise<T> {
    const url = `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(requiresAuth),
    });
    return this.handleResponse<T>(response);
  }

  // POST request
  async post<T>(endpoint: string, data: any, requiresAuth: boolean = true): Promise<T> {
    const url = `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(requiresAuth),
      body: JSON.stringify(data),
    });
    return this.handleResponse<T>(response);
  }

  // PUT request
  async put<T>(endpoint: string, data: any, requiresAuth: boolean = true): Promise<T> {
    const url = `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: this.getHeaders(requiresAuth),
      body: JSON.stringify(data),
    });
    return this.handleResponse<T>(response);
  }

  // PATCH request
  async patch<T>(endpoint: string, data?: any, requiresAuth: boolean = true): Promise<T> {
    const url = `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const response = await fetch(url, {
      method: 'PATCH',
      headers: this.getHeaders(requiresAuth),
      body: data ? JSON.stringify(data) : undefined,
    });
    return this.handleResponse<T>(response);
  }

  // DELETE request
  async delete<T = void>(endpoint: string, requiresAuth: boolean = true): Promise<T> {
    const url = `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: this.getHeaders(requiresAuth),
    });
    
    if (response.status === 204) {
      return undefined as T;
    }
    return this.handleResponse<T>(response);
  }

  // Upload file
  async upload<T>(endpoint: string, formData: FormData, requiresAuth: boolean = true): Promise<T> {
    const url = `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const headers: HeadersInit = {};
    
    if (requiresAuth) {
      const token = this.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });
    return this.handleResponse<T>(response);
  }
}

export const apiClient = new ApiClient();
export default apiClient;

