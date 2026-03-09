// PostGrid - responsive grid of posts + loading + empty state
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useBlogPosts } from '@/hooks/use-blog-posts';
import { PostCard } from './PostCard';
import type { BlogPost, BlogFilterParams } from '@/lib/blog/types';

interface PostGridProps {
  posts?: BlogPost[];
  category?: string;
  tag?: string;
  columns?: 2 | 3;
  className?: string;
}

const gridCols = {
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
};

export function PostGrid({
  posts: externalPosts,
  category,
  tag,
  columns = 3,
  className,
}: PostGridProps) {
  const params: BlogFilterParams | undefined =
    externalPosts === undefined ? { category, tag } : undefined;
  const { posts: fetchedPosts, isLoading, pagination, loadMore } = useBlogPosts(params);

  const posts = externalPosts ?? fetchedPosts;

  if (isLoading && posts.length === 0) {
    return (
      <div className={cn('grid gap-6', gridCols[columns], className)}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-video w-full rounded-lg" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className={cn('text-center py-12 text-muted-foreground', className)}>
        مطلبی یافت نشد
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      <div className={cn('grid gap-6', gridCols[columns])}>
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
      {!externalPosts && pagination.hasMore && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={loadMore}>
            مطالب بیشتر
          </Button>
        </div>
      )}
    </div>
  );
}

export default PostGrid;
