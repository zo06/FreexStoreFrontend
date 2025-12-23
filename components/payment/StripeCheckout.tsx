'use client';
import { useState, useEffect, useRef } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import apiClient from '@/lib/api';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { Loader2, CreditCard } from 'lucide-react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface StripeCheckoutProps {
  amount: number;
  currency: string;
  metadata?: any;
  onSuccess?: (paymentIntent: any) => void;
  onError?: (error: any) => void;
}

function CheckoutForm({ onSuccess, onError, amount }: { 
  onSuccess?: (paymentIntent: any) => void;
  onError?: (error: any) => void;
  amount: number;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });

    if (error) {
      setErrorMessage(error.message ?? 'An unexpected error occurred.');
      onError?.(error);
      setIsLoading(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      toast.success('Payment successful!');
      onSuccess?.(paymentIntent);
      setIsLoading(false);
    } else {
       // unexpected state
       setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {errorMessage && (
        <div className="text-sm text-red-500">{errorMessage}</div>
      )}
      <Button 
        type="submit" 
        disabled={!stripe || isLoading} 
        className="w-full bg-gradient-to-r from-cyan-600 to-blue-600"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 w-4 h-4 animate-spin" />
            Processing...
          </>
        ) : (
          `Pay $${amount}`
        )}
      </Button>
    </form>
  );
}

export function StripeCheckout({ amount, currency, metadata, onSuccess, onError }: StripeCheckoutProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const paymentIntentIdRef = useRef<string | null>(null);
  const paymentCompletedRef = useRef(false);

  const initializePayment = async () => {
    if (clientSecret) {
      // Already initialized
      setShowPaymentForm(true);
      return;
    }

    try {
      setIsInitializing(true);
      const data = await apiClient.createStripeIntent(amount, currency, metadata) as { clientSecret: string; id: string };
      setClientSecret(data.clientSecret);
      paymentIntentIdRef.current = data.id;
      setShowPaymentForm(true);
    } catch (error: any) {
      console.error('Failed to create payment intent:', error);
      toast.error('Failed to initialize payment. Please try again.');
      onError?.(error);
    } finally {
      setIsInitializing(false);
    }
  };

  // Wrap onSuccess to mark payment as completed
  const handleSuccess = (paymentIntent: any) => {
    paymentCompletedRef.current = true;
    onSuccess?.(paymentIntent);
  };

  // Cleanup: Cancel payment intent if user leaves without completing
  useEffect(() => {
    return () => {
      if (paymentIntentIdRef.current && !paymentCompletedRef.current) {
        // Cancel the payment intent when component unmounts
        apiClient.cancelStripePayment(paymentIntentIdRef.current).catch((error) => {
          console.error('Failed to cancel payment intent:', error);
        });
      }
    };
  }, []);

  if (!showPaymentForm) {
    return (
      <div className="space-y-4">
        <div className="p-6 bg-gray-900 rounded-lg border border-gray-700">
          <div className="flex justify-center items-center mb-4">
            <CreditCard className="w-12 h-12 text-blue-400" />
          </div>
          <h3 className="mb-2 font-semibold text-center text-white">Secure Card Payment</h3>
          <p className="mb-4 text-sm text-center text-gray-400">
            Click below to proceed with your card payment
          </p>
          <Button 
            onClick={initializePayment}
            disabled={isInitializing || amount <= 0}
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600"
          >
            {isInitializing ? (
              <>
                <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                Initializing...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 w-4 h-4" />
                Proceed to Payment
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  if (!clientSecret) {
    return null;
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'night', variables: { colorPrimary: '#9333ea' } } }}>
      <CheckoutForm onSuccess={handleSuccess} onError={onError} amount={amount} />
    </Elements>
  );
}

