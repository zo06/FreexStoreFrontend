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

interface ContactMessage {
  id: string
  name: string
  email: string
  subject: string
  message: string
  status: string
  adminNotes?: string
  replyMessage?: string
  discordId?: string
  repliedAt?: string
  createdAt: string
  updatedAt: string
}

interface Stats {
  unread: number
  read: number
  replied: number
  archived: number
  total: number
}

export default function AdminCustomRequestsPage() {
  const { user, isAuthenticated } = useAuth()
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [adminNotes, setAdminNotes] = useState('')
  const [replyMessage, setReplyMessage] = useState('')
  const [activeAction, setActiveAction] = useState<'read' | 'replied' | 'archived' | null>(null)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (user?.isAdmin) {
      fetchMessages()
      fetchStats()
    }
  }, [user, statusFilter])

  const fetchMessages = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getContactMessages({ 
        status: statusFilter || undefined,
        limit: 50 
      })
      setMessages(response.data || [])
    } catch (error) {
      console.error('Failed to fetch messages:', error)
      toast.error('Failed to load contact messages')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await apiClient.getContactStats()
      setStats(response)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    // Validate required fields based on status
    if (newStatus === 'read' && !adminNotes.trim()) {
      toast.error('Please add a comment before marking as read')
      return
    }
    if (newStatus === 'replied' && !replyMessage.trim()) {
      toast.error('Please enter a reply message to send via Discord')
      return
    }

    try {
      setUpdating(true)
      await apiClient.updateContactMessage(id, { 
        status: newStatus, 
        adminNotes,
        replyMessage: newStatus === 'replied' ? replyMessage : undefined
      })
      
      if (newStatus === 'replied') {
        toast.success('Reply sent via Discord!')
      } else {
        toast.success(`Message status updated to ${newStatus}`)
      }
      
      fetchMessages()
      fetchStats()
      setShowModal(false)
      setSelectedMessage(null)
      setActiveAction(null)
      setReplyMessage('')
    } catch (error) {
      console.error('Failed to update message:', error)
      toast.error('Failed to update message')
    } finally {
      setUpdating(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return
    
    try {
      await apiClient.deleteContactMessage(id)
      toast.success('Message deleted successfully')
      fetchMessages()
      fetchStats()
    } catch (error) {
      console.error('Failed to delete message:', error)
      toast.error('Failed to delete message')
    }
  }

  const openModal = (message: ContactMessage) => {
    setSelectedMessage(message)
    setAdminNotes(message.adminNotes || '')
    setReplyMessage(message.replyMessage || '')
    setActiveAction(null)
    setShowModal(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unread': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'read': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'replied': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'archived': return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'unread': return <Envelope size={16} />
      case 'read': return <Eye size={16} />
      case 'replied': return <CheckCircle size={16} />
      case 'archived': return <Clock size={16} />
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
              <div className="p-3 bg-gradient-to-r from-purple-600 to-pink-500 rounded-xl shadow-lg">
                <Envelope className="w-8 h-8 text-white" />
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
              <p className="text-xs text-yellow-400 mb-2">Unread</p>
              <p className="text-2xl font-bold text-yellow-400">{stats.unread}</p>
            </div>
            <div className="p-6 rounded-2xl border shadow-2xl backdrop-blur-xl transition-all duration-300 bg-gradient-to-br from-blue-900/40 to-blue-800/20 border-blue-500/20 hover:bg-blue-900/50">
              <p className="text-xs text-blue-400 mb-2">Read</p>
              <p className="text-2xl font-bold text-blue-400">{stats.read}</p>
            </div>
            <div className="p-6 rounded-2xl border shadow-2xl backdrop-blur-xl transition-all duration-300 bg-gradient-to-br from-green-900/40 to-green-800/20 border-green-500/20 hover:bg-green-900/50">
              <p className="text-xs text-green-400 mb-2">Replied</p>
              <p className="text-2xl font-bold text-green-400">{stats.replied}</p>
            </div>
            <div className="p-6 rounded-2xl border shadow-2xl backdrop-blur-xl transition-all duration-300 bg-gradient-to-br from-gray-900/40 to-gray-800/20 border-gray-500/20 hover:bg-gray-900/50">
              <p className="text-xs text-gray-400 mb-2">Archived</p>
              <p className="text-2xl font-bold text-gray-400">{stats.archived}</p>
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
              <option value="unread" className="bg-gray-900">Unread</option>
              <option value="read" className="bg-gray-900">Read</option>
              <option value="replied" className="bg-gray-900">Replied</option>
              <option value="archived" className="bg-gray-900">Archived</option>
            </select>
            <span className="text-sm text-gray-400">{messages.length} messages</span>
          </div>
        </div>

        {/* Messages List */}
        <div className="p-6 rounded-2xl border shadow-2xl backdrop-blur-xl bg-white/5 border-white/10">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-12 h-12 rounded-full border-4 animate-spin border-purple-500/30 border-t-purple-500"></div>
            </div>
          ) : messages.length > 0 ? (
            <div className="space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className="p-4 lg:p-6 rounded-xl border border-white/10 bg-slate-800/30 hover:bg-slate-800/50 transition-all duration-300">
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{msg.subject}</h3>
                        <p className="text-xs text-muted mt-1">From: {msg.name} • {formatDate(msg.createdAt)}</p>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusColor(msg.status)}`}>
                        {getStatusIcon(msg.status)}
                        {msg.status.charAt(0).toUpperCase() + msg.status.slice(1)}
                      </span>
                    </div>
                    
                    <p className="text-sm text-slate-300 mb-4 line-clamp-2">{msg.message}</p>
                    
                    <div className="flex flex-wrap gap-4 text-xs text-muted">
                      <span className="flex items-center gap-1">
                        <Envelope size={14} className="text-cyan-400" />
                        {msg.email}
                      </span>
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
              <p className="text-lg">No messages found</p>
              <p className="text-sm mt-2">Contact messages from users will appear here</p>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {showModal && selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 rounded-2xl border shadow-2xl backdrop-blur-xl bg-slate-900/95 border-white/10">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold text-white">{selectedMessage.subject}</h2>
                <p className="text-sm text-muted mt-1">From: {selectedMessage.name} • {formatDate(selectedMessage.createdAt)}</p>
              </div>
              <button
                onClick={() => { setShowModal(false); setActiveAction(null); }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XCircle size={24} />
              </button>
            </div>
            
            <div className="space-y-4 mb-6">
              {/* Original Message */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <label className="text-xs text-muted uppercase tracking-wider">Original Message</label>
                <p className="text-sm text-white mt-2 whitespace-pre-wrap">{selectedMessage.message}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted">Email</label>
                  <p className="text-sm text-white mt-1">{selectedMessage.email}</p>
                </div>
                <div>
                  <label className="text-xs text-muted">Current Status</label>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 mt-1 text-xs font-medium rounded-full border ${getStatusColor(selectedMessage.status)}`}>
                    {getStatusIcon(selectedMessage.status)}
                    {selectedMessage.status.charAt(0).toUpperCase() + selectedMessage.status.slice(1)}
                  </span>
                </div>
              </div>

              {/* Previous Reply (if exists) */}
              {selectedMessage.replyMessage && (
                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                  <label className="text-xs text-green-400 uppercase tracking-wider">Previous Reply (sent via Discord)</label>
                  <p className="text-sm text-white mt-2 whitespace-pre-wrap">{selectedMessage.replyMessage}</p>
                  {selectedMessage.repliedAt && (
                    <p className="text-xs text-muted mt-2">Sent: {formatDate(selectedMessage.repliedAt)}</p>
                  )}
                </div>
              )}

              {/* Previous Admin Notes (if exists) */}
              {selectedMessage.adminNotes && !activeAction && (
                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <label className="text-xs text-blue-400 uppercase tracking-wider">Admin Notes</label>
                  <p className="text-sm text-white mt-2 whitespace-pre-wrap">{selectedMessage.adminNotes}</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {!activeAction && (
              <div className="space-y-3">
                <p className="text-sm text-muted">Choose an action:</p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => setActiveAction('read')}
                    className="bg-blue-600 hover:bg-blue-500"
                  >
                    <Eye size={16} className="mr-2" />
                    Mark as Read
                  </Button>
                  <Button
                    onClick={() => setActiveAction('replied')}
                    className="bg-green-600 hover:bg-green-500"
                  >
                    <DiscordLogo size={16} className="mr-2" />
                    Reply via Discord
                  </Button>
                  <Button
                    onClick={() => handleStatusChange(selectedMessage.id, 'archived')}
                    disabled={updating}
                    className="bg-gray-600 hover:bg-gray-500"
                  >
                    <Clock size={16} className="mr-2" />
                    Archive (Later)
                  </Button>
                </div>
              </div>
            )}

            {/* Read Action - Requires Comment */}
            {activeAction === 'read' && (
              <div className="space-y-4 p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
                <div className="flex items-center gap-2 text-blue-400">
                  <Eye size={20} />
                  <span className="font-semibold">Mark as Read</span>
                </div>
                <div>
                  <label className="text-xs text-muted">Admin Comment <span className="text-red-400">*</span></label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add your comment about this message (required)..."
                    className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white text-sm min-h-[80px] focus:border-blue-500"
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleStatusChange(selectedMessage.id, 'read')}
                    disabled={updating || !adminNotes.trim()}
                    className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50"
                  >
                    {updating ? 'Saving...' : 'Confirm Mark as Read'}
                  </Button>
                  <Button
                    onClick={() => setActiveAction(null)}
                    variant="outline"
                    className="border-white/20"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Reply Action - Sends to Discord */}
            {activeAction === 'replied' && (
              <div className="space-y-4 p-4 rounded-xl bg-green-500/10 border border-green-500/30">
                <div className="flex items-center gap-2 text-green-400">
                  <DiscordLogo size={20} />
                  <span className="font-semibold">Reply via Discord</span>
                </div>
                <p className="text-xs text-muted">This reply will be sent to the user via Discord bot.</p>
                <div>
                  <label className="text-xs text-muted">Reply Message <span className="text-red-400">*</span></label>
                  <textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Enter your reply message to send via Discord..."
                    className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white text-sm min-h-[100px] focus:border-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-muted">Admin Notes (optional)</label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add internal notes (not sent to user)..."
                    className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white text-sm min-h-[60px]"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleStatusChange(selectedMessage.id, 'replied')}
                    disabled={updating || !replyMessage.trim()}
                    className="bg-green-600 hover:bg-green-500 disabled:opacity-50"
                  >
                    {updating ? 'Sending...' : 'Send Reply via Discord'}
                  </Button>
                  <Button
                    onClick={() => setActiveAction(null)}
                    variant="outline"
                    className="border-white/20"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  )
}

