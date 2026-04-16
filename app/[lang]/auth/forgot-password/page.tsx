'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { ArrowLeft, Mail } from 'lucide-react';
import Link from 'next/link';
import apiClient from '@/lib/api';

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }
    setIsLoading(true);
    try {
      await apiClient.forgotPassword(email);
      setIsSubmitted(true);
      toast.success('Password reset instructions sent to your email');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reset instructions');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="card-base w-full max-w-md p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-[#1a1a1a] rounded-full flex items-center justify-center mx-auto">
            <Mail className="w-8 h-8 text-[#51a2ff]" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Check Your Email</h2>
            <p className="text-[#888] text-sm">
              We&apos;ve sent reset instructions to <strong className="text-white">{email}</strong>
            </p>
          </div>
          <p className="text-sm text-[#555]">
            Didn&apos;t receive the email? Check your spam folder or try again.
          </p>
          <div className="space-y-2">
            <button
              onClick={() => setIsSubmitted(false)}
              className="btn-ghost w-full"
            >
              Try Again
            </button>
            <Link href="/auth/login" className="block text-sm text-[#888] hover:text-white transition-colors text-center py-2">
              Back to Login
            </Link>
          </div>
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
          <h1 className="text-2xl font-bold text-white mb-1">Forgot Password</h1>
          <p className="text-[#888] text-sm">Enter your email and we&apos;ll send you reset instructions</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium text-[#ccc]">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-base w-full"
              placeholder="Enter your email address"
              required
            />
          </div>

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Sending Instructions...' : 'Send Reset Instructions'}
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
