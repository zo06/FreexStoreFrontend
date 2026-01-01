import { Console } from "console";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface AuthResponse {
  user: {
    id: string;
    username: string;
    firstName?: string;
    lastName?: string;
    role: string;
    discordId?: string;
    discordUsername?: string;
    avatar?: string;
  };
  accessToken: string;
  refreshToken: string;
}

interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

class ApiClient {
  private baseURL: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private isRefreshing = false;
  private refreshPromise: Promise<AuthTokens> | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    // Get tokens from localStorage if available
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('access_token');
      this.refreshToken = localStorage.getItem('refresh_token');
    }
  }

  setTokens(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
    }
  }

  setToken(token: string | null) {
    // Legacy method for backward compatibility
    this.accessToken = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('access_token', token);
      } else {
        localStorage.removeItem('access_token');
      }
    }
  }

  removeTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('auth_token'); // Legacy cleanup
      localStorage.removeItem('user_data');
    }
  }

  removeToken() {
    // Legacy method for backward compatibility
    this.removeTokens();
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  getRefreshToken(): string | null {
    return this.refreshToken;
  }

  private async refreshTokens(): Promise<AuthTokens> {
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    this.isRefreshing = true;
    this.refreshPromise = this.performTokenRefresh();

    try {
      const tokens = await this.refreshPromise;
      this.setTokens(tokens.accessToken, tokens.refreshToken);
      return tokens;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  private async performTokenRefresh(): Promise<AuthTokens> {
    const response = await fetch(`${this.baseURL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken: this.refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const data: RefreshResponse = await response.json();
    return {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    skipAuth = false
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: HeadersInit = {
      ...options.headers,
    };

    // Only set Content-Type to application/json if body is not FormData
    if (!(options.body instanceof FormData)) {
      headers['Content-Type' as keyof HeadersInit] = 'application/json';
    }

    if (!skipAuth && this.accessToken) {
      headers['Authorization' as keyof HeadersInit] = `Bearer ${this.accessToken}`;
    }

    let response = await fetch(url, {
      ...options,
      headers,
    });

    // If we get a 401 and have a refresh token, try to refresh
    if (response.status === 401 && !skipAuth && this.refreshToken && !endpoint.includes('/auth/refresh')) {
      try {
        await this.refreshTokens();
        // Retry the request with the new token
        (headers as Record<string, string>).Authorization = `Bearer ${this.accessToken}`;
        response = await fetch(url, {
          ...options,
          headers,
        });
      } catch (refreshError) {
        // If refresh fails, clear tokens and throw error
        this.removeTokens();
        throw new Error('Session expired. Please login again.');
      }
    }

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      
      try {
        // Try to parse as JSON first (for API errors)
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } else {
          // For HTML error pages or other content types
          const errorText = await response.text();
          // Extract meaningful error from HTML if possible
          if (errorText.includes('<!DOCTYPE')) {
            errorMessage = `Server returned HTML error page (${response.status})`;
          } else {
            errorMessage = errorText || errorMessage;
          }
        }
      } catch (parseError) {
        // If parsing fails, use status text
        errorMessage = response.statusText || errorMessage;
      }
      
      throw new Error(`API Error: ${errorMessage}`);
    }

    // Handle different response types
    const responseType = (options as any)?.responseType;
    if (responseType === 'blob') {
      return await response.blob() as T;
    }
    
    // Handle 204 No Content responses (common for DELETE operations)
    if (response.status === 204) {
      return undefined as T;
    }
    
    // Only try to parse as JSON for successful responses with content
    try {
      return await response.json();
    } catch (jsonError) {
      throw new Error('Invalid JSON response from server');
    }
  }

  // Auth endpoints
  // Note: Login now handled via Discord OAuth only
  async loginWithDiscord() {
    // Redirect to Discord OAuth endpoint
    window.location.href = `${API_BASE_URL}/auth/discord`;
  }

  // Note: Registration now handled via Discord OAuth only
  async registerWithDiscord() {
    // Redirect to Discord OAuth endpoint
    window.location.href = `${API_BASE_URL}/auth/discord`;
  }

  async refreshAuth() {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }
    
    const tokens = await this.refreshTokens();
    return tokens;
  }

  // License endpoints  
  async getUserLicenses() {
    return this.request<any>(`/licenses/user/@me`);
  }

  async getLicenseById(licenseId: string) {
    return this.request<any>(`/licenses/${licenseId}`);
  }

  async updateLicenseIpAddress(licenseId: string, ipAddress: string) {
    return this.request<any>(`/licenses/${licenseId}/ip-address`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ipAddress }),
    });
  }

  async validateLicenseByPrivateKey(privateKey: string, ipAddress?: string) {
    const params = ipAddress ? `?ipAddress=${encodeURIComponent(ipAddress)}` : '';
    return this.request<any>(`/licenses/validate/${privateKey}${params}`);
  }

  async getUserScripts() {
    return this.request<any[]>('/scripts/user');
  }

  
  async getUserActivity(page = 1, limit = 10, type?: string) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(type && { type })
    });
    return this.request<any>(`/activity/user/@me?${params}`);
  }

  async getUserActivityLegacy() {
    const dashboardStats = await this.request<any>('/data/dashboard-stats');
    return dashboardStats.recentActivity || [];
  }

  // Profile endpoints
  async getProfile() {
    return this.request('/auth/profile');
  }

  async getUserData() {
    return this.request('/data/user-data');
  }

  async getDashboardStats() {
    return this.request('/data/dashboard-stats');
  }

  async getPublicData() {
    return this.request('/data/public-data');
  }

  async getServerMembership() {
    return this.request<{ isServerMember: boolean; serverJoinedAt?: string }>('/auth/server-membership');
  }

  async logout() {
    try {
      // Call the logout API to blacklist the token
      await this.request('/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Error during logout API call:', error);
    } finally {
      // Always clear the tokens locally regardless of API call result
      this.removeTokens();
    }
  }

  async logoutAll() {
    try {
      await this.request('/auth/logout-all', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Error during logout all API call:', error);
    } finally {
      this.removeTokens();
    }
  }



  // Profile management
  async updateProfile(data: any) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async changePassword(data: { currentPassword: string; newPassword: string }) {
    return this.request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async forgotPassword(email: string) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, newPassword: string) {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  }

  async getSecurityStats() {
    return this.request('/auth/security-stats');
  }

  // Admin functions
  async toggleUserStatus(userId: string, isActive: boolean) {
    return this.request(`/auth/users/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ isActive }),
    });
  }

  async unlockAccount(userId: string) {
    return this.request(`/auth/unlock-account/${userId}`, {
      method: 'POST',
    });
  }

  // Generic CRUD operations
  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, options);
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PayPal payment methods
  async createPayPalOrder(orderData: {
    scriptId: string;
    scriptName: string;
    amount: number;
    userId: string;
    returnUrl: string;
    cancelUrl: string;
  }) {
    return this.post('/api/payments/create-order', orderData);
  }

  async capturePayPalOrder(orderId: string) {
    return this.post('/api/payments/capture-order', { orderId });
  }

  async getPayPalOrderDetails(orderId: string) {
    return this.get(`/api/payments/order/${orderId}`);
  }

  // Stripe payment methods
  async createStripeIntent(amount: number, currency: string, metadata?: any) {
    return this.post('/payment/stripe/create-intent', {
      amount,
      currency,
      metadata,
    });
  }

  async confirmStripePayment(paymentIntentId: string) {
    return this.post('/payment/stripe/confirm', {
      paymentIntentId,
    });
  }

  async cancelStripePayment(paymentIntentId: string) {
    return this.post('/payment/stripe/cancel', {
      paymentIntentId,
    });
  }

  async getLicensesIp() {
    return this.request<{ data?: { licensesIpAddress: any }; licensesIpAddress?: any }>('/licenses/ip/current');
  }

  async updateLicensesIp(data: { licensesIpAddress: any }) {
    return this.request<any>('/licenses/ip/update', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // User management methods
  async getAllUsers(params?: { page?: number; limit?: number; search?: string; role?: string; status?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.role) queryParams.append('role', params.role);
    if (params?.status) queryParams.append('status', params.status);
    
    const url = `/users${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return this.request<any>(url);
  }

  async getUserById(userId: string) {
    return this.request<any>(`/users/${userId}`);
  }

  async getPublicUserById(userId: string) {
    return this.request<any>(`/users/${userId}/public`);
  }

  async getUsersByRole(role: string, params?: { page?: number; limit?: number }) {
    const queryParams = new URLSearchParams({ role });
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    return this.request<any>(`/users/role?${queryParams.toString()}`);
  }

  async searchUsers(searchTerm: string, params?: { page?: number; limit?: number }) {
    const queryParams = new URLSearchParams({ search: searchTerm });
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    return this.request<any>(`/users/search?${queryParams.toString()}`);
  }

  async startFreeTrial() {
    return this.post<{ success: boolean; message: string; trialStartAt: string; trialEndAt: string }>('/auth/start-free-trial', {});
  }

  async createCustomRequest(data: {
    title: string;
    description: string;
    budget?: string;
    timeline?: string;
    contactEmail: string;
    contactDiscord?: string;
  }) {
    return this.post<any>('/custom-requests', data);
  }

  async getMyCustomRequests() {
    return this.request<any[]>('/custom-requests/my-requests');
  }

  async getAdminCustomRequests(params?: { page?: number; limit?: number; status?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    
    return this.request<any>(`/custom-requests/admin?${queryParams.toString()}`);
  }

  async getCustomRequestStats() {
    return this.request<any>('/custom-requests/admin/stats');
  }

  async updateCustomRequest(id: string, data: { status?: string; adminNotes?: string }) {
    return this.put<any>(`/custom-requests/admin/${id}`, data);
  }

  async deleteCustomRequest(id: string) {
    return this.delete<any>(`/custom-requests/admin/${id}`);
  }

  async createTrialLicense(scriptId: string) {
    return this.post<any>(`/licenses/trial/${scriptId}`, {});
  }

  // Contact methods
  async submitContactForm(data: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }) {
    return this.post<{ success: boolean; message: string; data: { id: string } }>('/contact', data);
  }

  async getContactMessages(params?: { page?: number; limit?: number; status?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    
    return this.request<any>(`/contact?${queryParams.toString()}`);
  }

  async getContactStats() {
    return this.request<any>('/contact/stats');
  }

  async getContactMessage(id: string) {
    return this.request<any>(`/contact/${id}`);
  }

  async updateContactMessage(id: string, data: { status?: string; adminNotes?: string; replyMessage?: string }) {
    return this.put<any>(`/contact/${id}`, data);
  }

  async markContactAsRead(id: string) {
    return this.put<any>(`/contact/${id}/read`, {});
  }

  async deleteContactMessage(id: string) {
    return this.delete<any>(`/contact/${id}`);
  }

  // Transaction methods
  async getMyTransactions() {
    return this.request<any[]>('/transactions/my');
  }

  // Script methods
  async downloadScript(scriptId: string) {
    try {
      // Download is now served directly via API - open the download endpoint URL
      const token = this.accessToken;
      const downloadUrl = `${this.baseURL}/scripts/${scriptId}/download`;
      
      // Create a temporary link with auth header workaround
      // Since we can't add headers to window.open, we'll use fetch + blob
      const response = await fetch(downloadUrl, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      
      if (!response.ok) {
        throw new Error('Download failed');
      }
      
      // Get the filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'script.rar';
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/);
        if (match) {
          filename = match[1];
        }
      }
      
      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: any) {
      console.error('Failed to download script:', error);
      throw new Error(error?.message || 'Unable to download script. Please contact support.');
    }
  }

}

// Create and export a singleton instance
export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;

