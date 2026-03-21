'use client';

import { useEffect, useState } from 'react';
import { hrApi } from '../../../../lib/api/hr-api';
import { AdjustmentModal } from '../../../../components/hr/AdjustmentModal';
import { useAuth } from '../../../../lib/auth-context';
import { useRouter, useParams } from 'next/navigation';
import { useLanguage } from '../../../../lib/contexts/LanguageContext';
import { RefreshCw, Users, Activity, FileText, ChevronRight, Plus, Zap } from 'lucide-react';

function formatDuration(secs: number) {
  const abs = Math.abs(secs);
  const h = Math.floor(abs / 3600);
  const m = Math.floor((abs % 3600) / 60);
  if (secs < 0) return `-${h}h ${m}m`;
  return `${h}h ${m}m`;
}

function formatDateTime(d: string) {
  return new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const statusStyle: Record<string, string> = {
  ENDED:    'bg-green-500/10 border-green-500/30 text-green-400',
  ACTIVE:   'bg-sky-500/10 border-sky-500/30 text-sky-400',
  ON_BREAK: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
  ABANDONED:'bg-gray-700/50 border-gray-600 text-gray-400',
};

export default function HrAdminPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const lang = params?.lang || 'en';

  const { t } = useLanguage();
  const [profiles, setProfiles]             = useState<any[]>([]);
  const [activeSessions, setActiveSessions] = useState<any[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<any | null>(null);
  const [profileDetail, setProfileDetail]   = useState<any | null>(null);
  const [adjustmentTarget, setAdjustmentTarget] = useState<any | null>(null);
  const [tab, setTab]                       = useState<'team' | 'active' | 'report'>('team');
  const [loading, setLoading]               = useState(true);
  const [reportDate, setReportDate]         = useState(new Date().toISOString().split('T')[0]);
  const [dailyReport, setDailyReport]       = useState<any[]>([]);
  const [reportLoading, setReportLoading]   = useState(false);
  const [dateFrom, setDateFrom]             = useState('');
  const [dateTo, setDateTo]                 = useState('');
  const [refreshing, setRefreshing]         = useState(false);
  // mobile: show detail panel instead of list
  const [showDetail, setShowDetail]         = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.replace(`/${lang}/auth/login`);
  }, [isAuthenticated, authLoading]);

  useEffect(() => {
    if (isAuthenticated) loadData();
  }, [isAuthenticated]);

  useEffect(() => {
    if (selectedProfile) loadProfileDetail(selectedProfile.id);
  }, [selectedProfile, dateFrom, dateTo]);

  async function loadData() {
    setLoading(true);
    try {
      const [profilesRes, activeRes] = await Promise.all([
        hrApi.admin.getAllProfiles(),
        hrApi.admin.getActiveSessions(),
      ]);
      setProfiles(profilesRes.profiles || []);
      setActiveSessions(Array.isArray(activeRes) ? activeRes : []);
    } catch {}
    finally { setLoading(false); }
  }

  async function handleRefresh() {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }

  async function loadProfileDetail(id: string) {
    try {
      const res = await hrApi.admin.getProfileDetail(id, dateFrom || undefined, dateTo || undefined);
      setProfileDetail(res);
    } catch {}
  }

  async function loadDailyReport() {
    setReportLoading(true);
    try {
      const res = await hrApi.admin.getDailyReport(reportDate);
      setDailyReport(Array.isArray(res) ? res : []);
    } catch {}
    finally { setReportLoading(false); }
  }

  async function handleForceEnd(sessionId: string) {
    if (!confirm(t('hr.admin.forceEndConfirm'))) return;
    await hrApi.admin.forceEndSession(sessionId);
    loadData();
    if (selectedProfile) loadProfileDetail(selectedProfile.id);
  }

  function selectProfile(p: any) {
    setSelectedProfile(p);
    setShowDetail(true);
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const tabs = [
    { key: 'team',   label: t('hr.admin.teamOverview'),   icon: Users,      count: profiles.length },
    { key: 'active', label: t('hr.admin.activeSessions'), icon: Activity,   count: activeSessions.length },
    { key: 'report', label: t('hr.admin.dailyReport'),    icon: FileText,   count: null },
  ] as const;

  return (
    // Force LTR so the layout doesn't flip on /ar/ pages
    <div className="space-y-5" dir="ltr">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">{t('hr.admin.title')}</h1>
          <p className="text-gray-400 text-sm mt-0.5">{t('hr.admin.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {activeSessions.length > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 border border-green-500/30 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-green-400 text-xs font-medium">{activeSessions.length} {t('hr.admin.activeNow')}</span>
            </div>
          )}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.04] border border-white/10 rounded-xl text-gray-400 hover:text-white hover:bg-white/[0.07] transition text-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{t('hr.admin.refresh')}</span>
          </button>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 p-1 bg-white/[0.03] border border-white/[0.07] rounded-xl overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition whitespace-nowrap flex-1 justify-center ${
              tab === t.key
                ? 'bg-sky-600 text-white shadow-lg shadow-sky-500/20'
                : 'text-gray-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
            {t.count !== null && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === t.key ? 'bg-white/20' : 'bg-white/[0.07]'}`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════
          Tab: Team Overview
      ══════════════════════════════════════════════ */}
      {tab === 'team' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* ── Profiles list (hidden on mobile when detail is open) ── */}
          <div className={`lg:col-span-1 space-y-2 ${showDetail ? 'hidden lg:block' : 'block'}`}>
            <p className="text-xs text-gray-500 uppercase tracking-wider px-1 mb-3">
              {profiles.length} {profiles.length !== 1 ? t('hr.admin.developers') : t('hr.admin.developer')}
            </p>
            {profiles.length === 0 && (
              <div className="text-gray-500 text-sm text-center py-12 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
                {t('hr.admin.noProfiles')}
              </div>
            )}
            {profiles.map(p => (
              <button
                key={p.id}
                onClick={() => selectProfile(p)}
                className={`w-full text-left p-4 rounded-xl border transition group ${
                  selectedProfile?.id === p.id
                    ? 'bg-sky-500/10 border-sky-500/30 shadow-lg shadow-sky-500/5'
                    : 'bg-white/[0.02] border-white/[0.07] hover:border-white/20 hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium text-sm truncate">{p.user?.username}</span>
                      {p.activeSession && (
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
                      )}
                    </div>
                    <div className="text-gray-500 text-xs mt-0.5 truncate">{p.user?.email}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                      p.hrRole === 'SUPER_HR' ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' :
                      p.hrRole === 'ADMIN'    ? 'bg-sky-500/10 border-sky-500/30 text-sky-400' :
                                               'bg-gray-700/50 border-gray-600 text-gray-400'
                    }`}>
                      {p.hrRole}
                    </span>
                  </div>
                </div>
                {p.weekStats && (
                  <div className="mt-2.5 flex items-center justify-between text-xs text-gray-500 border-t border-white/[0.05] pt-2.5">
                    <span>{p.weekStats.completedSessions} {t('hr.admin.sessions')}</span>
                    <span className="text-sky-400 font-medium">{t('hr.admin.week')} {formatDuration(p.weekStats.totalSeconds)}</span>
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* ── Profile detail ── */}
          <div className={`lg:col-span-2 ${showDetail || !selectedProfile ? 'block' : 'hidden lg:block'}`}>

            {/* Mobile back button */}
            {showDetail && selectedProfile && (
              <button
                onClick={() => setShowDetail(false)}
                className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white mb-3 lg:hidden transition"
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
                {t('hr.admin.backToList')}
              </button>
            )}

            {!selectedProfile ? (
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl flex flex-col items-center justify-center h-64 gap-3">
                <Users className="w-10 h-10 text-gray-700" />
                <p className="text-gray-500 text-sm">{t('hr.admin.selectDeveloper')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Profile header card */}
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                    <div>
                      <h3 className="text-white font-semibold text-lg leading-none">{selectedProfile.user?.username}</h3>
                      <p className="text-gray-400 text-sm mt-1">{selectedProfile.user?.email}</p>
                    </div>
                    <button
                      onClick={() => setAdjustmentTarget(selectedProfile)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-sm font-medium rounded-xl transition self-start sm:self-auto"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      {t('hr.admin.adjustment')}
                    </button>
                  </div>

                  {/* Date filter */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                      className="flex-1 bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500 transition" />
                    <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                      className="flex-1 bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500 transition" />
                  </div>

                  {/* Summary stats */}
                  {profileDetail?.summary && (
                    <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
                      {[
                        { label: t('hr.admin.systemHours'), value: formatDuration(profileDetail.summary.systemWorkedSeconds), color: 'text-white' },
                        { label: t('hr.admin.adminAdj'), value: `${profileDetail.summary.adjustedSeconds >= 0 ? '+' : ''}${formatDuration(profileDetail.summary.adjustedSeconds)}`, color: profileDetail.summary.adjustedSeconds >= 0 ? 'text-green-400' : 'text-red-400' },
                        { label: t('hr.admin.finalTotal'), value: formatDuration(profileDetail.summary.finalTotalSeconds), color: 'text-sky-400' },
                      ].map(stat => (
                        <div key={stat.label} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 text-center">
                          <div className={`font-semibold text-sm sm:text-base ${stat.color}`}>{stat.value}</div>
                          <div className="text-gray-500 text-xs mt-0.5">{stat.label}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sessions */}
                {profileDetail?.sessions && profileDetail.sessions.length > 0 && (
                  <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
                    <div className="px-5 py-3.5 border-b border-white/[0.06]">
                      <h4 className="text-white font-medium text-sm">{t('hr.admin.sessionsLabel')}</h4>
                    </div>
                    <div className="divide-y divide-white/[0.04]">
                      {profileDetail.sessions.map((s: any) => (
                        <div key={s.id} className="px-4 sm:px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-sm text-white">{formatDateTime(s.startTime)}</div>
                            <div className="flex flex-wrap items-center gap-1.5 mt-1">
                              <span className={`px-2 py-0.5 rounded-full border text-xs ${statusStyle[s.status] || statusStyle.ABANDONED}`}>
                                {s.status}
                              </span>
                              {s.delaySeconds > 0 && (
                                <span className="text-red-400 text-xs">{formatDuration(s.delaySeconds)} {t('hr.admin.delay')}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-3 text-sm flex-shrink-0">
                            <div className="text-center">
                              <div className="text-white font-medium">{formatDuration(s.activeSeconds)}</div>
                              <div className="text-gray-600 text-xs">{t('hr.admin.active')}</div>
                            </div>
                            {(s.adjustments?.length ?? 0) > 0 && (
                              <div className="text-center">
                                <div className="text-yellow-400 text-xs font-medium">+ADJ</div>
                                <div className="text-gray-600 text-xs">Admin</div>
                              </div>
                            )}
                            {(s.status === 'ACTIVE' || s.status === 'ON_BREAK') && (
                              <button
                                onClick={() => handleForceEnd(s.id)}
                                className="text-xs px-3 py-1.5 bg-red-600/15 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-600/25 transition"
                              >
                                {t('hr.admin.forceEnd')}
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Adjustments */}
                {profileDetail?.adjustments && profileDetail.adjustments.length > 0 && (
                  <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
                    <div className="px-5 py-3.5 border-b border-white/[0.06]">
                      <h4 className="text-white font-medium text-sm">{t('hr.admin.adminAdjustments')}</h4>
                    </div>
                    <div className="divide-y divide-white/[0.04]">
                      {profileDetail.adjustments.map((a: any) => (
                        <div key={a.id} className="px-4 sm:px-5 py-3 flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-sm font-semibold ${a.type === 'BONUS' ? 'text-green-400' : 'text-red-400'}`}>
                                {a.type === 'BONUS' ? '+' : '-'}{formatDuration(a.seconds)}
                              </span>
                              <span className="text-gray-500 text-xs">by {a.by?.user?.username}</span>
                            </div>
                            <div className="text-gray-400 text-xs mt-0.5">{a.reason}</div>
                          </div>
                          <div className="text-gray-500 text-xs flex-shrink-0">{formatDateTime(a.createdAt)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          Tab: Active Sessions
      ══════════════════════════════════════════════ */}
      {tab === 'active' && (
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
          {activeSessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Activity className="w-10 h-10 text-gray-700" />
              <p className="text-gray-500 text-sm">{t('hr.admin.noActiveSessions')}</p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {activeSessions.map((s: any) => {
                const elapsedSecs = Math.floor((Date.now() - new Date(s.startTime).getTime()) / 1000);
                return (
                  <div key={s.id} className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
                        <span className="text-white font-medium">{s.hrProfile?.user?.username}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${statusStyle[s.status] || statusStyle.ABANDONED}`}>
                          {s.status}
                        </span>
                      </div>
                      <div className="text-gray-500 text-xs mt-1">Started {formatDateTime(s.startTime)}</div>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="text-center">
                        <div className="text-white font-mono font-semibold text-sm">
                          {formatDuration(Math.max(0, elapsedSecs - s.breakSeconds - s.delaySeconds))}
                        </div>
                        <div className="text-gray-500 text-xs">{t('hr.admin.active')}</div>
                      </div>
                      {s.delaySeconds > 0 && (
                        <div className="text-center">
                          <div className="text-red-400 font-semibold text-sm">{formatDuration(s.delaySeconds)}</div>
                          <div className="text-gray-500 text-xs">{t('hr.admin.delay')}</div>
                        </div>
                      )}
                      <button
                        onClick={() => { selectProfile(s.hrProfile); setTab('team'); }}
                        className="text-xs px-3 py-1.5 bg-white/[0.04] border border-white/10 hover:bg-white/[0.07] text-gray-300 rounded-lg transition"
                      >
                        {t('hr.admin.view')}
                      </button>
                      <button
                        onClick={() => handleForceEnd(s.id)}
                        className="text-xs px-3 py-1.5 bg-red-600/15 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-600/25 transition"
                      >
                        {t('hr.admin.forceEnd')}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════
          Tab: Daily Report
      ══════════════════════════════════════════════ */}
      {tab === 'report' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="date"
              value={reportDate}
              onChange={e => setReportDate(e.target.value)}
              className="bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-sky-500 transition"
            />
            <button
              onClick={loadDailyReport}
              disabled={reportLoading}
              className="flex items-center justify-center gap-1.5 px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-sm font-medium rounded-xl transition disabled:opacity-50"
            >
              <Zap className="w-3.5 h-3.5" />
              {reportLoading ? t('hr.admin.loading') : t('hr.admin.generateReport')}
            </button>
          </div>

          {dailyReport.length === 0 && !reportLoading && (
            <div className="flex flex-col items-center justify-center py-16 gap-3 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
              <FileText className="w-10 h-10 text-gray-700" />
              <p className="text-gray-500 text-sm">{t('hr.admin.pickDate')}</p>
            </div>
          )}

          {dailyReport.length > 0 && (
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[600px]">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      {[t('hr.admin.developerCol'), t('hr.admin.startCol'), t('hr.admin.endCol'), t('hr.admin.statusCol'), t('hr.admin.systemCol'), t('hr.admin.adminCol'), t('hr.admin.finalCol')].map((h, i) => (
                        <th key={h} className={`py-3.5 px-4 text-gray-400 font-medium ${i >= 4 ? 'text-right' : 'text-left'}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {dailyReport.map((row: any, i: number) => (
                      <tr key={i} className="hover:bg-white/[0.02] transition">
                        <td className="px-4 py-3.5">
                          <div className="text-white font-medium">{row.developer?.username}</div>
                          <div className="text-gray-500 text-xs">{row.hrRole}</div>
                        </td>
                        <td className="px-4 py-3.5 text-gray-300 tabular-nums">
                          {new Date(row.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-4 py-3.5 text-gray-300 tabular-nums">
                          {row.endTime ? new Date(row.endTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—'}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${statusStyle[row.status] || statusStyle.ABANDONED}`}>
                            {row.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right text-white tabular-nums">{formatDuration(row.systemActiveSeconds)}</td>
                        <td className="px-4 py-3.5 text-right tabular-nums">
                          {row.adminBonus > 0 && <span className="text-green-400">+{formatDuration(row.adminBonus)}</span>}
                          {row.adminDeduction > 0 && <span className="text-red-400 ml-1">-{formatDuration(row.adminDeduction)}</span>}
                          {row.adminBonus === 0 && row.adminDeduction === 0 && <span className="text-gray-600">—</span>}
                        </td>
                        <td className="px-4 py-3.5 text-right font-semibold text-sky-400 tabular-nums">{formatDuration(row.finalSeconds)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {adjustmentTarget && (
        <AdjustmentModal
          targetId={adjustmentTarget.id}
          targetName={adjustmentTarget.user?.username}
          onClose={() => setAdjustmentTarget(null)}
          onSuccess={() => {
            loadData();
            if (selectedProfile) loadProfileDetail(selectedProfile.id);
          }}
        />
      )}
    </div>
  );
}
