'use client'

import { Clock, Download, DollarSign, Settings, Eye } from 'lucide-react'

interface ActivityItem {
  id: string
  type: 'download' | 'purchase' | 'license_update' | 'ip_change' | 'view'
  title: string
  description: string
  timestamp: string
  metadata?: {
    scriptName?: string
    amount?: number
    ipAddress?: string
    oldIpAddress?: string
  }
}

interface ActivityLogProps {
  activities: ActivityItem[]
  maxItems?: number
}

export function ActivityLog({ activities, maxItems = 10 }: ActivityLogProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'download':
        return <Download className="w-4 h-4" />
      case 'purchase':
        return <DollarSign className="w-4 h-4" />
      case 'license_update':
      case 'ip_change':
        return <Settings className="w-4 h-4" />
      case 'view':
        return <Eye className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'download':
        return 'text-blue-400 bg-blue-500/20'
      case 'purchase':
        return 'text-green-400 bg-green-500/20'
      case 'license_update':
      case 'ip_change':
        return 'text-cyan-400 bg-cyan-500/20'
      case 'view':
        return 'text-gray-400 bg-gray-500/20'
      default:
        return 'text-gray-400 bg-gray-500/20'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
      return `${diffInMinutes}m ago`
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      return `${diffInDays}d ago`
    }
  }

  const displayedActivities = activities.slice(0, maxItems)

  if (activities.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Clock className="w-8 h-8 text-muted" />
        </div>
        <h4 className="text-white font-semibold mb-2">No Activity Yet</h4>
        <p className="text-muted text-sm">Your recent activity will appear here.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {displayedActivities.map((activity) => (
        <div key={activity.id} className="flex items-start gap-4 p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getActivityColor(activity.type)}`}>
            {getActivityIcon(activity.type)}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h4 className="text-white font-medium text-sm">{activity.title}</h4>
                <p className="text-muted text-xs mt-1">{activity.description}</p>
                
                {/* Activity-specific metadata */}
                {activity.metadata && (
                  <div className="mt-2 flex flex-wrap gap-3 text-xs">
                    {activity.metadata.scriptName && (
                      <span className="text-blue-400">
                        Script: {activity.metadata.scriptName}
                      </span>
                    )}
                    {activity.metadata.amount && (
                      <span className="text-green-400">
                        Amount: ${activity.metadata.amount}
                      </span>
                    )}
                    {activity.metadata.ipAddress && (
                      <span className="text-cyan-400">
                        IP: {activity.metadata.ipAddress}
                      </span>
                    )}
                    {activity.metadata.oldIpAddress && activity.metadata.ipAddress && (
                      <span className="text-yellow-400">
                        Changed from: {activity.metadata.oldIpAddress}
                      </span>
                    )}
                  </div>
                )}
              </div>
              
              <span className="text-muted text-xs flex-shrink-0">
                {formatTimestamp(activity.timestamp)}
              </span>
            </div>
          </div>
        </div>
      ))}
      
      {activities.length > maxItems && (
        <div className="text-center pt-4">
          <p className="text-muted text-sm">
            Showing {maxItems} of {activities.length} activities
          </p>
        </div>
      )}
    </div>
  )
}
