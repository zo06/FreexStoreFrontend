import { useState, useEffect, useCallback, useRef } from 'react';
import { userDataFetcher, UserFetchOptions, User } from '@/lib/user-data-fetcher';
import { ApiResponse, PaginatedResponse } from '@/lib/api-provider';

// Hook state interface
interface UseUserDataState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

interface UseUserDataOptions {
  immediate?: boolean; // Whether to fetch immediately on mount
  refreshInterval?: number; // Auto-refresh interval in milliseconds
  retryCount?: number; // Number of retry attempts on failure
  retryDelay?: number; // Delay between retries in milliseconds
}

/**
 * Hook for fetching all users with pagination and filtering
 */
export const useAllUsers = (
  options: UserFetchOptions = {},
  hookOptions: UseUserDataOptions = {}
): UseUserDataState<PaginatedResponse<User>> => {
  const [data, setData] = useState<PaginatedResponse<User> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);
  
  const {
    immediate = true,
    refreshInterval,
    retryCount = 3,
    retryDelay = 1000
  } = hookOptions;
  
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await userDataFetcher.fetchAllUsers(options);
      setData(response.data);
      retryCountRef.current = 0; // Reset retry count on success
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch users';
      setError(errorMessage);
      
      // Retry logic
      if (retryCountRef.current < retryCount) {
        retryCountRef.current++;
        retryTimeoutRef.current = setTimeout(() => {
          fetchData();
        }, retryDelay * retryCountRef.current); // Exponential backoff
      }
    } finally {
      setLoading(false);
    }
  }, [options, retryCount, retryDelay]);
  
  const refresh = useCallback(async () => {
    retryCountRef.current = 0; // Reset retry count for manual refresh
    await fetchData();
  }, [fetchData]);
  
  useEffect(() => {
    if (immediate) {
      fetchData();
    }
    
    // Setup auto-refresh interval
    if (refreshInterval && refreshInterval > 0) {
      intervalRef.current = setInterval(fetchData, refreshInterval);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [fetchData, immediate, refreshInterval]);
  
  return { data, loading, error, refresh };
};

/**
 * Hook for fetching a single user by ID
 */
export const useUser = (
  userId: string | null,
  isAdmin: boolean = false,
  hookOptions: UseUserDataOptions = {}
): UseUserDataState<User> => {
  const [data, setData] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);
  
  const {
    immediate = true,
    refreshInterval,
    retryCount = 3,
    retryDelay = 1000
  } = hookOptions;
  
  const fetchData = useCallback(async () => {
    if (!userId) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await userDataFetcher.fetchUserById(userId, isAdmin);
      setData(response.data);
      retryCountRef.current = 0;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch user';
      setError(errorMessage);
      
      if (retryCountRef.current < retryCount) {
        retryCountRef.current++;
        retryTimeoutRef.current = setTimeout(() => {
          fetchData();
        }, retryDelay * retryCountRef.current);
      }
    } finally {
      setLoading(false);
    }
  }, [userId, isAdmin, retryCount, retryDelay]);
  
  const refresh = useCallback(async () => {
    retryCountRef.current = 0;
    await fetchData();
  }, [fetchData]);
  
  useEffect(() => {
    if (immediate) {
      fetchData();
    }
    
    if (refreshInterval && refreshInterval > 0) {
      intervalRef.current = setInterval(fetchData, refreshInterval);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [fetchData, immediate, refreshInterval]);
  
  return { data, loading, error, refresh };
};

/**
 * Hook for fetching users by role
 */
export const useUsersByRole = (
  role: string,
  options: Pick<UserFetchOptions, 'page' | 'limit'> = {},
  hookOptions: UseUserDataOptions = {}
): UseUserDataState<PaginatedResponse<User>> => {
  const [data, setData] = useState<PaginatedResponse<User> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);
  
  const {
    immediate = true,
    refreshInterval,
    retryCount = 3,
    retryDelay = 1000
  } = hookOptions;
  
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await userDataFetcher.fetchUsersByRole(role, options);
      setData(response.data);
      retryCountRef.current = 0;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch users by role';
      setError(errorMessage);
      
      if (retryCountRef.current < retryCount) {
        retryCountRef.current++;
        retryTimeoutRef.current = setTimeout(() => {
          fetchData();
        }, retryDelay * retryCountRef.current);
      }
    } finally {
      setLoading(false);
    }
  }, [role, options, retryCount, retryDelay]);
  
  const refresh = useCallback(async () => {
    retryCountRef.current = 0;
    await fetchData();
  }, [fetchData]);
  
  useEffect(() => {
    if (immediate) {
      fetchData();
    }
    
    if (refreshInterval && refreshInterval > 0) {
      intervalRef.current = setInterval(fetchData, refreshInterval);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [fetchData, immediate, refreshInterval]);
  
  return { data, loading, error, refresh };
};

/**
 * Hook for searching users
 */
export const useUserSearch = (
  searchTerm: string,
  options: UserFetchOptions = {},
  hookOptions: UseUserDataOptions = {}
): UseUserDataState<PaginatedResponse<User>> => {
  const [data, setData] = useState<PaginatedResponse<User> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);
  
  const {
    immediate = true,
    refreshInterval,
    retryCount = 3,
    retryDelay = 1000
  } = hookOptions;
  
  const fetchData = useCallback(async () => {
    if (!searchTerm.trim()) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await userDataFetcher.searchUsers(searchTerm, options);
      setData(response.data);
      retryCountRef.current = 0;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search users';
      setError(errorMessage);
      
      if (retryCountRef.current < retryCount) {
        retryCountRef.current++;
        retryTimeoutRef.current = setTimeout(() => {
          fetchData();
        }, retryDelay * retryCountRef.current);
      }
    } finally {
      setLoading(false);
    }
  }, [searchTerm, options, retryCount, retryDelay]);
  
  const refresh = useCallback(async () => {
    retryCountRef.current = 0;
    await fetchData();
  }, [fetchData]);
  
  useEffect(() => {
    if (immediate && searchTerm.trim()) {
      fetchData();
    }
    
    if (refreshInterval && refreshInterval > 0 && searchTerm.trim()) {
      intervalRef.current = setInterval(fetchData, refreshInterval);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [fetchData, immediate, refreshInterval, searchTerm]);
  
  return { data, loading, error, refresh };
};

/**
 * Hook for fetching current user profile
 */
export const useCurrentUser = (
  hookOptions: UseUserDataOptions = {}
): UseUserDataState<User> => {
  const [data, setData] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);
  
  const {
    immediate = true,
    refreshInterval,
    retryCount = 3,
    retryDelay = 1000
  } = hookOptions;
  
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await userDataFetcher.fetchCurrentUserProfile();
      setData(response.data);
      retryCountRef.current = 0;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch current user';
      setError(errorMessage);
      
      if (retryCountRef.current < retryCount) {
        retryCountRef.current++;
        retryTimeoutRef.current = setTimeout(() => {
          fetchData();
        }, retryDelay * retryCountRef.current);
      }
    } finally {
      setLoading(false);
    }
  }, [retryCount, retryDelay]);
  
  const refresh = useCallback(async () => {
    retryCountRef.current = 0;
    await fetchData();
  }, [fetchData]);
  
  useEffect(() => {
    if (immediate) {
      fetchData();
    }
    
    if (refreshInterval && refreshInterval > 0) {
      intervalRef.current = setInterval(fetchData, refreshInterval);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [fetchData, immediate, refreshInterval]);
  
  return { data, loading, error, refresh };
};

/**
 * Hook for batch fetching multiple users by IDs
 */
export const useUsersByIds = (
  userIds: string[],
  isAdmin: boolean = false,
  hookOptions: UseUserDataOptions = {}
): UseUserDataState<User[]> => {
  const [data, setData] = useState<User[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);
  
  const {
    immediate = true,
    refreshInterval,
    retryCount = 3,
    retryDelay = 1000
  } = hookOptions;
  
  const fetchData = useCallback(async () => {
    if (!userIds.length) {
      setData([]);
      setLoading(false);
      setError(null);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const users = await userDataFetcher.fetchUsersByIds(userIds, isAdmin);
      setData(users);
      retryCountRef.current = 0;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch users';
      setError(errorMessage);
      
      if (retryCountRef.current < retryCount) {
        retryCountRef.current++;
        retryTimeoutRef.current = setTimeout(() => {
          fetchData();
        }, retryDelay * retryCountRef.current);
      }
    } finally {
      setLoading(false);
    }
  }, [userIds, isAdmin, retryCount, retryDelay]);
  
  const refresh = useCallback(async () => {
    retryCountRef.current = 0;
    await fetchData();
  }, [fetchData]);
  
  useEffect(() => {
    if (immediate) {
      fetchData();
    }
    
    if (refreshInterval && refreshInterval > 0) {
      intervalRef.current = setInterval(fetchData, refreshInterval);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [fetchData, immediate, refreshInterval]);
  
  return { data, loading, error, refresh };
};
