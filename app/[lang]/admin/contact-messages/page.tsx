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

export default function AdminContactMessagesPage() {
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
      toast.success(`Message marked as ${newStatus}`)
      setShowModal(false)
      setSelectedMessage(null)
      setAdminNotes('')
      setReplyMessage('')
      fetchMessages()
      fetchStats()
    } catch (error) {
      console.error('Failed to update message:', error)
      toast.error('Failed to update message status')
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

  if (!isAuthenticated || !user?.isAdmin) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-white">Access Denied</p>
      </div>
    )
  }

  return (
    <main className="overflow-hidden relative min-h-screen bg-gradient-to-br via-cyan-900 from-slate-900 to-slate-900">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM5QzkyQUMiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIxLjUiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r via-transparent blur-3xl from-cyan-500/10 to-blue-500/10"></div>
      
      <div className="relative z-10 p-6 mx-auto space-y-6 max-w-7xl">
        {/* Header */}
        <div className="p-6 rounded-2xl border shadow-2xl backdrop-blur-xl bg-white/5 border-white/10">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r rounded-xl border backdrop-blur-sm from-purple-500/20 to-pink-500/20 border-white/10">
                <Envelope size={32} className="text-purple-400" weight="duotone" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300">Contact Messages</h1>
                <p className="mt-1 text-gray-400">Manage customer inquiries and support requests</p>
              </div>
            </div>
            <Link href="/admin">
              <Button className="text-white bg-gradient-to-r border shadow-lg backdrop-blur-sm transition-all duration-300 from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 border-white/10 hover:shadow-xl hover:scale-105">
                <ArrowLeft size={16} className="mr-2" weight="bold" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="p-4 rounded-xl border backdrop-blur-xl bg-white/5 border-white/10">
              <p className="text-sm text-gray-400">Total</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
            <div className="p-4 rounded-xl border backdrop-blur-xl bg-yellow-500/10 border-yellow-500/30">
              <p className="text-sm text-yellow-400">Unread</p>
              <p className="text-2xl font-bold text-yellow-300">{stats.unread}</p>
            </div>
            <div className="p-4 rounded-xl border backdrop-blur-xl bg-blue-500/10 border-blue-500/30">
              <p className="text-sm text-blue-400">Read</p>
              <p className="text-2xl font-bold text-blue-300">{stats.read}</p>
            </div>
            <div className="p-4 rounded-xl border backdrop-blur-xl bg-green-500/10 border-green-500/30">
              <p className="text-sm text-green-400">Replied</p>
              <p className="text-2xl font-bold text-green-300">{stats.replied}</p>
            </div>
            <div className="p-4 rounded-xl border backdrop-blur-xl bg-gray-500/10 border-gray-500/30">
              <p className="text-sm text-gray-400">Archived</p>
              <p className="text-2xl font-bold text-gray-300">{stats.archived}</p>
            </div>
          </div>
        )}

        {/* Filter */}
        <div className="p-6 rounded-2xl border shadow-2xl backdrop-blur-xl bg-white/5 border-white/10">
          <div className="flex gap-4 items-center">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-white/10 border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="">All Messages</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
              <option value="replied">Replied</option>
              <option value="archived">Archived</option>
            </select>
            <Button onClick={fetchMessages} className="bg-cyan-600 hover:bg-cyan-700">
              Refresh
            </Button>
          </div>
        </div>

        {/* Messages List */}
        <div className="p-6 rounded-2xl border shadow-2xl backdrop-blur-xl bg-white/5 border-white/10">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-12 h-12 rounded-full border-4 animate-spin border-purple-500/30 border-t-purple-500"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <MagnifyingGlass size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg">No messages found</p>
              <p className="text-sm mt-2">Contact messages from users will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className="p-4 rounded-xl border backdrop-blur-xl bg-white/5 border-white/10 hover:bg-white/10 transition-all">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 text-xs rounded-lg border ${getStatusColor(message.status)}`}>
                          {message.status}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(message.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="text-white font-semibold mb-1">{message.subject}</h3>
                      <p className="text-sm text-gray-400 mb-2">From: {message.name} ({message.email})</p>
                      <p className="text-gray-300 text-sm line-clamp-2">{message.message}</p>
                      {message.adminNotes && (
                        <div className="mt-2 p-2 bg-blue-500/10 rounded-lg">
                          <p className="text-xs text-blue-400">Admin Notes: {message.adminNotes}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => openModal(message)} className="bg-blue-600 hover:bg-blue-700">
                        <Eye size={16} weight="bold" />
                      </Button>
                      <Button size="sm" onClick={() => handleDelete(message.id)} className="bg-red-600 hover:bg-red-700">
                        <Trash size={16} weight="bold" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-4">Message Details</h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-sm text-gray-400">Subject</label>
                <p className="text-white">{selectedMessage.subject}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">From</label>
                <p className="text-white">{selectedMessage.name} ({selectedMessage.email})</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Message</label>
                <p className="text-white whitespace-pre-wrap">{selectedMessage.message}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-2">Admin Notes</label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full px-4 py-2 bg-white/10 border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  rows={3}
                  placeholder="Add internal notes..."
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-2">Reply Message (Discord)</label>
                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  className="w-full px-4 py-2 bg-white/10 border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  rows={3}
                  placeholder="Reply to send via Discord..."
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={() => handleStatusChange(selectedMessage.id, 'read')} disabled={updating} className="bg-blue-600 hover:bg-blue-700">
                Mark as Read
              </Button>
              <Button onClick={() => handleStatusChange(selectedMessage.id, 'replied')} disabled={updating} className="bg-green-600 hover:bg-green-700">
                Mark as Replied
              </Button>
              <Button onClick={() => handleStatusChange(selectedMessage.id, 'archived')} disabled={updating} className="bg-gray-600 hover:bg-gray-700">
                Archive
              </Button>
              <Button onClick={() => setShowModal(false)} className="bg-slate-600 hover:bg-slate-700 ml-auto">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
