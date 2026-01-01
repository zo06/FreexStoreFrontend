// Base API Types
export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  status: number;
  success: boolean;
}

export interface PaginatedResponse<T = unknown> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// User Types
export interface User {
  id: string;
  email: string;
  username: string;
  discordUsername?: string;
  discordId?: string;
  avatar?: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  role?: string;
  isAdmin: boolean;
  isActive: boolean;
  isServerMember: boolean;
  serverJoinedAt?: string | null;
  trialStartAt?: string | null;
  trialEndAt?: string | null;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  lastLoginIp?: string;
  licensesIpAddress?: string;
}

export interface CreateUserDto {
  email: string;
  password: string;
  username?: string;
  isAdmin?: boolean;
}

export interface UpdateUserDto {
  email?: string;
  username?: string;
  isAdmin?: boolean;
  isServerMember?: boolean;
  serverJoinedAt?: string | null;
}

// Script Types
export interface Script {
  id: string;
  name: string;
  title?: string;
  description?: string;
  version: string;
  price: number;
  isActive: boolean;
  popular: boolean;
  new: boolean;
  trialAvailable?: boolean;
  imageUrl?: string;
  imageUrls?: string[];
  youtubeUrl?: string;
  downloadUrl?: string;
  fileType?: 'rar' | 'zip' | '7z' | 'tar' | 'gz' | 'exe';
  features?: string;
  requirements?: string;
  licenseType: 'forever' | 'date';
  category?: { id?: string; name?: string } | string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
  expirationDuration?: string;
}

export interface CreateScriptDto {
  name: string;
  description?: string;
  version: string;
  isActive?: boolean;
  metadata?: Record<string, unknown>;
  expirationDuration?: string;
}

export interface UpdateScriptDto {
  name?: string;
  description?: string;
  version?: string;
  isActive?: boolean;
  metadata?: Record<string, unknown>;
  expirationDuration?: string;
}

// License Types
export interface License {
  id: string;
  userId: string;
  scriptId: string;
  privateKey: string;
  isActive: boolean;
  isRevoked: boolean;
  isTrial?: boolean;
  expiresAt?: string | null;
  lastUsedIp?: string;
  lastUsedAt?: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
  script?: Script;
  price?: number;
}

export interface CreateLicenseDto {
  userId: string;
  scriptId: string;
  expiresAt?: string;
  isActive?: boolean;
}

export interface UpdateLicenseDto {
  userId?: string;
  scriptId?: string;
  expiresAt?: string | null;
  isActive?: boolean;
  isRevoked?: boolean;
}

// Auth Types
export interface LoginResponse {
  access_token: string;
  user: User;
  refresh_token?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  username?: string;
}

// Server Membership
export interface ServerMembership {
  isServerMember: boolean;
  serverJoinedAt?: string | null;
}

// License Validation
export interface LicenseValidation {
  valid: boolean;
  license?: License;
  message?: string;
}

// Analytics Types
export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalScripts: number;
  activeScripts: number;
  totalLicenses: number;
  activeLicenses: number;
  totalRevenue: number;
  monthlyRevenue: number;
  serverMembers: number;
  newUsersToday: number;
  newLicensesToday: number;
}

export interface UserStats {
  totalUsers: number;
  adminUsers: number;
  serverMembers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  totalPurchases: number;
  totalSpent: number;
  favoriteScripts: number;
  activeProjects: number;
  userGrowth: number[];
}

export interface ScriptStats {
  totalScripts: number;
  activeScripts: number;
  inactiveScripts: number;
  scriptsWithLicenses: number;
  mostPopularScript?: Script;
  scriptUsage: Array<{
    scriptId: string;
    licenseCount: number;
  }>;
}

export interface LicenseStats {
  totalLicenses: number;
  activeLicenses: number;
  revokedLicenses: number;
  expiredLicenses: number;
  licensesToday: number;
  licensesThisWeek: number;
  licensesThisMonth: number;
  licenseGrowth: number[];
}

// API Query Parameters
export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface UserQueryParams extends PaginationParams {
  isAdmin?: boolean;
  isServerMember?: boolean;
  createdAfter?: string;
  createdBefore?: string;
}

export interface ScriptQueryParams extends PaginationParams {
  isActive?: boolean;
  version?: string;
}

export interface LicenseQueryParams extends PaginationParams {
  userId?: string;
  scriptId?: string;
  isActive?: boolean;
  isRevoked?: boolean;
  expiresBefore?: string;
  expiresAfter?: string;
}

// Error Types
export interface ValidationError {
  field: string;
  message: string;
  value?: unknown;
}

export interface ApiErrorDetails {
  message: string;
  status: number;
  errors?: ValidationError[];
  code?: string;
}

// WebSocket Types
export interface WebSocketMessage<T = unknown> {
  type: string;
  data: T;
  timestamp: string;
}

// Cache Types
export interface CacheConfig {
  ttl?: number; // Time to live in milliseconds
  key?: string;
  tags?: string[];
}

// API Provider Configuration
export interface ApiProviderConfig {
  baseURL: string;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  enableCaching?: boolean;
  enableLogging?: boolean;
}

