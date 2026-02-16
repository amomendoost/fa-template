// WishlistButton - heart toggle for wishlist
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useWishlist } from '@/hooks/use-wishlist';

interface WishlistButtonProps {
  productId: string;
  className?: string;
}

export function WishlistButton({ productId, className }: WishlistButtonProps) {
  const { toggle, isInWishlist } = useWishlist();
  const active = isInWishlist(productId);

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn('h-8 w-8 rounded-full', className)}
      onClick={(e) => {
        e.stopPropagation();
        toggle(productId);
      }}
      title={active ? 'حذف از علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها'}
    >
      <Heart
        className={cn(
          'h-4 w-4 transition-colors',
          active ? 'fill-red-500 text-red-500' : 'text-muted-foreground'
        )}
      />
    </Button>
  );
}

export default WishlistButton;
