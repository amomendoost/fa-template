// useProduct Hook - single product by slug

import { useState, useEffect } from 'react';
import { getProduct } from '@/lib/shop/service';
import type { Product } from '@/lib/shop/types';

export function useProduct(slug: string | undefined) {
  const [result, setResult] = useState<{
    slug?: string;
    product: Product | null;
    error: string | null;
  }>({
    product: null,
    error: null,
  });

  useEffect(() => {
    if (!slug) return;

    let cancelled = false;

    getProduct(slug)
      .then((data) => {
        if (!cancelled) {
          setResult({
            slug,
            product: data,
            error: null,
          });
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setResult({
            slug,
            product: null,
            error: err instanceof Error ? err.message : 'خطا در بارگذاری محصول',
          });
        }
      });

    return () => { cancelled = true; };
  }, [slug]);

  const product = result.slug === slug ? result.product : null;
  const error = result.slug === slug ? result.error : null;
  const isLoading = Boolean(slug) && result.slug !== slug;

  return { product, isLoading, error };
}

export default useProduct;
