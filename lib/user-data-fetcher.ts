import { apiProvider } from '@/lib/api-provider';
import { ApiResponse, PaginatedResponse } from '@/lib/api-provider';

// User data types
export interface User {
  id: string;
  email: string;
  username?: string;
  discordUsername?: string;
  discordId?: string;
  avatar?: string;
  isAdmin: boolean;
  isServerMember?: boolean;
  serverJoinedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  profile?: {
    firstName?: string;
    lastName?: string;
    avatar?: string;
    bio?: string;
  };
}

export interface UserFetchOptions {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
  filters?: Record<string, unknown>;
  includeProfile?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface UserDataFetcherConfig {
  baseEndpoint?: string;
  defaultLimit?: number;
  enableCaching?: boolean;
  cacheTimeout?: number;
}

// Cache management
class UserDataCache {
  private cache = new Map<string, { data: unknown; timestamp: number; ttl: number }>();
  
  set(key: string, data: unknown, ttl: number = 300000) { // 5 minutes default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }
  
  get(key: string): unknown | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }
  
  clear(pattern?: string) {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }
}

/**
 * Universal User Data Fetcher
 * Provides comprehensive user data fetching capabilities across the website
 */
export class UserDataFetcher {
  private cache = new UserDataCache();
  private config: UserDataFetcherConfig;
  
  constructor(config: UserDataFetcherConfig = {}) {
    this.config = {
      baseEndpoint: '/users',
      defaultLimit: 20,
      enableCaching: true,
      cacheTimeout: 300000, // 5 minutes
      ...config
    };
  }
  
  /**
   * Fetch all users with optional filtering and pagination
   */
  async fetchAllUsers(options: UserFetchOptions = {}): Promise<ApiResponse<PaginatedResponse<User>>> {
    const cacheKey = `all-users-${JSON.stringify(options)}`;
    
    if (this.config.enableCaching) {
      const cached = this.cache.get(cacheKey);
      if (cached) return cached as ApiResponse<PaginatedResponse<User>>;
    }
    
    try {
      const result = await apiProvider.getAllUsers({
        page: options.page || 1,
        limit: options.limit || this.config.defaultLimit,
        search: options.search,
        role: options.role,
        status: options.status
      });
      
      if (this.config.enableCaching) {
        this.cache.set(cacheKey, result, this.config.cacheTimeout!);
      }
      
      return result;
    } catch (error) {
      console.error('Error fetching all users:', error);
      throw error;
    }
  }
  
  /**
   * Fetch a single user by ID
   */
  async fetchUserById(userId: string, isAdmin: boolean = false): Promise<ApiResponse<User>> {
    const cacheKey = `user-${userId}-${isAdmin ? 'admin' : 'public'}`;
    
    if (this.config.enableCaching) {
      const cached = this.cache.get(cacheKey);
      if (cached) return cached as ApiResponse<User>;
    }
    
    try {
      const result = isAdmin 
        ? await apiProvider.getUserById(userId)
        : await apiProvider.getPublicUserById(userId);
      
      if (this.config.enableCaching) {
        this.cache.set(cacheKey, result, this.config.cacheTimeout!);
      }
      
      return result;
    } catch (error) {
      console.error(`Error fetching user ${userId}:`, error);
      throw error;
    }
  }
  
  /**
   * Fetch users by role
   */
  async fetchUsersByRole(role: string, options: Pick<UserFetchOptions, 'page' | 'limit'> = {}): Promise<ApiResponse<PaginatedResponse<User>>> {
    const cacheKey = `users-role-${role}-${JSON.stringify(options)}`;
    
    if (this.config.enableCaching) {
      const cached = this.cache.get(cacheKey);
      if (cached) return cached as ApiResponse<PaginatedResponse<User>>;
    }
    
    try {
      const result = await apiProvider.getUsersByRole(role, {
        page: options.page || 1,
        limit: options.limit || this.config.defaultLimit
      });
      
      if (this.config.enableCaching) {
        this.cache.set(cacheKey, result, this.config.cacheTimeout!);
      }
      
      return result;
    } catch (error) {
      console.error(`Error fetching users by role ${role}:`, error);
      throw error;
    }
  }
  
  /**
   * Search users with advanced filtering
   */
  async searchUsers(searchTerm: string, options: UserFetchOptions = {}): Promise<ApiResponse<PaginatedResponse<User>>> {
    const cacheKey = `search-users-${searchTerm}-${JSON.stringify(options)}`;
    
    if (this.config.enableCaching) {
      const cached = this.cache.get(cacheKey);
      if (cached) return cached as ApiResponse<PaginatedResponse<User>>;
    }
    
    try {
      const result = await apiProvider.searchUsers(searchTerm, {
        page: options.page || 1,
        limit: options.limit || this.config.defaultLimit
      });
      
      if (this.config.enableCaching) {
        this.cache.set(cacheKey, result, this.config.cacheTimeout!);
      }
      
      return result;
    } catch (error) {
      console.error(`Error searching users with term "${searchTerm}":`, error);
      throw error;
    }
  }
  
  /**
   * Fetch current user profile
   */
  async fetchCurrentUserProfile(): Promise<ApiResponse<User>> {
    const cacheKey = 'current-user-profile';
    
    if (this.config.enableCaching) {
      const cached = this.cache.get(cacheKey);
      if (cached) return cached as ApiResponse<User>;
    }
    
    try {
      const result = await apiProvider.getProfile() as User;
      const response: ApiResponse<User> = {
        data: result,
        status: 200
      };
      
      if (this.config.enableCaching) {
        this.cache.set(cacheKey, response, this.config.cacheTimeout!);
      }
      
      return response;
    } catch (error) {
      console.error('Error fetching current user profile:', error);
      throw error;
    }
  }
  
  /**
   * Fetch server membership status
   */
  async fetchServerMembership(): Promise<ApiResponse<{ isServerMember: boolean; serverJoinedAt?: string }>> {
    const cacheKey = 'server-membership';
    
    if (this.config.enableCaching) {
      const cached = this.cache.get(cacheKey);
      if (cached) return cached as ApiResponse<{ isServerMember: boolean; serverJoinedAt?: string }>;
    }
    
    try {
      const result = await apiProvider.getServerMembership();
      const response: ApiResponse<{ isServerMember: boolean; serverJoinedAt?: string }> = {
        data: result as { isServerMember: boolean; serverJoinedAt?: string },
        status: 200
      };
      
      if (this.config.enableCaching) {
        this.cache.set(cacheKey, response, this.config.cacheTimeout!);
      }
      
      return response;
    } catch (error) {
      console.error('Error fetching server membership:', error);
      throw error;
    }
  }
  
  /**
   * Batch fetch multiple users by IDs
   */
  async fetchUsersByIds(userIds: string[], isAdmin: boolean = false): Promise<User[]> {
    const promises = userIds.map(id => this.fetchUserById(id, isAdmin));
    
    try {
      const results = await Promise.allSettled(promises);
      return results
        .filter((result): result is PromiseFulfilledResult<ApiResponse<User>> => result.status === 'fulfilled')
        .map(result => result.value.data);
    } catch (error) {
      console.error('Error batch fetching users:', error);
      throw error;
    }
  }
  
  /**
   * Clear cache for specific patterns or all cache
   */
  clearCache(pattern?: string) {
    this.cache.clear(pattern);
  }
  
  /**
   * Update cache configuration
   */
  updateConfig(newConfig: Partial<UserDataFetcherConfig>) {
    this.config = { ...this.config, ...newConfig };
  }
}

// Create and export default instance
export const userDataFetcher = new UserDataFetcher();

// Export convenience functions for direct use
export const fetchAllUsers = (options?: UserFetchOptions) => userDataFetcher.fetchAllUsers(options);
export const fetchUserById = (userId: string, isAdmin?: boolean) => userDataFetcher.fetchUserById(userId, isAdmin);
export const fetchUsersByRole = (role: string, options?: Pick<UserFetchOptions, 'page' | 'limit'>) => userDataFetcher.fetchUsersByRole(role, options);
export const searchUsers = (searchTerm: string, options?: UserFetchOptions) => userDataFetcher.searchUsers(searchTerm, options);
export const fetchCurrentUserProfile = () => userDataFetcher.fetchCurrentUserProfile();
export const fetchServerMembership = () => userDataFetcher.fetchServerMembership();
export const fetchUsersByIds = (userIds: string[], isAdmin?: boolean) => userDataFetcher.fetchUsersByIds(userIds, isAdmin);

export default userDataFetcher;

