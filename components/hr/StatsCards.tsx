'use client';

import { SessionStats } from '../../lib/api/hr-api';
import { useLanguage } from '../../lib/contexts/LanguageContext';

function formatHours(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

const statusColorBase = {
  GOOD: { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400' },
  WARNING: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400' },
  BAD: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400' },
};

export function StatsCards({ stats }: { stats: SessionStats }) {
  const { t } = useLanguage();
  const { today, week } = stats;
  const statusLabels = { GOOD: t('hr.stats.good'), WARNING: t('hr.stats.warning'), BAD: t('hr.stats.needsAttention') };
  const sc = { ...statusColorBase[today.status], label: statusLabels[today.status] };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Today Status */}
      <div className={`rounded-xl p-4 border ${sc.bg} ${sc.border}`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-400 text-sm">{t('hr.stats.todayStatus')}</span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${sc.bg} ${sc.text} border ${sc.border}`}>
            {sc.label}
          </span>
        </div>
        <div className={`text-2xl font-bold ${sc.text}`}>{formatHours(today.workedSeconds)}</div>
        <div className="text-gray-500 text-xs mt-1">{today.sessionsCount} session{today.sessionsCount !== 1 ? 's' : ''}</div>
      </div>

      {/* Today Breakdown */}
      <div className="rounded-xl p-4 border border-gray-700/50 bg-gray-800/40">
        <div className="text-gray-400 text-sm mb-3">{t('hr.stats.todayBreakdown')}</div>
        <div className="space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">{t('hr.stats.active')}</span>
            <span className="text-white font-medium">{formatHours(today.workedSeconds)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">{t('hr.stats.break')}</span>
            <span className="text-yellow-400 font-medium">{formatHours(today.breakSeconds)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">{t('hr.stats.delay')}</span>
            <span className="text-red-400 font-medium">{formatHours(today.delaySeconds)}</span>
          </div>
        </div>
      </div>

      {/* Week Hours */}
      <div className="rounded-xl p-4 border border-gray-700/50 bg-gray-800/40">
        <div className="text-gray-400 text-sm mb-2">{t('hr.stats.thisWeek')}</div>
        <div className="text-2xl font-bold text-white">{formatHours(week.totalSeconds)}</div>
        <div className="text-gray-500 text-xs mt-1">
          {week.adjustedSeconds !== 0 && (
            <span className={week.adjustedSeconds > 0 ? 'text-green-400' : 'text-red-400'}>
              {week.adjustedSeconds > 0 ? '+' : ''}{formatHours(Math.abs(week.adjustedSeconds))} {t('hr.stats.adjusted')} ·{' '}
            </span>
          )}
          {formatHours(week.workedSeconds)} {t('hr.stats.system')}
        </div>
      </div>

      {/* Week Performance */}
      <div className="rounded-xl p-4 border border-gray-700/50 bg-gray-800/40">
        <div className="text-gray-400 text-sm mb-3">{t('hr.stats.weekPerformance')}</div>
        <div className="space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">{t('hr.stats.avgDay')}</span>
            <span className="text-white font-medium">{formatHours(week.avgDailySeconds)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">{t('hr.stats.sessions')}</span>
            <span className="text-white font-medium">{week.completedSessions}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">{t('hr.stats.activeDays')}</span>
            <span className="text-white font-medium">{week.uniqueDays}/7</span>
          </div>
        </div>
      </div>
    </div>
  );
}
