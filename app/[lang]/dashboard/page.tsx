'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useScripts, useLicenses, useUserLicenses } from '@/lib/simple-data-fetcher'
import { UserStats, Script, License } from '@/lib/types/api.types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import ServerMembershipStatus from '@/components/server-membership-status'
import { Download, Activity, DollarSign, FileText, TrendingUp, Clock, Globe, Server, User as UserIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import {
  ShoppingCart,
  ArrowsClockwise,
  ChatCircle,
  ClipboardText,
  ChartBar,
  Scroll,
  Lightning,
  Gear,
  Package,
  CurrencyDollar,
  Rocket,
  Eye,
  EyeSlash,
  Key,
  MagnifyingGlass,
  Warning,
  Star,
  Target,
  ArrowDown
} from 'phosphor-react'
import toast from 'react-hot-toast'
import { apiClient } from '@/lib/api'
import PaymentHistory from '@/components/dashboard/payment-history'
import LicensesIpModal from '@/components/licenses-ip-modal'

export default function Dashboard() {
  const t = useTranslations('dashboard');
  const tActivity = useTranslations('activityTypes');
  const tTime = useTranslations('activityTime');
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()
  const { data: scripts, loading: scriptsLoading, error: scriptsError } = useScripts()
  const { data: licenses, loading: licensesLoading, error: licensesError } = useUserLicenses()
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [showPopup, setShowPopup] = useState(false)
  const [selectedScript, setSelectedScript] = useState<any>(null)
  const [userLicenses, setUserLicenses] = useState<any[]>([])
  const [userActivity, setUserActivity] = useState<any[]>([])
  const [showPrivateKeys, setShowPrivateKeys] = useState<Set<string>>(new Set())
  const [apiLoading, setApiLoading] = useState(true)
  const [licensesIpAddress, setLicensesIpAddress] = useState<string | null>(null)
  const [trialLoading, setTrialLoading] = useState(false)
  const [showIpModal, setShowIpModal] = useState(false)
  const [showUserInfoModal, setShowUserInfoModal] = useState(false)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router])

  const handleStartFreeTrial = async () => {
    try {
      setTrialLoading(true)
      const result = await apiClient.startFreeTrial()
      if (result.success) {
        toast.success(t('freeTrialStarted'))
        // Reload the page to refresh user data
        window.location.reload()
      }
    } catch (error: any) {
      console.error('Failed to start free trial:', error)
      toast.error(error?.message || t('freeTrialError'))
    } finally {
      setTrialLoading(false)
    }
  }

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setApiLoading(true);

        // Fetch user licenses
        const licensesData = await apiClient.getUserLicenses();
        setUserLicenses(licensesData);

        // Fetch user activity
        const activity = await apiClient.getUserActivity();
        setUserActivity(activity);

        // Fetch user's licenses IP address
        try {
          const ipResponse = await apiClient.getLicensesIp();
          setLicensesIpAddress(ipResponse?.data?.licensesIpAddress);
        } catch (error) {
          console.error('Failed to fetch licenses IP:', error);
        }

        // Update user stats based on real data
        setUserStats({
          totalUsers: 1,
          adminUsers: user?.isAdmin ? 1 : 0,
          serverMembers: user?.isServerMember ? 1 : 0,
          newUsersToday: 0,
          newUsersThisWeek: 0,
          newUsersThisMonth: 0,
          totalPurchases: licenses?.data?.length || 0,
          totalSpent: licenses?.data?.reduce((acc, cur) => acc + (cur.price || 0), 0) || 0,
          favoriteScripts: 0,
          activeProjects: 0,
          userGrowth: []
        });

      } catch (error) {
        console.error('Failed to fetch user data:', error);
        // Keep mock data on error
      } finally {
        setApiLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Get recent scripts (limit to 5)
  const recentScripts = scripts?.data ? scripts.data.slice(0, 5) : []
  const recentLicenses = licenses?.data ? licenses.data.slice(0, 5) : []
  const dataLoading = scriptsLoading || licensesLoading;
  useEffect(() => {
    if (scripts?.data && licenses?.data) {
      // Create user stats from actual data
      setUserStats({
        totalUsers: scripts?.data?.length || 0,
        adminUsers: user?.isAdmin ? 1 : 0,
        serverMembers: user?.isServerMember ? 1 : 0,
        newUsersToday: 0,
        newUsersThisWeek: 0,
        newUsersThisMonth: 0,
        totalPurchases: licenses?.data?.length || 0,
        totalSpent: licenses?.data?.reduce((acc, cur) => acc + (cur.price || 0), 0) || 0,
        favoriteScripts: 0,
        activeProjects: 0,
        userGrowth: []
      });
    }
  }, [scripts, licenses])

  const handleScriptAction = (script: any, action: string) => {
    if (action === 'download') {
      // Download the script
      apiClient.downloadScript(script.scriptId || script.id);
      toast.success(t('downloadStarted'));
    } else {
      setSelectedScript({ ...script, action })
      setShowPopup(true)
    }
  }

  const closePopup = () => {
    setShowPopup(false)
    setSelectedScript(null)
  }

  const [activeTab, setActiveTab] = useState('overview')
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [recentPurchases, setRecentPurchases] = useState<any[]>([])
  const [activityLoading, setActivityLoading] = useState(true)

  // Fetch real user activity data
  useEffect(() => {
    const fetchActivity = async () => {
      try {
        setActivityLoading(true)
        const response = await apiClient.getUserActivity(1, 10)
        if (response?.data) {
          setRecentActivity(response.data)
        }
      } catch (error) {
        console.error('Failed to fetch user activity:', error)
        // Fallback to generating activity from licenses if API fails
        if (licenses?.data && licenses.data.length > 0) {
          const activities = licenses.data.slice(0, 4).map((license, index) => {
            const actions = ['Downloaded', 'Purchased', 'Updated', 'Viewed']
            const types = ['download', 'purchase', 'update', 'view']
            const times = ['2 hours ago', '1 day ago', '3 days ago', '1 week ago']

            return {
              id: license.id || index + 1,
              type: types[index % types.length],
              action: actions[index % actions.length],
              script: license.script?.title || license.script?.name || `Script ${index + 1}`,
              time: times[index % times.length]
            }
          })
          setRecentActivity(activities)
        }
      } finally {
        setActivityLoading(false)
      }
    }

    fetchActivity()
  }, [])

  // Fetch transactions for Recent Payments
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const transactions = await apiClient.getMyTransactions();

        if (transactions && transactions.length > 0) {
          const purchases = transactions.map((transaction: any) => {
            // Handle Prisma Decimal - convert {s, e, d} object to number
            const rawPrice = transaction.amount
            const price = typeof rawPrice === 'object' && rawPrice !== null
              ? Number(rawPrice.d?.[0] || 0)
              : (typeof rawPrice === 'number' ? rawPrice : parseFloat(rawPrice) || 0)

            return {
              id: transaction.id,
              scriptId: transaction.scriptId,
              name: transaction.script?.title || transaction.script?.name || 'Unknown Script',
              category: transaction.script?.category?.name || 'Automation',
              date: new Date(transaction.createdAt).toISOString().split('T')[0],
              price: price,
              status: transaction.status.toLowerCase(),
              license: null // Transactions don't include license data
            }
          })
          setRecentPurchases(purchases)
        }
      } catch (error) {
        console.error('Failed to fetch transactions:', error)
      }
    }

    fetchTransactions()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'badge-active';
      case 'Expired': return 'badge-expired';
      case 'Revoked': return 'badge-revoked';
      default: return 'badge-default';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'download': return <Download size={16} />;
      case 'purchase': return <ShoppingCart size={16} />;
      case 'update': return <ArrowsClockwise size={16} />;
      case 'support': return <ChatCircle size={16} />;
      case 'login': return <Key size={16} />;
      case 'admin_action': return <Gear size={16} />;
      case 'script_access': return <Scroll size={16} />;
      case 'license_update': return <Package size={16} />;
      default: return <ClipboardText size={16} />;
    }
  };

  const translateActivityDescription = (description: string, details?: string) => {
    // Special handling for admin actions with details
    if (/Admin action.*Granted license to user:/i.test(description)) {
      const match = description.match(/Admin action: Granted license to user: (.+) for script ID: (.+)/i);
      if (match) {
        return `${tActivity('adminGrantedLicense')}: ${match[1]} ${tActivity('forScriptId')}: ${match[2]}`;
      }
    }

    // Special handling for IP address changed with details
    if (/IP address changed from/i.test(description)) {
      const match = description.match(/IP address changed from (.+) to (.+)/i);
      if (match) {
        return `${tActivity('ipChanged')} ${tActivity('from')} ${match[1]} ${tActivity('to')} ${match[2]}`;
      }
    }

    // Map common activity patterns to translation keys
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
      if (pattern.regex.test(description)) {
        return tActivity(pattern.key);
      }
    }

    // If no pattern matches, return original description
    return description;
  };

  const formatActivityTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return tTime('justNow');
    if (diffMins < 60) return tTime('minutesAgo', { minutes: diffMins });
    if (diffHours < 24) return tTime('hoursAgo', { hours: diffHours });
    if (diffDays < 7) return tTime('daysAgo', { days: diffDays });
    return date.toLocaleDateString();
  };

  const getTabIcon = (tabId: string) => {
    switch (tabId) {
      case 'overview': return <ChartBar size={16} />;
      case 'scripts': return <Scroll size={16} />;
      case 'activity': return <Lightning size={16} />;
      case 'settings': return <Gear size={16} />;
      default: return <ChartBar size={16} />;
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(t('copiedToClipboard'));
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error(t('copyFailed'));
    }
  };

  const togglePrivateKey = (licenseId: string) => {
    setShowPrivateKeys(prev => {
      const newSet = new Set(prev);
      if (newSet.has(licenseId)) {
        newSet.delete(licenseId);
      } else {
        newSet.add(licenseId);
      }
      return newSet;
    });
  };

  const handleUpdateIpAddress = async (licenseId: string, newIpAddress: string) => {
    try {
      if (!newIpAddress || !newIpAddress.trim()) {
        toast.error(t('enterValidIp'));
        return;
      }

      await apiClient.updateLicenseIpAddress(licenseId, newIpAddress.trim());
      toast.success(t('ipUpdated'));

      // Refresh user data
      const licenses = await apiClient.getUserLicenses();
      setUserLicenses(licenses);

    } catch (error) {
      console.error('Failed to update IP address:', error);
      toast.error(t('ipUpdateFailed'));
    }
  };


  return (
    <main className="min-h-screen pt-16 lg:pt-24" style={{ background: '#0a0a0a' }}>
      <div className="max-w-6xl mx-auto px-4 py-8 lg:px-6 lg:py-10">

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white lg:text-3xl">
                {t('welcome')}, <span className="text-[#51a2ff]">{user?.username || t('user')}</span>
              </h1>
              <p className="mt-1 text-sm" style={{ color: '#888' }}>{t('subtitle')}</p>
            </div>
            <button
              onClick={() => window.location.href = '/scripts'}
              className="btn-ghost text-sm px-4 py-2 cursor-pointer self-start sm:self-auto"
            >
              {t('newOffers')}
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-1 mb-8 p-1 rounded-xl w-fit" style={{ background: '#111' }}>
          {[
            { id: 'overview', label: t('overview') },
            { id: 'scripts', label: t('myScripts') },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[rgba(81,162,255,0.1)] text-[#51a2ff]'
                  : 'hover:text-white'
              }`}
              style={{ color: activeTab === tab.id ? '#51a2ff' : '#888' }}
            >
              {getTabIcon(tab.id)}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">

            {/* Server Membership Status */}
            <ServerMembershipStatus />

            {/* Free Trial Section - Show only if user hasn't started trial */}
            {user && !user.trialStartAt && (
              <div
                className="p-5 rounded-[14px] border"
                style={{ background: '#151515', borderColor: 'rgba(81,162,255,0.15)' }}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-start gap-4">
                    <div
                      className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: 'rgba(81,162,255,0.1)' }}
                    >
                      <Rocket size={20} className="text-[#51a2ff]" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-white mb-0.5">{t('startFreeTrial')}</h3>
                      <p className="text-sm" style={{ color: '#888' }}>
                        {t('freeTrialDescription')}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleStartFreeTrial}
                    disabled={trialLoading}
                    className="btn-primary flex items-center gap-2 text-sm px-5 py-2.5 cursor-pointer self-start lg:self-auto disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {trialLoading ? (
                      <>
                        <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        {t('starting')}
                      </>
                    ) : (
                      <>
                        <Lightning size={16} />
                        {t('startFreeTrial')}
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Active Trial Progress Widget */}
            {user && user.trialStartAt && user.trialEndAt && (() => {
              const trialEnd = new Date(user.trialEndAt);
              const trialStart = new Date(user.trialStartAt);
              const now = new Date();
              const isActive = trialEnd > now;
              const totalMs = trialEnd.getTime() - trialStart.getTime();
              const usedMs = now.getTime() - trialStart.getTime();
              const pct = Math.min(100, Math.max(0, (usedMs / totalMs) * 100));
              const hoursLeft = Math.max(0, Math.floor((trialEnd.getTime() - now.getTime()) / 3600000));
              const daysLeft = Math.floor(hoursLeft / 24);
              const hoursRemainder = hoursLeft % 24;

              if (!isActive) return null;
              return (
                <div
                  className="p-5 rounded-[14px] border"
                  style={{ background: '#151515', borderColor: 'rgba(245,158,11,0.2)' }}
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div
                        className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: 'rgba(245,158,11,0.1)' }}
                      >
                        <Clock size={20} style={{ color: '#f59e0b' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-base font-semibold text-white">Free Trial Active</h3>
                          <span
                            className="px-2 py-0.5 text-xs font-semibold rounded-full"
                            style={{ color: '#f59e0b', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}
                          >
                            {daysLeft > 0 ? `${daysLeft}d ${hoursRemainder}h left` : `${hoursLeft}h left`}
                          </span>
                        </div>
                        <div className="w-full rounded-full h-1.5 mb-1.5" style={{ background: 'rgba(255,255,255,0.06)' }}>
                          <div
                            className="h-1.5 rounded-full transition-all duration-500"
                            style={{ width: `${pct}%`, background: '#f59e0b' }}
                          />
                        </div>
                        <p className="text-xs" style={{ color: '#888' }}>
                          Trial ends {trialEnd.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => router.push('/scripts')}
                      className="btn-primary flex items-center gap-2 text-sm px-5 py-2.5 cursor-pointer self-start lg:self-auto"
                    >
                      <Rocket size={16} />
                      Upgrade to Full Access
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* Recent Activity & Payment History */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

              {/* Recent Activity */}
              <div className="card-base p-5">
                <h3 className="text-base font-semibold text-white mb-4">{t('recentActivity')}</h3>
                <div className="space-y-2">
                  {activityLoading ? (
                    <div className="flex justify-center items-center py-10">
                      <div className="w-6 h-6 rounded-full border-2 border-[#51a2ff]/30 border-t-[#51a2ff] animate-spin" />
                    </div>
                  ) : recentActivity.length > 0 ? (
                    recentActivity.slice(0, 4).map((activity) => (
                      <div
                        key={activity.id}
                        className="flex gap-3 items-center p-3 rounded-xl transition-colors cursor-pointer"
                        style={{ background: '#1a1a1a' }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#1e1e1e')}
                        onMouseLeave={e => (e.currentTarget.style.background = '#1a1a1a')}
                      >
                        <div
                          className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ background: 'rgba(81,162,255,0.08)' }}
                        >
                          <span className="text-[#51a2ff]">{getActivityIcon(activity.type)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-white leading-snug">
                            <span className="font-medium">{translateActivityDescription(activity.description || activity.action, activity.details)}</span>
                            {activity.details && <span className="ml-1" style={{ color: '#888' }}>• {activity.details}</span>}
                          </p>
                          <p className="text-xs mt-0.5" style={{ color: '#888' }}>{formatActivityTime(activity.createdAt || activity.time)}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-10 text-center">
                      <Activity size={28} className="mx-auto mb-2 opacity-30 text-white" />
                      <p className="text-sm" style={{ color: '#888' }}>{t('noRecentActivity')}</p>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => window.location.href = '/activity'}
                  className="mt-4 w-full text-sm text-[#51a2ff] hover:underline cursor-pointer text-center transition-colors"
                >
                  {t('viewAllActivity')}
                </button>
              </div>

              {/* Recent Payments */}
              <div className="card-base p-5">
                <h3 className="text-base font-semibold text-white mb-4">{t('recentPayments')}</h3>
                <div className="space-y-2">
                  {dataLoading ? (
                    <div className="flex justify-center items-center py-10">
                      <div className="w-6 h-6 rounded-full border-2 border-[#51a2ff]/30 border-t-[#51a2ff] animate-spin" />
                    </div>
                  ) : recentPurchases.length > 0 ? (
                    recentPurchases.slice(0, 4).map((purchase) => (
                      <div
                        key={purchase.id}
                        className="flex gap-3 items-center p-3 rounded-xl transition-colors cursor-pointer"
                        style={{ background: '#1a1a1a' }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#1e1e1e')}
                        onMouseLeave={e => (e.currentTarget.style.background = '#1a1a1a')}
                      >
                        <div
                          className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ background: 'rgba(81,162,255,0.08)' }}
                        >
                          <CurrencyDollar size={16} className="text-[#51a2ff]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-white truncate">{purchase.name}</p>
                          <p className="text-xs mt-0.5" style={{ color: '#888' }}>{purchase.date}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-bold text-[#51a2ff]">
                            {purchase.price === 0 ? t('freeTrial') : `$${purchase.price}`}
                          </p>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              purchase.status === 'completed'
                                ? 'text-green-400 bg-green-500/10'
                                : purchase.status === 'refunded'
                                ? 'text-[#51a2ff] bg-[rgba(81,162,255,0.1)]'
                                : 'text-yellow-400 bg-yellow-500/10'
                            }`}
                          >
                            {purchase.status === 'completed' ? t('completed') : purchase.status === 'refunded' ? t('refunded') : t('pending')}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-10 text-center">
                      <CurrencyDollar size={28} className="mx-auto mb-2 opacity-30 text-white" />
                      <p className="text-sm" style={{ color: '#888' }}>{t('noPayments')}</p>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => window.location.href = '/payment-history'}
                  className="mt-4 w-full text-sm text-[#51a2ff] hover:underline cursor-pointer text-center transition-colors"
                >
                  {t('viewPaymentHistory')}
                </button>
              </div>

            </div>
          </div>
        )}

        {/* My Scripts Tab */}
        {activeTab === 'scripts' && (
          <div>
            <div className="card-base p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-5">
                <div>
                  <h3 className="text-base font-semibold text-white">{t('myScripts')}</h3>
                  <p className="text-xs mt-0.5" style={{ color: '#888' }}>{t('manageScripts')}</p>
                </div>
                <button
                  className="btn-ghost flex items-center gap-1.5 text-xs px-3 py-2 cursor-pointer self-start sm:self-auto"
                  onClick={() => setShowIpModal(true)}
                >
                  <Gear size={13} />
                  {t('quickIpSettings')}
                </button>
              </div>

              <div className="space-y-3">
                {licenses?.data?.map((license, index) => {
                  let licenseStatus = !license.isActive ? 'Revoked' : (!license.isRevoked && !license.isActive) ? 'Expired' : 'Active'
                  return (
                    <div
                      key={license.id}
                      className="p-4 rounded-xl border transition-colors"
                      style={{ background: '#1a1a1a', borderColor: 'rgba(255,255,255,0.05)' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#1e1e1e')}
                      onMouseLeave={e => (e.currentTarget.style.background = '#1a1a1a')}
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex-1 min-w-0">

                          {/* Script title row */}
                          <div className="flex items-center gap-3 mb-3">
                            <div
                              className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center"
                              style={{ background: 'rgba(81,162,255,0.08)' }}
                            >
                              <Scroll size={16} className="text-[#51a2ff]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-semibold text-white truncate">
                                {license.script?.title || license.script?.name || 'Unknown Script'}
                              </h4>
                              <div className="flex flex-wrap gap-2 items-center mt-1">
                                <span className="text-xs" style={{ color: '#888' }}>{license.script?.category}</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(licenseStatus)}`}>
                                  {licenseStatus}
                                </span>
                                <span className="text-xs" style={{ color: '#888' }}>v{license.script?.version}</span>
                              </div>
                            </div>
                          </div>

                          {/* License Details */}
                          <div className="grid grid-cols-1 gap-3 mb-3 sm:grid-cols-2">

                            {/* Private Key */}
                            <div>
                              <label className="block mb-1 text-xs font-medium" style={{ color: '#888' }}>{t('privateKey')}</label>
                              <div className="flex gap-1.5 items-center">
                                <input
                                  type={showPrivateKeys.has(license.id) ? 'text' : 'password'}
                                  value={showPrivateKeys.has(license.id) ? (license.privateKey || t('noPrivateKey')) : '••••••••••••••••••••••••••••••••'}
                                  readOnly
                                  className="flex-1 px-2.5 py-1.5 font-mono text-xs text-white rounded-lg outline-none"
                                  style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.07)' }}
                                />
                                <button
                                  onClick={() => togglePrivateKey(license.id)}
                                  className="flex-shrink-0 p-1.5 rounded-lg transition-colors cursor-pointer text-[#51a2ff] hover:bg-[rgba(81,162,255,0.08)]"
                                >
                                  {showPrivateKeys.has(license.id) ? <EyeSlash size={14} /> : <Eye size={14} />}
                                </button>
                                <button
                                  onClick={() => copyToClipboard(license.privateKey || '')}
                                  className="flex-shrink-0 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer text-[#51a2ff] hover:bg-[rgba(81,162,255,0.08)]"
                                  style={{ border: '1px solid rgba(81,162,255,0.2)' }}
                                >
                                  {t('copy')}
                                </button>
                              </div>
                            </div>

                            {/* Allowed IP */}
                            <div>
                              <label className="block mb-1 text-xs font-medium" style={{ color: '#888' }}>{t('allowedIp')}</label>
                              <div
                                className="flex gap-1.5 items-center px-2.5 py-1.5 text-xs rounded-lg"
                                style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.07)' }}
                              >
                                <Server className="w-3 h-3 flex-shrink-0" style={{ color: '#888' }} />
                                <span className="font-mono text-white truncate">
                                  {licensesIpAddress || t('noIpRestriction')}
                                </span>
                              </div>
                            </div>

                          </div>

                          {/* Additional Info */}
                          <div className="flex flex-wrap gap-3 text-xs" style={{ color: '#888' }}>
                            <span>
                              {t('licenseType')}:{' '}
                              <span className="font-medium text-white">
                                {license.expiresAt ? t('timeBased') : t('lifetime')}
                              </span>
                            </span>
                            {license.expiresAt && (
                              <span>
                                {t('expires')}:{' '}
                                <span className="font-medium text-white">
                                  {new Date(license.expiresAt).toLocaleDateString()}
                                </span>
                              </span>
                            )}
                            <span>
                              {t('lastIp')}:{' '}
                              <span className="font-mono font-medium text-white">{license.lastUsedIp || t('neverUsed')}</span>
                            </span>
                          </div>

                        </div>

                        {/* Price + Download */}
                        <div className="flex flex-col gap-2 lg:items-end lg:flex-shrink-0">
                          <span className="text-sm font-bold text-[#51a2ff]">
                            {license.isTrial ? t('freeTrial') : `$${license.script?.price || 0}`}
                          </span>
                          <button
                            className="btn-primary text-xs px-4 py-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            onClick={() => handleScriptAction(license, 'download')}
                            disabled={!license.isActive}
                          >
                            {t('download')}
                          </button>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>

              {(!licenses?.data || licenses.data.length === 0) && (
                <div className="py-12 text-center">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ background: 'rgba(81,162,255,0.08)' }}
                  >
                    <Scroll size={24} className="text-[#51a2ff]" />
                  </div>
                  <h4 className="font-semibold text-white mb-1">{t('noScriptsFound')}</h4>
                  <p className="text-sm mb-5" style={{ color: '#888' }}>{t('noScriptsYet')}</p>
                  <button
                    onClick={() => window.location.href = '/scripts'}
                    className="btn-primary px-6 py-2.5 text-sm cursor-pointer"
                  >
                    {t('browseScripts')}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* Popup Modal */}
      {showPopup && selectedScript && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div
            className="w-full max-w-md rounded-[14px] border p-6"
            style={{ background: '#151515', borderColor: 'rgba(255,255,255,0.07)' }}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-white">{t('scriptAction')}</h3>
              <button
                onClick={closePopup}
                className="transition-colors cursor-pointer hover:text-white"
                style={{ color: '#888' }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-5">
              <div className="flex gap-3 items-center mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(81,162,255,0.08)' }}
                >
                  <Scroll size={20} className="text-[#51a2ff]" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">{selectedScript.name || selectedScript.title}</h4>
                  <p className="text-xs" style={{ color: '#888' }}>{selectedScript.category?.name}</p>
                </div>
              </div>

              <p className="text-sm mb-4" style={{ color: '#999' }}>
                {t('action')}: <span className="font-semibold text-[#51a2ff]">{selectedScript.action}</span>
              </p>

              <div className="flex items-center justify-between mb-4">
                <span className="text-xl font-black text-[#51a2ff]">${selectedScript.price}</span>
                {selectedScript.status && (
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${getStatusColor(selectedScript.status)}`}>
                    {selectedScript.status}
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => { closePopup(); }}
                className="btn-primary flex-1 py-2.5 text-sm font-semibold cursor-pointer"
              >
                {t('confirm')} {selectedScript.action}
              </button>
              <button
                onClick={closePopup}
                className="btn-ghost px-4 py-2.5 text-sm cursor-pointer"
              >
                {t('cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Licenses IP Modal */}
      <LicensesIpModal
        isOpen={showIpModal}
        onClose={() => setShowIpModal(false)}
      />

      {/* User Info Modal */}

    </main>
  );
}
