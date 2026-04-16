"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { withAdminAuth } from '@/lib/auth-context'
import {
  Users, TrendingUp, Activity, Key, UserPlus, Eye, LogIn,
  BarChart3, UserCheck, Shield, ClipboardList, FileCode, CreditCard,
  ArrowRight, TrendingDown, Code2, XCircle, AlertTriangle, Inbox,
  DollarSign, RefreshCw, Sparkles,
} from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Area, AreaChart, PieChart, Pie, Cell,
} from 'recharts'
import toast from 'react-hot-toast'
import { useTranslations } from 'next-intl'

interface RecentTransaction {
  id: string; amount: number; status: string; type: string; createdAt: string;
  user?: { username: string }; script?: { name: string }
}
interface TopScript {
  id: string; name: string; _count: { licenses: number; transactions: number }
}
interface AnalyticsData {
  newUsersData: Array<{ date: string; users: number }>
  viewsData: Array<{ date: string; views: number }>
  licenseRateData: Array<{ date: string; licenses: number }>
  loginRateData: Array<{ date: string; logins: number }>
  revenueData: Array<{ date: string; revenue: number }>
  stats: {
    totalUsers: number; totalViews: number; totalLicenses: number; totalLogins: number
    totalScripts: number; totalTransactions: number; totalRevenue: number; totalDevelopers: number
    revokedLicenses: number; expiredLicenses: number; pendingCustomRequests: number
    usersGrowth?: string; viewsGrowth?: string; licensesGrowth?: string; loginsGrowth?: string; revenueGrowth?: string
  }
  licenseStats?: {
    trialAccountsActive: number; licenseTrialActive: number; allLicenseActives: number
    revokedLicenses: number; expiredLicenses: number
  }
  recentTransactions: RecentTransaction[]
  topScripts: TopScript[]
}

const EMPTY: AnalyticsData = {
  newUsersData: [], viewsData: [], licenseRateData: [], loginRateData: [], revenueData: [],
  stats: {
    totalUsers: 0, totalViews: 0, totalLicenses: 0, totalLogins: 0, totalScripts: 0,
    totalTransactions: 0, totalRevenue: 0, totalDevelopers: 0, revokedLicenses: 0,
    expiredLicenses: 0, pendingCustomRequests: 0,
  },
  licenseStats: { trialAccountsActive: 0, licenseTrialActive: 0, allLicenseActives: 0, revokedLicenses: 0, expiredLicenses: 0 },
  recentTransactions: [], topScripts: [],
}

function GrowthBadge({ value }: { value?: string }) {
  const pos = !value?.startsWith('-')
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${pos ? 'text-emerald-400' : 'text-red-400'}`}>
      {pos ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {value || '0%'}
    </span>
  )
}

/* Card wrapper used throughout */
const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-xl p-5 ${className}`} style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)' }}>
    {children}
  </div>
)

const tooltipStyle = {
  contentStyle: { backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: 11 },
  labelStyle: { color: '#ccc' },
}

function AdminDashboard() {
  const router = useRouter()
  const t = useTranslations('admin')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [d, setD] = useState<AnalyticsData>(EMPTY)

  const fetchData = async () => {
    try {
      setLoading(true); setError(null)
      const token = localStorage.getItem('access_token')
      if (!token) { setError(t('dashboardSection.authRequired')); return }
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics/dashboard`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      })
      if (!res.ok) { setError(`${t('dashboardSection.failedToLoad')}: ${res.status}`); toast.error(`${t('dashboardSection.failedToLoad')}: ${res.status}`); return }
      const data = await res.json()
      setD({ ...EMPTY, ...data, stats: { ...EMPTY.stats, ...data.stats }, licenseStats: { ...EMPTY.licenseStats, ...data.licenseStats }, recentTransactions: data.recentTransactions ?? [], topScripts: data.topScripts ?? [], revenueData: data.revenueData ?? [] })
    } catch {
      setError(t('dashboardSection.networkError')); toast.error(t('errors.networkError'))
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [])

  if (loading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="text-center space-y-4">
        <div className="w-10 h-10 mx-auto rounded-full border-2 border-[rgba(255,255,255,0.07)] border-t-[#51a2ff] animate-spin" />
        <p className="text-[#888] text-sm">{t('dashboardSection.loadingAnalytics')}</p>
      </div>
    </div>
  )

  if (error) return (
    <div className="flex justify-center items-center min-h-[60vh] p-4">
      <div className="card-base p-8 text-center max-w-md w-full">
        <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-lg font-bold text-white mb-2">{t('dashboardSection.failedToLoad')}</h2>
        <p className="text-[#888] text-sm mb-6">{error}</p>
        <button onClick={fetchData} className="btn-primary flex items-center gap-2 mx-auto">
          <RefreshCw className="w-4 h-4" /> {t('common.retry')}
        </button>
      </div>
    </div>
  )

  const topStats = [
    { title: t('dashboardSection.totalUsers'), value: d.stats.totalUsers.toLocaleString(), icon: Users, growth: d.stats.usersGrowth, accent: '#51a2ff' },
    { title: t('dashboardSection.totalLicenses'), value: d.stats.totalLicenses.toLocaleString(), icon: Key, growth: d.stats.licensesGrowth, accent: '#f97316' },
    { title: 'Total Scripts', value: d.stats.totalScripts.toLocaleString(), icon: FileCode, growth: undefined, accent: '#a855f7' },
    { title: 'Total Revenue', value: `$${d.stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: DollarSign, growth: d.stats.revenueGrowth, accent: '#10b981' },
    { title: t('dashboardSection.totalViews'), value: d.stats.totalViews.toLocaleString(), icon: Eye, growth: d.stats.viewsGrowth, accent: '#ec4899' },
    { title: t('dashboardSection.totalLogins'), value: d.stats.totalLogins.toLocaleString(), icon: LogIn, growth: d.stats.loginsGrowth, accent: '#10b981' },
    { title: 'Transactions', value: d.stats.totalTransactions.toLocaleString(), icon: CreditCard, growth: undefined, accent: '#f43f5e' },
    { title: 'Developers', value: d.stats.totalDevelopers.toLocaleString(), icon: Code2, growth: undefined, accent: '#51a2ff' },
  ]

  const licenseStats = [
    { title: t('dashboardSection.allActiveLicenses'), value: (d.licenseStats?.allLicenseActives ?? 0).toLocaleString(), icon: Shield, accent: '#10b981' },
    { title: t('dashboardSection.trialLicensesActive'), value: (d.licenseStats?.licenseTrialActive ?? 0).toLocaleString(), icon: Key, accent: '#51a2ff' },
    { title: t('dashboardSection.trialAccountsActive'), value: (d.licenseStats?.trialAccountsActive ?? 0).toLocaleString(), icon: UserCheck, accent: '#a855f7' },
    { title: 'Revoked', value: (d.stats.revokedLicenses ?? 0).toLocaleString(), icon: XCircle, accent: '#ef4444' },
    { title: 'Expired', value: (d.stats.expiredLicenses ?? 0).toLocaleString(), icon: AlertTriangle, accent: '#f59e0b' },
    { title: 'Pending Requests', value: (d.stats.pendingCustomRequests ?? 0).toLocaleString(), icon: Inbox, accent: '#ec4899' },
  ]

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge-blue text-xs flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" />
              {t('dashboardSection.controlCenter')}
            </span>
          </div>
          <h1 className="text-2xl font-black text-white">{t('dashboardSection.title')}</h1>
          <p className="text-[#555] text-sm mt-0.5">{t('dashboardSection.subtitle')}</p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="btn-ghost btn-sm flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {t('dashboardSection.refreshLive')}
        </button>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {topStats.map((s, i) => {
          const Icon = s.icon
          return (
            <div key={i} className="rounded-xl p-4" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${s.accent}18`, border: `1px solid ${s.accent}30` }}>
                  <Icon className="w-4 h-4" style={{ color: s.accent }} />
                </div>
                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(16,185,129,0.1)' }}>
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-medium text-emerald-400">live</span>
                </div>
              </div>
              <p className="text-xs text-[#555] mb-1">{s.title}</p>
              <div className="text-xl font-bold text-white mb-1">{s.value}</div>
              {s.growth !== undefined ? <GrowthBadge value={s.growth} /> : <span className="text-xs text-[#444]">All time</span>}
            </div>
          )
        })}
      </div>

      {/* License Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {licenseStats.map((s, i) => {
          const Icon = s.icon
          return (
            <div key={i} className="rounded-xl p-4" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2" style={{ background: `${s.accent}18` }}>
                <Icon className="w-4 h-4" style={{ color: s.accent }} />
              </div>
              <p className="text-[10px] text-[#444] mb-0.5">{s.title}</p>
              <div className="text-lg font-bold text-white">{s.value}</div>
            </div>
          )
        })}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-[#51a2ff]/10 flex items-center justify-center">
              <UserPlus className="w-4 h-4 text-[#51a2ff]" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-white">{t('dashboardSection.newUsersPerDay')}</h3>
              <p className="text-xs text-[#444]">{t('dashboardSection.last30Days')}</p>
            </div>
            <GrowthBadge value={d.stats.usersGrowth} />
          </div>
          <ResponsiveContainer width="100%" height={150}>
            <AreaChart data={d.newUsersData}>
              <defs>
                <linearGradient id="gUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#51a2ff" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#51a2ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" stroke="#333" fontSize={9} />
              <YAxis stroke="#333" fontSize={9} />
              <Tooltip {...tooltipStyle} />
              <Area type="monotone" dataKey="users" stroke="#51a2ff" strokeWidth={2} fillOpacity={1} fill="url(#gUsers)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-[#a855f7]/10 flex items-center justify-center">
              <Eye className="w-4 h-4 text-[#a855f7]" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-white">{t('dashboardSection.viewsPerDay')}</h3>
              <p className="text-xs text-[#444]">{t('dashboardSection.last30Days')}</p>
            </div>
            <GrowthBadge value={d.stats.viewsGrowth} />
          </div>
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={d.viewsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" stroke="#333" fontSize={9} />
              <YAxis stroke="#333" fontSize={9} />
              <Tooltip {...tooltipStyle} />
              <Line type="monotone" dataKey="views" stroke="#a855f7" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-[#f97316]/10 flex items-center justify-center">
              <Key className="w-4 h-4 text-[#f97316]" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-white">{t('dashboardSection.licenseRatePerDay')}</h3>
              <p className="text-xs text-[#444]">{t('dashboardSection.last30Days')}</p>
            </div>
            <GrowthBadge value={d.stats.licensesGrowth} />
          </div>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={d.licenseRateData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" stroke="#333" fontSize={9} />
              <YAxis stroke="#333" fontSize={9} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="licenses" fill="#f97316" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-[#10b981]/10 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-[#10b981]" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-white">Revenue Per Day</h3>
              <p className="text-xs text-[#444]">{t('dashboardSection.last30Days')}</p>
            </div>
            <GrowthBadge value={d.stats.revenueGrowth} />
          </div>
          <ResponsiveContainer width="100%" height={150}>
            <AreaChart data={d.revenueData}>
              <defs>
                <linearGradient id="gRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" stroke="#333" fontSize={9} />
              <YAxis stroke="#333" fontSize={9} tickFormatter={v => `$${v}`} />
              <Tooltip {...tooltipStyle} formatter={(v: number) => [`$${v.toFixed(2)}`, 'Revenue']} />
              <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#gRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Charts row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-[#10b981]/10 flex items-center justify-center">
              <LogIn className="w-4 h-4 text-[#10b981]" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-white">{t('dashboardSection.dailyLoginUsers')}</h3>
              <p className="text-xs text-[#444]">{t('dashboardSection.last30Days')}</p>
            </div>
            <GrowthBadge value={d.stats.loginsGrowth} />
          </div>
          <ResponsiveContainer width="100%" height={150}>
            <AreaChart data={d.loginRateData}>
              <defs>
                <linearGradient id="gLogins" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" stroke="#333" fontSize={9} />
              <YAxis stroke="#333" fontSize={9} />
              <Tooltip {...tooltipStyle} />
              <Area type="monotone" dataKey="logins" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#gLogins)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-[#51a2ff]/10 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-[#51a2ff]" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-white">Combined Trends</h3>
              <p className="text-xs text-[#444]">Users · Licenses · {t('dashboardSection.last30Days')}</p>
            </div>
            <div className="flex gap-3">
              <div className="flex items-center gap-1"><div className="w-3 h-0.5 rounded-full bg-[#51a2ff]" /><span className="text-[10px] text-[#555]">Users</span></div>
              <div className="flex items-center gap-1"><div className="w-3 h-0.5 rounded-full bg-[#f97316]" /><span className="text-[10px] text-[#555]">Licenses</span></div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={d.newUsersData.map((row, i) => ({ date: row.date, users: row.users, licenses: d.licenseRateData[i]?.licenses ?? 0 }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" stroke="#333" fontSize={9} />
              <YAxis stroke="#333" fontSize={9} />
              <Tooltip {...tooltipStyle} />
              <Line type="monotone" dataKey="users" stroke="#51a2ff" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="licenses" stroke="#f97316" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* License Health + MoM + Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-[#51a2ff]/10 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-[#51a2ff]" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">License Breakdown</h3>
              <p className="text-xs text-[#444]">Active distribution</p>
            </div>
          </div>
          {(() => {
            const trial = d.licenseStats?.licenseTrialActive ?? 0
            const all = d.licenseStats?.allLicenseActives ?? 0
            const paid = Math.max(0, all - trial)
            const pieData = [
              { name: 'Paid Active', value: paid, color: '#51a2ff' },
              { name: 'Trial Active', value: trial, color: '#a855f7' },
              { name: 'Revoked', value: d.stats.revokedLicenses ?? 0, color: '#ef4444' },
              { name: 'Expired', value: d.stats.expiredLicenses ?? 0, color: '#f59e0b' },
            ]
            return (
              <div className="flex items-center gap-4">
                <div style={{ width: 110, height: 110, flexShrink: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} dataKey="value" innerRadius={26} outerRadius={46} paddingAngle={2}>
                        {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-1.5 flex-1">
                  {pieData.map(row => (
                    <div key={row.name} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: row.color }} />
                      <span className="text-xs text-[#888] flex-1 truncate">{row.name}</span>
                      <span className="text-xs font-semibold text-white">{row.value}</span>
                    </div>
                  ))}
                  <div className="pt-1 border-t border-[rgba(255,255,255,0.06)] flex justify-between">
                    <span className="text-xs text-[#444]">Total</span>
                    <span className="text-xs font-bold text-[#51a2ff]">{d.stats.totalLicenses}</span>
                  </div>
                </div>
              </div>
            )
          })()}
        </Card>

        <Card>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-[#10b981]/10 flex items-center justify-center">
              <Shield className="w-4 h-4 text-[#10b981]" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">License Health</h3>
              <p className="text-xs text-[#444]">Current snapshot</p>
            </div>
          </div>
          {(() => {
            const total = d.stats.totalLicenses || 1
            const totalUsers = d.stats.totalUsers || 1
            const rows = [
              { label: 'Active', value: d.licenseStats?.allLicenseActives ?? 0, total, color: '#10b981' },
              { label: 'Trial Licenses', value: d.licenseStats?.licenseTrialActive ?? 0, total, color: '#a855f7' },
              { label: 'Trial Accounts', value: d.licenseStats?.trialAccountsActive ?? 0, total: totalUsers, color: '#51a2ff' },
              { label: 'Revoked', value: d.stats.revokedLicenses ?? 0, total, color: '#ef4444' },
              { label: 'Expired', value: d.stats.expiredLicenses ?? 0, total, color: '#f59e0b' },
            ]
            return (
              <div className="space-y-2.5">
                {rows.map(r => (
                  <div key={r.label}>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-[#555]">{r.label}</span>
                      <span className="text-xs font-semibold text-white">{r.value}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[rgba(255,255,255,0.05)] overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(100, r.total > 0 ? (r.value / r.total) * 100 : 0).toFixed(1)}%`, backgroundColor: r.color }} />
                    </div>
                  </div>
                ))}
              </div>
            )
          })()}
        </Card>

        <Card>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-[#f43f5e]/10 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-[#f43f5e]" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">MoM Growth</h3>
              <p className="text-xs text-[#444]">Month-over-month</p>
            </div>
          </div>
          <div className="space-y-2">
            {[
              { label: 'Users', value: d.stats.usersGrowth, icon: Users },
              { label: 'Views', value: d.stats.viewsGrowth, icon: Eye },
              { label: 'Licenses', value: d.stats.licensesGrowth, icon: Key },
              { label: 'Logins', value: d.stats.loginsGrowth, icon: LogIn },
              { label: 'Revenue', value: d.stats.revenueGrowth, icon: DollarSign },
            ].map(item => {
              const Icon = item.icon
              return (
                <div key={item.label} className="flex items-center justify-between p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5 text-[#444]" />
                    <span className="text-xs text-[#888]">{item.label}</span>
                  </div>
                  <GrowthBadge value={item.value} />
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      {/* Recent Transactions + Top Scripts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#10b981]/10 flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-[#10b981]" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Recent Transactions</h3>
                <p className="text-xs text-[#444]">Latest 6</p>
              </div>
            </div>
            <button onClick={() => router.push('/admin/transactions')} className="text-xs text-[#51a2ff] hover:text-white transition-colors flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          {d.recentTransactions.length === 0 ? (
            <p className="text-xs text-[#444] text-center py-6">No transactions yet</p>
          ) : (
            <div className="space-y-2">
              {d.recentTransactions.map(tx => (
                <div key={tx.id} className="flex items-center gap-3 p-2.5 rounded-lg transition-colors" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className={`w-1 h-8 rounded-full flex-shrink-0 ${tx.status === 'completed' ? 'bg-emerald-500' : tx.status === 'refunded' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white truncate">{tx.user?.username ?? 'Unknown'}</p>
                    <p className="text-[10px] text-[#444] truncate">{tx.script?.name ?? '—'}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-bold text-emerald-400">${tx.amount.toFixed(2)}</p>
                    <p className="text-[10px] text-[#444]">{new Date(tx.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#a855f7]/10 flex items-center justify-center">
                <FileCode className="w-4 h-4 text-[#a855f7]" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Top Scripts</h3>
                <p className="text-xs text-[#444]">By license count</p>
              </div>
            </div>
            <button onClick={() => router.push('/admin/scripts')} className="text-xs text-[#51a2ff] hover:text-white transition-colors flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          {d.topScripts.length === 0 ? (
            <p className="text-xs text-[#444] text-center py-6">No scripts yet</p>
          ) : (
            <div className="space-y-2">
              {d.topScripts.map((sc, idx) => {
                const maxLicenses = d.topScripts[0]?._count.licenses || 1
                return (
                  <div key={sc.id} className="flex items-center gap-3 p-2.5 rounded-lg transition-colors" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <span className="text-xs font-bold text-[#333] w-4 flex-shrink-0">#{idx + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-white truncate">{sc.name}</p>
                      <div className="mt-1 h-1 rounded-full bg-[rgba(255,255,255,0.05)] overflow-hidden">
                        <div className="h-full bg-[#a855f7] rounded-full" style={{ width: `${(sc._count.licenses / maxLicenses) * 100}%` }} />
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-bold text-[#a855f7]">{sc._count.licenses} <span className="font-normal text-[#444]">lic</span></p>
                      <p className="text-[10px] text-[#444]">{sc._count.transactions} txn</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Quick Navigation */}
      <Card>
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <ArrowRight className="w-4 h-4 text-[#51a2ff]" />
          Quick Navigation
        </h3>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {[
            { href: '/admin/licenses', icon: Key, label: 'Licenses', color: '#51a2ff' },
            { href: '/admin/users', icon: Users, label: 'Users', color: '#a855f7' },
            { href: '/admin/scripts', icon: FileCode, label: 'Scripts', color: '#f97316' },
            { href: '/admin/transactions', icon: CreditCard, label: 'Transactions', color: '#10b981' },
            { href: '/admin/audit-logs', icon: ClipboardList, label: 'Audit Logs', color: '#51a2ff' },
            { href: '/admin/licenses/event-logs', icon: Activity, label: 'Event Logs', color: '#f43f5e' },
          ].map(item => {
            const Icon = item.icon
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className="flex flex-col items-center gap-2 p-3 rounded-xl transition-all hover:scale-105"
                style={{ background: `${item.color}0d`, border: `1px solid ${item.color}25` }}
              >
                <Icon className="w-5 h-5" style={{ color: item.color }} />
                <span className="text-xs font-medium text-white text-center">{item.label}</span>
              </button>
            )
          })}
        </div>
      </Card>
    </div>
  )
}

export default withAdminAuth(AdminDashboard)
