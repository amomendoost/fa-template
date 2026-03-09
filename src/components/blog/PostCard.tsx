// PostCard - blog post card with cover, title, excerpt, date, category
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BlogPost } from '@/lib/blog/types';

interface PostCardProps {
  post: BlogPost;
  showExcerpt?: boolean;
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

export function PostCard({ post, showExcerpt = true, className }: PostCardProps) {
  const href = post.slug ? `/blog/${post.slug}` : '/blog';

  return (
    <Link to={href} className="block">
      <Card
        className={cn(
          'overflow-hidden transition-shadow hover:shadow-lg cursor-pointer group',
          className
        )}
      >
        {post.cover_image && (
          <div className="aspect-video bg-muted overflow-hidden">
            <img
              src={post.cover_image}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            {post.category && <Badge variant="secondary">{post.category}</Badge>}
            {post.published_at && (
              <span className="text-xs text-muted-foreground">{formatDate(post.published_at)}</span>
            )}
          </div>
          <h3 className="font-bold text-lg line-clamp-2 group-hover:text-primary transition-colors">
            {post.title}
          </h3>
          {showExcerpt && post.excerpt && (
            <p className="text-sm text-muted-foreground line-clamp-3 leading-6">
              {post.excerpt}
            </p>
          )}
          <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
            {post.reading_time && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {post.reading_time} دقیقه
              </span>
            )}
            {post.views > 0 && (
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {post.views.toLocaleString('fa-IR')}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default PostCard;
