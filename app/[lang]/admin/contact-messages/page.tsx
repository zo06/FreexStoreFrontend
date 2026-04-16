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

  const getStatusStyle = (status: string): React.CSSProperties => {
    switch (status) {
      case 'unread': return { background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.25)', color: '#facc15' }
      case 'read': return { background: 'rgba(81,162,255,0.1)', border: '1px solid rgba(81,162,255,0.25)', color: '#51a2ff' }
      case 'replied': return { background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', color: '#4ade80' }
      case 'archived': return { background: 'rgba(107,114,128,0.1)', border: '1px solid rgba(107,114,128,0.25)', color: '#9ca3af' }
      default: return { background: 'rgba(107,114,128,0.1)', border: '1px solid rgba(107,114,128,0.25)', color: '#9ca3af' }
    }
  }

  if (!isAuthenticated || !user?.isAdmin) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <p className="text-white">Access Denied</p>
      </div>
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
                <Envelope size={32} className="text-[#51a2ff]" weight="duotone" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Contact Messages</h1>
                <p className="mt-1 text-[#888]">Manage customer inquiries and support requests</p>
              </div>
            </div>
            <Link href="/admin">
              <button className="btn-ghost flex items-center gap-2">
                <ArrowLeft size={16} weight="bold" />
                Back to Dashboard
              </button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="card-base p-4">
              <p className="text-sm text-[#888]">Total</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
            <div className="rounded-xl p-4" style={{ background: 'rgba(234,179,8,0.07)', border: '1px solid rgba(234,179,8,0.2)' }}>
              <p className="text-sm text-yellow-400">Unread</p>
              <p className="text-2xl font-bold text-yellow-300">{stats.unread}</p>
            </div>
            <div className="rounded-xl p-4" style={{ background: 'rgba(81,162,255,0.07)', border: '1px solid rgba(81,162,255,0.2)' }}>
              <p className="text-sm text-[#51a2ff]">Read</p>
              <p className="text-2xl font-bold" style={{ color: '#7bbcff' }}>{stats.read}</p>
            </div>
            <div className="rounded-xl p-4" style={{ background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.2)' }}>
              <p className="text-sm text-green-400">Replied</p>
              <p className="text-2xl font-bold text-green-300">{stats.replied}</p>
            </div>
            <div className="rounded-xl p-4" style={{ background: 'rgba(107,114,128,0.07)', border: '1px solid rgba(107,114,128,0.2)' }}>
              <p className="text-sm text-[#888]">Archived</p>
              <p className="text-2xl font-bold text-[#aaa]">{stats.archived}</p>
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
              <option value="">All Messages</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
              <option value="replied">Replied</option>
              <option value="archived">Archived</option>
            </select>
            <button onClick={fetchMessages} className="btn-primary flex items-center gap-2">
              Refresh
            </button>
          </div>
        </div>

        {/* Messages List */}
        <div className="card-base p-6">
          {messages.length === 0 ? (
            <div className="py-12 text-center text-[#555]">
              <MagnifyingGlass size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg text-[#888]">No messages found</p>
              <p className="text-sm mt-2">Contact messages from users will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className="rounded-xl p-4 transition-colors hover:bg-[#161616]"
                  style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className="px-2 py-1 text-xs rounded-lg font-medium"
                          style={getStatusStyle(message.status)}
                        >
                          {message.status}
                        </span>
                        <span className="text-xs text-[#555]">
                          {new Date(message.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="text-white font-semibold mb-1">{message.subject}</h3>
                      <p className="text-sm text-[#888] mb-2">From: {message.name} ({message.email})</p>
                      <p className="text-[#ccc] text-sm line-clamp-2">{message.message}</p>
                      {message.adminNotes && (
                        <div className="mt-2 p-2 rounded-lg" style={{ background: 'rgba(81,162,255,0.08)', border: '1px solid rgba(81,162,255,0.15)' }}>
                          <p className="text-xs text-[#51a2ff]">Admin Notes: {message.adminNotes}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openModal(message)}
                        className="p-2 rounded-lg text-[#888] hover:text-white transition-colors"
                        style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.07)' }}
                      >
                        <Eye size={16} weight="bold" />
                      </button>
                      <button
                        onClick={() => handleDelete(message.id)}
                        className="p-2 rounded-lg text-red-400 hover:text-red-300 transition-colors"
                        style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
                      >
                        <Trash size={16} weight="bold" />
                      </button>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="card-base p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Message Details</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg text-[#888] hover:text-white transition-colors"
                style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <XCircle size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-[#555] uppercase tracking-wider mb-1">Subject</p>
                <p className="text-white">{selectedMessage.subject}</p>
              </div>
              <div>
                <p className="text-xs text-[#555] uppercase tracking-wider mb-1">From</p>
                <p className="text-white">{selectedMessage.name} ({selectedMessage.email})</p>
              </div>
              <div>
                <p className="text-xs text-[#555] uppercase tracking-wider mb-1">Message</p>
                <p className="text-[#ccc] whitespace-pre-wrap">{selectedMessage.message}</p>
              </div>
              <div>
                <label className="text-xs text-[#555] uppercase tracking-wider block mb-2">Admin Notes</label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="input-base w-full px-4 py-2"
                  rows={3}
                  placeholder="Add internal notes..."
                />
              </div>
              <div>
                <label className="text-xs text-[#555] uppercase tracking-wider block mb-2">Reply Message (Discord)</label>
                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  className="input-base w-full px-4 py-2"
                  rows={3}
                  placeholder="Reply to send via Discord..."
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <button
                onClick={() => handleStatusChange(selectedMessage.id, 'read')}
                disabled={updating}
                className="btn-primary flex items-center gap-2 disabled:opacity-50"
              >
                Mark as Read
              </button>
              <button
                onClick={() => handleStatusChange(selectedMessage.id, 'replied')}
                disabled={updating}
                className="px-3 py-1.5 text-sm rounded-lg font-medium flex items-center gap-2 disabled:opacity-50"
                style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', color: '#4ade80' }}
              >
                Mark as Replied
              </button>
              <button
                onClick={() => handleStatusChange(selectedMessage.id, 'archived')}
                disabled={updating}
                className="px-3 py-1.5 text-sm rounded-lg font-medium flex items-center gap-2 disabled:opacity-50"
                style={{ background: 'rgba(107,114,128,0.1)', border: '1px solid rgba(107,114,128,0.25)', color: '#9ca3af' }}
              >
                Archive
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="btn-ghost flex items-center gap-2 ml-auto"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
