// OrderStatus - order tracking with timeline
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, Package, Clock, CheckCircle2, XCircle, Truck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCheckout } from '@/hooks/use-checkout';
import { PriceTag } from './PriceTag';

interface OrderStatusProps {
  orderNumber?: string;
  className?: string;
}

const STATUS_MAP: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: 'در انتظار پرداخت', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  paid: { label: 'پرداخت شده', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
  processing: { label: 'در حال پردازش', color: 'bg-blue-100 text-blue-800', icon: Package },
  shipped: { label: 'ارسال شده', color: 'bg-purple-100 text-purple-800', icon: Truck },
  delivered: { label: 'تحویل داده شده', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
  cancelled: { label: 'لغو شده', color: 'bg-red-100 text-red-800', icon: XCircle },
  refunded: { label: 'مرجوع شده', color: 'bg-gray-100 text-gray-800', icon: XCircle },
  expired: { label: 'منقضی شده', color: 'bg-orange-100 text-orange-800', icon: Clock },
};

export function OrderStatus({ orderNumber: initialOrderNumber, className }: OrderStatusProps) {
  const [input, setInput] = useState(initialOrderNumber || '');
  const { trackOrder, isLoading, error, order } = useCheckout();

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      await trackOrder(input.trim());
    }
  };

  const statusInfo = order ? STATUS_MAP[order.status] || STATUS_MAP.pending : null;

  return (
    <div className={cn('space-y-6', className)}>
      <form onSubmit={handleTrack} className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="شماره سفارش را وارد کنید"
          dir="ltr"
          className="flex-1"
        />
        <Button type="submit" disabled={isLoading} className="gap-2">
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          پیگیری
        </Button>
      </form>

      {error && <p className="text-sm text-destructive text-center">{error}</p>}

      {order && statusInfo && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">سفارش {order.order_number}</CardTitle>
              <Badge className={statusInfo.color}>
                <statusInfo.icon className="h-3.5 w-3.5 ml-1" />
                {statusInfo.label}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {order.items && order.items.length > 0 && (
              <>
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span>{item.name} x {item.quantity}</span>
                    <PriceTag price={item.total} currency={order.currency} />
                  </div>
                ))}
                <Separator />
              </>
            )}
            <div className="flex justify-between font-bold">
              <span>مبلغ کل</span>
              <PriceTag price={order.total_amount} currency={order.currency} />
            </div>
            {order.created_at && (
              <p className="text-xs text-muted-foreground">
                تاریخ ثبت: {new Date(order.created_at).toLocaleDateString('fa-IR')}
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default OrderStatus;
