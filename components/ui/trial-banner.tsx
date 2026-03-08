'use client';

import { Clock, X, Key, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useLicenseStatus } from '@/components/license-protection-provider';

/**
 * Shows a dismissible top banner when the user is on an active free trial,
 * telling them how many days/hours remain.
 */
export function TrialBanner() {
  const t = useTranslations('trialProtection.banner');
  const licenseStatus = useLicenseStatus();
  const [dismissed, setDismissed] = useState(false);

  if (!licenseStatus) return null;
  if (!licenseStatus.isTrial) return null;
  if (licenseStatus.isTrialExpired) return null;
  if (licenseStatus.isChecking) return null;
  if (dismissed) return null;

  const { daysRemaining, hoursRemaining } = licenseStatus;

  const timeLabel =
    daysRemaining !== null && daysRemaining > 0
      ? t('daysLeft', { days: daysRemaining })
      : hoursRemaining !== null && hoursRemaining > 0
      ? t('hoursLeft', { hours: hoursRemaining })
      : t('lessThanHour');

  const isUrgent = (daysRemaining ?? 0) === 0;

  return (
    <div
      className={`relative flex items-center justify-between gap-3 px-4 py-2 text-sm z-[999999999999] ${
        isUrgent
          ? 'bg-red-500/10 border-b border-red-500/20 text-red-300'
          : 'bg-amber-500/10 border-b border-amber-500/20 text-amber-300'
      }`}
    >
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 flex-shrink-0" />
        <span>
          <strong>{t('label')}</strong>{' '}
          {isUrgent ? `${t('expiresSoon')} ` : ''}{timeLabel}{' '}
          {isUrgent ? t('upgradeNow') : t('upgradeAnytime')}
        </span>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        <a
          href="/scripts"
          className="flex items-center gap-1 font-semibold underline underline-offset-2 hover:opacity-80 transition-opacity"
        >
          <Key className="h-3 w-3" />
          {t('getLicense')}
          <ArrowRight className="h-3 w-3" />
        </a>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="rounded p-0.5 hover:bg-white/10 transition-colors"
          aria-label={t('dismiss')}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
