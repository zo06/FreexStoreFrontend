'use client';

import { useState, useEffect, useCallback } from 'react';
import { Tag, Plus, Edit, Trash2, Search, RefreshCw, Check, X, Clock, Infinity, Percent, DollarSign, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

interface Coupon {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: 'short_term' | 'forever_term';
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount?: number;
  maxUses?: number;
  usedCount: number;
  isActive: boolean;
  startsAt?: string;
  expiresAt?: string;
  createdAt: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

function getToken() {
  return typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
}

async function apiRequest(method: string, path: string, body?: any) {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

const emptyForm = { code: '', name: '', description: '', type: 'short_term' as const, discountType: 'percentage' as const, discountValue: 10, minOrderAmount: '', maxUses: '', isActive: true, startsAt: '', expiresAt: '' };

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<typeof emptyForm, 'type' | 'discountType'> & { type: 'short_term' | 'forever_term'; discountType: 'percentage' | 'fixed' }>({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const limit = 20;

  const loadCoupons = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (search) params.set('search', search);
      if (typeFilter) params.set('type', typeFilter);
      const data = await apiRequest('GET', `/coupons?${params}`);
      setCoupons(data.data || []);
      setTotal(data.total || 0);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, [page, search, typeFilter]);

  useEffect(() => { loadCoupons(); }, [loadCoupons]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setModalOpen(true);
  };

  const openEdit = (c: Coupon) => {
    setEditingId(c.id);
    setForm({
      code: c.code,
      name: c.name,
      description: c.description || '',
      type: c.type,
      discountType: c.discountType,
      discountValue: c.discountValue,
      minOrderAmount: c.minOrderAmount ? String(c.minOrderAmount) : '',
      maxUses: c.maxUses ? String(c.maxUses) : '',
      isActive: c.isActive,
      startsAt: c.startsAt ? c.startsAt.slice(0, 16) : '',
      expiresAt: c.expiresAt ? c.expiresAt.slice(0, 16) : '',
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.code.trim() || !form.name.trim()) return toast.error('Code and name are required');
    setSaving(true);
    try {
      const body: any = {
        code: form.code.toUpperCase(),
        name: form.name,
        description: form.description || undefined,
        type: form.type,
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : undefined,
        maxUses: form.maxUses ? Number(form.maxUses) : undefined,
        isActive: form.isActive,
        startsAt: form.type === 'short_term' && form.startsAt ? form.startsAt : undefined,
        expiresAt: form.type === 'short_term' && form.expiresAt ? form.expiresAt : undefined,
      };
      if (editingId) {
        await apiRequest('PATCH', `/coupons/${editingId}`, body);
        toast.success('Coupon updated');
      } else {
        await apiRequest('POST', '/coupons', body);
        toast.success('Coupon created');
      }
      setModalOpen(false);
      loadCoupons();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await apiRequest('DELETE', `/coupons/${deleteId}`);
      toast.success('Coupon deleted');
      setDeleteId(null);
      loadCoupons();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const isExpired = (c: Coupon) => c.expiresAt && new Date(c.expiresAt) < new Date();

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-6 space-y-6">
      {/* Header */}
      <div className="card-base p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl" style={{ background: 'rgba(81,162,255,0.1)', border: '1px solid rgba(81,162,255,0.2)' }}>
              <Tag className="w-6 h-6 text-[#51a2ff]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Coupons</h1>
              <p className="text-[#888] text-sm mt-1">{total} total coupons</p>
            </div>
          </div>
          <button onClick={openCreate} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />Create Coupon
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card-base p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555]" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search coupons..."
              className="input-base w-full pl-9"
            />
          </div>
          <select
            value={typeFilter}
            onChange={e => { setTypeFilter(e.target.value); setPage(1); }}
            className="input-base h-10 px-3"
          >
            <option value="">All Types</option>
            <option value="short_term">Short Term</option>
            <option value="forever_term">Forever Term</option>
          </select>
          <button
            onClick={loadCoupons}
            className="p-2 rounded-lg text-[#888] hover:text-white transition-colors"
            style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card-base overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}>
                {['Code', 'Name', 'Type', 'Discount', 'Uses', 'Status', 'Expires', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-[#555] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-[#555]">Loading...</td></tr>
              ) : coupons.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-[#555]">No coupons found</td></tr>
              ) : coupons.map(c => (
                <tr key={c.id} className="transition-colors" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                  onMouseLeave={e => (e.currentTarget.style.background = '')}
                >
                  <td className="px-4 py-3 font-mono font-bold text-[#51a2ff]">{c.code}</td>
                  <td className="px-4 py-3 text-white">{c.name}</td>
                  <td className="px-4 py-3">
                    {c.type === 'short_term' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30">
                        <Clock className="w-3 h-3" />Short Term
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        <Infinity className="w-3 h-3" />Forever
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-semibold text-emerald-300">
                    {c.discountType === 'percentage' ? `${c.discountValue}%` : `$${c.discountValue}`}
                  </td>
                  <td className="px-4 py-3 text-[#aaa]">{c.usedCount}{c.maxUses ? `/${c.maxUses}` : ''}</td>
                  <td className="px-4 py-3">
                    {!c.isActive ? (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-gray-500/20 text-gray-400 border border-gray-500/30">Inactive</span>
                    ) : isExpired(c) ? (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-red-500/20 text-red-300 border border-red-500/30">Expired</span>
                    ) : (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Active</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[#555] text-xs">
                    {c.type === 'forever_term' ? '∞ Never' : c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : '–'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEdit(c)}
                        className="p-2 rounded-lg text-[#888] hover:text-[#51a2ff] transition-colors"
                        style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.07)' }}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteId(c.id)}
                        className="p-2 rounded-lg text-[#888] hover:text-red-400 transition-colors"
                        style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.07)' }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > limit && (
          <div className="card-base p-4 flex items-center justify-between" style={{ borderTop: '1px solid rgba(255,255,255,0.07)', borderRadius: 0 }}>
            <span className="text-sm text-[#888]">Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}</span>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="btn-ghost btn-sm disabled:opacity-30"
              >
                Prev
              </button>
              <button
                disabled={page * limit >= total}
                onClick={() => setPage(p => p + 1)}
                className="btn-ghost btn-sm disabled:opacity-30"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto card-base">
            <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <h2 className="text-lg font-bold text-white">{editingId ? 'Edit Coupon' : 'Create Coupon'}</h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-lg text-[#888] hover:text-white transition-colors"
                style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {/* Type selector */}
              <div>
                <label className="block text-sm text-[#888] mb-2">Coupon Type</label>
                <div className="flex gap-2">
                  {(['short_term', 'forever_term'] as const).map(t => (
                    <button key={t} onClick={() => setForm(f => ({ ...f, type: t }))}
                      className="flex-1 py-2.5 px-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2"
                      style={form.type === t
                        ? { background: 'rgba(81,162,255,0.1)', border: '1px solid rgba(81,162,255,0.3)', color: '#51a2ff' }
                        : { background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.07)', color: '#888' }
                      }
                    >
                      {t === 'short_term' ? <><Clock className="w-4 h-4" />Short Term</> : <><Infinity className="w-4 h-4" />Forever Term</>}
                    </button>
                  ))}
                </div>
                {form.type === 'short_term' && <p className="text-xs text-orange-400 mt-1.5">Time-limited coupon with optional expiry date</p>}
                {form.type === 'forever_term' && <p className="text-xs text-purple-400 mt-1.5">Permanent coupon that never expires</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#888] mb-1.5">Code *</label>
                  <input
                    value={form.code}
                    onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                    placeholder="SAVE20"
                    className="input-base w-full font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#888] mb-1.5">Name *</label>
                  <input
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Save 20%"
                    className="input-base w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-[#888] mb-1.5">Description</label>
                <input
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Optional description..."
                  className="input-base w-full"
                />
              </div>

              {/* Discount */}
              <div>
                <label className="block text-sm text-[#888] mb-2">Discount</label>
                <div className="flex gap-2">
                  <div className="flex gap-1 p-1 rounded-xl" style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <button
                      onClick={() => setForm(f => ({ ...f, discountType: 'percentage' }))}
                      className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5"
                      style={form.discountType === 'percentage'
                        ? { background: 'rgba(81,162,255,0.15)', color: '#51a2ff' }
                        : { color: '#888' }
                      }
                    >
                      <Percent className="w-3.5 h-3.5" />%
                    </button>
                    <button
                      onClick={() => setForm(f => ({ ...f, discountType: 'fixed' }))}
                      className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5"
                      style={form.discountType === 'fixed'
                        ? { background: 'rgba(81,162,255,0.15)', color: '#51a2ff' }
                        : { color: '#888' }
                      }
                    >
                      <DollarSign className="w-3.5 h-3.5" />Fixed
                    </button>
                  </div>
                  <input
                    type="number"
                    min="0"
                    max={form.discountType === 'percentage' ? 100 : undefined}
                    value={form.discountValue}
                    onChange={e => setForm(f => ({ ...f, discountValue: Number(e.target.value) }))}
                    className="input-base flex-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#888] mb-1.5">Min Order Amount ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.minOrderAmount}
                    onChange={e => setForm(f => ({ ...f, minOrderAmount: e.target.value }))}
                    placeholder="No minimum"
                    className="input-base w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#888] mb-1.5">Max Uses</label>
                  <input
                    type="number"
                    min="0"
                    value={form.maxUses}
                    onChange={e => setForm(f => ({ ...f, maxUses: e.target.value }))}
                    placeholder="Unlimited"
                    className="input-base w-full"
                  />
                </div>
              </div>

              {form.type === 'short_term' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-[#888] mb-1.5">Starts At</label>
                    <input
                      type="datetime-local"
                      value={form.startsAt}
                      onChange={e => setForm(f => ({ ...f, startsAt: e.target.value }))}
                      className="input-base w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#888] mb-1.5">Expires At</label>
                    <input
                      type="datetime-local"
                      value={form.expiresAt}
                      onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))}
                      className="input-base w-full"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
                  className="w-10 h-6 rounded-full transition-all relative"
                  style={{ background: form.isActive ? '#51a2ff' : '#333' }}
                >
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.isActive ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </button>
                <span className="text-sm text-[#888]">Active</span>
              </div>
            </div>
            <div className="flex gap-3 p-5" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              <button onClick={() => setModalOpen(false)} className="btn-ghost flex-1">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 disabled:opacity-50">
                {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Create Coupon'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-sm card-base p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Delete Coupon?</h3>
            <p className="text-[#888] text-sm mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="btn-ghost flex-1">Cancel</button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2.5 text-sm rounded-lg font-medium text-red-400"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
