'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  Target, 
  Calendar,
  ArrowLeft,
  User,
  BarChart3,
  LineChart,
  Infinity,
  CalendarDays,
  CalendarRange,
  CalendarClock
} from 'lucide-react'
import toast from 'react-hot-toast'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart as RechartsLineChart, Line } from 'recharts'

interface DeveloperSales {
  developerId: string
  developerName: string
  avatarUrl?: string
  totalSales: number
  totalTransactions: number
  averageOrderValue: number
}

interface SalesData {
  period: string
  startDate: string
  endDate: string
  grandTotal: number
  grandTotalTransactions: number
  developers: DeveloperSales[]
}

const PERIOD_OPTIONS = [
  { value: 'alltime', label: 'All Time', icon: Infinity },
  { value: 'year', label: 'This Year', icon: Calendar },
  { value: 'month', label: 'This Month', icon: CalendarDays },
  { value: '14days', label: 'Last 14 Days', icon: CalendarRange },
  { value: 'custom', label: 'Custom Range', icon: Target },
]

export default function DeveloperAnalytics() {
  const router = useRouter()
  const [salesData, setSalesData] = useState<SalesData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')
  const [showCustomDate, setShowCustomDate] = useState(false)

  useEffect(() => {
    loadSalesData()
  }, [selectedPeriod])

  const loadSalesData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('access_token')
      
      if (!token) {
        toast.error('Authentication required')
        router.push('/login')
        return
      }

      let url = `${process.env.NEXT_PUBLIC_API_URL}/developers/analytics/sales?period=${selectedPeriod}`
      
      if (selectedPeriod === 'custom' && customStartDate && customEndDate) {
        url = `${process.env.NEXT_PUBLIC_API_URL}/developers/analytics/sales?startDate=${customStartDate}&endDate=${customEndDate}`
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to load sales data')
      }

      const result = await response.json()
      // API returns { data: { ... } }, extract the inner data
      setSalesData(result.data || result)
    } catch (error) {
      console.error('Error loading sales data:', error)
      toast.error('Failed to load sales data')
    } finally {
      setLoading(false)
    }
  }

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period)
    if (period === 'custom') {
      setShowCustomDate(true)
    } else {
      setShowCustomDate(false)
    }
  }

  const handleCustomDateSubmit = () => {
    if (!customStartDate || !customEndDate) {
      toast.error('Please select both start and end dates')
      return
    }
    loadSalesData()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-16 h-16 rounded-full border-b-2 animate-spin border-cyan-400"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <Button
            variant="ghost"
            onClick={() => router.push('/admin/developers')}
            className="mb-2 text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Developers
          </Button>
          <h1 className="text-3xl font-bold text-white mb-2">Developer Sales Analytics</h1>
          <p className="text-gray-400">
            Track developer performance and sales metrics
            {salesData && (
              <span className="ml-2">
                ({formatDate(salesData.startDate)} - {formatDate(salesData.endDate)})
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Period Selector */}
      <Card className="bg-gradient-to-br from-gray-900/60 to-gray-800/30 border-gray-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-cyan-400" />
            Select Time Period
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
            {PERIOD_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => handlePeriodChange(option.value)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  selectedPeriod === option.value
                    ? 'border-cyan-500 bg-cyan-500/20 text-white'
                    : 'border-gray-700 bg-gray-800/50 text-gray-400 hover:border-cyan-400 hover:text-white'
                }`}
              >
                <div className="mb-2 flex justify-center">
                  <option.icon className="w-8 h-8" />
                </div>
                <div className="text-sm font-semibold">{option.label}</div>
              </button>
            ))}
          </div>

          {showCustomDate && (
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="text-sm text-gray-300 mb-1 block">Start Date</label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                />
              </div>
              <div className="flex-1">
                <label className="text-sm text-gray-300 mb-1 block">End Date</label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                />
              </div>
              <Button
                onClick={handleCustomDateSubmit}
                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
              >
                Apply
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {salesData && (
        <>
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
                  {formatCurrency(salesData.grandTotal)}
                </div>
                <p className="mt-1 text-xs text-gray-400">
                  From {salesData.developers.length} developers
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 border-blue-500/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-300">
                  <ShoppingCart className="w-4 h-4 text-blue-400" />
                  Total Transactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">
                  {salesData.grandTotalTransactions}
                </div>
                <p className="mt-1 text-xs text-gray-400">
                  Completed sales
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-cyan-900/40 to-purple-800/20 border-cyan-500/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-300">
                  <Target className="w-4 h-4 text-cyan-400" />
                  Average Order Value
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">
                  {formatCurrency(
                    salesData.grandTotalTransactions > 0
                      ? salesData.grandTotal / salesData.grandTotalTransactions
                      : 0
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-400">
                  Per transaction
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Developer Rankings Chart */}
          <Card className="bg-gradient-to-br from-gray-900/60 to-gray-800/30 border-gray-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-cyan-400" />
                Developer Sales Comparison
              </CardTitle>
              <CardDescription className="text-gray-400">
                Revenue generated by each developer
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesData.developers}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="developerName" 
                      stroke="#9CA3AF"
                      tick={{ fill: '#9CA3AF' }}
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
                    />
                    <Legend wrapperStyle={{ color: '#9CA3AF' }} />
                    <Bar dataKey="totalSales" fill="#8B5CF6" name="Total Sales" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Developer Cards */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Developer Leaderboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {salesData.developers.map((dev, index) => (
                <Card key={dev.developerId} className="bg-gradient-to-br from-gray-900/60 to-gray-800/30 border-gray-500/20 relative overflow-hidden">
                  {/* Rank Badge */}
                  {index < 3 && (
                    <div className="absolute top-0 right-0">
                      <div className={`px-3 py-1 ${
                        index === 0 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                        index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500' :
                        'bg-gradient-to-r from-orange-600 to-orange-700'
                      } text-white text-xs font-bold rounded-bl-lg`}>
                        #{index + 1}
                      </div>
                    </div>
                  )}
                  
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      {dev.avatarUrl ? (
                        <img src={dev.avatarUrl} alt={dev.developerName} className="w-12 h-12 rounded-full" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
                          <User className="w-6 h-6 text-white" />
                        </div>
                      )}
                      <div>
                        <CardTitle className="text-white text-lg">{dev.developerName}</CardTitle>
                        <p className="text-xs text-gray-400">Developer</p>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Total Revenue</p>
                        <p className="text-lg font-bold text-green-400">{formatCurrency(dev.totalSales)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Sales Count</p>
                        <p className="text-lg font-bold text-blue-400">{dev.totalTransactions}</p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-700">
                      <p className="text-xs text-gray-400 mb-1">Average Order</p>
                      <p className="text-xl font-bold text-cyan-400">
                        {formatCurrency(dev.averageOrderValue)}
                      </p>
                    </div>

                    <Button
                      onClick={() => router.push(`/admin/developers/${dev.developerId}/sales?period=${selectedPeriod}`)}
                      className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
                      size="sm"
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {salesData.developers.length === 0 && (
            <Card className="bg-gradient-to-br from-gray-900/60 to-gray-800/30 border-gray-500/20">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <TrendingUp className="w-16 h-16 text-gray-600 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Sales Data</h3>
                <p className="text-gray-400">No sales found for the selected period</p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}

