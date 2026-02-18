// ProductDetail - full product page: gallery, description, variants, add to cart
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, Minus, Plus, ZoomIn } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProduct } from '@/hooks/use-product';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import { sanitizeHtml } from '@/lib/blog/sanitize';
import { PriceTag } from './PriceTag';
import { ImageLightbox } from './ImageLightbox';
import { WishlistButton } from './WishlistButton';
import { StarRating } from './StarRating';
import type { Product } from '@/lib/shop/types';

interface ProductDetailProps {
  slug?: string;
  product?: Product;
  onAddToCart?: (product: Product) => void;
  className?: string;
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

  if (isLoading) {
    return (
      <div className={cn('grid md:grid-cols-2 gap-8', className)}>
        <Skeleton className="aspect-square w-full rounded-lg" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-10 w-40" />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className={cn('text-center py-12 text-muted-foreground', className)}>
        {error || 'محصول یافت نشد'}
      </div>
    );
  }

  const outOfStock = product.stock <= 0;
  const images = product.images?.length ? product.images : [];
  const hasDescriptionHtml = /<\/?[a-z][\s\S]*>/i.test(product.description || '');
  const descriptionHtml = product.description
    ? hasDescriptionHtml
      ? sanitizeHtml(product.description)
      : product.description.replace(/\n/g, '<br />')
    : '';

  const handleAdd = () => {
    addItem(product, quantity, selectedVariant);
    onAddToCart?.(product);
    toast({
      title: 'به سبد خرید اضافه شد',
      description: `${quantity.toLocaleString('fa-IR')} عدد ${product.name}`,
    });
  };

  return (
    <div className={cn('grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] gap-8 lg:gap-10', className)}>
      {/* Image Gallery */}
      <div className="space-y-3">
        <div
          className="h-[260px] sm:h-[360px] lg:h-[500px] bg-muted/30 rounded-xl border overflow-hidden relative cursor-zoom-in group/img"
          onClick={() => images.length > 0 && setLightboxOpen(true)}
        >
          {images.length > 0 ? (
            <>
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-contain p-2 sm:p-4"
              />
              <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/10 transition-colors flex items-center justify-center">
                <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover/img:opacity-70 transition-opacity" />
              </div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              بدون تصویر
            </div>
          )}
        </div>
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedImage(i)}
                className={cn(
                  'w-16 h-16 sm:w-[4.5rem] sm:h-[4.5rem] rounded-md overflow-hidden border-2 shrink-0 transition-colors',
                  i === selectedImage ? 'border-primary' : 'border-transparent'
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

      {/* Info */}
      <div className="space-y-5 rounded-xl border bg-card p-5 sm:p-6 self-start lg:sticky lg:top-20">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h1 className="text-2xl font-bold">{product.name}</h1>
            <WishlistButton productId={product.id} />
          </div>
          <div className="flex items-center gap-2 mt-2">
            {product.category && (
              <Badge variant="secondary">{product.category}</Badge>
            )}
            {product.avg_rating != null && (
              <div className="flex items-center gap-1">
                <StarRating value={Math.round(product.avg_rating)} readonly size="sm" />
                <span className="text-xs text-muted-foreground">({product.review_count})</span>
              </div>
            )}
          </div>
        </div>

        <PriceTag
          price={product.price}
          comparePrice={product.compare_price}
          currency={product.currency}
          className="text-lg"
        />

        <Separator />

        {descriptionHtml && (
          <div
            className="prose prose-sm sm:prose-base max-w-none dark:prose-invert text-muted-foreground leading-7"
            dangerouslySetInnerHTML={{ __html: descriptionHtml }}
          />
        )}

        {/* Variants */}
        {product.variants && product.variants.length > 0 && (
          <div className="space-y-2">
            {product.variants.map((variant) => (
              <div key={variant.name}>
                <span className="text-sm font-medium">{variant.name}:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {variant.options.map((opt) => (
                    <Button
                      key={opt}
                      variant={selectedVariant === opt ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedVariant(opt)}
                    >
                      {opt}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quantity + Add */}
        <div className="flex items-center gap-4">
          <div className="flex items-center border rounded-md">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-10 text-center font-medium">{quantity}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10"
              onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <Button className="flex-1 gap-2" disabled={outOfStock} onClick={handleAdd}>
            <ShoppingCart className="h-4 w-4" />
            {outOfStock ? 'ناموجود' : 'افزودن به سبد خرید'}
          </Button>
        </div>

        {/* Stock info */}
        {product.stock > 0 && product.stock <= 5 && (
          <p className="text-sm text-orange-600">
            تنها {product.stock} عدد در انبار باقی مانده
          </p>
        )}

        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-2">
            {product.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
            ))}
          </div>
        )}

        {/* SKU */}
        {product.sku && (
          <p className="text-xs text-muted-foreground">
            کد محصول: {product.sku}
          </p>
        )}
      </div>
    </div>
  );
}

export default ProductDetail;
