// useCart Hook - wraps cart.ts with React state + cross-component sync

import { useState, useCallback, useEffect } from 'react';
import {
  getCart,
  addToCart,
  removeFromCart,
  updateQuantity as updateCartQuantity,
  clearCart,
  getCartTotal,
  onCartChange,
} from '@/lib/shop/cart';
import type { Product, CartItem } from '@/lib/shop/types';

export function useCart() {
  const [items, setItems] = useState<CartItem[]>(getCart);
  const [totals, setTotals] = useState(getCartTotal);

  useEffect(() => {
    return onCartChange(() => {
      setItems(getCart());
      setTotals(getCartTotal());
    });
  }, []);

  const addItem = useCallback((product: Product, quantity = 1, variant?: string) => {
    addToCart(product, quantity, variant);
  }, []);

  const removeItem = useCallback((productId: string, variant?: string) => {
    removeFromCart(productId, variant);
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number, variant?: string) => {
    updateCartQuantity(productId, quantity, variant);
  }, []);

  const clear = useCallback(() => {
    clearCart();
  }, []);

  return {
    items,
    count: totals.count,
    total: totals.total,
    currency: totals.currency,
    addItem,
    removeItem,
    updateQuantity,
    clear,
  };
}

export default useCart;
