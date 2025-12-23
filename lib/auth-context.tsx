'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { apiClient } from './api';
import { User as UserType } from './types/api.types';
interface User extends UserType { 
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (tokens: AuthTokens) => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  refreshTokens: () => Promise<boolean>;
  updateProfile: (data: { username?: string; avatar?: string }) => Promise<void>;
  changePassword: (data: { currentPassword: string; newPassword: string }) => Promise<void>;
  isAdmin: boolean;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Token storage keys
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_DATA_KEY = 'user_data';

// Auto-refresh interval (5 minutes before token expires)
const TOKEN_REFRESH_INTERVAL = 5 * 60 * 1000;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const userDataIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isRefreshingRef = useRef(false);

  // Clear all auth data
  const clearAuthData = useCallback(() => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_DATA_KEY);
    apiClient.setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    
    // Clear intervals
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
    if (userDataIntervalRef.current) {
      clearInterval(userDataIntervalRef.current);
      userDataIntervalRef.current = null;
    }
  }, []);

  // Check if token is expired
  const isTokenExpired = useCallback((token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      // Check if token expires in the next 5 minutes
      return payload.exp && (payload.exp - currentTime) < 300;
    } catch {
      return true;
    }
  }, []);

  // Refresh tokens
  const refreshTokens = useCallback(async (): Promise<boolean> => {
    if (isRefreshingRef.current) {
      return false;
    }

    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refreshToken) {
      clearAuthData();
      return false;
    }

    try {
      isRefreshingRef.current = true;
      const tokens = await apiClient.refreshAuth();
      
      if (tokens.accessToken && tokens.refreshToken) {
        localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
        apiClient.setTokens(tokens.accessToken, tokens.refreshToken);
        return true;
      }
      
      throw new Error('Invalid refresh response');
    } catch (error) {
      console.error('Token refresh failed:', error);
      clearAuthData();
      return false;
    } finally {
      isRefreshingRef.current = false;
    }
  }, [clearAuthData]);

  // Setup auto token refresh
  const setupTokenRefresh = useCallback(() => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }

    refreshIntervalRef.current = setInterval(async () => {
      const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
      if (accessToken && isTokenExpired(accessToken)) {
        const success = await refreshTokens();
        if (!success) {
          console.log('Auto token refresh failed, logging out');
        }
      }
    }, TOKEN_REFRESH_INTERVAL);
  }, [isTokenExpired, refreshTokens]);

  // Refresh user data
  const refreshUserData = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const response = await apiClient.getProfile();
      const currentUserData = response as User;
      setUser(currentUserData);
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(currentUserData));
    } catch (error) {
      console.error('Error refreshing user data:', error);
      // If unauthorized, try to refresh token first
      if (error instanceof Error && error.message.includes('401')) {
        const refreshSuccess = await refreshTokens();
        if (!refreshSuccess) {
          clearAuthData();
        }
      }
    }
  }, [isAuthenticated, refreshTokens, clearAuthData]);

  // Setup user data refresh
  const setupUserDataRefresh = useCallback(() => {
    if (userDataIntervalRef.current) {
      clearInterval(userDataIntervalRef.current);
    }

    // Refresh user data every 10 minutes
    userDataIntervalRef.current = setInterval(refreshUserData, 10 * 60 * 1000);
  }, [refreshUserData]);

  // Login function
  const login = useCallback(async (tokens: AuthTokens) => {
    try {
      localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
      apiClient.setToken(tokens.accessToken);
      
      // Fetch user data
      const response = await apiClient.getProfile();
      const userData = response as User;
      console.log(userData)
      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
      
      // Setup intervals
      setupTokenRefresh();
      setupUserDataRefresh();
    } catch (error) {
      console.error('Login error:', error);
      clearAuthData();
      throw error;
    }
  }, [clearAuthData, setupTokenRefresh, setupUserDataRefresh]);

  // Logout function
  const logout = useCallback(async () => {
    try {
      await apiClient.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuthData();
    }
  }, [clearAuthData]);

  // Logout from all devices
  const logoutAll = useCallback(async () => {
    try {
      await apiClient.logoutAll();
    } catch (error) {
      console.error('Logout all error:', error);
    } finally {
      clearAuthData();
    }
  }, [clearAuthData]);

  // Update profile
  const updateProfile = useCallback(async (data: { username?: string; avatar?: string }) => {
    try {
      const response = await apiClient.updateProfile(data) as any;
      const updatedUser = response.data || response;
      setUser(updatedUser);
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }, []);

  // Change password
  const changePassword = useCallback(async (data: { currentPassword: string; newPassword: string }) => {
    try {
      await apiClient.changePassword(data);
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  }, []);



  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
        const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
        const userData = localStorage.getItem(USER_DATA_KEY);

        if (!accessToken || !refreshToken) {
          setIsLoading(false);
          return;
        }

        // Check if access token is expired
        if (isTokenExpired(accessToken)) {
          const refreshSuccess = await refreshTokens();
          if (!refreshSuccess) {
            setIsLoading(false);
            return;
          }
        } else {
          apiClient.setToken(accessToken);
        }

        // Validate token with server and get fresh user data
        try {
          const response = await apiClient.getProfile();
          const freshUserData = response;
          console.log(response)
          setUser(freshUserData as User);
          setIsAuthenticated(true);
          localStorage.setItem(USER_DATA_KEY, JSON.stringify(response));
          
          // Setup intervals
          setupTokenRefresh();
          setupUserDataRefresh();
        } catch (error) {
          console.error('Token validation failed:', error);
          // Try to refresh token once more
          const refreshSuccess = await refreshTokens();
          if (refreshSuccess) {
            // Retry getting profile
            try {
              const response = await apiClient.getProfile();
              const freshUserData = response as User;
              
              setUser(freshUserData);
              setIsAuthenticated(true);
              localStorage.setItem(USER_DATA_KEY, JSON.stringify(freshUserData));
              
              setupTokenRefresh();
              setupUserDataRefresh();
            } catch (retryError) {
              console.error('Retry failed:', retryError);
              clearAuthData();
            }
          } else {
            clearAuthData();
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        clearAuthData();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [isTokenExpired, refreshTokens, clearAuthData, setupTokenRefresh, setupUserDataRefresh]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      if (userDataIntervalRef.current) {
        clearInterval(userDataIntervalRef.current);
      }
    };
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    logoutAll,
    refreshTokens,
    updateProfile,
    changePassword,
    isAdmin: user?.isAdmin || false,
    refreshUserData,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Higher-order component for admin-only routes
export function withAdminAuth<P extends object>(
  Component: React.ComponentType<P>
) {
  return function AdminProtectedComponent(props: P) {
    const { isAdmin, isLoading, isAuthenticated } = useAuth();

    if (isLoading) {
      return (
        <div className="flex justify-center items-center min-h-screen">
          <div className="w-8 h-8 rounded-full border-b-2 animate-spin border-primary"></div>
        </div>
      );
    }

    if (!isAuthenticated || !isAdmin) {
      return (
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <h1 className="mb-2 text-2xl font-bold text-red-600">Access Denied</h1>
            <p className="text-muted-foreground">
              {!isAuthenticated 
                ? 'You need to be logged in to access this page.'
                : 'You need admin privileges to access this page.'
              }
            </p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}

// Higher-order component for authenticated routes
export function withAuth<P extends object>(
  Component: React.ComponentType<P>
) {
  return function AuthProtectedComponent(props: P) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
      return (
        <div className="flex justify-center items-center min-h-screen">
          <div className="w-8 h-8 rounded-full border-b-2 animate-spin border-primary"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return (
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <h1 className="mb-2 text-2xl font-bold text-red-600">Authentication Required</h1>
            <p className="text-muted-foreground">You need to be logged in to access this page.</p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}

