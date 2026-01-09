'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { CreditCard, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react'
import { ArrowLeft, Receipt, CurrencyDollar } from 'phosphor-react'
import { apiClient } from '@/lib/api'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { useTranslations } from 'next-intl'

interface PaymentTransaction {
  id: string
  orderId: string
  scriptName: string
  amount: number
  status: 'completed' | 'pending' | 'failed' | 'cancelled'
  paymentMethod: 'paypal' | 'stripe'
  createdAt: string
  updatedAt: string
}

export default function PaymentHistoryPage() {
  const t = useTranslations('paymentHistory');
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.id) {
      fetchPaymentHistory()
    }
  }, [user?.id])

  const fetchPaymentHistory = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getUserLicenses()
      
      const paymentTransactions: PaymentTransaction[] = (response.data || response)
        .filter((license: any) => license.paymentId || license.orderId)
        .map((license: any) => {
          const rawPrice = license.script?.price
          const amount = typeof rawPrice === 'object' && rawPrice !== null 
            ? Number(rawPrice.d?.[0] || 0) 
            : (typeof rawPrice === 'number' ? rawPrice : parseFloat(rawPrice) || 0)
          
          return {
            id: license.id,
            orderId: license.orderId || license.paymentId || 'N/A',
            scriptName: license.script?.title || license.script?.name || 'Unknown Script',
            amount: amount,
            status: license.isActive ? 'completed' : (license.isRevoked ? 'cancelled' : 'pending'),
            paymentMethod: 'paypal' as const,
            createdAt: license.createdAt,
            updatedAt: license.updatedAt
          }
        })
      
      setTransactions(paymentTransactions)
    } catch (err: any) {
      console.error('Failed to fetch payment history:', err)
      toast.error('Failed to load payment history')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-400" />
      case 'failed':
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-400" />
      default:
        return <Clock className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'failed':
      case 'cancelled':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatFullDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const totalSpent = transactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0)

  return (
    <main className="overflow-hidden relative pt-16 min-h-screen lg:pt-24">
      {/* Background Elements */}
      <div className="rotating-gradient"></div>
      <div className="left-10 top-20 w-20 h-20 floating-orb lg:w-32 lg:h-32"></div>
      <div className="right-20 top-40 w-16 h-16 opacity-60 floating-orb lg:w-24 lg:h-24" style={{animationDelay: '2s'}}></div>
      
      <div className="container px-4 py-4 mx-auto lg:px-6 lg:py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <Link href="/dashboard" className="inline-flex items-center gap-2 mb-4 text-sm text-muted hover:text-white transition-colors">
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>
          <h1 className="mb-2 text-2xl font-bold lg:text-4xl text-gradient">Payment History</h1>
          <p className="text-sm text-muted lg:text-base">View all your transactions and purchases</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 animate-slide-up">
          <div className="p-4 rounded-xl border border-white/10 bg-gradient-to-br from-cyan-900/30 to-slate-900/50 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                <Receipt size={20} className="text-cyan-400" />
              </div>
              <div>
                <p className="text-xs text-muted">Total Transactions</p>
                <p className="text-xl font-bold text-white">{transactions.length}</p>
              </div>
            </div>
          </div>
          
          <div className="p-4 rounded-xl border border-white/10 bg-gradient-to-br from-green-900/30 to-slate-900/50 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <CurrencyDollar size={20} className="text-green-400" />
              </div>
              <div>
                <p className="text-xs text-muted">Total Spent</p>
                <p className="text-xl font-bold text-white">${totalSpent.toFixed(2)}</p>
              </div>
            </div>
          </div>
          
          <div className="p-4 rounded-xl border border-white/10 bg-gradient-to-br from-blue-900/30 to-slate-900/50 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <CheckCircle size={20} className="text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-muted">Completed</p>
                <p className="text-xl font-bold text-white">{transactions.filter(t => t.status === 'completed').length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="p-4 card-modern lg:p-6 animate-slide-up" style={{animationDelay: '0.1s'}}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white lg:text-xl">All Transactions</h3>
          </div>
          
          <div className="space-y-3 lg:space-y-4">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="w-8 h-8 rounded-full border-b-2 border-cyan-400 animate-spin"></div>
              </div>
            ) : transactions.length > 0 ? (
              transactions.map((transaction) => (
                <div key={transaction.id} className="flex flex-col lg:flex-row gap-4 p-4 rounded-xl transition-colors bg-white/5 hover:bg-white/10 border border-white/5 hover:border-cyan-500/30">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                      <CreditCard size={20} className="text-cyan-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium text-white">{transaction.scriptName}</p>
                          <p className="text-xs text-muted mt-1">Order: {transaction.orderId}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-gradient">${transaction.amount.toFixed(2)}</span>
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusColor(transaction.status)}`}>
                            {getStatusIcon(transaction.status)}
                            {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-muted">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {formatFullDate(transaction.createdAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <CreditCard size={12} />
                          {transaction.paymentMethod.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-muted">
                <Receipt size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg">No transactions yet</p>
                <p className="text-sm mt-2">Your payment history will appear here after your first purchase</p>
                <Link href="/scripts">
                  <Button variant="outline" className="mt-4 cursor-pointer">
                    Browse Scripts
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

