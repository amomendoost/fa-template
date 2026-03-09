// PostDetail - full post page: cover, title, content (HTML), metadata
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Eye, Clock, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBlogPost } from '@/hooks/use-blog-post';
import { processContent } from '@/lib/blog/sanitize';
import type { BlogPost } from '@/lib/blog/types';

interface PostDetailProps {
  slug?: string;
  post?: BlogPost;
  className?: string;
}

function formatDate(date?: string): string {
  if (!date) return '';
  return new Date(date).toLocaleDateString('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function PostDetail({ slug, post: externalPost, className }: PostDetailProps) {
  const navigate = useNavigate();
  const { post: fetchedPost, isLoading, error } = useBlogPost(externalPost ? undefined : slug);
  const post = externalPost ?? fetchedPost;

  if (isLoading) {
    return (
      <div className={cn('space-y-6 max-w-3xl mx-auto', className)}>
        <Skeleton className="aspect-video w-full rounded-lg" />
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className={cn('text-center py-12 text-muted-foreground', className)}>
        {error || 'مطلب یافت نشد'}
      </div>
    );
  }

  const safeContent = post.content ? processContent(post.content) : '';

  // Add lazy loading to images in content
  const lazyContent = safeContent.replace(
    /<img /gi,
    '<img loading="lazy" '
  );

  return (
    <article className={cn('space-y-6', className)}>
      {post.cover_image && (
        <div className="rounded-xl border bg-muted/30 overflow-hidden">
          <img
            src={post.cover_image}
            alt={post.title}
            className="w-full h-[220px] sm:h-[320px] lg:h-[420px] object-contain bg-background/80"
            loading="lazy"
          />
        </div>
      )}

      <div className="space-y-3">
        {post.category && <Badge variant="secondary">{post.category}</Badge>}
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight">{post.title}</h1>

        <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
          {post.published_at && (
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formatDate(post.published_at)}
            </span>
          )}
          {post.reading_time && (
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {post.reading_time} دقیقه مطالعه
            </span>
          )}
          {post.views > 0 && (
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {post.views.toLocaleString('fa-IR')} بازدید
            </span>
          )}
        </div>
      </div>

      <Separator />

      {/* Render sanitized HTML content */}
      <div
        className="prose prose-lg max-w-none leading-8 prose-img:mx-auto prose-img:rounded-lg prose-pre:rounded-lg"
        dangerouslySetInnerHTML={{ __html: lazyContent }}
      />

      {/* Clickable Tags */}
      {post.tags && post.tags.length > 0 && (
        <>
          <Separator />
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="cursor-pointer hover:bg-primary/10 transition-colors"
                onClick={() => navigate(`/blog?tag=${encodeURIComponent(tag)}`)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </>
      )}
    </article>
  );
}

export default PostDetail;
