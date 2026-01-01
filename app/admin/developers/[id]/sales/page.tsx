'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  DollarSign, 
  ShoppingCart, 
  Target, 
  TrendingUp,
  User,
  Calendar,
  Package
} from 'lucide-react'
import toast from 'react-hot-toast'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

interface ScriptSales {
  count: number
  revenue: number
}

interface DailySales {
  date: string
  sales: number
  revenue: number
}

interface RecentTransaction {
  id: string
  amount: number
  scriptName: string
  userName: string
  createdAt: string
}

interface SalesStats {
  developer: {
    id: string
    name: string
    avatarUrl?: string
  }
  period: string
  startDate: string
  endDate: string
  totalSales: number
  totalTransactions: number
  averageOrderValue: number
  scriptSales: Record<string, ScriptSales>
  dailySales: DailySales[]
  recentTransactions: RecentTransaction[]
}

const COLORS = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899']

const PERIOD_OPTIONS = [
  { value: 'alltime', label: 'All Time' },
  { value: 'year', label: 'This Year' },
  { value: 'month', label: 'This Month' },
  { value: '14days', label: 'Last 14 Days' },
]

function DeveloperSalesDetailContent() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const developerId = params.id as string
  
  const [salesStats, setSalesStats] = useState<SalesStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState(searchParams.get('period') || 'month')

  useEffect(() => {
    loadSalesStats()
  }, [selectedPeriod])

  const loadSalesStats = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('access_token')
      
      if (!token) {
        toast.error('Authentication required')
        router.push('/login')
        return
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/developers/${developerId}/sales?period=${selectedPeriod}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (!response.ok) {
        throw new Error('Failed to load sales stats')
      }

      const data = await response.json()
      console.log(data)
      setSalesStats(data.data)
    } catch (error) {
      console.error('Error loading sales stats:', error)
      toast.error('Failed to load sales statistics')
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  const formatFullDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-16 h-16 rounded-full border-b-2 animate-spin border-purple-400"></div>
      </div>
    )
  }

  if (!salesStats) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-400">No data available</p>
      </div>
    )
  }

  const scriptSalesData = salesStats.scriptSales 
    ? Object.entries(salesStats.scriptSales).map(([name, data]) => ({
        name,
        revenue: data.revenue,
        sales: data.count
      }))
    : []

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          onClick={() => router.push('/admin/developers/analytics')}
          className="mb-2 text-gray-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Analytics
        </Button>
        
        <div className="flex items-center gap-4 mb-4">
          {salesStats.developer?.avatarUrl ? (
            <img src={salesStats.developer.avatarUrl} alt={salesStats.developer.name} className="w-16 h-16 rounded-full" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold text-white">{salesStats.developer?.name || 'Developer'}</h1>
            <p className="text-gray-400">Sales Performance Dashboard</p>
          </div>
        </div>
      </div>

      {/* Period Selector */}
      <div className="flex gap-2">
        {PERIOD_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => setSelectedPeriod(option.value)}
            className={`px-4 py-2 rounded-lg transition-all ${
              selectedPeriod === option.value
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-green-900/40 to-green-800/20 border-green-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-300">
              <DollarSign className="w-4 h-4 text-green-400" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              {formatCurrency(salesStats.totalSales)}
            </div>
            <p className="mt-1 text-xs text-gray-400">
              {formatDate(salesStats.startDate)} - {formatDate(salesStats.endDate)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 border-blue-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-300">
              <ShoppingCart className="w-4 h-4 text-blue-400" />
              Total Sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              {salesStats.totalTransactions}
            </div>
            <p className="mt-1 text-xs text-gray-400">
              Completed transactions
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 border-purple-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-300">
              <Target className="w-4 h-4 text-purple-400" />
              Avg Order Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              {formatCurrency(salesStats.averageOrderValue)}
            </div>
            <p className="mt-1 text-xs text-gray-400">
              Per transaction
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Sales Trend */}
        <Card className="bg-gradient-to-br from-gray-900/60 to-gray-800/30 border-gray-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              Sales Trend
            </CardTitle>
            <CardDescription className="text-gray-400">
              Daily revenue over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesStats.dailySales || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#9CA3AF"
                    tick={{ fill: '#9CA3AF' }}
                    tickFormatter={formatDate}
                  />
                  <YAxis 
                    stroke="#9CA3AF"
                    tick={{ fill: '#9CA3AF' }}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F3F4F6'
                    }}
                    formatter={(value: any) => formatCurrency(value)}
                    labelFormatter={(label) => formatDate(label)}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="#8B5CF6" strokeWidth={2} dot={{ fill: '#8B5CF6' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Sales by Script */}
        <Card className="bg-gradient-to-br from-gray-900/60 to-gray-800/30 border-gray-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-purple-400" />
              Revenue by Script
            </CardTitle>
            <CardDescription className="text-gray-400">
              Distribution across products
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={scriptSalesData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="revenue"
                  >
                    {scriptSalesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F3F4F6'
                    }}
                    formatter={(value: any) => formatCurrency(value)}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Script Sales Table */}
      <Card className="bg-gradient-to-br from-gray-900/60 to-gray-800/30 border-gray-500/20">
        <CardHeader>
          <CardTitle className="text-white">Script Performance</CardTitle>
          <CardDescription className="text-gray-400">
            Detailed breakdown by script
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-300 font-semibold">Script Name</th>
                  <th className="text-right py-3 px-4 text-gray-300 font-semibold">Sales Count</th>
                  <th className="text-right py-3 px-4 text-gray-300 font-semibold">Revenue</th>
                  <th className="text-right py-3 px-4 text-gray-300 font-semibold">Avg Price</th>
                </tr>
              </thead>
              <tbody>
                {scriptSalesData.length > 0 ? (
                  scriptSalesData.map((script, index) => (
                    <tr key={index} className="border-b border-gray-800 hover:bg-gray-800/50">
                      <td className="py-3 px-4 text-white">{script.name}</td>
                      <td className="py-3 px-4 text-right text-blue-400">{script.sales}</td>
                      <td className="py-3 px-4 text-right text-green-400">{formatCurrency(script.revenue)}</td>
                      <td className="py-3 px-4 text-right text-purple-400">
                        {formatCurrency(script.revenue / script.sales)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-400">
                      No script sales data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card className="bg-gradient-to-br from-gray-900/60 to-gray-800/30 border-gray-500/20">
        <CardHeader>
          <CardTitle className="text-white">Recent Transactions</CardTitle>
          <CardDescription className="text-gray-400">
            Latest 10 sales
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {salesStats.recentTransactions && salesStats.recentTransactions.length > 0 ? (
              salesStats.recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg border border-gray-700">
                <div>
                  <p className="text-white font-medium">{transaction.scriptName}</p>
                  <p className="text-xs text-gray-400">
                    {transaction.userName} • {formatFullDate(transaction.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-green-400 font-semibold">{formatCurrency(transaction.amount)}</p>
                </div>
              </div>
            ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                No recent transactions
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function DeveloperSalesDetail() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-sky-400 mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <DeveloperSalesDetailContent />
    </Suspense>
  )
}
