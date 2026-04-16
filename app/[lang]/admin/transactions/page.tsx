"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { withAdminAuth } from '@/lib/auth-context'
import { useTransactionsStore, Transaction } from '@/lib/stores'
import { apiClient } from '@/lib/api'
import { AnimatedSelect } from '@/components/ui/animated-select'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Download,
  ArrowLeft,
  RefreshCw,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Search,
  Eye,
  EyeOff,
  RotateCcw,
  User,
  Package,
  Key,
  History,
  FileText,
  Copy,
  ShoppingCart,
  ExternalLink,
  Layers,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import toast from 'react-hot-toast'

function AdminTransactions() {
  const router = useRouter()

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
  const [activeTab, setActiveTab] = useState('transaction')

  // Refund dialog state
  const [isRefundOpen, setIsRefundOpen] = useState(false)
  const [refundAmount, setRefundAmount] = useState<number>(0)
  const [refundNotes, setRefundNotes] = useState('')
  const [isRefunding, setIsRefunding] = useState(false)
  const [showLicenseKey, setShowLicenseKey] = useState(false)

  // Cart state
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [cartItems, setCartItems] = useState<any[]>([])
  const [cartLoading, setCartLoading] = useState(false)
  const [cartOrderId, setCartOrderId] = useState('')

  // Cart History view
  const [showCartHistory, setShowCartHistory] = useState(false)
  const [cartHistory, setCartHistory] = useState<any[]>([])
  const [cartHistoryLoading, setCartHistoryLoading] = useState(false)
  const [cartHistoryPage, setCartHistoryPage] = useState(1)
  const [cartHistoryTotalPages, setCartHistoryTotalPages] = useState(1)
  const [expandedCart, setExpandedCart] = useState<string | null>(null)

  // User current Stripe cart
  const [userCurrentCart, setUserCurrentCart] = useState<any>(null)
  const [currentCartLoading, setCurrentCartLoading] = useState(false)

  // Inline cart items inside details dialog
  const [dialogCartItems, setDialogCartItems] = useState<any[]>([])
  const [dialogCartLoading, setDialogCartLoading] = useState(false)

  // Inline invoice details inside details dialog
  const [dialogInvoice, setDialogInvoice] = useState<any>(null)
  const [dialogInvoiceLoading, setDialogInvoiceLoading] = useState(false)

  useEffect(() => {
    getTransactions().catch(() => {})
  }, [getTransactions])

  useEffect(() => {
    setFilteredTransactions(transactions)
    setTotalPages(Math.ceil(transactions.length / 50))

    const successfulPayments = transactions.filter((t: Transaction) =>
      t.status === 'completed' || t.status === 'refunded'
    )
    const gross = successfulPayments.reduce((sum: number, t: Transaction) => sum + t.amount, 0)
    setGrossRevenue(gross)

    const refunded = transactions.filter((t: Transaction) => t.status === 'refunded')
    const refundTotal = refunded.reduce((sum: number, t: any) => sum + (t.refundedAmount || t.amount || 0), 0)
    setTotalRefunds(refundTotal)

    setTotalRevenue(gross - refundTotal)

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

    if (statusFilter !== 'all') {
      filtered = filtered.filter(transaction => transaction.status === statusFilter)
    }

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

  const handleViewDetails = async (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setIsDetailsOpen(true)
    setDetailsLoading(true)
    setUserTransactionHistory([])
    setShowLicenseKey(false)
    setUserCurrentCart(null)
    setDialogCartItems([])
    setDialogInvoice(null)

    const defaultTab = (transaction as any).metadata?.isCartPurchase ? 'cart'
      : (transaction as any).metadata?.invoiceId ? 'invoice'
      : 'transaction'
    setActiveTab(defaultTab)

    try {
      const response = await apiClient.get<{ data: any }>(`/admin/transactions/${transaction.id}`)
      const fullTransaction = (response as any).data || response
      setSelectedTransaction(fullTransaction)

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

      if ((fullTransaction.metadata as any)?.isCartPurchase && fullTransaction.orderId) {
        setDialogCartLoading(true)
        apiClient.get<any[]>(`/transactions/carts/${fullTransaction.orderId}`)
          .then((res) => setDialogCartItems(Array.isArray(res) ? res : []))
          .catch(() => setDialogCartItems([]))
          .finally(() => setDialogCartLoading(false))
      }

      const meta = (fullTransaction.metadata || (transaction as any).metadata) as any
      if (meta?.invoiceId) {
        setDialogInvoiceLoading(true)
        apiClient.get<any>(`/admin/invoices/${meta.invoiceId}`)
          .then((res) => setDialogInvoice(res))
          .catch(() => setDialogInvoice(null))
          .finally(() => setDialogInvoiceLoading(false))
      }
    } catch (error) {
      console.error('Failed to load transaction details:', error)
    } finally {
      setDetailsLoading(false)
    }
  }

  const handleOpenRefund = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setRefundAmount(transaction.amount)
    setRefundNotes('')
    setIsRefundOpen(true)
  }

  const handleRefund = async () => {
    if (!selectedTransaction) return

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
        confirmRefund: true
      })

      const result = response as any
      toast.success(
        `Refund processed successfully!\n` +
        `Amount: $${result.refundDetails?.refundedAmount || refundAmount}\n` +
        `License Revoked: ${result.refundDetails?.licenseRevoked ? 'Yes' : 'No'}`
      )
      setIsRefundOpen(false)
      getTransactions()
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
        headers: { 'Authorization': `Bearer ${token}` },
      })

      if (!response.ok) throw new Error('Failed to export transactions')

      const data = await response.json()
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

  const handleViewCart = async (orderId: string) => {
    setCartOrderId(orderId)
    setIsCartOpen(true)
    setCartLoading(true)
    try {
      const res = await apiClient.get<any[]>(`/transactions/carts/${orderId}`)
      setCartItems(Array.isArray(res) ? res : [])
    } catch {
      toast.error('Failed to load cart details')
      setCartItems([])
    } finally {
      setCartLoading(false)
    }
  }

  const loadCartHistory = async (page = 1) => {
    setCartHistoryLoading(true)
    try {
      const res = await apiClient.get<any>(`/transactions/carts?page=${page}&limit=20`)
      const data = (res as any).data || res
      setCartHistory(Array.isArray(data) ? data : data.data || [])
      setCartHistoryTotalPages((res as any).totalPages || 1)
      setCartHistoryPage(page)
    } catch {
      toast.error('Failed to load cart history')
    } finally {
      setCartHistoryLoading(false)
    }
  }

  const handleToggleCartHistory = () => {
    if (!showCartHistory) loadCartHistory(1)
    setShowCartHistory(!showCartHistory)
    setExpandedCart(null)
  }

  const fetchUserCurrentCart = async (userId: string) => {
    setCurrentCartLoading(true)
    setUserCurrentCart(null)
    try {
      const res = await apiClient.get<any>(`/transactions/user/${userId}/current-cart`)
      setUserCurrentCart(res)
    } catch {
      toast.error('Failed to load current cart')
    } finally {
      setCurrentCartLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-emerald-400" />
      case 'pending': return <Clock className="h-4 w-4 text-amber-400" />
      case 'failed': return <XCircle className="h-4 w-4 text-red-400" />
      case 'cancelled': return <AlertCircle className="h-4 w-4 text-[#888]" />
      case 'refunded': return <TrendingDown className="h-4 w-4 text-orange-400" />
      default: return <Clock className="h-4 w-4 text-[#888]" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      case 'pending': return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
      case 'failed': return 'bg-red-500/10 text-red-400 border-red-500/20'
      case 'cancelled': return 'bg-[rgba(255,255,255,0.05)] text-[#888] border-[rgba(255,255,255,0.07)]'
      case 'refunded': return 'bg-orange-500/10 text-orange-400 border-orange-500/20'
      default: return 'bg-[rgba(255,255,255,0.05)] text-[#888] border-[rgba(255,255,255,0.07)]'
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
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[rgba(255,255,255,0.07)] border-t-[#51a2ff] rounded-full animate-spin" />
      </div>
    )
  }

  const detailTabs = [
    { id: 'transaction', label: 'Transaction', icon: <FileText className="w-3 h-3" /> },
    ...((selectedTransaction?.metadata as any)?.isCartPurchase ? [{ id: 'cart', label: 'Cart Items', icon: <ShoppingCart className="w-3 h-3" /> }] : []),
    ...((selectedTransaction?.metadata as any)?.invoiceId ? [{ id: 'invoice', label: 'Invoice', icon: <Layers className="w-3 h-3" /> }] : []),
    { id: 'user', label: 'User', icon: <User className="w-3 h-3" /> },
    { id: 'script', label: 'Script', icon: <Package className="w-3 h-3" /> },
    { id: 'license', label: 'License', icon: <Key className="w-3 h-3" /> },
    { id: 'history', label: 'History', icon: <History className="w-3 h-3" /> },
  ]

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <div className="p-6 mx-auto space-y-6 max-w-7xl">

        {/* Header */}
        <div className="card-base p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl" style={{ background: 'rgba(81,162,255,0.1)', border: '1px solid rgba(81,162,255,0.2)' }}>
                <CreditCard className="w-6 h-6 text-[#51a2ff]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Transaction History</h1>
                <p className="text-sm text-[#555] mt-0.5">Complete financial transaction records</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={handleToggleCartHistory} className="btn-ghost flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                {showCartHistory ? 'All Transactions' : 'Cart History'}
              </button>
              <button onClick={() => getTransactions()} className="btn-ghost flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <button onClick={handleExport} className="btn-primary flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export CSV
              </button>
              <button onClick={() => router.push('/admin')} className="btn-ghost flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="card-base p-5">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-11 h-11 rounded-xl" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
                <DollarSign className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-[#555]">Net Revenue</p>
                <p className={`text-xl font-bold ${totalRevenue >= 0 ? 'text-white' : 'text-red-400'}`}>${totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="card-base p-5">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-11 h-11 rounded-xl" style={{ background: 'rgba(81,162,255,0.1)', border: '1px solid rgba(81,162,255,0.2)' }}>
                <TrendingUp className="w-5 h-5 text-[#51a2ff]" />
              </div>
              <div>
                <p className="text-xs text-[#555]">Monthly Revenue</p>
                <p className="text-xl font-bold text-white">${monthlyRevenue.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="card-base p-5">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-11 h-11 rounded-xl" style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)' }}>
                <RotateCcw className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <p className="text-xs text-[#555]">Total Refunds</p>
                <p className="text-xl font-bold text-white">${totalRefunds.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="card-base p-5">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-11 h-11 rounded-xl" style={{ background: 'rgba(81,162,255,0.1)', border: '1px solid rgba(81,162,255,0.2)' }}>
                <CreditCard className="w-5 h-5 text-[#51a2ff]" />
              </div>
              <div>
                <p className="text-xs text-[#555]">Transactions</p>
                <p className="text-xl font-bold text-white">{transactions.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Overview */}
        <div className="card-base p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-semibold text-white">Revenue Overview</h3>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
                <span className="text-[#555]">Income</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-orange-400"></div>
                <span className="text-[#555]">Refunds</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center justify-center">
              <div className="relative w-40 h-40">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="80" cy="80" r="60" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="20" />
                  <circle
                    cx="80" cy="80" r="60" fill="none"
                    stroke="#22c55e" strokeWidth="20"
                    strokeDasharray={`${grossRevenue > 0 ? ((totalRevenue / grossRevenue) * 377) : 0} 377`}
                    strokeLinecap="round"
                    className="transition-all duration-700"
                  />
                  <circle
                    cx="80" cy="80" r="60" fill="none"
                    stroke="#f97316" strokeWidth="20"
                    strokeDasharray={`${grossRevenue > 0 ? ((totalRefunds / grossRevenue) * 377) : 0} 377`}
                    strokeDashoffset={`-${grossRevenue > 0 ? ((totalRevenue / grossRevenue) * 377) : 0}`}
                    strokeLinecap="round"
                    className="transition-all duration-700"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-xs text-[#555]">Net Revenue</p>
                  <p className={`text-xl font-bold ${totalRevenue >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    ${totalRevenue.toFixed(0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="card-base p-5" style={{ background: 'rgba(34,197,94,0.04)', border: '1px solid rgba(34,197,94,0.15)' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg" style={{ background: 'rgba(34,197,94,0.1)' }}>
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="text-[#888] text-sm">Gross Income</span>
              </div>
              <p className="text-2xl font-bold text-emerald-400 mb-2">${grossRevenue.toFixed(2)}</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${grossRevenue > 0 ? ((totalRevenue / grossRevenue) * 100) : 0}%` }}
                  />
                </div>
                <span className="text-xs text-emerald-400">
                  {grossRevenue > 0 ? ((totalRevenue / grossRevenue) * 100).toFixed(1) : 0}% kept
                </span>
              </div>
            </div>

            <div className="card-base p-5" style={{ background: 'rgba(249,115,22,0.04)', border: '1px solid rgba(249,115,22,0.15)' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg" style={{ background: 'rgba(249,115,22,0.1)' }}>
                  <TrendingDown className="w-4 h-4 text-orange-400" />
                </div>
                <span className="text-[#888] text-sm">Total Refunds</span>
              </div>
              <p className="text-2xl font-bold text-orange-400 mb-2">${totalRefunds.toFixed(2)}</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <div
                    className="h-full bg-orange-500 rounded-full transition-all duration-500"
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
        <div className="card-base p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 w-4 h-4 text-[#555] -translate-y-1/2 z-10" />
              <input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm text-white rounded-lg outline-none focus:ring-1 focus:ring-[#51a2ff]"
                style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.07)' }}
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

        {/* Cart History View */}
        {showCartHistory && (
          <div className="card-base p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-[#51a2ff]" />
                Cart Purchase History
              </h3>
              {cartHistoryLoading && <RefreshCw className="w-4 h-4 text-[#51a2ff] animate-spin" />}
            </div>

            {cartHistory.length === 0 && !cartHistoryLoading ? (
              <div className="text-center py-12 text-[#555]">
                <ShoppingCart className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>No cart purchases found</p>
              </div>
            ) : (
              <div className="space-y-2">
                {cartHistory.map((cart: any) => (
                  <div key={cart.orderId} className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                    <button
                      onClick={() => setExpandedCart(expandedCart === cart.orderId ? null : cart.orderId)}
                      className="w-full flex flex-wrap items-center justify-between gap-3 p-4 hover:bg-[#161616] transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg" style={{ background: 'rgba(81,162,255,0.1)' }}>
                          <ShoppingCart className="w-4 h-4 text-[#51a2ff]" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-white font-medium">{cart.user?.username || 'Unknown'}</span>
                            <span className="text-xs text-[#555]">{cart.user?.email}</span>
                          </div>
                          <div className="text-xs text-[#555] font-mono">{String(cart.orderId).substring(0, 24)}…</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-xs text-[#555]">Items</p>
                          <p className="font-bold text-[#ccc]">{Number(cart.itemCount)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-[#555]">Total</p>
                          <p className="font-bold text-[#51a2ff]">${Number(cart.totalAmount).toFixed(2)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-[#555]">Date</p>
                          <p className="text-xs text-[#ccc]">{cart.createdAt ? new Date(cart.createdAt).toLocaleDateString() : '—'}</p>
                        </div>
                        <div className="flex gap-1">
                          <a
                            href={`https://dashboard.stripe.com/payments/${cart.orderId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 text-[#555] hover:text-[#51a2ff] rounded-md transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                          <ChevronRight className={`w-4 h-4 text-[#555] transition-transform ${expandedCart === cart.orderId ? 'rotate-90' : ''}`} />
                        </div>
                      </div>
                    </button>

                    {expandedCart === cart.orderId && (
                      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                        {(cart.items || []).map((item: any) => (
                          <div key={item.id} className="flex items-center gap-3 px-5 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            {item.script?.imageUrl && (
                              <img src={item.script.imageUrl} alt={item.script?.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-sm font-medium truncate">{item.script?.name || (item.metadata as any)?.scriptName || 'Unknown Script'}</p>
                              <p className="text-xs text-[#555]">{item.script?.version || '—'} · {item.script?.licenseType || '—'}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-[#51a2ff] font-semibold text-sm">${Number(item.amount).toFixed(2)}</p>
                              {item.license && (
                                <p className="text-xs text-[#555] font-mono">{item.license.privateKey?.substring(0, 12)}…</p>
                              )}
                            </div>
                            <span className={`${getStatusColor(item.status)} text-xs px-2 py-0.5 rounded-full font-medium border flex-shrink-0`}>{item.status}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {cartHistoryTotalPages > 1 && (
              <div className="card-base p-4 flex items-center justify-center gap-3 mt-4">
                <button
                  className="btn-ghost btn-sm flex items-center gap-1"
                  disabled={cartHistoryPage === 1}
                  onClick={() => loadCartHistory(cartHistoryPage - 1)}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm text-[#555]">Page {cartHistoryPage} / {cartHistoryTotalPages}</span>
                <button
                  className="btn-ghost btn-sm flex items-center gap-1"
                  disabled={cartHistoryPage === cartHistoryTotalPages}
                  onClick={() => loadCartHistory(cartHistoryPage + 1)}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Transactions Table */}
        <div className="card-base p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <th className="text-left text-[#555] font-medium py-3 px-4 text-xs uppercase tracking-wider">Order ID</th>
                  <th className="text-left text-[#555] font-medium py-3 px-4 text-xs uppercase tracking-wider">User</th>
                  <th className="text-left text-[#555] font-medium py-3 px-4 text-xs uppercase tracking-wider">Script</th>
                  <th className="text-left text-[#555] font-medium py-3 px-4 text-xs uppercase tracking-wider">Developer</th>
                  <th className="text-left text-[#555] font-medium py-3 px-4 text-xs uppercase tracking-wider">Amount</th>
                  <th className="text-left text-[#555] font-medium py-3 px-4 text-xs uppercase tracking-wider">Status</th>
                  <th className="text-left text-[#555] font-medium py-3 px-4 text-xs uppercase tracking-wider">Date</th>
                  <th className="text-left text-[#555] font-medium py-3 px-4 text-xs uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-[#555]">No transactions found</td>
                  </tr>
                ) : (
                  filteredTransactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b transition-colors hover:bg-[#161616]" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                      <td className="py-3 px-4 text-[#ccc] font-mono text-xs">
                        {transaction.orderId?.substring(0, 16) || 'N/A'}...
                      </td>
                      <td className="py-3 px-4 text-[#ccc]">
                        <div className="text-white">{transaction.user?.username || 'Unknown'}</div>
                        <div className="text-xs text-[#555]">{transaction.user?.email || transaction.payerEmail || 'No email'}</div>
                      </td>
                      <td className="py-3 px-4 text-[#ccc]">{transaction.script?.name || 'N/A'}</td>
                      <td className="py-3 px-4 text-[#ccc]">
                        <div>{transaction.developerName || 'N/A'}</div>
                        <div className="text-xs text-[#555]">{transaction.type || 'purchase'}</div>
                      </td>
                      <td className="py-3 px-4 text-[#51a2ff] font-semibold">
                        ${transaction.amount?.toFixed(2) || '0.00'} {transaction.currency || 'USD'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`${getStatusColor(transaction.status)} text-xs px-2 py-0.5 rounded-full font-medium border inline-flex items-center gap-1`}>
                          {getStatusIcon(transaction.status)}
                          {transaction.status?.charAt(0).toUpperCase() + transaction.status?.slice(1) || 'Unknown'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#ccc]">
                        {transaction.createdAt ? formatDate(transaction.createdAt) : 'N/A'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-1 flex-wrap">
                          <button
                            onClick={() => handleViewDetails(transaction)}
                            className="p-2 rounded-lg text-[#888] hover:text-white transition-colors"
                            style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.07)' }}
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {(transaction as any).metadata?.isCartPurchase && (
                            <button
                              onClick={() => handleViewCart(transaction.orderId!)}
                              className="p-2 rounded-lg text-[#888] hover:text-white transition-colors"
                              style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.07)' }}
                              title="View cart"
                            >
                              <ShoppingCart className="w-4 h-4" />
                            </button>
                          )}
                          {transaction.paymentId && (
                            <a
                              href={`https://dashboard.stripe.com/payments/${transaction.paymentId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Open in Stripe"
                              className="p-2 rounded-lg text-[#888] hover:text-white transition-colors inline-flex items-center justify-center"
                              style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.07)' }}
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                          {transaction.status === 'completed' && (
                            <button
                              onClick={() => handleOpenRefund(transaction)}
                              className="px-3 py-1.5 text-sm rounded-lg font-medium text-red-400"
                              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
                              title="Refund"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="card-base p-4 flex items-center justify-center gap-3 mt-6">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="btn-ghost btn-sm flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              <span className="text-sm text-[#555]">Page {currentPage} of {totalPages}</span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="btn-ghost btn-sm flex items-center gap-1"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Transaction Details Modal */}
      {isDetailsOpen && selectedTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-xl" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="p-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#51a2ff]" />
                  <h2 className="text-lg font-bold text-white">Transaction Details</h2>
                </div>
                <button onClick={() => setIsDetailsOpen(false)} className="p-2 rounded-lg text-[#888] hover:text-white transition-colors" style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {detailsLoading && (
                <div className="flex justify-center py-4 mb-4">
                  <div className="w-6 h-6 border-2 border-[rgba(255,255,255,0.07)] border-t-[#51a2ff] rounded-full animate-spin" />
                </div>
              )}

              {/* Amount & Status */}
              <div className="flex items-center justify-between p-5 rounded-xl mb-4" style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)' }}>
                <div>
                  <p className="text-sm text-[#555]">Amount</p>
                  <p className="text-4xl font-bold text-emerald-400">${selectedTransaction.amount?.toFixed(2)}</p>
                  <p className="text-xs text-[#555] uppercase mt-1">{selectedTransaction.currency || 'USD'}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`${getStatusColor(selectedTransaction.status)} text-xs px-3 py-1.5 rounded-full font-medium border inline-flex items-center gap-1.5`}>
                    {getStatusIcon(selectedTransaction.status)}
                    <span className="capitalize">{selectedTransaction.status}</span>
                  </span>
                  {selectedTransaction.status === 'completed' && (
                    <button
                      onClick={() => { setIsDetailsOpen(false); handleOpenRefund(selectedTransaction) }}
                      className="px-3 py-1.5 text-sm rounded-lg font-medium text-red-400 flex items-center gap-1.5"
                      style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Refund
                    </button>
                  )}
                </div>
              </div>

              {/* Tabs */}
              <div className="flex flex-wrap gap-1 p-1 rounded-lg mb-4" style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.07)' }}>
                {detailTabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-md text-xs font-medium transition-colors"
                    style={activeTab === tab.id
                      ? { background: 'rgba(81,162,255,0.15)', color: '#51a2ff', border: '1px solid rgba(81,162,255,0.2)' }
                      : { color: '#555', border: '1px solid transparent' }
                    }
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Transaction Tab */}
              {activeTab === 'transaction' && (
                <div className="rounded-lg p-4 space-y-0" style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.07)' }}>
                  {[
                    { label: 'Order ID', value: <div className="flex items-center gap-2"><span className="font-mono text-xs text-[#ccc]">{selectedTransaction.orderId || 'N/A'}</span><button onClick={() => { navigator.clipboard.writeText(selectedTransaction.orderId || ''); toast.success('Copied!') }} className="text-[#555] hover:text-white"><Copy className="w-3 h-3" /></button></div> },
                    { label: 'Payment ID', value: <div className="flex items-center gap-2"><span className="font-mono text-xs text-[#ccc]">{selectedTransaction.paymentId || 'N/A'}</span>{selectedTransaction.paymentId && <a href={`https://dashboard.stripe.com/payments/${selectedTransaction.paymentId}`} target="_blank" rel="noopener noreferrer" className="text-[#51a2ff] hover:opacity-80"><ExternalLink className="w-3.5 h-3.5" /></a>}</div> },
                    { label: 'Type', value: <span className="text-xs px-2 py-0.5 rounded-full font-medium border bg-[rgba(81,162,255,0.1)] text-[#51a2ff] border-[rgba(81,162,255,0.2)]">{selectedTransaction.type || 'purchase'}</span> },
                    { label: 'Developer', value: <span className="text-[#ccc]">{selectedTransaction.developerName || 'N/A'}</span> },
                    { label: 'Created', value: <span className="text-sm text-[#ccc]">{selectedTransaction.createdAt ? formatDate(selectedTransaction.createdAt) : 'N/A'}</span> },
                  ].map((row, i) => (
                    <div key={i} className="flex justify-between items-center py-2.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <span className="text-[#555] text-sm">{row.label}</span>
                      {row.value}
                    </div>
                  ))}
                  {selectedTransaction.description && (
                    <div className="py-2.5">
                      <span className="text-[#555] text-sm block mb-1">Description</span>
                      <span className="text-sm text-[#ccc]">{selectedTransaction.description}</span>
                    </div>
                  )}
                  {selectedTransaction.status === 'refunded' && (
                    <div className="p-3 rounded-lg mt-2" style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)' }}>
                      <div className="flex justify-between items-center">
                        <span className="text-orange-400 text-sm">Refunded Amount</span>
                        <span className="font-bold text-orange-400">${selectedTransaction.refundedAmount?.toFixed(2) || '0.00'}</span>
                      </div>
                      <p className="text-xs text-[#555] mt-1">{selectedTransaction.refundedAt ? formatDate(selectedTransaction.refundedAt) : ''}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Cart Items Tab */}
              {activeTab === 'cart' && (
                <div className="space-y-3">
                  {dialogCartLoading ? (
                    <div className="flex justify-center py-10">
                      <div className="w-6 h-6 border-2 border-[rgba(255,255,255,0.07)] border-t-[#51a2ff] rounded-full animate-spin" />
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'rgba(81,162,255,0.06)', border: '1px solid rgba(81,162,255,0.15)' }}>
                        <div>
                          <p className="text-xs text-[#555]">Items in Cart</p>
                          <p className="text-2xl font-bold text-[#51a2ff]">{dialogCartItems.length}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-[#555]">Cart Total</p>
                          <p className="text-2xl font-bold text-emerald-400">
                            ${dialogCartItems.reduce((s: number, i: any) => s + Number(i.amount), 0).toFixed(2)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-[#555]">Order ID</p>
                          <p className="font-mono text-xs text-[#ccc]">{selectedTransaction.orderId?.substring(0, 20)}…</p>
                        </div>
                      </div>

                      {(selectedTransaction.metadata as any)?.couponCode && (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs" style={{ background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.2)' }}>
                          <span className="text-[#555]">Coupon:</span>
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium border bg-amber-500/10 text-amber-400 border-amber-500/20">{(selectedTransaction.metadata as any).couponCode}</span>
                          <span className="text-[#555] ml-auto">Total paid: ${(selectedTransaction.metadata as any)?.totalCartAmount?.toFixed(2) || '—'}</span>
                        </div>
                      )}

                      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                        {dialogCartItems.length === 0 ? (
                          <div className="p-8 text-center text-[#555]">
                            <ShoppingCart className="w-10 h-10 mx-auto mb-2 opacity-30" />
                            <p>No cart items found</p>
                          </div>
                        ) : dialogCartItems.map((item: any, idx: number) => (
                          <div key={item.id} className="p-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: item.id === selectedTransaction.id ? 'rgba(81,162,255,0.06)' : '#1a1a1a' }}>
                            <div className="flex items-start gap-3">
                              <span className="w-6 h-6 flex-shrink-0 flex items-center justify-center rounded-full text-xs font-bold" style={{ background: 'rgba(81,162,255,0.1)', color: '#51a2ff' }}>{idx + 1}</span>
                              {item.script?.imageUrl && <img src={item.script.imageUrl} alt={item.script?.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <p className="font-semibold text-white">{item.script?.name || (item.metadata as any)?.scriptName || 'Unknown Script'}</p>
                                    <div className="flex gap-2 mt-1 flex-wrap">
                                      {item.script?.version && <span className="text-xs px-2 py-0.5 rounded-full font-medium border bg-[rgba(81,162,255,0.1)] text-[#51a2ff] border-[rgba(81,162,255,0.2)]">{item.script.version}</span>}
                                      {item.script?.licenseType && <span className="text-xs px-2 py-0.5 rounded-full font-medium border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">{item.script.licenseType}</span>}
                                      <span className={`${getStatusColor(item.status)} text-xs px-2 py-0.5 rounded-full font-medium border`}>{item.status}</span>
                                      {item.id === selectedTransaction.id && <span className="text-xs px-2 py-0.5 rounded-full font-medium border bg-[rgba(81,162,255,0.1)] text-[#51a2ff] border-[rgba(81,162,255,0.2)]">← this transaction</span>}
                                    </div>
                                  </div>
                                  <p className="font-bold text-emerald-400 flex-shrink-0">${Number(item.amount).toFixed(2)}</p>
                                </div>
                                {item.license && (
                                  <div className="mt-2 p-2 rounded-lg flex items-center gap-2" style={{ background: 'rgba(255,255,255,0.04)' }}>
                                    <Key className="w-3.5 h-3.5 text-[#51a2ff] flex-shrink-0" />
                                    <code className="text-xs font-mono text-[#ccc] flex-1 truncate">{item.license.privateKey}</code>
                                    <button onClick={() => { navigator.clipboard.writeText(item.license.privateKey || ''); toast.success('Copied!') }} className="text-[#555] hover:text-white flex-shrink-0">
                                      <Copy className="w-3.5 h-3.5" />
                                    </button>
                                    <span className={item.license.isActive && !item.license.isRevoked ? 'text-xs px-2 py-0.5 rounded-full font-medium border bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'text-xs px-2 py-0.5 rounded-full font-medium border bg-red-500/10 text-red-400 border-red-500/20'}>
                                      {item.license.isRevoked ? 'Revoked' : item.license.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {selectedTransaction.paymentId && (
                        <a href={`https://dashboard.stripe.com/payments/${selectedTransaction.paymentId}`} target="_blank" rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 p-3 rounded-xl text-sm text-[#51a2ff] hover:opacity-80 transition-opacity"
                          style={{ border: '1px solid rgba(81,162,255,0.2)', background: 'rgba(81,162,255,0.06)' }}>
                          <ExternalLink className="w-4 h-4" />
                          View Payment in Stripe Dashboard
                        </a>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Invoice Tab */}
              {activeTab === 'invoice' && (
                <div className="space-y-3">
                  {dialogInvoiceLoading ? (
                    <div className="flex justify-center py-10">
                      <div className="w-6 h-6 border-2 border-[rgba(255,255,255,0.07)] border-t-[#51a2ff] rounded-full animate-spin" />
                    </div>
                  ) : dialogInvoice ? (
                    <>
                      <div className="p-4 rounded-xl flex items-start justify-between gap-4" style={{ background: 'rgba(81,162,255,0.06)', border: '1px solid rgba(81,162,255,0.15)' }}>
                        <div>
                          <p className="text-xs text-[#555] mb-1">Invoice</p>
                          <p className="font-bold text-white text-lg">{dialogInvoice.description}</p>
                          <p className="text-xs font-mono text-[#555] mt-1">{dialogInvoice.stripeInvoiceId}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-3xl font-bold text-emerald-400">${Number(dialogInvoice.amount).toFixed(2)}</p>
                          <span className={
                            dialogInvoice.status === 'paid' ? 'text-xs px-2 py-0.5 rounded-full font-medium border bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : dialogInvoice.status === 'open' ? 'text-xs px-2 py-0.5 rounded-full font-medium border bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : 'text-xs px-2 py-0.5 rounded-full font-medium border bg-[rgba(255,255,255,0.05)] text-[#888] border-[rgba(255,255,255,0.07)]'
                          }>{dialogInvoice.status}</span>
                        </div>
                      </div>

                      <div className="rounded-lg p-4" style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.07)' }}>
                        {[
                          { label: 'Customer Email', value: dialogInvoice.customerEmail },
                          ...(dialogInvoice.customerName ? [{ label: 'Customer Name', value: dialogInvoice.customerName }] : []),
                          { label: 'Currency', value: dialogInvoice.currency?.toUpperCase() },
                          { label: 'Due Date', value: dialogInvoice.dueDate ? formatDate(dialogInvoice.dueDate) : '—' },
                          ...(dialogInvoice.paidAt ? [{ label: 'Paid At', value: formatDate(dialogInvoice.paidAt), accent: true }] : []),
                          { label: 'Created By', value: dialogInvoice.creator?.username || '—' },
                        ].map((row, i) => (
                          <div key={i} className="flex justify-between items-center py-2.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <span className="text-[#555] text-sm">{row.label}</span>
                            <span className={(row as any).accent ? 'text-emerald-400' : 'text-[#ccc]'}>{row.value}</span>
                          </div>
                        ))}
                        {dialogInvoice.user && (
                          <div className="flex justify-between items-center py-2.5">
                            <span className="text-[#555] text-sm">Linked User</span>
                            <span className="text-[#51a2ff]">{dialogInvoice.user.username} ({dialogInvoice.user.email})</span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        {dialogInvoice.paymentUrl && (
                          <a href={dialogInvoice.paymentUrl} target="_blank" rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl text-sm text-[#51a2ff] hover:opacity-80 transition-opacity"
                            style={{ border: '1px solid rgba(81,162,255,0.2)', background: 'rgba(81,162,255,0.06)' }}>
                            <ExternalLink className="w-4 h-4" />
                            Open Payment Link
                          </a>
                        )}
                        {dialogInvoice.stripeInvoiceId && (
                          <a href={`https://dashboard.stripe.com/invoices/${dialogInvoice.stripeInvoiceId}`} target="_blank" rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl text-sm text-[#51a2ff] hover:opacity-80 transition-opacity"
                            style={{ border: '1px solid rgba(81,162,255,0.2)', background: 'rgba(81,162,255,0.06)' }}>
                            <ExternalLink className="w-4 h-4" />
                            View in Stripe
                          </a>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="p-8 text-center text-[#555] rounded-lg" style={{ background: '#1a1a1a' }}>
                      <Layers className="w-12 h-12 mx-auto mb-2 opacity-30" />
                      <p>Invoice details not available</p>
                    </div>
                  )}
                </div>
              )}

              {/* User Tab */}
              {activeTab === 'user' && (
                <div>
                  {selectedTransaction.user ? (
                    <div className="rounded-lg p-4 space-y-0" style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.07)' }}>
                      <div className="flex items-center gap-3 pb-3 mb-1" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        {selectedTransaction.user.discordAvatar ? (
                          <img src={selectedTransaction.user.discordAvatar} alt={selectedTransaction.user.username} className="w-12 h-12 rounded-full" />
                        ) : (
                          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(81,162,255,0.15)' }}>
                            <User className="w-6 h-6 text-[#51a2ff]" />
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-white">{selectedTransaction.user.username}</p>
                          <p className="text-sm text-[#555]">{selectedTransaction.user.email}</p>
                        </div>
                      </div>
                      {[
                        { label: 'User ID', value: <span className="font-mono text-xs text-[#ccc]">{selectedTransaction.user.id}</span> },
                        { label: 'Name', value: <span className="text-[#ccc]">{selectedTransaction.user.firstName} {selectedTransaction.user.lastName}</span> },
                        { label: 'Discord', value: <span className="text-[#ccc]">{selectedTransaction.user.discordUsername || 'N/A'}</span> },
                        { label: 'Role', value: <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${selectedTransaction.user.role === 'admin' ? 'bg-[rgba(81,162,255,0.1)] text-[#51a2ff] border-[rgba(81,162,255,0.2)]' : 'bg-[rgba(255,255,255,0.05)] text-[#888] border-[rgba(255,255,255,0.07)]'}`}>{selectedTransaction.user.role}</span> },
                        { label: 'Member Since', value: <span className="text-sm text-[#ccc]">{selectedTransaction.user.createdAt ? formatDate(selectedTransaction.user.createdAt) : 'N/A'}</span> },
                      ].map((row, i) => (
                        <div key={i} className="flex justify-between items-center py-2.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <span className="text-[#555] text-sm">{row.label}</span>
                          {row.value}
                        </div>
                      ))}
                      <div className="pt-3">
                        <button
                          onClick={() => fetchUserCurrentCart(selectedTransaction.user.id)}
                          disabled={currentCartLoading}
                          className="btn-ghost flex items-center gap-2 w-full justify-center mb-3"
                        >
                          {currentCartLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShoppingCart className="w-3.5 h-3.5" />}
                          Check Current Stripe Cart
                        </button>
                        {userCurrentCart && (
                          <div className="rounded-lg p-3 space-y-2" style={{ background: 'rgba(81,162,255,0.06)', border: '1px solid rgba(81,162,255,0.15)' }}>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-[#555]">Stripe Customer</span>
                              {userCurrentCart.customerId ? (
                                <a href={`https://dashboard.stripe.com/customers/${userCurrentCart.customerId}`} target="_blank" rel="noopener noreferrer" className="text-xs text-[#51a2ff] hover:opacity-80 flex items-center gap-1">
                                  {userCurrentCart.customerId}
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              ) : <span className="text-xs text-[#555]">No customer</span>}
                            </div>
                            {userCurrentCart.activePaymentIntents?.length > 0 && (
                              <div>
                                <p className="text-xs text-amber-400 font-medium mb-1">Active Payment Intents ({userCurrentCart.activePaymentIntents.length})</p>
                                {userCurrentCart.activePaymentIntents.map((pi: any) => (
                                  <div key={pi.id} className="flex items-center justify-between p-2 rounded mb-1" style={{ background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.2)' }}>
                                    <div>
                                      <p className="text-xs font-mono text-white">{pi.id.substring(0, 20)}…</p>
                                      <p className="text-xs text-[#555]">${pi.amount} · {pi.status}</p>
                                    </div>
                                    <a href={pi.stripeDashboardUrl} target="_blank" rel="noopener noreferrer" className="text-[#51a2ff] hover:opacity-80"><ExternalLink className="w-3.5 h-3.5" /></a>
                                  </div>
                                ))}
                              </div>
                            )}
                            {userCurrentCart.recentSucceeded?.length > 0 && (
                              <div>
                                <p className="text-xs text-emerald-400 font-medium mb-1">Recent Payments ({userCurrentCart.recentSucceeded.length})</p>
                                {userCurrentCart.recentSucceeded.map((pi: any) => (
                                  <div key={pi.id} className="flex items-center justify-between p-2 rounded mb-1" style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)' }}>
                                    <div>
                                      <p className="text-xs font-mono text-white">{pi.id.substring(0, 20)}…</p>
                                      <p className="text-xs text-[#555]">${pi.amount} · {new Date(pi.created).toLocaleDateString()}</p>
                                    </div>
                                    <a href={pi.stripeDashboardUrl} target="_blank" rel="noopener noreferrer" className="text-[#51a2ff] hover:opacity-80"><ExternalLink className="w-3.5 h-3.5" /></a>
                                  </div>
                                ))}
                              </div>
                            )}
                            {!userCurrentCart.activePaymentIntents?.length && !userCurrentCart.recentSucceeded?.length && (
                              <p className="text-xs text-[#555] text-center py-2">No recent payment intents</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-[#555] rounded-lg" style={{ background: '#1a1a1a' }}>
                      <User className="w-12 h-12 mx-auto mb-2 opacity-30" />
                      <p>No user information available</p>
                    </div>
                  )}
                </div>
              )}

              {/* Script Tab */}
              {activeTab === 'script' && (
                <div>
                  {selectedTransaction.script ? (
                    <div className="rounded-lg p-4" style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.07)' }}>
                      {selectedTransaction.script.imageUrl && (
                        <div className="pb-3 mb-1" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                          <img src={selectedTransaction.script.imageUrl} alt={selectedTransaction.script.name} className="w-full h-32 object-cover rounded-lg" />
                        </div>
                      )}
                      {[
                        { label: 'Name', value: <span className="font-bold text-white">{selectedTransaction.script.name}</span> },
                        { label: 'Script ID', value: <span className="font-mono text-xs text-[#ccc]">{selectedTransaction.script.id}</span> },
                        { label: 'Version', value: <span className="text-xs px-2 py-0.5 rounded-full font-medium border bg-[rgba(81,162,255,0.1)] text-[#51a2ff] border-[rgba(81,162,255,0.2)]">{selectedTransaction.script.version || '1.0.0'}</span> },
                        { label: 'License Type', value: <span className="text-xs px-2 py-0.5 rounded-full font-medium border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">{selectedTransaction.script.licenseType || 'forever'}</span> },
                      ].map((row, i) => (
                        <div key={i} className="flex justify-between items-center py-2.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <span className="text-[#555] text-sm">{row.label}</span>
                          {row.value}
                        </div>
                      ))}
                      {selectedTransaction.script.description && (
                        <div className="py-2.5">
                          <span className="text-[#555] text-sm block mb-1">Description</span>
                          <span className="text-sm text-[#ccc]">{selectedTransaction.script.description}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-[#555] rounded-lg" style={{ background: '#1a1a1a' }}>
                      <Package className="w-12 h-12 mx-auto mb-2 opacity-30" />
                      <p>No script information available</p>
                    </div>
                  )}
                </div>
              )}

              {/* License Tab */}
              {activeTab === 'license' && (
                <div>
                  {selectedTransaction.license ? (
                    <div className="rounded-lg p-4" style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.07)' }}>
                      <div className="flex justify-between items-center py-2.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <span className="text-[#555] text-sm">License ID</span>
                        <span className="font-mono text-xs text-[#ccc]">{selectedTransaction.license.id}</span>
                      </div>
                      <div className="py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[#555] text-sm">Private Key</span>
                          <button onClick={() => setShowLicenseKey(!showLicenseKey)} className="flex items-center gap-1 text-xs text-[#51a2ff] hover:opacity-80 transition-opacity">
                            {showLicenseKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            {showLicenseKey ? 'Hide' : 'Show'}
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <code className="text-sm px-3 py-2 rounded-lg flex-1 overflow-x-auto font-mono text-[#ccc]" style={{ background: 'rgba(255,255,255,0.04)' }}>
                            {showLicenseKey ? selectedTransaction.license.privateKey : '••••••••••••••••••••••••••••••••••••'}
                          </code>
                          <button onClick={() => { navigator.clipboard.writeText(selectedTransaction.license.privateKey || ''); toast.success('License key copied!') }} className="p-2 rounded-lg text-[#888] hover:text-white transition-colors" style={{ background: '#222', border: '1px solid rgba(255,255,255,0.07)' }}>
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      {[
                        { label: 'Status', value: <span className={selectedTransaction.license.isActive ? 'text-xs px-2 py-0.5 rounded-full font-medium border bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'text-xs px-2 py-0.5 rounded-full font-medium border bg-red-500/10 text-red-400 border-red-500/20'}>{selectedTransaction.license.isActive ? 'Active' : 'Inactive'}</span> },
                        { label: 'Revoked', value: <span className={selectedTransaction.license.isRevoked ? 'text-xs px-2 py-0.5 rounded-full font-medium border bg-red-500/10 text-red-400 border-red-500/20' : 'text-xs px-2 py-0.5 rounded-full font-medium border bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}>{selectedTransaction.license.isRevoked ? 'Yes' : 'No'}</span> },
                        { label: 'Expires', value: <span className="text-[#ccc]">{selectedTransaction.license.expiresAt ? formatDate(selectedTransaction.license.expiresAt) : 'Never'}</span> },
                        { label: 'Created', value: <span className="text-sm text-[#ccc]">{selectedTransaction.license.createdAt ? formatDate(selectedTransaction.license.createdAt) : 'N/A'}</span> },
                      ].map((row, i) => (
                        <div key={i} className="flex justify-between items-center py-2.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <span className="text-[#555] text-sm">{row.label}</span>
                          {row.value}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-[#555] rounded-lg" style={{ background: '#1a1a1a' }}>
                      <Key className="w-12 h-12 mx-auto mb-2 opacity-30" />
                      <p>No license information available</p>
                    </div>
                  )}
                </div>
              )}

              {/* History Tab */}
              {activeTab === 'history' && (
                <div className="rounded-lg p-4" style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <h4 className="text-sm font-semibold text-[#888] mb-3">User Transaction History</h4>
                  {historyLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="w-6 h-6 border-2 border-[rgba(255,255,255,0.07)] border-t-[#51a2ff] rounded-full animate-spin" />
                    </div>
                  ) : userTransactionHistory.length === 0 ? (
                    <div className="p-8 text-center text-[#555]">
                      <History className="w-12 h-12 mx-auto mb-2 opacity-30" />
                      <p>No transaction history found</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                      {userTransactionHistory.map((tx) => (
                        <div key={tx.id} className="p-3 rounded-lg transition-colors" style={{
                          background: tx.id === selectedTransaction.id ? 'rgba(81,162,255,0.08)' : 'rgba(255,255,255,0.03)',
                          border: tx.id === selectedTransaction.id ? '1px solid rgba(81,162,255,0.2)' : '1px solid rgba(255,255,255,0.05)'
                        }}>
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-sm text-[#ccc]">{tx.script?.name || 'N/A'}</p>
                              <p className="text-xs text-[#555]">{tx.createdAt ? formatDate(tx.createdAt) : 'N/A'}</p>
                            </div>
                            <div className="text-end">
                              <p className="font-bold text-[#51a2ff]">${tx.amount?.toFixed(2)}</p>
                              <span className={`${getStatusColor(tx.status)} text-xs px-2 py-0.5 rounded-full font-medium border`}>{tx.status}</span>
                            </div>
                          </div>
                          {tx.id === selectedTransaction.id && <p className="text-xs text-[#51a2ff] mt-1">← Current transaction</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {isRefundOpen && selectedTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-md rounded-xl" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="p-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-red-400">Refund Transaction</h2>
                <button onClick={() => setIsRefundOpen(false)} className="p-2 rounded-lg text-[#888] hover:text-white transition-colors" style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-[#555] mt-1">Process a refund for this transaction</p>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-4 rounded-lg" style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-[#555] mb-1">Original Amount</p>
                    <p className="text-lg font-bold text-emerald-400">${selectedTransaction.amount?.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#555] mb-1">Script</p>
                    <p className="text-[#ccc]">{selectedTransaction.script?.name || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm text-[#888] block mb-1.5">Refund Amount</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max={selectedTransaction.amount}
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm text-white rounded-lg outline-none focus:ring-1 focus:ring-[#51a2ff]"
                  style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.07)' }}
                />
              </div>

              <div>
                <label className="text-sm text-[#888] block mb-1.5">Notes (Optional)</label>
                <input
                  value={refundNotes}
                  onChange={(e) => setRefundNotes(e.target.value)}
                  placeholder="Reason for refund..."
                  className="w-full px-3 py-2 text-sm text-white rounded-lg outline-none focus:ring-1 focus:ring-[#51a2ff]"
                  style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.07)' }}
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button onClick={() => setIsRefundOpen(false)} className="btn-ghost flex items-center gap-2">
                  Cancel
                </button>
                <button
                  onClick={handleRefund}
                  disabled={isRefunding || refundAmount <= 0 || refundAmount > selectedTransaction.amount}
                  className="px-3 py-1.5 text-sm rounded-lg font-medium text-red-400 flex items-center gap-2 disabled:opacity-50"
                  style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
                >
                  {isRefunding ? (
                    <><RefreshCw className="w-4 h-4 animate-spin" />Processing...</>
                  ) : (
                    <><RotateCcw className="w-4 h-4" />Refund ${refundAmount.toFixed(2)}</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cart Details Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-xl" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="p-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-[#51a2ff]" />
                  <h2 className="text-lg font-bold text-white">Cart Details</h2>
                </div>
                <button onClick={() => setIsCartOpen(false)} className="p-2 rounded-lg text-[#888] hover:text-white transition-colors" style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs font-mono text-[#555] mt-1">{cartOrderId}</p>
            </div>

            <div className="p-6">
              {cartLoading ? (
                <div className="flex justify-center py-12">
                  <div className="w-6 h-6 border-2 border-[rgba(255,255,255,0.07)] border-t-[#51a2ff] rounded-full animate-spin" />
                </div>
              ) : cartItems.length === 0 ? (
                <div className="p-8 text-center text-[#555]">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p>No items found for this cart</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'rgba(81,162,255,0.06)', border: '1px solid rgba(81,162,255,0.15)' }}>
                    <div>
                      <p className="text-sm text-[#555]">Total Items</p>
                      <p className="text-2xl font-bold text-[#51a2ff]">{cartItems.length}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-[#555]">Cart Total</p>
                      <p className="text-2xl font-bold text-emerald-400">${cartItems.reduce((s: number, i: any) => s + Number(i.amount), 0).toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-[#555] mb-1">Buyer</p>
                      <p className="text-sm text-white">{cartItems[0]?.user?.username || 'Unknown'}</p>
                      <p className="text-xs text-[#555]">{cartItems[0]?.user?.email}</p>
                    </div>
                  </div>

                  <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                    {cartItems.map((item: any, idx: number) => (
                      <div key={item.id} className="p-4 hover:bg-[#161616] transition-colors" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: '#1a1a1a' }}>
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'rgba(81,162,255,0.1)', color: '#51a2ff' }}>
                            {idx + 1}
                          </div>
                          {item.script?.imageUrl && (
                            <img src={item.script.imageUrl} alt={item.script?.name} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="font-semibold text-white">{item.script?.name || (item.metadata as any)?.scriptName || 'Unknown Script'}</p>
                                <div className="flex gap-2 mt-1 flex-wrap">
                                  {item.script?.version && <span className="text-xs px-2 py-0.5 rounded-full font-medium border bg-[rgba(81,162,255,0.1)] text-[#51a2ff] border-[rgba(81,162,255,0.2)]">{item.script.version}</span>}
                                  {item.script?.licenseType && <span className="text-xs px-2 py-0.5 rounded-full font-medium border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">{item.script.licenseType}</span>}
                                  <span className={`${getStatusColor(item.status)} text-xs px-2 py-0.5 rounded-full font-medium border`}>{item.status}</span>
                                </div>
                              </div>
                              <p className="font-bold text-emerald-400 flex-shrink-0">${Number(item.amount).toFixed(2)}</p>
                            </div>
                            {item.license && (
                              <div className="mt-2 p-2 rounded-lg flex items-center gap-2" style={{ background: 'rgba(255,255,255,0.04)' }}>
                                <Key className="w-3.5 h-3.5 text-[#51a2ff] flex-shrink-0" />
                                <code className="text-xs font-mono text-[#ccc] flex-1 truncate">{item.license.privateKey}</code>
                                <button onClick={() => { navigator.clipboard.writeText(item.license.privateKey || ''); toast.success('License key copied!') }} className="text-[#555] hover:text-white flex-shrink-0">
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                                <span className={item.license.isActive && !item.license.isRevoked ? 'text-xs px-2 py-0.5 rounded-full font-medium border bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'text-xs px-2 py-0.5 rounded-full font-medium border bg-red-500/10 text-red-400 border-red-500/20'}>
                                  {item.license.isRevoked ? 'Revoked' : item.license.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {cartItems[0]?.paymentId && (
                    <a href={`https://dashboard.stripe.com/payments/${cartItems[0].paymentId}`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 p-3 rounded-xl text-sm text-[#51a2ff] hover:opacity-80 transition-opacity"
                      style={{ border: '1px solid rgba(81,162,255,0.2)', background: 'rgba(81,162,255,0.06)' }}>
                      <ExternalLink className="w-4 h-4" />
                      View Payment in Stripe Dashboard
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default withAdminAuth(AdminTransactions)
