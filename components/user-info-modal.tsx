'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { apiClient } from '@/lib/api'
import { X, User as UserIcon, Mail, Calendar, Shield, Globe, Server, Activity, Package, CreditCard, Clock, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'

interface UserInfoModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function UserInfoModal({ isOpen, onClose }: UserInfoModalProps) {
  const { user } = useAuth()
  const [licenses, setLicenses] = useState<any[]>([])
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isOpen) {
      fetchUserData()
    }
  }, [isOpen])

  const fetchUserData = async () => {
    try {
      setLoading(true)
      
      const [licensesData, activitiesData] = await Promise.all([
        apiClient.getUserLicenses(),
        apiClient.getUserActivity(1, 10)
      ])
      
      setLicenses(licensesData || [])
      setActivities(activitiesData?.data || [])
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

  const getActiveScripts = () => {
    return licenses.filter(license => license.isActive && !license.isRevoked)
  }

  if (!isOpen) return null

  return (
    <div className="flex fixed inset-0 z-50 justify-center items-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="overflow-hidden relative w-full max-w-4xl max-h-[90vh] bg-gradient-to-br rounded-2xl border shadow-2xl from-slate-900 via-slate-900 to-slate-800 border-cyan-500/30">
        {/* Header */}
        <div className="flex sticky top-0 z-10 justify-between items-center p-6 bg-gradient-to-r border-b backdrop-blur-xl from-cyan-500/20 to-blue-500/20 border-cyan-500/30">
          <div className="flex gap-3 items-center">
            <div className="flex justify-center items-center w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl">
              <UserIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">User Information</h2>
              <p className="text-sm text-cyan-400">Complete account overview</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex justify-center items-center w-10 h-10 text-gray-400 rounded-lg transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-6 max-h-[calc(90vh-100px)]">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-12 h-12 rounded-full border-b-2 border-cyan-400 animate-spin"></div>
            </div>
          ) : (
            <>
              {/* Account Details */}
              <div className="p-6 rounded-xl border bg-white/5 border-white/10">
                <h3 className="flex gap-2 items-center mb-4 text-lg font-semibold text-white">
                  <UserIcon className="w-5 h-5 text-cyan-400" />
                  Account Details
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="p-4 rounded-lg bg-white/5">
                    <p className="mb-1 text-xs text-gray-400">Username</p>
                    <p className="font-medium text-white">{user?.username || 'N/A'}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-white/5">
                    <p className="mb-1 text-xs text-gray-400">Email</p>
                    <p className="font-medium text-white">{user?.email || 'N/A'}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-white/5">
                    <p className="mb-1 text-xs text-gray-400">Discord Username</p>
                    <p className="font-medium text-white">{user?.discordUsername || 'Not linked'}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-white/5">
                    <p className="mb-1 text-xs text-gray-400">Role</p>
                    <div className="flex gap-2 items-center">
                      {user?.isAdmin ? (
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
                      {user?.isActive ? (
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
                      {user?.isServerMember ? (
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
                </div>
              </div>

              {/* IP Information */}
              <div className="p-6 rounded-xl border bg-white/5 border-white/10">
                <h3 className="flex gap-2 items-center mb-4 text-lg font-semibold text-white">
                  <Globe className="w-5 h-5 text-cyan-400" />
                  IP Information
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="p-4 rounded-lg bg-white/5">
                    <p className="mb-1 text-xs text-gray-400">Last Login IP</p>
                    <p className="font-mono text-sm font-medium text-white">{user?.lastLoginIp || 'N/A'}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-white/5">
                    <p className="mb-1 text-xs text-gray-400">Licenses IP Address</p>
                    <p className="font-mono text-sm font-medium text-white">{user?.licensesIpAddress || 'Not set'}</p>
                  </div>
                </div>
              </div>

              {/* Timestamps */}
              <div className="p-6 rounded-xl border bg-white/5 border-white/10">
                <h3 className="flex gap-2 items-center mb-4 text-lg font-semibold text-white">
                  <Clock className="w-5 h-5 text-cyan-400" />
                  Account Timeline
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="p-4 rounded-lg bg-white/5">
                    <p className="mb-1 text-xs text-gray-400">Account Created</p>
                    <p className="text-sm font-medium text-white">{formatDate(user?.createdAt)}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-white/5">
                    <p className="mb-1 text-xs text-gray-400">Last Login</p>
                    <p className="text-sm font-medium text-white">{formatDate(user?.lastLoginAt)}</p>
                  </div>
                  {user?.serverJoinedAt && (
                    <div className="p-4 rounded-lg bg-white/5">
                      <p className="mb-1 text-xs text-gray-400">Server Joined</p>
                      <p className="text-sm font-medium text-white">{formatDate(user?.serverJoinedAt)}</p>
                    </div>
                  )}
                  {user?.trialStartAt && (
                    <div className="p-4 rounded-lg bg-white/5">
                      <p className="mb-1 text-xs text-gray-400">Trial Started</p>
                      <p className="text-sm font-medium text-white">{formatDate(user?.trialStartAt)}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Active Scripts */}
              <div className="p-6 rounded-xl border bg-white/5 border-white/10">
                <h3 className="flex gap-2 items-center mb-4 text-lg font-semibold text-white">
                  <Package className="w-5 h-5 text-cyan-400" />
                  Active Scripts ({getActiveScripts().length})
                </h3>
                {getActiveScripts().length > 0 ? (
                  <div className="space-y-3">
                    {getActiveScripts().map((license) => (
                      <div key={license.id} className="flex gap-3 items-center p-4 rounded-lg bg-white/5">
                        <div className="flex flex-shrink-0 justify-center items-center w-10 h-10 bg-gradient-to-r rounded-lg from-cyan-500/20 to-blue-500/20">
                          <Package className="w-5 h-5 text-cyan-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-white truncate">{license.script?.title || license.script?.name || 'Unknown Script'}</p>
                          <div className="flex gap-3 mt-1 text-xs text-gray-400">
                            <span>Version: {license.script?.version || 'N/A'}</span>
                            {license.lastUsedIp && (
                              <span className="font-mono">Last IP: {license.lastUsedIp}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className={`px-2 py-1 text-xs rounded-full ${license.isTrial ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>
                            {license.isTrial ? 'Trial' : 'Active'}
                          </span>
                          {license.expiresAt && (
                            <span className="mt-1 text-xs text-gray-500">
                              Expires: {new Date(license.expiresAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-gray-400">
                    <Package className="mx-auto mb-2 w-12 h-12 opacity-50" />
                    <p>No active scripts</p>
                  </div>
                )}
              </div>

              {/* Recent Activity */}
              <div className="p-6 rounded-xl border bg-white/5 border-white/10">
                <h3 className="flex gap-2 items-center mb-4 text-lg font-semibold text-white">
                  <Activity className="w-5 h-5 text-cyan-400" />
                  Recent Activity
                </h3>
                {activities.length > 0 ? (
                  <div className="space-y-2">
                    {activities.slice(0, 5).map((activity, index) => (
                      <div key={index} className="flex gap-3 items-center p-3 rounded-lg bg-white/5">
                        <div className="flex flex-shrink-0 justify-center items-center w-8 h-8 bg-gradient-to-r rounded-lg from-cyan-500/20 to-blue-500/20">
                          <Activity className="w-4 h-4 text-cyan-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white">{activity.description}</p>
                          <p className="text-xs text-gray-500">{formatDate(activity.createdAt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-gray-400">
                    <Activity className="mx-auto mb-2 w-12 h-12 opacity-50" />
                    <p>No recent activity</p>
                  </div>
                )}
              </div>
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
  )
}
