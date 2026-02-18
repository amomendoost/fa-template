// RelatedProducts - horizontal scroll carousel with snap
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    getRelatedProducts(slug)
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setIsLoading(false));
  }, [slug]);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [products]);

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.7;
    el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className={cn('space-y-4', className)}>
        <h2 className="text-xl font-bold">محصولات مرتبط</h2>
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="w-[220px] aspect-[3/4] rounded-xl shrink-0" />
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) return null;

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">محصولات مرتبط</h2>
        <div className="hidden sm:flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            disabled={!canScrollLeft}
            onClick={() => scroll('left')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            disabled={!canScrollRight}
            onClick={() => scroll('right')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2 -mx-4 px-4 scrollbar-none"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {products.map((product) => (
          <div key={product.id} className="w-[200px] sm:w-[220px] shrink-0 snap-start">
            <ProductCard
              product={product}
              onReadMore={(p) => navigate(`/shop/${p.slug}`)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default RelatedProducts;
