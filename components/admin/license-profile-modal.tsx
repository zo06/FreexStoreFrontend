"use client"

import { useState, useEffect } from 'react'
import {
  X, User, Key, Activity, Shield, CreditCard, Copy, Check,
  CheckCircle, XCircle, AlertTriangle, Clock, Globe, Mail,
  MessageSquare, Wifi, Calendar, ExternalLink,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
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
      <span className={mono ? 'font-mono text-xs text-gray-200 break-all' : 'text-xs text-gray-200'}>{value || '—'}</span>
      {value && (copied
        ? <Check className="w-3 h-3 text-green-400 flex-shrink-0" />
        : <Copy className="w-3 h-3 text-gray-600 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
    </span>
  )
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-1.5">
      <span className="text-xs text-gray-500 w-32 flex-shrink-0 pt-0.5">{label}</span>
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

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/licenses/admin/lookup/${encodeURIComponent(licenseKey)}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async r => {
        if (!r.ok) throw new Error(await r.text())
        return r.json()
      })
      .then(setData)
      .catch(e => setError(e.message || 'Failed to load profile'))
      .finally(() => setLoading(false))
  }, [licenseKey])

  const fmt = (d?: string | null) => d ? new Date(d).toLocaleString() : '—'
  const fmtUnix = (ts: number) => new Date(ts * 1000).toLocaleString()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative z-10 w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl border border-white/10 bg-slate-900/98 shadow-2xl backdrop-blur-xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* ── Modal header ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-lg border border-white/10">
              <Shield className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">License Profile Lookup</h2>
              <p className="text-xs text-gray-400 font-mono truncate max-w-[320px] mt-0.5">{licenseKey}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Loading / error ── */}
        {loading && (
          <div className="flex-1 flex items-center justify-center py-20">
            <div className="w-10 h-10 rounded-full border-2 border-b-cyan-400 animate-spin" />
          </div>
        )}
        {error && (
          <div className="flex-1 flex items-center justify-center py-20 px-6 text-center">
            <div>
              <XCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
              <p className="text-sm text-red-300">{error}</p>
              <button onClick={onClose} className="mt-4 text-xs text-gray-400 hover:text-white">Close</button>
            </div>
          </div>
        )}

        {data && !loading && (
          <>
            {/* ── User summary bar ── */}
            <div className="flex items-center gap-4 px-5 py-3 bg-white/5 border-b border-white/10 flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {data.user.username?.[0]?.toUpperCase() ?? '?'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-white">{data.user.username}</span>
                  <Badge className={`text-[10px] border ${data.user.role === 'admin' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' : 'bg-blue-500/20 text-blue-300 border-blue-500/30'}`}>
                    {data.user.role}
                  </Badge>
                  <Badge className={`text-[10px] border ${data.user.isActive ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-red-500/20 text-red-300 border-red-500/30'}`}>
                    {data.user.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <p className="text-xs text-gray-400 truncate">{data.user.email}</p>
              </div>
              <div className="text-right text-xs text-gray-500 flex-shrink-0">
                <p>{data.licenses.length} license{data.licenses.length !== 1 ? 's' : ''}</p>
                <p>{data.recentTransactions.length} transactions</p>
              </div>
            </div>

            {/* ── Tabs ── */}
            <div className="flex gap-1 px-5 py-2 border-b border-white/10 flex-shrink-0 overflow-x-auto">
              {TABS.map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    tab === t
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {t}
                  {t === 'Licenses' && <span className="ml-1 text-[10px] text-gray-500">({data.licenses.length})</span>}
                  {t === 'Activities' && <span className="ml-1 text-[10px] text-gray-500">({data.recentActivities.length})</span>}
                  {t === 'Event Logs' && <span className="ml-1 text-[10px] text-gray-500">({data.recentEventLogs.length})</span>}
                  {t === 'Token Audits' && <span className="ml-1 text-[10px] text-gray-500">({data.recentTokenAudits.length})</span>}
                  {t === 'Transactions' && <span className="ml-1 text-[10px] text-gray-500">({data.recentTransactions.length})</span>}
                </button>
              ))}
            </div>

            {/* ── Tab content ── */}
            <div className="flex-1 overflow-y-auto p-5 space-y-2">

              {/* ── Profile tab ── */}
              {tab === 'Profile' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-3">Account Info</p>
                    <InfoRow label="User ID"><CopyValue value={data.user.id} /></InfoRow>
                    <InfoRow label="Username"><CopyValue value={data.user.username} mono={false} /></InfoRow>
                    <InfoRow label="Email"><CopyValue value={data.user.email} mono={false} /></InfoRow>
                    <InfoRow label="Full Name">
                      <span className="text-xs text-gray-200">{[data.user.firstName, data.user.lastName].filter(Boolean).join(' ') || '—'}</span>
                    </InfoRow>
                    <InfoRow label="Role">
                      <Badge className={`text-[10px] border ${data.user.role === 'admin' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' : 'bg-slate-500/20 text-slate-300 border-slate-500/30'}`}>{data.user.role}</Badge>
                    </InfoRow>
                    <InfoRow label="Status">
                      <span className="text-xs"><StatusDot ok={data.user.isActive} />{data.user.isActive ? 'Active' : 'Inactive'}</span>
                    </InfoRow>
                    <InfoRow label="Email Verified">
                      <span className="text-xs text-gray-200">{data.user.emailVerifiedAt ? <><StatusDot ok={true} />{fmt(data.user.emailVerifiedAt)}</> : <span className="text-gray-500">Not verified</span>}</span>
                    </InfoRow>
                    <InfoRow label="Joined"><span className="text-xs text-gray-200">{fmt(data.user.createdAt)}</span></InfoRow>
                  </div>

                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-3">Login & Network</p>
                    <InfoRow label="Last Login"><span className="text-xs text-gray-200">{fmt(data.user.lastLoginAt)}</span></InfoRow>
                    <InfoRow label="Last Login IP"><CopyValue value={data.user.lastLoginIp || ''} /></InfoRow>
                    <InfoRow label="License IP"><CopyValue value={data.user.licensesIpAddress || ''} /></InfoRow>
                  </div>

                  {(data.user.discordId || data.user.discordUsername) && (
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-3">Discord</p>
                      <InfoRow label="Discord ID"><CopyValue value={data.user.discordId || ''} /></InfoRow>
                      <InfoRow label="Username"><CopyValue value={data.user.discordUsername || ''} mono={false} /></InfoRow>
                    </div>
                  )}

                  {(data.user.trialStartAt || data.user.trialEndAt) && (
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-3">Trial Period</p>
                      <InfoRow label="Trial Start"><span className="text-xs text-gray-200">{fmt(data.user.trialStartAt)}</span></InfoRow>
                      <InfoRow label="Trial End"><span className="text-xs text-gray-200">{fmt(data.user.trialEndAt)}</span></InfoRow>
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
                  {data.licenses.length === 0 && <p className="text-xs text-gray-500 text-center py-8">No licenses found</p>}
                  {data.licenses.map(lic => {
                    const now = new Date()
                    const expired = lic.expiresAt ? new Date(lic.expiresAt) < now : false
                    const status = lic.isRevoked ? 'revoked' : expired ? 'expired' : lic.isActive ? 'active' : 'inactive'
                    const statusColor = { active: 'text-emerald-400', revoked: 'text-red-400', expired: 'text-yellow-400', inactive: 'text-gray-400' }[status]
                    return (
                      <div key={lic.id} className={`p-4 rounded-xl border ${lic.privateKey === licenseKey ? 'border-cyan-500/40 bg-cyan-500/5' : 'border-white/10 bg-white/5'}`}>
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-white truncate">{lic.script?.name ?? 'Unknown Script'}</p>
                            <div className="flex items-center gap-1 mt-0.5">
                              {lic.isTrial && <Badge className="text-[9px] border bg-purple-500/20 text-purple-300 border-purple-500/30">Trial</Badge>}
                              {lic.privateKey === licenseKey && <Badge className="text-[9px] border bg-cyan-500/20 text-cyan-300 border-cyan-500/30">Current</Badge>}
                            </div>
                          </div>
                          <span className={`text-[10px] font-semibold capitalize ${statusColor}`}>{status}</span>
                        </div>
                        <div className="space-y-1">
                          <InfoRow label="License Key"><CopyValue value={lic.privateKey} /></InfoRow>
                          <InfoRow label="Expires"><span className="text-xs text-gray-200">{lic.expiresAt ? fmt(lic.expiresAt) : 'Never'}</span></InfoRow>
                          {lic.lastUsedAt && <InfoRow label="Last Used"><span className="text-xs text-gray-200">{fmt(lic.lastUsedAt)}</span></InfoRow>}
                          {lic.lastUsedIp && <InfoRow label="Last IP"><CopyValue value={lic.lastUsedIp} /></InfoRow>}
                          {lic.serverName && <InfoRow label="Server"><CopyValue value={lic.serverName} mono={false} /></InfoRow>}
                          <InfoRow label="Created"><span className="text-xs text-gray-200">{fmt(lic.createdAt)}</span></InfoRow>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* ── Activities tab ── */}
              {tab === 'Activities' && (
                <div className="space-y-1.5">
                  {data.recentActivities.length === 0 && <p className="text-xs text-gray-500 text-center py-8">No activities found</p>}
                  {data.recentActivities.map(act => (
                    <div key={act.id} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/[0.08] transition-colors">
                      <div className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                        <Activity className="w-3.5 h-3.5 text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className="text-[9px] border bg-slate-500/20 text-slate-300 border-slate-500/30">{act.actionType}</Badge>
                          {act.ipAddress && <span className="text-[10px] text-gray-500 font-mono">{act.ipAddress}</span>}
                        </div>
                        <p className="text-xs text-gray-300 mt-0.5 truncate">{act.description}</p>
                      </div>
                      <span className="text-[10px] text-gray-500 whitespace-nowrap flex-shrink-0">{new Date(act.createdAt).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* ── Event Logs tab ── */}
              {tab === 'Event Logs' && (
                <div className="space-y-1.5">
                  {data.recentEventLogs.length === 0 && <p className="text-xs text-gray-500 text-center py-8">No event logs found</p>}
                  {data.recentEventLogs.map(log => (
                    <div key={log.id} className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/[0.08] transition-colors space-y-1.5">
                      <div className="flex items-center justify-between gap-3">
                        <Badge className={`text-[10px] border ${
                          log.event === 'LicenseValid' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                          log.event === 'LicenseInvalid' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                          'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
                        }`}>{log.event}</Badge>
                        <span className="text-[10px] text-gray-500 whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</span>
                      </div>
                      {log.details && <p className="text-xs text-gray-300">{log.details}</p>}
                      <div className="flex flex-wrap gap-x-4 gap-y-1">
                        {log.licenseKey && <span className="text-[10px] text-gray-500">Key: <CopyValue value={String(log.licenseKey)} /></span>}
                        {log.hostname && <span className="text-[10px] text-gray-500">Host: <CopyValue value={log.hostname} mono={false} /></span>}
                        {log.ip && <span className="text-[10px] text-gray-500">IP: <CopyValue value={log.ip} /></span>}
                        {log.serverName && <span className="text-[10px] text-gray-500">Server: <CopyValue value={log.serverName} mono={false} /></span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ── Token Audits tab ── */}
              {tab === 'Token Audits' && (
                <div className="space-y-1.5">
                  {data.recentTokenAudits.length === 0 && <p className="text-xs text-gray-500 text-center py-8">No token audits found</p>}
                  {data.recentTokenAudits.map(audit => (
                    <div key={audit.id} className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/[0.08] transition-colors space-y-1.5">
                      <div className="flex items-center justify-between gap-3">
                        <Badge className={`text-[10px] border ${
                          audit.status === 200 ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                          audit.status === 403 ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                          'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                        }`}>{audit.status} — {audit.message}</Badge>
                        <span className="text-[10px] text-gray-500 whitespace-nowrap">{new Date(audit.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1">
                        <span className="text-[10px] text-gray-500">Key: <CopyValue value={audit.licenseKey} /></span>
                        {audit.ip && <span className="text-[10px] text-gray-500">IP: <CopyValue value={audit.ip} /></span>}
                        {audit.version && <span className="text-[10px] text-gray-500">v{audit.version}</span>}
                        <span className="text-[10px] text-gray-500">Exp: {fmtUnix(audit.exp)}</span>
                      </div>
                      <p className="text-[10px] text-gray-600 font-mono truncate">JTI: {audit.jti}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* ── Transactions tab ── */}
              {tab === 'Transactions' && (
                <div className="space-y-1.5">
                  {data.recentTransactions.length === 0 && <p className="text-xs text-gray-500 text-center py-8">No transactions found</p>}
                  {data.recentTransactions.map(tx => (
                    <div key={tx.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/[0.08] transition-colors">
                      <div className={`w-1.5 h-10 rounded-full flex-shrink-0 ${
                        tx.status === 'completed' ? 'bg-emerald-500' :
                        tx.status === 'refunded' ? 'bg-red-500' :
                        tx.status === 'pending' ? 'bg-yellow-500' : 'bg-gray-500'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-white truncate">{tx.script?.name ?? '—'}</p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-[10px] text-gray-500 capitalize">{tx.type}</span>
                          <span className="text-[10px] text-gray-600">·</span>
                          <span className="text-[10px] text-gray-500">{tx.provider}</span>
                          <span className="text-[10px] text-gray-600">·</span>
                          <Badge className={`text-[9px] border ${
                            tx.status === 'completed' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                            tx.status === 'refunded' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                            'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                          }`}>{tx.status}</Badge>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-emerald-400">${tx.amount.toFixed(2)}</p>
                        <p className="text-[10px] text-gray-500">{new Date(tx.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>

            {/* ── Footer ── */}
            <div className="px-5 pb-4 pt-2 border-t border-white/10 flex-shrink-0">
              <button onClick={onClose}
                className="w-full py-2 rounded-xl text-xs text-gray-400 border border-white/10 hover:bg-white/5 hover:text-white transition-all">
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
