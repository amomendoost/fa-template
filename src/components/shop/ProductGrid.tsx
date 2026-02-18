// ProductGrid - responsive grid of products + loading + empty state
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProducts } from '@/hooks/use-products';
import { ProductCard } from './ProductCard';
import type { Product, ProductFilterParams } from '@/lib/shop/types';

interface ProductGridProps {
  products?: Product[];
  category?: string;
  search?: string;
  sort?: string;
  minPrice?: number;
  maxPrice?: number;
  columns?: 2 | 3 | 4;
  onProductClick?: (product: Product) => void;
  className?: string;
}

const gridCols = {
  2: 'grid-cols-2',
  3: 'grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
};

export function ProductGrid({
  products: externalProducts,
  category,
  search,
  sort,
  minPrice,
  maxPrice,
  columns = 4,
  onProductClick,
  className,
}: ProductGridProps) {
  const params: ProductFilterParams | undefined =
    externalProducts === undefined ? { category, search, sort, min_price: minPrice, max_price: maxPrice } : undefined;
  const { products: fetchedProducts, isLoading, pagination, loadMore } = useProducts(params);

  const products = externalProducts ?? fetchedProducts;

  if (isLoading && products.length === 0) {
    return (
      <div className={cn('grid gap-5', gridCols[columns], className)}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-square w-full rounded-2xl" />
            <Skeleton className="h-3 w-16 rounded-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className={cn('flex flex-col items-center justify-center py-20 text-muted-foreground gap-3', className)}>
        <Package className="h-12 w-12 opacity-20" />
        <p className="text-sm">محصولی یافت نشد</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-8', className)}>
      <div className={cn('grid gap-5', gridCols[columns])}>
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onReadMore={onProductClick}
          />
        ))}
      </div>
      {!externalProducts && pagination.hasMore && (
        <div className="flex justify-center">
          <Button variant="outline" className="rounded-full px-8" onClick={loadMore}>
            نمایش بیشتر
          </Button>
        </div>
      )}
    </div>
  );
}

export default ProductGrid;
