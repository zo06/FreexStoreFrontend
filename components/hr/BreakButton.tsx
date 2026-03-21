'use client';

import { useState } from 'react';
import { useWorkSession } from '../../hooks/use-work-session';
import { useLanguage } from '../../lib/contexts/LanguageContext';

export function BreakButton() {
  const { phase, hasUsedBreak, takeBreak, endBreak, breakRemainingSeconds, formatTime, isLoading } = useWorkSession();
  const { t } = useLanguage();
  const [showOptions, setShowOptions] = useState(false);

  if (phase === 'on_break') {
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="text-yellow-400 text-sm font-medium animate-pulse">
          {t('hr.break.breakEndsIn')} {formatTime(breakRemainingSeconds)}
        </div>
        <button
          onClick={endBreak}
          disabled={isLoading}
          className="px-6 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold rounded-lg disabled:opacity-50 transition"
        >
          {t('hr.break.endBreakEarly')}
        </button>
      </div>
    );
  }

  if (hasUsedBreak) {
    return (
      <div className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-500 text-sm text-center">
        {t('hr.break.breakUsed')}
      </div>
    );
  }

  if (phase !== 'active') return null;

  return (
    <div className="relative">
      {showOptions ? (
        <div className="flex gap-3">
          <button
            onClick={() => { takeBreak(5); setShowOptions(false); }}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg disabled:opacity-50 transition"
          >
            {t('hr.break.fiveMin')}
          </button>
          <button
            onClick={() => { takeBreak(10); setShowOptions(false); }}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg disabled:opacity-50 transition"
          >
            {t('hr.break.tenMin')}
          </button>
          <button
            onClick={() => setShowOptions(false)}
            className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-400 text-sm rounded-lg transition"
          >
            {t('hr.break.cancel')}
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowOptions(true)}
          className="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition"
        >
          {t('hr.break.takeBreak')}
        </button>
      )}
    </div>
  );
}
