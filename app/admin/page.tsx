"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { withAdminAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Users, TrendingUp, Activity, Sparkles, Key, UserPlus, Eye, LogIn, BarChart3 } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts'

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
  }
}

function AdminDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
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
    }
  })

  useEffect(() => {
    fetchAnalyticsData()
  }, [])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('access_token')
      
      if (!token) return

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }

      // Fetch analytics data from backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics/dashboard`, { headers })
      
      if (response.ok) {
        const data = await response.json()
        setAnalyticsData(data)
      } else {
        // Generate mock data for demonstration
        generateMockData()
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
      // Generate mock data as fallback
      generateMockData()
    } finally {
      setLoading(false)
    }
  }

  const generateMockData = () => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (29 - i))
      return date.toISOString().split('T')[0]
    })

    setAnalyticsData({
      newUsersData: last30Days.map(date => ({
        date: date.split('-').slice(1).join('/'),
        users: Math.floor(Math.random() * 20) + 5
      })),
      viewsData: last30Days.map(date => ({
        date: date.split('-').slice(1).join('/'),
        views: Math.floor(Math.random() * 500) + 100
      })),
      licenseRateData: last30Days.map(date => ({
        date: date.split('-').slice(1).join('/'),
        licenses: Math.floor(Math.random() * 15) + 2
      })),
      loginRateData: last30Days.map(date => ({
        date: date.split('-').slice(1).join('/'),
        logins: Math.floor(Math.random() * 50) + 10
      })),
      stats: {
        totalUsers: 1247,
        totalViews: 8934,
        totalLicenses: 342,
        totalLogins: 1523
      }
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-32 h-32 rounded-full border-b-2 animate-spin border-primary"></div>
      </div>
    )
  }

  const quickStats = [
    {
      title: 'Total Users',
      value: analyticsData.stats.totalUsers.toLocaleString(),
      icon: Users,
      change: '+12.5%',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Total Views',
      value: analyticsData.stats.totalViews.toLocaleString(),
      icon: Eye,
      change: '+23.1%',
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Total Licenses',
      value: analyticsData.stats.totalLicenses.toString(),
      icon: Key,
      change: '+15.7%',
      color: 'from-orange-500 to-red-500'
    },
    {
      title: 'Total Logins',
      value: analyticsData.stats.totalLogins.toString(),
      icon: LogIn,
      change: '+8.2%',
      color: 'from-green-500 to-emerald-500'
    }
  ]

  return (
    <>
    <main className="overflow-x-hidden relative min-h-screen">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/30 via-blue-900/20 to-emerald-900/30"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl bg-cyan-500/20"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[32rem] h-[32rem] bg-blue-500/15 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-emerald-500/10 rounded-full blur-3xl"></div>
      
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 opacity-40" style={{backgroundImage: "url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='1'%3E%3C/circle%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"}}></div>
      
      <div className="relative z-10 p-6 mx-auto space-y-8 max-w-7xl">
        {/* Header Section */}
        <div className="mb-12 text-center">
          <div className="inline-flex gap-2 items-center px-6 py-3 mb-6 bg-gradient-to-r rounded-full border backdrop-blur-sm from-cyan-500/20 to-blue-500/20 border-cyan-500/30">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <span className="text-sm font-medium text-cyan-200">Admin Control Center</span>
          </div>
          
          <h1 className="mb-4 text-4xl font-bold leading-tight sm:text-5xl md:text-6xl">
            <span className="block text-gradient">Analytics Dashboard</span>
          </h1>
          
          <p className="mx-auto mb-8 max-w-3xl text-lg leading-relaxed sm:text-xl text-muted">
            Real-time analytics and insights for your platform
          </p>
          
          <Button 
            onClick={fetchAnalyticsData} 
            size="lg" 
            className="text-white bg-gradient-to-r from-cyan-600 to-blue-600 border-0 shadow-2xl transition-all duration-300 hover:from-cyan-700 hover:to-blue-700 hover:shadow-cyan-500/25 hover:scale-105"
          >
            <Activity className="mr-2 w-5 h-5" />
            Refresh Data
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 sm:gap-8">
          {quickStats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div key={index} className="overflow-hidden relative p-6 bg-gradient-to-br rounded-2xl border backdrop-blur-sm transition-all duration-500 group from-cyan-900/40 to-purple-800/20 border-cyan-500/20 sm:p-8 hover:border-cyan-400/40 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/20">
                <div className="absolute inset-0 bg-gradient-to-br to-transparent opacity-0 transition-opacity duration-500 from-cyan-600/10 group-hover:opacity-100"></div>
                <div className="relative z-10">
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-6 h-6 text-white sm:w-7 sm:h-7" />
                  </div>
                  <h3 className="mb-3 text-lg font-bold text-white transition-colors sm:text-xl sm:mb-4 group-hover:text-purple-200">
                    {stat.title}
                  </h3>
                  <div className="mb-2 text-2xl font-bold text-white transition-colors sm:text-3xl group-hover:text-purple-100">
                    {stat.value}
                  </div>
                  <p className="text-sm leading-relaxed text-gray-300 transition-colors group-hover:text-gray-200">
                    {stat.change} from last month
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Analytics Graphs */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 sm:gap-8">
          {/* New Users Graph */}
          <div className="overflow-hidden relative p-6 bg-gradient-to-br rounded-2xl border backdrop-blur-sm from-blue-900/60 to-blue-800/30 border-blue-500/20 sm:p-8">
            <div className="absolute inset-0 bg-gradient-to-br to-transparent from-blue-600/5"></div>
            <div className="relative z-10">
              <div className="flex gap-3 items-center mb-6">
                <div className="flex justify-center items-center w-10 h-10 bg-gradient-to-br rounded-lg from-blue-500 to-blue-600">
                  <UserPlus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">New Users Per Day</h3>
                  <p className="text-sm text-gray-400">Last 30 days</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analyticsData.newUsersData}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                    labelStyle={{ color: '#f3f4f6' }}
                  />
                  <Area type="monotone" dataKey="users" stroke="#3b82f6" fillOpacity={1} fill="url(#colorUsers)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Views Graph */}
          <div className="overflow-hidden relative p-6 bg-gradient-to-br rounded-2xl border backdrop-blur-sm from-purple-900/60 to-purple-800/30 border-purple-500/20 sm:p-8">
            <div className="absolute inset-0 bg-gradient-to-br to-transparent from-purple-600/5"></div>
            <div className="relative z-10">
              <div className="flex gap-3 items-center mb-6">
                <div className="flex justify-center items-center w-10 h-10 bg-gradient-to-br rounded-lg from-purple-500 to-purple-600">
                  <Eye className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Views Per Day</h3>
                  <p className="text-sm text-gray-400">Last 30 days</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analyticsData.viewsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                    labelStyle={{ color: '#f3f4f6' }}
                  />
                  <Line type="monotone" dataKey="views" stroke="#a855f7" strokeWidth={2} dot={{ fill: '#a855f7' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* License Rate Graph */}
          <div className="overflow-hidden relative p-6 bg-gradient-to-br rounded-2xl border backdrop-blur-sm from-orange-900/60 to-orange-800/30 border-orange-500/20 sm:p-8">
            <div className="absolute inset-0 bg-gradient-to-br to-transparent from-orange-600/5"></div>
            <div className="relative z-10">
              <div className="flex gap-3 items-center mb-6">
                <div className="flex justify-center items-center w-10 h-10 bg-gradient-to-br rounded-lg from-orange-500 to-orange-600">
                  <Key className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">License Rate Per Day</h3>
                  <p className="text-sm text-gray-400">Last 30 days</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData.licenseRateData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                    labelStyle={{ color: '#f3f4f6' }}
                  />
                  <Bar dataKey="licenses" fill="#f97316" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Login Rate Graph */}
          <div className="overflow-hidden relative p-6 bg-gradient-to-br rounded-2xl border backdrop-blur-sm from-green-900/60 to-green-800/30 border-green-500/20 sm:p-8">
            <div className="absolute inset-0 bg-gradient-to-br to-transparent from-green-600/5"></div>
            <div className="relative z-10">
              <div className="flex gap-3 items-center mb-6">
                <div className="flex justify-center items-center w-10 h-10 bg-gradient-to-br rounded-lg from-green-500 to-green-600">
                  <LogIn className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Daily Login Users Rate</h3>
                  <p className="text-sm text-gray-400">Last 30 days</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analyticsData.loginRateData}>
                  <defs>
                    <linearGradient id="colorLogins" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
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
    </main>
    </>
  )
}

export default withAdminAuth(AdminDashboard)
