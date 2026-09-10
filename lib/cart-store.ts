import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Crop } from '@/lib/types';

export type CartItem = {
  crop: Crop;
  quantity: number;
};

type CartStore = {
  items: CartItem[];
  add: (crop: Crop, quantity: number) => void;
  remove: (cropId: string) => void;
  updateQty: (cropId: string, quantity: number) => void;
  clear: () => void;
  subtotal: () => number;
  bulkDiscount: () => number;
  total: () => number;
};

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      add: (crop, quantity) => {
        const existing = get().items.find((i) => i.crop.id === crop.id);
        if (existing) {
          set({
            items: get().items.map((i) =>
              i.crop.id === crop.id ? { ...i, quantity: i.quantity + quantity } : i
            ),
          });
        } else {
          set({ items: [...get().items, { crop, quantity }] });
        }
      },
      remove: (cropId) => set({ items: get().items.filter((i) => i.crop.id !== cropId) }),
      updateQty: (cropId, quantity) => {
        if (quantity <= 0) {
          set({ items: get().items.filter((i) => i.crop.id !== cropId) });
          return;
        }
        set({
          items: get().items.map((i) =>
            i.crop.id === cropId ? { ...i, quantity } : i
          ),
        });
      },
      clear: () => set({ items: [] }),
      subtotal: () =>
        get().items.reduce((sum, i) => sum + i.crop.price_per_unit * i.quantity, 0),
      bulkDiscount: () => {
        const sub = get().subtotal();
        const totalQty = get().items.reduce((sum, i) => sum + i.quantity, 0);
        return totalQty >= 500 ? sub * 0.05 : 0;
      },
      total: () => get().subtotal() - get().bulkDiscount(),
    }),
    { name: 'agri-cart', storage: createJSONStorage(() => localStorage) }
  )
);
