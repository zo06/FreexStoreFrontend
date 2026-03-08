'use client';

import React, { createContext, useContext } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useLicenseProtection, LicenseStatus } from '@/hooks/use-license-protection';
import { TrialExpiredModal } from '@/components/ui/trial-expired-modal';

const LicenseContext = createContext<LicenseStatus | undefined>(undefined);

/**
 * Wraps the application and enforces free-trial protection.
 *
 * - Calls https://api.freexstores.com/api/licenses/check on mount and every
 *   30 minutes to validate the user's license server-side.
 * - Falls back to local calculation (trialStartAt + 3 days) if the API is
 *   unreachable.
 * - Renders a full-screen, non-dismissible modal when the trial has expired,
 *   blocking all interaction with the underlying UI.
 */
export function LicenseProtectionProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const licenseStatus = useLicenseProtection(user, isAuthenticated);

  // Don't block while auth is still initialising
  if (isLoading) {
    return <>{children}</>;
  }

  // Only block authenticated users whose trial has expired
  if (isAuthenticated && !licenseStatus.isChecking && licenseStatus.isTrialExpired) {
    return (
      <>
        {/* Keep children mounted in the DOM but visually hidden so the app
            doesn't unmount expensive trees, but users cannot interact. */}
        <div aria-hidden="true" style={{ visibility: 'hidden', pointerEvents: 'none' }}>
          {children}
        </div>

        <TrialExpiredModal
          trialStartAt={licenseStatus.trialStartAt}
          trialEndAt={licenseStatus.trialEndAt}
          onLogout={logout}
        />
      </>
    );
  }

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
