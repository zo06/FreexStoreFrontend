'use client';

import { useState, useEffect, useCallback } from 'react';

// Simple API client for making HTTP requests
class SimpleApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000') {
    this.baseURL = baseURL;
    this.loadToken();
  }

  private loadToken() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('access_token');
    }
  }

  private getHeaders(): HeadersInit {
    // Always try to load token from localStorage before making requests
    this.loadToken();
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  async get<T>(endpoint: string): Promise<T> {
    const url = endpoint.startsWith('/') ? `${this.baseURL}${endpoint}` : `${this.baseURL}/${endpoint}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async post<T>(endpoint: string, data: unknown): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async put<T>(endpoint: string, data: unknown): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
    }
  }
}

// Create a singleton instance
export const apiClient = new SimpleApiClient();

// Hook for simple data fetching
export interface UseDataOptions {
  immediate?: boolean;
  refreshInterval?: number;
}

export interface UseDataResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useData<T>(
  endpoint: string | null,
  options: UseDataOptions = {}
): UseDataResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { immediate = true, refreshInterval } = options;

  const fetchData = useCallback(async () => {
    if (!endpoint) return;

    setLoading(true);
    setError(null);

    try {
      const result = await apiClient.get<T>(endpoint);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (immediate && endpoint) {
      fetchData();
    }
  }, [fetchData, immediate, endpoint]);

  useEffect(() => {
    if (refreshInterval && refreshInterval > 0) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, refreshInterval]);

  return { data, loading, error, refresh };
}

// Specific hooks for common data types
export function useUsers() {
  return useData<{ data: any[] }>('/admin/users');
}

export function useUser(id: string | null) {
  return useData<{ data: any }>(id ? `/admin/users/${id}` : null);
}

export function useCurrentUser() {
  return useData<{ data: any }>('/auth/profile');
}

export function useScripts() {
  return useData<{ data: any[] }>('/scripts');
}

export function useScript(id: string | null) {
  return useData<{ data: any }>(id ? `/scripts/${id}` : null);
}

export function useDashboardStats() {
  return useData<{ data: any }>('/admin/stats');
}

export function useLicenses() {
  return useData<{ data: any[] }>('/licenses');
}

export function useUserLicenses() {
  return useData<{ data: any[] }>(`/licenses/user/@me`);
}

export function useLicense(id: string | null) {
  return useData<{ data: any }>(id ? `/licenses/${id}` : null);
}

export function useCategories() {
  return useData<any[]>('/categories');
}

export function useAdminCategories() {
  const result = useData<{ data: any[] }>('/admin/categories');
  return {
    ...result,
    data: result.data?.data || null,
  };
}

export function useCategory(id: string | null) {
  return useData<any>(id ? `/categories/${id}` : null);
}

export function useActiveCategories() {
  return useData<any[]>('/categories/active');
}

// Utility functions for common operations
export const dataFetcher = {
  // User operations
  async getUsers() {
    return apiClient.get<{ data: any[] }>('/admin/users');
  },

  async getUser(id: string) {
    return apiClient.get<{ data: any }>(`/admin/users/${id}`);
  },

  async createUser(userData: any) {
    return apiClient.post<{ data: any }>('/admin/users', userData);
  },

  async updateUser(id: string, userData: any) {
    return apiClient.put<{ data: any }>(`/admin/users/${id}`, userData);
  },

  async deleteUser(id: string) {
    return apiClient.delete<{ data: any }>(`/admin/users/${id}`);
  },

  // Script operations
  async getScripts() {
    return apiClient.get<{ data: any[] }>('/scripts');
  },

  async getScript(id: string) {
    return apiClient.get<{ data: any }>(`/scripts/${id}`);
  },

  async createScript(scriptData: any) {
    return apiClient.post<{ data: any }>('/scripts', scriptData);
  },

  async updateScript(id: string, scriptData: any) {
    return apiClient.put<{ data: any }>(`/scripts/${id}`, scriptData);
  },

  async deleteScript(id: string) {
    return apiClient.delete<{ data: any }>(`/scripts/${id}`);
  },

  // License operations
  async getLicenses() {
    return apiClient.get<{ data: any[] }>('/licenses');
  },

  async getUserLicenses(userId: string) {
    return apiClient.get<{ data: any[] }>(`/licenses/user/${userId}`);
  },

  async getLicense(id: string) {
    return apiClient.get<{ data: any }>(`/licenses/${id}`);
  },

  async createLicense(licenseData: any) {
    return apiClient.post<{ data: any }>('/licenses', licenseData);
  },

  async updateLicense(id: string, licenseData: any) {
    return apiClient.put<{ data: any }>(`/licenses/${id}`, licenseData);
  },

  async deleteLicense(id: string) {
    return apiClient.delete<{ data: any }>(`/licenses/${id}`);
  },

  // Category operations
  async getCategories() {
    return apiClient.get('/categories');
  },

  async getCategory(id: string) {
    return apiClient.get(`/categories/${id}`);
  },

  async getActiveCategories() {
    return apiClient.get('/categories/active');
  },

  async createCategory(categoryData: any) {
    return apiClient.post('/categories', categoryData);
  },

  async updateCategory(id: string, categoryData: any) {
    return apiClient.put(`/categories/${id}`, categoryData);
  },

  async deleteCategory(id: string) {
    return apiClient.delete(`/categories/${id}`);
  },

  async toggleCategoryActive(id: string) {
    return apiClient.put(`/categories/${id}/toggle-active`, {});
  },

  // Dashboard operations
  async getDashboardStats() {
    return apiClient.get<{ data: any }>('/admin/stats');
  },

  // Auth operations
  async getCurrentUser() {
    return apiClient.get<{ data: any }>('/auth/profile');
  },

  async login(credentials: { email: string; password: string }) {
    const result = await apiClient.post<{ data: { token: string; user: any } }>('/auth/login', credentials);
    if (result.data.token) {
      apiClient.setToken(result.data.token);
    }
    return result;
  },

  async logout() {
    try {
      // Call the logout API to blacklist the token
      await apiClient.post('/auth/logout', {});
    } catch (error) {
      console.error('Error during logout API call:', error);
    } finally {
      // Always clear the token locally regardless of API call result
      apiClient.clearToken();
    }
    return { success: true };
  }
};

