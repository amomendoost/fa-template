// useBlogPost Hook - single post by slug with comments

import { useState, useEffect } from 'react';
import { getPost } from '@/lib/blog/service';
import type { BlogPost, BlogComment } from '@/lib/blog/types';

export function useBlogPost(slug: string | undefined) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [isLoading, setIsLoading] = useState(!!slug);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setPost(null);
      setComments([]);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    getPost(slug)
      .then((data) => {
        if (!cancelled) {
          setPost(data.post);
          setComments(data.comments);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load post');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => { cancelled = true; };
  }, [slug]);

  return { post, comments, isLoading, error };
}

export default useBlogPost;
