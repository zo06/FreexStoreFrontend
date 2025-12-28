'use client';

import { useState, useEffect } from 'react';
import { withAdminAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
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
    } catch (error) {
      console.error('Failed to save FAQ:', error);
      toast.error('Failed to save FAQ');
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

  return (
    <main className="overflow-hidden relative min-h-screen bg-gradient-to-br via-cyan-900 from-slate-900 to-slate-900">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM5QzkyQUMiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIxLjUiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r via-transparent blur-3xl from-cyan-500/10 to-blue-500/10"></div>
      
      <div className="relative z-10 p-6 mx-auto max-w-7xl">
        {/* Header */}
        <div className="p-6 mb-8 rounded-2xl border shadow-2xl backdrop-blur-xl bg-white/5 border-white/10">
          <div className="flex gap-4 items-center">
            <div className="p-3 bg-gradient-to-r from-purple-600 to-pink-500 rounded-xl shadow-lg">
              <HelpCircle className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300">FAQ Management</h1>
              <p className="mt-1 text-gray-400">Manage frequently asked questions for your users</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-1">
            <div className="p-6 rounded-2xl border shadow-2xl backdrop-blur-xl bg-white/5 border-white/10 sticky top-6">
              <div className="mb-6">
                <h2 className="flex gap-2 items-center text-xl font-bold text-white">
                  {isEditing ? <Edit className="w-5 h-5 text-cyan-400" /> : <Plus className="w-5 h-5 text-cyan-400" />}
                  {isEditing ? 'Edit FAQ' : 'Create FAQ'}
                </h2>
                <p className="mt-1 text-sm text-gray-400">
                  {isEditing ? 'Update FAQ details' : 'Add a new FAQ'}
                </p>
              </div>
              <div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="question" className="text-white font-medium">Question</Label>
                    <Input
                      id="question"
                      value={formData.question}
                      onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                      placeholder="Enter question"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="answer" className="text-white font-medium">Answer</Label>
                    <Textarea
                      id="answer"
                      value={formData.answer}
                      onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 min-h-[120px] focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                      placeholder="Enter answer"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-white font-medium">Category</Label>
                    <AnimatedSelect
                      options={categories}
                      value={formData.category}
                      onChange={(value) => setFormData({ ...formData, category: value })}
                      placeholder="Select category"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="order" className="text-white font-medium">Display Order</Label>
                    <Input
                      id="order"
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                      className="bg-white/10 border-white/20 text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                    <Label htmlFor="isActive" className="text-white font-medium">Active Status</Label>
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button type="submit" className="flex-1 text-white bg-gradient-to-r from-purple-600 to-pink-600 border shadow-lg backdrop-blur-sm transition-all duration-300 hover:from-purple-500 hover:to-pink-500 border-white/10 hover:shadow-xl hover:scale-105">
                      <Save className="w-4 h-4 mr-2" />
                      {isEditing ? 'Update FAQ' : 'Create FAQ'}
                    </Button>
                    {isEditing && (
                      <Button type="button" onClick={resetForm} className="text-white bg-gradient-to-r border shadow-lg backdrop-blur-sm transition-all duration-300 from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 border-white/10 hover:shadow-xl hover:scale-105">
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* List */}
          <div className="lg:col-span-2">
            <div className="p-6 rounded-2xl border shadow-2xl backdrop-blur-xl bg-white/5 border-white/10">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">All FAQs</h2>
                  <p className="text-sm text-gray-400 mt-1">{faqs.length} total questions</p>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
                  <Input
                    type="text"
                    placeholder="Search FAQs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                  />
                </div>
              </div>
              <div>
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="w-12 h-12 rounded-full border-4 animate-spin border-purple-500/30 border-t-purple-500"></div>
                  </div>
                ) : filteredFaqs.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="p-4 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                      <HelpCircle className="w-10 h-10 text-purple-400" />
                    </div>
                    <p className="text-lg text-gray-300 font-medium">No FAQs found</p>
                    <p className="text-sm text-gray-500 mt-2">Try adjusting your search or create a new FAQ</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredFaqs.map((faq, index) => (
                      <div
                        key={faq.id}
                        className="p-4 lg:p-6 rounded-xl border border-white/10 bg-slate-800/30 hover:bg-slate-800/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
                          <div className="flex-1 w-full">
                            <div className="flex flex-wrap items-center gap-2 mb-3">
                              <Badge className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border-cyan-500/30 text-xs font-medium">
                                {faq.category}
                              </Badge>
                              <Badge className={`text-xs font-medium ${faq.isActive ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>
                                {faq.isActive ? '● Active' : '○ Inactive'}
                              </Badge>
                              <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded">Order: {faq.order}</span>
                            </div>
                            <h3 className="text-white font-semibold text-lg mb-2">{faq.question}</h3>
                            <p className="text-gray-400 text-sm line-clamp-2 leading-relaxed">{faq.answer}</p>
                          </div>
                          <div className="flex gap-2 lg:flex-col">
                            <Button
                              size="sm"
                              onClick={() => handleEdit(faq)}
                              className="text-white bg-gradient-to-r from-blue-600 to-cyan-600 border shadow-lg backdrop-blur-sm transition-all duration-300 hover:from-blue-500 hover:to-cyan-500 border-white/10 hover:shadow-xl hover:scale-105"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleDelete(faq.id)}
                              className="text-white bg-gradient-to-r from-red-600 to-pink-600 border shadow-lg backdrop-blur-sm transition-all duration-300 hover:from-red-500 hover:to-pink-500 border-white/10 hover:shadow-xl hover:scale-105"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
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
      </div>
    </main>
  );
}

export default withAdminAuth(FAQManagement);
