'use client';

import { useWorkSession } from '../../hooks/use-work-session';
import { useLanguage } from '../../lib/contexts/LanguageContext';

export function SessionTimer() {
  const { elapsedSeconds, formatTime, phase, session } = useWorkSession();
  const { t } = useLanguage();

  const pct = Math.min(100, (elapsedSeconds / 3600) * 100);

  // Last active time display
  const lastActiveLabel = (() => {
    if (!session?.lastActiveAt) return null;
    const diffSecs = Math.floor((Date.now() - new Date(session.lastActiveAt).getTime()) / 1000);
    if (diffSecs < 10) return 'Just now';
    if (diffSecs < 60) return `${diffSecs}s ago`;
    return `${Math.floor(diffSecs / 60)}m ago`;
  })();

  const ringColor =
    phase === 'on_break'
      ? '#f59e0b'
      : elapsedSeconds >= 3600
      ? '#22c55e'
      : '#6366f1';

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Ring progress */}
      <div className="relative w-44 h-44">
        {/* Glow */}
        <div
          className="absolute inset-0 rounded-full blur-xl opacity-20 transition-colors duration-1000"
          style={{ backgroundColor: ringColor }}
        />

        <svg className="w-full h-full -rotate-90 relative" viewBox="0 0 120 120">
          {/* Track */}
          <circle cx="60" cy="60" r="54" fill="none" stroke="#1f2937" strokeWidth="8" />
          {/* Progress */}
          <circle
            cx="60" cy="60" r="54"
            fill="none"
            stroke={ringColor}
            strokeWidth="8"
            strokeDasharray={`${2 * Math.PI * 54}`}
            strokeDashoffset={`${2 * Math.PI * 54 * (1 - pct / 100)}`}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-mono font-bold text-white tracking-tight">
            {formatTime(elapsedSeconds)}
          </span>
          <span className="text-xs font-semibold uppercase tracking-widest mt-1"
            style={{ color: ringColor }}>
            {phase === 'on_break' ? t('hr.timer.onBreak') : phase === 'active' ? t('hr.timer.working') : t('hr.timer.idle')}
          </span>
        </div>
      </div>

      {/* Stats row */}
      {session && (
        <div className="flex gap-5 text-sm">
          <div className="text-center">
            <div className="text-yellow-400 font-semibold tabular-nums">{formatTime(session.breakSeconds)}</div>
            <div className="text-gray-500 text-xs mt-0.5">{t('hr.timer.break')}</div>
          </div>
          <div className="w-px bg-gray-700/50" />
          <div className="text-center">
            <div className="text-red-400 font-semibold tabular-nums">{formatTime(session.delaySeconds)}</div>
            <div className="text-gray-500 text-xs mt-0.5">{t('hr.timer.delay')}</div>
          </div>
          <div className="w-px bg-gray-700/50" />
          <div className="text-center">
            <div className="text-indigo-400 font-semibold tabular-nums">{formatTime(elapsedSeconds)}</div>
            <div className="text-gray-500 text-xs mt-0.5">{t('hr.timer.active')}</div>
          </div>
        </div>
      )}

      {/* Last active indicator */}
      {session && lastActiveLabel && phase === 'active' && (
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
          {t('hr.timer.serverSync')} {lastActiveLabel}
        </div>
      )}
    </div>
  );
}
