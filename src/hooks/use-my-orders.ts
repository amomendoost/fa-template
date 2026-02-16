// useMyOrders Hook - authenticated user's order history

import { useState, useCallback, useEffect } from 'react';
import { getMyOrders, linkOrderToAccount, isAuthenticated } from '@/lib/shop/service';
import type { Order, Pagination } from '@/lib/shop/types';

interface UseMyOrdersOptions {
  autoFetch?: boolean;
  page?: number;
  limit?: number;
}

export function useMyOrders(options?: UseMyOrdersOptions) {
  const { autoFetch = true, page: initialPage = 1, limit = 10 } = options || {};

  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: initialPage,
    limit,
    total: 0,
    total_pages: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(isAuthenticated());

  const fetchOrders = useCallback(async (page = 1) => {
    if (!isAuthenticated()) {
      setIsLoggedIn(false);
      setOrders([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    setIsLoggedIn(true);

    try {
      const result = await getMyOrders({ page, limit });
      setOrders(result.orders || []);
      setPagination(result.pagination);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load orders';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  const loadMore = useCallback(() => {
    if (pagination.page < pagination.total_pages) {
      fetchOrders(pagination.page + 1);
    }
  }, [pagination, fetchOrders]);

  const refresh = useCallback(() => {
    fetchOrders(1);
  }, [fetchOrders]);

  const linkOrder = useCallback(async (orderNumber: string, verifyPhone?: string) => {
    if (!isAuthenticated()) {
      return { success: false, error: 'Not logged in' };
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await linkOrderToAccount(orderNumber, verifyPhone);
      if (result.success) {
        // Refresh orders to include the newly linked order
        await fetchOrders(1);
      }
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to link order';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  }, [fetchOrders]);

  useEffect(() => {
    if (autoFetch && isAuthenticated()) {
      fetchOrders(initialPage);
    }
  }, [autoFetch, initialPage, fetchOrders]);

  // Listen for auth changes
  useEffect(() => {
    const checkAuth = () => {
      const loggedIn = isAuthenticated();
      if (loggedIn !== isLoggedIn) {
        setIsLoggedIn(loggedIn);
        if (loggedIn && autoFetch) {
          fetchOrders(1);
        } else if (!loggedIn) {
          setOrders([]);
        }
      }
    };

    // Check on storage changes (login/logout in another tab)
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, [isLoggedIn, autoFetch, fetchOrders]);

  return {
    orders,
    pagination,
    isLoading,
    error,
    isLoggedIn,
    hasMore: pagination.page < pagination.total_pages,
    fetchOrders,
    loadMore,
    refresh,
    linkOrder,
  };
}

export default useMyOrders;
