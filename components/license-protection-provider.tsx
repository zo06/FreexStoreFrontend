'use client';

import React, { createContext, useContext } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useLicenseProtection, LicenseStatus } from '@/hooks/use-license-protection';

const LicenseContext = createContext<LicenseStatus | undefined>(undefined);

export function LicenseProtectionProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const licenseStatus = useLicenseProtection(user, isAuthenticated);

  return (
    <LicenseContext.Provider value={licenseStatus}>
      {children}
    </LicenseContext.Provider>
  );
}

/**
 * Returns the current license protection status.
 * Must be used inside <LicenseProtectionProvider>.
 */
export function useLicenseStatus(): LicenseStatus | undefined {
  return useContext(LicenseContext);
}
