"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { withAdminAuth } from '@/lib/auth-context'
import { useTransactionsStore, Transaction } from '@/lib/stores'
import { apiClient } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { AnimatedSelect } from '@/components/ui/animated-select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Download, 
  ArrowLeft, 
  RefreshCw, 
  Calendar,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Search,
  Filter,
  Eye,
  EyeOff,
  RotateCcw,
  User,
  Package,
  Key,
  History,
  FileText,
  Copy
} from 'lucide-react'
import toast from 'react-hot-toast'

function AdminTransactions() {
  const router = useRouter()
  
  // Use Zustand store
  const { 
    items: transactions, 
    loading, 
    error,
    getAll: getTransactions 
  } = useTransactionsStore()

  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [grossRevenue, setGrossRevenue] = useState(0)
  const [monthlyRevenue, setMonthlyRevenue] = useState(0)
  const [totalRefunds, setTotalRefunds] = useState(0)
  
  // Transaction details dialog state
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [userTransactionHistory, setUserTransactionHistory] = useState<Transaction[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  
  // Refund dialog state
  const [isRefundOpen, setIsRefundOpen] = useState(false)
  const [refundAmount, setRefundAmount] = useState<number>(0)
  const [refundNotes, setRefundNotes] = useState('')
  const [isRefunding, setIsRefunding] = useState(false)
  const [showLicenseKey, setShowLicenseKey] = useState(false)

  // Load transactions on mount
  useEffect(() => {
    getTransactions().catch(() => {})
  }, [getTransactions])

  // Update filtered and calculate revenue when transactions change
  useEffect(() => {
    setFilteredTransactions(transactions)
    setTotalPages(Math.ceil(transactions.length / 50))
    
    // Calculate gross revenue (completed + refunded transactions - because refunded were once paid)
    const successfulPayments = transactions.filter((t: Transaction) => 
      t.status === 'completed' || t.status === 'refunded'
    )
    const gross = successfulPayments.reduce((sum: number, t: Transaction) => sum + t.amount, 0)
    setGrossRevenue(gross)
    
    // Calculate refunds
    const refunded = transactions.filter((t: Transaction) => t.status === 'refunded')
    const refundTotal = refunded.reduce((sum: number, t: any) => sum + (t.refundedAmount || t.amount || 0), 0)
    setTotalRefunds(refundTotal)
    
    // Net Revenue = Gross Revenue - Refunds
    setTotalRevenue(gross - refundTotal)
    
    // Calculate monthly revenue (net)
    const now = new Date()
    const monthlyPayments = successfulPayments.filter((t: Transaction) => {
      const transactionDate = new Date(t.createdAt || '')
      return transactionDate.getMonth() === now.getMonth() && 
             transactionDate.getFullYear() === now.getFullYear()
    })
    const monthlyGross = monthlyPayments.reduce((sum: number, t: Transaction) => sum + t.amount, 0)
    const monthlyRefunds = refunded.filter((t: Transaction) => {
      const transactionDate = new Date(t.createdAt || '')
      return transactionDate.getMonth() === now.getMonth() && 
             transactionDate.getFullYear() === now.getFullYear()
    }).reduce((sum: number, t: any) => sum + (t.refundedAmount || t.amount || 0), 0)
    setMonthlyRevenue(monthlyGross - monthlyRefunds)
  }, [transactions])

  useEffect(() => {
    filterTransactions()
  }, [transactions, searchTerm, statusFilter, dateFilter])

  const filterTransactions = () => {
    let filtered = [...transactions]

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(transaction => 
        transaction.orderId?.toLowerCase().includes(search) ||
        transaction.user?.username?.toLowerCase().includes(search) ||
        transaction.user?.email?.toLowerCase().includes(search) ||
        transaction.script?.name?.toLowerCase().includes(search) ||
        transaction.payerEmail?.toLowerCase().includes(search)
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(transaction => transaction.status === statusFilter)
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date()
      filtered = filtered.filter(transaction => {
        const transactionDate = new Date(transaction.createdAt || '')
        switch (dateFilter) {
          case 'today':
            return transactionDate.toDateString() === now.toDateString()
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            return transactionDate >= weekAgo
          case 'month':
            return transactionDate.getMonth() === now.getMonth() && 
                   transactionDate.getFullYear() === now.getFullYear()
          case 'quarter':
            const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1)
            return transactionDate >= quarterStart
          case 'year':
            return transactionDate.getFullYear() === now.getFullYear()
          default:
            return true
        }
      })
    }

    setFilteredTransactions(filtered)
  }

  // Open transaction details dialog and fetch full details
  const handleViewDetails = async (transaction: Transaction) => {
    setSelectedTransaction(transaction) // Show basic info immediately
    setIsDetailsOpen(true)
    setDetailsLoading(true)
    setUserTransactionHistory([])
    setShowLicenseKey(false) // Reset spoiler state
    
    try {
      // Fetch full transaction details
      const response = await apiClient.get<{ data: any }>(`/admin/transactions/${transaction.id}`)
      const fullTransaction = (response as any).data || response
      setSelectedTransaction(fullTransaction)
      
      // Fetch user transaction history if user exists
      if (fullTransaction.userId || transaction.userId) {
        setHistoryLoading(true)
        try {
          const historyResponse = await apiClient.get<{ data: Transaction[] }>(`/admin/transactions/user/${fullTransaction.userId || transaction.userId}`)
          const historyData = (historyResponse as any).data || historyResponse
          setUserTransactionHistory(Array.isArray(historyData) ? historyData : [])
        } catch (err) {
          console.error('Failed to load user history:', err)
          setUserTransactionHistory([])
        } finally {
          setHistoryLoading(false)
        }
      }
    } catch (error) {
      console.error('Failed to load transaction details:', error)
      // Keep showing the basic info if fetch fails
    } finally {
      setDetailsLoading(false)
    }
  }

  // Open refund dialog
  const handleOpenRefund = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setRefundAmount(transaction.amount)
    setRefundNotes('')
    setIsRefundOpen(true)
  }

  // Process refund with confirmation
  const handleRefund = async () => {
    if (!selectedTransaction) return
    
    // Show confirmation before processing
    if (!window.confirm(
      `⚠️ REFUND CONFIRMATION\n\n` +
      `You are about to refund $${refundAmount.toFixed(2)} for transaction:\n` +
      `Order ID: ${selectedTransaction.orderId?.substring(0, 20)}...\n` +
      `Script: ${selectedTransaction.script?.name || 'N/A'}\n\n` +
      `This will:\n` +
      `• Process a refund through Stripe\n` +
      `• Revoke the associated license\n` +
      `• This action cannot be undone\n\n` +
      `Are you sure you want to proceed?`
    )) {
      return
    }
    
    setIsRefunding(true)
    try {
      const response = await apiClient.post<{
        success: boolean;
        data: Transaction;
        message: string;
        refundDetails: {
          stripeRefundId?: string;
          stripeRefundStatus?: string;
          refundedAmount: number;
          licenseRevoked: boolean;
        };
      }>(`/admin/transactions/${selectedTransaction.id}/refund`, {
        amount: refundAmount,
        notes: refundNotes,
        confirmRefund: true // Required security confirmation flag
      })
      
      const result = response as any
      
      toast.success(
        `✅ Refund processed successfully!\n` +
        `Amount: $${result.refundDetails?.refundedAmount || refundAmount}\n` +
        `License Revoked: ${result.refundDetails?.licenseRevoked ? 'Yes' : 'No'}`
      )
      setIsRefundOpen(false)
      getTransactions() // Refresh transactions
    } catch (error: any) {
      console.error('Failed to refund transaction:', error)
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to refund transaction'
      toast.error(`Refund failed: ${errorMessage}`)
    } finally {
      setIsRefunding(false)
    }
  }

  const handleExport = async () => {
    try {
      const token = localStorage.getItem('access_token')
      
      if (!token) {
        toast.error('Authentication required')
        return
      }

      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.append('status', statusFilter)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/transactions/export?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to export transactions')
      }

      const data = await response.json()
      
      // Convert to CSV
      const csvContent = [
        ['Order ID', 'User', 'Script', 'Amount', 'Status', 'Date'].join(','),
        ...data.map((t: any) => [
          t.orderId,
          t.user || 'Unknown',
          t.script || 'N/A',
          `$${t.amount}`,
          t.status,
          new Date(t.createdAt).toLocaleDateString()
        ].join(','))
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`
      link.click()
      
      toast.success('Transactions exported successfully')
    } catch (error) {
      console.error('Failed to export transactions:', error)
      toast.error('Failed to export transactions')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-400" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-400" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-400" />
      case 'cancelled':
        return <AlertCircle className="h-4 w-4 text-gray-400" />
      case 'refunded':
        return <TrendingDown className="h-4 w-4 text-orange-400" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'failed':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'cancelled':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
      case 'refunded':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const formatDate = (dateString: string) => {
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
        <div className="w-32 h-32 rounded-full border-b-2 animate-spin border-primary"></div>
      </div>
    )
  }

  return (
    <main className="overflow-x-hidden relative min-h-screen">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/30 via-blue-900/20 to-emerald-900/30"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl bg-cyan-500/20"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[32rem] h-[32rem] bg-blue-500/15 rounded-full blur-3xl"></div>
      
      <div className="relative z-10 p-6 mx-auto space-y-8 max-w-7xl">
        {/* Header Section */}
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <Button 
              onClick={() => router.push('/admin')} 
              variant="ghost" 
              size="sm"
              className="mb-4 text-cyan-300 hover:text-white hover:bg-cyan-700/50"
            >
              <ArrowLeft className="mr-2 w-4 h-4" />
              Back to Dashboard
            </Button>
            <h1 className="text-4xl font-bold text-gradient">Transaction History</h1>
            <p className="mt-2 text-lg text-muted">Complete financial transaction records</p>
          </div>
          
          <div className="flex gap-3">
            <Button 
              onClick={() => getTransactions()}
              variant="outline"
              className="text-white border-cyan-500/30 hover:bg-cyan-700/50"
            >
              <RefreshCw className="mr-2 w-4 h-4" />
              Refresh
            </Button>
            <Button 
              onClick={handleExport}
              className="text-white bg-gradient-to-r from-green-600 to-emerald-600"
            >
              <Download className="mr-2 w-4 h-4" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="p-6 bg-gradient-to-br rounded-2xl border backdrop-blur-sm from-green-900/40 to-green-800/20 border-green-500/20">
            <div className="flex items-center gap-3">
              <div className="flex justify-center items-center w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Net Revenue</p>
                <p className={`text-2xl font-bold ${totalRevenue >= 0 ? 'text-white' : 'text-red-400'}`}>${totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-gradient-to-br rounded-2xl border backdrop-blur-sm from-blue-900/40 to-blue-800/20 border-blue-500/20">
            <div className="flex items-center gap-3">
              <div className="flex justify-center items-center w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Monthly Revenue</p>
                <p className="text-2xl font-bold text-white">${monthlyRevenue.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-gradient-to-br rounded-2xl border backdrop-blur-sm from-orange-900/40 to-orange-800/20 border-orange-500/20">
            <div className="flex items-center gap-3">
              <div className="flex justify-center items-center w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl">
                <RotateCcw className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Total Refunds</p>
                <p className="text-2xl font-bold text-white">${totalRefunds.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-gradient-to-br rounded-2xl border backdrop-blur-sm from-cyan-900/40 to-purple-800/20 border-cyan-500/20">
            <div className="flex items-center gap-3">
              <div className="flex justify-center items-center w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Transactions</p>
                <p className="text-2xl font-bold text-white">{transactions.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue vs Refunds Chart */}
        <div className="p-6 bg-gradient-to-br rounded-2xl border backdrop-blur-sm from-slate-900/60 to-slate-800/30 border-slate-500/20">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Revenue Overview</h3>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-400"></div>
                <span className="text-gray-400">Income</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-orange-500 to-red-400"></div>
                <span className="text-gray-400">Refunds</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Donut Chart Visualization */}
            <div className="flex items-center justify-center">
              <div className="relative w-40 h-40">
                {/* Background circle */}
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="60"
                    fill="none"
                    stroke="rgba(100, 116, 139, 0.3)"
                    strokeWidth="20"
                  />
                  {/* Net Revenue arc (what you kept) */}
                  <circle
                    cx="80"
                    cy="80"
                    r="60"
                    fill="none"
                    stroke="url(#incomeGradient)"
                    strokeWidth="20"
                    strokeDasharray={`${grossRevenue > 0 ? ((totalRevenue / grossRevenue) * 377) : 0} 377`}
                    strokeLinecap="round"
                    className="transition-all duration-700"
                  />
                  {/* Refunds arc */}
                  <circle
                    cx="80"
                    cy="80"
                    r="60"
                    fill="none"
                    stroke="url(#refundGradient)"
                    strokeWidth="20"
                    strokeDasharray={`${grossRevenue > 0 ? ((totalRefunds / grossRevenue) * 377) : 0} 377`}
                    strokeDashoffset={`-${grossRevenue > 0 ? ((totalRevenue / grossRevenue) * 377) : 0}`}
                    strokeLinecap="round"
                    className="transition-all duration-700"
                  />
                  <defs>
                    <linearGradient id="incomeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#22c55e" />
                      <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                    <linearGradient id="refundGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#f97316" />
                      <stop offset="100%" stopColor="#ef4444" />
                    </linearGradient>
                  </defs>
                </svg>
                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-xs text-gray-400">Net Revenue</p>
                  <p className={`text-xl font-bold ${totalRevenue >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ${totalRevenue.toFixed(0)}
                  </p>
                </div>
              </div>
            </div>

            {/* Gross Income Card */}
            <div className="p-5 rounded-xl bg-gradient-to-br from-green-900/30 to-emerald-900/20 border border-green-500/30">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <span className="text-gray-400 text-sm">Gross Income</span>
              </div>
              <p className="text-3xl font-bold text-green-400 mb-2">${grossRevenue.toFixed(2)}</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-slate-700/50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-500"
                    style={{ width: `${grossRevenue > 0 ? ((totalRevenue / grossRevenue) * 100) : 0}%` }}
                  />
                </div>
                <span className="text-xs text-green-400">
                  {grossRevenue > 0 ? ((totalRevenue / grossRevenue) * 100).toFixed(1) : 0}% kept
                </span>
              </div>
            </div>

            {/* Refunds Card */}
            <div className="p-5 rounded-xl bg-gradient-to-br from-orange-900/30 to-red-900/20 border border-orange-500/30">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-orange-500/20">
                  <TrendingDown className="w-5 h-5 text-orange-400" />
                </div>
                <span className="text-gray-400 text-sm">Total Refunds</span>
              </div>
              <p className="text-3xl font-bold text-orange-400 mb-2">${totalRefunds.toFixed(2)}</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-slate-700/50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-orange-500 to-red-400 rounded-full transition-all duration-500"
                    style={{ width: `${grossRevenue > 0 ? ((totalRefunds / grossRevenue) * 100) : 0}%` }}
                  />
                </div>
                <span className="text-xs text-orange-400">
                  {grossRevenue > 0 ? ((totalRefunds / grossRevenue) * 100).toFixed(1) : 0}% refunded
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="p-6 bg-gradient-to-br rounded-2xl border backdrop-blur-sm from-slate-900/60 to-slate-800/30 border-slate-500/20">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 w-4 h-4 text-gray-400 transform -translate-y-1/2 z-10" />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-white bg-slate-800/50 border-slate-600/30"
              />
            </div>

            <AnimatedSelect
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'completed', label: 'Completed' },
                { value: 'pending', label: 'Pending' },
                { value: 'failed', label: 'Failed' },
                { value: 'cancelled', label: 'Cancelled' },
                { value: 'refunded', label: 'Refunded' },
              ]}
              value={statusFilter}
              onChange={(value) => setStatusFilter(value)}
              placeholder="Filter by status"
            />

            <AnimatedSelect
              options={[
                { value: 'all', label: 'All Time' },
                { value: 'today', label: 'Today' },
                { value: 'week', label: 'This Week' },
                { value: 'month', label: 'This Month' },
                { value: 'quarter', label: 'This Quarter' },
                { value: 'year', label: 'This Year' },
              ]}
              value={dateFilter}
              onChange={(value) => setDateFilter(value)}
              placeholder="Filter by date"
            />
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-hidden p-6 bg-gradient-to-br rounded-2xl border backdrop-blur-sm from-slate-900/60 to-slate-800/30 border-slate-500/20">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-600/20 hover:bg-white/5">
                  <TableHead className="text-gray-300">Order ID</TableHead>
                  <TableHead className="text-gray-300">User</TableHead>
                  <TableHead className="text-gray-300">Script</TableHead>
                  <TableHead className="text-gray-300">Developer</TableHead>
                  <TableHead className="text-gray-300">Amount</TableHead>
                  <TableHead className="text-gray-300">Status</TableHead>
                  <TableHead className="text-gray-300">Date</TableHead>
                  <TableHead className="text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-32 text-center text-gray-400">
                      No transactions found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id} className="border-slate-600/20 hover:bg-white/5">
                      <TableCell className="font-mono text-sm text-gray-300">
                        {transaction.orderId?.substring(0, 16) || 'N/A'}...
                      </TableCell>
                      <TableCell>
                        <div className="text-white">
                          {transaction.user?.username || 'Unknown'}
                        </div>
                        <div className="text-xs text-gray-400">
                          {transaction.user?.email || transaction.payerEmail || 'No email'}
                        </div>
                      </TableCell>
                      <TableCell className="text-white">
                        {transaction.script?.name || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="text-white">
                          {transaction.developerName || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-400">
                          {transaction.type || 'purchase'}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-green-400">
                        ${transaction.amount?.toFixed(2) || '0.00'} {transaction.currency || 'USD'}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(transaction.status)} flex items-center gap-1 w-fit`}>
                          {getStatusIcon(transaction.status)}
                          {transaction.status?.charAt(0).toUpperCase() + transaction.status?.slice(1) || 'Unknown'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-400">
                        {transaction.createdAt ? formatDate(transaction.createdAt) : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleViewDetails(transaction)}
                            className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/20"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {transaction.status === 'completed' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleOpenRefund(transaction)}
                              className="text-orange-400 hover:text-orange-300 hover:bg-orange-500/20"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex gap-2 justify-center items-center mt-6">
              <Button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                variant="outline"
                size="sm"
                className="text-white border-slate-600/30"
              >
                Previous
              </Button>
              <span className="text-white">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                variant="outline"
                size="sm"
                className="text-white border-slate-600/30"
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Transaction Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-gradient-to-br from-slate-900 to-slate-800 border-slate-600/30 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-cyan-400" />
              Transaction Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedTransaction && (
            <div className="relative">
              {/* Loading Overlay */}
              {detailsLoading && (
                <div className="absolute inset-0 bg-slate-900/70 rounded-lg flex items-center justify-center z-10">
                  <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
                </div>
              )}
              
              {/* Amount & Status Header */}
              <div className="flex items-center justify-between p-5 rounded-xl bg-gradient-to-r from-green-900/30 to-emerald-900/20 border border-green-500/20 mb-4">
                <div>
                  <p className="text-sm text-gray-400">Amount</p>
                  <p className="text-4xl font-bold text-green-400">
                    ${selectedTransaction.amount?.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500 uppercase mt-1">{selectedTransaction.currency || 'USD'}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge className={`${getStatusColor(selectedTransaction.status)} px-4 py-2 text-sm font-medium`}>
                    {getStatusIcon(selectedTransaction.status)}
                    <span className="ml-1 capitalize">{selectedTransaction.status}</span>
                  </Badge>
                  {selectedTransaction.status === 'completed' && (
                    <Button
                      size="sm"
                      onClick={() => {
                        setIsDetailsOpen(false)
                        handleOpenRefund(selectedTransaction)
                      }}
                      className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-sm px-4"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Refund
                    </Button>
                  )}
                </div>
              </div>

              {/* Tabs */}
              <Tabs defaultValue="transaction" className="w-full">
                <TabsList className="w-full bg-slate-800/50 border border-slate-600/30 mb-4">
                  <TabsTrigger value="transaction" className="flex-1 data-[state=active]:bg-cyan-600 text-xs">
                    <FileText className="w-3 h-3 mr-1" />
                    Transaction
                  </TabsTrigger>
                  <TabsTrigger value="user" className="flex-1 data-[state=active]:bg-cyan-600 text-xs">
                    <User className="w-3 h-3 mr-1" />
                    User
                  </TabsTrigger>
                  <TabsTrigger value="script" className="flex-1 data-[state=active]:bg-cyan-600 text-xs">
                    <Package className="w-3 h-3 mr-1" />
                    Script
                  </TabsTrigger>
                  <TabsTrigger value="license" className="flex-1 data-[state=active]:bg-cyan-600 text-xs">
                    <Key className="w-3 h-3 mr-1" />
                    License
                  </TabsTrigger>
                  <TabsTrigger value="history" className="flex-1 data-[state=active]:bg-cyan-600 text-xs">
                    <History className="w-3 h-3 mr-1" />
                    History
                  </TabsTrigger>
                </TabsList>

                {/* Transaction Tab */}
                <TabsContent value="transaction" className="space-y-2">
                  <div className="p-4 rounded-lg bg-slate-800/50 space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
                      <span className="text-gray-400">Order ID</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs">{selectedTransaction.orderId || 'N/A'}</span>
                        <button onClick={() => {navigator.clipboard.writeText(selectedTransaction.orderId || ''); toast.success('Copied!')}} className="text-gray-400 hover:text-white">
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
                      <span className="text-gray-400">Payment ID</span>
                      <span className="font-mono text-xs">{selectedTransaction.paymentId || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
                      <span className="text-gray-400">Type</span>
                      <Badge className="bg-blue-500/20 text-blue-400">{selectedTransaction.type || 'purchase'}</Badge>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
                      <span className="text-gray-400">Developer</span>
                      <span className="font-medium">{selectedTransaction.developerName || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
                      <span className="text-gray-400">Created</span>
                      <span className="text-sm">{selectedTransaction.createdAt ? formatDate(selectedTransaction.createdAt) : 'N/A'}</span>
                    </div>
                    {selectedTransaction.description && (
                      <div className="py-2">
                        <span className="text-gray-400 block mb-1">Description</span>
                        <span className="text-sm text-gray-300">{selectedTransaction.description}</span>
                      </div>
                    )}
                    {selectedTransaction.status === 'refunded' && (
                      <div className="p-3 rounded-lg bg-orange-900/20 border border-orange-500/30 mt-2">
                        <div className="flex justify-between items-center">
                          <span className="text-orange-400 text-sm">Refunded Amount</span>
                          <span className="font-bold text-orange-400">${selectedTransaction.refundedAmount?.toFixed(2) || '0.00'}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {selectedTransaction.refundedAt ? formatDate(selectedTransaction.refundedAt) : ''}
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* User Tab */}
                <TabsContent value="user" className="space-y-2">
                  {selectedTransaction.user ? (
                    <div className="p-4 rounded-lg bg-slate-800/50 space-y-3">
                      <div className="flex items-center gap-3 pb-3 border-b border-slate-700/50">
                        {selectedTransaction.user.discordAvatar ? (
                          <img src={selectedTransaction.user.discordAvatar} alt="Avatar" className="w-12 h-12 rounded-full" />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-cyan-600 flex items-center justify-center">
                            <User className="w-6 h-6" />
                          </div>
                        )}
                        <div>
                          <p className="font-bold">{selectedTransaction.user.username}</p>
                          <p className="text-sm text-gray-400">{selectedTransaction.user.email}</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
                        <span className="text-gray-400">User ID</span>
                        <span className="font-mono text-xs">{selectedTransaction.user.id}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
                        <span className="text-gray-400">Name</span>
                        <span>{selectedTransaction.user.firstName} {selectedTransaction.user.lastName}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
                        <span className="text-gray-400">Discord</span>
                        <span>{selectedTransaction.user.discordUsername || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
                        <span className="text-gray-400">Role</span>
                        <Badge className={selectedTransaction.user.role === 'admin' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-gray-500/20 text-gray-400'}>
                          {selectedTransaction.user.role}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-400">Member Since</span>
                        <span className="text-sm">{selectedTransaction.user.createdAt ? formatDate(selectedTransaction.user.createdAt) : 'N/A'}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-gray-400 bg-slate-800/50 rounded-lg">
                      <User className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No user information available</p>
                    </div>
                  )}
                </TabsContent>

                {/* Script Tab */}
                <TabsContent value="script" className="space-y-2">
                  {selectedTransaction.script ? (
                    <div className="p-4 rounded-lg bg-slate-800/50 space-y-3">
                      {selectedTransaction.script.imageUrl && (
                        <div className="pb-3 border-b border-slate-700/50">
                          <img src={selectedTransaction.script.imageUrl} alt="Script" className="w-full h-32 object-cover rounded-lg" />
                        </div>
                      )}
                      <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
                        <span className="text-gray-400">Name</span>
                        <span className="font-bold">{selectedTransaction.script.name}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
                        <span className="text-gray-400">Script ID</span>
                        <span className="font-mono text-xs">{selectedTransaction.script.id}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
                        <span className="text-gray-400">Version</span>
                        <Badge className="bg-blue-500/20 text-blue-400">{selectedTransaction.script.version || '1.0.0'}</Badge>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
                        <span className="text-gray-400">License Type</span>
                        <Badge className="bg-green-500/20 text-green-400">{selectedTransaction.script.licenseType || 'forever'}</Badge>
                      </div>
                      {selectedTransaction.script.description && (
                        <div className="py-2">
                          <span className="text-gray-400 block mb-1">Description</span>
                          <span className="text-sm text-gray-300">{selectedTransaction.script.description}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-gray-400 bg-slate-800/50 rounded-lg">
                      <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No script information available</p>
                    </div>
                  )}
                </TabsContent>

                {/* License Tab */}
                <TabsContent value="license" className="space-y-2">
                  {selectedTransaction.license ? (
                    <div className="p-4 rounded-lg bg-slate-800/50 space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
                        <span className="text-gray-400">License ID</span>
                        <span className="font-mono text-xs">{selectedTransaction.license.id}</span>
                      </div>
                      <div className="py-3 border-b border-slate-700/50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-400">Private Key</span>
                          <button 
                            onClick={() => setShowLicenseKey(!showLicenseKey)}
                            className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                          >
                            {showLicenseKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            {showLicenseKey ? 'Hide' : 'Show'}
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <code className="text-sm bg-slate-700/50 px-3 py-2 rounded-lg flex-1 overflow-x-auto font-mono">
                            {showLicenseKey 
                              ? selectedTransaction.license.privateKey 
                              : '••••••••••••••••••••••••••••••••••••'
                            }
                          </code>
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(selectedTransaction.license.privateKey || '')
                              toast.success('License key copied!')
                            }} 
                            className="p-2 text-gray-400 hover:text-white hover:bg-slate-600/50 rounded-lg transition-colors"
                            title="Copy to clipboard"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
                        <span className="text-gray-400">Status</span>
                        <Badge className={selectedTransaction.license.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                          {selectedTransaction.license.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
                        <span className="text-gray-400">Revoked</span>
                        <Badge className={selectedTransaction.license.isRevoked ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}>
                          {selectedTransaction.license.isRevoked ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
                        <span className="text-gray-400">Expires</span>
                        <span>{selectedTransaction.license.expiresAt ? formatDate(selectedTransaction.license.expiresAt) : 'Never'}</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-400">Created</span>
                        <span className="text-sm">{selectedTransaction.license.createdAt ? formatDate(selectedTransaction.license.createdAt) : 'N/A'}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-gray-400 bg-slate-800/50 rounded-lg">
                      <Key className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No license information available</p>
                    </div>
                  )}
                </TabsContent>

                {/* History Tab */}
                <TabsContent value="history" className="space-y-2">
                  <div className="p-4 rounded-lg bg-slate-800/50">
                    <h4 className="text-sm font-semibold text-gray-300 mb-3">User Transaction History</h4>
                    {historyLoading ? (
                      <div className="flex justify-center py-8">
                        <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin" />
                      </div>
                    ) : userTransactionHistory.length === 0 ? (
                      <div className="p-8 text-center text-gray-400">
                        <History className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No transaction history found</p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-[300px] overflow-y-auto">
                        {userTransactionHistory.map((tx) => (
                          <div 
                            key={tx.id} 
                            className={`p-3 rounded-lg border transition-colors ${
                              tx.id === selectedTransaction.id 
                                ? 'bg-cyan-500/20 border-cyan-500/50' 
                                : 'bg-slate-700/30 border-slate-600/30 hover:bg-slate-700/50'
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium text-sm">{tx.script?.name || 'N/A'}</p>
                                <p className="text-xs text-gray-400">{tx.createdAt ? formatDate(tx.createdAt) : 'N/A'}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-green-400">${tx.amount?.toFixed(2)}</p>
                                <Badge className={`${getStatusColor(tx.status)} text-xs`}>
                                  {tx.status}
                                </Badge>
                              </div>
                            </div>
                            {tx.id === selectedTransaction.id && (
                              <p className="text-xs text-cyan-400 mt-1">← Current transaction</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Refund Dialog */}
      <Dialog open={isRefundOpen} onOpenChange={setIsRefundOpen}>
        <DialogContent className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-600/30 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-orange-400">Refund Transaction</DialogTitle>
            <DialogDescription className="text-gray-400">
              Process a refund for this transaction
            </DialogDescription>
          </DialogHeader>
          
          {selectedTransaction && (
            <div className="space-y-4 mt-4">
              <div className="p-4 rounded-lg bg-slate-800/50">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-400">Original Amount</Label>
                    <p className="text-lg font-bold text-green-400">${selectedTransaction.amount?.toFixed(2)}</p>
                  </div>
                  <div>
                    <Label className="text-gray-400">Script</Label>
                    <p>{selectedTransaction.script?.name || 'N/A'}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <Label htmlFor="refundAmount" className="text-gray-300">Refund Amount</Label>
                <Input
                  id="refundAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  max={selectedTransaction.amount}
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(parseFloat(e.target.value) || 0)}
                  className="mt-1 text-white bg-slate-800/50 border-slate-600/30"
                />
              </div>
              
              <div>
                <Label htmlFor="refundNotes" className="text-gray-300">Notes (Optional)</Label>
                <Input
                  id="refundNotes"
                  value={refundNotes}
                  onChange={(e) => setRefundNotes(e.target.value)}
                  placeholder="Reason for refund..."
                  className="mt-1 text-white bg-slate-800/50 border-slate-600/30"
                />
              </div>
              
              <div className="flex gap-3 justify-end mt-6">
                <Button
                  variant="outline"
                  onClick={() => setIsRefundOpen(false)}
                  className="border-slate-600/30 text-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleRefund}
                  disabled={isRefunding || refundAmount <= 0 || refundAmount > selectedTransaction.amount}
                  className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                >
                  {isRefunding ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Refund ${refundAmount.toFixed(2)}
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  )
}

export default withAdminAuth(AdminTransactions)

