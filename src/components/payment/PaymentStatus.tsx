// PaymentStatus Component
// Display payment status with appropriate UI

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { formatAmount } from '@/lib/payment/gateways';
import type { PaymentStatusProps } from '@/lib/payment/types';
import { cn } from '@/lib/utils';

const defaultMessages = {
  loading: 'در حال بارگذاری...',
  verifying: 'در حال بررسی پرداخت...',
  success: 'پرداخت با موفقیت انجام شد',
  failed: 'پرداخت ناموفق بود',
  expired: 'زمان پرداخت منقضی شده است',
  pending: 'در انتظار پرداخت',
  processing: 'در حال پردازش...',
  refunded: 'مبلغ بازگردانده شد',
};

const statusConfig = {
  loading: {
    icon: Loader2,
    color: 'text-muted-foreground',
    bgColor: 'bg-muted/50',
    animate: true,
  },
  verifying: {
    icon: Loader2,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    animate: true,
  },
  pending: {
    icon: Clock,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950/30',
    animate: false,
  },
  processing: {
    icon: Loader2,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    animate: true,
  },
  paid: {
    icon: CheckCircle2,
    color: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-950/30',
    animate: false,
  },
  failed: {
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50 dark:bg-red-950/30',
    animate: false,
  },
  expired: {
    icon: Clock,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 dark:bg-orange-950/30',
    animate: false,
  },
  refunded: {
    icon: RefreshCw,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-950/30',
    animate: false,
  },
};

export function PaymentStatus({
  status,
  refNumber,
  amount,
  currency = 'IRR',
  onRetry,
  onSuccess,
  messages = {},
}: PaymentStatusProps) {
  const mergedMessages = { ...defaultMessages, ...messages };
  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;
  const message = mergedMessages[status] || mergedMessages.pending;

  // Loading skeleton
  if (status === 'loading') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6 space-y-4">
          <Skeleton className="h-16 w-16 rounded-full mx-auto" />
          <Skeleton className="h-6 w-48 mx-auto" />
          <Skeleton className="h-4 w-32 mx-auto" />
        </CardContent>
      </Card>
    );
  }

  const isSuccess = status === 'paid';
  const isFailed = status === 'failed' || status === 'expired';

  return (
    <Card className={cn('w-full max-w-md mx-auto', config.bgColor)}>
      <CardHeader className="text-center pb-2">
        <div
          className={cn(
            'w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4',
            config.bgColor
          )}
        >
          <Icon
            className={cn(
              'h-10 w-10',
              config.color,
              config.animate && 'animate-spin'
            )}
          />
        </div>
        <h2 className={cn('text-xl font-bold', config.color)}>{message}</h2>
      </CardHeader>

      <CardContent className="text-center space-y-3">
        {/* Amount */}
        {amount && isSuccess && (
          <div className="text-2xl font-bold text-foreground">
            {formatAmount(amount, currency)}
          </div>
        )}

        {/* Reference Number */}
        {refNumber && isSuccess && (
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">شماره پیگیری:</p>
            <p className="font-mono text-lg font-medium bg-muted px-4 py-2 rounded-lg">
              {refNumber}
            </p>
          </div>
        )}

        {/* Failed message */}
        {isFailed && (
          <p className="text-muted-foreground">
            لطفا مجددا تلاش کنید یا با پشتیبانی تماس بگیرید.
          </p>
        )}

        {/* Verifying message */}
        {status === 'verifying' && (
          <p className="text-muted-foreground">
            لطفا صبر کنید...
          </p>
        )}
      </CardContent>

      <CardFooter className="flex justify-center gap-3">
        {/* Retry button for failed payments */}
        {isFailed && onRetry && (
          <Button onClick={onRetry} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            تلاش مجدد
          </Button>
        )}

        {/* Continue button for successful payments */}
        {isSuccess && onSuccess && (
          <Button onClick={onSuccess} className="gap-2">
            ادامه
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export default PaymentStatus;
