'use client'

import { useState, useEffect, useCallback } from 'react'
import { withAdminAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog'
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
      <p className="mb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
      <pre className="overflow-x-auto p-3 text-xs rounded-lg max-h-48 bg-black/30 text-emerald-300 border border-white/5 whitespace-pre-wrap break-all">
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
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-24 h-24 rounded-full border-b-2 border-sky-400 animate-spin" />
      </div>
    )
  }

  return (
    <main className="overflow-x-hidden relative min-h-screen">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-sky-900/20 to-slate-900 pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl bg-sky-500/10 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl bg-blue-500/10 pointer-events-none" />

      <div className="relative z-10 p-4 sm:p-6 mx-auto space-y-6 max-w-7xl">

        {/* Header */}
        <div className="p-5 rounded-2xl border shadow-2xl backdrop-blur-xl bg-white/5 border-white/10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-sky-500/20 to-blue-500/20 rounded-xl border border-sky-500/30">
                <Shield className="w-7 h-7 text-sky-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300">
                  Admin Audit Logs
                </h1>
                <p className="text-sm text-gray-400">Full trail of all admin actions</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => { fetchLogs(true); fetchStats() }}
                className="bg-white/10 text-white border border-white/10 hover:bg-white/20">
                <RefreshCw className="w-4 h-4 mr-2" /> Refresh
              </Button>
              <Button onClick={exportCsv}
                className="bg-emerald-600/80 text-white border border-emerald-500/30 hover:bg-emerald-600">
                <Download className="w-4 h-4 mr-2" /> Export CSV
              </Button>
              <Button onClick={() => setClearOldDialogOpen(true)}
                className="bg-orange-600/80 text-white border border-orange-500/30 hover:bg-orange-600">
                <Calendar className="w-4 h-4 mr-2" /> Clear 30d+
              </Button>
              <Button onClick={() => setClearDialogOpen(true)}
                className="bg-red-600/80 text-white border border-red-500/30 hover:bg-red-600">
                <Trash2 className="w-4 h-4 mr-2" /> Clear All
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Logs', value: stats.total.toLocaleString(), icon: Shield, color: 'from-sky-500 to-blue-600', text: 'text-sky-400' },
            { label: 'Today', value: stats.todayCount.toLocaleString(), icon: Clock, color: 'from-emerald-500 to-green-600', text: 'text-emerald-400' },
            { label: '4xx Errors', value: stats.errors4xx.toLocaleString(), icon: AlertTriangle, color: 'from-orange-500 to-amber-600', text: 'text-orange-400' },
            { label: '5xx Errors', value: stats.errors5xx.toLocaleString(), icon: XCircle, color: 'from-red-500 to-rose-600', text: 'text-red-400' },
          ].map((s) => (
            <div key={s.label} className="p-4 rounded-2xl border backdrop-blur-xl bg-white/5 border-white/10">
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 bg-gradient-to-br ${s.color} rounded-xl`}>
                  <s.icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm text-gray-400">{s.label}</span>
              </div>
              <p className={`text-2xl font-bold ${s.text}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="rounded-2xl border backdrop-blur-xl bg-white/5 border-white/10">
          <div className="p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
                placeholder="Search by path, action, admin, IP..."
                className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-sky-500/50"
              />
            </div>
            <Button
              onClick={() => setShowFilters(!showFilters)}
              className={`shrink-0 border ${showFilters ? 'bg-sky-500/20 border-sky-500/50 text-sky-300' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'}`}
            >
              <Filter className="w-4 h-4 mr-2" /> Filters
              {(methodFilter || statusFilter || dateFrom || dateTo) && (
                <span className="ml-2 w-2 h-2 rounded-full bg-sky-400 inline-block" />
              )}
            </Button>
          </div>

          {showFilters && (
            <div className="px-4 pb-4 pt-0 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-white/10">
              {/* Method filter */}
              <div>
                <p className="mb-1 text-xs text-gray-500">Method</p>
                <div className="flex flex-wrap gap-1">
                  {['', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map((m) => (
                    <button key={m} onClick={() => { setMethodFilter(m); setCurrentPage(1) }}
                      className={`px-2 py-1 text-xs rounded-lg border transition-all ${
                        methodFilter === m
                          ? 'bg-sky-500/20 border-sky-500/50 text-sky-300'
                          : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                      }`}>
                      {m || 'All'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status filter */}
              <div>
                <p className="mb-1 text-xs text-gray-500">Status Code</p>
                <div className="flex flex-wrap gap-1">
                  {[{ label: 'All', val: '' }, { label: '2xx', val: '200' }, { label: '4xx', val: '400' }, { label: '5xx', val: '500' }].map((s) => (
                    <button key={s.val} onClick={() => { setStatusFilter(s.val); setCurrentPage(1) }}
                      className={`px-2 py-1 text-xs rounded-lg border transition-all ${
                        statusFilter === s.val
                          ? 'bg-sky-500/20 border-sky-500/50 text-sky-300'
                          : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                      }`}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date From */}
              <div>
                <p className="mb-1 text-xs text-gray-500">From</p>
                <Input type="datetime-local" value={dateFrom}
                  onChange={(e) => { setDateFrom(e.target.value); setCurrentPage(1) }}
                  className="bg-white/5 border-white/10 text-white text-xs h-8" />
              </div>

              {/* Date To */}
              <div>
                <p className="mb-1 text-xs text-gray-500">To</p>
                <Input type="datetime-local" value={dateTo}
                  onChange={(e) => { setDateTo(e.target.value); setCurrentPage(1) }}
                  className="bg-white/5 border-white/10 text-white text-xs h-8" />
              </div>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="rounded-2xl border backdrop-blur-xl bg-white/5 border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h2 className="font-semibold text-white">
              Logs <span className="text-gray-400 font-normal text-sm">({pagination.total} total)</span>
            </h2>
            <span className="text-xs text-gray-500">Page {pagination.page} / {pagination.totalPages}</span>
          </div>

          {logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Shield className="w-16 h-16 text-gray-700 mb-4" />
              <p className="text-gray-400">No audit logs found</p>
              <p className="text-sm text-gray-600 mt-1">Admin actions will appear here</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {logs.map((log) => (
                <div key={log.id}>
                  {/* Row */}
                  <div
                    className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 hover:bg-white/5 transition-colors cursor-pointer group"
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
                      <p className="text-xs text-gray-500 font-mono truncate">{log.path}</p>
                    </div>

                    {/* Meta */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 shrink-0">
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
                        className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                        title="Delete log"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <div className="text-gray-500 cursor-pointer" onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}>
                        {expandedId === log.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {expandedId === log.id && (
                    <div className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-black/20 border-t border-white/5">
                      {/* Log meta */}
                      <div className="space-y-2 pt-4">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Request Details</p>
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
                            <div key={k} className="p-2 rounded-lg bg-white/5 border border-white/5">
                              <p className="text-gray-500">{k}</p>
                              <p className="text-white font-mono truncate" title={v}>{v}</p>
                            </div>
                          ))}
                        </div>
                        {log.userAgent && (
                          <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                            <p className="text-xs text-gray-500 mb-1">User Agent</p>
                            <p className="text-xs text-white font-mono break-all">{log.userAgent}</p>
                          </div>
                        )}
                      </div>

                      {/* Request / Response bodies */}
                      <div className="space-y-3 pt-4">
                        <JsonBlock label="Request Body" raw={log.requestBody} />
                        <JsonBlock label="Response Body" raw={log.responseBody} />
                        {!log.requestBody && !log.responseBody && (
                          <div className="flex items-center gap-2 text-xs text-gray-600 pt-2">
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
            <div className="p-4 border-t border-white/10 flex items-center justify-between">
              <p className="text-xs text-gray-500">
                {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)}–
                {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
              </p>
              <div className="flex gap-2">
                <Button size="sm" disabled={pagination.page === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="bg-white/5 border border-white/10 text-white disabled:opacity-40 hover:bg-white/10 px-3">
                  <ArrowLeft className="w-3 h-3 mr-1" /> Prev
                </Button>
                <span className="flex items-center px-3 text-xs text-gray-400">
                  {pagination.page} / {pagination.totalPages}
                </span>
                <Button size="sm" disabled={pagination.page === pagination.totalPages}
                  onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
                  className="bg-white/5 border border-white/10 text-white disabled:opacity-40 hover:bg-white/10 px-3">
                  Next <ArrowLeft className="w-3 h-3 ml-1 rotate-180" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Clear All Dialog */}
      <AlertDialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <AlertDialogContent className="text-white border backdrop-blur-xl bg-slate-900/95 border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" /> Delete All Audit Logs
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              This will permanently delete ALL audit log records. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAll} disabled={deleting}
              className="bg-red-600 text-white hover:bg-red-500 border-0">
              {deleting ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
              Delete Forever
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clear Old Dialog */}
      <AlertDialog open={clearOldDialogOpen} onOpenChange={setClearOldDialogOpen}>
        <AlertDialogContent className="text-white border backdrop-blur-xl bg-slate-900/95 border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-orange-400" /> Delete Logs Older Than 30 Days
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              All audit log entries older than 30 days will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteOld} disabled={deleting}
              className="bg-orange-600 text-white hover:bg-orange-500 border-0">
              {deleting ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
              Delete Old Logs
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  )
}

export default withAdminAuth(AdminAuditLogs)
