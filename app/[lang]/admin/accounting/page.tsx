"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { withAdminAuth } from '@/lib/auth-context'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowLeft,
  RefreshCw,
  BarChart3,
  PieChart,
  Target,
  ShoppingCart,
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

      if (!response.ok) throw new Error('Failed to fetch accounting stats')

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
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[rgba(255,255,255,0.07)] border-t-[#51a2ff] rounded-full animate-spin" />
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col justify-center items-center gap-4">
        <p className="text-red-400">Failed to load accounting data</p>
        <button onClick={loadAccountingStats} className="btn-primary flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    )
  }

  const successRate = stats.totalTransactions > 0
    ? (stats.successfulTransactions / stats.totalTransactions * 100).toFixed(1)
    : 0

  const grossRevenue = stats.totalRevenue + stats.refundedAmount
  const netRevenue = stats.totalRevenue

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <div className="p-4 sm:p-6 mx-auto space-y-4 sm:space-y-6 max-w-7xl">

        {/* Header */}
        <div className="card-base p-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl" style={{ background: 'rgba(81,162,255,0.1)', border: '1px solid rgba(81,162,255,0.2)' }}>
                <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-[#51a2ff]" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Accounting & Analytics</h1>
                <p className="mt-1 text-xs sm:text-sm text-[#555]">Financial insights and revenue analytics</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as any)}
                className="flex-1 px-3 sm:px-4 py-2 text-xs sm:text-sm text-white rounded-xl outline-none focus:ring-1 focus:ring-[#51a2ff]"
                style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
                <option value="1y">Last Year</option>
                <option value="all">All Time</option>
              </select>

              <button
                onClick={loadAccountingStats}
                className="btn-ghost flex items-center justify-center gap-2 flex-1 sm:flex-none"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">Refresh</span>
              </button>

              <button
                onClick={() => router.push('/admin')}
                className="btn-ghost flex items-center justify-center gap-2 flex-1 sm:flex-none"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back</span>
              </button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="card-base p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
                <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-[#888]">Net Revenue</span>
            </div>
            <div className={`text-2xl sm:text-3xl font-bold ${netRevenue >= 0 ? 'text-white' : 'text-red-400'}`}>{formatCurrency(netRevenue)}</div>
            <p className="mt-1 text-[10px] sm:text-xs text-[#555]">After {formatCurrency(stats.refundedAmount)} in refunds</p>
          </div>

          <div className="card-base p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg" style={{ background: 'rgba(81,162,255,0.1)', border: '1px solid rgba(81,162,255,0.2)' }}>
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-[#51a2ff]" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-[#888]">Total Transactions</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white">{stats.totalTransactions}</div>
            <p className="mt-1 text-[10px] sm:text-xs text-[#555]">{successRate}% success rate</p>
          </div>

          <div className="card-base p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg" style={{ background: 'rgba(81,162,255,0.1)', border: '1px solid rgba(81,162,255,0.2)' }}>
                <Target className="w-4 h-4 sm:w-5 sm:h-5 text-[#51a2ff]" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-[#888]">Average Order Value</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white">
              {formatCurrency(stats.successfulTransactions > 0 ? stats.totalRevenue / stats.successfulTransactions : 0)}
            </div>
            <p className="mt-1 text-[10px] sm:text-xs text-[#555]">Per successful transaction</p>
          </div>

          <div className="card-base p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg" style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)' }}>
                <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-[#888]">Refunded Amount</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white">{formatCurrency(stats.refundedAmount)}</div>
            <p className="mt-1 text-[10px] sm:text-xs text-[#555]">Total refunds issued</p>
          </div>
        </div>

        {/* Revenue Charts */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
          {/* Revenue by Month */}
          <div className="card-base p-4 sm:p-6">
            <div className="mb-4 sm:mb-6">
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-[#51a2ff]" />
                <h3 className="text-base sm:text-lg font-semibold text-white">Monthly Revenue</h3>
              </div>
              <p className="text-xs sm:text-sm text-[#555]">Revenue trends over time</p>
            </div>
            <ResponsiveContainer width="100%" height={250} minWidth={280}>
              <LineChart data={stats.revenueByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="month"
                  stroke="#555"
                  tickFormatter={formatMonth}
                  fontSize={10}
                />
                <YAxis stroke="#555" fontSize={10} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: '8px',
                    color: '#ccc'
                  }}
                  formatter={(value: any) => formatCurrency(value)}
                  labelFormatter={formatMonth}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#51a2ff"
                  strokeWidth={2}
                  name="Revenue"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Revenue Overview Donut */}
          <div className="card-base p-4 sm:p-6">
            <div className="mb-4 sm:mb-6">
              <div className="flex items-center gap-2 mb-1">
                <PieChart className="w-4 h-4 sm:w-5 sm:h-5 text-[#51a2ff]" />
                <h3 className="text-base sm:text-lg font-semibold text-white">Revenue Overview</h3>
              </div>
              <p className="text-xs sm:text-sm text-[#555]">Income vs Refunds breakdown</p>
            </div>

            <div className="flex flex-col items-center gap-4 sm:gap-6">
              {/* Donut Chart */}
              <div className="relative w-36 h-36 sm:w-48 sm:h-48">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="96" cy="96" r="70"
                    fill="none"
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="24"
                  />
                  <circle
                    cx="96" cy="96" r="70"
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="24"
                    strokeDasharray={`${grossRevenue > 0 ? ((netRevenue / grossRevenue) * 440) : 0} 440`}
                    strokeLinecap="round"
                    className="transition-all duration-700"
                  />
                  <circle
                    cx="96" cy="96" r="70"
                    fill="none"
                    stroke="#f97316"
                    strokeWidth="24"
                    strokeDasharray={`${grossRevenue > 0 ? ((stats.refundedAmount / grossRevenue) * 440) : 0} 440`}
                    strokeDashoffset={`-${grossRevenue > 0 ? ((netRevenue / grossRevenue) * 440) : 0}`}
                    strokeLinecap="round"
                    className="transition-all duration-700"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-xs text-[#555]">Net Revenue</p>
                  <p className={`text-2xl font-bold ${netRevenue >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {formatCurrency(netRevenue)}
                  </p>
                </div>
              </div>

              {/* Legend Cards */}
              <div className="grid grid-cols-2 gap-4 w-full">
                <div className="card-base p-4" style={{ background: 'rgba(34,197,94,0.04)', border: '1px solid rgba(34,197,94,0.15)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    <span className="text-sm text-[#888]">Gross Income</span>
                  </div>
                  <p className="text-xl font-bold text-emerald-400">{formatCurrency(grossRevenue)}</p>
                  <p className="text-xs text-[#555]">
                    {grossRevenue > 0 ? ((netRevenue / grossRevenue) * 100).toFixed(1) : 0}% kept
                  </p>
                </div>
                <div className="card-base p-4" style={{ background: 'rgba(249,115,22,0.04)', border: '1px solid rgba(249,115,22,0.15)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                    <span className="text-sm text-[#888]">Refunds</span>
                  </div>
                  <p className="text-xl font-bold text-orange-400">{formatCurrency(stats.refundedAmount)}</p>
                  <p className="text-xs text-[#555]">
                    {grossRevenue > 0 ? ((stats.refundedAmount / grossRevenue) * 100).toFixed(1) : 0}% refunded
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Scripts */}
        <div className="card-base p-6">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-semibold text-white">Top Performing Scripts</h3>
            </div>
            <p className="text-sm text-[#555]">Highest revenue generating scripts</p>
          </div>

          <div className="space-y-3">
            {stats.topScripts.slice(0, 10).map((script, index) => (
              <div
                key={script.scriptId}
                className="flex justify-between items-center p-4 rounded-xl"
                style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div className="flex items-center gap-4">
                  <div className={`
                    flex justify-center items-center w-10 h-10 rounded-lg font-bold text-sm
                    ${index === 0 ? 'text-yellow-300' : index === 1 ? 'text-[#bbb]' : index === 2 ? 'text-orange-400' : 'text-[#555]'}
                  `} style={{
                    background: index === 0 ? 'rgba(234,179,8,0.12)' : index === 1 ? 'rgba(200,200,200,0.08)' : index === 2 ? 'rgba(249,115,22,0.12)' : 'rgba(255,255,255,0.04)',
                    border: index === 0 ? '1px solid rgba(234,179,8,0.2)' : index === 1 ? '1px solid rgba(200,200,200,0.12)' : index === 2 ? '1px solid rgba(249,115,22,0.2)' : '1px solid rgba(255,255,255,0.06)'
                  }}>
                    #{index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-white">{script.scriptName}</p>
                    <p className="text-sm text-[#555]">{script.sales} sales</p>
                  </div>
                </div>
                <div className="text-end">
                  <p className="text-lg font-bold text-emerald-400">{formatCurrency(script.revenue)}</p>
                  <p className="text-xs text-[#555]">{formatCurrency(script.revenue / script.sales)} avg</p>
                </div>
              </div>
            ))}

            {stats.topScripts.length === 0 && (
              <div className="py-8 text-center text-[#555]">
                No sales data available
              </div>
            )}
          </div>
        </div>

        {/* Transaction Status Overview */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="card-base p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="text-sm font-medium text-[#888]">Successful</span>
            </div>
            <div className="text-3xl font-bold text-emerald-400">{stats.successfulTransactions}</div>
            <p className="mt-1 text-xs text-[#555]">
              {stats.totalTransactions > 0 ? ((stats.successfulTransactions / stats.totalTransactions) * 100).toFixed(1) : 0}% of total
            </p>
          </div>

          <div className="card-base p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
                <Clock className="w-5 h-5 text-amber-400" />
              </div>
              <span className="text-sm font-medium text-[#888]">Pending</span>
            </div>
            <div className="text-3xl font-bold text-amber-400">{stats.pendingTransactions}</div>
            <p className="mt-1 text-xs text-[#555]">
              {stats.totalTransactions > 0 ? ((stats.pendingTransactions / stats.totalTransactions) * 100).toFixed(1) : 0}% of total
            </p>
          </div>

          <div className="card-base p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <XCircle className="w-5 h-5 text-red-400" />
              </div>
              <span className="text-sm font-medium text-[#888]">Failed</span>
            </div>
            <div className="text-3xl font-bold text-red-400">{stats.failedTransactions}</div>
            <p className="mt-1 text-xs text-[#555]">
              {stats.totalTransactions > 0 ? ((stats.failedTransactions / stats.totalTransactions) * 100).toFixed(1) : 0}% of total
            </p>
          </div>
        </div>

      </div>
    </main>
  )
}

export default withAdminAuth(AdminAccounting)
