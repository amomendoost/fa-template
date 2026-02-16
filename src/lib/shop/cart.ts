// localStorage-based cart with event system

import type { CartItem, Product } from './types';

const CART_KEY = 'shop_cart';
const listeners = new Set<() => void>();

function read(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function write(items: CartItem[]): CartItem[] {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  listeners.forEach((fn) => fn());
  return items;
}

function findIndex(items: CartItem[], productId: string, variant?: string): number {
  return items.findIndex(
    (item) => item.product.id === productId && item.variant === variant
  );
}

export function getCart(): CartItem[] {
  return read();
}

export function addToCart(product: Product, quantity = 1, variant?: string): CartItem[] {
  const items = read();
  const idx = findIndex(items, product.id, variant);

  if (idx >= 0) {
    items[idx].quantity += quantity;
  } else {
    items.push({ product, quantity, variant });
  }

  return write(items);
}

export function removeFromCart(productId: string, variant?: string): CartItem[] {
  const items = read();
  const idx = findIndex(items, productId, variant);
  if (idx >= 0) items.splice(idx, 1);
  return write(items);
}

export function updateQuantity(
  productId: string,
  quantity: number,
  variant?: string
): CartItem[] {
  const items = read();
  const idx = findIndex(items, productId, variant);

  if (idx >= 0) {
    if (quantity <= 0) {
      items.splice(idx, 1);
    } else {
      items[idx].quantity = quantity;
    }
  }

  return write(items);
}

export function clearCart(): void {
  localStorage.removeItem(CART_KEY);
  listeners.forEach((fn) => fn());
}

export function getCartTotal(): { count: number; total: number; currency: string } {
  const items = read();
  let total = 0;
  let count = 0;
  let currency = 'IRR';

  for (const item of items) {
    total += item.product.price * item.quantity;
    count += item.quantity;
    currency = item.product.currency || currency;
  }

  return { count, total, currency };
}

export function onCartChange(callback: () => void): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}
