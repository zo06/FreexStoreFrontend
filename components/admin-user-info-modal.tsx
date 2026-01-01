'use client'

import { useState, useEffect } from 'react'
import { X, User as UserIcon, Mail, Calendar, Shield, Globe, Server, Activity, Package, CreditCard, Clock, CheckCircle, XCircle, Eye, Key, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import toast from 'react-hot-toast'
import { ModalPortal } from '@/components/ui/modal-portal'

interface AdminUserInfoModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  userName: string
}

export default function AdminUserInfoModal({ isOpen, onClose, userId, userName }: AdminUserInfoModalProps) {
  const [activeTab, setActiveTab] = useState('details')
  const [loading, setLoading] = useState(true)
  const [userData, setUserData] = useState<any>(null)
  const [licenses, setLicenses] = useState<any[]>([])
  const [transactions, setTransactions] = useState<any[]>([])
  const [activities, setActivities] = useState<any[]>([])

  useEffect(() => {
    if (isOpen && userId) {
      fetchUserData()
    }
  }, [isOpen, userId])

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
      const user = await userResponse.json()
      setUserData(user)

      // Fetch user licenses
      const licensesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/licenses/user/${userId}`, { headers })
      const licensesData = await licensesResponse.json()
      setLicenses(licensesData || [])

      // Fetch user transactions
      const transactionsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/transactions/user/${userId}`, { headers })
      const transactionsData = await transactionsResponse.json()
      setTransactions(transactionsData || [])

      // Fetch user activity
      const activityResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/activity/user/${userId}?limit=50`, { headers })
      const activityData = await activityResponse.json()
      setActivities(activityData?.data || [])

    } catch (error) {
      console.error('Failed to fetch user data:', error)
      toast.error('Failed to load user information')
    } finally {
      setLoading(false)
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
        return <Badge className="bg-green-500/20 text-green-400">Active</Badge>
      case 'inactive':
      case 'pending':
        return <Badge className="bg-yellow-500/20 text-yellow-400">Pending</Badge>
      case 'revoked':
      case 'failed':
      case 'cancelled':
        return <Badge className="bg-red-500/20 text-red-400">Revoked</Badge>
      case 'refunded':
        return <Badge className="bg-blue-500/20 text-blue-400">Refunded</Badge>
      default:
        return <Badge className="bg-gray-500/20 text-gray-400">{status}</Badge>
    }
  }

  const tabs = [
    { id: 'details', label: 'User Details', icon: UserIcon },
    { id: 'scripts', label: 'Active Scripts', icon: Package },
    { id: 'transactions', label: 'Transactions', icon: CreditCard },
    { id: 'activity', label: 'Activity Log', icon: Activity },
  ]

  if (!isOpen) return null

  return (
    <ModalPortal isOpen={isOpen}>
      <div className="flex fixed inset-0 z-50 justify-center items-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="overflow-hidden relative w-full max-w-6xl max-h-[90vh] bg-gradient-to-br rounded-2xl border shadow-2xl from-slate-900 via-slate-900 to-slate-800 border-cyan-500/30">
        {/* Header */}
        <div className="flex sticky top-0 z-10 justify-between items-center p-6 bg-gradient-to-r border-b backdrop-blur-xl from-cyan-500/20 to-blue-500/20 border-cyan-500/30">
          <div className="flex gap-3 items-center">
            <div className="flex justify-center items-center w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">User Information</h2>
              <p className="text-sm text-cyan-400">{userName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex justify-center items-center w-10 h-10 text-gray-400 rounded-lg transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-4 border-b bg-slate-900/50 border-white/10">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-cyan-500/30 to-blue-500/30 text-white border border-cyan-500/50'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm">{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-6 max-h-[calc(90vh-200px)]">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-12 h-12 rounded-full border-b-2 border-cyan-400 animate-spin"></div>
            </div>
          ) : (
            <>
              {/* User Details Tab */}
              {activeTab === 'details' && userData && (
                <div className="space-y-6">
                  {/* Account Information */}
                  <div className="p-6 rounded-xl border bg-white/5 border-white/10">
                    <h3 className="flex gap-2 items-center mb-4 text-lg font-semibold text-white">
                      <UserIcon className="w-5 h-5 text-cyan-400" />
                      Account Information
                    </h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                      <div className="p-4 rounded-lg bg-white/5">
                        <p className="mb-1 text-xs text-gray-400">User ID</p>
                        <p className="font-mono text-sm font-medium text-white">{userData.id}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-white/5">
                        <p className="mb-1 text-xs text-gray-400">Username</p>
                        <p className="font-medium text-white">{userData.username}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-white/5">
                        <p className="mb-1 text-xs text-gray-400">Email</p>
                        <p className="font-medium text-white">{userData.email}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-white/5">
                        <p className="mb-1 text-xs text-gray-400">First Name</p>
                        <p className="font-medium text-white">{userData.firstName || 'N/A'}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-white/5">
                        <p className="mb-1 text-xs text-gray-400">Last Name</p>
                        <p className="font-medium text-white">{userData.lastName || 'N/A'}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-white/5">
                        <p className="mb-1 text-xs text-gray-400">Role</p>
                        <div className="flex gap-2 items-center">
                          {userData.isAdmin || userData.role === 'admin' ? (
                            <>
                              <Shield className="w-4 h-4 text-cyan-400" />
                              <span className="font-medium text-cyan-400">Administrator</span>
                            </>
                          ) : (
                            <>
                              <UserIcon className="w-4 h-4 text-gray-400" />
                              <span className="font-medium text-white">User</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="p-4 rounded-lg bg-white/5">
                        <p className="mb-1 text-xs text-gray-400">Account Status</p>
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
                      <div className="p-4 rounded-lg bg-white/5">
                        <p className="mb-1 text-xs text-gray-400">Server Member</p>
                        <div className="flex gap-2 items-center">
                          {userData.isServerMember || userData.serverJoinedAt ? (
                            <>
                              <CheckCircle className="w-4 h-4 text-green-400" />
                              <span className="font-medium text-green-400">Yes</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4 text-gray-400" />
                              <span className="font-medium text-gray-400">No</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="p-4 rounded-lg bg-white/5">
                        <p className="mb-1 text-xs text-gray-400">Discord Username</p>
                        <p className="font-medium text-white">{userData.discordUsername || 'Not linked'}</p>
                      </div>
                    </div>
                  </div>

                  {/* IP & Security Information */}
                  <div className="p-6 rounded-xl border bg-white/5 border-white/10">
                    <h3 className="flex gap-2 items-center mb-4 text-lg font-semibold text-white">
                      <Globe className="w-5 h-5 text-cyan-400" />
                      IP & Security Information
                    </h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="p-4 rounded-lg bg-white/5">
                        <p className="mb-1 text-xs text-gray-400">Last Login IP</p>
                        <p className="font-mono text-sm font-medium text-white">{userData.lastLoginIp || 'N/A'}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-white/5">
                        <p className="mb-1 text-xs text-gray-400">Licenses IP Address</p>
                        <p className="font-mono text-sm font-medium text-white">{userData.licensesIpAddress || 'Not set'}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-white/5">
                        <p className="mb-1 text-xs text-gray-400">Discord ID</p>
                        <p className="font-mono text-sm font-medium text-white">{userData.discordId || 'N/A'}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-white/5">
                        <p className="mb-1 text-xs text-gray-400">Email Verified</p>
                        <p className="text-sm font-medium text-white">{userData.emailVerifiedAt ? formatDate(userData.emailVerifiedAt) : 'Not verified'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Timeline Information */}
                  <div className="p-6 rounded-xl border bg-white/5 border-white/10">
                    <h3 className="flex gap-2 items-center mb-4 text-lg font-semibold text-white">
                      <Clock className="w-5 h-5 text-cyan-400" />
                      Account Timeline
                    </h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                      <div className="p-4 rounded-lg bg-white/5">
                        <p className="mb-1 text-xs text-gray-400">Account Created</p>
                        <p className="text-sm font-medium text-white">{formatDate(userData.createdAt)}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-white/5">
                        <p className="mb-1 text-xs text-gray-400">Last Updated</p>
                        <p className="text-sm font-medium text-white">{formatDate(userData.updatedAt)}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-white/5">
                        <p className="mb-1 text-xs text-gray-400">Last Login</p>
                        <p className="text-sm font-medium text-white">{formatDate(userData.lastLoginAt)}</p>
                      </div>
                      {userData.serverJoinedAt && (
                        <div className="p-4 rounded-lg bg-white/5">
                          <p className="mb-1 text-xs text-gray-400">Server Joined</p>
                          <p className="text-sm font-medium text-white">{formatDate(userData.serverJoinedAt)}</p>
                        </div>
                      )}
                      {userData.trialStartAt && (
                        <>
                          <div className="p-4 rounded-lg bg-white/5">
                            <p className="mb-1 text-xs text-gray-400">Trial Started</p>
                            <p className="text-sm font-medium text-white">{formatDate(userData.trialStartAt)}</p>
                          </div>
                          <div className="p-4 rounded-lg bg-white/5">
                            <p className="mb-1 text-xs text-gray-400">Trial Ends</p>
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
                        <div key={license.id} className="p-4 rounded-lg border bg-white/5 border-white/10">
                          <div className="flex gap-4 justify-between items-start">
                            <div className="flex gap-3 items-start flex-1">
                              <div className="flex flex-shrink-0 justify-center items-center w-12 h-12 bg-gradient-to-r rounded-lg from-cyan-500/20 to-blue-500/20">
                                <Package className="w-6 h-6 text-cyan-400" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-white">{license.script?.title || license.script?.name || 'Unknown Script'}</h4>
                                <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-400">
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
                                    <Key className="w-3 h-3 text-gray-500" />
                                    <span className="font-mono text-gray-400">{license.privateKey?.substring(0, 20)}...</span>
                                  </div>
                                  {license.lastUsedIp && (
                                    <div className="flex gap-1 items-center">
                                      <Globe className="w-3 h-3 text-gray-500" />
                                      <span className="font-mono text-gray-400">{license.lastUsedIp}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col gap-2 items-end">
                              {getStatusBadge(license.isActive ? 'Active' : 'Inactive')}
                              {license.isTrial && (
                                <Badge className="bg-yellow-500/20 text-yellow-400">Trial</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 text-center text-gray-400">
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
                        <div key={transaction.id} className="p-4 rounded-lg border bg-white/5 border-white/10">
                          <div className="flex gap-4 justify-between items-start">
                            <div className="flex gap-3 items-start flex-1">
                              <div className="flex flex-shrink-0 justify-center items-center w-12 h-12 bg-gradient-to-r rounded-lg from-green-500/20 to-emerald-500/20">
                                <DollarSign className="w-6 h-6 text-green-400" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-white">{transaction.script?.title || transaction.script?.name || 'Unknown Script'}</h4>
                                <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-400">
                                  <span>Order ID: {transaction.orderId}</span>
                                  {transaction.paymentId && (
                                    <>
                                      <span>•</span>
                                      <span>Payment ID: {transaction.paymentId}</span>
                                    </>
                                  )}
                                </div>
                                <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
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
                    <div className="py-12 text-center text-gray-400">
                      <CreditCard className="mx-auto mb-3 w-16 h-16 opacity-50" />
                      <p>No transactions found</p>
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
                        <div key={index} className="flex gap-3 items-start p-3 rounded-lg bg-white/5">
                          <div className="flex flex-shrink-0 justify-center items-center w-8 h-8 bg-gradient-to-r rounded-lg from-cyan-500/20 to-blue-500/20">
                            <Activity className="w-4 h-4 text-cyan-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white">{activity.description}</p>
                            <div className="flex flex-wrap gap-2 mt-1 text-xs text-gray-500">
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
                                  <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400">{activity.actionType}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 text-center text-gray-400">
                      <Activity className="mx-auto mb-3 w-16 h-16 opacity-50" />
                      <p>No activity found</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex sticky bottom-0 justify-end gap-3 p-6 border-t backdrop-blur-xl bg-slate-900/80 border-white/10">
          <Button
            onClick={onClose}
            className="px-6 py-2 text-white bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg transition-all duration-300 hover:from-cyan-500 hover:to-blue-500"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
    </ModalPortal>
  )
}
