// PriceTag - displays price with optional discount
import { cn } from '@/lib/utils';

interface PriceTagProps {
  price: number;
  comparePrice?: number;
  currency?: string;
  className?: string;
}

function formatPrice(amount: number, currency = 'IRR'): string {
  if (currency === 'IRR') {
    return new Intl.NumberFormat('fa-IR').format(Math.floor(amount / 10)) + ' تومان';
  }
  if (currency === 'IRT') {
    return new Intl.NumberFormat('fa-IR').format(amount) + ' تومان';
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

export function PriceTag({ price, comparePrice, currency = 'IRR', className }: PriceTagProps) {
  const hasDiscount = comparePrice && comparePrice > price;
  const discountPercent = hasDiscount
    ? Math.round(((comparePrice - price) / comparePrice) * 100)
    : 0;

  return (
    <div className={cn('flex items-center gap-2 flex-wrap', className)}>
      <span className="font-bold text-foreground">{formatPrice(price, currency)}</span>
      {hasDiscount && (
        <>
          <span className="text-sm text-muted-foreground line-through">
            {formatPrice(comparePrice, currency)}
          </span>
          <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-medium">
            {discountPercent}%-
          </span>
        </>
      )}
    </div>
  );
}

export default PriceTag;
