'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
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

  const getStatusStyle = (status: string): React.CSSProperties => {
    switch (status) {
      case 'pending': return { background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.25)', color: '#facc15' }
      case 'in_progress': return { background: 'rgba(81,162,255,0.1)', border: '1px solid rgba(81,162,255,0.25)', color: '#51a2ff' }
      case 'reviewing': return { background: 'rgba(81,162,255,0.1)', border: '1px solid rgba(81,162,255,0.25)', color: '#51a2ff' }
      case 'completed': return { background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', color: '#4ade80' }
      case 'accepted': return { background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', color: '#4ade80' }
      case 'rejected': return { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }
      default: return { background: 'rgba(107,114,128,0.1)', border: '1px solid rgba(107,114,128,0.25)', color: '#9ca3af' }
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
      <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-[#888]">You don't have permission to view this page.</p>
        </div>
      </main>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[rgba(255,255,255,0.07)] border-t-[#51a2ff] rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <div className="p-6 mx-auto space-y-6 max-w-7xl">

        {/* Header */}
        <div className="card-base p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl" style={{ background: 'rgba(81,162,255,0.1)', border: '1px solid rgba(81,162,255,0.2)' }}>
                <Envelope className="w-8 h-8 text-[#51a2ff]" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Custom Script Requests</h1>
                <p className="mt-1 text-[#888]">Manage and respond to custom script requests from users</p>
              </div>
            </div>
            <Link href="/admin">
              <button className="btn-ghost flex items-center gap-2">
                <ArrowLeft size={16} />
                Back
              </button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="card-base p-4">
              <p className="text-xs text-[#888] mb-2">Total</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
            <div className="rounded-xl p-4" style={{ background: 'rgba(234,179,8,0.07)', border: '1px solid rgba(234,179,8,0.2)' }}>
              <p className="text-xs text-yellow-400 mb-2">Pending</p>
              <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
            </div>
            <div className="rounded-xl p-4" style={{ background: 'rgba(81,162,255,0.07)', border: '1px solid rgba(81,162,255,0.2)' }}>
              <p className="text-xs text-[#51a2ff] mb-2">Reviewing</p>
              <p className="text-2xl font-bold text-[#51a2ff]">{stats.reviewing}</p>
            </div>
            <div className="rounded-xl p-4" style={{ background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.2)' }}>
              <p className="text-xs text-green-400 mb-2">Accepted</p>
              <p className="text-2xl font-bold text-green-400">{stats.accepted}</p>
            </div>
            <div className="rounded-xl p-4" style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <p className="text-xs text-red-400 mb-2">Rejected</p>
              <p className="text-2xl font-bold text-red-400">{stats.rejected}</p>
            </div>
            <div className="rounded-xl p-4" style={{ background: 'rgba(168,85,247,0.07)', border: '1px solid rgba(168,85,247,0.2)' }}>
              <p className="text-xs text-purple-400 mb-2">Completed</p>
              <p className="text-2xl font-bold text-purple-400">{stats.completed}</p>
            </div>
          </div>
        )}

        {/* Filter */}
        <div className="card-base p-6">
          <div className="flex gap-4 items-center">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-base px-4 py-2"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="reviewing">Reviewing</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
              <option value="completed">Completed</option>
            </select>
            <span className="text-sm text-[#888]">{requests.length} requests</span>
          </div>
        </div>

        {/* Requests List */}
        <div className="card-base p-6">
          {requests.length > 0 ? (
            <div className="space-y-3">
              {requests.map((msg) => (
                <div
                  key={msg.id}
                  className="rounded-xl p-4 lg:p-5 transition-colors hover:bg-[#161616]"
                  style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-white">{msg.title}</h3>
                          <p className="text-xs text-[#888] mt-1">Budget: {msg.budget} • Timeline: {msg.timeline}</p>
                          <p className="text-xs text-[#555]">Submitted: {formatDate(msg.createdAt)}</p>
                        </div>
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full"
                          style={getStatusStyle(msg.status)}
                        >
                          {getStatusIcon(msg.status)}
                          {msg.status.charAt(0).toUpperCase() + msg.status.slice(1)}
                        </span>
                      </div>

                      <p className="text-sm text-[#ccc] mb-4 line-clamp-2">{msg.description}</p>

                      <div className="flex flex-wrap gap-4 text-xs text-[#888]">
                        <span className="flex items-center gap-1">
                          <Envelope size={14} className="text-[#51a2ff]" />
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
                      <button
                        onClick={() => openModal(msg)}
                        className="p-2 rounded-lg text-[#888] hover:text-white transition-colors flex items-center gap-1 px-3 text-sm"
                        style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.07)' }}
                      >
                        <Eye size={16} className="mr-1" />
                        View
                      </button>
                      <button
                        onClick={() => handleDelete(msg.id)}
                        className="p-2 rounded-lg text-red-400 hover:text-red-300 transition-colors"
                        style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <MagnifyingGlass size={48} className="mx-auto mb-4 text-[#333]" />
              <p className="text-lg text-[#888]">No requests found</p>
              <p className="text-sm mt-2 text-[#555]">Custom script requests from users will appear here</p>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="card-base p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-white">{selectedRequest.title}</h2>
                <p className="text-sm text-[#888] mt-1">Budget: {selectedRequest.budget} • Timeline: {selectedRequest.timeline}</p>
                <p className="text-sm text-[#555]">Submitted: {formatDate(selectedRequest.createdAt)}</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg text-[#888] hover:text-white transition-colors"
                style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <XCircle size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Request Description */}
              <div className="p-4 rounded-xl" style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.06)' }}>
                <label className="text-xs text-[#555] uppercase tracking-wider">Request Description</label>
                <p className="text-sm text-[#ccc] mt-2 whitespace-pre-wrap">{selectedRequest.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-[#555]">Contact Email</label>
                  <p className="text-sm text-white mt-1">{selectedRequest.contactEmail}</p>
                </div>
                <div>
                  <label className="text-xs text-[#555]">Discord</label>
                  <p className="text-sm text-white mt-1">{selectedRequest.contactDiscord || 'Not provided'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-[#555]">Budget</label>
                  <p className="text-sm text-white mt-1">{selectedRequest.budget}</p>
                </div>
                <div>
                  <label className="text-xs text-[#555]">Timeline</label>
                  <p className="text-sm text-white mt-1">{selectedRequest.timeline}</p>
                </div>
              </div>

              <div>
                <label className="text-xs text-[#555]">Current Status</label>
                <div className="mt-1">
                  <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full"
                    style={getStatusStyle(selectedRequest.status)}
                  >
                    {getStatusIcon(selectedRequest.status)}
                    {selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}
                  </span>
                </div>
              </div>

              {/* Previous Admin Notes */}
              {selectedRequest.adminNotes && (
                <div className="p-4 rounded-xl" style={{ background: 'rgba(81,162,255,0.07)', border: '1px solid rgba(81,162,255,0.15)' }}>
                  <label className="text-xs text-[#51a2ff] uppercase tracking-wider">Previous Admin Notes</label>
                  <p className="text-sm text-white mt-2 whitespace-pre-wrap">{selectedRequest.adminNotes}</p>
                </div>
              )}
            </div>

            {/* Update Status Section */}
            <div className="space-y-4 p-4 rounded-xl" style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div>
                <label className="text-xs text-[#555] uppercase tracking-wider block mb-2">Update Status</label>
                <select
                  value={selectedRequest.status}
                  onChange={(e) => handleStatusChange(selectedRequest.id, e.target.value)}
                  disabled={updating}
                  className="input-base w-full px-3 py-2 text-sm"
                >
                  <option value="pending">Pending</option>
                  <option value="reviewing">Reviewing</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-[#555] uppercase tracking-wider block mb-2">Admin Notes</label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about this request..."
                  className="input-base w-full px-3 py-2 text-sm min-h-[100px]"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleStatusChange(selectedRequest.id, selectedRequest.status)}
                  disabled={updating}
                  className="btn-primary flex items-center gap-2 disabled:opacity-50"
                >
                  {updating ? 'Saving...' : 'Save Notes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
