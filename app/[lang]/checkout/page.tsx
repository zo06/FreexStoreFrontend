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
  CheckCircle, Loader2, X, Package, BadgePercent, LogIn, UserPlus,
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
        className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
  const [initializing, setInitializing] = useState(true);
  const piIdRef = useRef<string | null>(null);
  const completedRef = useRef(false);

  useEffect(() => {
    const initPayment = async () => {
      try {
        const data = await (apiClient as any).createStripeIntent(total, 'usd', {
          cartItems: scriptIds.join(','),
          couponCode: couponCode ?? '',
        }) as { clientSecret: string; id: string };
        setClientSecret(data.clientSecret);
        piIdRef.current = data.id;
      } catch {
        toast.error('Failed to initialize payment. Please try again.');
      } finally {
        setInitializing(false);
      }
    };
    initPayment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  if (initializing) {
    return (
      <div className="flex items-center justify-center py-8 gap-3">
        <Loader2 className="w-5 h-5 animate-spin text-[#51a2ff]" />
        <span className="text-sm text-[#888]">Loading payment options...</span>
      </div>
    );
  }

  if (!clientSecret) return null;

  return (
    <Elements
      stripe={stripePromise}
      options={{ clientSecret, appearance: { theme: 'night', variables: { colorPrimary: '#51a2ff' } } }}
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
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
        <div className="w-full max-w-md space-y-4">
          {/* Cart preview */}
          {items.length > 0 && (
            <div className="card-base p-4 space-y-2">
              <p className="text-xs text-[#555] font-medium uppercase tracking-wider mb-3">
                Your cart · {items.length} {items.length === 1 ? 'item' : 'items'}
              </p>
              {items.slice(0, 3).map((item) => {
                const p = parseFloat(String(item.price).replace('$', '')) || 0;
                return (
                  <div key={item.id} className="flex items-center gap-3">
                    {item.imageUrl ? (
                      <img src={item.imageUrl.startsWith('/') ? `${process.env.NEXT_PUBLIC_BACKEND_URL}${item.imageUrl}` : item.imageUrl}
                        alt={item.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-[#1a1a1a] flex-shrink-0" />
                    )}
                    <span className="flex-1 text-sm text-[#aaa] truncate">{item.name}</span>
                    <span className="text-sm font-bold text-[#51a2ff]">${p.toFixed(2)}</span>
                  </div>
                );
              })}
              {items.length > 3 && (
                <p className="text-xs text-[#444] text-center pt-1">+{items.length - 3} more items</p>
              )}
              <div className="border-t border-[rgba(255,255,255,0.06)] pt-2 flex justify-between font-bold text-white">
                <span className="text-sm">Total</span>
                <span className="text-[#51a2ff]">${getTotal().toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Login prompt */}
          <div className="card-base p-8 text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-xl bg-[#1a1a1a] flex items-center justify-center" style={{ border: '1px solid rgba(81,162,255,0.2)' }}>
              <Lock className="w-8 h-8 text-[#51a2ff]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Login to Checkout</h2>
              <p className="text-[#888] text-sm leading-relaxed">
                Your cart is saved. Sign in or create an account to complete your purchase.
              </p>
            </div>
            <div className="space-y-3">
              <Link
                href={`/auth/login?redirect=/checkout`}
                className="btn-primary flex items-center justify-center gap-2 w-full"
              >
                <LogIn className="w-4 h-4" />
                Sign In & Checkout
              </Link>
              <Link
                href={`/auth/register?redirect=/checkout`}
                className="btn-ghost flex items-center justify-center gap-2 w-full"
              >
                <UserPlus className="w-4 h-4" />
                Create Account
              </Link>
            </div>
            <Link href="/scripts" className="block text-xs text-[#444] hover:text-[#888] transition-colors">
              ← Continue browsing
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center gap-6 px-4">
        <ShoppingCart className="w-16 h-16 text-[#333]" />
        <h2 className="text-2xl font-bold text-white">Your cart is empty</h2>
        <p className="text-[#888]">Add some scripts before checking out.</p>
        <Link href="/scripts" className="btn-primary">Browse Scripts</Link>
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
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-[1200px] mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8 pt-6">
          <Link
            href="/scripts"
            className="inline-flex items-center gap-2 text-sm text-[#888] hover:text-white border border-[rgba(255,255,255,0.07)] bg-[#111] hover:bg-[#161616] px-3 py-2 rounded-xl transition-all mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Scripts
          </Link>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#1a1a1a] rounded-xl" style={{ border: '1px solid rgba(81,162,255,0.2)' }}>
              <ShoppingCart className="w-6 h-6 text-[#51a2ff]" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white">Checkout</h1>
              <p className="text-[#888] flex items-center gap-1.5 mt-0.5 text-sm">
                <Shield className="w-4 h-4 text-emerald-400" />
                Secure, encrypted payment
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_400px] gap-6">
          {/* Left: Order Summary */}
          <div className="space-y-4">
            {/* Items */}
            <div className="card-base overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(255,255,255,0.06)]">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#51a2ff]" />
                  <span className="font-semibold text-white text-sm">Order Summary</span>
                  <span className="badge-blue text-xs">{items.length} {items.length === 1 ? 'item' : 'items'}</span>
                </div>
                <button onClick={clearCart} className="text-xs text-[#555] hover:text-red-400 transition-colors">
                  Clear all
                </button>
              </div>

              <div className="p-4 space-y-3">
                {items.map((item) => {
                  const rawPrice = parseFloat(String(item.price).replace('$', '')) || 0;
                  const finalPrice = item.discountPercentage && item.discountPercentage > 0
                    ? rawPrice * (1 - item.discountPercentage / 100)
                    : rawPrice;
                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-[#111] border border-[rgba(255,255,255,0.05)] group"
                    >
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl.startsWith('/') ? `${process.env.NEXT_PUBLIC_BACKEND_URL}${item.imageUrl}` : item.imageUrl}
                          alt={item.name}
                          className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-lg bg-[#1a1a1a] flex items-center justify-center flex-shrink-0">
                          <Package className="w-6 h-6 text-[#333]" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium text-sm truncate">{item.name}</p>
                        <p className="text-xs text-[#555] mt-0.5">Lifetime License</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[#51a2ff] font-bold text-sm">${finalPrice.toFixed(2)}</span>
                          {(item.discountPercentage ?? 0) > 0 && (
                            <>
                              <span className="text-[#444] line-through text-xs">${rawPrice.toFixed(2)}</span>
                              <span className="text-xs text-red-400 font-medium">-{item.discountPercentage}%</span>
                            </>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1.5 rounded-lg text-[#444] hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Coupon */}
            <div className="card-base p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-[#51a2ff]" />
                <span className="font-semibold text-white text-sm">Coupon Code</span>
              </div>
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400 text-sm font-medium">{appliedCoupon.code}</span>
                    <span className="text-emerald-500 text-xs">
                      {appliedCoupon.discountType === 'percentage' ? `-${appliedCoupon.discountValue}%` : `-$${appliedCoupon.discountValue}`}
                    </span>
                  </div>
                  <button onClick={removeCoupon} className="text-xs text-[#555] hover:text-red-400 transition-colors">
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
                    className="input-base flex-1"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={couponLoading || !couponCode.trim()}
                    className="btn-primary btn-sm flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Tag className="w-3.5 h-3.5" />
                    Apply
                  </button>
                </div>
              )}
            </div>

            {/* Security badge */}
            <div className="p-5 rounded-xl" style={{ background: 'rgba(52,211,153,0.05)', border: '1px solid rgba(52,211,153,0.15)' }}>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-xl flex-shrink-0">
                  <Shield className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm mb-1">Secure Transaction</p>
                  <p className="text-[#888] text-xs leading-relaxed">
                    Your payment is protected by 256-bit SSL encryption. We never store your card details.
                  </p>
                  <div className="flex gap-2 mt-2.5">
                    <span className="text-xs px-2 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">SSL Encrypted</span>
                    <span className="text-xs px-2 py-1 bg-[#51a2ff]/10 text-[#51a2ff] border border-[#51a2ff]/20 rounded-full">PCI Compliant</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Price + Payment */}
          <div className="space-y-4">
            {/* Totals */}
            <div className="card-base p-5 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <BadgePercent className="w-4 h-4 text-[#51a2ff]" />
                <span className="font-semibold text-white text-sm">Price Summary</span>
              </div>
              <div className="flex justify-between text-sm text-[#888]">
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
                    -${items.reduce((acc, i) => {
                      const d = i.discountPercentage ?? 0;
                      return acc + (d > 0 ? i.price * (d / 100) : 0);
                    }, 0).toFixed(2)}
                  </span>
                </div>
              )}
              <div className="border-t border-[rgba(255,255,255,0.06)] pt-3 flex justify-between font-bold text-white text-lg">
                <span>Total</span>
                <span className="text-[#51a2ff]">${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment form */}
            <div className="card-base p-5 space-y-4">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#51a2ff]" />
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
              <p className="flex items-center justify-center gap-2 text-xs text-[#444]">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                Payment info is secure and encrypted
              </p>
              <p className="flex items-center justify-center gap-2 text-xs text-[#444]">
                <CheckCircle className="w-3.5 h-3.5 text-[#51a2ff]" />
                Receipt sent to your registered email
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
