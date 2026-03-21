"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { withAdminAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Users, TrendingUp, Activity, Sparkles, Key, UserPlus, Eye, LogIn, BarChart3, UserCheck, Shield, ClipboardList, FileCode, CreditCard, ArrowRight, TrendingDown } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart, PieChart, Pie, Cell } from 'recharts'
import toast from 'react-hot-toast'
import { useTranslations } from 'next-intl'

interface AnalyticsData {
  newUsersData: Array<{ date: string; users: number }>
  viewsData: Array<{ date: string; views: number }>
  licenseRateData: Array<{ date: string; licenses: number }>
  loginRateData: Array<{ date: string; logins: number }>
  stats: {
    totalUsers: number
    totalViews: number
    totalLicenses: number
    totalLogins: number
    usersGrowth?: string
    viewsGrowth?: string
    licensesGrowth?: string
    loginsGrowth?: string
  }
  licenseStats?: {
    trialAccountsActive: number
    licenseTrialActive: number
    allLicenseActives: number
  }
}

function AdminDashboard() {
  const router = useRouter()
  const t = useTranslations('admin')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    newUsersData: [],
    viewsData: [],
    licenseRateData: [],
    loginRateData: [],
    stats: {
      totalUsers: 0,
      totalViews: 0,
      totalLicenses: 0,
      totalLogins: 0
    },
    licenseStats: {
      trialAccountsActive: 0,
      licenseTrialActive: 0,
      allLicenseActives: 0
    }
  })

  useEffect(() => {
    fetchAnalyticsData()
  }, [])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      setError(null)
      const token = localStorage.getItem('access_token')

      if (!token) {
        console.error('No access token found')
        setError(t('dashboardSection.authRequired'))
        toast.error(t('auth.loginFailed'))
        return
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }

      console.log('Fetching analytics from:', `${process.env.NEXT_PUBLIC_API_URL}/analytics/dashboard`)

      // Fetch analytics data from backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics/dashboard`, { headers })

      console.log('Analytics response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('Analytics data received:', data)

        // Ensure licenseStats exists even if backend doesn't return it yet
        const analyticsDataWithDefaults = {
          ...data,
          licenseStats: data.licenseStats || {
            trialAccountsActive: 0,
            licenseTrialActive: 0,
            allLicenseActives: 0
          }
        }

        setAnalyticsData(analyticsDataWithDefaults)
      } else {
        const errorText = await response.text()
        console.error('Analytics API error:', response.status, errorText)
        setError(`${t('dashboardSection.failedToLoad')}: ${response.status}`)
        toast.error(`${t('dashboardSection.failedToLoad')}: ${response.status}`)
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
      setError(t('dashboardSection.networkError'))
      toast.error(t('errors.networkError'))
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-cyan-900/30 via-blue-900/20 to-emerald-900/30">
        <div className="text-center">
          <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 mx-auto rounded-full border-b-2 animate-spin border-cyan-400"></div>
          <p className="mt-4 text-white text-sm sm:text-base md:text-lg">{t('dashboardSection.loadingAnalytics')}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-cyan-900/30 via-blue-900/20 to-emerald-900/30">
        <div className="text-center p-4 sm:p-6 md:p-8 bg-red-900/40 rounded-2xl border border-red-500/30 backdrop-blur-xl max-w-lg mx-4">
          <h2 className="text-xl sm:text-2xl md:text-2xl font-bold text-red-300 mb-3 sm:mb-4">{t('dashboardSection.failedToLoad')}</h2>
          <p className="text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base">{error}</p>
          <Button
            onClick={fetchAnalyticsData}
            className="text-white bg-gradient-to-r from-cyan-600 to-blue-600 border-0 shadow-2xl transition-all duration-300 hover:from-cyan-700 hover:to-blue-700 hover:shadow-cyan-500/25 hover:scale-105"
          >
            <Activity className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base">{t('common.retry')}</span>
          </Button>
        </div>
      </div>
    )
  }

  const quickStats = [
    {
      title: t('dashboardSection.totalUsers'),
      value: analyticsData.stats.totalUsers.toLocaleString(),
      icon: Users,
      change: analyticsData.stats.usersGrowth || '0%',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: t('dashboardSection.totalViews'),
      value: analyticsData.stats.totalViews.toLocaleString(),
      icon: Eye,
      change: analyticsData.stats.viewsGrowth || '0%',
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: t('dashboardSection.totalLicenses'),
      value: analyticsData.stats.totalLicenses.toString(),
      icon: Key,
      change: analyticsData.stats.licensesGrowth || '0%',
      color: 'from-orange-500 to-red-500'
    },
    {
      title: t('dashboardSection.totalLogins'),
      value: analyticsData.stats.totalLogins.toString(),
      icon: LogIn,
      change: analyticsData.stats.loginsGrowth || '0%',
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: t('dashboardSection.trialAccountsActive'),
      value: analyticsData.licenseStats?.trialAccountsActive?.toString() || '0',
      icon: UserCheck,
      change: t('dashboardSection.activeNow'),
      color: 'from-indigo-500 to-purple-500'
    },
    {
      title: t('dashboardSection.trialLicensesActive'),
      value: analyticsData.licenseStats?.licenseTrialActive?.toString() || '0',
      icon: Key,
      change: t('dashboardSection.activeNow'),
      color: 'from-cyan-500 to-blue-500'
    },
    {
      title: t('dashboardSection.allActiveLicenses'),
      value: analyticsData.licenseStats?.allLicenseActives?.toString() || '0',
      icon: BarChart3,
      change: t('dashboardSection.activeNow'),
      color: 'from-emerald-500 to-green-500'
    }
  ]

  return (
    <>
    <main className="overflow-x-hidden relative min-h-screen">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/30 via-blue-900/20 to-emerald-900/30"></div>
      <div className="absolute top-1/4 left-1/4 w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 rounded-full blur-2xl sm:blur-3xl bg-cyan-500/20"></div>
      <div className="absolute bottom-1/4 right-1/4 w-40 h-40 sm:w-56 sm:h-56 md:w-72 md:h-72 lg:w-[32rem] lg:h-[32rem] bg-blue-500/15 rounded-full blur-2xl sm:blur-3xl"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-56 h-56 sm:w-72 sm:h-72 md:w-96 md:h-96 lg:w-[40rem] lg:h-[40rem] bg-emerald-500/10 rounded-full blur-2xl sm:blur-3xl"></div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 opacity-40" style={{backgroundImage: "url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='1'%3E%3C/circle%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"}}></div>

      <div className="relative z-10 p-3 sm:p-4 md:p-6 mx-auto space-y-4 sm:space-y-6 md:space-y-8 max-w-7xl">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8 md:mb-10 lg:mb-12 text-center">
          <div className="inline-flex gap-1.5 sm:gap-2 items-center px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 md:py-3 mb-3 sm:mb-4 md:mb-6 bg-gradient-to-r rounded-full border backdrop-blur-sm from-cyan-500/20 to-blue-500/20 border-cyan-500/30">
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-cyan-400" />
            <span className="text-[10px] sm:text-xs md:text-sm font-medium text-cyan-200">{t('dashboardSection.controlCenter')}</span>
          </div>

          <h1 className="mb-2 sm:mb-3 md:mb-4 text-xl sm:text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight">
            <span className="block text-gradient">{t('dashboardSection.title')}</span>
          </h1>

          <p className="mx-auto mb-4 sm:mb-6 md:mb-8 max-w-3xl px-2 sm:px-4 text-xs sm:text-sm md:text-lg lg:text-xl leading-relaxed text-muted">
            {t('dashboardSection.subtitle')}
          </p>

          <Button
            onClick={fetchAnalyticsData}
            size="lg"
            className="text-white bg-gradient-to-r from-cyan-600 to-blue-600 border-0 shadow-2xl transition-all duration-300 hover:from-cyan-700 hover:to-blue-700 hover:shadow-cyan-500/25 hover:scale-105"
          >
            <Activity className="mr-2 w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
            <span className="text-xs sm:text-sm md:text-base">{t('dashboardSection.refreshLive')}</span>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
          {quickStats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div key={index} className="overflow-hidden relative p-4 sm:p-5 md:p-6 lg:p-8 bg-gradient-to-br rounded-2xl border backdrop-blur-sm transition-all duration-500 group from-cyan-900/40 to-purple-800/20 border-cyan-500/20 hover:border-cyan-400/40 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/20">
                <div className="absolute inset-0 bg-gradient-to-br to-transparent opacity-0 transition-opacity duration-500 from-cyan-600/10 group-hover:opacity-100"></div>
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-2">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white" />
                    </div>
                    <div className="flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-1 rounded-full bg-green-500/20 border border-green-500/30">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-400 animate-pulse"></div>
                      <span className="text-[10px] sm:text-xs font-medium text-green-400">{t('common.live')}</span>
                    </div>
                  </div>
                  <h3 className="mb-2 sm:mb-3 text-sm sm:text-base md:text-lg font-bold text-white transition-colors group-hover:text-purple-200">
                    {stat.title}
                  </h3>
                  <div className="mb-1.5 sm:mb-2 text-xl sm:text-2xl md:text-3xl font-bold text-white transition-colors group-hover:text-purple-100">
                    {stat.value}
                  </div>
                  <p className="text-xs sm:text-sm leading-relaxed text-gray-300 transition-colors group-hover:text-gray-200">
                    {stat.change}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Analytics Graphs */}
        <div className="grid grid-cols-1 gap-3 sm:gap-4 md:gap-6 lg:grid-cols-2">
          {/* New Users Graph */}
          <div className="overflow-hidden relative p-3 sm:p-4 md:p-6 lg:p-8 bg-gradient-to-br rounded-2xl border backdrop-blur-sm from-blue-900/60 to-blue-800/30 border-blue-500/20">
            <div className="absolute inset-0 bg-gradient-to-br to-transparent from-blue-600/5"></div>
            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3 mb-3 sm:mb-4 md:mb-6">
                <div className="flex gap-2 sm:gap-3 items-center">
                  <div className="flex justify-center items-center w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-gradient-to-br rounded-lg from-blue-500 to-blue-600">
                    <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base md:text-lg font-bold text-white">{t('dashboardSection.newUsersPerDay')}</h3>
                    <p className="text-[10px] sm:text-xs md:text-sm text-gray-400">{t('dashboardSection.last30Days')} • {t('common.liveData')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-1 rounded-full bg-green-500/20 border border-green-500/30">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-400 animate-pulse"></div>
                  <span className="text-[10px] sm:text-xs font-medium text-green-400">{t('common.live')}</span>
                </div>
              </div>
              <div className="w-full" style={{ height: '180px', minHeight: '180px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analyticsData.newUsersData}>
                    <defs>
                      <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9ca3af" fontSize={10} />
                    <YAxis stroke="#9ca3af" fontSize={10} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                      labelStyle={{ color: '#f3f4f6' }}
                    />
                    <Area type="monotone" dataKey="users" stroke="#3b82f6" fillOpacity={1} fill="url(#colorUsers)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Views Graph */}
          <div className="overflow-hidden relative p-3 sm:p-4 md:p-6 lg:p-8 bg-gradient-to-br rounded-2xl border backdrop-blur-sm from-purple-900/60 to-purple-800/30 border-purple-500/20">
            <div className="absolute inset-0 bg-gradient-to-br to-transparent from-purple-600/5"></div>
            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3 mb-3 sm:mb-4 md:mb-6">
                <div className="flex gap-2 sm:gap-3 items-center">
                  <div className="flex justify-center items-center w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-gradient-to-br rounded-lg from-purple-500 to-purple-600">
                    <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base md:text-lg font-bold text-white">{t('dashboardSection.viewsPerDay')}</h3>
                    <p className="text-[10px] sm:text-xs md:text-sm text-gray-400">{t('dashboardSection.last30Days')} • {t('common.liveData')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-1 rounded-full bg-green-500/20 border border-green-500/30">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-400 animate-pulse"></div>
                  <span className="text-[10px] sm:text-xs font-medium text-green-400">{t('common.live')}</span>
                </div>
              </div>
              <div className="w-full" style={{ height: '180px', minHeight: '180px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analyticsData.viewsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9ca3af" fontSize={10} />
                    <YAxis stroke="#9ca3af" fontSize={10} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                      labelStyle={{ color: '#f3f4f6' }}
                    />
                    <Line type="monotone" dataKey="views" stroke="#a855f7" strokeWidth={2} dot={{ fill: '#a855f7' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* License Rate Graph */}
          <div className="overflow-hidden relative p-3 sm:p-4 md:p-6 lg:p-8 bg-gradient-to-br rounded-2xl border backdrop-blur-sm from-orange-900/60 to-orange-800/30 border-orange-500/20">
            <div className="absolute inset-0 bg-gradient-to-br to-transparent from-orange-600/5"></div>
            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3 mb-3 sm:mb-4 md:mb-6">
                <div className="flex gap-2 sm:gap-3 items-center">
                  <div className="flex justify-center items-center w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-gradient-to-br rounded-lg from-orange-500 to-orange-600">
                    <Key className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base md:text-lg font-bold text-white">{t('dashboardSection.licenseRatePerDay')}</h3>
                    <p className="text-[10px] sm:text-xs md:text-sm text-gray-400">{t('dashboardSection.last30Days')} • {t('common.liveData')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-1 rounded-full bg-green-500/20 border border-green-500/30">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-400 animate-pulse"></div>
                  <span className="text-[10px] sm:text-xs font-medium text-green-400">{t('common.live')}</span>
                </div>
              </div>
              <div className="w-full" style={{ height: '180px', minHeight: '180px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.licenseRateData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9ca3af" fontSize={10} />
                    <YAxis stroke="#9ca3af" fontSize={10} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                      labelStyle={{ color: '#f3f4f6' }}
                    />
                    <Bar dataKey="licenses" fill="#f97316" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Combined Trends Graph */}
          <div className="overflow-hidden relative p-3 sm:p-4 md:p-6 lg:p-8 bg-gradient-to-br rounded-2xl border backdrop-blur-sm from-indigo-900/60 to-indigo-800/30 border-indigo-500/20 lg:col-span-2">
            <div className="absolute inset-0 bg-gradient-to-br to-transparent from-indigo-600/5"></div>
            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3 mb-3 sm:mb-4 md:mb-6">
                <div className="flex gap-2 sm:gap-3 items-center">
                  <div className="flex justify-center items-center w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-gradient-to-br rounded-lg from-indigo-500 to-indigo-600">
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base md:text-lg font-bold text-white">Combined Growth Trends</h3>
                    <p className="text-[10px] sm:text-xs md:text-sm text-gray-400">{t('dashboardSection.last30Days')} · Users & Licenses</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5"><div className="w-3 h-1.5 rounded-full bg-blue-400"/><span className="text-xs text-gray-400">Users</span></div>
                  <div className="flex items-center gap-1.5"><div className="w-3 h-1.5 rounded-full bg-orange-400"/><span className="text-xs text-gray-400">Licenses</span></div>
                </div>
              </div>
              <div className="w-full" style={{ height: '180px', minHeight: '180px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analyticsData.newUsersData.map((d, i) => ({
                    date: d.date,
                    users: d.users,
                    licenses: analyticsData.licenseRateData[i]?.licenses ?? 0,
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9ca3af" fontSize={10} />
                    <YAxis stroke="#9ca3af" fontSize={10} />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} labelStyle={{ color: '#f3f4f6' }} />
                    <Line type="monotone" dataKey="users" stroke="#60a5fa" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="licenses" stroke="#fb923c" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Login Rate Graph */}
          <div className="overflow-hidden relative p-3 sm:p-4 md:p-6 lg:p-8 bg-gradient-to-br rounded-2xl border backdrop-blur-sm from-green-900/60 to-green-800/30 border-green-500/20">
            <div className="absolute inset-0 bg-gradient-to-br to-transparent from-green-600/5"></div>
            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3 mb-3 sm:mb-4 md:mb-6">
                <div className="flex gap-2 sm:gap-3 items-center">
                  <div className="flex justify-center items-center w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-gradient-to-br rounded-lg from-green-500 to-green-600">
                    <LogIn className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base md:text-lg font-bold text-white">{t('dashboardSection.dailyLoginUsers')}</h3>
                    <p className="text-[10px] sm:text-xs md:text-sm text-gray-400">{t('dashboardSection.last30Days')} • {t('common.liveData')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-1 rounded-full bg-green-500/20 border border-green-500/30">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-400 animate-pulse"></div>
                  <span className="text-[10px] sm:text-xs font-medium text-green-400">{t('common.live')}</span>
                </div>
              </div>
              <div className="w-full" style={{ height: '180px', minHeight: '180px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analyticsData.loginRateData}>
                    <defs>
                      <linearGradient id="colorLogins" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9ca3af" fontSize={10} />
                    <YAxis stroke="#9ca3af" fontSize={10} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                      labelStyle={{ color: '#f3f4f6' }}
                    />
                    <Area type="monotone" dataKey="logins" stroke="#10b981" fillOpacity={1} fill="url(#colorLogins)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>

        {/* License Health + Pie */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          {/* License Breakdown Pie */}
          <div className="overflow-hidden relative p-3 sm:p-4 md:p-6 lg:p-8 bg-gradient-to-br rounded-2xl border backdrop-blur-sm from-cyan-900/60 to-cyan-800/30 border-cyan-500/20">
            <div className="absolute inset-0 bg-gradient-to-br to-transparent from-cyan-600/5"></div>
            <div className="relative z-10">
              <div className="flex gap-2 sm:gap-3 items-center mb-4">
                <div className="flex justify-center items-center w-9 h-9 bg-gradient-to-br rounded-lg from-cyan-500 to-cyan-600">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">License Breakdown</h3>
                  <p className="text-[10px] sm:text-xs text-gray-400">Active distribution</p>
                </div>
              </div>
              {(() => {
                const trial = analyticsData.licenseStats?.licenseTrialActive ?? 0
                const all = analyticsData.licenseStats?.allLicenseActives ?? 0
                const paid = Math.max(0, all - trial)
                const pieData = [
                  { name: 'Paid Active', value: paid, color: '#06b6d4' },
                  { name: 'Trial Active', value: trial, color: '#8b5cf6' },
                ]
                return (
                  <div className="flex items-center gap-4">
                    <div style={{ width: 120, height: 120, flexShrink: 0 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={pieData} dataKey="value" innerRadius={30} outerRadius={50} paddingAngle={3}>
                            {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                          </Pie>
                          <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', fontSize: 11 }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-2 flex-1">
                      {pieData.map(d => (
                        <div key={d.name} className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                          <span className="text-xs text-gray-300 flex-1">{d.name}</span>
                          <span className="text-xs font-semibold text-white">{d.value}</span>
                        </div>
                      ))}
                      <div className="pt-1 border-t border-white/10 flex items-center justify-between">
                        <span className="text-xs text-gray-500">Total Active</span>
                        <span className="text-xs font-bold text-cyan-400">{all}</span>
                      </div>
                    </div>
                  </div>
                )
              })()}
            </div>
          </div>

          {/* License Health Bars */}
          <div className="overflow-hidden relative p-3 sm:p-4 md:p-6 lg:p-8 bg-gradient-to-br rounded-2xl border backdrop-blur-sm from-emerald-900/60 to-emerald-800/30 border-emerald-500/20">
            <div className="absolute inset-0 bg-gradient-to-br to-transparent from-emerald-600/5"></div>
            <div className="relative z-10">
              <div className="flex gap-2 sm:gap-3 items-center mb-4">
                <div className="flex justify-center items-center w-9 h-9 bg-gradient-to-br rounded-lg from-emerald-500 to-emerald-600">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">License Health</h3>
                  <p className="text-[10px] sm:text-xs text-gray-400">Current status snapshot</p>
                </div>
              </div>
              {(() => {
                const total = analyticsData.stats.totalLicenses || 1
                const active = analyticsData.licenseStats?.allLicenseActives ?? 0
                const trial = analyticsData.licenseStats?.licenseTrialActive ?? 0
                const trialAccounts = analyticsData.licenseStats?.trialAccountsActive ?? 0
                const rows = [
                  { label: 'Active Licenses', value: active, total, color: 'bg-emerald-500' },
                  { label: 'Trial Licenses', value: trial, total, color: 'bg-purple-500' },
                  { label: 'Trial Accounts', value: trialAccounts, total: analyticsData.stats.totalUsers || 1, color: 'bg-blue-500' },
                ]
                return (
                  <div className="space-y-3">
                    {rows.map(r => (
                      <div key={r.label}>
                        <div className="flex justify-between mb-1">
                          <span className="text-xs text-gray-400">{r.label}</span>
                          <span className="text-xs font-semibold text-white">{r.value}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${r.color} transition-all duration-700`}
                            style={{ width: `${Math.min(100, (r.value / r.total) * 100).toFixed(1)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )
              })()}
            </div>
          </div>

          {/* Growth Comparison */}
          <div className="overflow-hidden relative p-3 sm:p-4 md:p-6 lg:p-8 bg-gradient-to-br rounded-2xl border backdrop-blur-sm from-rose-900/60 to-rose-800/30 border-rose-500/20">
            <div className="absolute inset-0 bg-gradient-to-br to-transparent from-rose-600/5"></div>
            <div className="relative z-10">
              <div className="flex gap-2 sm:gap-3 items-center mb-4">
                <div className="flex justify-center items-center w-9 h-9 bg-gradient-to-br rounded-lg from-rose-500 to-rose-600">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">MoM Growth</h3>
                  <p className="text-[10px] sm:text-xs text-gray-400">Month-over-month change</p>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Users', value: analyticsData.stats.usersGrowth || '0%', icon: Users, positive: !analyticsData.stats.usersGrowth?.startsWith('-') },
                  { label: 'Views', value: analyticsData.stats.viewsGrowth || '0%', icon: Eye, positive: !analyticsData.stats.viewsGrowth?.startsWith('-') },
                  { label: 'Licenses', value: analyticsData.stats.licensesGrowth || '0%', icon: Key, positive: !analyticsData.stats.licensesGrowth?.startsWith('-') },
                  { label: 'Logins', value: analyticsData.stats.loginsGrowth || '0%', icon: LogIn, positive: !analyticsData.stats.loginsGrowth?.startsWith('-') },
                ].map(item => {
                  const Icon = item.icon
                  return (
                    <div key={item.label} className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
                      <div className="flex items-center gap-2">
                        <Icon className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-xs text-gray-300">{item.label}</span>
                      </div>
                      <div className={`flex items-center gap-1 text-xs font-semibold ${item.positive ? 'text-emerald-400' : 'text-red-400'}`}>
                        {item.positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {item.value}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="overflow-hidden relative p-4 sm:p-6 bg-gradient-to-br rounded-2xl border backdrop-blur-sm from-slate-900/80 to-slate-800/40 border-white/10">
          <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
            <ArrowRight className="w-4 h-4 text-cyan-400" />
            Quick Navigation
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
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
                <button
                  key={item.href}
                  onClick={() => router.push(item.href)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border bg-gradient-to-br ${item.color} hover:scale-105 transition-all duration-200`}
                >
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
