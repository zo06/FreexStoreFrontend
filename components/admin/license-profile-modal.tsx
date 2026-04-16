"use client"

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  X, User, Key, Activity, Shield, CreditCard, Copy, Check,
  CheckCircle, XCircle, AlertTriangle, Clock, Globe, Mail,
  MessageSquare, Wifi, Calendar, ExternalLink,
} from 'lucide-react'
import toast from 'react-hot-toast'

// ─── Types ──────────────────────────────────────────────────────────────────

interface UserProfile {
  id: string
  username: string
  email: string
  firstName?: string
  lastName?: string
  role: string
  isActive: boolean
  discordId?: string
  discordUsername?: string
  discordAvatar?: string
  licensesIpAddress?: string
  lastLoginAt?: string
  lastLoginIp?: string
  createdAt: string
  trialStartAt?: string
  trialEndAt?: string
  emailVerifiedAt?: string
}

interface LicenseRecord {
  id: string
  privateKey: string
  isActive: boolean
  isRevoked: boolean
  isTrial: boolean
  expiresAt?: string
  lastUsedAt?: string
  lastUsedIp?: string
  serverName?: string
  createdAt: string
  script?: { id: string; name: string; version?: string; imageUrl?: string }
}

interface ActivityRecord {
  id: string
  actionType: string
  description: string
  ipAddress?: string
  createdAt: string
}

interface EventLogRecord {
  id: string
  event: string
  details?: string
  licenseKey?: string
  hostname?: string
  serverName?: string
  resourceName?: string
  ip?: string
  timestamp?: number
  createdAt: string
}

interface TokenAuditRecord {
  id: string
  jti: string
  licenseKey: string
  status: number
  message: string
  version: string
  iat: number
  exp: number
  ip?: string
  createdAt: string
}

interface TransactionRecord {
  id: string
  amount: number
  currency: string
  status: string
  type: string
  provider: string
  createdAt: string
  script?: { name: string }
}

interface ProfileData {
  user: UserProfile
  licenses: LicenseRecord[]
  recentActivities: ActivityRecord[]
  recentEventLogs: EventLogRecord[]
  recentTokenAudits: TokenAuditRecord[]
  recentTransactions: TransactionRecord[]
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function CopyValue({ value, mono = true }: { value: string; mono?: boolean }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(value)
    toast.success('Copied!')
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <span className="inline-flex items-center gap-1 group cursor-pointer" onClick={copy}>
      <span className={mono ? 'font-mono text-xs text-[#ccc] break-all' : 'text-xs text-[#ccc]'}>{value || '—'}</span>
      {value && (copied
        ? <Check className="w-3 h-3 text-green-400 flex-shrink-0" />
        : <Copy className="w-3 h-3 text-[#444] flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
    </span>
  )
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-1.5">
      <span className="text-xs text-[#555] w-32 flex-shrink-0 pt-0.5">{label}</span>
      <div className="flex-1">{children}</div>
    </div>
  )
}

function StatusDot({ ok }: { ok: boolean }) {
  return <span className={`inline-block w-2 h-2 rounded-full mr-1.5 ${ok ? 'bg-emerald-400' : 'bg-red-400'}`} />
}

const TABS = ['Profile', 'Licenses', 'Activities', 'Event Logs', 'Token Audits', 'Transactions'] as const
type Tab = typeof TABS[number]

// ─── Component ──────────────────────────────────────────────────────────────

interface Props {
  licenseKey: string
  onClose: () => void
}

export default function LicenseProfileModal({ licenseKey, onClose }: Props) {
  const [data, setData] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<Tab>('Profile')

  const parsedKey = (licenseKey.match(/FREEX-[A-Z0-9]+/i) ?? [licenseKey])[0].toUpperCase()

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/licenses/admin/lookup/${encodeURIComponent(parsedKey)}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async r => {
        if (!r.ok) throw new Error(await r.text())
        return r.json()
      })
      .then(setData)
      .catch(e => setError(e.message || 'Failed to load profile'))
      .finally(() => setLoading(false))
  }, [parsedKey])

  const fmt = (d?: string | null) => d ? new Date(d).toLocaleString() : '—'
  const fmtUnix = (ts: number) => new Date(ts * 1000).toLocaleString()

  if (typeof document === 'undefined') return null

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70" />
      <div
        className="relative z-10 w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl overflow-hidden"
        style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Modal header ── */}
        <div className="flex items-center justify-between px-5 py-4 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ background: 'rgba(81,162,255,0.1)', border: '1px solid rgba(81,162,255,0.2)' }}>
              <Shield className="w-5 h-5 text-[#51a2ff]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">License Profile Lookup</h2>
              <p className="text-xs text-[#888] font-mono truncate max-w-[320px] mt-0.5">{licenseKey}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-[#888] hover:text-white hover:bg-white/10 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Loading / error ── */}
        {loading && (
          <div className="flex-1 flex items-center justify-center py-20">
            <div className="w-10 h-10 rounded-full border-2 border-transparent border-t-[#51a2ff] animate-spin" />
          </div>
        )}
        {error && (
          <div className="flex-1 flex items-center justify-center py-20 px-6 text-center">
            <div>
              <XCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
              <p className="text-sm text-red-300">{error}</p>
              <button onClick={onClose} className="mt-4 text-xs text-[#888] hover:text-white">Close</button>
            </div>
          </div>
        )}

        {data && !loading && (
          <>
            {/* ── User summary bar ── */}
            <div className="flex items-center gap-4 px-5 py-3 flex-shrink-0" style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {data.user.username?.[0]?.toUpperCase() ?? '?'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-white">{data.user.username}</span>
                  {data.user.role === 'admin' ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium border" style={{ background: 'rgba(168,85,247,0.15)', color: '#a78bfa', borderColor: 'rgba(168,85,247,0.3)' }}>
                      {data.user.role}
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium border" style={{ background: 'rgba(81,162,255,0.1)', color: '#51a2ff', borderColor: 'rgba(81,162,255,0.2)' }}>
                      {data.user.role}
                    </span>
                  )}
                  {data.user.isActive ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium border bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                      Active
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium border bg-red-500/20 text-red-300 border-red-500/30">
                      Inactive
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#888] truncate">{data.user.email}</p>
              </div>
              <div className="text-right text-xs text-[#555] flex-shrink-0">
                <p>{data.licenses.length} license{data.licenses.length !== 1 ? 's' : ''}</p>
                <p>{data.recentTransactions.length} transactions</p>
              </div>
            </div>

            {/* ── Tabs ── */}
            <div className="flex gap-1 px-5 py-2 flex-shrink-0 overflow-x-auto" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              {TABS.map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    tab === t
                      ? 'text-[#51a2ff]'
                      : 'text-[#888] hover:text-white hover:bg-white/5'
                  }`}
                  style={tab === t ? { background: 'rgba(81,162,255,0.1)', border: '1px solid rgba(81,162,255,0.2)' } : undefined}
                >
                  {t}
                  {t === 'Licenses' && <span className="ml-1 text-[10px] text-[#555]">({data.licenses.length})</span>}
                  {t === 'Activities' && <span className="ml-1 text-[10px] text-[#555]">({data.recentActivities.length})</span>}
                  {t === 'Event Logs' && <span className="ml-1 text-[10px] text-[#555]">({data.recentEventLogs.length})</span>}
                  {t === 'Token Audits' && <span className="ml-1 text-[10px] text-[#555]">({data.recentTokenAudits.length})</span>}
                  {t === 'Transactions' && <span className="ml-1 text-[10px] text-[#555]">({data.recentTransactions.length})</span>}
                </button>
              ))}
            </div>

            {/* ── Tab content ── */}
            <div className="flex-1 overflow-y-auto p-5 space-y-2">

              {/* ── Profile tab ── */}
              {tab === 'Profile' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl" style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-[#555] mb-3">Account Info</p>
                    <InfoRow label="User ID"><CopyValue value={data.user.id} /></InfoRow>
                    <InfoRow label="Username"><CopyValue value={data.user.username} mono={false} /></InfoRow>
                    <InfoRow label="Email"><CopyValue value={data.user.email} mono={false} /></InfoRow>
                    <InfoRow label="Full Name">
                      <span className="text-xs text-[#ccc]">{[data.user.firstName, data.user.lastName].filter(Boolean).join(' ') || '—'}</span>
                    </InfoRow>
                    <InfoRow label="Role">
                      {data.user.role === 'admin' ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium border" style={{ background: 'rgba(168,85,247,0.15)', color: '#a78bfa', borderColor: 'rgba(168,85,247,0.3)' }}>{data.user.role}</span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium border" style={{ background: 'rgba(255,255,255,0.05)', color: '#888', borderColor: 'rgba(255,255,255,0.1)' }}>{data.user.role}</span>
                      )}
                    </InfoRow>
                    <InfoRow label="Status">
                      <span className="text-xs"><StatusDot ok={data.user.isActive} />{data.user.isActive ? 'Active' : 'Inactive'}</span>
                    </InfoRow>
                    <InfoRow label="Email Verified">
                      <span className="text-xs text-[#ccc]">{data.user.emailVerifiedAt ? <><StatusDot ok={true} />{fmt(data.user.emailVerifiedAt)}</> : <span className="text-[#555]">Not verified</span>}</span>
                    </InfoRow>
                    <InfoRow label="Joined"><span className="text-xs text-[#ccc]">{fmt(data.user.createdAt)}</span></InfoRow>
                  </div>

                  <div className="p-4 rounded-xl" style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-[#555] mb-3">Login & Network</p>
                    <InfoRow label="Last Login"><span className="text-xs text-[#ccc]">{fmt(data.user.lastLoginAt)}</span></InfoRow>
                    <InfoRow label="Last Login IP"><CopyValue value={data.user.lastLoginIp || ''} /></InfoRow>
                    <InfoRow label="License IP"><CopyValue value={data.user.licensesIpAddress || ''} /></InfoRow>
                  </div>

                  {(data.user.discordId || data.user.discordUsername) && (
                    <div className="p-4 rounded-xl" style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.07)' }}>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-[#555] mb-3">Discord</p>
                      <InfoRow label="Discord ID"><CopyValue value={data.user.discordId || ''} /></InfoRow>
                      <InfoRow label="Username"><CopyValue value={data.user.discordUsername || ''} mono={false} /></InfoRow>
                    </div>
                  )}

                  {(data.user.trialStartAt || data.user.trialEndAt) && (
                    <div className="p-4 rounded-xl" style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.07)' }}>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-[#555] mb-3">Trial Period</p>
                      <InfoRow label="Trial Start"><span className="text-xs text-[#ccc]">{fmt(data.user.trialStartAt)}</span></InfoRow>
                      <InfoRow label="Trial End"><span className="text-xs text-[#ccc]">{fmt(data.user.trialEndAt)}</span></InfoRow>
                      <InfoRow label="Trial Status">
                        {data.user.trialEndAt && new Date(data.user.trialEndAt) > new Date()
                          ? <span className="text-xs text-emerald-400"><StatusDot ok={true} />Active</span>
                          : <span className="text-xs text-red-400"><StatusDot ok={false} />Expired</span>
                        }
                      </InfoRow>
                    </div>
                  )}
                </div>
              )}

              {/* ── Licenses tab ── */}
              {tab === 'Licenses' && (
                <div className="space-y-2">
                  {data.licenses.length === 0 && <p className="text-xs text-[#555] text-center py-8">No licenses found</p>}
                  {data.licenses.map(lic => {
                    const now = new Date()
                    const expired = lic.expiresAt ? new Date(lic.expiresAt) < now : false
                    const status = lic.isRevoked ? 'revoked' : expired ? 'expired' : lic.isActive ? 'active' : 'inactive'
                    const statusColor = { active: 'text-emerald-400', revoked: 'text-red-400', expired: 'text-yellow-400', inactive: 'text-[#888]' }[status]
                    return (
                      <div
                        key={lic.id}
                        className="p-4 rounded-xl"
                        style={lic.privateKey === licenseKey
                          ? { border: '1px solid rgba(81,162,255,0.4)', background: 'rgba(81,162,255,0.05)' }
                          : { border: '1px solid rgba(255,255,255,0.07)', background: '#1a1a1a' }
                        }
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-white truncate">{lic.script?.name ?? 'Unknown Script'}</p>
                            <div className="flex items-center gap-1 mt-0.5">
                              {lic.isTrial && (
                                <span className="text-[9px] px-2 py-0.5 rounded-full font-medium border bg-purple-500/20 text-purple-300 border-purple-500/30">Trial</span>
                              )}
                              {lic.privateKey === licenseKey && (
                                <span className="text-[9px] px-2 py-0.5 rounded-full font-medium border" style={{ background: 'rgba(81,162,255,0.15)', color: '#51a2ff', borderColor: 'rgba(81,162,255,0.3)' }}>Current</span>
                              )}
                            </div>
                          </div>
                          <span className={`text-[10px] font-semibold capitalize ${statusColor}`}>{status}</span>
                        </div>
                        <div className="space-y-1">
                          <InfoRow label="License Key"><CopyValue value={lic.privateKey} /></InfoRow>
                          <InfoRow label="Expires"><span className="text-xs text-[#ccc]">{lic.expiresAt ? fmt(lic.expiresAt) : 'Never'}</span></InfoRow>
                          {lic.lastUsedAt && <InfoRow label="Last Used"><span className="text-xs text-[#ccc]">{fmt(lic.lastUsedAt)}</span></InfoRow>}
                          {lic.lastUsedIp && <InfoRow label="Last IP"><CopyValue value={lic.lastUsedIp} /></InfoRow>}
                          {lic.serverName && <InfoRow label="Server"><CopyValue value={lic.serverName} mono={false} /></InfoRow>}
                          <InfoRow label="Created"><span className="text-xs text-[#ccc]">{fmt(lic.createdAt)}</span></InfoRow>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* ── Activities tab ── */}
              {tab === 'Activities' && (
                <div className="space-y-1.5">
                  {data.recentActivities.length === 0 && <p className="text-xs text-[#555] text-center py-8">No activities found</p>}
                  {data.recentActivities.map(act => (
                    <div key={act.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-[#1e1e1e] transition-colors" style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.07)' }}>
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(81,162,255,0.1)' }}>
                        <Activity className="w-3.5 h-3.5 text-[#51a2ff]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[9px] px-2 py-0.5 rounded-full font-medium border" style={{ background: 'rgba(255,255,255,0.05)', color: '#888', borderColor: 'rgba(255,255,255,0.1)' }}>{act.actionType}</span>
                          {act.ipAddress && <span className="text-[10px] text-[#555] font-mono">{act.ipAddress}</span>}
                        </div>
                        <p className="text-xs text-[#888] mt-0.5 truncate">{act.description}</p>
                      </div>
                      <span className="text-[10px] text-[#555] whitespace-nowrap flex-shrink-0">{new Date(act.createdAt).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* ── Event Logs tab ── */}
              {tab === 'Event Logs' && (
                <div className="space-y-1.5">
                  {data.recentEventLogs.length === 0 && <p className="text-xs text-[#555] text-center py-8">No event logs found</p>}
                  {data.recentEventLogs.map(log => (
                    <div key={log.id} className="p-3 rounded-xl hover:bg-[#1e1e1e] transition-colors space-y-1.5" style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.07)' }}>
                      <div className="flex items-center justify-between gap-3">
                        {log.event === 'LicenseValid' ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium border bg-green-500/20 text-green-400 border-green-500/30">{log.event}</span>
                        ) : log.event === 'LicenseInvalid' ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium border bg-red-500/20 text-red-400 border-red-500/30">{log.event}</span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium border" style={{ background: 'rgba(81,162,255,0.1)', color: '#51a2ff', borderColor: 'rgba(81,162,255,0.2)' }}>{log.event}</span>
                        )}
                        <span className="text-[10px] text-[#555] whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</span>
                      </div>
                      {log.details && <p className="text-xs text-[#888]">{log.details}</p>}
                      <div className="flex flex-wrap gap-x-4 gap-y-1">
                        {log.licenseKey && <span className="text-[10px] text-[#555]">Key: <CopyValue value={String(log.licenseKey)} /></span>}
                        {log.hostname && <span className="text-[10px] text-[#555]">Host: <CopyValue value={log.hostname} mono={false} /></span>}
                        {log.ip && <span className="text-[10px] text-[#555]">IP: <CopyValue value={log.ip} /></span>}
                        {log.serverName && <span className="text-[10px] text-[#555]">Server: <CopyValue value={log.serverName} mono={false} /></span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ── Token Audits tab ── */}
              {tab === 'Token Audits' && (
                <div className="space-y-1.5">
                  {data.recentTokenAudits.length === 0 && <p className="text-xs text-[#555] text-center py-8">No token audits found</p>}
                  {data.recentTokenAudits.map(audit => (
                    <div key={audit.id} className="p-3 rounded-xl hover:bg-[#1e1e1e] transition-colors space-y-1.5" style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.07)' }}>
                      <div className="flex items-center justify-between gap-3">
                        {audit.status === 200 ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium border bg-green-500/20 text-green-400 border-green-500/30">{audit.status} — {audit.message}</span>
                        ) : audit.status === 403 ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium border bg-red-500/20 text-red-400 border-red-500/30">{audit.status} — {audit.message}</span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium border bg-yellow-500/20 text-yellow-400 border-yellow-500/30">{audit.status} — {audit.message}</span>
                        )}
                        <span className="text-[10px] text-[#555] whitespace-nowrap">{new Date(audit.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1">
                        <span className="text-[10px] text-[#555]">Key: <CopyValue value={audit.licenseKey} /></span>
                        {audit.ip && <span className="text-[10px] text-[#555]">IP: <CopyValue value={audit.ip} /></span>}
                        {audit.version && <span className="text-[10px] text-[#555]">v{audit.version}</span>}
                        <span className="text-[10px] text-[#555]">Exp: {fmtUnix(audit.exp)}</span>
                      </div>
                      <p className="text-[10px] text-[#444] font-mono truncate">JTI: {audit.jti}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* ── Transactions tab ── */}
              {tab === 'Transactions' && (
                <div className="space-y-1.5">
                  {data.recentTransactions.length === 0 && <p className="text-xs text-[#555] text-center py-8">No transactions found</p>}
                  {data.recentTransactions.map(tx => (
                    <div key={tx.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#1e1e1e] transition-colors" style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.07)' }}>
                      <div className={`w-1.5 h-10 rounded-full flex-shrink-0 ${
                        tx.status === 'completed' ? 'bg-emerald-500' :
                        tx.status === 'refunded' ? 'bg-red-500' :
                        tx.status === 'pending' ? 'bg-yellow-500' : 'bg-gray-500'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-white truncate">{tx.script?.name ?? '—'}</p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-[10px] text-[#555] capitalize">{tx.type}</span>
                          <span className="text-[10px] text-[#444]">·</span>
                          <span className="text-[10px] text-[#555]">{tx.provider}</span>
                          <span className="text-[10px] text-[#444]">·</span>
                          {tx.status === 'completed' ? (
                            <span className="text-[9px] px-2 py-0.5 rounded-full font-medium border bg-emerald-500/20 text-emerald-300 border-emerald-500/30">{tx.status}</span>
                          ) : tx.status === 'refunded' ? (
                            <span className="text-[9px] px-2 py-0.5 rounded-full font-medium border bg-red-500/20 text-red-300 border-red-500/30">{tx.status}</span>
                          ) : (
                            <span className="text-[9px] px-2 py-0.5 rounded-full font-medium border bg-yellow-500/20 text-yellow-300 border-yellow-500/30">{tx.status}</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-emerald-400">${tx.amount.toFixed(2)}</p>
                        <p className="text-[10px] text-[#555]">{new Date(tx.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>

            {/* ── Footer ── */}
            <div className="px-5 pb-4 pt-2 flex-shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              <button onClick={onClose}
                style={{ border: '1px solid rgba(255,255,255,0.07)' }}
                className="w-full py-2 rounded-xl text-xs text-[#555] hover:text-white hover:bg-[#1a1a1a] transition-all">
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  )
}
