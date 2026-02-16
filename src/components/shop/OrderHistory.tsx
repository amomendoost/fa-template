// OrderHistory - displays authenticated user's order history
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Package, ChevronLeft, RefreshCw, LogIn } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMyOrders } from '@/hooks/use-my-orders';
import { PriceTag } from './PriceTag';
import { OrderStatus } from './OrderStatus';
import type { Order } from '@/lib/shop/types';

interface OrderHistoryProps {
  onOrderClick?: (order: Order) => void;
  onLoginClick?: () => void;
  className?: string;
}

export function OrderHistory({ onOrderClick, onLoginClick, className }: OrderHistoryProps) {
  const { orders, isLoading, error, isLoggedIn, hasMore, loadMore, refresh } = useMyOrders();

  // Not logged in state
  if (!isLoggedIn) {
    return (
      <Card className={cn('', className)}>
        <CardContent className="py-12 text-center space-y-4">
          <LogIn className="w-12 h-12 mx-auto text-muted-foreground" />
          <div className="space-y-2">
            <h3 className="font-medium">برای مشاهده تاریخچه سفارشات وارد شوید</h3>
            <p className="text-sm text-muted-foreground">
              با ورود به حساب کاربری، تمام سفارشات خود را مشاهده کنید
            </p>
          </div>
          {onLoginClick && (
            <Button onClick={onLoginClick} className="gap-2">
              <LogIn className="w-4 h-4" />
              ورود به حساب
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  // Loading state
  if (isLoading && orders.length === 0) {
    return (
      <div className={cn('space-y-3', className)}>
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="py-4">
              <div className="flex justify-between items-center">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className={cn('', className)}>
        <CardContent className="py-8 text-center space-y-4">
          <p className="text-destructive">{error}</p>
          <Button variant="outline" onClick={refresh} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            تلاش مجدد
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (orders.length === 0) {
    return (
      <Card className={cn('', className)}>
        <CardContent className="py-12 text-center space-y-4">
          <Package className="w-12 h-12 mx-auto text-muted-foreground" />
          <div className="space-y-2">
            <h3 className="font-medium">هنوز سفارشی ثبت نکرده‌اید</h3>
            <p className="text-sm text-muted-foreground">
              سفارشات شما اینجا نمایش داده می‌شود
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Orders list
  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex justify-between items-center">
        <h2 className="font-bold">سفارشات من</h2>
        <Button variant="ghost" size="sm" onClick={refresh} disabled={isLoading}>
          <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
        </Button>
      </div>

      <div className="space-y-3">
        {orders.map((order) => (
          <Card
            key={order.id}
            className={cn(
              'cursor-pointer transition-shadow hover:shadow-md',
              onOrderClick && 'hover:border-primary/50'
            )}
            onClick={() => onOrderClick?.(order)}
          >
            <CardContent className="py-4">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-medium" dir="ltr">
                      {order.order_number}
                    </span>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {order.items?.length || 0} محصول
                    {order.created_at && (
                      <span className="mx-2">•</span>
                    )}
                    {order.created_at && formatDate(order.created_at)}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <PriceTag price={order.total_amount} currency={order.currency} />
                  {onOrderClick && <ChevronLeft className="w-4 h-4 text-muted-foreground" />}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={loadMore} disabled={isLoading}>
            {isLoading ? 'در حال بارگذاری...' : 'نمایش بیشتر'}
          </Button>
        </div>
      )}
    </div>
  );
}

// Helper: Format date in Persian
function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  } catch {
    return '';
  }
}

// Helper: Order status badge
function OrderStatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    pending: { label: 'در انتظار پرداخت', variant: 'outline' },
    paid: { label: 'پرداخت شده', variant: 'default' },
    processing: { label: 'در حال پردازش', variant: 'secondary' },
    shipped: { label: 'ارسال شده', variant: 'secondary' },
    delivered: { label: 'تحویل شده', variant: 'default' },
    cancelled: { label: 'لغو شده', variant: 'destructive' },
    refunded: { label: 'مسترد شده', variant: 'destructive' },
    expired: { label: 'منقضی شده', variant: 'destructive' },
  };

  const config = statusConfig[status] || { label: status, variant: 'outline' as const };

  return (
    <Badge variant={config.variant} className="text-xs">
      {config.label}
    </Badge>
  );
}

export default OrderHistory;
