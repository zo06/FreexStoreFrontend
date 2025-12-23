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
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="p-8 rounded-2xl border shadow-2xl backdrop-blur-xl bg-white/5 border-white/10">
          <div className="mx-auto mb-4 w-12 h-12 rounded-full border-b-2 border-white animate-spin"></div>
          <p className="text-center text-white">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="overflow-hidden relative min-h-screen bg-gradient-to-br via-cyan-900 from-slate-900 to-slate-900">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM5QzkyQUMiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIxLjUiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r via-transparent blur-3xl from-cyan-500/10 to-blue-500/10"></div>
      
      <div className="relative z-10 p-6 mx-auto space-y-6 max-w-7xl">
        {/* Header */}
        <div className="p-6 rounded-2xl border shadow-2xl backdrop-blur-xl bg-white/5 border-white/10">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-cyan-600 to-cyan-500 rounded-xl shadow-lg">
                <Folder className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Category Management</h1>
                <p className="mt-1 text-gray-400">Organize and manage script categories</p>
              </div>
            </div>
            <button
              onClick={() => {
                setSuccessMessage('');
                setErrorMessage('');
                setShowCreateForm(true);
              }}
              className="flex items-center px-6 py-3 space-x-2 text-white bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl border shadow-lg backdrop-blur-sm transition-all duration-300 hover:from-blue-500 hover:to-blue-400 border-white/10 hover:shadow-xl hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              <span>Add Category</span>
            </button>
          </div>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="p-4 rounded-xl border bg-green-500/10 border-green-500/20">
            <p className="text-green-400 text-sm font-medium">{successMessage}</p>
          </div>
        )}
        
        {errorMessage && (
          <div className="p-4 rounded-xl border bg-red-500/10 border-red-500/20">
            <p className="text-red-400 text-sm font-medium">{errorMessage}</p>
          </div>
        )}

      {/* Create/Edit Form */}
        {showCreateForm && (
          <div className="p-6 rounded-2xl border shadow-2xl backdrop-blur-xl bg-white/5 border-white/10">
            <h2 className="mb-6 text-xl font-semibold text-white">
              {editingCategory ? 'Edit Category' : 'Create New Category'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-300">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="px-4 py-3 w-full placeholder-gray-400 text-white rounded-xl border transition-all duration-300 bg-slate-800/50 border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-300">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="px-4 py-3 w-full h-24 placeholder-gray-400 text-white rounded-xl border transition-all duration-300 resize-none bg-slate-800/50 border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>
              
              <div>
                <label htmlFor="icon" className="block mb-2 text-sm font-medium text-gray-300">
                  Icon
                </label>
                <button
                  type="button"
                  onClick={() => setShowIconPicker(true)}
                  className="px-4 py-3 w-full text-left placeholder-gray-400 text-white rounded-xl border transition-all duration-300 bg-slate-800/50 border-white/10 hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {formData.icon ? (
                    <span className="flex items-center gap-2">
                      <img 
                        src={formData.icon.startsWith('/') ? `${process.env.NEXT_PUBLIC_BACKEND_URL}${formData.icon}` : formData.icon} 
                        alt="Custom icon" 
                        className="w-6 h-6 object-contain" 
                      />
                      <span className="text-gray-400">Click to change icon</span>
                    </span>
                  ) : (
                    <span className="text-gray-400">Click to upload an icon</span>
                  )}
                </button>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="mr-3 w-4 h-4 text-blue-600 rounded bg-slate-800 border-white/10 focus:ring-blue-500 focus:ring-2"
                />
                <label htmlFor="isActive" className="text-sm text-gray-300">
                  Active
                </label>
              </div>
              
              <div className="flex gap-3">
                <button 
                  type="submit" 
                  className="px-6 py-3 text-white bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl border shadow-lg backdrop-blur-sm transition-all duration-300 hover:from-blue-500 hover:to-blue-400 border-white/10 hover:shadow-xl hover:scale-105"
                >
                  {editingCategory ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 text-white bg-gradient-to-r rounded-xl border shadow-lg backdrop-blur-sm transition-all duration-300 from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 border-white/10 hover:shadow-xl hover:scale-105"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

      {error && (
          <div className="p-6 text-center rounded-2xl border shadow-2xl backdrop-blur-xl bg-red-500/10 border-red-500/20">
            <div className="mb-4 text-red-400">Error loading categories: {error}</div>
            <button 
              onClick={() => getAll()} 
              className="px-6 py-3 text-white bg-gradient-to-r from-red-600 to-red-500 rounded-xl border shadow-lg backdrop-blur-sm transition-all duration-300 hover:from-red-500 hover:to-red-400 border-white/10 hover:shadow-xl hover:scale-105"
            >
              Retry
            </button>
          </div>
        )}

        {categories && (
          <div className="p-6 rounded-2xl border shadow-2xl backdrop-blur-xl bg-white/5 border-white/10">
            <h2 className="mb-6 text-xl font-semibold text-white">Categories</h2>
            {categories.length === 0 ? (
              <div className="py-12 text-center">
                <Folder className="mx-auto mb-4 w-16 h-16 text-gray-500" />
                <div className="text-lg text-gray-400">No categories found</div>
                <p className="mt-2 text-gray-500">Create your first category to get started</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {categories?.map((category: Category) => (
                  <div key={category.id} className="p-4 rounded-xl border shadow-lg backdrop-blur-xl transition-all duration-300 bg-white/5 border-white/10 hover:bg-white/10">
                    <div className="flex justify-between items-center">
                      <div className="flex gap-4 items-center">
                        <div className="p-3 bg-gradient-to-r rounded-xl border from-cyan-600/20 to-cyan-500/20 border-cyan-500/20">
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
                            <p className="mt-1 text-sm text-gray-400">
                              {category.description}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2 items-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          category.isActive 
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}>
                          {category.isActive ? 'Active' : 'Inactive'}
                        </span>
                        
                        <button
                          onClick={() => handleEdit(category)}
                          className="p-2 text-white bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg border shadow-lg backdrop-blur-sm transition-all duration-300 hover:from-blue-500 hover:to-blue-400 border-white/10 hover:shadow-xl hover:scale-105"
                          title="Edit Category"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => handleToggleActive(category.id)}
                          className={`border border-white/10 backdrop-blur-sm text-white p-2 rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 ${
                            category.isActive 
                              ? 'bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400'
                              : 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400'
                          }`}
                          title={category.isActive ? 'Deactivate' : 'Activate'}
                        >
                          <Power className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => handleDelete(category.id)}
                          className="p-2 text-white bg-gradient-to-r from-red-600 to-red-500 rounded-lg border shadow-lg backdrop-blur-sm transition-all duration-300 hover:from-red-500 hover:to-red-400 border-white/10 hover:shadow-xl hover:scale-105"
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
          </div>)}
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
