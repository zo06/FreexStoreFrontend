'use client'

import { useState, useEffect } from 'react'
import { X, User as UserIcon, Mail, Calendar, Shield, Globe, Server, Activity, Package, CreditCard, Clock, CheckCircle, XCircle, Eye, Key, DollarSign, FileText, Search, Filter, ShoppingCart, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { ModalPortal } from '@/components/ui/modal-portal'

interface AdminUserInfoModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  userName: string
}

const EVENT_COLORS: Record<string, string> = {
  LicenseValid: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  LicenseInvalid: 'bg-red-500/10 text-red-400 border border-red-500/20',
  startup: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  shutdown: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
  error: 'bg-red-500/10 text-red-400 border border-red-500/20',
}

export default function AdminUserInfoModal({ isOpen, onClose, userId, userName }: AdminUserInfoModalProps) {
  const [activeTab, setActiveTab] = useState('details')
  const [loading, setLoading] = useState(true)
  const [userData, setUserData] = useState<any>(null)
  const [licenses, setLicenses] = useState<any[]>([])
  const [transactions, setTransactions] = useState<any[]>([])
  const [activities, setActivities] = useState<any[]>([])

  // Saved cart state
  const [savedCart, setSavedCart] = useState<any[]>([])
  const [cartLoading, setCartLoading] = useState(false)

  // License event logs state
  const [eventLogs, setEventLogs] = useState<any[]>([])
  const [logsLoading, setLogsLoading] = useState(false)
  const [logsTotal, setLogsTotal] = useState(0)
  const [logsPage, setLogsPage] = useState(1)
  const [logsTotalPages, setLogsTotalPages] = useState(1)
  const [logsEventFilter, setLogsEventFilter] = useState('')
  const [selectedLog, setSelectedLog] = useState<any>(null)

  useEffect(() => {
    if (isOpen && userId) {
      fetchUserData()
    }
  }, [isOpen, userId])

  // Fetch logs when switching to the logs tab or when filters/page change
  useEffect(() => {
    if (activeTab === 'logs' && isOpen && userId) {
      fetchLicenseLogs()
    }
  }, [activeTab, logsPage, logsEventFilter, isOpen, userId])

  // Fetch saved cart when switching to the cart tab
  useEffect(() => {
    if (activeTab === 'cart' && isOpen && userId) {
      fetchSavedCart()
    }
  }, [activeTab, isOpen, userId])

  const fetchUserData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('access_token')

      if (!token) {
        toast.error('Authentication required')
        return
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }

      // Fetch user details
      const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`, { headers })
      const userResult = await userResponse.json()
      setUserData(userResult.data || userResult)

      // Fetch user licenses
      const licensesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/licenses/user/${userId}`, { headers })
      const licensesResult = await licensesResponse.json()
      setLicenses(licensesResult.data || licensesResult || [])

      // Fetch user transactions
      const transactionsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/transactions/user/${userId}`, { headers })
      const transactionsResult = await transactionsResponse.json()
      setTransactions(transactionsResult.data || transactionsResult || [])

      // Fetch user activity
      const activityResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/activity/user/${userId}?limit=50`, { headers })
      const activityResult = await activityResponse.json()
      setActivities(activityResult.data || [])

    } catch (error) {
      console.error('Failed to fetch user data:', error)
      toast.error('Failed to load user information')
    } finally {
      setLoading(false)
    }
  }

  const fetchSavedCart = async () => {
    try {
      setCartLoading(true)
      const token = localStorage.getItem('access_token')
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/cart`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      })
      if (res.ok) {
        const data = await res.json()
        setSavedCart(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error('Failed to fetch saved cart:', error)
    } finally {
      setCartLoading(false)
    }
  }

  const fetchLicenseLogs = async () => {
    try {
      setLogsLoading(true)
      const token = localStorage.getItem('access_token')
      const params = new URLSearchParams({ userId, page: logsPage.toString(), limit: '15' })
      if (logsEventFilter) params.set('event', logsEventFilter)
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/licenses/logs?${params}`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      })
      if (res.ok) {
        const result = await res.json()
        setEventLogs(result.data || [])
        setLogsTotal(result.pagination?.total || 0)
        setLogsTotalPages(result.pagination?.totalPages || 1)
      }
    } catch (error) {
      console.error('Failed to fetch license logs:', error)
    } finally {
      setLogsLoading(false)
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString()
  }

  const formatCurrency = (amount: any) => {
    if (typeof amount === 'object' && amount !== null) {
      return `$${Number(amount.d?.[0] || 0).toFixed(2)}`
    }
    return `$${Number(amount || 0).toFixed(2)}`
  }

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase()
    switch (statusLower) {
      case 'active':
      case 'completed':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Active</span>
      case 'inactive':
      case 'pending':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">Pending</span>
      case 'revoked':
      case 'failed':
      case 'cancelled':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">Revoked</span>
      case 'refunded':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">Refunded</span>
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium" style={{ background: 'rgba(255,255,255,0.05)', color: '#888', border: '1px solid rgba(255,255,255,0.1)' }}>{status}</span>
    }
  }

  const tabs = [
    { id: 'details', label: 'User Details', icon: UserIcon },
    { id: 'scripts', label: 'Active Scripts', icon: Package },
    { id: 'transactions', label: 'Transactions', icon: CreditCard },
    { id: 'cart', label: 'Saved Cart', icon: ShoppingCart },
    { id: 'activity', label: 'Activity Log', icon: Activity },
    { id: 'logs', label: 'License Logs', icon: FileText },
  ]

  if (!isOpen) return null

  return (
    <ModalPortal isOpen={isOpen}>
      <div
        className="flex fixed inset-0 z-[99999] justify-center items-center p-4"
        style={{ background: 'rgba(0,0,0,0.7)' }}
      >
      <div
        className="overflow-hidden relative w-full max-w-6xl max-h-[90vh] rounded-2xl shadow-2xl"
        style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        {/* Header */}
        <div
          className="flex sticky top-0 z-10 justify-between items-center p-6 backdrop-blur-xl"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: '#111' }}
        >
          <div className="flex gap-3 items-center">
            <div
              className="flex justify-center items-center w-12 h-12 rounded-xl"
              style={{ background: 'rgba(81,162,255,0.1)', border: '1px solid rgba(81,162,255,0.2)' }}
            >
              <Shield className="w-6 h-6 text-[#51a2ff]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">User Information</h2>
              <p className="text-sm text-[#51a2ff]">{userName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex justify-center items-center w-10 h-10 text-[#888] rounded-lg transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div
          className="flex gap-2 p-4 overflow-x-auto"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(0,0,0,0.2)' }}
        >
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap text-sm"
                style={
                  activeTab === tab.id
                    ? { background: 'rgba(81,162,255,0.1)', border: '1px solid rgba(81,162,255,0.2)', color: '#51a2ff' }
                    : { color: '#888', border: '1px solid transparent' }
                }
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Content */}
        <div className="overflow-y-auto px-8 py-[4rem] space-y-6 max-h-[calc(90vh-200px)]">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-6 h-6 border-2 border-[rgba(255,255,255,0.07)] border-t-[#51a2ff] rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              {/* User Details Tab */}
              {activeTab === 'details' && userData && (
                <div className="space-y-6">
                  {/* Account Information */}
                  <div
                    className="p-6 rounded-xl"
                    style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.07)' }}
                  >
                    <h3 className="flex gap-2 items-center mb-4 text-lg font-semibold text-white">
                      <UserIcon className="w-5 h-5 text-[#51a2ff]" />
                      Account Information
                    </h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                      <div className="p-4 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
                        <p className="mb-1 text-xs text-[#888]">User ID</p>
                        <p className="font-mono text-sm font-medium text-white">{userData.id}</p>
                      </div>
                      <div className="p-4 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
                        <p className="mb-1 text-xs text-[#888]">Username</p>
                        <p className="font-medium text-white">{userData.username}</p>
                      </div>
                      <div className="p-4 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
                        <p className="mb-1 text-xs text-[#888]">Email</p>
                        <p className="font-medium text-white">{userData.email}</p>
                      </div>
                      <div className="p-4 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
                        <p className="mb-1 text-xs text-[#888]">First Name</p>
                        <p className="font-medium text-white">{userData.firstName || 'N/A'}</p>
                      </div>
                      <div className="p-4 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
                        <p className="mb-1 text-xs text-[#888]">Last Name</p>
                        <p className="font-medium text-white">{userData.lastName || 'N/A'}</p>
                      </div>
                      <div className="p-4 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
                        <p className="mb-1 text-xs text-[#888]">Role</p>
                        <div className="flex gap-2 items-center">
                          {userData.isAdmin || userData.role === 'admin' ? (
                            <>
                              <Shield className="w-4 h-4 text-[#51a2ff]" />
                              <span className="font-medium text-[#51a2ff]">Administrator</span>
                            </>
                          ) : (
                            <>
                              <UserIcon className="w-4 h-4 text-[#888]" />
                              <span className="font-medium text-white">User</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="p-4 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
                        <p className="mb-1 text-xs text-[#888]">Account Status</p>
                        <div className="flex gap-2 items-center">
                          {userData.isActive ? (
                            <>
                              <CheckCircle className="w-4 h-4 text-green-400" />
                              <span className="font-medium text-green-400">Active</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4 text-red-400" />
                              <span className="font-medium text-red-400">Inactive</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="p-4 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
                        <p className="mb-1 text-xs text-[#888]">Server Member</p>
                        <div className="flex gap-2 items-center">
                          {userData.isServerMember || userData.serverJoinedAt ? (
                            <>
                              <CheckCircle className="w-4 h-4 text-green-400" />
                              <span className="font-medium text-green-400">Yes</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4 text-[#888]" />
                              <span className="font-medium text-[#888]">No</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="p-4 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
                        <p className="mb-1 text-xs text-[#888]">Discord Username</p>
                        <p className="font-medium text-white">{userData.discordUsername || 'Not linked'}</p>
                      </div>
                    </div>
                  </div>

                  {/* IP & Security Information */}
                  <div
                    className="p-6 rounded-xl"
                    style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.07)' }}
                  >
                    <h3 className="flex gap-2 items-center mb-4 text-lg font-semibold text-white">
                      <Globe className="w-5 h-5 text-[#51a2ff]" />
                      IP & Security Information
                    </h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="p-4 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
                        <p className="mb-1 text-xs text-[#888]">Last Login IP</p>
                        <p className="font-mono text-sm font-medium text-white">{userData.lastLoginIp || 'N/A'}</p>
                      </div>
                      <div className="p-4 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
                        <p className="mb-1 text-xs text-[#888]">Licenses IP Address</p>
                        <p className="font-mono text-sm font-medium text-white">{userData.licensesIpAddress || 'Not set'}</p>
                      </div>
                      <div className="p-4 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
                        <p className="mb-1 text-xs text-[#888]">Discord ID</p>
                        <p className="font-mono text-sm font-medium text-white">{userData.discordId || 'N/A'}</p>
                      </div>
                      <div className="p-4 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
                        <p className="mb-1 text-xs text-[#888]">Email Verified</p>
                        <p className="text-sm font-medium text-white">{userData.emailVerifiedAt ? formatDate(userData.emailVerifiedAt) : 'Not verified'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Timeline Information */}
                  <div
                    className="p-6 rounded-xl"
                    style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.07)' }}
                  >
                    <h3 className="flex gap-2 items-center mb-4 text-lg font-semibold text-white">
                      <Clock className="w-5 h-5 text-[#51a2ff]" />
                      Account Timeline
                    </h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                      <div className="p-4 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
                        <p className="mb-1 text-xs text-[#888]">Account Created</p>
                        <p className="text-sm font-medium text-white">{formatDate(userData.createdAt)}</p>
                      </div>
                      <div className="p-4 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
                        <p className="mb-1 text-xs text-[#888]">Last Updated</p>
                        <p className="text-sm font-medium text-white">{formatDate(userData.updatedAt)}</p>
                      </div>
                      <div className="p-4 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
                        <p className="mb-1 text-xs text-[#888]">Last Login</p>
                        <p className="text-sm font-medium text-white">{formatDate(userData.lastLoginAt)}</p>
                      </div>
                      {userData.serverJoinedAt && (
                        <div className="p-4 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
                          <p className="mb-1 text-xs text-[#888]">Server Joined</p>
                          <p className="text-sm font-medium text-white">{formatDate(userData.serverJoinedAt)}</p>
                        </div>
                      )}
                      {userData.trialStartAt && (
                        <>
                          <div className="p-4 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
                            <p className="mb-1 text-xs text-[#888]">Trial Started</p>
                            <p className="text-sm font-medium text-white">{formatDate(userData.trialStartAt)}</p>
                          </div>
                          <div className="p-4 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
                            <p className="mb-1 text-xs text-[#888]">Trial Ends</p>
                            <p className="text-sm font-medium text-white">{formatDate(userData.trialEndAt)}</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Active Scripts Tab */}
              {activeTab === 'scripts' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-white">Active Scripts ({licenses.filter(l => l.isActive && !l.isRevoked).length})</h3>
                  </div>
                  {licenses.filter(l => l.isActive && !l.isRevoked).length > 0 ? (
                    <div className="space-y-3">
                      {licenses.filter(l => l.isActive && !l.isRevoked).map((license) => (
                        <div
                          key={license.id}
                          className="p-4 rounded-lg"
                          style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.07)' }}
                        >
                          <div className="flex gap-4 justify-between items-start">
                            <div className="flex gap-3 items-start flex-1">
                              <div
                                className="flex flex-shrink-0 justify-center items-center w-12 h-12 rounded-lg"
                                style={{ background: 'rgba(81,162,255,0.1)', border: '1px solid rgba(81,162,255,0.2)' }}
                              >
                                <Package className="w-6 h-6 text-[#51a2ff]" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-white">{license.script?.title || license.script?.name || 'Unknown Script'}</h4>
                                <div className="flex flex-wrap gap-3 mt-2 text-sm text-[#888]">
                                  <span>Version: {license.script?.version || 'N/A'}</span>
                                  <span>•</span>
                                  <span>License Type: {license.expiresAt ? 'Time-based' : 'Lifetime'}</span>
                                  {license.expiresAt && (
                                    <>
                                      <span>•</span>
                                      <span>Expires: {new Date(license.expiresAt).toLocaleDateString()}</span>
                                    </>
                                  )}
                                </div>
                                <div className="flex flex-wrap gap-3 mt-2 text-xs">
                                  <div className="flex gap-1 items-center">
                                    <Key className="w-3 h-3 text-[#555]" />
                                    <span className="font-mono text-[#888]">{license.privateKey?.substring(0, 20)}...</span>
                                  </div>
                                  {license.lastUsedIp && (
                                    <div className="flex gap-1 items-center">
                                      <Globe className="w-3 h-3 text-[#555]" />
                                      <span className="font-mono text-[#888]">{license.lastUsedIp}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col gap-2 items-end">
                              {getStatusBadge(license.isActive ? 'Active' : 'Inactive')}
                              {license.isTrial && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">Trial</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 text-center text-[#888]">
                      <Package className="mx-auto mb-3 w-16 h-16 opacity-50" />
                      <p>No active scripts</p>
                    </div>
                  )}
                </div>
              )}

              {/* Transactions Tab */}
              {activeTab === 'transactions' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-white">Transaction History ({transactions.length})</h3>
                  </div>
                  {transactions.length > 0 ? (
                    <div className="space-y-3">
                      {transactions.map((transaction) => (
                        <div
                          key={transaction.id}
                          className="p-4 rounded-lg"
                          style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.07)' }}
                        >
                          <div className="flex gap-4 justify-between items-start">
                            <div className="flex gap-3 items-start flex-1">
                              <div className="flex flex-shrink-0 justify-center items-center w-12 h-12 rounded-lg" style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)' }}>
                                <DollarSign className="w-6 h-6 text-green-400" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-white">{transaction.script?.title || transaction.script?.name || 'Unknown Script'}</h4>
                                <div className="flex flex-wrap gap-3 mt-2 text-sm text-[#888]">
                                  <span>Order ID: {transaction.orderId}</span>
                                  {transaction.paymentId && (
                                    <>
                                      <span>•</span>
                                      <span>Payment ID: {transaction.paymentId}</span>
                                    </>
                                  )}
                                </div>
                                <div className="flex flex-wrap gap-3 mt-2 text-xs text-[#555]">
                                  <span>Provider: {transaction.provider}</span>
                                  <span>•</span>
                                  <span>{formatDate(transaction.createdAt)}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col gap-2 items-end">
                              <span className="text-lg font-bold text-green-400">{formatCurrency(transaction.amount)}</span>
                              {getStatusBadge(transaction.status)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 text-center text-[#888]">
                      <CreditCard className="mx-auto mb-3 w-16 h-16 opacity-50" />
                      <p>No transactions found</p>
                    </div>
                  )}
                </div>
              )}

              {/* Saved Cart Tab */}
              {activeTab === 'cart' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <ShoppingCart className="w-5 h-5 text-[#51a2ff]" />
                      Saved Cart
                      <span className="text-sm font-normal text-[#888]">({savedCart.length} items)</span>
                    </h3>
                    <button
                      onClick={fetchSavedCart}
                      disabled={cartLoading}
                      className="flex items-center justify-center w-8 h-8 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed text-[#888] hover:text-white hover:bg-[#222]"
                      style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.07)' }}
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${cartLoading ? 'animate-spin' : ''}`} />
                    </button>
                  </div>

                  {cartLoading ? (
                    <div className="flex justify-center items-center py-12">
                      <div className="w-6 h-6 border-2 border-[rgba(255,255,255,0.07)] border-t-[#51a2ff] rounded-full animate-spin" />
                    </div>
                  ) : savedCart.length > 0 ? (
                    <>
                      {/* Summary bar */}
                      <div
                        className="flex items-center justify-between p-4 rounded-xl"
                        style={{ background: 'rgba(81,162,255,0.05)', border: '1px solid rgba(81,162,255,0.15)' }}
                      >
                        <div>
                          <p className="text-xs text-[#888]">Total Items</p>
                          <p className="text-2xl font-bold text-[#ccc]">{savedCart.length}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-[#888]">Cart Value</p>
                          <p className="text-2xl font-bold text-green-400">
                            ${savedCart.reduce((sum: number, item: any) => {
                              const price = Number(item.script?.price || 0)
                              const discount = item.script?.discountPercentage || 0
                              return sum + (discount > 0 ? price * (1 - discount / 100) : price)
                            }, 0).toFixed(2)}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {savedCart.map((item: any) => {
                          const price = Number(item.script?.price || 0)
                          const discount = item.script?.discountPercentage || 0
                          const finalPrice = discount > 0 ? price * (1 - discount / 100) : price
                          return (
                            <div
                              key={item.id}
                              className="flex items-center gap-4 p-4 rounded-lg"
                              style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.07)' }}
                            >
                              {item.script?.imageUrl ? (
                                <img src={item.script.imageUrl} alt={item.script.name} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                              ) : (
                                <div className="w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(81,162,255,0.08)', border: '1px solid rgba(81,162,255,0.15)' }}>
                                  <Package className="w-6 h-6 text-[#51a2ff]" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-white truncate">{item.script?.name || 'Unknown Script'}</p>
                                <div className="flex gap-2 mt-1 flex-wrap">
                                  {item.script?.version && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">{item.script.version}</span>
                                  )}
                                  {!item.script?.isActive && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">Unavailable</span>
                                  )}
                                </div>
                                <p className="text-xs text-[#555] mt-1">Added: {new Date(item.addedAt).toLocaleString()}</p>
                              </div>
                              <div className="text-right flex-shrink-0">
                                {discount > 0 ? (
                                  <>
                                    <p className="text-sm text-[#888] line-through">${price.toFixed(2)}</p>
                                    <p className="font-bold text-green-400">${finalPrice.toFixed(2)}</p>
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-500/10 text-orange-400 border border-orange-500/20">-{discount}%</span>
                                  </>
                                ) : (
                                  <p className="font-bold text-green-400">${price.toFixed(2)}</p>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </>
                  ) : (
                    <div className="py-12 text-center text-[#888]">
                      <ShoppingCart className="mx-auto mb-3 w-16 h-16 opacity-30" />
                      <p>No items in saved cart</p>
                      <p className="mt-1 text-xs text-[#555]">Items are saved when the user adds them to their cart</p>
                    </div>
                  )}
                </div>
              )}

              {/* Activity Log Tab */}
              {activeTab === 'activity' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-white">Activity Log ({activities.length})</h3>
                  </div>
                  {activities.length > 0 ? (
                    <div className="space-y-2">
                      {activities.map((activity, index) => (
                        <div
                          key={index}
                          className="flex gap-3 items-start p-3 rounded-lg"
                          style={{ background: '#1a1a1a' }}
                        >
                          <div
                            className="flex flex-shrink-0 justify-center items-center w-8 h-8 rounded-lg"
                            style={{ background: 'rgba(81,162,255,0.1)', border: '1px solid rgba(81,162,255,0.2)' }}
                          >
                            <Activity className="w-4 h-4 text-[#51a2ff]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white">{activity.description}</p>
                            <div className="flex flex-wrap gap-2 mt-1 text-xs text-[#555]">
                              <span>{formatDate(activity.createdAt)}</span>
                              {activity.ipAddress && (
                                <>
                                  <span>•</span>
                                  <span className="font-mono">{activity.ipAddress}</span>
                                </>
                              )}
                              {activity.actionType && (
                                <>
                                  <span>•</span>
                                  <span
                                    className="px-2 py-0.5 rounded text-[#51a2ff]"
                                    style={{ background: 'rgba(81,162,255,0.1)' }}
                                  >{activity.actionType}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 text-center text-[#888]">
                      <Activity className="mx-auto mb-3 w-16 h-16 opacity-50" />
                      <p>No activity found</p>
                    </div>
                  )}
                </div>
              )}

              {/* License Logs Tab */}
              {activeTab === 'logs' && (
                <div className="space-y-4">
                  {/* Header + filter */}
                  <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
                    <h3 className="text-lg font-semibold text-white">
                      License Event Logs
                      <span className="ml-2 text-sm font-normal text-[#888]">({logsTotal} total)</span>
                    </h3>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <div className="relative flex-1 sm:w-48">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#555]" />
                        <input
                          placeholder="Filter by event..."
                          value={logsEventFilter}
                          onChange={e => { setLogsEventFilter(e.target.value); setLogsPage(1) }}
                          className="input-base w-full pl-8 h-8 text-sm"
                        />
                      </div>
                      <button
                        onClick={fetchLicenseLogs}
                        disabled={logsLoading}
                        className="flex items-center justify-center w-8 h-8 rounded-lg transition-all disabled:opacity-40 text-[#888] hover:text-white hover:bg-[#222]"
                        style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.07)' }}
                      >
                        {logsLoading ? (
                          <div className="w-3.5 h-3.5 border-2 border-[rgba(255,255,255,0.07)] border-t-[#51a2ff] rounded-full animate-spin" />
                        ) : (
                          <Filter className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {logsLoading && eventLogs.length === 0 ? (
                    <div className="flex justify-center items-center py-12">
                      <div className="w-6 h-6 border-2 border-[rgba(255,255,255,0.07)] border-t-[#51a2ff] rounded-full animate-spin" />
                    </div>
                  ) : eventLogs.length > 0 ? (
                    <>
                      <div className="space-y-2">
                        {eventLogs.map((log) => (
                          <div
                            key={log.id}
                            className="p-3 rounded-lg transition-colors hover:bg-[#222]"
                            style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.07)' }}
                          >
                            <div className="flex flex-wrap gap-2 items-center mb-2">
                              <button
                                onClick={() => setSelectedLog(log)}
                                className="flex justify-center items-center w-6 h-6 rounded text-[#888] hover:text-[#51a2ff] hover:bg-white/10 transition-colors flex-shrink-0"
                                title="View full details"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${EVENT_COLORS[log.event] ?? 'bg-[rgba(81,162,255,0.1)] text-[#51a2ff] border border-[rgba(81,162,255,0.2)]'}`}>
                                {log.event}
                              </span>
                              {log.resourceName && (
                                <span className="px-2 py-0.5 text-xs rounded text-[#888]" style={{ background: 'rgba(255,255,255,0.04)' }}>
                                  {log.resourceName}
                                </span>
                              )}
                              {log.ip && (
                                <span className="font-mono text-xs text-[#555]">{log.ip}</span>
                              )}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-[#888]">
                              {log.details && (
                                <div><span className="text-[#555]">Details: </span>{log.details}</div>
                              )}
                              {log.hostname && (
                                <div className="truncate" title={log.hostname}>
                                  <span className="text-[#555]">Host: </span>{log.hostname}
                                </div>
                              )}
                              {log.serverName && (
                                <div><span className="text-[#555]">Server: </span>{log.serverName}</div>
                              )}
                              {log.licenseKey && (
                                <div className="font-mono truncate" title={log.licenseKey}>
                                  <span className="text-[#555] font-sans">Key: </span>{log.licenseKey}
                                </div>
                              )}
                              {log.timestamp && (
                                <div>
                                  <span className="text-[#555]">Client time: </span>
                                  {new Date(log.timestamp * 1000).toLocaleString()}
                                </div>
                              )}
                              <div>
                                <span className="text-[#555]">Received: </span>
                                {formatDate(log.createdAt)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Pagination */}
                      {logsTotalPages > 1 && (
                        <div
                          className="flex justify-between items-center pt-2"
                          style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
                        >
                          <p className="text-xs text-[#555]">
                            Page {logsPage} of {logsTotalPages}
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setLogsPage(p => Math.max(1, p - 1))}
                              disabled={logsPage === 1}
                              className="h-7 px-3 text-xs rounded-lg transition-all disabled:opacity-50 text-[#888] hover:text-white hover:bg-[#222]"
                              style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.07)' }}
                            >
                              Prev
                            </button>
                            <button
                              onClick={() => setLogsPage(p => Math.min(logsTotalPages, p + 1))}
                              disabled={logsPage === logsTotalPages}
                              className="h-7 px-3 text-xs rounded-lg transition-all disabled:opacity-50 text-[#888] hover:text-white hover:bg-[#222]"
                              style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.07)' }}
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="py-12 text-center text-[#888]">
                      <FileText className="mx-auto mb-3 w-16 h-16 opacity-30" />
                      <p>No license event logs found for this user</p>
                      <p className="mt-1 text-xs text-[#555]">
                        Logs appear when the user&apos;s Lua scripts report events
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex sticky bottom-0 justify-end gap-3 p-6 backdrop-blur-xl"
          style={{ borderTop: '1px solid rgba(255,255,255,0.07)', background: 'rgba(17,17,17,0.9)' }}
        >
          <button
            onClick={onClose}
            className="btn-primary px-6 py-2 rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
      {/* Log Detail Popup */}
      {selectedLog && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4" onClick={() => setSelectedLog(null)}>
          <div
            className="relative w-full max-w-md rounded-xl shadow-2xl overflow-hidden"
            style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Popup Header */}
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(81,162,255,0.05)' }}
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#51a2ff]" />
                <span className="text-sm font-semibold text-white">Log Details</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${EVENT_COLORS[selectedLog.event] ?? 'bg-[rgba(81,162,255,0.1)] text-[#51a2ff] border border-[rgba(81,162,255,0.2)]'}`}>
                  {selectedLog.event}
                </span>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="flex items-center justify-center w-6 h-6 rounded text-[#888] hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Popup Body */}
            <div className="p-4 space-y-2 max-h-[70vh] overflow-y-auto">
              {[
                { label: 'Log ID', value: selectedLog.id },
                { label: 'Event', value: selectedLog.event },
                { label: 'Resource', value: selectedLog.resourceName },
                { label: 'IP Address', value: selectedLog.ip, mono: true },
                { label: 'Hostname', value: selectedLog.hostname, mono: true },
                { label: 'Server Name', value: selectedLog.serverName },
                { label: 'License Key', value: selectedLog.licenseKey, mono: true },
                { label: 'Details', value: selectedLog.details },
                { label: 'Client Time', value: selectedLog.timestamp ? new Date(selectedLog.timestamp * 1000).toLocaleString() : null },
                { label: 'Received At', value: formatDate(selectedLog.createdAt) },
                { label: 'User ID', value: selectedLog.userId, mono: true },
              ].filter(row => row.value != null && row.value !== '').map(row => (
                <div key={row.label} className="flex gap-3 items-start text-sm">
                  <span className="w-28 flex-shrink-0 text-xs text-[#555] pt-0.5">{row.label}</span>
                  <span className={`flex-1 text-white break-all ${row.mono ? 'font-mono text-xs' : ''}`}>{String(row.value)}</span>
                </div>
              ))}

              {/* Raw extra fields */}
              {Object.entries(selectedLog)
                .filter(([k]) => !['id','event','resourceName','ip','hostname','serverName','licenseKey','details','timestamp','createdAt','userId'].includes(k))
                .filter(([, v]) => v != null && v !== '')
                .map(([k, v]) => (
                  <div key={k} className="flex gap-3 items-start text-sm">
                    <span className="w-28 flex-shrink-0 text-xs text-[#555] pt-0.5 capitalize">{k}</span>
                    <span className="flex-1 font-mono text-xs text-white break-all">{typeof v === 'object' ? JSON.stringify(v) : String(v)}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </ModalPortal>
  )
}
