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
          console.log(response)
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
        console.log('User transactions:', transactions);
        
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
      case 'Active': return 'text-green-400 bg-green-500/20';
      case 'Expired': return 'text-red-400 bg-red-500/20'; 
      case 'Revoked': return 'text-yellow-400 bg-yellow-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'download': return <Download size={20} />;
      case 'purchase': return <ShoppingCart size={20} />;
      case 'update': return <ArrowsClockwise size={20} />;
      case 'support': return <ChatCircle size={20} />;
      case 'login': return <Key size={20} />;
      case 'admin_action': return <Gear size={20} />;
      case 'script_access': return <Scroll size={20} />;
      case 'license_update': return <Package size={20} />;
      default: return <ClipboardText size={20} />;
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
      case 'overview': return <ChartBar size={18} />;
      case 'scripts': return <Scroll size={18} />;
      case 'activity': return <Lightning size={18} />;
      case 'settings': return <Gear size={18} />;
      default: return <ChartBar size={18} />;
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

  const handleValidateLicense = async (privateKey: string) => {
    try {
      // Pass the user's licenses IP address for validation
      const result = await apiClient.validateLicenseByPrivateKey(privateKey, licensesIpAddress || undefined);
      if (result.valid) {
        toast.success(t('licenseValid'));
        // Refresh licenses to show updated lastUsedIp
        window.location.reload();
      } else {
        toast.error(t('licenseInvalid'));
      }
    } catch (error) {
      console.error('Failed to validate license:', error);
      toast.error(t('licenseValidationFailed'));
    }
  };

  return (
    <main className="overflow-hidden relative pt-16 min-h-screen lg:pt-24 bg-[#030712]">
      {/* Enhanced Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(53,189,242,0.15),transparent)]"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_60%_60%_at_100%_100%,rgba(16,185,129,0.1),transparent)]"></div>
      </div>
      <div className="rotating-gradient"></div>
      <div className="absolute top-1/4 left-10 w-72 h-72 bg-cyan-500/20 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute top-40 right-20 w-96 h-96 bg-blue-600/15 rounded-full blur-[120px] animate-pulse" style={{animationDelay: '1s'}}></div>
      <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-[150px] animate-pulse" style={{animationDelay: '2s'}}></div>
      
      <div className="container px-4 py-4 mx-auto lg:px-6 lg:py-8">
        {/* Header */}
        <div className="mb-8 lg:mb-12 animate-fade-in">
          <div className="flex flex-col gap-4 justify-between mb-4 lg:flex-row lg:items-center lg:mb-6">
            <div>
              <h1 className="mb-2 text-2xl font-bold lg:text-4xl xl:text-5xl text-gradient">{t('welcome')}, {user?.username || t('user')}</h1>
              <p className="text-sm text-muted lg:text-lg">{t('subtitle')}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button variant="outline" onClick={() => window.location.href = '/scripts'} className="px-4 py-2 text-sm cursor-pointer lg:px-6 lg:py-3 lg:text-base">
                {t('newOffers')}
              </Button>
            </div>
          </div>
          

        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 lg:mb-8 animate-slide-up">
          {[
            { id: 'overview', label: t('overview') },
            { id: 'scripts', label: t('myScripts') },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 lg:px-6 py-2 lg:py-3 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 text-sm lg:text-base touch-target cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-cyan-500/30 to-blue-500/30 text-white border border-cyan-500/50'
                  : 'text-muted hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="text-sm lg:text-base">{getTabIcon(tab.id)}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fade-in">
            {/* Server Membership Status */}
            <div className="mb-8">
              <ServerMembershipStatus />
            </div>
            
            {/* Free Trial Section - Show only if user hasn't started trial */}
            {user && !user.trialStartAt && (
              <div className="mb-8 p-6 rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-900/40 via-slate-900/80 to-blue-900/40 backdrop-blur-xl animate-fade-in">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/30 to-blue-500/30 flex items-center justify-center">
                      <Rocket size={24} className="text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white mb-1">{t('startFreeTrial')}</h3>
                      <p className="text-sm text-slate-400">
                        {t('freeTrialDescription')}
                      </p>
                    </div>
                  </div>
                  <div>
                    <Button 
                      onClick={handleStartFreeTrial}
                      disabled={trialLoading}
                      className="px-6 py-3 font-semibold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/25"
                    >
                      {trialLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                          {t('starting')}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Lightning size={18} />
                          {t('startFreeTrial')}
                        </div>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Recent Activity & Payment History */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
              {/* Recent Activity */}
              <div className="p-4 card-modern lg:p-6">
                <h3 className="mb-4 text-lg font-semibold text-white lg:text-xl lg:mb-6">{t('recentActivity')}</h3>
                <div className="space-y-3 lg:space-y-4">
                  {activityLoading ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="w-8 h-8 rounded-full border-b-2 border-cyan-400 animate-spin"></div>
                    </div>
                  ) : recentActivity.length > 0 ? (
                    recentActivity.slice(0, 4).map((activity) => (
                      <div key={activity.id} className="flex gap-3 items-center p-3 rounded-lg transition-colors cursor-pointer lg:gap-4 lg:p-4 bg-white/5 hover:bg-white/10">
                        <div className="flex flex-shrink-0 justify-center items-center w-8 h-8 bg-gradient-to-r rounded-lg lg:w-10 lg:h-10 from-cyan-500/20 to-blue-500/20">
                          <div className="text-cyan-400">{getActivityIcon(activity.type)}</div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-white lg:text-sm">
                            <span className="font-medium">{translateActivityDescription(activity.description || activity.action, activity.details)}</span>
                            {activity.details && <span className="ml-1 text-muted">• {activity.details}</span>}
                          </p>
                          <p className="text-xs text-muted">{formatActivityTime(activity.createdAt || activity.time)}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-muted">
                      <Activity size={32} className="mx-auto mb-2 opacity-50" />
                      <p>{t('noRecentActivity')}</p>
                    </div>
                  )}
                </div>
                <Button variant="link" onClick={() => window.location.href = '/activity'} className="mt-3 w-full text-sm cursor-pointer lg:mt-4 lg:text-base">
                  {t('viewAllActivity')}
                </Button>
              </div>

              {/* Recent Payments */}
              <div className="p-4 card-modern lg:p-6">
                <h3 className="mb-4 text-lg font-semibold text-white lg:text-xl lg:mb-6">{t('recentPayments')}</h3>
                <div className="space-y-3 lg:space-y-4">
                  {dataLoading ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="w-8 h-8 rounded-full border-b-2 border-cyan-400 animate-spin"></div>
                    </div>
                  ) : recentPurchases.length > 0 ? (
                    recentPurchases.slice(0, 4).map((purchase) => {
                      return (
                      <div key={purchase.id} className="flex gap-3 items-center p-3 rounded-lg transition-colors cursor-pointer lg:gap-4 lg:p-4 bg-white/5 hover:bg-white/10">
                        <div className="flex flex-shrink-0 justify-center items-center w-8 h-8 bg-gradient-to-r rounded-lg lg:w-10 lg:h-10 from-green-500/20 to-emerald-500/20">
                          <CurrencyDollar size={20} className="text-green-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-white lg:text-sm font-medium truncate">{purchase.name}</p>
                          <p className="text-xs text-muted">{purchase.date}</p>
                        </div>
                        <div className="text-end">
                          <p className="text-sm font-bold text-gradient">{purchase.price === 0 ? t('freeTrial') : `$${purchase.price}`}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${purchase.status === 'completed' ? 'bg-green-500/20 text-green-400' : purchase.status === 'refunded' ? 'bg-blue-500/20 text-blue-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                            {purchase.status === 'completed' ? t('completed') : purchase.status === 'refunded' ? t('refunded') : t('pending')}
                          </span>
                        </div>
                      </div>
                    )})
                  ) : (
                    <div className="py-8 text-center text-muted">
                      <CurrencyDollar size={32} className="mx-auto mb-2 opacity-50" />
                      <p>{t('noPayments')}</p>
                    </div>
                  )}
                </div>
                <Button variant="link" onClick={() => window.location.href = '/payment-history'} className="mt-3 w-full text-sm cursor-pointer lg:mt-4 lg:text-base">
                  {t('viewPaymentHistory')}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* My Scripts Tab */}
        {activeTab === 'scripts' && (
          <div className="animate-fade-in">
            <div className="p-4 card-modern lg:p-6">
              <div className="flex flex-col gap-3 justify-between mb-4 sm:flex-row sm:items-center lg:mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-white lg:text-xl">{t('myScripts')}</h3>
                  <p className="text-sm text-muted">{t('manageScripts')}</p>
                </div>
                <div className="flex gap-2 lg:gap-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="px-3 py-2 text-xs bg-gradient-to-r cursor-pointer lg:px-4 lg:text-sm from-cyan-500/20 to-blue-500/20 border-cyan-500/30 hover:from-cyan-500/30 hover:to-blue-500/30"
                    onClick={() => setShowIpModal(true)}
                  >
                    <Gear size={14} className="mr-1" />
                    {t('quickIpSettings')}
                  </Button>

                </div>
              </div>
              
              <div className="space-y-3 lg:space-y-4">
                {licenses?.data?.map((license, index) => {
                  // Use actual license data instead of mock data
                  let licenseStatus = !license.isActive ? 'Revoked' :  (!license.isRevoked && !license.isActive) ? 'Expired' : 'Active'
                  console.log('License data:', license)
                  return (
                    <div key={license.id} className="p-4 rounded-lg border transition-colors lg:p-6 bg-white/5 border-cyan-500/20 hover:bg-white/10 group">
                      <div className="flex flex-col gap-4 justify-between lg:flex-row lg:items-start">
                        <div className="flex-1">
                          <div className="flex gap-3 items-center mb-3 lg:gap-4">
                            <div className="flex flex-shrink-0 justify-center items-center w-10 h-10 bg-gradient-to-r rounded-lg lg:w-12 lg:h-12 from-cyan-500/20 to-blue-500/20">
                              <Scroll size={20} className="text-cyan-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-semibold text-white truncate transition-colors group-hover:text-gradient lg:text-base">{license.script?.title || license.script?.name || 'Unknown Script'}</h4>
                              <div className="flex flex-wrap gap-2 items-center mt-1 lg:gap-4">
                                <span className="text-xs text-muted lg:text-sm">{license.script?.category}</span>
                                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(licenseStatus)}`}>
                                  {licenseStatus}
                                </span>
                                <span className="text-xs text-muted lg:text-sm">v{license.script?.version}</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* License Details */}
                          <div className="grid grid-cols-1 gap-4 mb-4 lg:grid-cols-2">
                            <div>
                              <label className="block mb-1 text-xs font-medium text-muted">{t('privateKey')}</label>
                              <div className="flex gap-2 items-center">
                                <input 
                                  type={showPrivateKeys.has(license.id) ? "text" : "password"} 
                                  value={showPrivateKeys.has(license.id) ? (license.privateKey || t('noPrivateKey')) : '••••••••••••••••••••••••••••••••'}
                                  readOnly
                                  className="flex-1 px-2 py-1 font-mono text-xs text-white rounded border transition-all duration-300 ease-in-out bg-white/10 border-white/20"
                                />
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => togglePrivateKey(license.id)}
                                  className="px-2 py-1 text-xs transition-all duration-200 ease-in-out cursor-pointer hover:scale-105 active:scale-95"
                                >
                                  <div className="transition-transform duration-300 ease-in-out">
                                    {showPrivateKeys.has(license.id) ? <EyeSlash size={14} className="animate-pulse" /> : <Eye size={14} />}
                                  </div>
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => copyToClipboard(license.privateKey || '')}
                                  className="px-2 py-1 text-xs cursor-pointer"
                                >
                                  {t('copy')}
                                </Button>
                              </div>
                            </div>
                            
                            <div>
                               <label className="block mb-1 text-xs font-medium text-muted">{t('allowedIp')}</label>
                               <div className="flex gap-1 items-center px-2 py-1 text-xs rounded border bg-white/10 border-white/20">
                                 <Server className="w-3 h-3" />
                                 <span className="font-mono text-white">
                                   {licensesIpAddress || t('noIpRestriction')}
                                 </span>
                               </div>
                             </div>
                          </div>
                          
                          {/* Additional Info */}
                          <div className="flex flex-wrap gap-4 items-center text-xs text-muted">
                            <span>{t('licenseType')}: <span className="font-medium text-white">
                              {license.expiresAt ? t('timeBased') : t('lifetime')}
                            </span></span>
                            {license.expiresAt && (
                              <span>{t('expires')}: <span className="font-medium text-white">
                                {new Date(license.expiresAt).toLocaleDateString()}
                              </span></span>
                            )}
                            <span>{t('lastIp')}: <span className="font-mono font-medium text-white">{license.lastUsedIp || t('neverUsed')}</span></span>
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          <span className="text-sm font-bold text-accent lg:text-base">{license.isTrial ? t('freeTrial') : `$${license.script?.price || 0}`}</span>
                          <div className="flex flex-col gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="px-3 py-2 text-xs cursor-pointer lg:px-4 lg:text-sm"
                              onClick={() => handleScriptAction(license, 'download')}
                              disabled={!license.isActive}
                            >
                              {t('download')}
                            </Button>

                            <Button 
                               variant="outline" 
                               size="sm" 
                               className="px-3 py-2 text-xs cursor-pointer lg:px-4 lg:text-sm"
                               onClick={() => handleValidateLicense(license.privateKey)}
                             >
                               {t('validate')}
                             </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {!licenses?.data || licenses.data.length === 0 && (
                <div className="py-8 text-center">
                  <div className="flex justify-center items-center mx-auto mb-4 w-16 h-16 bg-gradient-to-r rounded-full from-cyan-500/20 to-blue-500/20">
                    <Scroll size={32} className="text-cyan-400" />
                  </div>
                  <h4 className="mb-2 font-semibold text-white">{t('noScriptsFound')}</h4>
                  <p className="mb-4 text-sm text-muted">{t('noScriptsYet')}</p>
                  <Button 
                    onClick={() => window.location.href = '/scripts'}
                    className="px-6 py-2 cursor-pointer"
                  >
                    {t('browseScripts')}
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Activity Tab */}


        {/* Settings Tab - License Management */}

      </div>
      
      {/* Popup Modal */}
      {showPopup && selectedScript && (
        <div className="flex fixed inset-0 z-50 justify-center items-center p-4 bg-black/50">
          <div className="p-6 mx-4 w-full max-w-md bg-gray-900 rounded-lg border border-cyan-500/30">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">{t('scriptAction')}</h3>
              <button 
                onClick={closePopup}
                className="text-gray-400 transition-colors cursor-pointer hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-6">
              <div className="flex gap-3 items-center mb-4">
                <Scroll size={48} className="text-cyan-400" />
                <div>
                  <h4 className="text-lg font-semibold text-white">{selectedScript.name || selectedScript.title}</h4>
                  <p className="text-sm text-gray-400">{selectedScript.category?.name}</p>
                </div>
              </div>
              
              <p className="mb-4 text-sm text-gray-300">
                {t('action')}: <span className="font-semibold text-cyan-400">{selectedScript.action}</span>
              </p>
              
              <div className="flex justify-between items-center mb-4">
                <span className="text-2xl font-bold text-gradient">${selectedScript.price}</span>
                {selectedScript.status && (
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${getStatusColor(selectedScript.status)}`}>
                    {selectedScript.status}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => {
                  console.log(`${selectedScript.action} script:`, selectedScript);
                  closePopup();
                }}
                className="flex-1 py-3 font-semibold cursor-pointer btn-primary"
              >
                {t('confirm')} {selectedScript.action}
              </button>
              <button 
                onClick={closePopup}
                className="px-4 py-3 cursor-pointer btn-secondary"
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
