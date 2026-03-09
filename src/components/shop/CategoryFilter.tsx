// CategoryFilter - horizontal scrollable pill categories
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

  const allItems = [
    { slug: undefined, name: 'همه' },
    ...categories.map((c) => ({ slug: c.slug, name: c.name })),
  ];

  if (layout === 'vertical') {
    return (
      <div className={cn('flex flex-col gap-1.5', className)}>
        {allItems.map((item) => (
          <button
            key={item.slug ?? '_all'}
            onClick={() => onChange?.(item.slug)}
            className={cn(
              'px-4 py-2 rounded-xl text-sm text-right transition-colors',
              selected === item.slug || (!selected && !item.slug)
                ? 'bg-foreground text-background font-medium'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            {item.name}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn('flex gap-2 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4', className)}
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {allItems.map((item) => (
        <button
          key={item.slug ?? '_all'}
          onClick={() => onChange?.(item.slug)}
          className={cn(
            'h-9 px-4 rounded-full text-sm whitespace-nowrap shrink-0 transition-all',
            selected === item.slug || (!selected && !item.slug)
              ? 'bg-foreground text-background font-medium'
              : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
          )}
        >
          {item.name}
        </button>
      ))}
    </div>
  );
}

export default CategoryFilter;
