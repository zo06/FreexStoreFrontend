'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Download, Activity, ArrowLeft } from 'lucide-react'
import {
  ShoppingCart,
  ArrowsClockwise,
  ChatCircle,
  ClipboardText,
  Key,
  Gear,
  Scroll,
  Package,
} from 'phosphor-react'
import { apiClient } from '@/lib/api'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

export default function ActivityPage() {
  const t = useTranslations('activity');
  const tActivity = useTranslations('activityTypes');
  const tTime = useTranslations('activityTime');
  const { user } = useAuth()
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    fetchActivities()
  }, [])

  const fetchActivities = async (pageNum: number = 1) => {
    try {
      setLoading(true)
      const response = await apiClient.getUserActivity(pageNum, 20)
      if (response?.data) {
        if (pageNum === 1) {
          setActivities(response.data)
        } else {
          setActivities(prev => [...prev, ...response.data])
        }
        setHasMore(response.data.length === 20)
      }
    } catch (error) {
      console.error('Failed to fetch activities:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchActivities(nextPage)
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'download': return <Download className="w-5 h-5" />;
      case 'purchase': return <ShoppingCart size={20} />;
      case 'update': return <ArrowsClockwise size={20} />;
      case 'support': return <ChatCircle size={20} />;
      case 'login': return <Key size={20} />;
      case 'admin_action': return <Gear size={20} />;
      case 'script_access': return <Scroll size={20} />;
      case 'license_update': return <Package size={20} />;
      default: return <ClipboardText size={20} />;
    }
  }

  const translateActivityDescription = (description: string) => {
    if (/Admin action.*Granted license to user:/i.test(description)) {
      const match = description.match(/Admin action: Granted license to user: (.+) for script ID: (.+)/i);
      if (match) {
        return `${tActivity('adminGrantedLicense')}: ${match[1]} ${tActivity('forScriptId')}: ${match[2]}`;
      }
    }
    if (/IP address changed from/i.test(description)) {
      const match = description.match(/IP address changed from (.+) to (.+)/i);
      if (match) {
        return `${tActivity('ipChanged')} ${tActivity('from')} ${match[1]} ${tActivity('to')} ${match[2]}`;
      }
    }
    const patterns = [
      { regex: /Downloaded script/i, key: 'downloadedScript' },
      { regex: /Purchased script/i, key: 'purchasedScript' },
      { regex: /Updated script/i, key: 'updatedScript' },
      { regex: /Viewed script/i, key: 'viewedScript' },
      { regex: /License activated/i, key: 'licenseActivated' },
      { regex: /License validated/i, key: 'licenseValidated' },
      { regex: /IP address updated/i, key: 'ipUpdated' },
      { regex: /Started free trial/i, key: 'startedTrial' },
      { regex: /Trial expired/i, key: 'trialExpired' },
      { regex: /User logged out/i, key: 'loggedOut' },
      { regex: /Logged out/i, key: 'loggedOut' },
      { regex: /Logged in/i, key: 'loggedIn' },
      { regex: /Account created/i, key: 'accountCreated' },
      { regex: /Password changed/i, key: 'passwordChanged' },
      { regex: /Profile updated/i, key: 'profileUpdated' },
      { regex: /Created user/i, key: 'userCreated' },
      { regex: /Updated user/i, key: 'userUpdated' },
      { regex: /Deleted user/i, key: 'userDeleted' },
      { regex: /Changed.*admin status/i, key: 'adminStatusChanged' },
      { regex: /Changed.*user status/i, key: 'userStatusChanged' },
      { regex: /Activated user/i, key: 'userActivated' },
      { regex: /Deactivated user/i, key: 'userDeactivated' },
    ];
    for (const pattern of patterns) {
      if (pattern.regex.test(description)) return tActivity(pattern.key);
    }
    return description;
  };

  const formatActivityTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    if (diffMins < 1) return tTime('justNow')
    if (diffMins < 60) return tTime('minutesAgo', { minutes: diffMins })
    if (diffHours < 24) return tTime('hoursAgo', { hours: diffHours })
    if (diffDays < 7) return tTime('daysAgo', { days: diffDays })
    return date.toLocaleDateString()
  }

  const formatFullDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    })
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <div className="page-container">
        <div className="page-section">
          {/* Header */}
          <div className="mb-8">
            <Link href="/dashboard" className="inline-flex items-center gap-2 mb-5 text-sm text-[#888] hover:text-[#51a2ff] transition-colors">
              <ArrowLeft className="w-4 h-4" />
              {t('backToDashboard')}
            </Link>
            <h1 className="text-3xl font-bold text-white mb-1">{t('title')}</h1>
            <p className="text-[#888] text-sm">{t('subtitle')}</p>
          </div>

          {/* Activity List */}
          <div className="card-base p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">{t('allActivity')}</h3>
              <span className="text-sm text-[#555]">{t('activitiesCount', { count: activities.length })}</span>
            </div>

            <div className="space-y-3">
              {loading && activities.length === 0 ? (
                <div className="flex justify-center items-center py-12">
                  <div className="w-8 h-8 rounded-full border-2 border-[rgba(255,255,255,0.07)] border-t-[#51a2ff] animate-spin" />
                </div>
              ) : activities.length > 0 ? (
                activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex gap-3 items-start p-4 rounded-xl transition-colors bg-[#111] hover:bg-[#161616] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(81,162,255,0.2)]"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#1a1a1a] flex items-center justify-center" style={{ border: '1px solid rgba(81,162,255,0.15)' }}>
                      <span className="text-[#51a2ff]">{getActivityIcon(activity.type)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col gap-1 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white font-medium">
                            {translateActivityDescription(activity.description || activity.action)}
                          </p>
                          {activity.details && (
                            <p className="mt-1 text-xs text-[#555]">{activity.details}</p>
                          )}
                          <p className="mt-1 text-xs text-[#444]">{formatFullDate(activity.createdAt || activity.time)}</p>
                        </div>
                        <span className="flex-shrink-0 text-xs text-[#555] px-3 py-1 rounded-full bg-[#1a1a1a] whitespace-nowrap">
                          {formatActivityTime(activity.createdAt || activity.time)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-16 text-center">
                  <Activity className="w-12 h-12 text-[#333] mx-auto mb-4" />
                  <p className="text-white font-medium mb-1">{t('noActivity')}</p>
                  <p className="text-[#555] text-sm">{t('noActivityDescription')}</p>
                </div>
              )}
            </div>

            {hasMore && activities.length > 0 && (
              <div className="mt-6 text-center">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="btn-ghost btn-sm"
                >
                  {loading ? t('loading') : t('loadMore')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
