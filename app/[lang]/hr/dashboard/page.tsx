'use client';

import { useEffect, useState } from 'react';
import { useWorkSession } from '../../../../hooks/use-work-session';
import { SessionTimer } from '../../../../components/hr/SessionTimer';
import { BreakButton } from '../../../../components/hr/BreakButton';
import { StatsCards } from '../../../../components/hr/StatsCards';
import { hrApi, WorkSession } from '../../../../lib/api/hr-api';
import { useAuth } from '../../../../lib/auth-context';
import { useRouter, useParams } from 'next/navigation';
import { useLanguage } from '../../../../lib/contexts/LanguageContext';

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
function formatDuration(secs: number) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  return `${h}h ${m}m`;
}

export default function HrDashboard() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const lang = params?.lang || 'en';

  const {
    phase, session, stats, error, isLoading,
    startSession, endSession, setError,
    formatTime, elapsedSeconds, canEndSession, minutesRemaining, hasUsedBreak,
  } = useWorkSession();

  const { t } = useLanguage();
  const [history, setHistory] = useState<WorkSession[]>([]);
  const [endNotes, setEndNotes] = useState('');
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace(`/${lang}/auth/login`);
    }
  }, [isAuthenticated, authLoading]);

  useEffect(() => {
    if (isAuthenticated) loadHistory();
  }, [isAuthenticated, phase]);

  async function loadHistory() {
    setHistoryLoading(true);
    try {
      const res = await hrApi.getHistory(1, 10);
      setHistory(res.sessions.filter(s => s.status === 'ENDED'));
    } catch {}
    finally { setHistoryLoading(false); }
  }

  const handleEndSession = async () => {
    await endSession(endNotes);
    setShowEndConfirm(false);
    setEndNotes('');
    loadHistory();
  };

  if (authLoading) {
    return <div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{t('hr.dashboard.title')}</h1>
          <p className="text-gray-400 text-sm mt-0.5">
            {user?.firstName || user?.username} · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
          phase === 'active' ? 'bg-green-500/10 border-green-500/30 text-green-400' :
          phase === 'on_break' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' :
          'bg-gray-800 border-gray-700 text-gray-400'
        }`}>
          {phase === 'active' ? t('hr.dashboard.working') : phase === 'on_break' ? t('hr.dashboard.onBreak') : t('hr.dashboard.idle')}
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 flex items-center justify-between">
          <span className="text-red-400 text-sm">{error}</span>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300 text-lg leading-none ml-4">&times;</button>
        </div>
      )}

      {/* Main session card */}
      <div className="bg-gray-900 border border-gray-700/50 rounded-2xl p-8">
        {phase === 'idle' || phase === 'ended' ? (
          <div className="flex flex-col items-center gap-6 py-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              {phase === 'ended' ? (
                <>
                  <h2 className="text-xl font-semibold text-white">{t('hr.dashboard.sessionCompleted')}</h2>
                  <p className="text-gray-400 text-sm mt-1">{t('hr.dashboard.sessionCompletedSub')}</p>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-semibold text-white">{t('hr.dashboard.noActiveSession')}</h2>
                  <p className="text-gray-400 text-sm mt-1">{t('hr.dashboard.noActiveSessionSub')}</p>
                </>
              )}
            </div>
            <button
              onClick={startSession}
              disabled={isLoading}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition disabled:opacity-50 text-lg"
            >
              {isLoading ? t('hr.dashboard.starting') : t('hr.dashboard.startSession')}
            </button>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>{t('hr.dashboard.minRequired')}</span>
              <span>·</span>
              <span>{t('hr.dashboard.oneBreakAllowed')}</span>
              <span>·</span>
              <span>{t('hr.dashboard.disconnectTracked')}</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-8">
            <SessionTimer />
            <BreakButton />

            {/* End session */}
            {!showEndConfirm ? (
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={() => canEndSession && setShowEndConfirm(true)}
                  disabled={!canEndSession || isLoading}
                  className={`px-8 py-2.5 font-semibold rounded-xl transition text-sm ${
                    canEndSession
                      ? 'bg-gray-700 hover:bg-gray-600 text-white'
                      : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                  }`}
                >
                  {t('hr.dashboard.endSession')}
                </button>
                {!canEndSession && (
                  <p className="text-gray-500 text-xs">{minutesRemaining} {t('hr.dashboard.minRemaining')}</p>
                )}
              </div>
            ) : (
              <div className="w-full max-w-md bg-gray-800 border border-gray-700 rounded-xl p-5 space-y-4">
                <h3 className="text-white font-medium">{t('hr.dashboard.endSession')}</h3>
                <textarea
                  placeholder={t('hr.dashboard.sessionNotes')}
                  value={endNotes}
                  onChange={e => setEndNotes(e.target.value)}
                  rows={2}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 resize-none"
                />
                <div className="flex gap-3">
                  <button onClick={() => setShowEndConfirm(false)} className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm transition">
                    {t('hr.dashboard.cancel')}
                  </button>
                  <button onClick={handleEndSession} disabled={isLoading} className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg text-sm transition disabled:opacity-50">
                    {isLoading ? t('hr.dashboard.ending') : t('hr.dashboard.confirmEnd')}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stats */}
      {stats && <StatsCards stats={stats} />}

      {/* Recent sessions history */}
      <div className="bg-gray-900 border border-gray-700/50 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-700/50">
          <h2 className="text-white font-semibold">{t('hr.dashboard.recentSessions')}</h2>
        </div>
        {historyLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-sm">{t('hr.dashboard.noSessions')}</div>
        ) : (
          <div className="divide-y divide-gray-800">
            {history.map(s => {
              const bonusSecs = (s.adjustments || []).filter(a => a.type === 'BONUS').reduce((sum, a) => sum + a.seconds, 0);
              const deductSecs = (s.adjustments || []).filter(a => a.type === 'DEDUCTION').reduce((sum, a) => sum + a.seconds, 0);
              const finalSecs = s.activeSeconds + bonusSecs - deductSecs;
              const hasAdminAdj = (s.adjustments?.length ?? 0) > 0;
              return (
                <div key={s.id} className="px-6 py-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-white text-sm font-medium">{formatDate(s.startTime)}</div>
                    <div className="text-gray-500 text-xs mt-0.5">
                      {new Date(s.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} →{' '}
                      {s.endTime ? new Date(s.endTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—'}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-white font-medium">{formatDuration(s.activeSeconds)}</div>
                      <div className="text-gray-500 text-xs">{t('hr.dashboard.system')}</div>
                    </div>
                    {hasAdminAdj && (
                      <div className="text-center">
                        <div className={`font-medium ${bonusSecs > deductSecs ? 'text-green-400' : 'text-red-400'}`}>
                          {bonusSecs > deductSecs ? '+' : ''}{formatDuration(bonusSecs - deductSecs)}
                        </div>
                        <div className="text-gray-500 text-xs">{t('hr.dashboard.admin')}</div>
                      </div>
                    )}
                    <div className="text-center">
                      <div className="text-indigo-400 font-semibold">{formatDuration(finalSecs)}</div>
                      <div className="text-gray-500 text-xs">{t('hr.dashboard.final')}</div>
                    </div>
                    {s.delaySeconds > 0 && (
                      <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded px-2 py-0.5">
                        {formatDuration(s.delaySeconds)} {t('hr.dashboard.delay')}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
