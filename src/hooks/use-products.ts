// useProducts Hook - list products with filters

import { useState, useCallback, useEffect } from 'react';
import { getProducts } from '@/lib/shop/service';
import type { Product, ProductFilterParams, Pagination } from '@/lib/shop/types';

export function useProducts(params?: ProductFilterParams) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, total_pages: 0 });

  const fetch = useCallback(async (p?: ProductFilterParams) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getProducts(p);
      setProducts(res.data);
      setPagination(res.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch(params);
  }, [params?.page, params?.limit, params?.category, params?.search, params?.sort, params?.min_price, params?.max_price, fetch]);

  const loadMore = useCallback(() => {
    if (pagination.page < pagination.total_pages) {
      fetch({ ...params, page: pagination.page + 1 });
    }
  }, [pagination, params, fetch]);

  const refresh = useCallback(() => {
    fetch(params);
  }, [params, fetch]);

  return {
    products,
    isLoading,
    error,
    pagination: {
      page: pagination.page,
      total: pagination.total,
      totalPages: pagination.total_pages,
      hasMore: pagination.page < pagination.total_pages,
    },
    loadMore,
    refresh,
  };
}

export default useProducts;
