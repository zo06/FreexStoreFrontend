'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { CreditCard, Calendar, CheckCircle, XCircle, Clock, ArrowLeft, Receipt, DollarSign } from 'lucide-react'
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
    if (user?.id) fetchPaymentHistory()
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
            amount,
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
      case 'completed': return <CheckCircle className="w-4 h-4 text-emerald-400" />
      case 'pending': return <Clock className="w-4 h-4 text-yellow-400" />
      case 'failed':
      case 'cancelled': return <XCircle className="w-4 h-4 text-red-400" />
      default: return <Clock className="w-4 h-4 text-[#555]" />
    }
  }

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      case 'pending': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
      case 'failed':
      case 'cancelled': return 'bg-red-500/10 text-red-400 border-red-500/20'
      default: return 'bg-[#1a1a1a] text-[#555] border-[rgba(255,255,255,0.07)]'
    }
  }

  const formatFullDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    })
  }

  const totalSpent = transactions.filter(t => t.status === 'completed').reduce((sum, t) => sum + t.amount, 0)

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <div className="page-container">
        <div className="page-section">
          {/* Header */}
          <div className="mb-8">
            <Link href="/dashboard" className="inline-flex items-center gap-2 mb-5 text-sm text-[#888] hover:text-[#51a2ff] transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-white mb-1">Payment History</h1>
            <p className="text-[#888] text-sm">View all your transactions and purchases</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[
              { icon: Receipt, label: 'Total Transactions', value: transactions.length, color: '#51a2ff' },
              { icon: DollarSign, label: 'Total Spent', value: `$${totalSpent.toFixed(2)}`, color: 'emerald' },
              { icon: CheckCircle, label: 'Completed', value: transactions.filter(t => t.status === 'completed').length, color: '#51a2ff' },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="card-base p-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#1a1a1a] flex items-center justify-center flex-shrink-0" style={{ border: '1px solid rgba(81,162,255,0.15)' }}>
                  <Icon className={`w-5 h-5 ${color === 'emerald' ? 'text-emerald-400' : 'text-[#51a2ff]'}`} />
                </div>
                <div>
                  <p className="text-xs text-[#555] mb-0.5">{label}</p>
                  <p className="text-xl font-bold text-white">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Transactions */}
          <div className="card-base p-6">
            <h3 className="text-lg font-semibold text-white mb-6">All Transactions</h3>

            <div className="space-y-3">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="w-8 h-8 rounded-full border-2 border-[rgba(255,255,255,0.07)] border-t-[#51a2ff] animate-spin" />
                </div>
              ) : transactions.length > 0 ? (
                transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex flex-col lg:flex-row gap-4 p-4 rounded-xl bg-[#111] hover:bg-[#161616] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(81,162,255,0.2)] transition-colors"
                  >
                    <div className="flex items-start gap-4 flex-1">
                      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#1a1a1a] flex items-center justify-center" style={{ border: '1px solid rgba(81,162,255,0.15)' }}>
                        <CreditCard className="w-5 h-5 text-[#51a2ff]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
                          <div>
                            <p className="text-sm font-medium text-white">{transaction.scriptName}</p>
                            <p className="text-xs text-[#555] mt-0.5">Order: {transaction.orderId}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-lg font-bold text-[#51a2ff]">${transaction.amount.toFixed(2)}</span>
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusClass(transaction.status)}`}>
                              {getStatusIcon(transaction.status)}
                              {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-[#555]">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatFullDate(transaction.createdAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <CreditCard className="w-3 h-3" />
                            {transaction.paymentMethod.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-16 text-center">
                  <Receipt className="w-12 h-12 text-[#333] mx-auto mb-4" />
                  <p className="text-white font-medium mb-1">No transactions yet</p>
                  <p className="text-[#555] text-sm mb-6">Your payment history will appear here after your first purchase</p>
                  <Link href="/scripts" className="btn-ghost btn-sm">
                    Browse Scripts
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
