'use client';

import { useState, useEffect } from 'react';
import { withAdminAuth } from '@/lib/auth-context';
import { Switch } from '@/components/ui/switch';
import { AnimatedSelect } from '@/components/ui/animated-select';
import { HelpCircle, Plus, Edit, Trash2, Save, X, Search, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

function FAQManagement() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'general',
    order: 0,
    isActive: true
  });

  const categories = [
    { value: 'general', label: 'General' },
    { value: 'billing', label: 'Billing' },
    { value: 'technical', label: 'Technical' },
    { value: 'scripts', label: 'Scripts' },
    { value: 'licenses', label: 'Licenses' },
    { value: 'support', label: 'Support' }
  ];

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/admin/faqs');
      const data = (response as any).data || response;
      setFaqs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch FAQs:', error);
      toast.error('Failed to load FAQs');
      setFaqs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.question.trim() || !formData.answer.trim()) {
      toast.error('Question and answer are required');
      return;
    }

    if (formData.question.trim().length < 5) {
      toast.error('Question must be at least 5 characters long');
      return;
    }

    if (formData.answer.trim().length < 10) {
      toast.error('Answer must be at least 10 characters long');
      return;
    }

    if (formData.question.length > 500) {
      toast.error('Question must not exceed 500 characters');
      return;
    }

    if (formData.category.length > 100) {
      toast.error('Category must not exceed 100 characters');
      return;
    }

    try {
      if (editingId) {
        await apiClient.put(`/admin/faqs/${editingId}`, formData);
        toast.success('FAQ updated successfully');
      } else {
        await apiClient.post('/admin/faqs', formData);
        toast.success('FAQ created successfully');
      }

      resetForm();
      fetchFAQs();
    } catch (error: any) {
      console.error('Failed to save FAQ:', error);
      const errorMessage = error?.response?.data?.message;
      if (Array.isArray(errorMessage)) {
        errorMessage.forEach((msg: string) => toast.error(msg));
      } else if (typeof errorMessage === 'string') {
        toast.error(errorMessage);
      } else {
        toast.error('Failed to save FAQ');
      }
    }
  };

  const handleEdit = (faq: FAQ) => {
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      order: faq.order,
      isActive: faq.isActive
    });
    setEditingId(faq.id);
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;

    try {
      await apiClient.delete(`/admin/faqs/${id}`);
      toast.success('FAQ deleted successfully');
      fetchFAQs();
    } catch (error) {
      console.error('Failed to delete FAQ:', error);
      toast.error('Failed to delete FAQ');
    }
  };

  const resetForm = () => {
    setFormData({
      question: '',
      answer: '',
      category: 'general',
      order: 0,
      isActive: true
    });
    setEditingId(null);
    setIsEditing(false);
  };

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[rgba(255,255,255,0.07)] border-t-[#51a2ff] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <div className="p-6 mx-auto max-w-7xl">

        {/* Header */}
        <div className="card-base p-6 mb-8">
          <div className="flex gap-4 items-center">
            <div className="p-3 rounded-xl" style={{ background: 'rgba(81,162,255,0.1)', border: '1px solid rgba(81,162,255,0.2)' }}>
              <HelpCircle className="w-8 h-8 text-[#51a2ff]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">FAQ Management</h1>
              <p className="mt-1 text-[#888]">Manage frequently asked questions for your users</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Form */}
          <div className="lg:col-span-1">
            <div className="card-base p-6 sticky top-6">
              <div className="mb-6">
                <h2 className="flex gap-2 items-center text-xl font-bold text-white">
                  {isEditing
                    ? <Edit className="w-5 h-5 text-[#51a2ff]" />
                    : <Plus className="w-5 h-5 text-[#51a2ff]" />
                  }
                  {isEditing ? 'Edit FAQ' : 'Create FAQ'}
                </h2>
                <p className="mt-1 text-sm text-[#888]">
                  {isEditing ? 'Update FAQ details' : 'Add a new FAQ'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label htmlFor="question" className="text-white text-sm font-medium">Question</label>
                    <span className={`text-xs ${formData.question.length < 5 ? 'text-red-400' : formData.question.length > 500 ? 'text-red-400' : 'text-[#555]'}`}>
                      {formData.question.length}/500 {formData.question.length < 5 && '(min 5)'}
                    </span>
                  </div>
                  <input
                    id="question"
                    value={formData.question}
                    onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                    className="input-base w-full px-4 py-2"
                    placeholder="Enter question (min 5 characters)"
                    required
                    maxLength={500}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label htmlFor="answer" className="text-white text-sm font-medium">Answer</label>
                    <span className={`text-xs ${formData.answer.length < 10 ? 'text-red-400' : 'text-[#555]'}`}>
                      {formData.answer.length} chars {formData.answer.length < 10 && '(min 10)'}
                    </span>
                  </div>
                  <textarea
                    id="answer"
                    value={formData.answer}
                    onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                    className="input-base w-full px-4 py-2 min-h-[120px]"
                    placeholder="Enter answer (min 10 characters)"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="category" className="text-white text-sm font-medium block">Category</label>
                  <AnimatedSelect
                    options={categories}
                    value={formData.category}
                    onChange={(value) => setFormData({ ...formData, category: value })}
                    placeholder="Select category"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="order" className="text-white text-sm font-medium block">Display Order</label>
                  <input
                    id="order"
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    className="input-base w-full px-4 py-2"
                  />
                </div>

                <div
                  className="flex items-center justify-between p-3 rounded-lg"
                  style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <label htmlFor="isActive" className="text-white text-sm font-medium">Active Status</label>
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2">
                    <Save className="w-4 h-4" />
                    {isEditing ? 'Update FAQ' : 'Create FAQ'}
                  </button>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="btn-ghost flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* List */}
          <div className="lg:col-span-2">
            <div className="card-base p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">All FAQs</h2>
                  <p className="text-sm text-[#888] mt-1">{faqs.length} total questions</p>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#51a2ff]" />
                  <input
                    type="text"
                    placeholder="Search FAQs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-base w-full pl-10 pr-4 py-2"
                  />
                </div>
              </div>

              {filteredFaqs.length === 0 ? (
                <div className="text-center py-12">
                  <div
                    className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
                    style={{ background: 'rgba(81,162,255,0.07)', border: '1px solid rgba(81,162,255,0.15)' }}
                  >
                    <HelpCircle className="w-10 h-10 text-[#51a2ff]" />
                  </div>
                  <p className="text-lg text-[#888] font-medium">No FAQs found</p>
                  <p className="text-sm text-[#555] mt-2">Try adjusting your search or create a new FAQ</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredFaqs.map((faq, index) => (
                    <div
                      key={faq.id}
                      className="rounded-xl p-4 lg:p-5 transition-colors hover:bg-[#161616]"
                      style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.06)', animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
                        <div className="flex-1 w-full">
                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            <span
                              className="px-2 py-0.5 text-xs font-medium rounded-full"
                              style={{ background: 'rgba(81,162,255,0.1)', border: '1px solid rgba(81,162,255,0.25)', color: '#51a2ff' }}
                            >
                              {faq.category}
                            </span>
                            <span
                              className="px-2 py-0.5 text-xs font-medium rounded-full"
                              style={faq.isActive
                                ? { background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', color: '#4ade80' }
                                : { background: 'rgba(107,114,128,0.1)', border: '1px solid rgba(107,114,128,0.25)', color: '#9ca3af' }
                              }
                            >
                              {faq.isActive ? '● Active' : '○ Inactive'}
                            </span>
                            <span
                              className="text-xs text-[#555] px-2 py-0.5 rounded"
                              style={{ background: 'rgba(255,255,255,0.04)' }}
                            >
                              Order: {faq.order}
                            </span>
                          </div>
                          <h3 className="text-white font-semibold text-base mb-2">{faq.question}</h3>
                          <p className="text-[#888] text-sm line-clamp-2 leading-relaxed">{faq.answer}</p>
                        </div>
                        <div className="flex gap-2 lg:flex-col">
                          <button
                            onClick={() => handleEdit(faq)}
                            className="p-2 rounded-lg text-[#888] hover:text-white transition-colors"
                            style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.07)' }}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(faq.id)}
                            className="px-3 py-1.5 text-sm rounded-lg font-medium text-red-400"
                            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}

export default withAdminAuth(FAQManagement);
