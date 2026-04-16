'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { Eye, EyeOff, ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import apiClient from '@/lib/api';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({ newPassword: '', confirmPassword: '' });
  const [showPasswords, setShowPasswords] = useState({ new: false, confirm: false });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const resetToken = searchParams.get('token');
    if (!resetToken) {
      toast.error('Invalid reset link');
      router.push('/auth/forgot-password');
      return;
    }
    setToken(resetToken);
  }, [searchParams, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) { toast.error('Invalid reset token'); return; }
    if (formData.newPassword !== formData.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (formData.newPassword.length < 8) { toast.error('Password must be at least 8 characters long'); return; }
    setIsLoading(true);
    try {
      await apiClient.resetPassword(token, formData.newPassword);
      setIsSuccess(true);
      toast.success('Password reset successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = (field: 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="card-base w-full max-w-md p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-[#1a1a1a] rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Password Reset Successful</h2>
            <p className="text-[#888] text-sm">Your password has been reset. You can now sign in with your new password.</p>
          </div>
          <Link href="/auth/login" className="btn-primary block text-center">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="card-base w-full max-w-md p-8 space-y-6">
        <div>
          <Link href="/auth/login" className="inline-flex items-center gap-2 text-[#888] hover:text-white transition-colors text-sm mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>
          <h1 className="text-2xl font-bold text-white mb-1">Reset Password</h1>
          <p className="text-[#888] text-sm">Enter your new password below</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {(['new', 'confirm'] as const).map((field) => {
            const labels = { new: 'New Password', confirm: 'Confirm New Password' };
            const keys = { new: 'newPassword', confirm: 'confirmPassword' } as const;
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
                    placeholder={field === 'new' ? 'Enter your new password' : 'Confirm your new password'}
                    required
                    minLength={8}
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

          <p className="text-xs text-[#555]">Password must be at least 8 characters. Mix of letters, numbers, and symbols recommended.</p>

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={isLoading || !token}
          >
            {isLoading ? 'Resetting Password...' : 'Reset Password'}
          </button>
        </form>

        <p className="text-sm text-[#555] text-center">
          Remember your password?{' '}
          <Link href="/auth/login" className="text-[#51a2ff] hover:text-white transition-colors font-medium">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function ResetPassword() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-[#888]">Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
