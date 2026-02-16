// useBlogPosts Hook - list posts with filters and search

import { useState, useCallback, useEffect } from 'react';
import { getPosts } from '@/lib/blog/service';
import type { BlogPost, BlogFilterParams, Pagination } from '@/lib/blog/types';

export function useBlogPosts(params?: BlogFilterParams) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, total: 0, total_pages: 0 });

  const fetch = useCallback(async (p?: BlogFilterParams) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getPosts(p);
      setPosts(res.data);
      setPagination(res.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load posts');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch(params);
  }, [params?.page, params?.limit, params?.category, params?.tag, params?.search, fetch]);

  const loadMore = useCallback(() => {
    if (pagination.page < pagination.total_pages) {
      fetch({ ...params, page: pagination.page + 1 });
    }
  }, [pagination, params, fetch]);

  const refresh = useCallback(() => {
    fetch(params);
  }, [params, fetch]);

  return {
    posts,
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

export default useBlogPosts;
