'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import toast from 'react-hot-toast';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ChangePassword() {
  const router = useRouter();
  const { changePassword } = useAuth();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (formData.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters long');
      return;
    }
    setIsLoading(true);
    try {
      await changePassword({ currentPassword: formData.currentPassword, newPassword: formData.newPassword });
      toast.success('Password changed successfully');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="card-base w-full max-w-md p-8 space-y-6">
        <div>
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-[#888] hover:text-white transition-colors text-sm mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-white mb-1">Change Password</h1>
          <p className="text-[#888] text-sm">Update your account password</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {(['current', 'new', 'confirm'] as const).map((field) => {
            const labels = { current: 'Current Password', new: 'New Password', confirm: 'Confirm New Password' };
            const keys = { current: 'currentPassword', new: 'newPassword', confirm: 'confirmPassword' } as const;
            return (
              <div key={field} className="space-y-1.5">
                <label htmlFor={field} className="text-sm font-medium text-[#ccc]">{labels[field]}</label>
                <div className="relative">
                  <input
                    id={field}
                    type={showPasswords[field] ? 'text' : 'password'}
                    value={formData[keys[field]]}
                    onChange={(e) => setFormData(prev => ({ ...prev, [keys[field]]: e.target.value }))}
                    className="input-base w-full pr-11"
                    required
                    minLength={field !== 'current' ? 8 : undefined}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555] hover:text-[#888] transition-colors"
                    onClick={() => togglePasswordVisibility(field)}
                  >
                    {showPasswords[field] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            );
          })}

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Changing Password...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
