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
    <div className="flex fixed inset-0 z-50 justify-center items-center p-4 backdrop-blur-sm bg-black/50">
      <div className="w-full max-w-md rounded-2xl border backdrop-blur-xl bg-gray-900/95 border-white/10">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-white/10">
          <div className="flex gap-3 items-center">
            <div className="flex justify-center items-center w-10 h-10 bg-gradient-to-r rounded-xl from-blue-500/20 to-cyan-500/20">
              <User className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="text-xl font-semibold text-white">
              {isEditing ? 'Edit User' : 'Add New User'}
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg border bg-red-500/10 border-red-500/20">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}



          {/* Admin Status */}
          <div className="flex justify-between items-center p-4 rounded-lg border bg-white/5 border-white/10">
            <div className="flex gap-3 items-center">
              <Shield className="w-5 h-5 text-cyan-400" />
              <div>
                <p className="font-medium text-white">Admin Access</p>
                <p className="text-sm text-gray-400">Grant administrative privileges</p>
              </div>
            </div>
            <div className="flex gap-2 items-center">
              {isEditing && (
                <button
                  type="button"
                  onClick={handleToggleAdmin}
                  disabled={loading}
                  className="px-3 py-1 text-sm btn-secondary"
                >
                  Toggle
                </button>
              )}
              <input
                type="checkbox"
                checked={formData.isAdmin}
                onChange={(e) => setFormData(prev => ({ ...prev, isAdmin: e.target.checked }))}
                className="w-4 h-4 text-cyan-500 rounded border bg-white/5 border-white/10 focus:ring-cyan-500/50"
              />
            </div>
          </div>

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
              className="flex flex-1 gap-2 justify-center items-center px-4 py-3 font-medium text-white bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg transition-all duration-300 hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed"
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

