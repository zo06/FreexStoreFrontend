'use client';

import { useState, useEffect } from 'react';
import { useCategoriesStore, Category } from '@/lib/stores';
import { ArrowLeft, Plus, Edit, Power, Trash2, Folder } from 'lucide-react';
import IconPicker from '@/components/admin/IconPicker';

export default function AdminCategoriesPage() {
  // Use Zustand store
  const {
    items: categories,
    loading,
    error,
    submitting,
    getAll,
    create,
    update,
    remove,
    patch,
    clearError
  } = useCategoriesStore();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '',
    isActive: true
  });
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Load categories on mount
  useEffect(() => {
    getAll().catch(() => {});
  }, [getAll]);

  // Auto-clear success messages after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    try {
      if (editingCategory) {
        const updateData = {
          name: formData.name,
          description: formData.description,
          isActive: formData.isActive
        };
        await update(editingCategory.id, updateData);
        setSuccessMessage('Category updated successfully!');
      } else {
        const createData = {
          name: formData.name,
          description: formData.description,
          isActive: formData.isActive
        };
        await create(createData);
        setSuccessMessage('Category created successfully!');
      }
      setFormData({ name: '', description: '', icon: '', isActive: true });
      setShowCreateForm(false);
      setEditingCategory(null);
    } catch (error) {
      console.error('Error saving category:', error);
      setErrorMessage('Failed to save category. Please try again.');
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      icon: category.icon || '',
      isActive: category.isActive
    });
    setSuccessMessage('');
    setErrorMessage('');
    setShowCreateForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      setErrorMessage('');
      setSuccessMessage('');
      try {
        await remove(id);
        setSuccessMessage('Category deleted successfully!');
      } catch (error: any) {
        console.error('Error deleting category:', error);
        setErrorMessage('Failed to delete category. Please try again.');
      }
    }
  };

  const isDataUrl = (str: string) => {
    return typeof str === 'string' && str.startsWith('data:');
  };

  const handleToggleActive = async (id: string) => {
    try {
      await patch(id, {});
      await getAll();
    } catch (error) {
      console.error('Error toggling category status:', error);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', icon: '', isActive: true });
    setShowCreateForm(false);
    setEditingCategory(null);
    setSuccessMessage('');
    setErrorMessage('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[rgba(255,255,255,0.07)] border-t-[#51a2ff] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <div className="p-6 mx-auto space-y-6 max-w-7xl">

        {/* Header */}
        <div className="card-base p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl" style={{ background: 'rgba(81,162,255,0.1)', border: '1px solid rgba(81,162,255,0.2)' }}>
                <Folder className="w-8 h-8 text-[#51a2ff]" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Category Management</h1>
                <p className="mt-1 text-[#888]">Organize and manage script categories</p>
              </div>
            </div>
            <button
              onClick={() => {
                setSuccessMessage('');
                setErrorMessage('');
                setShowCreateForm(true);
              }}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              <span>Add Category</span>
            </button>
          </div>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="p-4 rounded-xl" style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)' }}>
            <p className="text-emerald-400 text-sm font-medium">{successMessage}</p>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 rounded-xl" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <p className="text-red-400 text-sm font-medium">{errorMessage}</p>
          </div>
        )}

        {/* Create/Edit Form */}
        {showCreateForm && (
          <div className="card-base p-6">
            <h2 className="mb-6 text-xl font-semibold text-white">
              {editingCategory ? 'Edit Category' : 'Create New Category'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block mb-2 text-sm font-medium text-[#aaa]">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-base w-full"
                  required
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-[#aaa]">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-base w-full h-24 resize-none"
                  rows={3}
                />
              </div>

              <div>
                <label htmlFor="icon" className="block mb-2 text-sm font-medium text-[#aaa]">
                  Icon
                </label>
                <button
                  type="button"
                  onClick={() => setShowIconPicker(true)}
                  className="input-base w-full text-start hover:border-[rgba(255,255,255,0.15)] transition-colors"
                >
                  {formData.icon ? (
                    <span className="flex items-center gap-2">
                      <img
                        src={formData.icon.startsWith('/') ? `${process.env.NEXT_PUBLIC_BACKEND_URL}${formData.icon}` : formData.icon}
                        alt="Custom icon"
                        className="w-6 h-6 object-contain"
                      />
                      <span className="text-[#888]">Click to change icon</span>
                    </span>
                  ) : (
                    <span className="text-[#888]">Click to upload an icon</span>
                  )}
                </button>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded accent-[#51a2ff]"
                />
                <label htmlFor="isActive" className="text-sm text-[#aaa]">
                  Active
                </label>
              </div>

              <div className="flex gap-3">
                <button type="submit" className="btn-primary flex items-center gap-2">
                  {editingCategory ? 'Update' : 'Create'}
                </button>
                <button type="button" onClick={resetForm} className="btn-ghost flex items-center gap-2">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {error && (
          <div className="card-base p-6 text-center" style={{ borderColor: 'rgba(239,68,68,0.2)' }}>
            <div className="mb-4 text-red-400">Error loading categories: {error}</div>
            <button onClick={() => getAll()} className="btn-primary">
              Retry
            </button>
          </div>
        )}

        {categories && (
          <div className="card-base p-6">
            <h2 className="mb-6 text-xl font-semibold text-white">Categories</h2>
            {categories.length === 0 ? (
              <div className="py-12 text-center">
                <Folder className="mx-auto mb-4 w-16 h-16 text-[#333]" />
                <div className="text-lg text-[#888]">No categories found</div>
                <p className="mt-2 text-[#555]">Create your first category to get started</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {categories?.map((category: Category) => (
                  <div
                    key={category.id}
                    className="p-4 rounded-xl transition-colors"
                    style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#161616')}
                    onMouseLeave={e => (e.currentTarget.style.background = '#111')}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex gap-4 items-center">
                        <div
                          className="p-3 rounded-xl"
                          style={{ background: 'rgba(81,162,255,0.08)', border: '1px solid rgba(81,162,255,0.15)' }}
                        >
                          {category.icon ? (
                            <img
                              src={category.icon.startsWith('/') ? `${process.env.NEXT_PUBLIC_BACKEND_URL}${category.icon}` : category.icon}
                              alt="Category icon"
                              className="w-6 h-6 object-contain"
                            />
                          ) : (
                            <span className="text-2xl">📁</span>
                          )}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">
                            {category.name}
                          </h3>
                          {category.description && (
                            <p className="mt-1 text-sm text-[#888]">
                              {category.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 items-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          category.isActive
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}>
                          {category.isActive ? 'Active' : 'Inactive'}
                        </span>

                        <button
                          onClick={() => handleEdit(category)}
                          className="p-2 rounded-lg text-[#888] hover:text-[#51a2ff] transition-colors"
                          style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.07)' }}
                          title="Edit Category"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleToggleActive(category.id)}
                          className="p-2 rounded-lg transition-colors"
                          style={category.isActive
                            ? { background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)', color: '#fb923c' }
                            : { background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)', color: '#34d399' }
                          }
                          title={category.isActive ? 'Deactivate' : 'Activate'}
                        >
                          <Power className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(category.id)}
                          className="px-3 py-1.5 text-sm rounded-lg font-medium text-red-400"
                          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
                          title="Delete Category"
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
        )}
      </div>

      {showIconPicker && (
        <IconPicker
          selectedIcon={formData.icon}
          onIconSelect={(iconName) => {
            setFormData({ ...formData, icon: iconName });
            setShowIconPicker(false);
          }}
          onClose={() => setShowIconPicker(false)}
          categoryId={editingCategory?.id}
        />
      )}
    </main>
  );
}
