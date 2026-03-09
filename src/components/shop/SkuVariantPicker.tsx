// SkuVariantPicker - advanced variant selector with SKU-level price/stock/image
import { useState, useMemo, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { PriceTag } from './PriceTag';
import type { Product, ProductSku } from '@/lib/shop/types';

interface SkuVariantPickerProps {
  product: Product;
  onSkuChange?: (sku: ProductSku | null, variantChoice: Record<string, string>) => void;
  className?: string;
}

export function SkuVariantPicker({ product, onSkuChange, className }: SkuVariantPickerProps) {
  const skus = product.skus;

  // Extract variant axes from SKUs (e.g. { "Color": ["Red", "Blue"], "Size": ["S", "M", "L"] })
  const axes = useMemo(() => {
    if (!skus?.length) return {};
    const map: Record<string, Set<string>> = {};
    for (const sku of skus) {
      if (!sku.variant_combination) continue;
      for (const [key, value] of Object.entries(sku.variant_combination)) {
        if (!map[key]) map[key] = new Set();
        map[key].add(value);
      }
    }
    const result: Record<string, string[]> = {};
    for (const [key, values] of Object.entries(map)) {
      result[key] = [...values];
    }
    return result;
  }, [skus]);

  const axisNames = Object.keys(axes);

  const [selected, setSelected] = useState<Record<string, string>>(() => {
    // Default to first option of each axis
    const init: Record<string, string> = {};
    for (const [key, options] of Object.entries(axes)) {
      if (options.length > 0) init[key] = options[0];
    }
    return init;
  });

  // Find the matching SKU for current selection
  const matchedSku = useMemo(() => {
    if (!skus?.length || axisNames.length === 0) return null;
    return skus.find((sku) => {
      if (!sku.variant_combination || !sku.is_active) return false;
      return axisNames.every((axis) => sku.variant_combination[axis] === selected[axis]);
    }) || null;
  }, [skus, selected, axisNames]);

  useEffect(() => {
    onSkuChange?.(matchedSku, selected);
  }, [matchedSku, selected, onSkuChange]);

  // Check if an option is available (has at least one active SKU in stock)
  const isOptionAvailable = (axis: string, option: string): boolean => {
    if (!skus?.length) return true;
    return skus.some((sku) => {
      if (!sku.variant_combination || !sku.is_active) return false;
      if (sku.variant_combination[axis] !== option) return false;
      // Check other axes match current selection
      return axisNames.every((a) => a === axis || sku.variant_combination[a] === selected[a]);
    });
  };

  if (!skus?.length || axisNames.length === 0) return null;

  return (
    <div className={cn('space-y-4', className)}>
      {axisNames.map((axis) => (
        <div key={axis} className="space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{axis}</span>
            {selected[axis] && (
              <span className="text-sm font-medium">{selected[axis]}</span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {axes[axis].map((option) => {
              const available = isOptionAvailable(axis, option);
              const isSelected = selected[axis] === option;
              return (
                <button
                  key={option}
                  onClick={() => {
                    if (!available) return;
                    setSelected((prev) => ({ ...prev, [axis]: option }));
                  }}
                  disabled={!available}
                  className={cn(
                    'h-10 px-5 rounded-full text-sm transition-all',
                    isSelected
                      ? 'bg-foreground text-background font-medium'
                      : available
                        ? 'bg-muted/60 text-foreground hover:bg-muted'
                        : 'bg-muted/30 text-muted-foreground/50 line-through cursor-not-allowed'
                  )}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* SKU-specific info */}
      {matchedSku && (
        <div className="flex items-center gap-4 pt-1">
          <PriceTag
            price={matchedSku.price}
            comparePrice={matchedSku.compare_price}
            currency={product.currency}
            className="text-lg"
          />
          {matchedSku.stock <= 0 ? (
            <span className="text-sm text-destructive">ناموجود</span>
          ) : matchedSku.stock <= 5 ? (
            <span className="text-sm text-muted-foreground">
              فقط {matchedSku.stock.toLocaleString('fa-IR')} عدد
            </span>
          ) : null}
        </div>
      )}
    </div>
  );
}

export default SkuVariantPicker;
