// useWishlist Hook - reactive wishlist state
import { useState, useEffect, useCallback } from 'react';
import {
  getWishlist,
  toggleWishlist as toggle,
  isInWishlist as checkWishlist,
  getWishlistCount,
  WISHLIST_EVENT,
} from '@/lib/shop/wishlist';

export function useWishlist() {
  const [items, setItems] = useState<string[]>(getWishlist);
  const [count, setCount] = useState(getWishlistCount);

  useEffect(() => {
    const handler = () => {
      setItems(getWishlist());
      setCount(getWishlistCount());
    };
    window.addEventListener(WISHLIST_EVENT, handler);
    return () => window.removeEventListener(WISHLIST_EVENT, handler);
  }, []);

  const toggleItem = useCallback((productId: string) => {
    return toggle(productId);
  }, []);

  const isInList = useCallback((productId: string) => {
    return checkWishlist(productId);
  }, [items]); // eslint-disable-line react-hooks/exhaustive-deps

  return { items, count, toggle: toggleItem, isInWishlist: isInList };
}

export default useWishlist;
