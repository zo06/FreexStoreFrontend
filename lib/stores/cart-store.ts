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

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      appliedCoupon: null,

      addItem: (item) => {
        const { items } = get();
        if (items.find((i) => i.id === item.id)) return;
        set({ items: [...items, item] });
      },

      removeItem: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

      clearCart: () => set({ items: [], appliedCoupon: null }),

      applyCoupon: (coupon) => set({ appliedCoupon: coupon }),

      removeCoupon: () => set({ appliedCoupon: null }),

      getCount: () => get().items.length,

      getSubtotal: () =>
        get().items.reduce((sum, item) => {
          const discount = item.discountPercentage || 0;
          const price = discount > 0 ? item.price * (1 - discount / 100) : item.price;
          return sum + price;
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
