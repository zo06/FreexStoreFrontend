"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { withAdminAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  ArrowLeft, 
  RefreshCw,
  BarChart3,
  PieChart,
  Target,
  Users,
  ShoppingCart,
  CreditCard,
  Calendar,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react'
import toast from 'react-hot-toast'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

interface AccountingStats {
  totalRevenue: number
  totalTransactions: number
  successfulTransactions: number
  failedTransactions: number
  pendingTransactions: number
  refundedAmount: number
  revenueByProvider: { provider: string; total: number }[]
  revenueByMonth: { month: string; total: number }[]
  topScripts: { scriptId: string; scriptName: string; revenue: number; sales: number }[]
}

function AdminAccounting() {
  const router = useRouter()
  const [stats, setStats] = useState<AccountingStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState<'all' | '7d' | '30d' | '90d' | '1y'>('30d')

  useEffect(() => {
    loadAccountingStats()
  }, [dateRange])

  const getDateRangeParams = (): Record<string, string> => {
    const end = new Date()
    let start = new Date()
    
    switch (dateRange) {
      case '7d':
        start.setDate(end.getDate() - 7)
        break
      case '30d':
        start.setDate(end.getDate() - 30)
        break
      case '90d':
        start.setDate(end.getDate() - 90)
        break
      case '1y':
        start.setFullYear(end.getFullYear() - 1)
        break
      default:
        return {}
    }
    
    return {
      startDate: start.toISOString(),
      endDate: end.toISOString()
    }
  }

  const loadAccountingStats = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('access_token')
      
      if (!token) {
        toast.error('Authentication required')
        return
      }

      const params = new URLSearchParams(getDateRangeParams())
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/transactions/stats?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch accounting stats')
      }

      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Failed to load accounting stats:', error)
      toast.error('Failed to load accounting stats')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1)
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br via-cyan-900 from-slate-900 to-slate-900">
        <div className="w-32 h-32 rounded-full border-b-2 border-cyan-400 animate-spin"></div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <p className="mb-4 text-red-400">Failed to load accounting data</p>
        <Button onClick={loadAccountingStats}>Retry</Button>
      </div>
    )
  }

  const successRate = stats.totalTransactions > 0 
    ? (stats.successfulTransactions / stats.totalTransactions * 100).toFixed(1)
    : 0

  // Calculate gross and net revenue properly
  // Gross = total money received (including refunded transactions)
  // Net = Gross - Refunds
  const grossRevenue = stats.totalRevenue + stats.refundedAmount
  const netRevenue = stats.totalRevenue // totalRevenue from backend is already net (completed only)

  return (
    <main className="overflow-hidden relative min-h-screen bg-gradient-to-br via-cyan-900 from-slate-900 to-slate-900">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM5QzkyQUMiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIxLjUiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r via-transparent blur-3xl from-cyan-500/10 to-blue-500/10"></div>
      
      <div className="relative z-10 p-6 mx-auto space-y-6 max-w-7xl">
        {/* Header Section */}
        <div className="p-6 rounded-2xl border shadow-2xl backdrop-blur-xl bg-white/5 border-white/10">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-green-600 to-emerald-500 rounded-xl shadow-lg">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300">Accounting & Analytics</h1>
                <p className="mt-1 text-gray-400">Financial insights and revenue analytics</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as any)}
                className="px-4 py-2 text-white rounded-xl border transition-all duration-300 bg-slate-800/50 border-white/10 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
                <option value="1y">Last Year</option>
                <option value="all">All Time</option>
              </select>
              
              <Button 
                onClick={loadAccountingStats}
                className="text-white bg-gradient-to-r border shadow-lg backdrop-blur-sm transition-all duration-300 from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 border-white/10 hover:shadow-xl hover:scale-105"
              >
                <RefreshCw className="mr-2 w-4 h-4" />
                Refresh
              </Button>
              
              <Button 
                onClick={() => router.push('/admin')} 
                className="text-white bg-gradient-to-r border shadow-lg backdrop-blur-sm transition-all duration-300 from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 border-white/10 hover:shadow-xl hover:scale-105"
              >
                <ArrowLeft className="mr-2 w-4 h-4" />
                Back
              </Button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="p-6 rounded-2xl border shadow-2xl backdrop-blur-xl transition-all duration-300 bg-gradient-to-br from-green-900/40 to-green-800/20 border-green-500/20 hover:bg-green-900/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-400" />
              </div>
              <span className="text-sm font-medium text-gray-300">Net Revenue</span>
            </div>
            <div className={`text-3xl font-bold ${netRevenue >= 0 ? 'text-white' : 'text-red-400'}`}>{formatCurrency(netRevenue)}</div>
            <p className="mt-1 text-xs text-gray-400">
              After {formatCurrency(stats.refundedAmount)} in refunds
            </p>
          </div>

          <div className="p-6 rounded-2xl border shadow-2xl backdrop-blur-xl transition-all duration-300 bg-gradient-to-br from-blue-900/40 to-blue-800/20 border-blue-500/20 hover:bg-blue-900/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <ShoppingCart className="w-5 h-5 text-blue-400" />
              </div>
              <span className="text-sm font-medium text-gray-300">Total Transactions</span>
            </div>
            <div className="text-3xl font-bold text-white">{stats.totalTransactions}</div>
            <p className="mt-1 text-xs text-gray-400">
              {successRate}% success rate
            </p>
          </div>

          <div className="p-6 rounded-2xl border shadow-2xl backdrop-blur-xl transition-all duration-300 bg-gradient-to-br from-cyan-900/40 to-purple-800/20 border-cyan-500/20 hover:bg-cyan-900/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-cyan-500/20 rounded-lg">
                <Target className="w-5 h-5 text-cyan-400" />
              </div>
              <span className="text-sm font-medium text-gray-300">Average Order Value</span>
            </div>
            <div className="text-3xl font-bold text-white">
              {formatCurrency(stats.successfulTransactions > 0 ? stats.totalRevenue / stats.successfulTransactions : 0)}
            </div>
            <p className="mt-1 text-xs text-gray-400">
              Per successful transaction
            </p>
          </div>

          <div className="p-6 rounded-2xl border shadow-2xl backdrop-blur-xl transition-all duration-300 bg-gradient-to-br from-orange-900/40 to-orange-800/20 border-orange-500/20 hover:bg-orange-900/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <TrendingDown className="w-5 h-5 text-orange-400" />
              </div>
              <span className="text-sm font-medium text-gray-300">Refunded Amount</span>
            </div>
            <div className="text-3xl font-bold text-white">{formatCurrency(stats.refundedAmount)}</div>
            <p className="mt-1 text-xs text-gray-400">
              Total refunds issued
            </p>
          </div>
        </div>

        {/* Revenue Charts */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Revenue by Month */}
          <div className="p-6 rounded-2xl border shadow-2xl backdrop-blur-xl bg-white/5 border-white/10">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-semibold text-white">Monthly Revenue</h3>
              </div>
              <p className="text-sm text-gray-400">Revenue trends over time</p>
            </div>
            <div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.revenueByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#94a3b8"
                    tickFormatter={formatMonth}
                  />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: '1px solid #475569',
                      borderRadius: '8px'
                    }}
                    formatter={(value: any) => formatCurrency(value)}
                    labelFormatter={formatMonth}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="total" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    name="Revenue"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Revenue vs Refunds Overview */}
          <div className="p-6 rounded-2xl border shadow-2xl backdrop-blur-xl bg-white/5 border-white/10">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <PieChart className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">Revenue Overview</h3>
              </div>
              <p className="text-sm text-gray-400">Income vs Refunds breakdown</p>
            </div>
            <div>
              <div className="flex flex-col items-center gap-6">
                {/* Donut Chart */}
                <div className="relative w-48 h-48">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="96"
                      cy="96"
                      r="70"
                      fill="none"
                      stroke="rgba(100, 116, 139, 0.2)"
                      strokeWidth="24"
                    />
                    {/* Net Revenue arc (what you kept) */}
                    <circle
                      cx="96"
                      cy="96"
                      r="70"
                      fill="none"
                      stroke="url(#incomeGradientAcc)"
                      strokeWidth="24"
                      strokeDasharray={`${grossRevenue > 0 ? ((netRevenue / grossRevenue) * 440) : 0} 440`}
                      strokeLinecap="round"
                      className="transition-all duration-700"
                    />
                    {/* Refunds arc */}
                    <circle
                      cx="96"
                      cy="96"
                      r="70"
                      fill="none"
                      stroke="url(#refundGradientAcc)"
                      strokeWidth="24"
                      strokeDasharray={`${grossRevenue > 0 ? ((stats.refundedAmount / grossRevenue) * 440) : 0} 440`}
                      strokeDashoffset={`-${grossRevenue > 0 ? ((netRevenue / grossRevenue) * 440) : 0}`}
                      strokeLinecap="round"
                      className="transition-all duration-700"
                    />
                    <defs>
                      <linearGradient id="incomeGradientAcc" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#22c55e" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                      <linearGradient id="refundGradientAcc" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#f97316" />
                        <stop offset="100%" stopColor="#ef4444" />
                      </linearGradient>
                    </defs>
                  </svg>
                  {/* Center text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-xs text-gray-400">Net Revenue</p>
                    <p className={`text-2xl font-bold ${netRevenue >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {formatCurrency(netRevenue)}
                    </p>
                  </div>
                </div>

                {/* Legend Cards */}
                <div className="grid grid-cols-2 gap-4 w-full">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-green-900/30 to-emerald-900/20 border border-green-500/30">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-400"></div>
                      <span className="text-sm text-gray-400">Gross Income</span>
                    </div>
                    <p className="text-xl font-bold text-green-400">{formatCurrency(grossRevenue)}</p>
                    <p className="text-xs text-gray-500">
                      {grossRevenue > 0 ? ((netRevenue / grossRevenue) * 100).toFixed(1) : 0}% kept
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-orange-900/30 to-red-900/20 border border-orange-500/30">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-orange-500 to-red-400"></div>
                      <span className="text-sm text-gray-400">Refunds</span>
                    </div>
                    <p className="text-xl font-bold text-orange-400">{formatCurrency(stats.refundedAmount)}</p>
                    <p className="text-xs text-gray-500">
                      {grossRevenue > 0 ? ((stats.refundedAmount / grossRevenue) * 100).toFixed(1) : 0}% refunded
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Scripts */}
        <div className="p-6 rounded-2xl border shadow-2xl backdrop-blur-xl bg-white/5 border-white/10">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <h3 className="text-lg font-semibold text-white">Top Performing Scripts</h3>
            </div>
            <p className="text-sm text-gray-400">Highest revenue generating scripts</p>
          </div>
          <div>
            <div className="space-y-4">
              {stats.topScripts.slice(0, 10).map((script, index) => (
                <div 
                  key={script.scriptId} 
                  className="flex justify-between items-center p-4 bg-gradient-to-r rounded-xl border from-slate-800/40 to-slate-700/20 border-slate-600/20"
                >
                  <div className="flex items-center gap-4">
                    <div className={`
                      flex justify-center items-center w-10 h-10 rounded-lg font-bold
                      ${index === 0 ? 'bg-gradient-to-br from-yellow-500 to-yellow-600 text-white' : ''}
                      ${index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-500 text-white' : ''}
                      ${index === 2 ? 'bg-gradient-to-br from-orange-600 to-orange-700 text-white' : ''}
                      ${index > 2 ? 'bg-slate-700 text-gray-300' : ''}
                    `}>
                      #{index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-white">{script.scriptName}</p>
                      <p className="text-sm text-gray-400">{script.sales} sales</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-400">{formatCurrency(script.revenue)}</p>
                    <p className="text-xs text-gray-400">
                      {formatCurrency(script.revenue / script.sales)} avg
                    </p>
                  </div>
                </div>
              ))}
              
              {stats.topScripts.length === 0 && (
                <div className="py-8 text-center text-gray-400">
                  No sales data available
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Transaction Status Overview */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="p-6 rounded-2xl border shadow-2xl backdrop-blur-xl transition-all duration-300 bg-gradient-to-br from-green-900/40 to-green-800/20 border-green-500/20 hover:bg-green-900/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <span className="text-sm font-medium text-gray-300">Successful</span>
            </div>
            <div className="text-3xl font-bold text-green-400">{stats.successfulTransactions}</div>
            <p className="mt-1 text-xs text-gray-400">
              {stats.totalTransactions > 0 ? ((stats.successfulTransactions / stats.totalTransactions) * 100).toFixed(1) : 0}% of total
            </p>
          </div>

          <div className="p-6 rounded-2xl border shadow-2xl backdrop-blur-xl transition-all duration-300 bg-gradient-to-br from-yellow-900/40 to-yellow-800/20 border-yellow-500/20 hover:bg-yellow-900/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-400" />
              </div>
              <span className="text-sm font-medium text-gray-300">Pending</span>
            </div>
            <div className="text-3xl font-bold text-yellow-400">{stats.pendingTransactions}</div>
            <p className="mt-1 text-xs text-gray-400">
              {stats.totalTransactions > 0 ? ((stats.pendingTransactions / stats.totalTransactions) * 100).toFixed(1) : 0}% of total
            </p>
          </div>

          <div className="p-6 rounded-2xl border shadow-2xl backdrop-blur-xl transition-all duration-300 bg-gradient-to-br from-red-900/40 to-red-800/20 border-red-500/20 hover:bg-red-900/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <XCircle className="w-5 h-5 text-red-400" />
              </div>
              <span className="text-sm font-medium text-gray-300">Failed</span>
            </div>
            <div className="text-3xl font-bold text-red-400">{stats.failedTransactions}</div>
            <p className="mt-1 text-xs text-gray-400">
              {stats.totalTransactions > 0 ? ((stats.failedTransactions / stats.totalTransactions) * 100).toFixed(1) : 0}% of total
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}

export default withAdminAuth(AdminAccounting)

