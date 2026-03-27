import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  discountPercentage?: number;
  imageUrl?: string;
  slug?: string;
}

interface CartState {
  items: CartItem[];
  appliedCoupon: { code: string; discountType: string; discountValue: number; name: string } | null;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  applyCoupon: (coupon: CartState['appliedCoupon']) => void;
  removeCoupon: () => void;
  getCount: () => number;
  getSubtotal: () => number;
  getTotal: () => number;
  isInCart: (id: string) => boolean;
}

/** Fire-and-forget: sync current cart item IDs to the backend */
function syncCartToBackend(scriptIds: string[]) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  if (!token) return;
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url) return;
  fetch(`${url}/users/me/cart/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ scriptIds }),
  }).catch(() => {/* silent */});
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      appliedCoupon: null,

      addItem: (item) => {
        const { items } = get();
        if (items.find((i) => i.id === item.id)) return;
        const next = [...items, item];
        set({ items: next });
        syncCartToBackend(next.map((i) => i.id));
      },

      removeItem: (id) => {
        set((state) => {
          const next = state.items.filter((i) => i.id !== id);
          syncCartToBackend(next.map((i) => i.id));
          return { items: next };
        });
      },

      clearCart: () => {
        set({ items: [], appliedCoupon: null });
        syncCartToBackend([]);
      },

      applyCoupon: (coupon) => set({ appliedCoupon: coupon }),

      removeCoupon: () => set({ appliedCoupon: null }),

      getCount: () => get().items.length,

      getSubtotal: () =>
        get().items.reduce((sum, item) => {
          const price = parseFloat(String(item.price).replace('$', '')) || 0;
          const discount = item.discountPercentage || 0;
          const finalPrice = discount > 0 ? price * (1 - discount / 100) : price;
          return sum + finalPrice;
        }, 0),

      getTotal: () => {
        const subtotal = get().getSubtotal();
        const coupon = get().appliedCoupon;
        if (!coupon) return subtotal;
        if (coupon.discountType === 'percentage') {
          return Math.max(0, subtotal * (1 - coupon.discountValue / 100));
        }
        return Math.max(0, subtotal - coupon.discountValue);
      },

      isInCart: (id) => get().items.some((i) => i.id === id),
    }),
    { name: 'freex-cart' }
  )
);
