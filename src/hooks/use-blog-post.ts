// useBlogPost Hook - single post by slug with comments

import { useState, useEffect } from 'react';
import { getPost } from '@/lib/blog/service';
import type { BlogPost, BlogComment } from '@/lib/blog/types';

export function useBlogPost(slug: string | undefined) {
  const [result, setResult] = useState<{
    slug?: string;
    post: BlogPost | null;
    comments: BlogComment[];
    error: string | null;
  }>({
    post: null,
    comments: [],
    error: null,
  });

  useEffect(() => {
    if (!slug) return;

    let cancelled = false;

    getPost(slug)
      .then((data) => {
        if (!cancelled) {
          setResult({
            slug,
            post: data.post,
            comments: data.comments,
            error: null,
          });
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setResult({
            slug,
            post: null,
            comments: [],
            error: err instanceof Error ? err.message : 'خطا در بارگذاری مطلب',
          });
        }
      });

    return () => { cancelled = true; };
  }, [slug]);

  const post = result.slug === slug ? result.post : null;
  const comments = result.slug === slug ? result.comments : [];
  const error = result.slug === slug ? result.error : null;
  const isLoading = Boolean(slug) && result.slug !== slug;

  return { post, comments, isLoading, error };
}

export default useBlogPost;
