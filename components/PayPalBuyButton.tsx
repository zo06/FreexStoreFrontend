'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

interface PayPalBuyButtonProps {
  scriptId: string;
  scriptName: string;
  amount: number;
  userId: string;
  className?: string;
  onSuccess?: () => void;
}

export default function PayPalBuyButton({
  scriptId,
  scriptName,
  amount,
  userId,
  className = '',
  onSuccess
}: PayPalBuyButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  const handlePurchase = async () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    setIsLoading(true);
    
    try {
      // Redirect to payment page with script details
      router.push(`/payment/${scriptId}?amount=${amount}&name=${encodeURIComponent(scriptName)}`);
      onSuccess?.();
    } catch (error) {
      console.error('Error initiating purchase:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handlePurchase}
      disabled={isLoading}
      className={`${className} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {isLoading ? 'Processing...' : 'Buy with PayPal'}
    </button>
  );
}

