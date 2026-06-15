'use client';
import { createContext, useContext, useState, ReactNode } from 'react';
import { Product, CartItem } from '@/types';

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, qty?: number, color?: string | null, size?: string | null) => void;
  removeItem: (productId: number, color?: string | null, size?: string | null) => void;
  updateQty: (productId: number, qty: number, color?: string | null, size?: string | null) => void;
  clearCart: () => void;
  total: number;
  count: number;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (product: Product, qty = 1, color?: string | null, size?: string | null) => {
    setItems(prev => {
      const existing = prev.find(i =>
        i.product.id === product.id &&
        i.selectedColor === color &&
        i.selectedSize === size
      );
      if (existing) {
        return prev.map(i =>
          i.product.id === product.id && i.selectedColor === color && i.selectedSize === size
            ? { ...i, quantity: Math.min(i.quantity + qty, product.stock_qty) }
            : i
        );
      }
      return [...prev, { product, quantity: qty, selectedColor: color, selectedSize: size }];
    });
  };

  const removeItem = (productId: number, color?: string | null, size?: string | null) =>
    setItems(prev => prev.filter(i =>
      !(i.product.id === productId && i.selectedColor === color && i.selectedSize === size)
    ));

  const updateQty = (productId: number, qty: number, color?: string | null, size?: string | null) => {
    if (qty <= 0) return removeItem(productId, color, size);
    setItems(prev => prev.map(i =>
      i.product.id === productId && i.selectedColor === color && i.selectedSize === size
        ? { ...i, quantity: qty } : i
    ));
  };

  const clearCart = () => setItems([]);
  const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart doit être dans CartProvider');
  return ctx;
};