'use client';
import { useState, useEffect } from 'react';
import { X, FileText, DollarSign, Tag, Save, Loader2, ToggleLeft, ToggleRight } from 'lucide-react';
import { Script, CreateScriptRequest, UpdateScriptRequest, safeAdminApi } from '@/lib/admin-api';

interface ScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  script?: Script | null;
  onSave: (script: Script) => void;
}

interface Category {
  id: string;
  name: string;
  isActive: boolean;
}

export default function ScriptModal({ isOpen, onClose, script, onSave }: ScriptModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: 0,
    isActive: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const isEditing = !!script;

  // Load categories from API
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setCategoriesLoading(true);
        const response = await safeAdminApi.categories.getActive();
        setCategories(response || []);
      } catch (error) {
        console.error('Failed to load categories:', error);
        setCategories([]);
      } finally {
        setCategoriesLoading(false);
      }
    };

    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  useEffect(() => {
    if (script) {
      setFormData({
        name: script.name,
        description: script.description || '',
        category: typeof script.category === 'string' ? script.category : script.category?.id || script.category?.name || '',
        price: script.price,
        isActive: script.isActive
      });
    } else {
      setFormData({
        name: '',
        description: '',
        category: '',
        price: 0,
        isActive: true
      });
    }
    setError('');
  }, [script, isOpen, categories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validation
      if (!formData.name.trim()) {
        throw new Error('Script name is required');
      }
      if (!formData.description.trim()) {
        throw new Error('Description is required');
      }
      if (!formData.category) {
        throw new Error('Category is required');
      }
      if (formData.price < 0) {
        throw new Error('Price cannot be negative');
      }

      let savedScript: Script;

      if (isEditing && script) {
        // Update existing script
        const updateData: UpdateScriptRequest = {
          name: formData.name.trim(),
          description: formData.description.trim(),
          category: formData.category,
          price: formData.price,
          isActive: formData.isActive
        };
        savedScript = await safeAdminApi.scripts.update(script.id, updateData);
      } else {
        // Create new script
        const createData: CreateScriptRequest = {
          name: formData.name.trim(),
          description: formData.description.trim(),
          category: formData.category,
          price: formData.price,
          isActive: formData.isActive
        };
        savedScript = await safeAdminApi.scripts.create(createData);
      }

      onSave(savedScript);
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async () => {
    if (!isEditing || !script) return;
    
    setLoading(true);
    try {
      const updatedScript = await safeAdminApi.scripts.toggleActive(script.id);
      setFormData(prev => ({ ...prev, isActive: updatedScript.isActive }));
      onSave(updatedScript);
    } catch (err: any) {
      setError(err.message || 'Failed to toggle script status');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (!isOpen) return null;

  return (
    <div className="flex fixed inset-0 z-50 justify-center items-center p-4 backdrop-blur-sm bg-black/50">
      <div className="bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-white/10">
          <div className="flex gap-3 items-center">
            <div className="flex justify-center items-center w-10 h-10 bg-gradient-to-r rounded-xl from-green-500/20 to-blue-500/20">
              <FileText className="w-5 h-5 text-green-400" />
            </div>
            <h2 className="text-xl font-semibold text-white">
              {isEditing ? 'Edit Script' : 'Add New Script'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="flex justify-center items-center w-8 h-8 rounded-lg transition-colors bg-white/5 hover:bg-white/10"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 rounded-lg border bg-red-500/10 border-red-500/20">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Script Name */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">
              Script Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="px-4 py-3 w-full placeholder-gray-400 text-white rounded-lg border bg-white/5 border-white/10 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50"
              placeholder="Enter script name"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="px-4 py-3 w-full placeholder-gray-400 text-white rounded-lg border resize-none bg-white/5 border-white/10 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50"
              placeholder="Describe what this script does..."
              required
            />
          </div>

          {/* Category and Price Row */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Category */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">
                Category
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 w-4 h-4 text-gray-400 transform -translate-y-1/2" />
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="py-3 pr-4 pl-10 w-full text-white rounded-lg border appearance-none bg-white/5 border-white/10 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50"
                  required
                  disabled={categoriesLoading}
                >
                  {categoriesLoading ? (
                    <option value="" className="bg-gray-800">
                      Loading categories...
                    </option>
                  ) : categories.length === 0 ? (
                    <option value="" className="bg-gray-800">
                      No categories available
                    </option>
                  ) : (
                    <option value="" className="bg-gray-800">
                      Select a category
                    </option>
                  )}
                  {categories.map(category => (
                    <option key={category.id} value={category.id} className="bg-gray-800">
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Price */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">
                Price
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 w-4 h-4 text-gray-400 transform -translate-y-1/2" />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                  className="py-3 pr-4 pl-10 w-full placeholder-gray-400 text-white rounded-lg border bg-white/5 border-white/10 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50"
                  placeholder="0.00"
                  required
                />
              </div>
              {formData.price > 0 && (
                <p className="mt-1 text-xs text-gray-400">
                  Formatted: {formatCurrency(formData.price)}
                </p>
              )}
            </div>
          </div>

          {/* Active Status */}
          <div className="flex justify-between items-center p-4 rounded-lg border bg-white/5 border-white/10">
            <div className="flex gap-3 items-center">
              {formData.isActive ? (
                <ToggleRight className="w-6 h-6 text-green-400" />
              ) : (
                <ToggleLeft className="w-6 h-6 text-gray-400" />
              )}
              <div>
                <p className="font-medium text-white">
                  {formData.isActive ? 'Active' : 'Inactive'}
                </p>
                <p className="text-sm text-gray-400">
                  {formData.isActive 
                    ? 'Script is available for purchase' 
                    : 'Script is hidden from users'
                  }
                </p>
              </div>
            </div>
            <div className="flex gap-2 items-center">
              {isEditing && (
                <button
                  type="button"
                  onClick={handleToggleActive}
                  disabled={loading}
                  className="px-3 py-1 text-sm btn-secondary"
                >
                  Toggle
                </button>
              )}
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="w-4 h-4 text-green-500 rounded border bg-white/5 border-white/10 focus:ring-green-500/50"
              />
            </div>
          </div>

          {/* Script Info (if editing) */}
          {isEditing && script && (
            <div className="p-4 rounded-lg border bg-white/5 border-white/10">
              <h4 className="mb-3 font-medium text-white">Script Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Created</p>
                  <p className="text-white">{new Date(script.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-gray-400">Last Updated</p>
                  <p className="text-white">{new Date(script.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 font-medium text-gray-300 rounded-lg border transition-colors bg-white/5 hover:bg-white/10 border-white/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex flex-1 gap-2 justify-center items-center px-4 py-3 font-medium text-white bg-gradient-to-r from-green-500 to-blue-500 rounded-lg transition-all duration-300 hover:from-green-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isEditing ? 'Update Script' : 'Create Script'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

