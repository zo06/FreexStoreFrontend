"use client"

import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { withAdminAuth } from '@/lib/auth-context'
import { ArrowLeft, Shield, RefreshCw, Search, X, Filter, Clock, Eye, Copy, Check, Activity, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import LicenseProfileModal from '@/components/admin/license-profile-modal'

interface TokenAudit {
  id: string
  jti: string
  licenseKey: string
  productUUID: string
  status: number
  message: string
  version: string
  iat: number
  exp: number
  ip?: string
  userAgent?: string
  createdAt: string
}

interface PaginatedResponse {
  data: TokenAudit[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

function getStatusBadge(status: number) {
  if (status === 200)
    return <span className="text-xs px-2 py-0.5 rounded-full font-medium border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">200 Valid</span>
  if (status === 403)
    return <span className="text-xs px-2 py-0.5 rounded-full font-medium border bg-red-500/10 text-red-400 border-red-500/20">403 Denied</span>
  if (status === 404)
    return <span className="text-xs px-2 py-0.5 rounded-full font-medium border bg-amber-500/10 text-amber-400 border-amber-500/20">404 Not Found</span>
  return <span className="text-xs px-2 py-0.5 rounded-full font-medium border" style={{ background: 'rgba(255,255,255,0.05)', color: '#888', borderColor: 'rgba(255,255,255,0.1)' }}>{status}</span>
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
          ? <Check className="w-3 h-3 text-emerald-400 flex-shrink-0 opacity-80" />
          : <Copy className="w-3 h-3 text-[#555] flex-shrink-0 opacity-0 group-hover:opacity-80 transition-opacity" />
      )}
    </span>
  )
}

function DetailModal({ audit, onClose, onViewProfile }: { audit: TokenAudit; onClose: () => void; onViewProfile: () => void }) {
  const formatUnix = (ts: number) => new Date(ts * 1000).toLocaleString()
  const fields: { label: string; value: string }[] = [
    { label: 'ID', value: audit.id },
    { label: 'JTI', value: audit.jti },
    { label: 'License Key', value: audit.licenseKey },
    { label: 'Product UUID', value: audit.productUUID || '—' },
    { label: 'Status', value: String(audit.status) },
    { label: 'Message', value: audit.message },
    { label: 'Version', value: audit.version || '—' },
    { label: 'IP Address', value: audit.ip || '—' },
    { label: 'User Agent', value: audit.userAgent || '—' },
    { label: 'Issued At', value: formatUnix(audit.iat) },
    { label: 'Expires At', value: formatUnix(audit.exp) },
    { label: 'Created At', value: new Date(audit.createdAt).toLocaleString() },
  ]

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="relative z-10 w-full max-w-lg card-base overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ background: 'rgba(81,162,255,0.1)', border: '1px solid rgba(81,162,255,0.2)' }}>
              <Shield className="w-5 h-5 text-[#51a2ff]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Token Audit Details</h2>
              <p className="text-xs text-[#888] mt-0.5 font-mono truncate max-w-[260px]">{audit.jti}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-[#888] hover:text-white transition-colors"
            style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status badge */}
        <div className="px-5 pt-4">
          {getStatusBadge(audit.status)}
        </div>

        {/* Fields */}
        <div className="p-5 space-y-3 max-h-[60vh] overflow-y-auto">
          {fields.map(f => (
            <div key={f.label} className="flex items-start gap-3">
              <span className="text-xs text-[#555] w-24 flex-shrink-0 pt-0.5">{f.label}</span>
              <span className="flex items-center gap-1.5 flex-1 group">
                <span className="text-xs text-[#ccc] font-mono break-all">{f.value}</span>
                {f.value !== '—' && (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(f.value)
                      toast.success('Copied!')
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 p-0.5 rounded text-[#555] hover:text-[#51a2ff]"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                )}
              </span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 pt-2 flex gap-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button
            onClick={() => { onClose(); onViewProfile(); }}
            className="flex-1 py-2 rounded-xl text-sm font-medium text-violet-300 border border-violet-500/30 bg-violet-500/10 hover:bg-violet-500/20 hover:text-violet-200 transition-all flex items-center justify-center gap-2"
          >
            <Activity className="w-4 h-4" />
            View User Profile
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-xl text-sm text-[#888] hover:text-white transition-all"
            style={{ border: '1px solid rgba(255,255,255,0.07)' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

function AdminLicenseTokenAudits() {
  const router = useRouter()

  const [audits, setAudits] = useState<TokenAudit[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [selectedAudit, setSelectedAudit] = useState<TokenAudit | null>(null)
  const [profileKey, setProfileKey] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const limit = 20

  const handleDelete = async (olderThanDays?: number) => {
    const label = olderThanDays ? `older than ${olderThanDays} days` : 'all'
    if (!confirm(`Delete ${label} token audits? This cannot be undone.`)) return
    setDeleting(true)
    try {
      const token = localStorage.getItem('access_token')
      const url = olderThanDays
        ? `${process.env.NEXT_PUBLIC_API_URL}/licenses/token-audits/cleanup?olderThanDays=${olderThanDays}`
        : `${process.env.NEXT_PUBLIC_API_URL}/licenses/token-audits/cleanup`
      const res = await fetch(url, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error('Failed to delete')
      const { deleted } = await res.json()
      toast.success(`Deleted ${deleted} token audit${deleted !== 1 ? 's' : ''}`)
      fetchAudits()
    } catch {
      toast.error('Failed to delete token audits')
    } finally {
      setDeleting(false)
    }
  }

  // Filters
  const [licenseKey, setLicenseKey] = useState('')
  const [status, setStatus] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const fetchAudits = useCallback(async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('access_token')
      const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() })
      if (licenseKey) params.set('licenseKey', licenseKey)
      if (status !== 'all') params.set('status', status)
      if (dateFrom) params.set('dateFrom', dateFrom)
      if (dateTo) params.set('dateTo', dateTo)

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/licenses/token-audits?${params}`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      })
      if (!res.ok) { toast.error('Failed to fetch token audits'); return }
      const result: PaginatedResponse = await res.json()
      setAudits(result.data)
      setTotal(result.pagination.total)
      setTotalPages(result.pagination.totalPages)
    } catch {
      toast.error('Failed to fetch token audits')
    } finally {
      setLoading(false)
    }
  }, [page, licenseKey, status, dateFrom, dateTo])

  useEffect(() => { fetchAudits() }, [fetchAudits])

  const clearFilters = () => {
    setLicenseKey('')
    setStatus('all')
    setDateFrom('')
    setDateTo('')
    setPage(1)
  }

  const hasActiveFilters = licenseKey || status !== 'all' || dateFrom || dateTo

  const formatDate = (d: string) => new Date(d).toLocaleString()
  const formatUnix = (ts: number) => new Date(ts * 1000).toLocaleString()

  if (loading && audits.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[rgba(255,255,255,0.07)] border-t-[#51a2ff] rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      {selectedAudit && typeof document !== 'undefined' && createPortal(
        <DetailModal audit={selectedAudit} onClose={() => setSelectedAudit(null)} onViewProfile={() => setProfileKey(selectedAudit.licenseKey)} />,
        document.body
      )}
      {profileKey && typeof document !== 'undefined' && createPortal(
        <LicenseProfileModal licenseKey={profileKey} onClose={() => setProfileKey(null)} />,
        document.body
      )}

      <div className="p-4 sm:p-6 mx-auto space-y-4 max-w-7xl">
        {/* Header */}
        <div className="card-base p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 rounded-xl" style={{ background: 'rgba(81,162,255,0.1)', border: '1px solid rgba(81,162,255,0.2)' }}>
                <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-[#51a2ff]" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
                  License Token Audits
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-[#888]">
                  Every JWT token issued to Lua clients — {total} total records
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <button
                onClick={() => fetchAudits()}
                disabled={loading}
                className="btn-primary flex items-center gap-2 flex-1 sm:flex-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={() => handleDelete(7)}
                disabled={deleting}
                title="Delete token audits older than 7 days"
                className="px-3 py-1.5 text-sm rounded-lg font-medium text-red-400 flex items-center gap-2 flex-1 sm:flex-none disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
              >
                <Trash2 className="w-4 h-4" />
                &gt;7d
              </button>
              <button
                onClick={() => handleDelete(14)}
                disabled={deleting}
                title="Delete token audits older than 14 days"
                className="px-3 py-1.5 text-sm rounded-lg font-medium text-red-400 flex items-center gap-2 flex-1 sm:flex-none disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
              >
                <Trash2 className="w-4 h-4" />
                &gt;14d
              </button>
              <button
                onClick={() => handleDelete()}
                disabled={deleting}
                title="Delete all token audits"
                className="px-3 py-1.5 text-sm rounded-lg font-medium text-red-400 flex items-center gap-2 flex-1 sm:flex-none disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
              >
                <Trash2 className="w-4 h-4" />
                Delete All
              </button>
              <button
                onClick={() => router.push('/admin/licenses')}
                className="btn-ghost flex items-center gap-2 flex-1 sm:flex-none"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card-base p-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4 text-[#51a2ff]" />
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#555]" />
              <input
                placeholder="License key..."
                value={licenseKey}
                onChange={e => { setLicenseKey(e.target.value); setPage(1) }}
                className="w-full pl-8 h-9 text-sm text-white placeholder:text-[#555] rounded-lg bg-[#111] outline-none focus:ring-1 focus:ring-[#51a2ff]/40 px-3"
                style={{ border: '1px solid rgba(255,255,255,0.07)' }}
              />
            </div>
            <select
              value={status}
              onChange={e => { setStatus(e.target.value); setPage(1) }}
              className="h-9 text-sm text-white rounded-lg bg-[#111] outline-none focus:ring-1 focus:ring-[#51a2ff]/40 px-3"
              style={{ border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <option value="all">All statuses</option>
              <option value="200">200 — Valid</option>
              <option value="403">403 — Denied</option>
              <option value="404">404 — Not Found</option>
            </select>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#555]" />
              <input
                type="datetime-local"
                value={dateFrom}
                onChange={e => { setDateFrom(e.target.value); setPage(1) }}
                className="w-full pl-8 h-9 text-sm text-white rounded-lg bg-[#111] outline-none focus:ring-1 focus:ring-[#51a2ff]/40 px-3 [color-scheme:dark]"
                style={{ border: '1px solid rgba(255,255,255,0.07)' }}
              />
            </div>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#555]" />
              <input
                type="datetime-local"
                value={dateTo}
                onChange={e => { setDateTo(e.target.value); setPage(1) }}
                className="w-full pl-8 h-9 text-sm text-white rounded-lg bg-[#111] outline-none focus:ring-1 focus:ring-[#51a2ff]/40 px-3 [color-scheme:dark]"
                style={{ border: '1px solid rgba(255,255,255,0.07)' }}
              />
            </div>
          </div>
          <p className="mt-3 text-xs text-[#555]">
            Showing {audits.length} of {total} records
            {hasActiveFilters && <span className="ml-1 text-[#51a2ff]">(filtered)</span>}
            <span className="ml-2 text-[#444]">· Click any cell to copy · Click <Eye className="inline w-3 h-3" /> for full details</span>
          </p>
        </div>

        {/* Table */}
        <div className="card-base p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <th className="text-left text-[#555] font-medium py-3 px-4 text-xs uppercase tracking-wider whitespace-nowrap">Status</th>
                  <th className="text-left text-[#555] font-medium py-3 px-4 text-xs uppercase tracking-wider whitespace-nowrap">License Key</th>
                  <th className="text-left text-[#555] font-medium py-3 px-4 text-xs uppercase tracking-wider whitespace-nowrap hidden sm:table-cell">Message</th>
                  <th className="text-left text-[#555] font-medium py-3 px-4 text-xs uppercase tracking-wider whitespace-nowrap hidden md:table-cell">Version</th>
                  <th className="text-left text-[#555] font-medium py-3 px-4 text-xs uppercase tracking-wider whitespace-nowrap hidden lg:table-cell">IP</th>
                  <th className="text-left text-[#555] font-medium py-3 px-4 text-xs uppercase tracking-wider whitespace-nowrap hidden xl:table-cell">Issued At</th>
                  <th className="text-left text-[#555] font-medium py-3 px-4 text-xs uppercase tracking-wider whitespace-nowrap hidden xl:table-cell">Expires At</th>
                  <th className="text-left text-[#555] font-medium py-3 px-4 text-xs uppercase tracking-wider whitespace-nowrap">Created At</th>
                  <th className="text-left text-[#555] font-medium py-3 px-4 text-xs uppercase tracking-wider whitespace-nowrap hidden 2xl:table-cell">JTI</th>
                  <th className="text-right text-[#555] font-medium py-3 px-4 text-xs uppercase tracking-wider whitespace-nowrap">Details</th>
                </tr>
              </thead>
              <tbody>
                {audits.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-16 text-center text-[#555]">
                      <Shield className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">No token audit records found</p>
                      {hasActiveFilters && (
                        <button onClick={clearFilters} className="mt-2 text-xs text-[#51a2ff] hover:underline">
                          Clear filters
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  audits.map(audit => (
                    <tr key={audit.id} className="border-b transition-colors hover:bg-[#161616] cursor-pointer" style={{ borderColor: 'rgba(255,255,255,0.04)' }} onClick={() => setSelectedAudit(audit)}>
                      <td className="py-3 px-4 whitespace-nowrap">{getStatusBadge(audit.status)}</td>
                      <td className="py-3 px-4 font-mono text-[#ccc] text-xs">
                        <CopyCell value={audit.licenseKey} />
                      </td>
                      <td className="py-3 px-4 text-[#ccc] text-xs hidden sm:table-cell">
                        <CopyCell value={audit.message} />
                      </td>
                      <td className="py-3 px-4 text-[#ccc] text-xs hidden md:table-cell">
                        <CopyCell value={audit.version || ''} />
                      </td>
                      <td className="py-3 px-4 font-mono text-[#ccc] text-xs hidden lg:table-cell">
                        <CopyCell value={audit.ip || ''} />
                      </td>
                      <td className="py-3 px-4 text-[#ccc] text-xs whitespace-nowrap hidden xl:table-cell">
                        <CopyCell value={formatUnix(audit.iat)} />
                      </td>
                      <td className="py-3 px-4 text-[#ccc] text-xs whitespace-nowrap hidden xl:table-cell">
                        <CopyCell value={formatUnix(audit.exp)} />
                      </td>
                      <td className="py-3 px-4 text-[#ccc] text-xs whitespace-nowrap">
                        <CopyCell value={formatDate(audit.createdAt)} />
                      </td>
                      <td className="py-3 px-4 font-mono text-[#555] text-xs hidden 2xl:table-cell">
                        <CopyCell value={audit.jti} />
                      </td>
                      <td className="py-3 px-4 text-right" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => setSelectedAudit(audit)}
                            className="p-1.5 rounded-lg text-[#555] hover:text-[#51a2ff] hover:bg-[rgba(81,162,255,0.1)] transition-colors"
                            title="View token audit details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setProfileKey(audit.licenseKey)}
                            className="p-1.5 rounded-lg text-[#555] hover:text-violet-400 hover:bg-violet-500/10 transition-colors"
                            title="View full user profile by license key"
                          >
                            <Activity className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="card-base p-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-xs sm:text-sm text-[#888] text-center sm:text-left">
              Page {page} of {totalPages} — {Math.min((page - 1) * limit + 1, total)}–{Math.min(page * limit, total)} of {total}
            </p>
            <div className="flex gap-2 items-center">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-ghost btn-sm flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-[#888] px-2">{page} / {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || totalPages === 0}
                className="btn-ghost btn-sm flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default withAdminAuth(AdminLicenseTokenAudits)
