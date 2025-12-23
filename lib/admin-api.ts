import apiClient from './api'
import type { User, Script, License } from './types/api.types'

// Re-export for convenience
export type { User, Script, License }

// User Management API
export interface CreateUserRequest {
  email: string;
  password: string;
  username: string;
  isAdmin?: boolean;
}

export interface UpdateUserRequest {
  email?: string;
  username?: string;
  isAdmin?: boolean;
}

// Script Management API  
export interface CreateScriptRequest {
  name: string;
  description: string;
  category: string;
  price: number;
  version?: string;
  isActive?: boolean;
  popular?: boolean;
  new?: boolean;
  trialAvailable?: boolean;
  imageUrl?: string;
  imageUrls?: string[];
  youtubeUrl?: string;
  downloadUrl?: string;
  fileType?: 'rar' | 'zip' | '7z' | 'tar' | 'gz' | 'exe';
  features?: string;
  requirements?: string;
  licenseType?: 'forever' | 'date';
}

export interface UpdateScriptRequest {
  name?: string;
  description?: string;
  category?: string;
  price?: number;
  version?: string;
  isActive?: boolean;
  popular?: boolean;
  new?: boolean;
  trialAvailable?: boolean;
  imageUrl?: string;
  imageUrls?: string[];
  youtubeUrl?: string;
  downloadUrl?: string;
  fileType?: 'rar' | 'zip' | '7z' | 'tar' | 'gz' | 'exe';
  features?: string;
  requirements?: string;
  licenseType?: 'forever' | 'date';
}

// License Management API
export interface CreateLicenseRequest {
  scriptId: string;
  userId: string;
  expiresAt: string;
}

export interface UpdateLicenseRequest {
  expiresAt?: string;
  isActive?: boolean;
}

// Category Management API
export interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  icon?: string;
  isActive?: boolean;
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
  icon?: string;
  isActive?: boolean;
}

// Admin API Functions
export const adminApi = {
  // User Management
  users: {
    getAll: async (params?: { page?: number; limit?: number }): Promise<{data: User[], total: number}> => {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      
      const url = `/admin/users${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await apiClient.get<{data: User[], total?: number}>(url);
      return {
        data: response.data,
        total: response.total || response.data.length
      };
    },
    
    // Alias for backward compatibility
    getUsers: async (params?: { page?: number; limit?: number }): Promise<{data: User[], total: number}> => {
      return adminApi.users.getAll(params);
    },
    
    getById: async (id: string): Promise<User> => {
      const response = await apiClient.get<{data: User}>(`/admin/users/${id}`);
      return response.data;
    },
    
    create: async (userData: CreateUserRequest): Promise<User> => {
      const response = await apiClient.post<{data: User}>('/admin/users', userData);
      return response.data;
    },
    
    update: async (id: string, userData: UpdateUserRequest): Promise<User> => {
      const response = await apiClient.put<{data: User}>(`/admin/users/${id}`, userData);
      return response.data;
    },
    
    delete: async (id: string): Promise<void> => {
      await apiClient.delete(`/admin/users/${id}`);
    },
    
    toggleAdmin: async (id: string): Promise<User> => {
      const response = await apiClient.patch<{data: User}>(`/admin/users/${id}/toggle-admin`);
      return response.data;
    }
  },
  
  // Script Management
  scripts: {
    getAll: async (): Promise<Script[]> => {
      const response = await apiClient.get<{data: Script[]}>('/admin/scripts');
      return response.data;
    },
    
    getById: async (id: string): Promise<{script: Script; categories: Category[]; developers: any[]}> => {
      const response = await apiClient.get<{data: {script: Script; categories: Category[]; developers: any[]}}>(`/admin/scripts/${id}`);
      return response.data;
    },
    
    create: async (scriptData: CreateScriptRequest): Promise<Script> => {
      const response = await apiClient.post<{data: Script}>('/admin/scripts', scriptData);
      return response.data;
    },
    
    update: async (id: string, scriptData: UpdateScriptRequest): Promise<Script> => {
      const response = await apiClient.put<{data: Script}>(`/admin/scripts/${id}`, scriptData);
      return response.data;
    },
    
    delete: async (id: string): Promise<void> => {
      await apiClient.delete(`/admin/scripts/${id}`);
    },
    
    toggleActive: async (id: string): Promise<Script> => {
      const response = await apiClient.patch<{data: Script}>(`/admin/scripts/${id}/toggle-active`);
      return response.data;
    },
    
    uploadFile: async (id: string, file: File): Promise<Script> => {
      const formData = new FormData();
      formData.append('file', file);
      
      // Extract file extension and set fileType
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'rar';
      formData.append('fileType', fileExtension);
      
      const response = await apiClient.post<{data: Script}>(`/admin/scripts/${id}/upload`, formData);
      return response.data;
    },
    
    // Direct upload RAR to Cloudinary (returns downloadUrl without needing script ID)
    uploadRarDirect: async (file: File): Promise<{downloadUrl: string; publicId: string; originalName: string; size: number; fileType: string}> => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await apiClient.post<{downloadUrl: string; publicId: string; originalName: string; size: number; fileType: string; message: string}>('/admin/scripts/upload-rar', formData);
      return response;
    },
    
    uploadImage: async (id: string, image: File): Promise<{imageUrl: string; message: string; filename: string}> => {
      const formData = new FormData();
      formData.append('image', image);
      const response = await apiClient.post<{imageUrl: string; message: string; filename: string}>(`/admin/scripts/${id}/upload-image`, formData);
      return response;
    },
    
    uploadImages: async (id: string, images: File[]): Promise<{imageUrls: string[]; message: string; count: number}> => {
      // Convert files to base64
      const base64Images: string[] = [];
      
      for (const image of images) {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(image);
        });
        base64Images.push(base64);
      }
      
      const response = await apiClient.post<{imageUrls: string[]; message: string; count: number}>(`/admin/scripts/${id}/upload-images`, {
        images: base64Images
      });
      return response;
    },
    
    downloadFile: async (id: string): Promise<Blob> => {
      const response = await apiClient.get(`/admin/scripts/${id}/download`) as any;
      return response as Blob;
    }
  },
  
  // License Management
  licenses: {
    getAll: async (): Promise<License[]> => {
      const response = await apiClient.get<{data: License[]}>('/admin/licenses');
      return response.data;
    },
    
    getById: async (id: string): Promise<License> => {
      const response = await apiClient.get<{data: License}>(`/admin/licenses/${id}`);
      return response.data;
    },
    
    getByUser: async (userId: string): Promise<License[]> => {
      const response = await apiClient.get<{data: License[]}>(`/admin/licenses/user/${userId}`);
      return response.data;
    },
    
    getByScript: async (scriptId: string): Promise<License[]> => {
      const response = await apiClient.get<{data: License[]}>(`/admin/licenses/script/${scriptId}`);
      return response.data;
    },
    
    create: async (licenseData: CreateLicenseRequest): Promise<License> => {
      const response = await apiClient.post<{data: License}>('/admin/licenses', licenseData);
      return response.data;
    },
    
    update: async (id: string, licenseData: UpdateLicenseRequest): Promise<License> => {
      const response = await apiClient.put<{data: License}>(`/admin/licenses/${id}`, licenseData);
      return response.data;
    },
    
    delete: async (id: string): Promise<void> => {
      await apiClient.delete(`/admin/licenses/${id}`);
    },
    
    revoke: async (id: string): Promise<License> => {
      const response = await apiClient.patch<{data: License}>(`/admin/licenses/${id}/revoke`);
      return response.data;
    }
  },
  
  // Category Management
  categories: {
    getAll: async (): Promise<Category[]> => {
      const response = await apiClient.get<{data: Category[]}>('/admin/categories');
      return response.data;
    },
    
    getActive: async (): Promise<Category[]> => {
      const response = await apiClient.get<{data: Category[]}>(`/categories/active`);
      return response.data;
    },
    
    getById: async (id: string ): Promise<Category> => {
      const response = await apiClient.get<{data: Category}>(`/categories/${id}`);
      return response.data;
    },
    
    create: async (categoryData: CreateCategoryRequest): Promise<Category> => {
      const response = await apiClient.post<{data: Category}>('/categories', categoryData);
      return response.data;
    },
    
    update: async (id: string, categoryData: UpdateCategoryRequest): Promise<Category> => {
      const response = await apiClient.patch<{data: Category}>(`/categories/${id}`, categoryData);
      return response.data;
    },
    
    delete: async (id: string): Promise<void> => {
      await apiClient.delete(`/categories/${id}`);
    },
    
    toggleActive: async (id: string): Promise<Category> => {
      const response = await apiClient.patch<{data: Category}>(`/admin/categories/${id}/toggle-active`);
      return response.data;
    },

    uploadIcon: async (id: string, icon: File): Promise<{iconUrl: string; message: string; filename: string}> => {
      const formData = new FormData();
      formData.append('icon', icon);
      const response = await apiClient.post<{iconUrl: string; message: string; filename: string}>(`/categories/${id}/upload-icon`, formData);
      return response;
    }
  },
  
  // Analytics and Stats
  analytics: {
    getDashboardStats: async () => {
      const response = await apiClient.get<{data: any}>('/admin/analytics/dashboard');
      return response.data;
    },
    
    getUserStats: async () => {
      const response = await apiClient.get<{data: any}>('/admin/analytics/users');
      return response.data;
    },
    
    getScriptStats: async () => {
      const response = await apiClient.get<{data: any}>('/admin/analytics/scripts');
      return response.data;
    },
    
    getLicenseStats: async () => {
      const response = await apiClient.get<{data: any}>('/admin/analytics/licenses');
      return response.data;
    }
  }
};

// Error handling wrapper
export const withErrorHandling = <T extends any[], R>(
  fn: (...args: T) => Promise<R>
) => {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error: any) {
      
      console.error('Admin API Error:', error);

      // Extract error message from the improved API client
      const errorMessage = error.message || 'An unexpected error occurred';
      
      // Handle specific error cases based on error message content
      if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
        throw new Error('Unauthorized: Admin access required');
      } else if (errorMessage.includes('403') || errorMessage.includes('Forbidden')) {
        throw new Error('Forbidden: Insufficient permissions');
      } else if (errorMessage.includes('404') || errorMessage.includes('Not Found')) {
        throw new Error('Resource not found');
      } else if (errorMessage.includes('500') || errorMessage.includes('Server returned HTML error page')) {
        throw new Error('Server error: Please try again later');
      } else if (errorMessage.includes('Invalid JSON response')) {
        throw new Error('Server communication error: Invalid response format');
      } else {
        // Pass through the improved error message from the API client
        throw new Error(errorMessage);
      }
    }
  };
};

// Wrapped admin API with error handling
export const safeAdminApi = {
  users: {
    getAll: withErrorHandling(adminApi.users.getAll),
    getUsers: withErrorHandling(adminApi.users.getUsers),
    getById: withErrorHandling(adminApi.users.getById),
    create: withErrorHandling(adminApi.users.create),
    update: withErrorHandling(adminApi.users.update),
    delete: withErrorHandling(adminApi.users.delete),
    toggleAdmin: withErrorHandling(adminApi.users.toggleAdmin)
  },
  scripts: {
    getAll: withErrorHandling(adminApi.scripts.getAll),
    getById: withErrorHandling(adminApi.scripts.getById),
    create: withErrorHandling(adminApi.scripts.create),
    update: withErrorHandling(adminApi.scripts.update),
    delete: withErrorHandling(adminApi.scripts.delete),
    toggleActive: withErrorHandling(adminApi.scripts.toggleActive),
    uploadFile: withErrorHandling(adminApi.scripts.uploadFile),
    uploadRarDirect: withErrorHandling(adminApi.scripts.uploadRarDirect),
    uploadImage: withErrorHandling(adminApi.scripts.uploadImage),
    uploadImages: withErrorHandling(adminApi.scripts.uploadImages),
    downloadFile: withErrorHandling(adminApi.scripts.downloadFile)
  },
  licenses: {
    getAll: withErrorHandling(adminApi.licenses.getAll),
    getById: withErrorHandling(adminApi.licenses.getById),
    getByUser: withErrorHandling(adminApi.licenses.getByUser),
    getByScript: withErrorHandling(adminApi.licenses.getByScript),
    create: withErrorHandling(adminApi.licenses.create),
    update: withErrorHandling(adminApi.licenses.update),
    delete: withErrorHandling(adminApi.licenses.delete),
    revoke: withErrorHandling(adminApi.licenses.revoke)
  },
  categories: {
    getAll: withErrorHandling(adminApi.categories.getAll),
    getActive: withErrorHandling(adminApi.categories.getActive),
    getById: withErrorHandling(adminApi.categories.getById),
    create: withErrorHandling(adminApi.categories.create),
    update: withErrorHandling(adminApi.categories.update),
    delete: withErrorHandling(adminApi.categories.delete),
    toggleActive: withErrorHandling(adminApi.categories.toggleActive),
    uploadIcon: withErrorHandling(adminApi.categories.uploadIcon)
  },
  analytics: {
    getDashboardStats: withErrorHandling(adminApi.analytics.getDashboardStats),
    getUserStats: withErrorHandling(adminApi.analytics.getUserStats),
    getScriptStats: withErrorHandling(adminApi.analytics.getScriptStats),
    getLicenseStats: withErrorHandling(adminApi.analytics.getLicenseStats)
  }
};

