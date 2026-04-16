'use client'

import { useState, useEffect, useCallback } from 'react'
import { withAdminAuth } from '@/lib/auth-context'
import {
  Shield, RefreshCw, Trash2, ChevronDown, ChevronUp, Search,
  ArrowLeft, Clock, User, Globe, Zap, AlertTriangle, Filter,
  CheckCircle, XCircle, Eye, Download, Calendar
} from 'lucide-react'
import toast from 'react-hot-toast'

interface AuditLog {
  id: string
  adminId: string
  adminUsername: string
  method: string
  path: string
  action: string | null
  requestBody: string | null
  responseBody: string | null
  statusCode: number | null
  ipAddress: string | null
  userAgent: string | null
  durationMs: number | null
  createdAt: string
  admin?: { id: string; username: string; email: string; discordAvatar?: string }
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface Stats {
  total: number
  todayCount: number
  errors4xx: number
  errors5xx: number
}

const API = process.env.NEXT_PUBLIC_API_URL

const METHOD_COLORS: Record<string, string> = {
  GET:    'bg-blue-500/20 text-blue-300 border-blue-500/30',
  POST:   'bg-green-500/20 text-green-300 border-green-500/30',
  PUT:    'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  PATCH:  'bg-orange-500/20 text-orange-300 border-orange-500/30',
  DELETE: 'bg-red-500/20 text-red-300 border-red-500/30',
}

function statusColor(code: number | null) {
  if (!code) return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
  if (code < 300) return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
  if (code < 400) return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
  if (code < 500) return 'bg-orange-500/20 text-orange-300 border-orange-500/30'
  return 'bg-red-500/20 text-red-300 border-red-500/30'
}

function formatJson(raw: string | null): string {
  if (!raw) return ''
  try { return JSON.stringify(JSON.parse(raw), null, 2) } catch { return raw }
}

function JsonBlock({ label, raw }: { label: string; raw: string | null }) {
  if (!raw) return null
  return (
    <div>
      <p className="mb-1 text-xs font-semibold text-[#888] uppercase tracking-wider">{label}</p>
      <pre className="overflow-x-auto p-3 text-xs rounded-lg max-h-48 text-emerald-300 whitespace-pre-wrap break-all" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)' }}>
        {formatJson(raw)}
      </pre>
    </div>
  )
}

function AdminAuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 1 })
  const [stats, setStats] = useState<Stats>({ total: 0, todayCount: 0, errors4xx: 0, errors5xx: 0 })
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Filters
  const [search, setSearch] = useState('')
  const [methodFilter, setMethodFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  // Dialogs
  const [clearDialogOpen, setClearDialogOpen] = useState(false)
  const [clearOldDialogOpen, setClearOldDialogOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const authHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem('access_token')}`,
    'Content-Type': 'application/json',
  })

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${API}/admin/audit-logs/stats`, { headers: authHeaders() })
      if (res.ok) setStats(await res.json())
    } catch { /* silent */ }
  }, [])

  const fetchLogs = useCallback(async (showSpinner = false) => {
    if (showSpinner) setLoading(true)
    try {
      const params = new URLSearchParams({ page: currentPage.toString(), limit: '20' })
      if (search) params.append('search', search)
      if (methodFilter) params.append('method', methodFilter)
      if (statusFilter) params.append('statusCode', statusFilter)
      if (dateFrom) params.append('dateFrom', dateFrom)
      if (dateTo) params.append('dateTo', dateTo)

      const res = await fetch(`${API}/admin/audit-logs?${params}`, { headers: authHeaders() })
      if (res.ok) {
        const data = await res.json()
        setLogs(data.data)
        setPagination(data.pagination)
      } else {
        toast.error('Failed to fetch audit logs')
      }
    } catch {
      toast.error('Network error')
    } finally {
      if (showSpinner) setLoading(false)
    }
  }, [currentPage, search, methodFilter, statusFilter, dateFrom, dateTo])

  useEffect(() => { fetchLogs(true); fetchStats() }, [])
  useEffect(() => { fetchLogs(false) }, [currentPage, search, methodFilter, statusFilter, dateFrom, dateTo])

  const handleDeleteAll = async () => {
    setDeleting(true)
    try {
      const res = await fetch(`${API}/admin/audit-logs/bulk/all`, { method: 'DELETE', headers: authHeaders() })
      if (res.ok) {
        toast.success('All audit logs deleted')
        setLogs([])
        fetchStats()
      } else { toast.error('Failed to delete') }
    } catch { toast.error('Network error') }
    finally { setDeleting(false); setClearDialogOpen(false) }
  }

  const handleDeleteOld = async () => {
    setDeleting(true)
    try {
      const res = await fetch(`${API}/admin/audit-logs/bulk/older-than/30`, { method: 'DELETE', headers: authHeaders() })
      if (res.ok) {
        const data = await res.json()
        toast.success(`Deleted ${data.count} logs older than 30 days`)
        fetchLogs(true); fetchStats()
      } else { toast.error('Failed to delete') }
    } catch { toast.error('Network error') }
    finally { setDeleting(false); setClearOldDialogOpen(false) }
  }

  const handleDeleteOne = async (id: string) => {
    try {
      const res = await fetch(`${API}/admin/audit-logs/${id}`, { method: 'DELETE', headers: authHeaders() })
      if (res.ok) { toast.success('Log deleted'); fetchLogs(false); fetchStats() }
      else toast.error('Failed to delete log')
    } catch { toast.error('Network error') }
  }

  const exportCsv = () => {
    const rows = [
      ['Time', 'Admin', 'Method', 'Path', 'Action', 'Status', 'Duration (ms)', 'IP'].join(','),
      ...logs.map(l => [
        new Date(l.createdAt).toISOString(),
        l.adminUsername,
        l.method,
        `"${l.path}"`,
        `"${l.action ?? ''}"`,
        l.statusCode ?? '',
        l.durationMs ?? '',
        l.ipAddress ?? '',
      ].join(','))
    ].join('\n')
    const blob = new Blob([rows], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
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
      <div className="p-4 sm:p-6 mx-auto space-y-6 max-w-7xl">

        {/* Header */}
        <div className="card-base p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl" style={{ background: 'rgba(81,162,255,0.1)', border: '1px solid rgba(81,162,255,0.2)' }}>
                <Shield className="w-7 h-7 text-[#51a2ff]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Admin Audit Logs</h1>
                <p className="text-sm text-[#888]">Full trail of all admin actions</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => { fetchLogs(true); fetchStats() }} className="btn-ghost flex items-center gap-2">
                <RefreshCw className="w-4 h-4" /> Refresh
              </button>
              <button onClick={exportCsv} className="btn-primary flex items-center gap-2">
                <Download className="w-4 h-4" /> Export CSV
              </button>
              <button
                onClick={() => setClearOldDialogOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg font-medium text-orange-400"
                style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)' }}
              >
                <Calendar className="w-4 h-4" /> Clear 30d+
              </button>
              <button
                onClick={() => setClearDialogOpen(true)}
                className="px-3 py-1.5 text-sm rounded-lg font-medium text-red-400 flex items-center gap-2"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
              >
                <Trash2 className="w-4 h-4" /> Clear All
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Logs', value: stats.total.toLocaleString(), icon: Shield, accent: '#51a2ff', accentBg: 'rgba(81,162,255,0.1)', accentBorder: 'rgba(81,162,255,0.2)' },
            { label: 'Today', value: stats.todayCount.toLocaleString(), icon: Clock, accent: '#34d399', accentBg: 'rgba(52,211,153,0.1)', accentBorder: 'rgba(52,211,153,0.2)' },
            { label: '4xx Errors', value: stats.errors4xx.toLocaleString(), icon: AlertTriangle, accent: '#fb923c', accentBg: 'rgba(251,146,60,0.1)', accentBorder: 'rgba(251,146,60,0.2)' },
            { label: '5xx Errors', value: stats.errors5xx.toLocaleString(), icon: XCircle, accent: '#f87171', accentBg: 'rgba(248,113,113,0.1)', accentBorder: 'rgba(248,113,113,0.2)' },
          ].map((s) => (
            <div key={s.label} className="card-base p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl" style={{ background: s.accentBg, border: `1px solid ${s.accentBorder}` }}>
                  <s.icon className="w-4 h-4" style={{ color: s.accent }} />
                </div>
                <span className="text-sm text-[#888]">{s.label}</span>
              </div>
              <p className="text-2xl font-bold" style={{ color: s.accent }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="card-base">
          <div className="p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555]" />
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
                placeholder="Search by path, action, admin, IP..."
                className="input-base w-full pl-9"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors"
              style={showFilters
                ? { background: 'rgba(81,162,255,0.1)', border: '1px solid rgba(81,162,255,0.3)', color: '#51a2ff' }
                : { background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.07)', color: '#888' }
              }
            >
              <Filter className="w-4 h-4" /> Filters
              {(methodFilter || statusFilter || dateFrom || dateTo) && (
                <span className="w-2 h-2 rounded-full bg-[#51a2ff] inline-block" />
              )}
            </button>
          </div>

          {showFilters && (
            <div className="px-4 pb-4 pt-0 grid grid-cols-2 sm:grid-cols-4 gap-3" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              {/* Method filter */}
              <div>
                <p className="mb-1 text-xs text-[#555]">Method</p>
                <div className="flex flex-wrap gap-1">
                  {['', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map((m) => (
                    <button key={m} onClick={() => { setMethodFilter(m); setCurrentPage(1) }}
                      className="px-2 py-1 text-xs rounded-lg transition-all"
                      style={methodFilter === m
                        ? { background: 'rgba(81,162,255,0.1)', border: '1px solid rgba(81,162,255,0.3)', color: '#51a2ff' }
                        : { background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.07)', color: '#888' }
                      }
                    >
                      {m || 'All'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status filter */}
              <div>
                <p className="mb-1 text-xs text-[#555]">Status Code</p>
                <div className="flex flex-wrap gap-1">
                  {[{ label: 'All', val: '' }, { label: '2xx', val: '200' }, { label: '4xx', val: '400' }, { label: '5xx', val: '500' }].map((s) => (
                    <button key={s.val} onClick={() => { setStatusFilter(s.val); setCurrentPage(1) }}
                      className="px-2 py-1 text-xs rounded-lg transition-all"
                      style={statusFilter === s.val
                        ? { background: 'rgba(81,162,255,0.1)', border: '1px solid rgba(81,162,255,0.3)', color: '#51a2ff' }
                        : { background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.07)', color: '#888' }
                      }
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date From */}
              <div>
                <p className="mb-1 text-xs text-[#555]">From</p>
                <input type="datetime-local" value={dateFrom}
                  onChange={(e) => { setDateFrom(e.target.value); setCurrentPage(1) }}
                  className="input-base w-full text-xs h-8" />
              </div>

              {/* Date To */}
              <div>
                <p className="mb-1 text-xs text-[#555]">To</p>
                <input type="datetime-local" value={dateTo}
                  onChange={(e) => { setDateTo(e.target.value); setCurrentPage(1) }}
                  className="input-base w-full text-xs h-8" />
              </div>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="card-base overflow-hidden">
          <div className="p-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <h2 className="font-semibold text-white">
              Logs <span className="text-[#888] font-normal text-sm">({pagination.total} total)</span>
            </h2>
            <span className="text-xs text-[#555]">Page {pagination.page} / {pagination.totalPages}</span>
          </div>

          {logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Shield className="w-16 h-16 text-[#333] mb-4" />
              <p className="text-[#888]">No audit logs found</p>
              <p className="text-sm text-[#555] mt-1">Admin actions will appear here</p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
              {logs.map((log) => (
                <div key={log.id}>
                  {/* Row */}
                  <div
                    className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 cursor-pointer group transition-colors"
                    style={{ ['--hover-bg' as any]: 'rgba(255,255,255,0.03)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                    onMouseLeave={e => (e.currentTarget.style.background = '')}
                    onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                  >
                    {/* Method + Status */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`px-2 py-0.5 text-xs font-mono font-bold rounded border ${METHOD_COLORS[log.method] ?? 'bg-gray-500/20 text-gray-300 border-gray-500/30'}`}>
                        {log.method}
                      </span>
                      <span className={`px-2 py-0.5 text-xs font-mono rounded border ${statusColor(log.statusCode)}`}>
                        {log.statusCode ?? '—'}
                      </span>
                    </div>

                    {/* Path & Action */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{log.action ?? log.path}</p>
                      <p className="text-xs text-[#555] font-mono truncate">{log.path}</p>
                    </div>

                    {/* Meta */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-[#555] shrink-0">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {log.admin?.username ?? log.adminUsername}
                      </span>
                      <span className="flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        {log.ipAddress ?? '—'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        {log.durationMs != null ? `${log.durationMs}ms` : '—'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </div>

                    {/* Expand / Delete */}
                    <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleDeleteOne(log.id)}
                        className="p-1.5 rounded-lg text-[#555] hover:text-red-400 transition-all opacity-0 group-hover:opacity-100"
                        style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.07)' }}
                        title="Delete log"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <div className="text-[#555] cursor-pointer" onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}>
                        {expandedId === log.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {expandedId === log.id && (
                    <div className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-4" style={{ background: 'rgba(0,0,0,0.2)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      {/* Log meta */}
                      <div className="space-y-2 pt-4">
                        <p className="text-xs font-semibold text-[#888] uppercase tracking-wider mb-2">Request Details</p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {[
                            ['Log ID', log.id],
                            ['Admin ID', log.adminId],
                            ['Admin', log.admin?.username ?? log.adminUsername],
                            ['Email', log.admin?.email ?? '—'],
                            ['IP Address', log.ipAddress ?? '—'],
                            ['Duration', log.durationMs != null ? `${log.durationMs}ms` : '—'],
                            ['Status', log.statusCode?.toString() ?? '—'],
                            ['Timestamp', new Date(log.createdAt).toLocaleString()],
                          ].map(([k, v]) => (
                            <div key={k} className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                              <p className="text-[#555]">{k}</p>
                              <p className="text-white font-mono truncate" title={v}>{v}</p>
                            </div>
                          ))}
                        </div>
                        {log.userAgent && (
                          <div className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <p className="text-xs text-[#555] mb-1">User Agent</p>
                            <p className="text-xs text-white font-mono break-all">{log.userAgent}</p>
                          </div>
                        )}
                      </div>

                      {/* Request / Response bodies */}
                      <div className="space-y-3 pt-4">
                        <JsonBlock label="Request Body" raw={log.requestBody} />
                        <JsonBlock label="Response Body" raw={log.responseBody} />
                        {!log.requestBody && !log.responseBody && (
                          <div className="flex items-center gap-2 text-xs text-[#555] pt-2">
                            <CheckCircle className="w-4 h-4" />
                            No body data captured
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="card-base p-4 flex items-center justify-between" style={{ borderTop: '1px solid rgba(255,255,255,0.07)', borderRadius: 0 }}>
              <p className="text-xs text-[#555]">
                {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)}–
                {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
              </p>
              <div className="flex gap-2">
                <button
                  disabled={pagination.page === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="btn-ghost btn-sm flex items-center gap-1 disabled:opacity-40"
                >
                  <ArrowLeft className="w-3 h-3" /> Prev
                </button>
                <span className="flex items-center px-3 text-xs text-[#888]">
                  {pagination.page} / {pagination.totalPages}
                </span>
                <button
                  disabled={pagination.page === pagination.totalPages}
                  onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
                  className="btn-ghost btn-sm flex items-center gap-1 disabled:opacity-40"
                >
                  Next <ArrowLeft className="w-3 h-3 rotate-180" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Clear All Dialog */}
      {clearDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-md card-base p-6">
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
              <h3 className="text-lg font-semibold text-white">Delete All Audit Logs</h3>
            </div>
            <p className="text-[#888] text-sm mb-6">
              This will permanently delete ALL audit log records. This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setClearDialogOpen(false)} className="btn-ghost flex items-center gap-2">
                Cancel
              </button>
              <button
                onClick={handleDeleteAll}
                disabled={deleting}
                className="px-3 py-1.5 text-sm rounded-lg font-medium text-red-400 flex items-center gap-2 disabled:opacity-50"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
              >
                {deleting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Old Dialog */}
      {clearOldDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-md card-base p-6">
            <div className="flex items-center gap-3 mb-3">
              <Calendar className="w-5 h-5 text-orange-400 shrink-0" />
              <h3 className="text-lg font-semibold text-white">Delete Logs Older Than 30 Days</h3>
            </div>
            <p className="text-[#888] text-sm mb-6">
              All audit log entries older than 30 days will be permanently deleted.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setClearOldDialogOpen(false)} className="btn-ghost flex items-center gap-2">
                Cancel
              </button>
              <button
                onClick={handleDeleteOld}
                disabled={deleting}
                className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg font-medium text-orange-400 disabled:opacity-50"
                style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)' }}
              >
                {deleting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Delete Old Logs
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default withAdminAuth(AdminAuditLogs)
