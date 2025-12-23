/**
 * API Provider Types and Utilities
 * Centralized type definitions for API responses
 */

export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  status?: number;
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

export interface ErrorResponse {
  message: string;
  error?: string;
  statusCode?: number;
}

// Re-export api client for convenience
import apiClientDefault from './api';
export const apiClient = apiClientDefault;
export const apiProvider = apiClientDefault; // Alias for backward compatibility
export default apiClientDefault;

