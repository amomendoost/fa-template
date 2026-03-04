// FulfillmentStatus - shows fulfillment status per order item
import { Badge } from '@/components/ui/badge';
import { Package, Truck, CheckCircle2, Clock, XCircle, Download, Key, Calendar, GraduationCap, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Fulfillment, FulfillmentStatus as FStatus, FulfillmentType } from '@/lib/shop/types';

const STATUS_MAP: Record<FStatus, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: 'در انتظار', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  processing: { label: 'در حال پردازش', color: 'bg-blue-100 text-blue-800', icon: Package },
  fulfilled: { label: 'تکمیل شده', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
  failed: { label: 'ناموفق', color: 'bg-red-100 text-red-800', icon: XCircle },
  expired: { label: 'منقضی', color: 'bg-orange-100 text-orange-800', icon: AlertCircle },
  cancelled: { label: 'لغو شده', color: 'bg-gray-100 text-gray-800', icon: XCircle },
};

const TYPE_ICONS: Record<FulfillmentType, React.ElementType> = {
  shipping: Truck,
  auto_download: Download,
  license_key: Key,
  booking: Calendar,
  course_access: GraduationCap,
  manual: Package,
  webhook: Package,
  none: Package,
};

interface FulfillmentStatusProps {
  fulfillment: Fulfillment;
  className?: string;
}

export function FulfillmentStatusDisplay({ fulfillment, className }: FulfillmentStatusProps) {
  const status = STATUS_MAP[fulfillment.status] || STATUS_MAP.pending;
  const TypeIcon = TYPE_ICONS[fulfillment.fulfillment_type] || Package;

  const delivery = fulfillment.delivery_data as Record<string, string> | undefined;

  return (
    <div className={cn('flex items-center gap-3 p-3 rounded-xl bg-muted/30', className)}>
      <TypeIcon className="h-5 w-5 text-muted-foreground shrink-0" />
      <div className="flex-1 min-w-0">
        {fulfillment.fulfillment_type === 'shipping' && delivery?.tracking_number && (
          <p className="text-xs text-muted-foreground" dir="ltr">
            {delivery.carrier && `${delivery.carrier}: `}
            {delivery.tracking_url ? (
              <a href={delivery.tracking_url} target="_blank" rel="noopener noreferrer" className="underline">
                {delivery.tracking_number}
              </a>
            ) : delivery.tracking_number}
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
