'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../../lib/auth-context';

export default function HrPage() {
  const router = useRouter();
  const params = useParams();
  const lang = params?.lang || 'en';
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace(`/${lang}/auth/login`);
      } else {
        router.replace(`/${lang}/hr/dashboard`);
      }
    }
  }, [isAuthenticated, isLoading]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
