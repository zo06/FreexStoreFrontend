"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { withAdminAuth } from '@/lib/auth-context'
import { useUsers, useLicenses } from '@/lib/simple-data-fetcher'
import { User, Script, License, DashboardStats } from '@/lib/types/api.types'
import { safeAdminApi } from '@/lib/admin-api'
import { Button } from '@/components/ui/button'
// Removed Card imports as we're using modern glassmorphism design
import { Badge } from '@/components/ui/badge'
// Removed Table imports as we're using modern card layouts
import { Users, DollarSign, FileText, Server, TrendingUp, Activity, AlertCircle, Eye, Edit, Trash2, Plus, Sparkles, Key } from 'lucide-react'

interface QuickStat {
  title: string
  value: string
  icon: React.ElementType
  change: string
  changeType: 'positive' | 'negative' | 'neutral'
  color: string
}

function AdminDashboard() {
  const { data: users, loading: usersLoading, error: usersError, refresh: refreshUsers } = useUsers()
  const { data: licenses, loading: licensesLoading, error: licensesError, refresh: refreshLicenses } = useLicenses()
  const [scripts, setScripts] = useState<Script[]>([])
  const [scriptsLoading, setScriptsLoading] = useState(true)
  const [scriptsError, setScriptsError] = useState<string | null>(null)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [showPopup, setShowPopup] = useState(false)
  const [selectedScript, setSelectedScript] = useState<any>(null)
  const router = useRouter()

  // Get recent data (limit to 5)
  const recentUsers = users?.data ? users.data.slice(0, 5) : []
  const recentScripts = scripts ? scripts.slice(0, 5) : []
  const recentLicenses = licenses?.data ? licenses.data.slice(0, 5) : []
  const loading = usersLoading || scriptsLoading || licensesLoading

  // Fetch scripts using admin API
  const fetchScripts = async () => {
    try {
      setScriptsLoading(true)
      setScriptsError(null)
      const scriptsData = await safeAdminApi.scripts.getAll()
      setScripts(scriptsData || [])
    } catch (error) {
      console.error('Failed to fetch scripts:', error)
      setScriptsError(error instanceof Error ? error.message : 'Failed to fetch scripts')
    } finally {
      setScriptsLoading(false)
    }
  }

  const refreshScripts = () => {
    fetchScripts()
  }

  useEffect(() => {
    fetchScripts()
  }, [])

  useEffect(() => {
    if (users?.data && scripts && licenses?.data) {
      // Create stats from actual data
      const statsData = {
        totalUsers: users.data.length,
        activeUsers: users.data.filter(user => user.isActive).length,
        totalScripts: scripts.length,
        activeScripts: scripts.filter(script => script.isActive).length,
        totalLicenses: licenses.data.length,
        activeLicenses: licenses.data.filter(license => license.isActive).length,
        totalRevenue: scripts.reduce((sum, script) => sum + (script.price || 0), 0),
        monthlyRevenue: 0
      }
      setStats(statsData as DashboardStats)
    }
  }, [users, scripts, licenses])

  const loadDashboardData = async () => {
    refreshUsers()
    refreshScripts()
    refreshLicenses()
  }

  const handleScriptAction = (script: any, action: string) => {
    setSelectedScript({ ...script, action })
    setShowPopup(true)
  }

  const closePopup = () => {
    setShowPopup(false)
    setSelectedScript(null)
  }

  const quickStats: QuickStat[] = stats ? [
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      change: '+12.5%',
      changeType: 'positive',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      change: '+23.1%',
      changeType: 'positive',
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Active Scripts',
      value: stats.activeScripts.toString(),
      icon: FileText,
      change: '+8.2%',
      changeType: 'positive',
      color: 'from-cyan-500 to-pink-500'
    },
    {
      title: 'Total Licenses',
      value: stats.totalLicenses.toString(),
      icon: Server,
      change: '+15.7%',
      changeType: 'positive',
      color: 'from-orange-500 to-red-500'
    }
  ] : []

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-500">Active</Badge>
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>
      case 'banned':
        return <Badge variant="destructive">Banned</Badge>
      case 'draft':
        return <Badge variant="outline">Draft</Badge>
      case 'archived':
        return <Badge variant="secondary">Archived</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-32 h-32 rounded-full border-b-2 animate-spin border-primary"></div>
      </div>
    )
  }

  return (
    <>
    <main className="overflow-x-hidden relative min-h-screen">
      {/* Background Elements - No animations */}
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
            <span className="block text-gradient">Admin Dashboard</span>
          </h1>
          
          <p className="mx-auto mb-8 max-w-3xl text-lg leading-relaxed sm:text-xl text-muted">
            Manage your platform's users, scripts, and licenses with powerful admin tools
          </p>
          
          <Button 
            onClick={loadDashboardData} 
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

        {/* Quick Actions */}
        {/* <div className="grid grid-cols-1 gap-6 md:grid-cols-3 sm:gap-8">
          <div className="overflow-hidden relative p-6 bg-gradient-to-br rounded-2xl border backdrop-blur-sm transition-all duration-500 group from-blue-900/40 to-blue-800/20 border-blue-500/20 sm:p-8 hover:border-blue-400/40 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20">
            <div className="absolute inset-0 bg-gradient-to-br to-transparent opacity-0 transition-opacity duration-500 from-blue-600/10 group-hover:opacity-100"></div>
            <div className="relative z-10">
              <div className="flex justify-center items-center mb-4 w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl transition-transform duration-300 sm:w-14 sm:h-14 sm:mb-6 group-hover:scale-110">
                <Users className="w-6 h-6 text-white sm:w-7 sm:h-7" />
              </div>
              <h3 className="mb-3 text-lg font-bold text-white transition-colors sm:text-xl sm:mb-4 group-hover:text-blue-200">
                User Management
              </h3>
              <p className="mb-6 text-sm leading-relaxed text-gray-300 transition-colors sm:text-base group-hover:text-gray-200">
                Manage user accounts and permissions
              </p>
              <Button 
                onClick={() => router.push('/admin/users')} 
                className="w-full text-white bg-gradient-to-r from-blue-600 to-blue-700 border-0 shadow-lg transition-all duration-300 hover:from-blue-700 hover:to-blue-800 hover:shadow-blue-500/25"
              >
                <Eye className="mr-2 w-4 h-4" />
                View Users
              </Button>
            </div>
          </div>

          <div className="overflow-hidden relative p-6 bg-gradient-to-br rounded-2xl border backdrop-blur-sm transition-all duration-500 group from-emerald-900/40 to-emerald-800/20 border-emerald-500/20 sm:p-8 hover:border-emerald-400/40 hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/20">
            <div className="absolute inset-0 bg-gradient-to-br to-transparent opacity-0 transition-opacity duration-500 from-emerald-600/10 group-hover:opacity-100"></div>
            <div className="relative z-10">
              <div className="flex justify-center items-center mb-4 w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl transition-transform duration-300 sm:w-14 sm:h-14 sm:mb-6 group-hover:scale-110">
                <FileText className="w-6 h-6 text-white sm:w-7 sm:h-7" />
              </div>
              <h3 className="mb-3 text-lg font-bold text-white transition-colors sm:text-xl sm:mb-4 group-hover:text-emerald-200">
                Script Management
              </h3>
              <p className="mb-6 text-sm leading-relaxed text-gray-300 transition-colors sm:text-base group-hover:text-gray-200">
                Manage scripts and their configurations
              </p>
              <div className="space-y-3">
                <Button 
                  onClick={() => router.push('/admin/scripts')} 
                  className="w-full text-white bg-gradient-to-r from-emerald-600 to-emerald-700 border-0 shadow-lg transition-all duration-300 hover:from-emerald-700 hover:to-emerald-800 hover:shadow-emerald-500/25"
                >
                  <Eye className="mr-2 w-4 h-4" />
                  View Scripts
                </Button>
                <Button 
                  onClick={() => router.push('/admin/scripts?action=new')} 
                  className="w-full text-white bg-gradient-to-r from-emerald-500 to-emerald-600 border-0 shadow-lg transition-all duration-300 hover:from-emerald-600 hover:to-emerald-700 hover:shadow-emerald-500/25"
                >
                  <Plus className="mr-2 w-4 h-4" />
                  Add New Script
                </Button>
              </div>
            </div>
          </div>

          <div className="overflow-hidden relative p-6 bg-gradient-to-br rounded-2xl border backdrop-blur-sm transition-all duration-500 group from-amber-900/40 to-amber-800/20 border-amber-500/20 sm:p-8 hover:border-amber-400/40 hover:scale-105 hover:shadow-2xl hover:shadow-amber-500/20">
            <div className="absolute inset-0 bg-gradient-to-br to-transparent opacity-0 transition-opacity duration-500 from-amber-600/10 group-hover:opacity-100"></div>
            <div className="relative z-10">
              <div className="flex justify-center items-center mb-4 w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl transition-transform duration-300 sm:w-14 sm:h-14 sm:mb-6 group-hover:scale-110">
                <Server className="w-6 h-6 text-white sm:w-7 sm:h-7" />
              </div>
              <h3 className="mb-3 text-lg font-bold text-white transition-colors sm:text-xl sm:mb-4 group-hover:text-amber-200">
                License Management
              </h3>
              <p className="mb-6 text-sm leading-relaxed text-gray-300 transition-colors sm:text-base group-hover:text-gray-200">
                Manage user licenses and activations
              </p>
              <Button 
                onClick={() => router.push('/admin/licenses')} 
                className="w-full text-white bg-gradient-to-r from-amber-600 to-amber-700 border-0 shadow-lg transition-all duration-300 hover:from-amber-700 hover:to-amber-800 hover:shadow-amber-500/25"
              >
                <Eye className="mr-2 w-4 h-4" />
                View Licenses
              </Button>
            </div>
          </div>

          <div className="overflow-hidden relative p-6 bg-gradient-to-br rounded-2xl border backdrop-blur-sm transition-all duration-500 group from-green-900/40 to-green-800/20 border-green-500/20 sm:p-8 hover:border-green-400/40 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/20">
            <div className="absolute inset-0 bg-gradient-to-br to-transparent opacity-0 transition-opacity duration-500 from-green-600/10 group-hover:opacity-100"></div>
            <div className="relative z-10">
              <div className="flex justify-center items-center mb-4 w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl transition-transform duration-300 sm:w-14 sm:h-14 sm:mb-6 group-hover:scale-110">
                <DollarSign className="w-6 h-6 text-white sm:w-7 sm:h-7" />
              </div>
              <h3 className="mb-3 text-lg font-bold text-white transition-colors sm:text-xl sm:mb-4 group-hover:text-green-200">
                Transactions
              </h3>
              <p className="mb-6 text-sm leading-relaxed text-gray-300 transition-colors sm:text-base group-hover:text-gray-200">
                View and manage all payment transactions
              </p>
              <Button 
                onClick={() => router.push('/admin/transactions')} 
                className="w-full text-white bg-gradient-to-r from-green-600 to-green-700 border-0 shadow-lg transition-all duration-300 hover:from-green-700 hover:to-green-800 hover:shadow-green-500/25"
              >
                <Eye className="mr-2 w-4 h-4" />
                View Transactions
              </Button>
            </div>
          </div>

          <div className="overflow-hidden relative p-6 bg-gradient-to-br rounded-2xl border backdrop-blur-sm transition-all duration-500 group from-cyan-900/40 to-purple-800/20 border-cyan-500/20 sm:p-8 hover:border-cyan-400/40 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/20">
            <div className="absolute inset-0 bg-gradient-to-br to-transparent opacity-0 transition-opacity duration-500 from-cyan-600/10 group-hover:opacity-100"></div>
            <div className="relative z-10">
              <div className="flex justify-center items-center mb-4 w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl transition-transform duration-300 sm:w-14 sm:h-14 sm:mb-6 group-hover:scale-110">
                <TrendingUp className="w-6 h-6 text-white sm:w-7 sm:h-7" />
              </div>
              <h3 className="mb-3 text-lg font-bold text-white transition-colors sm:text-xl sm:mb-4 group-hover:text-purple-200">
                Accounting
              </h3>
              <p className="mb-6 text-sm leading-relaxed text-gray-300 transition-colors sm:text-base group-hover:text-gray-200">
                Financial analytics and revenue insights
              </p>
              <Button 
                onClick={() => router.push('/admin/accounting')} 
                className="w-full text-white bg-gradient-to-r from-cyan-600 to-cyan-700 border-0 shadow-lg transition-all duration-300 hover:from-cyan-700 hover:to-purple-800 hover:shadow-cyan-500/25"
              >
                <Eye className="mr-2 w-4 h-4" />
                View Analytics
              </Button>
            </div>
          </div>
        </div> */}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 sm:gap-8">
        {/* Recent Users */}
        <div className="overflow-hidden relative p-6 bg-gradient-to-br rounded-2xl border backdrop-blur-sm transition-all duration-500 from-slate-900/60 to-slate-800/30 border-slate-500/20 sm:p-8 hover:border-slate-400/40">
          <div className="absolute inset-0 bg-gradient-to-br to-transparent from-slate-600/5"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-6">
              <div className="flex gap-3 items-center">
                <div className="flex justify-center items-center w-10 h-10 bg-gradient-to-br rounded-lg from-slate-500 to-slate-600">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Recent Users</h3>
                  <p className="text-sm text-gray-400">Latest user registrations</p>
                </div>
              </div>
              <Button 
                onClick={() => router.push('/admin/users')}
                variant="ghost" 
                size="sm"
                className="text-slate-300 hover:text-white hover:bg-slate-700/50"
              >
                View All
              </Button>
            </div>
            <div className="space-y-3">
              {recentUsers.map((user) => (
                <div key={user.id} className="flex justify-between items-center p-4 bg-gradient-to-r rounded-xl border transition-all duration-300 from-slate-800/40 to-slate-700/20 border-slate-600/20 hover:border-slate-500/40">
                  <div>
                    <p className="font-medium text-white">{user.username}</p>
                    <p className="text-sm text-gray-400">{user.email}</p>
                  </div>
                  <div className="flex gap-2 items-center">
                    {getStatusBadge(user.isActive ? 'active' : 'inactive')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Scripts */}
        <div className="overflow-hidden relative p-6 bg-gradient-to-br rounded-2xl border backdrop-blur-sm transition-all duration-500 from-emerald-900/60 to-emerald-800/30 border-emerald-500/20 sm:p-8 hover:border-emerald-400/40">
          <div className="absolute inset-0 bg-gradient-to-br to-transparent from-emerald-600/5"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-6">
              <div className="flex gap-3 items-center">
                <div className="flex justify-center items-center w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Recent Scripts</h3>
                  <p className="text-sm text-gray-400">Latest script uploads</p>
                </div>
              </div>
              <Button 
                onClick={() => router.push('/admin/scripts')}
                variant="ghost" 
                size="sm"
                className="text-emerald-300 hover:text-white hover:bg-emerald-700/50"
              >
                View All
              </Button>
            </div>
            <div className="space-y-3">
              {scriptsError ? (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <AlertCircle className="w-12 h-12 mb-4 text-red-400" />
                  <p className="text-red-300 mb-2">Failed to load scripts</p>
                  <p className="text-sm text-gray-400 mb-4">{scriptsError}</p>
                  <Button 
                    onClick={refreshScripts}
                    variant="outline"
                    size="sm"
                    className="text-emerald-300 border-emerald-600 hover:bg-emerald-700/50"
                  >
                    Try Again
                  </Button>
                </div>
              ) : scriptsLoading ? (
                <div className="flex justify-center items-center p-8">
                  <div className="w-8 h-8 rounded-full border-b-2 animate-spin border-emerald-400"></div>
                </div>
              ) : recentScripts.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <FileText className="w-12 h-12 mb-4 text-emerald-400/50" />
                  <p className="text-emerald-300 mb-2">No scripts found</p>
                  <p className="text-sm text-gray-400 mb-4">Create your first script to get started</p>
                  <Button 
                    onClick={() => router.push('/admin/scripts/new')}
                    variant="outline"
                    size="sm"
                    className="text-emerald-300 border-emerald-600 hover:bg-emerald-700/50"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Script
                  </Button>
                </div>
              ) : (
                recentScripts.map((script) => (
                  <div key={script.id} className="flex justify-between items-center p-4 bg-gradient-to-r rounded-xl border transition-all duration-300 from-emerald-800/40 to-emerald-700/20 border-emerald-600/20 hover:border-emerald-500/40">
                    <div className="flex-1">
                      <p className="font-medium text-white">{script.name}</p>
                      <div className="flex gap-3 items-center mt-1">
                        <p className="text-sm font-semibold text-emerald-300">${script.price}</p>
                        {getStatusBadge(script.isActive ? 'active' : 'draft')}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleScriptAction(script, 'view')}
                        className="p-2 text-emerald-300 hover:text-white hover:bg-emerald-700/50"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleScriptAction(script, 'edit')}
                        className="p-2 text-emerald-300 hover:text-white hover:bg-emerald-700/50"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleScriptAction(script, 'delete')}
                        className="p-2 text-red-300 hover:text-white hover:bg-red-700/50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>


      </div>
      
      {/* Popup Modal */}
      {showPopup && selectedScript && (
        <div className="flex fixed inset-0 z-50 justify-center items-center p-4 backdrop-blur-sm bg-black/60">
          <div className="overflow-hidden relative p-6 mx-4 w-full max-w-md bg-gradient-to-br rounded-2xl border shadow-2xl backdrop-blur-xl from-slate-900/95 to-slate-800/95 border-slate-500/30">
            <div className="absolute inset-0 bg-gradient-to-br to-transparent from-slate-600/10"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Script Action</h3>
                <button 
                  onClick={closePopup}
                  className="p-2 text-gray-400 rounded-lg transition-colors hover:text-white hover:bg-slate-700/50"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mb-6">
                <div className="flex gap-3 items-center mb-4">
                  <div className="flex justify-center items-center w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white">{selectedScript.name || selectedScript.title}</h4>
                    <p className="text-sm text-gray-400">{selectedScript.category?.name || 'Script'}</p>
                  </div>
                </div>
                
                <div className="p-4 mb-4 bg-gradient-to-r rounded-xl border from-slate-800/40 to-slate-700/20 border-slate-600/20">
                  <p className="mb-2 text-sm text-gray-300">
                    Action: <span className="font-semibold text-emerald-400">{selectedScript.action}</span>
                  </p>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-emerald-400">${selectedScript.price}</span>
                    {selectedScript.isActive !== undefined && (
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                        selectedScript.isActive 
                          ? 'bg-green-600/20 text-green-400 border border-green-500/30' 
                          : 'bg-slate-600/20 text-slate-400 border border-slate-500/30'
                      }`}>
                        {selectedScript.isActive ? 'Active' : 'Draft'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button 
                  onClick={() => {
                    console.log(`${selectedScript.action} script:`, selectedScript);
                    closePopup();
                  }}
                  className="flex-1 text-white bg-gradient-to-r from-emerald-600 to-emerald-700 border-0 shadow-lg transition-all duration-300 hover:from-emerald-700 hover:to-emerald-800 hover:shadow-emerald-500/25"
                >
                  Confirm {selectedScript.action}
                </Button>
                <Button 
                  onClick={closePopup}
                  className="text-white bg-gradient-to-r border-0 shadow-lg transition-all duration-300 from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
    </>
  )
}

export default withAdminAuth(AdminDashboard)
