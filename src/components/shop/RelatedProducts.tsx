// RelatedProducts - shows related products grid
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { getRelatedProducts } from '@/lib/shop/service';
import { ProductCard } from './ProductCard';
import type { Product } from '@/lib/shop/types';

interface RelatedProductsProps {
  slug: string;
  className?: string;
}

export function RelatedProducts({ slug, className }: RelatedProductsProps) {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    getRelatedProducts(slug)
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setIsLoading(false));
  }, [slug]);

  if (isLoading) {
    return (
      <div className={cn('space-y-4', className)}>
        <h2 className="text-xl font-bold">محصولات مرتبط</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) return null;

  return (
    <div className={cn('space-y-4', className)}>
      <h2 className="text-xl font-bold">محصولات مرتبط</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onReadMore={(p) => navigate(`/shop/${p.slug}`)}
          />
        ))}
      </div>
    </div>
  );
}

export default RelatedProducts;
