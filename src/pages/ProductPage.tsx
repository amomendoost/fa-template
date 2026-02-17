// ProductPage - single product page with SEO, breadcrumb, sharing, related, reviews
import { useParams } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';
import { ProductDetail } from '@/components/shop/ProductDetail';
import { RelatedProducts } from '@/components/shop/RelatedProducts';
import { ProductReviews } from '@/components/shop/ProductReviews';
import { Breadcrumb } from '@/components/blog/Breadcrumb';
import { ShareBar } from '@/components/blog/ShareBar';
import { useProduct } from '@/hooks/use-product';

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const { product } = useProduct(slug);

  const pageUrl = typeof window !== 'undefined' ? window.location.href : '';
  const pageTitle = product?.seo_title || product?.name || 'محصول';
  const pageDesc = product?.seo_description || product?.description?.slice(0, 160) || '';

  const jsonLd = product ? {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images?.[0],
    sku: product.sku,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: product.currency || 'IRR',
      availability: product.stock > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
    ...(product.avg_rating != null && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.avg_rating,
        reviewCount: product.review_count,
      },
    }),
  } : null;

  const breadcrumbItems = [
    { label: 'خانه', href: '/' },
    { label: 'فروشگاه', href: '/shop' },
    ...(product?.category ? [{ label: product.category }] : []),
    { label: product?.name || '...' },
  ];

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {product && (
        <>
          <title>{pageTitle}</title>
          <meta name="description" content={pageDesc} />
          {product.meta_keywords?.length && (
            <meta name="keywords" content={product.meta_keywords.join(', ')} />
          )}
          <meta property="og:title" content={pageTitle} />
          <meta property="og:description" content={pageDesc} />
          <meta property="og:type" content="product" />
          <meta property="og:url" content={pageUrl} />
          {product.images?.[0] && <meta property="og:image" content={product.images[0]} />}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={pageTitle} />
          <meta name="twitter:description" content={pageDesc} />
          <link rel="canonical" href={pageUrl} />
          {jsonLd && (
            <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
          )}
        </>
      )}

      <div className="container mx-auto px-4 py-8 space-y-8">
        <Breadcrumb items={breadcrumbItems} />

        <ProductDetail slug={slug} />

        {product && (
          <ShareBar url={pageUrl} title={product.name} />
        )}

        <Separator />

        {slug && <RelatedProducts slug={slug} />}

        <Separator />

        {slug && <ProductReviews slug={slug} />}
      </div>
    </div>
  );
}
