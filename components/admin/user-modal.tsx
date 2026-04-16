'use client';
import { useState, useEffect } from 'react';
import { X, User, Shield, Save, Loader2 } from 'lucide-react';
import { User as UserType, UpdateUserRequest, safeAdminApi } from '@/lib/admin-api';
import { UpdateUserDto } from '@/lib/types/api.types';
import { useAuth } from '@/lib/auth-context';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: UserType | null;
  onUserSaved?: () => void;
}

export default function UserModal({ isOpen, onClose, user, onUserSaved }: UserModalProps) {
  const { user: currentUser, refreshUserData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    isAdmin: false
  });


  const isEditing = !!user;

  useEffect(() => {

    if (user) {
      setFormData({
        isAdmin: user.isAdmin
      });
    } else {
      setFormData({
        isAdmin: false
      });
    }
    setError(null);
  }, [user, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isEditing && user) {
        // Update existing user
        const updateData: UpdateUserDto = {
          isAdmin: formData.isAdmin
        };
        await safeAdminApi.users.update(user.id, updateData);

        // If the updated user is the current logged-in user, refresh their data
        if (currentUser && currentUser.id === user.id) {
          await refreshUserData();
        }
      } else {
        // Create new user - this functionality is now limited without email/password
        throw new Error('User creation requires Discord authentication');
      }

      onUserSaved?.();
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAdmin = async () => {
    if (!isEditing || !user) return;

    try {
      setLoading(true);
      const updatedUser = await safeAdminApi.users.toggleAdmin(user.id);
      setFormData(prev => ({ ...prev, isAdmin: updatedUser.isAdmin }));

      // If the toggled user is the current logged-in user, refresh their data
      if (currentUser && currentUser.id === user.id) {
        await refreshUserData();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to toggle admin status');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div className="rounded-2xl w-full max-w-md" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)' }}>
        {/* Header */}
        <div className="flex justify-between items-center p-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex gap-3 items-center">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(81,162,255,0.1)', border: '1px solid rgba(81,162,255,0.2)' }}>
              <User className="w-5 h-5 text-[#51a2ff]" />
            </div>
            <h2 className="text-xl font-semibold text-white">
              {isEditing ? 'Edit User' : 'Add New User'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#555] hover:text-white transition-colors"
            style={{ background: '#1a1a1a' }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg border bg-red-500/10 border-red-500/20">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}



          {/* Admin Status */}
          <div className="p-4 rounded-xl flex items-center justify-between" style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex gap-3 items-center">
              <Shield className="w-5 h-5 text-[#51a2ff]" />
              <div>
                <p className="font-medium text-white">Admin Access</p>
                <p className="text-sm text-[#555]">Grant administrative privileges</p>
              </div>
            </div>
            <div className="flex gap-2 items-center">
              {isEditing && (
                <button
                  type="button"
                  onClick={handleToggleAdmin}
                  disabled={loading}
                  className="px-3 py-1 text-xs rounded-lg font-medium text-[#51a2ff] transition-colors"
                  style={{ background: 'rgba(81,162,255,0.08)', border: '1px solid rgba(81,162,255,0.2)' }}
                >
                  Toggle
                </button>
              )}
              <input
                type="checkbox"
                checked={formData.isAdmin}
                onChange={(e) => setFormData(prev => ({ ...prev, isAdmin: e.target.checked }))}
                className="w-4 h-4 rounded border accent-[#51a2ff]"
                style={{ borderColor: 'rgba(255,255,255,0.2)' }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isEditing ? 'Update User' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

