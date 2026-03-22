'use client';

import { useState, useEffect } from 'react';
import { X, ShoppingCart, Trash2, Tag, ChevronRight, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useCartStore } from '@/lib/stores/cart-store';
import toast from 'react-hot-toast';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, removeItem, clearCart, appliedCoupon, applyCoupon, removeCoupon, getSubtotal, getTotal } = useCartStore();
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  const subtotal = getSubtotal();
  const total = getTotal();
  const discount = subtotal - total;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/coupons/validate/${couponCode.trim()}?orderAmount=${subtotal}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Invalid coupon');
      applyCoupon({ code: data.coupon.code, discountType: data.coupon.discountType, discountValue: data.coupon.discountValue, name: data.coupon.name });
      toast.success(`Coupon "${data.coupon.name}" applied!`);
      setCouponCode('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to apply coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      {/* Drawer */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-[#0a0f1e] border-l border-white/10 z-[201] flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white">Cart</h2>
            {items.length > 0 && (
              <span className="px-2 py-0.5 text-xs font-bold bg-cyan-500/20 text-cyan-300 rounded-full border border-cyan-500/30">{items.length}</span>
            )}
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <ShoppingCart className="w-16 h-16 text-gray-700 mb-4" />
              <p className="text-gray-400 font-medium">Your cart is empty</p>
              <p className="text-sm text-gray-600 mt-1">Add some scripts to get started</p>
              <button onClick={onClose} className="mt-6 px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-sm font-semibold rounded-xl hover:from-cyan-500 hover:to-blue-500 transition-all">
                Browse Scripts
              </button>
            </div>
          ) : (
            items.map((item) => {
              const discountedPrice = item.discountPercentage && item.discountPercentage > 0
                ? item.price * (1 - item.discountPercentage / 100)
                : item.price;
              return (
                <div key={item.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10 group">
                  {item.imageUrl ? (
                    <img src={item.imageUrl.startsWith('/') ? `${process.env.NEXT_PUBLIC_BACKEND_URL}${item.imageUrl}` : item.imageUrl}
                      alt={item.name} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-cyan-500/30 to-blue-500/30 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm truncate">{item.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-cyan-400 font-bold text-sm">${discountedPrice.toFixed(2)}</span>
                      {item.discountPercentage && item.discountPercentage > 0 && (
                        <span className="text-gray-500 line-through text-xs">${item.price.toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                  <button onClick={() => removeItem(item.id)} className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer (only when items exist) */}
        {items.length > 0 && (
          <div className="p-4 border-t border-white/10 space-y-4">
            {/* Coupon */}
            {appliedCoupon ? (
              <div className="flex items-center justify-between p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-300 text-sm font-medium">{appliedCoupon.code}</span>
                  <span className="text-emerald-500 text-xs">
                    {appliedCoupon.discountType === 'percentage' ? `-${appliedCoupon.discountValue}%` : `-$${appliedCoupon.discountValue}`}
                  </span>
                </div>
                <button onClick={removeCoupon} className="text-xs text-gray-500 hover:text-red-400 transition-colors">Remove</button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                  placeholder="Coupon code"
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

            {/* Totals */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-400">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {appliedCoupon && discount > 0 && (
                <div className="flex justify-between text-sm text-emerald-400">
                  <span>Coupon discount</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-white border-t border-white/10 pt-2">
                <span>Total</span>
                <span className="text-cyan-400">${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button onClick={clearCart} className="px-4 py-2.5 text-sm text-gray-400 hover:text-white border border-white/10 hover:border-white/20 rounded-xl transition-all">
                Clear
              </button>
              <Link href="/checkout" onClick={onClose} className="flex-1 py-2.5 text-sm font-bold text-center text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-xl transition-all flex items-center justify-center gap-2">
                Checkout <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
