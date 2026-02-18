// ProductCard - product card with image, name, price, add to cart
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Check } from 'lucide-react';
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
    <Card
      className={cn(
        'overflow-hidden transition-shadow hover:shadow-lg cursor-pointer group',
        className
      )}
      onClick={handleReadMore}
    >
      <div className="aspect-square bg-muted relative overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
            بدون تصویر
          </div>
        )}
        <WishlistButton productId={product.id} className="absolute top-2 left-2 bg-white/80 hover:bg-white" />
        {product.category && (
          <Badge variant="secondary" className="absolute top-2 right-2">
            {product.category}
          </Badge>
        )}
        {outOfStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white font-bold text-lg">ناموجود</span>
          </div>
        )}
      </div>
      <CardContent className="p-4 space-y-2">
        <h3 className="font-semibold text-sm line-clamp-2">{product.name}</h3>
        <PriceTag
          price={product.price}
          comparePrice={product.compare_price}
          currency={product.currency}
        />
        {showAddToCart && (
          <Button
            size="sm"
            className="w-full gap-2"
            disabled={outOfStock}
            onClick={(e) => {
              e.stopPropagation();
              handleAdd();
            }}
          >
            <ShoppingCart className="h-4 w-4" />
            {outOfStock ? 'ناموجود' : 'افزودن به سبد'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default ProductCard;
