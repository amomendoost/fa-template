// ProductPage - single product page with SEO, breadcrumb, related products
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { ProductDetail } from '@/components/shop/ProductDetail';
import { RelatedProducts } from '@/components/shop/RelatedProducts';
import { CartDrawer } from '@/components/shop/CartDrawer';
import { Breadcrumb } from '@/components/blog/Breadcrumb';
import { BlogHeader } from '@/components/blog/BlogHeader';
import { useProduct } from '@/hooks/use-product';
import { useCart } from '@/hooks/use-cart';

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { product } = useProduct(slug);
  const { count } = useCart();
  const [cartOpen, setCartOpen] = useState(false);

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

      <BlogHeader />

      <main className="container mx-auto px-4 py-8 lg:py-12">
        <div className="flex items-center justify-between gap-4 mb-10">
          <Breadcrumb items={breadcrumbItems} />
          <Button variant="ghost" size="sm" className="gap-2 relative shrink-0" onClick={() => setCartOpen(true)}>
            <ShoppingCart className="h-4 w-4" />
            {count > 0 && (
              <span className="absolute -top-1 -left-1 bg-foreground text-background text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                {count}
              </span>
            )}
          </Button>
        </div>

        <div className="space-y-16">
          <ProductDetail
            slug={slug}
            onAddToCart={() => setCartOpen(true)}
          />

          {slug && <RelatedProducts slug={slug} />}
        </div>
      </main>

      {/* Extra bottom padding for mobile sticky bar */}
      <div className="h-20 lg:hidden" />

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={() => {
          setCartOpen(false);
          navigate('/checkout');
        }}
      />
    </div>
  );
}
