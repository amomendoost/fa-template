// PriceRangeFilter - min/max price inputs (horizontal or vertical)
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PriceRangeFilterProps {
  minPrice?: number;
  maxPrice?: number;
  onChange: (range: { min?: number; max?: number }) => void;
  layout?: 'horizontal' | 'vertical';
  className?: string;
}

export function PriceRangeFilter({ minPrice, maxPrice, onChange, layout = 'horizontal', className }: PriceRangeFilterProps) {
  const [min, setMin] = useState(minPrice?.toString() || '');
  const [max, setMax] = useState(maxPrice?.toString() || '');

  const handleApply = () => {
    onChange({
      min: min ? Number(min) : undefined,
      max: max ? Number(max) : undefined,
    });
  };

  const handleClear = () => {
    setMin('');
    setMax('');
    onChange({ min: undefined, max: undefined });
  };

  const hasFilter = minPrice !== undefined || maxPrice !== undefined;

  if (layout === 'vertical') {
    return (
      <div className={cn('space-y-3', className)}>
        <div className="space-y-2">
          <Input
            type="number"
            placeholder="از (تومان)"
            value={min}
            onChange={(e) => setMin(e.target.value)}
            className="h-9 rounded-xl text-sm"
            dir="ltr"
          />
          <Input
            type="number"
            placeholder="تا (تومان)"
            value={max}
            onChange={(e) => setMax(e.target.value)}
            className="h-9 rounded-xl text-sm"
            dir="ltr"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" className="h-8 rounded-full flex-1" onClick={handleApply}>
            اعمال
          </Button>
          {hasFilter && (
            <Button size="sm" variant="ghost" className="h-8 rounded-full" onClick={handleClear}>
              حذف
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-3 flex-wrap', className)}>
      <span className="text-sm text-muted-foreground shrink-0">محدوده قیمت:</span>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          placeholder="از"
          value={min}
          onChange={(e) => setMin(e.target.value)}
          className="w-28 h-9 rounded-xl text-sm"
          dir="ltr"
        />
        <span className="text-muted-foreground/40">—</span>
        <Input
          type="number"
          placeholder="تا"
          value={max}
          onChange={(e) => setMax(e.target.value)}
          className="w-28 h-9 rounded-xl text-sm"
          dir="ltr"
        />
        <span className="text-xs text-muted-foreground">تومان</span>
      </div>
      <Button size="sm" className="h-9 rounded-full" onClick={handleApply}>
        اعمال
      </Button>
      {hasFilter && (
        <button onClick={handleClear} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
          حذف
        </button>
      )}
    </div>
  );
}

export default PriceRangeFilter;
