'use client';

import { useState, useEffect } from 'react';
import { User } from '@/lib/types/api.types';

const FREE_TRIAL_DAYS = 3;

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

function calculateTrialStatus(trialStartAt: string | null, trialEndAt: string | null) {
  if (!trialStartAt) {
    return { isTrialExpired: false, daysRemaining: null, hoursRemaining: null };
  }

  const now = Date.now();
  const endTime = trialEndAt
    ? new Date(trialEndAt).getTime()
    : new Date(trialStartAt).getTime() + FREE_TRIAL_DAYS * 24 * 60 * 60 * 1000;

  const msRemaining = endTime - now;

  if (msRemaining <= 0) {
    return { isTrialExpired: true, daysRemaining: 0, hoursRemaining: 0 };
  }

  return {
    isTrialExpired: false,
    daysRemaining: Math.floor(msRemaining / (1000 * 60 * 60 * 24)),
    hoursRemaining: Math.floor((msRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
  };
}

function computeStatus(user: User | null, isAuthenticated: boolean): LicenseStatus {
  if (!isAuthenticated || !user) {
    return {
      isChecking: false,
      isTrialExpired: false,
      isTrial: false,
      hasValidLicense: false,
      trialStartAt: null,
      trialEndAt: null,
      daysRemaining: null,
      hoursRemaining: null,
      errorMessage: null,
    };
  }

  const trialStartAt = user.trialStartAt ?? null;
  const trialEndAt = user.trialEndAt ?? null;

  // No trial — paid or regular user
  if (!trialStartAt) {
    return {
      isChecking: false,
      isTrialExpired: false,
      isTrial: false,
      hasValidLicense: true,
      trialStartAt: null,
      trialEndAt: null,
      daysRemaining: null,
      hoursRemaining: null,
      errorMessage: null,
    };
  }

  const { isTrialExpired, daysRemaining, hoursRemaining } = calculateTrialStatus(
    trialStartAt,
    trialEndAt
  );

  return {
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
}

export function useLicenseProtection(user: User | null, isAuthenticated: boolean): LicenseStatus {
  const [status, setStatus] = useState<LicenseStatus>(() =>
    computeStatus(user, isAuthenticated)
  );

  // Recompute when user/auth state changes (e.g. after login, token refresh)
  useEffect(() => {
    setStatus(computeStatus(user, isAuthenticated));
  }, [isAuthenticated, user?.id, user?.trialStartAt, user?.trialEndAt]);

  // Minute-level local tick to keep the countdown display current — no API calls
  useEffect(() => {
    if (!status.isTrial || status.isTrialExpired) return;

    const tick = setInterval(() => {
      setStatus(prev => {
        const { isTrialExpired, daysRemaining, hoursRemaining } = calculateTrialStatus(
          prev.trialStartAt,
          prev.trialEndAt
        );
        if (isTrialExpired) {
          return {
            ...prev,
            isTrialExpired: true,
            hasValidLicense: false,
            daysRemaining: 0,
            hoursRemaining: 0,
            errorMessage: 'Your free trial has expired.',
          };
        }
        return { ...prev, daysRemaining, hoursRemaining };
      });
    }, 60 * 1000);

    return () => clearInterval(tick);
  }, [status.isTrial, status.isTrialExpired, status.trialStartAt, status.trialEndAt]);

  return status;
}
