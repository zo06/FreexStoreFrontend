'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function AuthCallback() {
  const router = useRouter();
  const { login } = useAuth();

  useEffect(() => {
    const handleAuth = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const accessToken = urlParams.get('accessToken');
      const refreshToken = urlParams.get('refreshToken');
      const token = urlParams.get('token'); // Legacy support

      if (accessToken && refreshToken) {
        // New token system - store both tokens and redirect to dashboard
        await login({ accessToken, refreshToken });
        router.push('/dashboard');
      } else if (token) {
        // Legacy token system - for backward compatibility
        await login({ accessToken: token, refreshToken: token });
        router.push('/dashboard');
      } else {
        // If no tokens, redirect to login
        router.push('/auth/login');
      }
    };

    handleAuth();
  }, [login, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-900 via-blue-900 to-indigo-900 flex items-center justify-center">
      <div className="text-white text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p>Authenticating with Discord...</p>
      </div>
    </div>
  );
}
