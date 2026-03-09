// RelatedPosts - show related posts by category/tags
import { useState, useEffect } from 'react';
import { PostCard } from './PostCard';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { getRelatedPosts } from '@/lib/blog/service';
import type { BlogPost } from '@/lib/blog/types';

interface RelatedPostsProps {
  slug: string;
  className?: string;
}

export function RelatedPosts({ slug, className }: RelatedPostsProps) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setIsLoading(true);

    getRelatedPosts(slug)
      .then((data) => { if (!cancelled) setPosts(data); })
      .catch(() => { if (!cancelled) setPosts([]); })
      .finally(() => { if (!cancelled) setIsLoading(false); });

    return () => { cancelled = true; };
  }, [slug]);

  if (!isLoading && posts.length === 0) return null;

  return (
    <div className={cn('space-y-4', className)}>
      <h3 className="font-bold text-lg">مطالب مرتبط</h3>
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-video w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} showExcerpt={false} />
          ))}
        </div>
      )}
    </div>
  );
}

export default RelatedPosts;
