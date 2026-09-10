'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { Crop } from '@/lib/types';

export interface CartItem {
  crop: Crop;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  addItem: (crop: Crop, quantity: number) => void;
  removeItem: (cropId: string) => void;
  updateQuantity: (cropId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  function addItem(crop: Crop, quantity: number) {
    setItems((prev) => {
      const existing = prev.find((i) => i.crop.id === crop.id);
      if (existing) {
        return prev.map((i) =>
          i.crop.id === crop.id ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [...prev, { crop, quantity }];
    });
  }

  function removeItem(cropId: string) {
    setItems((prev) => prev.filter((i) => i.crop.id !== cropId));
  }

  function updateQuantity(cropId: string, quantity: number) {
    if (quantity <= 0) {
      removeItem(cropId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.crop.id === cropId ? { ...i, quantity } : i))
    );
  }

  function clearCart() {
    setItems([]);
  }

  const total = items.reduce((sum, i) => sum + i.crop.price_per_unit * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, total, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
