"use client"

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { withAdminAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Activity, RefreshCw, Search, X, Filter, Server, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

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

function AdminLicenseEventLogs() {
  const router = useRouter()

  const [logs, setLogs] = useState<EventLog[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 20

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
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                onClick={() => fetchLogs()}
                disabled={loading}
                className="flex-1 sm:flex-none text-white bg-gradient-to-r from-cyan-600 to-blue-600 border border-white/10 shadow-lg backdrop-blur-sm hover:from-cyan-500 hover:to-blue-500 hover:scale-105 transition-all duration-300"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <td colSpan={9} className="py-16 text-center text-gray-400">
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
                    <TableRow key={log.id} className="border-white/10 hover:bg-white/5 transition-colors">
                      <TableCell className="whitespace-nowrap">{getEventBadge(log.event)}</TableCell>
                      <TableCell className="text-xs text-gray-300 max-w-[140px] truncate" title={log.details ?? ''}>
                        {log.details || '—'}
                      </TableCell>
                      <TableCell className="text-xs text-gray-300 max-w-[160px] truncate" title={log.hostname ?? ''}>
                        {log.hostname || '—'}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-gray-400 max-w-[120px] truncate" title={log.licenseKey ?? ''}>
                        {log.licenseKey || '—'}
                      </TableCell>
                      <TableCell className="text-xs text-gray-300 hidden md:table-cell">
                        {log.resourceName || '—'}
                      </TableCell>
                      <TableCell className="text-xs text-gray-300 max-w-[120px] truncate hidden lg:table-cell" title={log.serverName ?? ''}>
                        {log.serverName || '—'}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-gray-400 hidden lg:table-cell">
                        {log.ip || '—'}
                      </TableCell>
                      <TableCell className="text-xs text-gray-400 hidden xl:table-cell whitespace-nowrap">
                        {formatTs(log.timestamp)}
                      </TableCell>
                      <TableCell className="text-xs text-gray-400 whitespace-nowrap">
                        {formatDate(log.createdAt)}
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
