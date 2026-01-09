'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye,
  Trash,
  MagnifyingGlass,
  Envelope,
  DiscordLogo,
  CurrencyDollar,
  CaretDown
} from 'phosphor-react'
import { apiClient } from '@/lib/api'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface CustomRequest {
  id: string
  userId: string
  title: string
  description: string
  budget: string
  timeline: string
  contactEmail: string
  contactDiscord?: string
  status: string
  adminNotes?: string
  estimatedCost?: number
  createdAt: string
  updatedAt: string
  user?: {
    username: string
    email: string
  }
}

interface Stats {
  pending: number
  reviewing: number
  accepted: number
  rejected: number
  completed: number
  total: number
}

export default function AdminCustomRequestsPage() {
  const { user, isAuthenticated } = useAuth()
  const [requests, setRequests] = useState<CustomRequest[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [selectedRequest, setSelectedRequest] = useState<CustomRequest | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [adminNotes, setAdminNotes] = useState('')
  const [estimatedCost, setEstimatedCost] = useState('')
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (user?.isAdmin) {
      fetchRequests()
      fetchStats()
    }
  }, [user, statusFilter])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getAdminCustomRequests({ 
        status: statusFilter || undefined,
        limit: 50 
      })
      setRequests(response.data || [])
    } catch (error) {
      console.error('Failed to fetch custom requests:', error)
      toast.error('Failed to load custom script requests')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await apiClient.getCustomRequestStats()
      setStats(response)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      setUpdating(true)
      await apiClient.updateCustomRequest(id, { 
        status: newStatus, 
        adminNotes: adminNotes.trim() || undefined
      })
      
      toast.success(`Request status updated to ${newStatus}`)
      
      fetchRequests()
      fetchStats()
      setShowModal(false)
      setSelectedRequest(null)
    } catch (error) {
      console.error('Failed to update request:', error)
      toast.error('Failed to update request')
    } finally {
      setUpdating(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this request?')) return
    
    try {
      await apiClient.deleteCustomRequest(id)
      toast.success('Request deleted successfully')
      fetchRequests()
      fetchStats()
    } catch (error) {
      console.error('Failed to delete request:', error)
      toast.error('Failed to delete request')
    }
  }

  const openModal = (request: CustomRequest) => {
    setSelectedRequest(request)
    setAdminNotes(request.adminNotes || '')
    setShowModal(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'in_progress': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock size={16} />
      case 'reviewing': return <Eye size={16} />
      case 'accepted': return <CheckCircle size={16} />
      case 'rejected': return <XCircle size={16} />
      case 'completed': return <CheckCircle size={16} />
      default: return <Clock size={16} />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!user?.isAdmin) {
    return (
      <main className="pt-24 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-muted">You don't have permission to view this page.</p>
        </div>
      </main>
    )
  }

  return (
    <main className="overflow-hidden relative min-h-screen bg-gradient-to-br via-cyan-900 from-slate-900 to-slate-900">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM5QzkyQUMiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIxLjUiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r via-transparent blur-3xl from-cyan-500/10 to-blue-500/10"></div>
      
      <div className="relative z-10 p-6 mx-auto space-y-6 max-w-7xl">
        {/* Header */}
        <div className="p-6 rounded-2xl border shadow-2xl backdrop-blur-xl bg-white/5 border-white/10">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r rounded-xl border backdrop-blur-sm from-purple-500/20 to-pink-500/20 border-white/10">
                <Envelope className="w-8 h-8 text-purple-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300">Custom Script Requests</h1>
                <p className="mt-1 text-gray-400">Manage and respond to custom script requests from users</p>
              </div>
            </div>
            <Link href="/admin">
              <Button className="text-white bg-gradient-to-r border shadow-lg backdrop-blur-sm transition-all duration-300 from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 border-white/10 hover:shadow-xl hover:scale-105">
                <ArrowLeft size={16} className="mr-2" />
                Back
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            <div className="p-6 rounded-2xl border shadow-2xl backdrop-blur-xl transition-all duration-300 bg-white/5 border-white/10 hover:bg-white/10">
              <p className="text-xs text-gray-400 mb-2">Total</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
            <div className="p-6 rounded-2xl border shadow-2xl backdrop-blur-xl transition-all duration-300 bg-gradient-to-br from-yellow-900/40 to-yellow-800/20 border-yellow-500/20 hover:bg-yellow-900/50">
              <p className="text-xs text-yellow-400 mb-2">Pending</p>
              <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
            </div>
            <div className="p-6 rounded-2xl border shadow-2xl backdrop-blur-xl transition-all duration-300 bg-gradient-to-br from-blue-900/40 to-blue-800/20 border-blue-500/20 hover:bg-blue-900/50">
              <p className="text-xs text-blue-400 mb-2">Reviewing</p>
              <p className="text-2xl font-bold text-blue-400">{stats.reviewing}</p>
            </div>
            <div className="p-6 rounded-2xl border shadow-2xl backdrop-blur-xl transition-all duration-300 bg-gradient-to-br from-green-900/40 to-green-800/20 border-green-500/20 hover:bg-green-900/50">
              <p className="text-xs text-green-400 mb-2">Accepted</p>
              <p className="text-2xl font-bold text-green-400">{stats.accepted}</p>
            </div>
            <div className="p-6 rounded-2xl border shadow-2xl backdrop-blur-xl transition-all duration-300 bg-gradient-to-br from-red-900/40 to-red-800/20 border-red-500/20 hover:bg-red-900/50">
              <p className="text-xs text-red-400 mb-2">Rejected</p>
              <p className="text-2xl font-bold text-red-400">{stats.rejected}</p>
            </div>
            <div className="p-6 rounded-2xl border shadow-2xl backdrop-blur-xl transition-all duration-300 bg-gradient-to-br from-purple-900/40 to-purple-800/20 border-purple-500/20 hover:bg-purple-900/50">
              <p className="text-xs text-purple-400 mb-2">Completed</p>
              <p className="text-2xl font-bold text-purple-400">{stats.completed}</p>
            </div>
          </div>
        )}

        {/* Filter */}
        <div className="p-6 rounded-2xl border shadow-2xl backdrop-blur-xl bg-white/5 border-white/10">
          <div className="flex gap-4 items-center">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 text-white rounded-xl border transition-all duration-300 bg-slate-800/50 border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="" className="bg-gray-900">All Status</option>
              <option value="pending" className="bg-gray-900">Pending</option>
              <option value="reviewing" className="bg-gray-900">Reviewing</option>
              <option value="accepted" className="bg-gray-900">Accepted</option>
              <option value="rejected" className="bg-gray-900">Rejected</option>
              <option value="completed" className="bg-gray-900">Completed</option>
            </select>
            <span className="text-sm text-gray-400">{requests.length} requests</span>
          </div>
        </div>

        {/* Requests List */}
        <div className="p-6 rounded-2xl border shadow-2xl backdrop-blur-xl bg-white/5 border-white/10">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-12 h-12 rounded-full border-4 animate-spin border-purple-500/30 border-t-purple-500"></div>
            </div>
          ) : requests.length > 0 ? (
            <div className="space-y-4">
            {requests.map((msg) => (
              <div key={msg.id} className="p-4 lg:p-6 rounded-xl border border-white/10 bg-slate-800/30 hover:bg-slate-800/50 transition-all duration-300">
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{msg.title}</h3>
                        <p className="text-xs text-muted mt-1">Budget: {msg.budget} • Timeline: {msg.timeline}</p>
                        <p className="text-xs text-muted">Submitted: {formatDate(msg.createdAt)}</p>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusColor(msg.status)}`}>
                        {getStatusIcon(msg.status)}
                        {msg.status.charAt(0).toUpperCase() + msg.status.slice(1)}
                      </span>
                    </div>
                    
                    <p className="text-sm text-slate-300 mb-4 line-clamp-2">{msg.description}</p>
                    
                    <div className="flex flex-wrap gap-4 text-xs text-muted">
                      <span className="flex items-center gap-1">
                        <Envelope size={14} className="text-cyan-400" />
                        {msg.contactEmail}
                      </span>
                      {msg.contactDiscord && (
                        <span className="flex items-center gap-1">
                          <DiscordLogo size={14} className="text-purple-400" />
                          {msg.contactDiscord}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openModal(msg)}
                      className="cursor-pointer"
                    >
                      <Eye size={16} className="mr-1" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(msg.id)}
                      className="cursor-pointer text-red-400 hover:text-red-300 border-red-500/30 hover:border-red-500/50"
                    >
                      <Trash size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            </div>
          ) : (
            <div className="py-12 text-center text-gray-400">
              <MagnifyingGlass size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg">No requests found</p>
              <p className="text-sm mt-2">Custom script requests from users will appear here</p>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 rounded-2xl border shadow-2xl backdrop-blur-xl bg-slate-900/95 border-white/10">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold text-white">{selectedRequest.title}</h2>
                <p className="text-sm text-muted mt-1">Budget: {selectedRequest.budget} • Timeline: {selectedRequest.timeline}</p>
                <p className="text-sm text-muted">Submitted: {formatDate(selectedRequest.createdAt)}</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XCircle size={24} />
              </button>
            </div>
            
            <div className="space-y-4 mb-6">
              {/* Request Description */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <label className="text-xs text-muted uppercase tracking-wider">Request Description</label>
                <p className="text-sm text-white mt-2 whitespace-pre-wrap">{selectedRequest.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted">Contact Email</label>
                  <p className="text-sm text-white mt-1">{selectedRequest.contactEmail}</p>
                </div>
                <div>
                  <label className="text-xs text-muted">Discord</label>
                  <p className="text-sm text-white mt-1">{selectedRequest.contactDiscord || 'Not provided'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted">Budget</label>
                  <p className="text-sm text-white mt-1">{selectedRequest.budget}</p>
                </div>
                <div>
                  <label className="text-xs text-muted">Timeline</label>
                  <p className="text-sm text-white mt-1">{selectedRequest.timeline}</p>
                </div>
              </div>

              <div>
                <label className="text-xs text-muted">Current Status</label>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 mt-1 text-xs font-medium rounded-full border ${getStatusColor(selectedRequest.status)}`}>
                  {getStatusIcon(selectedRequest.status)}
                  {selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}
                </span>
              </div>

              {/* Previous Admin Notes (if exists) */}
              {selectedRequest.adminNotes && (
                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <label className="text-xs text-blue-400 uppercase tracking-wider">Previous Admin Notes</label>
                  <p className="text-sm text-white mt-2 whitespace-pre-wrap">{selectedRequest.adminNotes}</p>
                </div>
              )}
            </div>

            {/* Update Status Section */}
            <div className="space-y-4 p-4 rounded-xl bg-white/5 border border-white/10">
              <div>
                <label className="text-xs text-muted">Update Status</label>
                <select
                  value={selectedRequest.status}
                  onChange={(e) => handleStatusChange(selectedRequest.id, e.target.value)}
                  disabled={updating}
                  className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white text-sm focus:border-purple-500"
                >
                  <option value="pending">Pending</option>
                  <option value="reviewing">Reviewing</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              
              <div>
                <label className="text-xs text-muted">Admin Notes</label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about this request..."
                  className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white text-sm min-h-[100px] focus:border-purple-500"
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={() => handleStatusChange(selectedRequest.id, selectedRequest.status)}
                  disabled={updating}
                  className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50"
                >
                  {updating ? 'Saving...' : 'Save Notes'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

