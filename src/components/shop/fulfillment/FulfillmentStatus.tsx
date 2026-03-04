// FulfillmentStatus - shows fulfillment status per order item
import { Badge } from '@/components/ui/badge';
import { Package, Truck, CheckCircle2, Clock, XCircle, Download, Key, Calendar, GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Fulfillment, FulfillmentStatus as FStatus, FulfillmentType } from '@/lib/shop/types';

const STATUS_MAP: Record<FStatus, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: 'در انتظار', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', icon: Clock },
  processing: { label: 'در حال پردازش', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', icon: Package },
  completed: { label: 'تکمیل شده', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle2 },
  failed: { label: 'ناموفق', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', icon: XCircle },
  cancelled: { label: 'لغو شده', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400', icon: XCircle },
};

const TYPE_ICONS: Record<FulfillmentType, React.ElementType> = {
  ship: Truck,
  download: Download,
  license_key: Key,
  booking_confirm: Calendar,
  course_enroll: GraduationCap,
  manual: Package,
  none: Package,
};

interface FulfillmentStatusProps {
  fulfillment: Fulfillment;
  className?: string;
}

export function FulfillmentStatusDisplay({ fulfillment, className }: FulfillmentStatusProps) {
  const status = STATUS_MAP[fulfillment.status] || STATUS_MAP.pending;
  const TypeIcon = TYPE_ICONS[fulfillment.type] || Package;

  return (
    <div className={cn('flex items-center gap-3 p-3 rounded-xl bg-muted/30', className)}>
      <TypeIcon className="h-5 w-5 text-muted-foreground shrink-0" />
      <div className="flex-1 min-w-0">
        {fulfillment.product_name && (
          <p className="text-sm font-medium line-clamp-1">{fulfillment.product_name}</p>
        )}
        {fulfillment.type === 'shipping' && fulfillment.tracking_number && (
          <p className="text-xs text-muted-foreground" dir="ltr">
            {fulfillment.carrier && `${fulfillment.carrier}: `}
            {fulfillment.tracking_url ? (
              <a href={fulfillment.tracking_url} target="_blank" rel="noopener noreferrer" className="underline">
                {fulfillment.tracking_number}
              </a>
            ) : fulfillment.tracking_number}
          </p>
        )}
      </div>
      <Badge className={cn('shrink-0 text-[11px]', status.color)}>
        <status.icon className="h-3 w-3 ml-1" />
        {status.label}
      </Badge>
    </div>
  );
}

export default FulfillmentStatusDisplay;
