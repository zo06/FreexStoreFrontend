'use client';

import { useState, useEffect } from 'react';
import { X, Key, Server, Calendar, User, CheckCircle, XCircle, Loader2, Copy, RefreshCw } from 'lucide-react';
import { License, CreateLicenseRequest, safeAdminApi } from '@/lib/admin-api';
import { CreateLicenseDto } from '@/lib/types/api.types';

interface LicenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  license?: License | null;
  onSave: (license: License) => void;
  userId?: string;
  scriptId?: string;
}

export default function LicenseModal({ isOpen, onClose, license, onSave, userId, scriptId }: LicenseModalProps) {
  const [formData, setFormData] = useState({
    userId: '',
    scriptId: '',
    expiresAt: '',
    isActive: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [copied, setCopied] = useState(false);

  const isEditing = !!license;
  const isViewing = isEditing;

  useEffect(() => {
    if (license) {
      setFormData({
        userId: license.userId,
        scriptId: license.scriptId,
        expiresAt: license.expiresAt ? new Date(license.expiresAt).toISOString().split('T')[0] : '',
        isActive: license.isActive
      });
      setPrivateKey(license.privateKey || '');
    } else {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 30); // Default 30 days
      
      setFormData({
        userId: userId || '',
        scriptId: scriptId || '',
        expiresAt: tomorrow.toISOString().split('T')[0],
        isActive: true
      });
      setPrivateKey('');
    }
    setError('');
    setCopied(false);
  }, [license, isOpen, userId, scriptId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validation
      if (!formData.userId.trim()) {
        throw new Error('User ID is required');
      }
      if (!formData.scriptId.trim()) {
        throw new Error('Script ID is required');
      }
      if (!formData.expiresAt) {
        throw new Error('Expiration date is required');
      }

      const expirationDate = new Date(formData.expiresAt);
      if (expirationDate <= new Date()) {
        throw new Error('Expiration date must be in the future');
      }

      if (!isEditing) {
        // Create new license
        const createData: CreateLicenseRequest = {
          userId: formData.userId.trim(),
          scriptId: formData.scriptId.trim(),
          expiresAt: expirationDate.toISOString()
        };
        const savedLicense = await safeAdminApi.licenses.create(createData);
        onSave(savedLicense);
        onClose();
      } else if (license) {
        // Update existing license
        const updateData = {
          expiresAt: expirationDate.toISOString(),
          isActive: formData.isActive
        };
        const savedLicense = await safeAdminApi.licenses.update(license.id, updateData);
        onSave(savedLicense);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async () => {
    if (!isEditing || !license) return;
    
    setLoading(true);
    try {
      const updateData = { isActive: !license.isActive };
      const updatedLicense = await safeAdminApi.licenses.update(license.id, updateData);
      setFormData(prev => ({ ...prev, isActive: updatedLicense.isActive }));
      onSave(updatedLicense);
    } catch (err: any) {
      setError(err.message || 'Failed to toggle license status');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateKey = async () => {
    // Regenerate key functionality not available in current API
    setError('Key regeneration is not available');
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isExpired = license && license.expiresAt && new Date(license.expiresAt) <= new Date();
  const daysUntilExpiry = license && license.expiresAt 
    ? Math.ceil((new Date(license.expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  if (!isOpen) return null;

  return (
    <div className="flex fixed inset-0 z-50 justify-center items-center p-4 backdrop-blur-sm bg-black/50">
      <div className="bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-white/10">
          <div className="flex gap-3 items-center">
            <div className="flex justify-center items-center w-10 h-10 bg-gradient-to-r rounded-xl from-blue-500/20 to-cyan-500/20">
              <Key className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">
                {isEditing ? 'License Details' : 'Create New License'}
              </h2>
              {license && (
                <p className="text-sm text-gray-400">ID: {license.id}</p>
              )}
            </div>
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

          {/* License Status */}
          {isViewing && (
            <div className={`p-4 rounded-lg border ${
              formData.isActive 
                ? isExpired 
                  ? 'bg-yellow-500/10 border-yellow-500/20' 
                  : 'bg-green-500/10 border-green-500/20'
                : 'bg-red-500/10 border-red-500/20'
            }`}>
              <div className="flex gap-3 items-center">
                {formData.isActive ? (
                  isExpired ? (
                    <XCircle className="w-5 h-5 text-yellow-400" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  )
                ) : (
                  <XCircle className="w-5 h-5 text-red-400" />
                )}
                <div>
                  <p className={`font-medium ${
                    formData.isActive 
                      ? isExpired 
                        ? 'text-yellow-400' 
                        : 'text-green-400'
                      : 'text-red-400'
                  }`}>
                    {formData.isActive 
                      ? isExpired 
                        ? 'Expired' 
                        : 'Active'
                      : 'Inactive'
                    }
                  </p>
                  <p className="text-sm text-gray-400">
                    {formData.isActive 
                      ? isExpired 
                        ? 'License has expired' 
                        : daysUntilExpiry !== null 
                          ? `Expires in ${daysUntilExpiry} days`
                          : 'License is active'
                      : 'License is disabled'
                    }
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* User and Script IDs */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">
                User ID
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 w-4 h-4 text-gray-400 transform -translate-y-1/2" />
                <input
                  type="text"
                  value={formData.userId}
                  onChange={(e) => setFormData(prev => ({ ...prev, userId: e.target.value }))}
                  className="py-3 pr-4 pl-10 w-full placeholder-gray-400 text-white rounded-lg border bg-white/5 border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                  placeholder="Enter user ID"
                  disabled={isEditing}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">
                Script ID
              </label>
              <input
                type="text"
                value={formData.scriptId}
                onChange={(e) => setFormData(prev => ({ ...prev, scriptId: e.target.value }))}
                className="px-4 py-3 w-full placeholder-gray-400 text-white rounded-lg border bg-white/5 border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                placeholder="Enter script ID"
                disabled={isEditing}
                required
              />
            </div>
          </div>

          {/* Expiration Date */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">
              Expiration Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 w-4 h-4 text-gray-400 transform -translate-y-1/2" />
              <input
                type="date"
                value={formData.expiresAt}
                onChange={(e) => setFormData(prev => ({ ...prev, expiresAt: e.target.value }))}
                className="py-3 pr-4 pl-10 w-full text-white rounded-lg border bg-white/5 border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                required
              />
            </div>
            {formData.expiresAt && (
              <p className="mt-1 text-xs text-gray-400">
                Expires: {formatDate(formData.expiresAt + 'T23:59:59')}
              </p>
            )}
          </div>

          {/* Private Key (View Only) */}
          {isViewing && privateKey && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-300">
                  Private Key
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => copyToClipboard(privateKey)}
                    className="flex gap-1 items-center px-2 py-1 text-xs text-gray-300 rounded transition-colors bg-white/5 hover:bg-white/10"
                  >
                    <Copy className="w-3 h-3" />
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                  <button
                    type="button"
                    onClick={handleRegenerateKey}
                    disabled={loading}
                    className="flex gap-1 items-center px-2 py-1 text-xs text-blue-400 rounded transition-colors bg-blue-500/20 hover:bg-blue-500/30 disabled:opacity-50"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Regenerate
                  </button>
                </div>
              </div>
              <div className="p-3 rounded-lg border bg-black/20 border-white/10">
                <code className="font-mono text-sm text-green-400 break-all">
                  {privateKey}
                </code>
              </div>
              <p className="mt-1 text-xs text-gray-400">
                This key is used for license validation
              </p>
            </div>
          )}

          {/* Active Status */}
          <div className="flex justify-between items-center p-4 rounded-lg border bg-white/5 border-white/10">
            <div>
              <p className="font-medium text-white">
                {formData.isActive ? 'Active' : 'Inactive'}
              </p>
              <p className="text-sm text-gray-400">
                {formData.isActive 
                  ? 'License can be used for validation' 
                  : 'License is disabled and cannot be used'
                }
              </p>
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
                className="w-4 h-4 text-blue-500 rounded border bg-white/5 border-white/10 focus:ring-blue-500/50"
              />
            </div>
          </div>

          {/* License Info (if editing) */}
          {isEditing && license && (
            <div className="p-4 rounded-lg border bg-white/5 border-white/10">
              <h4 className="mb-3 font-medium text-white">License Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Created</p>
                  <p className="text-white">{formatDate(license.createdAt)}</p>
                </div>
                <div>
                  <p className="text-gray-400">Last Updated</p>
                  <p className="text-white">{formatDate(license.updatedAt)}</p>
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
              {isViewing ? 'Close' : 'Cancel'}
            </button>
            {!isViewing && (
              <button
                type="submit"
                disabled={loading}
                className="flex flex-1 gap-2 justify-center items-center px-4 py-3 font-medium text-white bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg transition-all duration-300 hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Key className="w-4 h-4" />
                )}
                Create License
              </button>
            )}
            {isViewing && (
              <button
                type="submit"
                disabled={loading}
                className="flex flex-1 gap-2 justify-center items-center px-4 py-3 font-medium text-white bg-gradient-to-r from-green-500 to-blue-500 rounded-lg transition-all duration-300 hover:from-green-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Key className="w-4 h-4" />
                )}
                Update License
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
