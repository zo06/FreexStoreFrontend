"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { withAdminAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import {
  Users, TrendingUp, Activity, Sparkles, Key, UserPlus, Eye, LogIn,
  BarChart3, UserCheck, Shield, ClipboardList, FileCode, CreditCard,
  ArrowRight, TrendingDown, Code2, XCircle, AlertTriangle, Inbox,
  DollarSign, RefreshCw,
} from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Area, AreaChart, PieChart, Pie, Cell,
} from 'recharts'
import toast from 'react-hot-toast'
import { useTranslations } from 'next-intl'

interface RecentTransaction {
  id: string
  amount: number
  status: string
  type: string
  createdAt: string
  user?: { username: string }
  script?: { name: string }
}

interface TopScript {
  id: string
  name: string
  _count: { licenses: number; transactions: number }
}

interface AnalyticsData {
  newUsersData: Array<{ date: string; users: number }>
  viewsData: Array<{ date: string; views: number }>
  licenseRateData: Array<{ date: string; licenses: number }>
  loginRateData: Array<{ date: string; logins: number }>
  revenueData: Array<{ date: string; revenue: number }>
  stats: {
    totalUsers: number
    totalViews: number
    totalLicenses: number
    totalLogins: number
    totalScripts: number
    totalTransactions: number
    totalRevenue: number
    totalDevelopers: number
    revokedLicenses: number
    expiredLicenses: number
    pendingCustomRequests: number
    usersGrowth?: string
    viewsGrowth?: string
    licensesGrowth?: string
    loginsGrowth?: string
    revenueGrowth?: string
  }
  licenseStats?: {
    trialAccountsActive: number
    licenseTrialActive: number
    allLicenseActives: number
    revokedLicenses: number
    expiredLicenses: number
  }
  recentTransactions: RecentTransaction[]
  topScripts: TopScript[]
}

const EMPTY: AnalyticsData = {
  newUsersData: [],
  viewsData: [],
  licenseRateData: [],
  loginRateData: [],
  revenueData: [],
  stats: {
    totalUsers: 0, totalViews: 0, totalLicenses: 0, totalLogins: 0,
    totalScripts: 0, totalTransactions: 0, totalRevenue: 0, totalDevelopers: 0,
    revokedLicenses: 0, expiredLicenses: 0, pendingCustomRequests: 0,
  },
  licenseStats: { trialAccountsActive: 0, licenseTrialActive: 0, allLicenseActives: 0, revokedLicenses: 0, expiredLicenses: 0 },
  recentTransactions: [],
  topScripts: [],
}

function growthPositive(v?: string) { return !v?.startsWith('-') }

function GrowthBadge({ value }: { value?: string }) {
  const pos = growthPositive(value)
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${pos ? 'text-emerald-400' : 'text-red-400'}`}>
      {pos ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {value || '0%'}
    </span>
  )
}

function AdminDashboard() {
  const router = useRouter()
  const t = useTranslations('admin')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [d, setD] = useState<AnalyticsData>(EMPTY)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const token = localStorage.getItem('access_token')
      if (!token) { setError(t('dashboardSection.authRequired')); return }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics/dashboard`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      })
      if (!res.ok) {
        setError(`${t('dashboardSection.failedToLoad')}: ${res.status}`)
        toast.error(`${t('dashboardSection.failedToLoad')}: ${res.status}`)
        return
      }
      const data = await res.json()
      setD({
        ...EMPTY,
        ...data,
        stats: { ...EMPTY.stats, ...data.stats },
        licenseStats: { ...EMPTY.licenseStats, ...data.licenseStats },
        recentTransactions: data.recentTransactions ?? [],
        topScripts: data.topScripts ?? [],
        revenueData: data.revenueData ?? [],
      })
    } catch {
      setError(t('dashboardSection.networkError'))
      toast.error(t('errors.networkError'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-cyan-900/30 via-blue-900/20 to-emerald-900/30">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto rounded-full border-b-2 animate-spin border-cyan-400" />
          <p className="mt-4 text-white text-sm">{t('dashboardSection.loadingAnalytics')}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-cyan-900/30 via-blue-900/20 to-emerald-900/30">
        <div className="text-center p-8 bg-red-900/40 rounded-2xl border border-red-500/30 backdrop-blur-xl max-w-lg mx-4">
          <h2 className="text-2xl font-bold text-red-300 mb-4">{t('dashboardSection.failedToLoad')}</h2>
          <p className="text-gray-300 mb-6 text-sm">{error}</p>
          <Button onClick={fetchData} className="text-white bg-gradient-to-r from-cyan-600 to-blue-600 border-0 hover:scale-105">
            <Activity className="mr-2 w-4 h-4" /> {t('common.retry')}
          </Button>
        </div>
      </div>
    )
  }

  const topStatsRow1 = [
    { title: t('dashboardSection.totalUsers'), value: d.stats.totalUsers.toLocaleString(), icon: Users, growth: d.stats.usersGrowth, color: 'from-blue-500 to-cyan-500' },
    { title: t('dashboardSection.totalLicenses'), value: d.stats.totalLicenses.toLocaleString(), icon: Key, growth: d.stats.licensesGrowth, color: 'from-orange-500 to-red-500' },
    { title: 'Total Scripts', value: d.stats.totalScripts.toLocaleString(), icon: FileCode, growth: undefined, color: 'from-violet-500 to-purple-600' },
    { title: 'Total Revenue', value: `$${d.stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: DollarSign, growth: d.stats.revenueGrowth, color: 'from-emerald-500 to-green-600' },
    { title: t('dashboardSection.totalViews'), value: d.stats.totalViews.toLocaleString(), icon: Eye, growth: d.stats.viewsGrowth, color: 'from-purple-500 to-pink-500' },
    { title: t('dashboardSection.totalLogins'), value: d.stats.totalLogins.toLocaleString(), icon: LogIn, growth: d.stats.loginsGrowth, color: 'from-green-500 to-emerald-500' },
    { title: 'Total Transactions', value: d.stats.totalTransactions.toLocaleString(), icon: CreditCard, growth: undefined, color: 'from-rose-500 to-pink-600' },
    { title: 'Developers', value: d.stats.totalDevelopers.toLocaleString(), icon: Code2, growth: undefined, color: 'from-sky-500 to-blue-600' },
  ]

  const licenseStatsRow = [
    { title: t('dashboardSection.allActiveLicenses'), value: (d.licenseStats?.allLicenseActives ?? 0).toLocaleString(), icon: Shield, color: 'from-emerald-500 to-teal-500' },
    { title: t('dashboardSection.trialLicensesActive'), value: (d.licenseStats?.licenseTrialActive ?? 0).toLocaleString(), icon: Key, color: 'from-cyan-500 to-blue-500' },
    { title: t('dashboardSection.trialAccountsActive'), value: (d.licenseStats?.trialAccountsActive ?? 0).toLocaleString(), icon: UserCheck, color: 'from-indigo-500 to-purple-500' },
    { title: 'Revoked Licenses', value: (d.stats.revokedLicenses ?? 0).toLocaleString(), icon: XCircle, color: 'from-red-600 to-red-500' },
    { title: 'Expired Licenses', value: (d.stats.expiredLicenses ?? 0).toLocaleString(), icon: AlertTriangle, color: 'from-yellow-500 to-orange-500' },
    { title: 'Pending Requests', value: (d.stats.pendingCustomRequests ?? 0).toLocaleString(), icon: Inbox, color: 'from-fuchsia-500 to-pink-500' },
  ]

  const tooltip = { contentStyle: { backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }, labelStyle: { color: '#f3f4f6' } }

  return (
    <>
      <main className="overflow-x-hidden relative min-h-screen">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/30 via-blue-900/20 to-emerald-900/30" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl bg-cyan-500/20" />
        <div className="absolute bottom-1/4 right-1/4 w-[32rem] h-[32rem] bg-blue-500/15 rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='1'%3E%3C/circle%3E%3C/g%3E%3C/g%3E%3C/svg%3E')" }} />

        <div className="relative z-10 p-3 sm:p-4 md:p-6 mx-auto space-y-6 max-w-7xl">

          {/* ── Header ── */}
          <div className="text-center pt-4">
            <div className="inline-flex gap-2 items-center px-4 py-2 mb-4 bg-gradient-to-r rounded-full border backdrop-blur-sm from-cyan-500/20 to-blue-500/20 border-cyan-500/30">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-medium text-cyan-200">{t('dashboardSection.controlCenter')}</span>
            </div>
            <h1 className="mb-3 text-3xl sm:text-4xl lg:text-5xl font-bold">
              <span className="block text-gradient">{t('dashboardSection.title')}</span>
            </h1>
            <p className="mx-auto mb-6 max-w-2xl text-sm md:text-base leading-relaxed text-muted">
              {t('dashboardSection.subtitle')}
            </p>
            <Button onClick={fetchData} disabled={loading} size="lg"
              className="text-white bg-gradient-to-r from-cyan-600 to-blue-600 border-0 shadow-2xl hover:from-cyan-700 hover:to-blue-700 hover:scale-105 transition-all">
              <RefreshCw className={`mr-2 w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {t('dashboardSection.refreshLive')}
            </Button>
          </div>

          {/* ── Top Stats (8 cards) ── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {topStatsRow1.map((s, i) => {
              const Icon = s.icon
              return (
                <div key={i} className="relative overflow-hidden p-4 sm:p-5 bg-gradient-to-br rounded-2xl border backdrop-blur-sm transition-all duration-300 group from-cyan-900/40 to-purple-800/20 border-cyan-500/20 hover:border-cyan-400/40 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/20">
                  <div className="absolute inset-0 bg-gradient-to-br to-transparent opacity-0 transition-opacity from-cyan-600/10 group-hover:opacity-100" />
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-3">
                      <div className={`w-10 h-10 bg-gradient-to-br ${s.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/20 border border-green-500/30">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                        <span className="text-[10px] font-medium text-green-400">{t('common.live')}</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mb-1">{s.title}</p>
                    <div className="text-xl sm:text-2xl font-bold text-white mb-1">{s.value}</div>
                    {s.growth !== undefined ? <GrowthBadge value={s.growth} /> : <span className="text-xs text-gray-500">All time</span>}
                  </div>
                </div>
              )
            })}
          </div>

          {/* ── License Stats (6 cards) ── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {licenseStatsRow.map((s, i) => {
              const Icon = s.icon
              return (
                <div key={i} className="relative overflow-hidden p-4 bg-gradient-to-br rounded-2xl border backdrop-blur-sm transition-all duration-300 from-slate-900/60 to-slate-800/30 border-white/10 hover:border-white/20 hover:scale-105">
                  <div className={`w-8 h-8 bg-gradient-to-br ${s.color} rounded-lg flex items-center justify-center mb-2`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-[10px] text-gray-400 mb-0.5">{s.title}</p>
                  <div className="text-lg font-bold text-white">{s.value}</div>
                </div>
              )
            })}
          </div>

          {/* ── Charts row 1: Users + Views ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* New Users */}
            <div className="overflow-hidden relative p-5 bg-gradient-to-br rounded-2xl border backdrop-blur-sm from-blue-900/60 to-blue-800/30 border-blue-500/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex justify-center items-center w-9 h-9 bg-gradient-to-br rounded-lg from-blue-500 to-blue-600">
                  <UserPlus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{t('dashboardSection.newUsersPerDay')}</h3>
                  <p className="text-xs text-gray-400">{t('dashboardSection.last30Days')}</p>
                </div>
                <div className="ml-auto"><GrowthBadge value={d.stats.usersGrowth} /></div>
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={d.newUsersData}>
                  <defs>
                    <linearGradient id="gUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9ca3af" fontSize={9} tick={{ dy: 4 }} />
                  <YAxis stroke="#9ca3af" fontSize={9} />
                  <Tooltip {...tooltip} />
                  <Area type="monotone" dataKey="users" stroke="#3b82f6" fillOpacity={1} fill="url(#gUsers)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Views */}
            <div className="overflow-hidden relative p-5 bg-gradient-to-br rounded-2xl border backdrop-blur-sm from-purple-900/60 to-purple-800/30 border-purple-500/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex justify-center items-center w-9 h-9 bg-gradient-to-br rounded-lg from-purple-500 to-purple-600">
                  <Eye className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{t('dashboardSection.viewsPerDay')}</h3>
                  <p className="text-xs text-gray-400">{t('dashboardSection.last30Days')}</p>
                </div>
                <div className="ml-auto"><GrowthBadge value={d.stats.viewsGrowth} /></div>
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={d.viewsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9ca3af" fontSize={9} />
                  <YAxis stroke="#9ca3af" fontSize={9} />
                  <Tooltip {...tooltip} />
                  <Line type="monotone" dataKey="views" stroke="#a855f7" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ── Charts row 2: Licenses + Revenue ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Licenses per day */}
            <div className="overflow-hidden relative p-5 bg-gradient-to-br rounded-2xl border backdrop-blur-sm from-orange-900/60 to-orange-800/30 border-orange-500/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex justify-center items-center w-9 h-9 bg-gradient-to-br rounded-lg from-orange-500 to-orange-600">
                  <Key className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{t('dashboardSection.licenseRatePerDay')}</h3>
                  <p className="text-xs text-gray-400">{t('dashboardSection.last30Days')}</p>
                </div>
                <div className="ml-auto"><GrowthBadge value={d.stats.licensesGrowth} /></div>
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={d.licenseRateData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9ca3af" fontSize={9} />
                  <YAxis stroke="#9ca3af" fontSize={9} />
                  <Tooltip {...tooltip} />
                  <Bar dataKey="licenses" fill="#f97316" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Revenue per day */}
            <div className="overflow-hidden relative p-5 bg-gradient-to-br rounded-2xl border backdrop-blur-sm from-emerald-900/60 to-emerald-800/30 border-emerald-500/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex justify-center items-center w-9 h-9 bg-gradient-to-br rounded-lg from-emerald-500 to-emerald-600">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Revenue Per Day</h3>
                  <p className="text-xs text-gray-400">{t('dashboardSection.last30Days')}</p>
                </div>
                <div className="ml-auto"><GrowthBadge value={d.stats.revenueGrowth} /></div>
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={d.revenueData}>
                  <defs>
                    <linearGradient id="gRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9ca3af" fontSize={9} />
                  <YAxis stroke="#9ca3af" fontSize={9} tickFormatter={v => `$${v}`} />
                  <Tooltip {...tooltip} formatter={(v: number) => [`$${v.toFixed(2)}`, 'Revenue']} />
                  <Area type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#gRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ── Charts row 3: Logins + Combined Trends ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Logins */}
            <div className="overflow-hidden relative p-5 bg-gradient-to-br rounded-2xl border backdrop-blur-sm from-green-900/60 to-green-800/30 border-green-500/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex justify-center items-center w-9 h-9 bg-gradient-to-br rounded-lg from-green-500 to-green-600">
                  <LogIn className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{t('dashboardSection.dailyLoginUsers')}</h3>
                  <p className="text-xs text-gray-400">{t('dashboardSection.last30Days')}</p>
                </div>
                <div className="ml-auto"><GrowthBadge value={d.stats.loginsGrowth} /></div>
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={d.loginRateData}>
                  <defs>
                    <linearGradient id="gLogins" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9ca3af" fontSize={9} />
                  <YAxis stroke="#9ca3af" fontSize={9} />
                  <Tooltip {...tooltip} />
                  <Area type="monotone" dataKey="logins" stroke="#10b981" fillOpacity={1} fill="url(#gLogins)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Combined trends */}
            <div className="overflow-hidden relative p-5 bg-gradient-to-br rounded-2xl border backdrop-blur-sm from-indigo-900/60 to-indigo-800/30 border-indigo-500/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex justify-center items-center w-9 h-9 bg-gradient-to-br rounded-lg from-indigo-500 to-indigo-600">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Combined Trends</h3>
                  <p className="text-xs text-gray-400">Users · Licenses · {t('dashboardSection.last30Days')}</p>
                </div>
                <div className="ml-auto flex gap-3">
                  <div className="flex items-center gap-1"><div className="w-3 h-1 rounded-full bg-blue-400" /><span className="text-[10px] text-gray-400">Users</span></div>
                  <div className="flex items-center gap-1"><div className="w-3 h-1 rounded-full bg-orange-400" /><span className="text-[10px] text-gray-400">Licenses</span></div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={d.newUsersData.map((row, i) => ({
                  date: row.date,
                  users: row.users,
                  licenses: d.licenseRateData[i]?.licenses ?? 0,
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9ca3af" fontSize={9} />
                  <YAxis stroke="#9ca3af" fontSize={9} />
                  <Tooltip {...tooltip} />
                  <Line type="monotone" dataKey="users" stroke="#60a5fa" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="licenses" stroke="#fb923c" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ── License Health + MoM Growth + Pie ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Pie breakdown */}
            <div className="p-5 bg-gradient-to-br rounded-2xl border backdrop-blur-sm from-cyan-900/60 to-cyan-800/30 border-cyan-500/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex justify-center items-center w-9 h-9 bg-gradient-to-br rounded-lg from-cyan-500 to-cyan-600">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">License Breakdown</h3>
                  <p className="text-xs text-gray-400">Active distribution</p>
                </div>
              </div>
              {(() => {
                const trial = d.licenseStats?.licenseTrialActive ?? 0
                const all = d.licenseStats?.allLicenseActives ?? 0
                const paid = Math.max(0, all - trial)
                const revoked = d.stats.revokedLicenses ?? 0
                const expired = d.stats.expiredLicenses ?? 0
                const pieData = [
                  { name: 'Paid Active', value: paid, color: '#06b6d4' },
                  { name: 'Trial Active', value: trial, color: '#8b5cf6' },
                  { name: 'Revoked', value: revoked, color: '#ef4444' },
                  { name: 'Expired', value: expired, color: '#f59e0b' },
                ]
                return (
                  <div className="flex items-center gap-4">
                    <div style={{ width: 120, height: 120, flexShrink: 0 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={pieData} dataKey="value" innerRadius={28} outerRadius={50} paddingAngle={2}>
                            {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                          </Pie>
                          <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', fontSize: 11 }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-1.5 flex-1">
                      {pieData.map(row => (
                        <div key={row.name} className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: row.color }} />
                          <span className="text-xs text-gray-300 flex-1 truncate">{row.name}</span>
                          <span className="text-xs font-semibold text-white">{row.value}</span>
                        </div>
                      ))}
                      <div className="pt-1 border-t border-white/10 flex justify-between">
                        <span className="text-xs text-gray-500">Total</span>
                        <span className="text-xs font-bold text-cyan-400">{d.stats.totalLicenses}</span>
                      </div>
                    </div>
                  </div>
                )
              })()}
            </div>

            {/* License health bars */}
            <div className="p-5 bg-gradient-to-br rounded-2xl border backdrop-blur-sm from-emerald-900/60 to-emerald-800/30 border-emerald-500/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex justify-center items-center w-9 h-9 bg-gradient-to-br rounded-lg from-emerald-500 to-emerald-600">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">License Health</h3>
                  <p className="text-xs text-gray-400">Current snapshot</p>
                </div>
              </div>
              {(() => {
                const total = d.stats.totalLicenses || 1
                const totalUsers = d.stats.totalUsers || 1
                const rows = [
                  { label: 'Active', value: d.licenseStats?.allLicenseActives ?? 0, total, color: 'bg-emerald-500' },
                  { label: 'Trial Licenses', value: d.licenseStats?.licenseTrialActive ?? 0, total, color: 'bg-purple-500' },
                  { label: 'Trial Accounts', value: d.licenseStats?.trialAccountsActive ?? 0, total: totalUsers, color: 'bg-blue-500' },
                  { label: 'Revoked', value: d.stats.revokedLicenses ?? 0, total, color: 'bg-red-500' },
                  { label: 'Expired', value: d.stats.expiredLicenses ?? 0, total, color: 'bg-yellow-500' },
                ]
                return (
                  <div className="space-y-2.5">
                    {rows.map(r => (
                      <div key={r.label}>
                        <div className="flex justify-between mb-1">
                          <span className="text-xs text-gray-400">{r.label}</span>
                          <span className="text-xs font-semibold text-white">{r.value}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div className={`h-full rounded-full ${r.color} transition-all duration-700`}
                            style={{ width: `${Math.min(100, r.total > 0 ? (r.value / r.total) * 100 : 0).toFixed(1)}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )
              })()}
            </div>

            {/* MoM Growth */}
            <div className="p-5 bg-gradient-to-br rounded-2xl border backdrop-blur-sm from-rose-900/60 to-rose-800/30 border-rose-500/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex justify-center items-center w-9 h-9 bg-gradient-to-br rounded-lg from-rose-500 to-rose-600">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">MoM Growth</h3>
                  <p className="text-xs text-gray-400">Month-over-month</p>
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
                    <div key={item.label} className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
                      <div className="flex items-center gap-2">
                        <Icon className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-xs text-gray-300">{item.label}</span>
                      </div>
                      <GrowthBadge value={item.value} />
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* ── Recent Transactions + Top Scripts ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Recent Transactions */}
            <div className="p-5 bg-gradient-to-br rounded-2xl border backdrop-blur-sm from-slate-900/80 to-slate-800/40 border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex justify-center items-center w-9 h-9 bg-gradient-to-br rounded-lg from-green-500 to-emerald-600">
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Recent Transactions</h3>
                    <p className="text-xs text-gray-400">Latest 6 transactions</p>
                  </div>
                </div>
                <button onClick={() => router.push('/admin/transactions')}
                  className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                  View all <ArrowRight className="w-3 h-3" />
                </button>
              </div>
              {d.recentTransactions.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-6">No transactions yet</p>
              ) : (
                <div className="space-y-2">
                  {d.recentTransactions.map(tx => (
                    <div key={tx.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                      <div className={`w-1.5 h-8 rounded-full flex-shrink-0 ${tx.status === 'completed' ? 'bg-emerald-500' : tx.status === 'refunded' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-white truncate">{tx.user?.username ?? 'Unknown'}</p>
                        <p className="text-[10px] text-gray-400 truncate">{tx.script?.name ?? '—'}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs font-bold text-emerald-400">${tx.amount.toFixed(2)}</p>
                        <p className="text-[10px] text-gray-500">{new Date(tx.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Top Scripts */}
            <div className="p-5 bg-gradient-to-br rounded-2xl border backdrop-blur-sm from-slate-900/80 to-slate-800/40 border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex justify-center items-center w-9 h-9 bg-gradient-to-br rounded-lg from-violet-500 to-purple-600">
                    <FileCode className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Top Scripts</h3>
                    <p className="text-xs text-gray-400">By license count</p>
                  </div>
                </div>
                <button onClick={() => router.push('/admin/scripts')}
                  className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                  View all <ArrowRight className="w-3 h-3" />
                </button>
              </div>
              {d.topScripts.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-6">No scripts yet</p>
              ) : (
                <div className="space-y-2">
                  {d.topScripts.map((sc, idx) => {
                    const maxLicenses = d.topScripts[0]?._count.licenses || 1
                    return (
                      <div key={sc.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                        <span className="text-xs font-bold text-gray-500 w-4 flex-shrink-0">#{idx + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-white truncate">{sc.name}</p>
                          <div className="mt-1 h-1 rounded-full bg-white/10 overflow-hidden">
                            <div className="h-full bg-violet-500 rounded-full transition-all duration-700"
                              style={{ width: `${(sc._count.licenses / maxLicenses) * 100}%` }} />
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-xs font-bold text-violet-400">{sc._count.licenses} <span className="font-normal text-gray-500">lic</span></p>
                          <p className="text-[10px] text-gray-500">{sc._count.transactions} txn</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ── Quick Navigation ── */}
          <div className="p-5 bg-gradient-to-br rounded-2xl border backdrop-blur-sm from-slate-900/80 to-slate-800/40 border-white/10">
            <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-cyan-400" />
              Quick Navigation
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {[
                { href: '/admin/licenses', icon: Key, label: 'Licenses', color: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-blue-400' },
                { href: '/admin/users', icon: Users, label: 'Users', color: 'from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-400' },
                { href: '/admin/scripts', icon: FileCode, label: 'Scripts', color: 'from-orange-500/20 to-yellow-500/20 border-orange-500/30 text-orange-400' },
                { href: '/admin/transactions', icon: CreditCard, label: 'Transactions', color: 'from-green-500/20 to-emerald-500/20 border-green-500/30 text-green-400' },
                { href: '/admin/audit-logs', icon: ClipboardList, label: 'Audit Logs', color: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/30 text-cyan-400' },
                { href: '/admin/licenses/event-logs', icon: Activity, label: 'Event Logs', color: 'from-rose-500/20 to-red-500/20 border-rose-500/30 text-rose-400' },
              ].map(item => {
                const Icon = item.icon
                return (
                  <button key={item.href} onClick={() => router.push(item.href)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border bg-gradient-to-br ${item.color} hover:scale-105 transition-all duration-200`}>
                    <Icon className="w-5 h-5" />
                    <span className="text-xs font-medium text-white text-center">{item.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

        </div>
      </main>
    </>
  )
}

export default withAdminAuth(AdminDashboard)
