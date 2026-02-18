// ProductCard - product card with image, name, price, add to cart
import { Button } from '@/components/ui/button';
import { ShoppingCart, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import { PriceTag } from './PriceTag';
import { WishlistButton } from './WishlistButton';
import type { Product } from '@/lib/shop/types';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onReadMore?: (product: Product) => void;
  showAddToCart?: boolean;
  className?: string;
}

export function ProductCard({
  product,
  onAddToCart,
  onReadMore,
  showAddToCart = true,
  className,
}: ProductCardProps) {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { toast } = useToast();
  const image = product.images?.[0];
  const outOfStock = product.stock <= 0;
  const hasDiscount = product.compare_price && product.compare_price > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.compare_price! - product.price) / product.compare_price!) * 100)
    : 0;

  const handleAdd = () => {
    addItem(product);
    onAddToCart?.(product);
    toast({
      title: 'به سبد اضافه شد',
      description: product.name,
    });
  };

  const handleReadMore = () => {
    if (onReadMore) {
      onReadMore(product);
      return;
    }
    if (product.slug) {
      navigate(`/shop/${encodeURIComponent(product.slug)}`);
      return;
    }
    navigate('/shop');
  };

  return (
    <div
      className={cn('group cursor-pointer', className)}
      onClick={handleReadMore}
    >
      {/* Image */}
      <div className={cn(
        'aspect-square rounded-2xl bg-muted/30 overflow-hidden relative mb-3',
        outOfStock && 'grayscale opacity-70'
      )}>
        {image ? (
          <img
            src={image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="h-10 w-10 text-muted-foreground/15" />
          </div>
        )}

        {/* Overlays */}
        <WishlistButton
          productId={product.id}
          className="absolute top-2.5 left-2.5 bg-background/80 backdrop-blur-sm hover:bg-background h-8 w-8"
        />

        {hasDiscount && !outOfStock && (
          <div className="absolute top-2.5 right-2.5 bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5">
            {discountPercent}%−
          </div>
        )}

        {outOfStock && (
          <div className="absolute bottom-2.5 right-2.5 bg-background/90 backdrop-blur-sm text-xs font-medium text-muted-foreground px-2.5 py-1 rounded-full">
            ناموجود
          </div>
        )}

        {/* Quick add on hover */}
        {showAddToCart && !outOfStock && (
          <div className="absolute bottom-0 inset-x-0 p-2.5 translate-y-full group-hover:translate-y-0 transition-transform duration-200">
            <Button
              size="sm"
              className="w-full gap-2 rounded-xl h-9 text-xs font-medium backdrop-blur-sm"
              onClick={(e) => {
                e.stopPropagation();
                handleAdd();
              }}
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              افزودن به سبد
            </Button>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="space-y-1.5 px-0.5">
        {product.category && (
          <span className="text-[11px] text-muted-foreground">{product.category}</span>
        )}
        <h3 className="text-sm font-medium line-clamp-2 leading-snug group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        <PriceTag
          price={product.price}
          comparePrice={product.compare_price}
          currency={product.currency}
          className="text-sm"
        />
      </div>
    </div>
  );
}

export default ProductCard;
