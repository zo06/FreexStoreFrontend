'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { apiClient } from '@/lib/api';
import { User } from '@/lib/types/api.types';

const FREE_TRIAL_DAYS = 3;
// Re-check license every 30 minutes
const LICENSE_CHECK_INTERVAL = 30 * 60 * 1000;
// Cache key to avoid hitting the API on every mount
const LICENSE_STATUS_CACHE_KEY = 'license_status_cache';
const LICENSE_STATUS_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export interface LicenseStatus {
  isChecking: boolean;
  isTrialExpired: boolean;
  isTrial: boolean;
  hasValidLicense: boolean;
  trialStartAt: string | null;
  trialEndAt: string | null;
  daysRemaining: number | null;
  hoursRemaining: number | null;
  errorMessage: string | null;
}

interface CachedStatus {
  data: LicenseStatus;
  timestamp: number;
}

function calculateTrialStatus(trialStartAt: string | null, trialEndAt: string | null): {
  isTrialExpired: boolean;
  daysRemaining: number | null;
  hoursRemaining: number | null;
} {
  if (!trialStartAt) {
    return { isTrialExpired: false, daysRemaining: null, hoursRemaining: null };
  }

  const now = Date.now();

  // If trialEndAt is provided by the server, use it
  if (trialEndAt) {
    const endTime = new Date(trialEndAt).getTime();
    const msRemaining = endTime - now;

    if (msRemaining <= 0) {
      return { isTrialExpired: true, daysRemaining: 0, hoursRemaining: 0 };
    }

    const daysRemaining = Math.floor(msRemaining / (1000 * 60 * 60 * 24));
    const hoursRemaining = Math.floor((msRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return { isTrialExpired: false, daysRemaining, hoursRemaining };
  }

  // Fall back to calculating from trialStartAt + FREE_TRIAL_DAYS
  const startTime = new Date(trialStartAt).getTime();
  const expiryTime = startTime + FREE_TRIAL_DAYS * 24 * 60 * 60 * 1000;
  const msRemaining = expiryTime - now;

  if (msRemaining <= 0) {
    return { isTrialExpired: true, daysRemaining: 0, hoursRemaining: 0 };
  }

  const daysRemaining = Math.floor(msRemaining / (1000 * 60 * 60 * 24));
  const hoursRemaining = Math.floor((msRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  return { isTrialExpired: false, daysRemaining, hoursRemaining };
}

function readCache(): LicenseStatus | null {
  if (typeof window === 'undefined') return null;
  try {
    const cached = localStorage.getItem(LICENSE_STATUS_CACHE_KEY);
    if (!cached) return null;
    const parsed: CachedStatus = JSON.parse(cached);
    if (Date.now() - parsed.timestamp > LICENSE_STATUS_CACHE_TTL) {
      localStorage.removeItem(LICENSE_STATUS_CACHE_KEY);
      return null;
    }
    return parsed.data;
  } catch {
    return null;
  }
}

function writeCache(status: LicenseStatus) {
  if (typeof window === 'undefined') return;
  try {
    const cached: CachedStatus = { data: status, timestamp: Date.now() };
    localStorage.setItem(LICENSE_STATUS_CACHE_KEY, JSON.stringify(cached));
  } catch {
    // ignore storage errors
  }
}

function clearCache() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(LICENSE_STATUS_CACHE_KEY);
  } catch {
    // ignore
  }
}

export function useLicenseProtection(user: User | null, isAuthenticated: boolean): LicenseStatus {
  const [status, setStatus] = useState<LicenseStatus>({
    isChecking: true,
    isTrialExpired: false,
    isTrial: false,
    hasValidLicense: false,
    trialStartAt: null,
    trialEndAt: null,
    daysRemaining: null,
    hoursRemaining: null,
    errorMessage: null,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  const checkLicense = useCallback(async (force = false) => {
    if (!isAuthenticated || !user) {
      setStatus(prev => ({ ...prev, isChecking: false, isTrialExpired: false }));
      return;
    }

    // Use cached result unless forced
    if (!force) {
      const cached = readCache();
      if (cached) {
        setStatus({ ...cached, isChecking: false });
        return;
      }
    }

    if (!force) {
      setStatus(prev => ({ ...prev, isChecking: true }));
    }

    try {
      // Call the server-side license check endpoint
      const result = await apiClient.checkLicense();

      if (!isMountedRef.current) return;

      const trialStartAt = result.trialStartAt ?? user.trialStartAt ?? null;
      const trialEndAt = result.trialEndAt ?? user.trialEndAt ?? null;

      // Server says trial is expired
      if (result.trialExpired) {
        const newStatus: LicenseStatus = {
          isChecking: false,
          isTrialExpired: true,
          isTrial: true,
          hasValidLicense: false,
          trialStartAt,
          trialEndAt,
          daysRemaining: 0,
          hoursRemaining: 0,
          errorMessage: result.message || 'Your free trial has expired.',
        };
        setStatus(newStatus);
        writeCache(newStatus);
        return;
      }

      // If the server says invalid and it's a trial, treat as expired
      if (!result.valid && result.isTrial) {
        const newStatus: LicenseStatus = {
          isChecking: false,
          isTrialExpired: true,
          isTrial: true,
          hasValidLicense: false,
          trialStartAt,
          trialEndAt,
          daysRemaining: 0,
          hoursRemaining: 0,
          errorMessage: result.message || 'Your free trial has expired.',
        };
        setStatus(newStatus);
        writeCache(newStatus);
        return;
      }

      // Calculate trial timing locally as well
      const { isTrialExpired, daysRemaining, hoursRemaining } = calculateTrialStatus(
        trialStartAt,
        trialEndAt
      );

      // If server says valid but local calculation shows expired, trust the stricter check
      const finalExpired = result.trialExpired || (result.isTrial && isTrialExpired);

      const newStatus: LicenseStatus = {
        isChecking: false,
        isTrialExpired: finalExpired,
        isTrial: result.isTrial,
        hasValidLicense: result.valid && !finalExpired,
        trialStartAt,
        trialEndAt,
        daysRemaining: result.daysRemaining ?? daysRemaining,
        hoursRemaining: result.hoursRemaining ?? hoursRemaining,
        errorMessage: finalExpired ? (result.message || 'Your free trial has expired.') : null,
      };

      setStatus(newStatus);
      writeCache(newStatus);
    } catch (error) {
      if (!isMountedRef.current) return;

      // If API call fails, fall back to local calculation using user data
      const trialStartAt = user.trialStartAt ?? null;
      const trialEndAt = user.trialEndAt ?? null;

      if (trialStartAt) {
        const { isTrialExpired, daysRemaining, hoursRemaining } = calculateTrialStatus(
          trialStartAt,
          trialEndAt
        );

        const newStatus: LicenseStatus = {
          isChecking: false,
          isTrialExpired,
          isTrial: true,
          hasValidLicense: !isTrialExpired,
          trialStartAt,
          trialEndAt,
          daysRemaining,
          hoursRemaining,
          errorMessage: isTrialExpired ? 'Your free trial has expired.' : null,
        };
        setStatus(newStatus);
        if (!isTrialExpired) {
          writeCache(newStatus);
        }
      } else {
        setStatus(prev => ({
          ...prev,
          isChecking: false,
          errorMessage: null,
        }));
      }
    }
  }, [isAuthenticated, user]);

  // Initial check when user/auth changes
  useEffect(() => {
    isMountedRef.current = true;

    if (!isAuthenticated || !user) {
      clearCache();
      setStatus({
        isChecking: false,
        isTrialExpired: false,
        isTrial: false,
        hasValidLicense: false,
        trialStartAt: null,
        trialEndAt: null,
        daysRemaining: null,
        hoursRemaining: null,
        errorMessage: null,
      });
      return;
    }

    checkLicense(false);

    return () => {
      isMountedRef.current = false;
    };
  }, [isAuthenticated, user?.id]);

  // Periodic re-check
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    intervalRef.current = setInterval(() => {
      clearCache();
      checkLicense(true);
    }, LICENSE_CHECK_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isAuthenticated, user?.id, checkLicense]);

  // Minute-level local timer to update remaining time display without API calls
  useEffect(() => {
    if (!status.isTrial || status.isTrialExpired) return;

    const tickInterval = setInterval(() => {
      const { isTrialExpired, daysRemaining, hoursRemaining } = calculateTrialStatus(
        status.trialStartAt,
        status.trialEndAt
      );
      if (isTrialExpired) {
        clearCache();
        setStatus(prev => ({
          ...prev,
          isTrialExpired: true,
          hasValidLicense: false,
          daysRemaining: 0,
          hoursRemaining: 0,
          errorMessage: 'Your free trial has expired.',
        }));
      } else {
        setStatus(prev => ({ ...prev, daysRemaining, hoursRemaining }));
      }
    }, 60 * 1000); // every minute

    return () => clearInterval(tickInterval);
  }, [status.isTrial, status.isTrialExpired, status.trialStartAt, status.trialEndAt]);

  return status;
}
