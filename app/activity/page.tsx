'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Download, Activity } from 'lucide-react'
import { 
  ShoppingCart, 
  ArrowsClockwise, 
  ChatCircle, 
  ClipboardText,
  Key,
  Gear,
  Scroll,
  Package,
  ArrowLeft
} from 'phosphor-react'
import { apiClient } from '@/lib/api'
import Link from 'next/link'

export default function ActivityPage() {
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
  }

  const formatActivityTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const formatFullDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

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
          <h1 className="mb-2 text-2xl font-bold lg:text-4xl text-gradient">Activity History</h1>
          <p className="text-sm text-muted lg:text-base">View all your account activity and actions</p>
        </div>

        {/* Activity List */}
        <div className="p-4 card-modern lg:p-6 animate-slide-up">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white lg:text-xl">All Activity</h3>
            <span className="text-sm text-muted">{activities.length} activities</span>
          </div>
          
          <div className="space-y-3 lg:space-y-4">
            {loading && activities.length === 0 ? (
              <div className="flex justify-center items-center py-12">
                <div className="w-8 h-8 rounded-full border-b-2 border-cyan-400 animate-spin"></div>
              </div>
            ) : activities.length > 0 ? (
              activities.map((activity) => (
                <div key={activity.id} className="flex gap-3 items-start p-4 rounded-xl transition-colors bg-white/5 hover:bg-white/10 border border-white/5 hover:border-cyan-500/30">
                  <div className="flex flex-shrink-0 justify-center items-center w-10 h-10 bg-gradient-to-r rounded-xl from-cyan-500/20 to-blue-500/20">
                    <div className="text-cyan-400">{getActivityIcon(activity.type)}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col gap-1 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-medium">
                          {activity.description || activity.action}
                        </p>
                        {activity.details && (
                          <p className="mt-1 text-xs text-muted">{activity.details}</p>
                        )}
                        <p className="mt-1 text-xs text-slate-500">{formatFullDate(activity.createdAt || activity.time)}</p>
                      </div>
                      <span className="flex-shrink-0 text-xs text-muted lg:text-sm px-3 py-1 rounded-full bg-white/5">
                        {formatActivityTime(activity.createdAt || activity.time)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-muted">
                <Activity size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg">No activity yet</p>
                <p className="text-sm mt-2">Your account activity will appear here</p>
              </div>
            )}
          </div>
          
          {hasMore && activities.length > 0 && (
            <div className="mt-6 text-center">
              <Button 
                variant="outline" 
                onClick={loadMore}
                disabled={loading}
                className="px-6 py-2 cursor-pointer"
              >
                {loading ? 'Loading...' : 'Load More'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

