// PriceRangeFilter - min/max price inputs
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PriceRangeFilterProps {
  minPrice?: number;
  maxPrice?: number;
  onChange: (range: { min?: number; max?: number }) => void;
  className?: string;
}

export function PriceRangeFilter({ minPrice, maxPrice, onChange, className }: PriceRangeFilterProps) {
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

  return (
    <div className={cn('flex items-end gap-2 flex-wrap', className)}>
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">از (تومان)</Label>
        <Input
          type="number"
          placeholder="حداقل"
          value={min}
          onChange={(e) => setMin(e.target.value)}
          className="w-28 h-9"
          dir="ltr"
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">تا (تومان)</Label>
        <Input
          type="number"
          placeholder="حداکثر"
          value={max}
          onChange={(e) => setMax(e.target.value)}
          className="w-28 h-9"
          dir="ltr"
        />
      </div>
      <Button size="sm" variant="outline" className="h-9 gap-1" onClick={handleApply}>
        <Filter className="h-3.5 w-3.5" />
        اعمال
      </Button>
      {hasFilter && (
        <Button size="sm" variant="ghost" className="h-9" onClick={handleClear}>
          حذف فیلتر
        </Button>
      )}
    </div>
  );
}

export default PriceRangeFilter;
