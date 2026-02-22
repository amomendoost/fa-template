// BlogPostPage - single post with SEO, TOC, reading progress, related posts
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowRight } from 'lucide-react';
import { BlogHeader } from '@/components/blog/BlogHeader';
import { Breadcrumb } from '@/components/blog/Breadcrumb';
import { ReadingProgress } from '@/components/blog/ReadingProgress';
import { TableOfContents } from '@/components/blog/TableOfContents';
import { PostDetail } from '@/components/blog/PostDetail';
import { ShareBar } from '@/components/blog/ShareBar';
import { CommentSection } from '@/components/blog/CommentSection';
import { RelatedPosts } from '@/components/blog/RelatedPosts';
import { useBlogPost } from '@/hooks/use-blog-post';
import { useTableOfContents } from '@/hooks/use-table-of-contents';
import { processContent } from '@/lib/blog/sanitize';

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { post, comments } = useBlogPost(slug);

  const processedContent = post?.content ? processContent(post.content) : '';
  const { headings, activeId } = useTableOfContents(processedContent);

  const breadcrumbItems = [
    { label: 'خانه', href: '/' },
    { label: 'بلاگ', href: '/blog' },
    ...(post?.category ? [{ label: post.category, href: `/blog?category=${encodeURIComponent(post.category)}` }] : []),
    ...(post ? [{ label: post.title }] : []),
  ];

  const pageUrl = typeof window !== 'undefined' ? window.location.href : '';

  const jsonLd = post
    ? {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.seo_title || post.title,
        description: post.seo_description || post.excerpt || '',
        image: post.cover_image || '',
        datePublished: post.published_at || post.created_at || '',
        url: pageUrl,
        ...(post.reading_time ? { timeRequired: `PT${post.reading_time}M` } : {}),
        ...(post.meta_keywords?.length ? { keywords: post.meta_keywords.join(', ') } : {}),
      }
    : null;

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <ReadingProgress />

      {post && (
        <>
          <title>{post.seo_title || post.title}</title>
          <meta name="description" content={post.seo_description || post.excerpt || ''} />
          {post.meta_keywords?.length && (
            <meta name="keywords" content={post.meta_keywords.join(', ')} />
          )}
          <meta property="og:type" content="article" />
          <meta property="og:title" content={post.seo_title || post.title} />
          <meta property="og:description" content={post.seo_description || post.excerpt || ''} />
          {post.cover_image && <meta property="og:image" content={post.cover_image} />}
          <meta property="og:url" content={pageUrl} />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={post.seo_title || post.title} />
          <meta name="twitter:description" content={post.seo_description || post.excerpt || ''} />
          {post.cover_image && <meta name="twitter:image" content={post.cover_image} />}
          <link rel="canonical" href={pageUrl} />
          {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
        </>
      )}

      <BlogHeader />

      <div className="container mx-auto max-w-7xl px-4 py-6">
        <div className="space-y-4 mb-6">
          <Breadcrumb items={breadcrumbItems} />
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5"
            onClick={() => navigate('/blog')}
          >
            <ArrowRight className="h-4 w-4" />
            بازگشت به بلاگ
          </Button>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]" dir="ltr">
          <div className="min-w-0 space-y-8" dir="rtl">
            <PostDetail slug={slug} />

            {post && (
              <>
                <ShareBar url={pageUrl} title={post.title} />
                <Separator />
                <RelatedPosts slug={slug!} />
                <Separator />
                <CommentSection postId={post.id} comments={comments} />
              </>
            )}
          </div>

          {post && (
            <aside className="hidden lg:block" dir="rtl">
              <div className="sticky top-20 space-y-3">
                {headings.length > 0 ? (
                  <TableOfContents headings={headings} activeId={activeId} />
                ) : (
                  <div className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">
                    برای نمایش فهرست مطالب، در محتوای بلاگ از هدینگ‌های `h2` تا `h4` استفاده کنید.
                  </div>
                )}
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
