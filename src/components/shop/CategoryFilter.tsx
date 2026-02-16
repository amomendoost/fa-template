// CategoryFilter - horizontal/vertical category filter
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { ProductCategory } from '@/lib/shop/types';

interface CategoryFilterProps {
  categories?: ProductCategory[];
  selected?: string;
  onChange?: (category: string | undefined) => void;
  layout?: 'horizontal' | 'vertical';
  className?: string;
}

export function CategoryFilter({
  categories = [],
  selected,
  onChange,
  layout = 'horizontal',
  className,
}: CategoryFilterProps) {
  if (categories.length === 0) return null;

  const items = (
    <>
      <Button
        variant={!selected ? 'default' : 'outline'}
        size="sm"
        onClick={() => onChange?.(undefined)}
      >
        همه
      </Button>
      {categories.map((cat) => (
        <Button
          key={cat.id}
          variant={selected === cat.slug ? 'default' : 'outline'}
          size="sm"
          onClick={() => onChange?.(cat.slug)}
        >
          {cat.name}
        </Button>
      ))}
    </>
  );

  if (layout === 'vertical') {
    return <div className={cn('flex flex-col gap-2', className)}>{items}</div>;
  }

  return (
    <ScrollArea className={cn('w-full', className)}>
      <div className="flex gap-2 pb-2">{items}</div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}

export default CategoryFilter;
