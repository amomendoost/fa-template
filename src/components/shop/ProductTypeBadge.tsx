// ProductTypeBadge - shows product type icon + label
import { Package, Download, Key, Calendar, GraduationCap, RefreshCw, Wrench } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { ProductKind } from '@/lib/shop/types';

const TYPE_CONFIG: Record<string, { label: string; icon: React.ElementType }> = {
  physical: { label: 'فیزیکی', icon: Package },
  digital: { label: 'دیجیتال', icon: Download },
  license_key: { label: 'لایسنس', icon: Key },
  booking: { label: 'رزرو', icon: Calendar },
  course: { label: 'دوره آموزشی', icon: GraduationCap },
  subscription: { label: 'اشتراک', icon: RefreshCw },
  manual: { label: 'سفارشی', icon: Wrench },
};

interface ProductTypeBadgeProps {
  kind?: ProductKind;
  className?: string;
}

export function ProductTypeBadge({ kind, className }: ProductTypeBadgeProps) {
  if (!kind || kind === 'physical') return null;

  const config = TYPE_CONFIG[kind];
  if (!config) return null;

  const Icon = config.icon;

  return (
    <Badge variant="secondary" className={cn('gap-1 font-normal text-[11px]', className)}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}

export default ProductTypeBadge;
