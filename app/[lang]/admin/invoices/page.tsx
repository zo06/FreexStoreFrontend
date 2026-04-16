'use client';

import { useState, useEffect, Suspense } from 'react';
import { withAdminAuth } from '@/lib/auth-context';
import { safeAdminApi } from '@/lib/admin-api';
import {
  FileText, Plus, RefreshCw, Copy, CheckCircle, Send,
  XCircle, ExternalLink, Loader2, ChevronLeft, ChevronRight,
  AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Invoice {
  id: string;
  stripeInvoiceId: string;
  customerEmail: string;
  customerName: string | null;
  description: string;
  amount: number;
  currency: string;
  status: string;
  paymentUrl: string | null;
  dueDate: string | null;
  paidAt: string | null;
  notes: string | null;
  createdAt: string;
  user?: { id: string; username: string; email: string } | null;
  creator?: { id: string; username: string } | null;
}

const STATUS_STYLES: Record<string, { badge: string }> = {
  open:          { badge: 'bg-blue-500/10 text-blue-400 border border-blue-500/25' },
  paid:          { badge: 'bg-green-500/10 text-green-400 border border-green-500/25' },
  void:          { badge: 'bg-[#333] text-[#888] border border-[rgba(255,255,255,0.07)]' },
  draft:         { badge: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/25' },
  uncollectible: { badge: 'bg-red-500/10 text-red-400 border border-red-500/25' },
};

function fmt(amount: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount);
}

function InvoicesContent() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [voidingId, setVoidingId] = useState<string | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    customerEmail: '',
    customerName: '',
    description: '',
    amount: '',
    currency: 'usd',
    daysUntilDue: '30',
    notes: '',
  });

  useEffect(() => { loadInvoices(); }, [page]);

  async function loadInvoices() {
    setLoading(true);
    try {
      const res = await safeAdminApi.invoices.getAll(page, 20);
      setInvoices(res.invoices || []);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || 1);
    } catch {
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.customerEmail || !form.description || !form.amount) {
      toast.error('Email, description and amount are required');
      return;
    }
    const amount = parseFloat(form.amount);
    if (isNaN(amount) || amount < 0.5) {
      toast.error('Amount must be at least 0.50');
      return;
    }
    setCreating(true);
    try {
      await safeAdminApi.invoices.create({
        customerEmail: form.customerEmail.trim(),
        customerName: form.customerName.trim() || undefined,
        description: form.description.trim(),
        amount,
        currency: form.currency,
        daysUntilDue: parseInt(form.daysUntilDue) || 30,
        notes: form.notes.trim() || undefined,
      });
      toast.success('Invoice created successfully!');
      setShowCreate(false);
      setForm({ customerEmail: '', customerName: '', description: '', amount: '', currency: 'usd', daysUntilDue: '30', notes: '' });
      setPage(1);
      loadInvoices();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create invoice');
    } finally {
      setCreating(false);
    }
  }

  async function handleCopy(url: string, id: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      toast.success('Payment link copied!');
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  }

  async function handleSync(id: string) {
    setSyncingId(id);
    try {
      const updated = await safeAdminApi.invoices.syncStatus(id);
      setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, ...updated } : inv));
      toast.success('Status synced from Stripe');
    } catch {
      toast.error('Failed to sync status');
    } finally {
      setSyncingId(null);
    }
  }

  async function handleVoid(id: string) {
    if (!confirm('Void this invoice? This cannot be undone.')) return;
    setVoidingId(id);
    try {
      const updated = await safeAdminApi.invoices.voidInvoice(id);
      setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, ...updated } : inv));
      toast.success('Invoice voided');
    } catch {
      toast.error('Failed to void invoice');
    } finally {
      setVoidingId(null);
    }
  }

  async function handleSend(id: string) {
    setSendingId(id);
    try {
      await safeAdminApi.invoices.sendInvoice(id);
      toast.success('Invoice sent to customer email');
    } catch {
      toast.error('Failed to send invoice');
    } finally {
      setSendingId(null);
    }
  }

  return (
    <div className="p-4 sm:p-6 min-h-screen bg-[#0a0a0a] text-white">
      <div className="mx-auto max-w-6xl space-y-6">

        {/* Header */}
        <div className="card-base p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className="p-2.5 rounded-xl"
                style={{ background: 'rgba(81,162,255,0.1)', border: '1px solid rgba(81,162,255,0.2)' }}
              >
                <FileText className="w-6 h-6 text-[#51a2ff]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Invoices</h1>
                <p className="text-[#555] text-sm">{total} invoice{total !== 1 ? 's' : ''} total</p>
              </div>
            </div>
            <button
              onClick={() => setShowCreate(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Invoice
            </button>
          </div>
        </div>

        {/* Create Invoice Modal */}
        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
            <div
              className="w-full max-w-lg rounded-2xl overflow-hidden"
              style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div
                className="flex items-center justify-between px-6 py-4"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
              >
                <h2 className="text-lg font-semibold text-white">Create Invoice</h2>
                <button
                  onClick={() => setShowCreate(false)}
                  className="p-2 rounded-lg text-[#888] hover:text-white transition-colors"
                  style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleCreate} className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm text-[#888] mb-1.5">Customer Email *</label>
                    <input
                      type="email"
                      required
                      value={form.customerEmail}
                      onChange={e => setForm(p => ({ ...p, customerEmail: e.target.value }))}
                      placeholder="customer@example.com"
                      className="input-base w-full"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm text-[#888] mb-1.5">Customer Name</label>
                    <input
                      type="text"
                      value={form.customerName}
                      onChange={e => setForm(p => ({ ...p, customerName: e.target.value }))}
                      placeholder="Optional"
                      className="input-base w-full"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm text-[#888] mb-1.5">Description *</label>
                    <input
                      type="text"
                      required
                      value={form.description}
                      onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                      placeholder="e.g. Script license - FiveM Premium"
                      className="input-base w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#888] mb-1.5">Amount *</label>
                    <input
                      type="number"
                      required
                      min="0.50"
                      step="0.01"
                      value={form.amount}
                      onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                      placeholder="0.00"
                      className="input-base w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#888] mb-1.5">Currency</label>
                    <select
                      value={form.currency}
                      onChange={e => setForm(p => ({ ...p, currency: e.target.value }))}
                      className="input-base w-full"
                    >
                      <option value="usd">USD</option>
                      <option value="eur">EUR</option>
                      <option value="gbp">GBP</option>
                      <option value="sar">SAR</option>
                      <option value="aed">AED</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-[#888] mb-1.5">Due in (days)</label>
                    <input
                      type="number"
                      min="1"
                      max="365"
                      value={form.daysUntilDue}
                      onChange={e => setForm(p => ({ ...p, daysUntilDue: e.target.value }))}
                      className="input-base w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#888] mb-1.5">Internal Notes</label>
                    <input
                      type="text"
                      value={form.notes}
                      onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                      placeholder="Optional"
                      className="input-base w-full"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={creating}
                    className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    {creating ? 'Creating...' : 'Create & Get Link'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreate(false)}
                    className="btn-ghost flex items-center gap-2"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Invoice List */}
        <div className="card-base overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-6 h-6 border-2 border-[rgba(255,255,255,0.07)] border-t-[#51a2ff] rounded-full animate-spin" />
            </div>
          ) : invoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <FileText className="w-12 h-12 text-[#333]" />
              <p className="text-[#555]">No invoices yet. Create one to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[800px]">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                    {['Customer', 'Description', 'Amount', 'Status', 'Due Date', 'Created By', 'Actions'].map((h, i) => (
                      <th
                        key={h}
                        className={`py-3.5 px-4 text-xs font-semibold text-[#555] uppercase tracking-wider ${i >= 5 ? 'text-right' : 'text-left'}`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {invoices.map(inv => (
                    <tr
                      key={inv.id}
                      className="hover:bg-white/[0.02] transition group"
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                    >
                      <td className="px-4 py-4">
                        <div className="font-medium text-white">{inv.customerName || inv.customerEmail}</div>
                        {inv.customerName && <div className="text-xs text-[#555] mt-0.5">{inv.customerEmail}</div>}
                        {inv.user && (
                          <div className="text-xs text-[#51a2ff] mt-0.5">@{inv.user.username}</div>
                        )}
                      </td>
                      <td className="px-4 py-4 text-[#888] max-w-[200px]">
                        <div className="truncate">{inv.description}</div>
                        {inv.notes && <div className="text-xs text-[#555] mt-0.5 truncate">{inv.notes}</div>}
                      </td>
                      <td className="px-4 py-4 font-semibold text-white">
                        {fmt(inv.amount, inv.currency)}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${(STATUS_STYLES[inv.status] || STATUS_STYLES.open).badge}`}>
                          {inv.status === 'paid' && <CheckCircle className="w-3 h-3 mr-1" />}
                          {inv.status === 'void' && <XCircle className="w-3 h-3 mr-1" />}
                          {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                        </span>
                        {inv.paidAt && (
                          <div className="text-xs text-[#555] mt-1">
                            Paid {new Date(inv.paidAt).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4 text-[#888]">
                        {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-4 py-4 text-right text-[#888] text-xs">
                        {inv.creator?.username || '—'}
                        <div className="text-[#444]">{new Date(inv.createdAt).toLocaleDateString()}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Copy payment link */}
                          {inv.paymentUrl && (
                            <button
                              onClick={() => handleCopy(inv.paymentUrl!, inv.id)}
                              title="Copy payment link"
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs transition-colors"
                              style={{
                                background: 'rgba(81,162,255,0.08)',
                                border: '1px solid rgba(81,162,255,0.2)',
                                color: '#51a2ff',
                              }}
                            >
                              {copiedId === inv.id ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                              {copiedId === inv.id ? 'Copied' : 'Copy Link'}
                            </button>
                          )}

                          {/* Open in Stripe */}
                          {inv.paymentUrl && (
                            <a
                              href={inv.paymentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Open payment page"
                              className="p-2 rounded-lg text-[#888] hover:text-white transition-colors"
                              style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.07)' }}
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}

                          {/* Send email */}
                          {inv.status === 'open' && (
                            <button
                              onClick={() => handleSend(inv.id)}
                              disabled={sendingId === inv.id}
                              title="Send to customer email"
                              className="p-2 rounded-lg text-[#888] hover:text-white transition-colors disabled:opacity-50"
                              style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.07)' }}
                            >
                              {sendingId === inv.id
                                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                : <Send className="w-3.5 h-3.5" />}
                            </button>
                          )}

                          {/* Sync status */}
                          <button
                            onClick={() => handleSync(inv.id)}
                            disabled={syncingId === inv.id}
                            title="Sync status from Stripe"
                            className="p-2 rounded-lg text-[#888] hover:text-white transition-colors disabled:opacity-50"
                            style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.07)' }}
                          >
                            {syncingId === inv.id
                              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              : <RefreshCw className="w-3.5 h-3.5" />}
                          </button>

                          {/* Void */}
                          {(inv.status === 'open' || inv.status === 'draft') && (
                            <button
                              onClick={() => handleVoid(inv.id)}
                              disabled={voidingId === inv.id}
                              title="Void invoice"
                              className="p-2 rounded-lg text-red-400 transition-colors disabled:opacity-50"
                              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
                            >
                              {voidingId === inv.id
                                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                : <AlertTriangle className="w-3.5 h-3.5" />}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-1">
            <p className="text-sm text-[#555]">
              Page {page} of {totalPages} · {total} invoices
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-ghost flex items-center gap-1 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
                Prev
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="btn-ghost flex items-center gap-1 disabled:opacity-40"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InvoicesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[rgba(255,255,255,0.07)] border-t-[#51a2ff] rounded-full animate-spin" />
      </div>
    }>
      <InvoicesContent />
    </Suspense>
  );
}

export default withAdminAuth(InvoicesPage);
