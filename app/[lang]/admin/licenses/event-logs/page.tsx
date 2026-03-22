"use client"

import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { withAdminAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Activity, RefreshCw, Search, X, Filter, Server, Clock, Eye, Copy, Check, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import LicenseProfileModal from '@/components/admin/license-profile-modal'

interface EventLog {
  id: string
  event: string
  details?: string
  resourceName?: string
  licenseKey?: string
  serverName?: string
  hostname?: string
  timestamp?: number
  ip?: string
  createdAt: string
}

interface PaginatedResponse {
  data: EventLog[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

const EVENT_COLORS: Record<string, string> = {
  LicenseValid: 'bg-green-500/20 text-green-400 border-green-500/30',
  LicenseInvalid: 'bg-red-500/20 text-red-400 border-red-500/30',
  startup: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  shutdown: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  error: 'bg-red-500/20 text-red-400 border-red-500/30',
}

function getEventBadge(event: string) {
  const cls = EVENT_COLORS[event] ?? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
  return <Badge className={`border text-xs ${cls}`}>{event}</Badge>
}

function CopyCell({ value, className = '' }: { value: string; className?: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!value || value === '—') return
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true)
      toast.success('Copied!')
      setTimeout(() => setCopied(false), 1500)
    })
  }
  return (
    <span
      onClick={handleCopy}
      title={value || '—'}
      className={`group inline-flex items-center gap-1 cursor-pointer rounded px-1 -mx-1 hover:bg-white/10 transition-colors ${className}`}
    >
      <span className="truncate max-w-[160px]">{value || '—'}</span>
      {value && value !== '—' && (
        copied
          ? <Check className="w-3 h-3 text-green-400 flex-shrink-0 opacity-80" />
          : <Copy className="w-3 h-3 text-gray-500 flex-shrink-0 opacity-0 group-hover:opacity-80 transition-opacity" />
      )}
    </span>
  )
}

function DetailModal({ log, onClose, onViewProfile }: { log: EventLog; onClose: () => void; onViewProfile?: () => void }) {
  const fields: { label: string; value: string }[] = [
    { label: 'ID', value: log.id },
    { label: 'Event', value: log.event },
    { label: 'Details', value: log.details || '—' },
    { label: 'License Key', value: log.licenseKey || '—' },
    { label: 'Hostname', value: log.hostname || '—' },
    { label: 'Server', value: log.serverName || '—' },
    { label: 'Resource', value: log.resourceName || '—' },
    { label: 'IP Address', value: log.ip || '—' },
    { label: 'Timestamp', value: log.timestamp ? new Date(log.timestamp * 1000).toLocaleString() : '—' },
    { label: 'Created At', value: new Date(log.createdAt).toLocaleString() },
  ]

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative z-10 w-full max-w-lg rounded-2xl border border-white/10 bg-slate-900/95 shadow-2xl backdrop-blur-xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-lg border border-white/10">
              <Activity className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Event Log Details</h2>
              <p className="text-xs text-gray-400 mt-0.5">{log.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Event badge */}
        <div className="px-5 pt-4">
          {getEventBadge(log.event)}
        </div>

        {/* Fields */}
        <div className="p-5 space-y-3 max-h-[60vh] overflow-y-auto">
          {fields.map(f => (
            <div key={f.label} className="flex items-start gap-3">
              <span className="text-xs text-gray-500 w-24 flex-shrink-0 pt-0.5">{f.label}</span>
              <span className="flex items-center gap-1.5 flex-1 group">
                <span className="text-xs text-gray-200 font-mono break-all">{f.value}</span>
                {f.value !== '—' && (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(f.value)
                      toast.success('Copied!')
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 p-0.5 rounded text-gray-500 hover:text-cyan-400"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                )}
              </span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 pt-2 border-t border-white/10 flex gap-2">
          {onViewProfile && (
            <button
              onClick={() => { onClose(); onViewProfile(); }}
              className="flex-1 py-2 rounded-xl text-sm font-medium text-violet-300 border border-violet-500/30 bg-violet-500/10 hover:bg-violet-500/20 hover:text-violet-200 transition-all flex items-center justify-center gap-2"
            >
              <Activity className="w-4 h-4" />
              View User Profile
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-xl text-sm text-gray-400 border border-white/10 hover:bg-white/5 hover:text-white transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

function AdminLicenseEventLogs() {
  const router = useRouter()

  const [logs, setLogs] = useState<EventLog[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [selectedLog, setSelectedLog] = useState<EventLog | null>(null)
  const [profileKey, setProfileKey] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const limit = 20

  const handleDelete = async (olderThanDays?: number) => {
    const label = olderThanDays ? `older than ${olderThanDays} days` : 'all'
    if (!confirm(`Delete ${label} event logs? This cannot be undone.`)) return
    setDeleting(true)
    try {
      const token = localStorage.getItem('access_token')
      const url = olderThanDays
        ? `${process.env.NEXT_PUBLIC_API_URL}/licenses/logs/cleanup?olderThanDays=${olderThanDays}`
        : `${process.env.NEXT_PUBLIC_API_URL}/licenses/logs/cleanup`
      const res = await fetch(url, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error('Failed to delete')
      const { deleted } = await res.json()
      toast.success(`Deleted ${deleted} event log${deleted !== 1 ? 's' : ''}`)
      fetchLogs()
    } catch {
      toast.error('Failed to delete logs')
    } finally {
      setDeleting(false)
    }
  }

  // Filters
  const [event, setEvent] = useState('')
  const [licenseKey, setLicenseKey] = useState('')
  const [hostname, setHostname] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('access_token')
      const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() })
      if (event) params.set('event', event)
      if (licenseKey) params.set('licenseKey', licenseKey)
      if (hostname) params.set('hostname', hostname)
      if (dateFrom) params.set('dateFrom', dateFrom)
      if (dateTo) params.set('dateTo', dateTo)

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/licenses/logs?${params}`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      })
      if (!res.ok) { toast.error('Failed to fetch event logs'); return }
      const result: PaginatedResponse = await res.json()

      setLogs(result.data)
      setTotal(result.pagination.total)
      setTotalPages(result.pagination.totalPages)
    } catch {
      toast.error('Failed to fetch event logs')
    } finally {
      setLoading(false)
    }
  }, [page, event, licenseKey, hostname, dateFrom, dateTo])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  const clearFilters = () => {
    setEvent('')
    setLicenseKey('')
    setHostname('')
    setDateFrom('')
    setDateTo('')
    setPage(1)
  }

  const hasActiveFilters = event || licenseKey || hostname || dateFrom || dateTo

  const formatDate = (d: string) => new Date(d).toLocaleString()
  const formatTs = (ts?: number) => ts ? new Date(ts * 1000).toLocaleString() : '—'

  if (loading && logs.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-900 via-cyan-900 to-slate-900">
        <div className="w-32 h-32 rounded-full border-b-2 border-cyan-400 animate-spin" />
      </div>
    )
  }

  return (
    <main className="overflow-hidden relative min-h-screen bg-gradient-to-br from-slate-900 via-cyan-900 to-slate-900">
      <div className="absolute inset-0">
        <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%239C92AC\' fill-opacity=\'0.1\'%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'1.5\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />
      </div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-cyan-500/10 via-transparent to-blue-500/10 blur-3xl" />

      {selectedLog && typeof document !== 'undefined' && createPortal(
        <DetailModal log={selectedLog} onClose={() => setSelectedLog(null)} onViewProfile={selectedLog.licenseKey ? () => setProfileKey(selectedLog.licenseKey!) : undefined} />,
        document.body
      )}
      {profileKey && typeof document !== 'undefined' && createPortal(
        <LicenseProfileModal licenseKey={profileKey} onClose={() => setProfileKey(null)} />,
        document.body
      )}

      <div className="relative z-10 p-4 sm:p-6 mx-auto space-y-4 max-w-7xl">
        {/* Header */}
        <div className="p-4 sm:p-6 rounded-2xl border shadow-2xl backdrop-blur-xl bg-white/5 border-white/10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-xl border border-white/10">
                <Activity className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300">
                  License Event Logs
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-gray-400">
                  All events reported by Lua clients — {total} total records
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <Button
                onClick={() => fetchLogs()}
                disabled={loading}
                className="flex-1 sm:flex-none text-white bg-gradient-to-r from-cyan-600 to-blue-600 border border-white/10 shadow-lg backdrop-blur-sm hover:from-cyan-500 hover:to-blue-500 hover:scale-105 transition-all duration-300"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                onClick={() => handleDelete(7)}
                disabled={deleting}
                className="flex-1 sm:flex-none text-white bg-gradient-to-r from-orange-700 to-orange-600 border border-white/10 shadow-lg hover:from-orange-600 hover:to-orange-500 hover:scale-105 transition-all duration-300"
                title="Delete logs older than 7 days"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                &gt;7d
              </Button>
              <Button
                onClick={() => handleDelete(14)}
                disabled={deleting}
                className="flex-1 sm:flex-none text-white bg-gradient-to-r from-red-700 to-red-600 border border-white/10 shadow-lg hover:from-red-600 hover:to-red-500 hover:scale-105 transition-all duration-300"
                title="Delete logs older than 14 days"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                &gt;14d
              </Button>
              <Button
                onClick={() => handleDelete()}
                disabled={deleting}
                className="flex-1 sm:flex-none text-white bg-gradient-to-r from-rose-800 to-rose-700 border border-white/10 shadow-lg hover:from-rose-700 hover:to-rose-600 hover:scale-105 transition-all duration-300"
                title="Delete all event logs"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete All
              </Button>
              <Button
                onClick={() => router.push('/admin/licenses')}
                className="flex-1 sm:flex-none text-white bg-gradient-to-r from-slate-700 to-slate-600 border border-white/10 shadow-lg backdrop-blur-sm hover:from-slate-600 hover:to-slate-500 hover:scale-105 transition-all duration-300"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 sm:p-6 rounded-2xl border shadow-2xl backdrop-blur-xl bg-white/5 border-white/10">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-semibold text-white">Filters</span>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-2 py-1 ml-2 text-xs text-red-400 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-colors"
              >
                <X className="w-3 h-3" />
                Clear all
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
              <Input
                placeholder="Event type..."
                value={event}
                onChange={e => { setEvent(e.target.value); setPage(1) }}
                className="pl-8 h-9 text-sm bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-cyan-500/50"
              />
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
              <Input
                placeholder="License key..."
                value={licenseKey}
                onChange={e => { setLicenseKey(e.target.value); setPage(1) }}
                className="pl-8 h-9 text-sm bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-cyan-500/50"
              />
            </div>
            <div className="relative">
              <Server className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
              <Input
                placeholder="Hostname..."
                value={hostname}
                onChange={e => { setHostname(e.target.value); setPage(1) }}
                className="pl-8 h-9 text-sm bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-cyan-500/50"
              />
            </div>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
              <Input
                type="datetime-local"
                value={dateFrom}
                onChange={e => { setDateFrom(e.target.value); setPage(1) }}
                className="pl-8 h-9 text-sm bg-white/5 border-white/10 text-white focus:border-cyan-500/50 [color-scheme:dark]"
              />
            </div>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
              <Input
                type="datetime-local"
                value={dateTo}
                onChange={e => { setDateTo(e.target.value); setPage(1) }}
                className="pl-8 h-9 text-sm bg-white/5 border-white/10 text-white focus:border-cyan-500/50 [color-scheme:dark]"
              />
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-500">
            Showing {logs.length} of {total} records
            {hasActiveFilters && <span className="ml-1 text-cyan-400">(filtered)</span>}
            <span className="ml-2 text-gray-600">· Click any cell to copy · Click <Eye className="inline w-3 h-3" /> for full details</span>
          </p>
        </div>

        {/* Table */}
        <div className="p-4 sm:p-6 rounded-2xl border shadow-2xl backdrop-blur-xl bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-white/5">
                  <TableHead className="text-gray-300 text-xs font-semibold whitespace-nowrap">Event</TableHead>
                  <TableHead className="text-gray-300 text-xs font-semibold whitespace-nowrap">Details</TableHead>
                  <TableHead className="text-gray-300 text-xs font-semibold whitespace-nowrap">Hostname</TableHead>
                  <TableHead className="text-gray-300 text-xs font-semibold whitespace-nowrap">License Key</TableHead>
                  <TableHead className="text-gray-300 text-xs font-semibold whitespace-nowrap hidden md:table-cell">Resource</TableHead>
                  <TableHead className="text-gray-300 text-xs font-semibold whitespace-nowrap hidden lg:table-cell">Server</TableHead>
                  <TableHead className="text-gray-300 text-xs font-semibold whitespace-nowrap hidden lg:table-cell">IP</TableHead>
                  <TableHead className="text-gray-300 text-xs font-semibold whitespace-nowrap hidden xl:table-cell">Timestamp</TableHead>
                  <TableHead className="text-gray-300 text-xs font-semibold whitespace-nowrap">Created At</TableHead>
                  <TableHead className="text-gray-300 text-xs font-semibold whitespace-nowrap text-right">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <td colSpan={10} className="py-16 text-center text-gray-400">
                      <Activity className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">No event logs found</p>
                      {hasActiveFilters && (
                        <button onClick={clearFilters} className="mt-2 text-xs text-cyan-400 hover:underline">
                          Clear filters
                        </button>
                      )}
                    </td>
                  </TableRow>
                ) : (
                  logs.map(log => (
                    <TableRow key={log.id} className="border-white/10 hover:bg-white/5 transition-colors group cursor-pointer" onClick={() => setSelectedLog(log)}>
                      <TableCell className="whitespace-nowrap">{getEventBadge(log.event)}</TableCell>
                      <TableCell className="text-xs text-gray-300">
                        <CopyCell value={log.details || ''} />
                      </TableCell>
                      <TableCell className="text-xs text-gray-300">
                        <CopyCell value={log.hostname || ''} />
                      </TableCell>
                      <TableCell className="font-mono text-xs text-gray-400">
                        <CopyCell value={log.licenseKey || ''} />
                      </TableCell>
                      <TableCell className="text-xs text-gray-300 hidden md:table-cell">
                        <CopyCell value={log.resourceName || ''} />
                      </TableCell>
                      <TableCell className="text-xs text-gray-300 hidden lg:table-cell">
                        <CopyCell value={log.serverName || ''} />
                      </TableCell>
                      <TableCell className="font-mono text-xs text-gray-400 hidden lg:table-cell">
                        <CopyCell value={log.ip || ''} />
                      </TableCell>
                      <TableCell className="text-xs text-gray-400 hidden xl:table-cell whitespace-nowrap">
                        <CopyCell value={formatTs(log.timestamp)} />
                      </TableCell>
                      <TableCell className="text-xs text-gray-400 whitespace-nowrap">
                        <CopyCell value={formatDate(log.createdAt)} />
                      </TableCell>
                      <TableCell className="text-right" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => setSelectedLog(log)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors"
                            title="View log details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {log.licenseKey && (
                            <button
                              onClick={() => setProfileKey(log.licenseKey!)}
                              className="p-1.5 rounded-lg text-gray-500 hover:text-violet-400 hover:bg-violet-500/10 transition-colors"
                              title="View user profile by license key"
                            >
                              <Activity className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Pagination */}
        <div className="p-4 rounded-2xl border shadow-2xl backdrop-blur-xl bg-white/5 border-white/10">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-xs sm:text-sm text-gray-400 text-center sm:text-left">
              Page {page} of {totalPages} — {Math.min((page - 1) * limit + 1, total)}–{Math.min(page * limit, total)} of {total}
            </p>
            <div className="flex gap-2 items-center">
              <Button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                size="sm"
                className="text-white bg-gradient-to-r from-slate-700 to-slate-600 border border-white/10 hover:from-slate-600 hover:to-slate-500 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-gray-400 px-2">{page} / {totalPages}</span>
              <Button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || totalPages === 0}
                size="sm"
                className="text-white bg-gradient-to-r from-slate-700 to-slate-600 border border-white/10 hover:from-slate-600 hover:to-slate-500 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-all"
              >
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default withAdminAuth(AdminLicenseEventLogs)
