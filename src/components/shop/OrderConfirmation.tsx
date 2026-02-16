// OrderConfirmation - Shows order details before payment redirect
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CreditCard, Copy, Check, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Order } from '@/lib/shop/types';
import { PriceTag } from './PriceTag';

interface OrderConfirmationProps {
  order: Order;
  onProceedToPayment: () => void;
  isRedirecting?: boolean;
  autoRedirectSeconds?: number;
  className?: string;
}

export function OrderConfirmation({
  order,
  onProceedToPayment,
  isRedirecting = false,
  autoRedirectSeconds = 5,
  className,
}: OrderConfirmationProps) {
  const [countdown, setCountdown] = useState(autoRedirectSeconds);
  const [copied, setCopied] = useState(false);

  // Auto-redirect countdown
  useEffect(() => {
    if (isRedirecting || countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onProceedToPayment();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown, isRedirecting, onProceedToPayment]);

  const copyOrderNumber = async () => {
    try {
      await navigator.clipboard.writeText(order.order_number);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const input = document.createElement('input');
      input.value = order.order_number;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Success Header */}
      <div className="text-center space-y-2">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <Check className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">سفارش شما ثبت شد</h2>
        <p className="text-muted-foreground">
          لطفاً شماره سفارش را یادداشت کنید
        </p>
      </div>

      {/* Order Number Card */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="pt-6">
          <div className="text-center space-y-3">
            <p className="text-sm text-muted-foreground">شماره سفارش</p>
            <div className="flex items-center justify-center gap-2">
              <p
                className="text-3xl font-bold font-mono tracking-widest select-all"
                dir="ltr"
              >
                {order.order_number}
              </p>
              <Button
                variant="ghost"
                size="icon"
                onClick={copyOrderNumber}
                className="h-8 w-8"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              برای پیگیری سفارش به این شماره نیاز دارید
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Order Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">خلاصه سفارش</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">تعداد اقلام</span>
            <span>{order.items?.length || 0} عدد</span>
          </div>
          <div className="flex justify-between font-bold">
            <span>مبلغ قابل پرداخت</span>
            <PriceTag price={order.total_amount} currency={order.currency || 'IRT'} />
          </div>
        </CardContent>
      </Card>

      {/* Expiry Warning */}
      <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 dark:bg-amber-950/30 rounded-lg p-3">
        <Clock className="h-4 w-4 shrink-0" />
        <p>
          این سفارش تا ۱۵ دقیقه معتبر است. در صورت عدم پرداخت، سفارش لغو خواهد شد.
        </p>
      </div>

      {/* Payment Button */}
      <Button
        onClick={onProceedToPayment}
        disabled={isRedirecting}
        className="w-full gap-2"
        size="lg"
      >
        {isRedirecting ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            در حال انتقال به درگاه پرداخت...
          </>
        ) : (
          <>
            <CreditCard className="h-5 w-5" />
            پرداخت ({countdown} ثانیه)
          </>
        )}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        به صورت خودکار به درگاه پرداخت منتقل می‌شوید
      </p>
    </div>
  );
}

export default OrderConfirmation;
