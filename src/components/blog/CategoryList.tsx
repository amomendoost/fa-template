// CategoryList - blog categories with post count
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { BlogCategory } from '@/lib/blog/types';

interface CategoryListProps {
  categories?: BlogCategory[];
  selected?: string;
  onChange?: (category: string | undefined) => void;
  layout?: 'horizontal' | 'vertical';
  className?: string;
}

export function CategoryList({
  categories = [],
  selected,
  onChange,
  layout = 'horizontal',
  className,
}: CategoryListProps) {
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
          key={cat.name}
          variant={selected === cat.name ? 'default' : 'outline'}
          size="sm"
          className="gap-1.5"
          onClick={() => onChange?.(cat.name)}
        >
          {cat.name}
          <Badge variant="secondary" className="h-5 px-1.5 text-xs">
            {cat.count}
          </Badge>
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

export default CategoryList;
