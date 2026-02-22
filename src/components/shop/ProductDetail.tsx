// ProductDetail - full product page: gallery, description, variants, add to cart
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingCart, Minus, Plus, ZoomIn, Package, ChevronLeft, ChevronRight, Share2, Copy, Check, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProduct } from '@/hooks/use-product';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import { sanitizeHtml } from '@/lib/blog/sanitize';
import { getProductImageUrls } from '@/lib/shop/images';
import { PriceTag } from './PriceTag';
import { ImageLightbox } from './ImageLightbox';
import { WishlistButton } from './WishlistButton';
import { StarRating } from './StarRating';
import { ProductReviews } from './ProductReviews';
import type { Product } from '@/lib/shop/types';

interface ProductDetailProps {
  slug?: string;
  product?: Product;
  onAddToCart?: (product: Product) => void;
  className?: string;
}

function buildSpecs(product: Product) {
  const specs: { label: string; value: string }[] = [];
  if (product.sku) specs.push({ label: 'کد محصول', value: product.sku });
  if (product.category) specs.push({ label: 'دسته‌بندی', value: product.category });
  if (product.weight) specs.push({ label: 'وزن', value: `${product.weight.toLocaleString('fa-IR')} گرم` });
  if (product.dimensions) {
    const d = product.dimensions as Record<string, number>;
    if (d.width && d.height) {
      const parts = [d.width, d.height, d.depth].filter(Boolean);
      specs.push({ label: 'ابعاد', value: parts.map(v => v!.toLocaleString('fa-IR')).join(' × ') + ' سانتی‌متر' });
    }
  }
  if (product.stock > 0) specs.push({ label: 'موجودی', value: product.stock <= 5 ? `${product.stock.toLocaleString('fa-IR')} عدد` : 'موجود' });
  return specs;
}

function MiniShareBar({ productName }: { productName: string }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== 'undefined' ? window.location.href : '';
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(productName);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const input = document.createElement('input');
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-1">
      <a
        href={`https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        title="تلگرام"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
        </svg>
      </a>
      <a
        href={`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        title="واتساپ"
      >
        <MessageCircle className="h-4 w-4" />
      </a>
      <button
        onClick={copyLink}
        className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        title={copied ? 'کپی شد' : 'کپی لینک'}
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}

export function ProductDetail({ slug, product: externalProduct, onAddToCart, className }: ProductDetailProps) {
  const { product: fetchedProduct, isLoading, error } = useProduct(externalProduct ? undefined : slug);
  const product = externalProduct ?? fetchedProduct;
  const { addItem } = useCart();
  const { toast } = useToast();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<string | undefined>();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [imgFading, setImgFading] = useState(false);
  const purchaseRef = useRef<HTMLDivElement>(null);
  const [showStickyBar, setShowStickyBar] = useState(false);

  // Observe purchase section visibility for sticky mobile bar
  useEffect(() => {
    if (!purchaseRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(purchaseRef.current);
    return () => observer.disconnect();
  }, [product]);

  if (isLoading) {
    return (
      <div className={cn('space-y-10', className)}>
        <div className="grid lg:grid-cols-[1fr_0.85fr] gap-8 lg:gap-16">
          <Skeleton className="aspect-square w-full rounded-3xl" />
          <div className="space-y-6 py-2">
            <Skeleton className="h-4 w-20 rounded-full" />
            <Skeleton className="h-9 w-3/4" />
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-px w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-14 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className={cn('text-center py-20 text-muted-foreground', className)}>
        {error || 'محصول یافت نشد'}
      </div>
    );
  }

  const outOfStock = product.stock <= 0;
  const images = getProductImageUrls(product.images);
  const hasDescriptionHtml = /<\/?[a-z][\s\S]*>/i.test(product.description || '');
  const descriptionHtml = product.description
    ? hasDescriptionHtml
      ? sanitizeHtml(product.description)
      : product.description.replace(/\n/g, '<br />')
    : '';
  const hasDiscount = product.compare_price && product.compare_price > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.compare_price! - product.price) / product.compare_price!) * 100)
    : 0;
  const specs = buildSpecs(product);

  const handleAdd = () => {
    addItem(product, quantity, selectedVariant);
    onAddToCart?.(product);
    toast({
      title: 'به سبد خرید اضافه شد',
      description: `${quantity.toLocaleString('fa-IR')} عدد ${product.name}`,
    });
  };

  const changeImage = (next: number) => {
    if (next === selectedImage) return;
    setImgFading(true);
    setTimeout(() => {
      setSelectedImage(next);
      setImgFading(false);
    }, 150);
  };

  const prevImage = () => changeImage(selectedImage > 0 ? selectedImage - 1 : images.length - 1);
  const nextImage = () => changeImage(selectedImage < images.length - 1 ? selectedImage + 1 : 0);

  const tabTriggerClass = 'rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-5 pb-3 pt-2 text-sm';

  return (
    <>
      <div className={cn('space-y-12', className)}>
        {/* Top: Gallery + Purchase */}
        <div className="grid lg:grid-cols-[1fr_0.85fr] gap-8 lg:gap-16">
          {/* Gallery */}
          <div className="space-y-4">
            <div
              className="aspect-square rounded-3xl bg-muted/30 overflow-hidden relative group/img cursor-zoom-in"
              onClick={() => images.length > 0 && setLightboxOpen(true)}
            >
              {images.length > 0 ? (
                <img
                  src={images[selectedImage]}
                  alt={product.name}
                  className={cn(
                    'w-full h-full object-contain p-8 sm:p-12 transition-all duration-300 group-hover/img:scale-[1.03]',
                    imgFading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                  )}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="h-16 w-16 text-muted-foreground/15" />
                </div>
              )}

              {images.length > 0 && (
                <div className="absolute bottom-4 left-4 bg-background/80 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs text-muted-foreground opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center gap-1.5">
                  <ZoomIn className="h-3.5 w-3.5" />
                  بزرگ‌نمایی
                </div>
              )}

              {hasDiscount && (
                <div className="absolute top-4 right-4 bg-red-500 text-white text-sm font-bold rounded-full px-3 py-1">
                  {discountPercent}%−
                </div>
              )}

              {images.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); nextImage(); }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity hover:bg-background"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); prevImage(); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity hover:bg-background"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </>
              )}

              {/* Image dots indicator (mobile) */}
              {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 lg:hidden">
                  {images.map((_, i) => (
                    <span
                      key={i}
                      className={cn(
                        'h-1.5 rounded-full transition-all',
                        i === selectedImage ? 'w-4 bg-foreground' : 'w-1.5 bg-foreground/30'
                      )}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Thumbnails (desktop) */}
            {images.length > 1 && (
              <div className="hidden lg:flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => changeImage(i)}
                    className={cn(
                      'w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all',
                      i === selectedImage
                        ? 'border-foreground opacity-100'
                        : 'border-transparent opacity-50 hover:opacity-80'
                    )}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            <ImageLightbox
              images={images}
              currentIndex={selectedImage}
              open={lightboxOpen}
              onOpenChange={setLightboxOpen}
              onIndexChange={setSelectedImage}
            />
          </div>

          {/* Purchase Info */}
          <div className="flex flex-col gap-6 py-2">
            {/* Category + share */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {product.category && (
                  <span className="text-sm text-muted-foreground">{product.category}</span>
                )}
                {product.category && product.avg_rating != null && (
                  <span className="text-muted-foreground/30">|</span>
                )}
                {product.avg_rating != null && (
                  <div className="flex items-center gap-1.5">
                    <StarRating value={Math.round(product.avg_rating)} readonly size="sm" />
                    <span className="text-xs text-muted-foreground">({product.review_count})</span>
                  </div>
                )}
              </div>
              <MiniShareBar productName={product.name} />
            </div>

            {/* Title + Wishlist */}
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-2xl sm:text-[1.75rem] font-bold leading-snug">{product.name}</h1>
              <WishlistButton productId={product.id} />
            </div>

            {/* Price */}
            <PriceTag
              price={product.price}
              comparePrice={product.compare_price}
              currency={product.currency}
              className="text-2xl"
            />

            {/* Stock */}
            <div className="flex items-center gap-1.5 text-sm">
              {product.stock > 0 ? (
                <>
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-muted-foreground">
                    {product.stock <= 5
                      ? `فقط ${product.stock.toLocaleString('fa-IR')} عدد باقی مانده`
                      : 'موجود در انبار'}
                  </span>
                </>
              ) : (
                <>
                  <span className="h-2 w-2 rounded-full bg-red-400" />
                  <span className="text-muted-foreground">ناموجود</span>
                </>
              )}
            </div>

            <Separator />

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-4">
                {product.variants.map((variant) => (
                  <div key={variant.name} className="space-y-2.5">
                    <span className="text-sm text-muted-foreground">{variant.name}</span>
                    <div className="flex flex-wrap gap-2">
                      {variant.options.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => setSelectedVariant(opt)}
                          className={cn(
                            'h-10 px-5 rounded-full text-sm transition-all',
                            selectedVariant === opt
                              ? 'bg-foreground text-background font-medium'
                              : 'bg-muted/60 text-foreground hover:bg-muted'
                          )}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                <Separator />
              </div>
            )}

            {/* Quantity + Add */}
            <div ref={purchaseRef} className="flex items-center gap-3">
              <div className="flex items-center h-12 rounded-full bg-muted/60">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-12 w-12 rounded-full hover:bg-muted"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center font-semibold tabular-nums select-none">
                  {quantity.toLocaleString('fa-IR')}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-12 w-12 rounded-full hover:bg-muted"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <Button
                className="flex-1 h-12 gap-2 font-semibold rounded-full text-[15px]"
                disabled={outOfStock}
                onClick={handleAdd}
              >
                <ShoppingCart className="h-4 w-4" />
                {outOfStock ? 'ناموجود' : 'افزودن به سبد خرید'}
              </Button>
            </div>

            {/* Quick specs preview */}
            {specs.length > 0 && (
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 pt-2 text-sm">
                {specs.slice(0, 4).map((s) => (
                  <div key={s.label} className="flex flex-col gap-0.5">
                    <span className="text-muted-foreground text-xs">{s.label}</span>
                    <span className="font-medium">{s.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bottom: Tabs */}
        <Tabs defaultValue="description" dir="rtl">
          <TabsList className="w-full justify-start bg-transparent border-b rounded-none p-0 h-auto gap-0">
            {descriptionHtml && (
              <TabsTrigger value="description" className={tabTriggerClass}>
                توضیحات
              </TabsTrigger>
            )}
            {specs.length > 0 && (
              <TabsTrigger value="specs" className={tabTriggerClass}>
                مشخصات
              </TabsTrigger>
            )}
            {product.tags && product.tags.length > 0 && (
              <TabsTrigger value="tags" className={tabTriggerClass}>
                برچسب‌ها
              </TabsTrigger>
            )}
            {slug && (
              <TabsTrigger value="reviews" className={tabTriggerClass}>
                نظرات{product.review_count ? ` (${product.review_count.toLocaleString('fa-IR')})` : ''}
              </TabsTrigger>
            )}
          </TabsList>

          {descriptionHtml && (
            <TabsContent value="description" className="pt-6">
              <div
                className="prose prose-sm sm:prose-base max-w-none text-muted-foreground leading-8"
                dangerouslySetInnerHTML={{ __html: descriptionHtml }}
              />
            </TabsContent>
          )}

          {specs.length > 0 && (
            <TabsContent value="specs" className="pt-6">
              <div className="max-w-lg">
                {specs.map((s, i) => (
                  <div
                    key={s.label}
                    className={cn(
                      'flex items-center justify-between py-3.5 text-sm',
                      i < specs.length - 1 && 'border-b border-border/50'
                    )}
                  >
                    <span className="text-muted-foreground">{s.label}</span>
                    <span className="font-medium">{s.value}</span>
                  </div>
                ))}
              </div>
            </TabsContent>
          )}

          {product.tags && product.tags.length > 0 && (
            <TabsContent value="tags" className="pt-6">
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-sm font-normal px-3.5 py-1.5 rounded-full">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </TabsContent>
          )}

          {slug && (
            <TabsContent value="reviews" className="pt-6">
              <ProductReviews slug={slug} />
            </TabsContent>
          )}
        </Tabs>
      </div>

      {/* Mobile sticky bottom bar */}
      <div
        className={cn(
          'fixed bottom-0 inset-x-0 z-50 lg:hidden bg-background/95 backdrop-blur-md border-t px-4 py-3 transition-transform duration-300',
          showStickyBar && !outOfStock ? 'translate-y-0' : 'translate-y-full'
        )}
      >
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <div className="flex flex-col items-start">
            <PriceTag
              price={product.price}
              comparePrice={product.compare_price}
              currency={product.currency}
              className="text-base"
            />
          </div>
          <Button
            className="flex-1 h-11 gap-2 font-semibold rounded-full"
            onClick={handleAdd}
          >
            <ShoppingCart className="h-4 w-4" />
            افزودن به سبد
          </Button>
        </div>
      </div>
    </>
  );
}

export default ProductDetail;
