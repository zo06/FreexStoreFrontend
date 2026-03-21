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
  const [form, setForm] = useState({ ...emptyForm });
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
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Tag className="w-6 h-6 text-cyan-400" />Coupons</h1>
          <p className="text-gray-400 text-sm mt-1">{total} total coupons</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold rounded-xl transition-all">
          <Plus className="w-4 h-4" />Create Coupon
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search coupons..." className="w-full h-10 pl-9 pr-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 text-sm focus:border-cyan-500/50 focus:outline-none" />
        </div>
        <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }} className="h-10 px-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none">
          <option value="">All Types</option>
          <option value="short_term">Short Term</option>
          <option value="forever_term">Forever Term</option>
        </select>
        <button onClick={loadCoupons} className="h-10 px-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Table */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                {['Code', 'Name', 'Type', 'Discount', 'Uses', 'Status', 'Expires', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-500">Loading...</td></tr>
              ) : coupons.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-500">No coupons found</td></tr>
              ) : coupons.map(c => (
                <tr key={c.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-cyan-300">{c.code}</td>
                  <td className="px-4 py-3 text-white">{c.name}</td>
                  <td className="px-4 py-3">
                    {c.type === 'short_term' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30"><Clock className="w-3 h-3" />Short Term</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30"><Infinity className="w-3 h-3" />Forever</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-semibold text-emerald-300">
                    {c.discountType === 'percentage' ? `${c.discountValue}%` : `$${c.discountValue}`}
                  </td>
                  <td className="px-4 py-3 text-gray-300">{c.usedCount}{c.maxUses ? `/${c.maxUses}` : ''}</td>
                  <td className="px-4 py-3">
                    {!c.isActive ? (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-gray-500/20 text-gray-400 border border-gray-500/30">Inactive</span>
                    ) : isExpired(c) ? (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-red-500/20 text-red-300 border border-red-500/30">Expired</span>
                    ) : (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Active</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {c.type === 'forever_term' ? '∞ Never' : c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : '–'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteId(c.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > limit && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
            <span className="text-sm text-gray-400">Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}</span>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 text-sm bg-white/5 border border-white/10 rounded-lg text-gray-400 hover:text-white disabled:opacity-30 transition-colors">Prev</button>
              <button disabled={page * limit >= total} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 text-sm bg-white/5 border border-white/10 rounded-lg text-gray-400 hover:text-white disabled:opacity-30 transition-colors">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0d1424] border border-white/15 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <h2 className="text-lg font-bold text-white">{editingId ? 'Edit Coupon' : 'Create Coupon'}</h2>
              <button onClick={() => setModalOpen(false)} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              {/* Type selector */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Coupon Type</label>
                <div className="flex gap-2">
                  {(['short_term', 'forever_term'] as const).map(t => (
                    <button key={t} onClick={() => setForm(f => ({ ...f, type: t }))}
                      className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-medium border transition-all flex items-center justify-center gap-2 ${form.type === t ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'}`}>
                      {t === 'short_term' ? <><Clock className="w-4 h-4" />Short Term</> : <><Infinity className="w-4 h-4" />Forever Term</>}
                    </button>
                  ))}
                </div>
                {form.type === 'short_term' && <p className="text-xs text-orange-400 mt-1.5">Time-limited coupon with optional expiry date</p>}
                {form.type === 'forever_term' && <p className="text-xs text-purple-400 mt-1.5">Permanent coupon that never expires</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Code *</label>
                  <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="SAVE20" className="w-full h-10 px-3 bg-white/5 border border-white/10 rounded-xl text-white font-mono text-sm focus:border-cyan-500/50 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Name *</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Save 20%" className="w-full h-10 px-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:border-cyan-500/50 focus:outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Description</label>
                <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional description..." className="w-full h-10 px-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:border-cyan-500/50 focus:outline-none" />
              </div>

              {/* Discount */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Discount</label>
                <div className="flex gap-2">
                  <div className="flex gap-1 p-1 bg-white/5 border border-white/10 rounded-xl">
                    <button onClick={() => setForm(f => ({ ...f, discountType: 'percentage' }))} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${form.discountType === 'percentage' ? 'bg-cyan-500/20 text-cyan-300' : 'text-gray-400'}`}>
                      <Percent className="w-3.5 h-3.5" />%
                    </button>
                    <button onClick={() => setForm(f => ({ ...f, discountType: 'fixed' }))} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${form.discountType === 'fixed' ? 'bg-cyan-500/20 text-cyan-300' : 'text-gray-400'}`}>
                      <DollarSign className="w-3.5 h-3.5" />Fixed
                    </button>
                  </div>
                  <input type="number" min="0" max={form.discountType === 'percentage' ? 100 : undefined} value={form.discountValue} onChange={e => setForm(f => ({ ...f, discountValue: Number(e.target.value) }))} className="flex-1 h-10 px-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:border-cyan-500/50 focus:outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Min Order Amount ($)</label>
                  <input type="number" min="0" value={form.minOrderAmount} onChange={e => setForm(f => ({ ...f, minOrderAmount: e.target.value }))} placeholder="No minimum" className="w-full h-10 px-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:border-cyan-500/50 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Max Uses</label>
                  <input type="number" min="0" value={form.maxUses} onChange={e => setForm(f => ({ ...f, maxUses: e.target.value }))} placeholder="Unlimited" className="w-full h-10 px-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:border-cyan-500/50 focus:outline-none" />
                </div>
              </div>

              {form.type === 'short_term' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5">Starts At</label>
                    <input type="datetime-local" value={form.startsAt} onChange={e => setForm(f => ({ ...f, startsAt: e.target.value }))} className="w-full h-10 px-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:border-cyan-500/50 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5">Expires At</label>
                    <input type="datetime-local" value={form.expiresAt} onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))} className="w-full h-10 px-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:border-cyan-500/50 focus:outline-none" />
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <button onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
                  className={`w-10 h-6 rounded-full transition-all relative ${form.isActive ? 'bg-cyan-600' : 'bg-gray-700'}`}>
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.isActive ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </button>
                <span className="text-sm text-gray-400">Active</span>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-white/10">
              <button onClick={() => setModalOpen(false)} className="flex-1 py-2.5 text-sm font-medium text-gray-400 bg-white/5 border border-white/10 rounded-xl hover:text-white transition-all">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-xl transition-all disabled:opacity-50">
                {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Create Coupon'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0d1424] border border-white/15 rounded-2xl p-6 w-full max-w-sm text-center">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Delete Coupon?</h3>
            <p className="text-gray-400 text-sm mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 text-sm font-medium text-gray-400 bg-white/5 border border-white/10 rounded-xl hover:text-white transition-all">Cancel</button>
              <button onClick={handleDelete} className="flex-1 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 rounded-xl transition-all">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
