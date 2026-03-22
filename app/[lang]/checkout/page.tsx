'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCartStore } from '@/lib/stores/cart-store';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import toast from 'react-hot-toast';
import {
  ArrowLeft, ShoppingCart, Trash2, Tag, Shield, Lock, CreditCard,
  CheckCircle, Loader2, X, Package, Sparkles,
} from 'lucide-react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// ─── Checkout Form (Stripe Elements) ─────────────────────────────────────────
function CheckoutForm({
  total,
  scriptIds,
  couponCode,
  onSuccess,
}: {
  total: number;
  scriptIds: string[];
  couponCode?: string;
  onSuccess: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setError(null);

    const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });

    if (stripeError) {
      setError(stripeError.message ?? 'Payment failed');
      setLoading(false);
      return;
    }

    if (paymentIntent?.status === 'succeeded') {
      try {
        await (apiClient as any).confirmStripeCartPayment(paymentIntent.id, scriptIds, couponCode);
        toast.success('Payment successful! Licenses activated.');
        onSuccess();
      } catch (err: any) {
        toast.error(err.message || 'Payment succeeded but license activation failed. Contact support.');
      }
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <PaymentElement />
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-sm text-red-400">
          <X className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg hover:shadow-cyan-500/25 flex items-center justify-center gap-2"
      >
        {loading ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
        ) : (
          <><Lock className="w-4 h-4" /> Pay ${total.toFixed(2)}</>
        )}
      </button>
    </form>
  );
}

// ─── Payment Panel ────────────────────────────────────────────────────────────
function PaymentPanel({
  total,
  scriptIds,
  couponCode,
  onSuccess,
}: {
  total: number;
  scriptIds: string[];
  couponCode?: string;
  onSuccess: () => void;
}) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(false);
  const [ready, setReady] = useState(false);
  const piIdRef = useRef<string | null>(null);
  const completedRef = useRef(false);

  const initPayment = async () => {
    if (clientSecret) { setReady(true); return; }
    setInitializing(true);
    try {
      const data = await (apiClient as any).createStripeIntent(total, 'usd', {
        cartItems: scriptIds.join(','),
        couponCode: couponCode ?? '',
      }) as { clientSecret: string; id: string };
      setClientSecret(data.clientSecret);
      piIdRef.current = data.id;
      setReady(true);
    } catch {
      toast.error('Failed to initialize payment. Please try again.');
    } finally {
      setInitializing(false);
    }
  };

  useEffect(() => {
    return () => {
      if (piIdRef.current && !completedRef.current) {
        (apiClient as any).cancelStripePayment(piIdRef.current).catch(() => {});
      }
    };
  }, []);

  const handleSuccess = () => {
    completedRef.current = true;
    onSuccess();
  };

  if (!ready) {
    return (
      <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center space-y-4">
        <CreditCard className="w-12 h-12 mx-auto text-cyan-400 opacity-70" />
        <p className="text-gray-300 font-medium">Ready to complete your purchase?</p>
        <p className="text-sm text-gray-500">Click below to securely enter your payment details.</p>
        <button
          onClick={initPayment}
          disabled={initializing}
          className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
        >
          {initializing ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Initializing...</>
          ) : (
            <><CreditCard className="w-4 h-4" /> Proceed to Payment</>
          )}
        </button>
      </div>
    );
  }

  if (!clientSecret) return null;

  return (
    <Elements
      stripe={stripePromise}
      options={{ clientSecret, appearance: { theme: 'night', variables: { colorPrimary: '#22d3ee' } } }}
    >
      <CheckoutForm total={total} scriptIds={scriptIds} couponCode={couponCode} onSuccess={handleSuccess} />
    </Elements>
  );
}

// ─── Main Checkout Page ───────────────────────────────────────────────────────
export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    items, removeItem, clearCart,
    appliedCoupon, applyCoupon, removeCoupon,
    getSubtotal, getTotal,
  } = useCartStore();

  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  if (!user) {
    router.replace('/auth/login');
    return null;
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#030712] flex flex-col items-center justify-center gap-6 px-4">
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(53,189,242,0.15),transparent)]" />
        </div>
        <ShoppingCart className="w-20 h-20 text-gray-700" />
        <h2 className="text-2xl font-bold text-white">Your cart is empty</h2>
        <p className="text-gray-400">Add some scripts before checking out.</p>
        <Link
          href="/scripts"
          className="px-8 py-3 font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl hover:from-cyan-500 hover:to-blue-500 transition-all"
        >
          Browse Scripts
        </Link>
      </div>
    );
  }

  const subtotal = getSubtotal();
  const total = getTotal();
  const discount = subtotal - total;
  const scriptIds = items.map((i) => i.id);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/coupons/validate/${couponCode.trim()}?orderAmount=${subtotal}`,
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Invalid coupon');
      applyCoupon({
        code: data.coupon.code,
        discountType: data.coupon.discountType,
        discountValue: data.coupon.discountValue,
        name: data.coupon.name,
      });
      toast.success(`Coupon "${data.coupon.name}" applied!`);
      setCouponCode('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to apply coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleSuccess = () => {
    clearCart();
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#030712] relative overflow-x-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(53,189,242,0.15),transparent)]" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_60%_60%_at_100%_100%,rgba(16,185,129,0.1),transparent)]" />
        <div className="absolute top-20 left-10 w-40 h-40 bg-cyan-500/15 rounded-full blur-[80px] animate-pulse" />
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-[60px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8 pt-16">
          <Link
            href="/scripts"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-white border border-white/10 bg-white/5 hover:bg-white/10 rounded-xl transition-all mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Scripts
          </Link>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-xl">
              <ShoppingCart className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-white">Checkout</h1>
              <p className="text-gray-400 flex items-center gap-1.5 mt-0.5">
                <Shield className="w-4 h-4 text-green-400" />
                Secure, encrypted payment
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_420px] gap-8">
          {/* Left: Order Summary */}
          <div className="space-y-5">
            {/* Items */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-cyan-400" />
                  <span className="font-semibold text-white">Order Summary</span>
                  <span className="text-xs px-2 py-0.5 bg-cyan-500/20 text-cyan-300 rounded-full border border-cyan-500/30">
                    {items.length} {items.length === 1 ? 'item' : 'items'}
                  </span>
                </div>
                <button
                  onClick={clearCart}
                  className="text-xs text-gray-500 hover:text-red-400 transition-colors"
                >
                  Clear all
                </button>
              </div>

              <div className="p-4 space-y-3">
                {items.map((item) => {
                  const finalPrice =
                    item.discountPercentage && item.discountPercentage > 0
                      ? item.price * (1 - item.discountPercentage / 100)
                      : item.price;
                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10 group"
                    >
                      {item.imageUrl ? (
                        <img
                          src={
                            item.imageUrl.startsWith('/')
                              ? `${process.env.NEXT_PUBLIC_BACKEND_URL}${item.imageUrl}`
                              : item.imageUrl
                          }
                          alt={item.name}
                          className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-cyan-500/30 to-blue-500/30 flex items-center justify-center flex-shrink-0">
                          <Package className="w-6 h-6 text-cyan-400 opacity-60" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium text-sm truncate">{item.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Lifetime License</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-cyan-400 font-bold text-sm">${finalPrice.toFixed(2)}</span>
                          {item.discountPercentage && item.discountPercentage > 0 && (
                            <>
                              <span className="text-gray-600 line-through text-xs">${item.price.toFixed(2)}</span>
                              <span className="text-xs text-red-400 font-medium">-{item.discountPercentage}%</span>
                            </>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Coupon */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-cyan-400" />
                <span className="font-semibold text-white text-sm">Coupon Code</span>
              </div>
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-300 text-sm font-medium">{appliedCoupon.code}</span>
                    <span className="text-emerald-500 text-xs">
                      {appliedCoupon.discountType === 'percentage'
                        ? `-${appliedCoupon.discountValue}%`
                        : `-$${appliedCoupon.discountValue}`}
                    </span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-xs text-gray-500 hover:text-red-400 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                    placeholder="Enter coupon code"
                    className="flex-1 h-10 px-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-600 text-sm focus:border-cyan-500/50 focus:outline-none transition-all"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={couponLoading || !couponCode.trim()}
                    className="h-10 px-4 bg-gradient-to-r from-cyan-600/80 to-blue-600/80 hover:from-cyan-500 hover:to-blue-500 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Tag className="w-3.5 h-3.5" />
                    Apply
                  </button>
                </div>
              )}
            </div>

            {/* Security badges */}
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-emerald-500/20 rounded-xl flex-shrink-0">
                  <Shield className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm mb-1">Secure Transaction</p>
                  <p className="text-gray-400 text-xs leading-relaxed">
                    Your payment is protected by 256-bit SSL encryption. We never store your card details.
                  </p>
                  <div className="flex gap-2 mt-2.5">
                    <span className="text-xs px-2 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full">
                      SSL Encrypted
                    </span>
                    <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full">
                      PCI Compliant
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Price + Payment */}
          <div className="space-y-5">
            {/* Totals */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-5 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span className="font-semibold text-white text-sm">Price Summary</span>
              </div>

              <div className="flex justify-between text-sm text-gray-400">
                <span>Subtotal ({items.length} items)</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>

              {appliedCoupon && discount > 0 && (
                <div className="flex justify-between text-sm text-emerald-400">
                  <span>Coupon ({appliedCoupon.code})</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}

              {items.some((i) => (i.discountPercentage ?? 0) > 0) && (
                <div className="flex justify-between text-sm text-red-400">
                  <span>Item discounts</span>
                  <span>
                    -$
                    {items
                      .reduce((acc, i) => {
                        const d = i.discountPercentage ?? 0;
                        return acc + (d > 0 ? i.price * (d / 100) : 0);
                      }, 0)
                      .toFixed(2)}
                  </span>
                </div>
              )}

              <div className="border-t border-white/10 pt-3 flex justify-between font-bold text-white text-lg">
                <span>Total</span>
                <span className="text-cyan-400">${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment form */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-5 space-y-4">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-cyan-400" />
                <span className="font-semibold text-white text-sm">Payment</span>
              </div>
              <PaymentPanel
                total={total}
                scriptIds={scriptIds}
                couponCode={appliedCoupon?.code}
                onSuccess={handleSuccess}
              />
            </div>

            {/* Trust icons */}
            <div className="space-y-2 text-center">
              <p className="flex items-center justify-center gap-2 text-xs text-gray-500">
                <Lock className="w-3.5 h-3.5 text-green-400" />
                Payment info is secure and encrypted
              </p>
              <p className="flex items-center justify-center gap-2 text-xs text-gray-500">
                <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />
                Receipt sent to your registered email
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
