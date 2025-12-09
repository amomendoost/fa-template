// PaymentStatus Component
// Professional payment result display with animations

import { useEffect, useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  ArrowLeft,
  Loader2,
  Copy,
  Check,
  CreditCard,
  Receipt,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { formatAmount } from '@/lib/payment/gateways';
import type { PaymentStatusProps } from '@/lib/payment/types';
import { cn } from '@/lib/utils';

const defaultMessages = {
  loading: 'در حال بارگذاری...',
  verifying: 'در حال تایید پرداخت',
  paid: 'پرداخت موفق',
  failed: 'پرداخت ناموفق',
  expired: 'منقضی شده',
  pending: 'در انتظار پرداخت',
  processing: 'در حال پردازش',
  refunded: 'بازگشت وجه',
};

const statusConfig = {
  loading: {
    icon: Loader2,
    color: 'text-muted-foreground',
    bgColor: 'bg-muted/30',
    ringColor: 'ring-muted',
    gradientFrom: 'from-muted/20',
    gradientTo: 'to-muted/5',
    animate: true,
  },
  verifying: {
    icon: ShieldCheck,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-500/10',
    ringColor: 'ring-blue-500/30',
    gradientFrom: 'from-blue-500/10',
    gradientTo: 'to-blue-500/5',
    animate: true,
  },
  pending: {
    icon: Clock,
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-500/10',
    ringColor: 'ring-amber-500/30',
    gradientFrom: 'from-amber-500/10',
    gradientTo: 'to-amber-500/5',
    animate: false,
  },
  processing: {
    icon: Loader2,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-500/10',
    ringColor: 'ring-blue-500/30',
    gradientFrom: 'from-blue-500/10',
    gradientTo: 'to-blue-500/5',
    animate: true,
  },
  paid: {
    icon: CheckCircle2,
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    ringColor: 'ring-emerald-500/30',
    gradientFrom: 'from-emerald-500/10',
    gradientTo: 'to-emerald-500/5',
    animate: false,
  },
  failed: {
    icon: XCircle,
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-500/10',
    ringColor: 'ring-red-500/30',
    gradientFrom: 'from-red-500/10',
    gradientTo: 'to-red-500/5',
    animate: false,
  },
  expired: {
    icon: AlertTriangle,
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-500/10',
    ringColor: 'ring-orange-500/30',
    gradientFrom: 'from-orange-500/10',
    gradientTo: 'to-orange-500/5',
    animate: false,
  },
  refunded: {
    icon: RefreshCw,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-500/10',
    ringColor: 'ring-purple-500/30',
    gradientFrom: 'from-purple-500/10',
    gradientTo: 'to-purple-500/5',
    animate: false,
  },
};

export function PaymentStatus({
  status,
  refNumber,
  amount,
  currency = 'IRR',
  cardNumber,
  onRetry,
  onSuccess,
  messages = {},
}: PaymentStatusProps & { cardNumber?: string }) {
  const [copied, setCopied] = useState(false);
  const [showContent, setShowContent] = useState(false);

  const mergedMessages = { ...defaultMessages, ...messages };
  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;
  const message = mergedMessages[status] || mergedMessages.pending;

  const isSuccess = status === 'paid';
  const isFailed = status === 'failed' || status === 'expired';
  const isLoading = status === 'loading' || status === 'verifying' || status === 'processing';

  // Animation on mount
  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Copy reference number
  const handleCopy = async () => {
    if (refNumber) {
      await navigator.clipboard.writeText(refNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Loading/Verifying State - Special UI
  if (isLoading) {
    return (
      <div className={cn(
        'w-full max-w-md mx-auto transition-all duration-500',
        showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      )}>
        <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-b from-blue-500/5 to-blue-500/0">
          <div className="pt-12 pb-8 px-6">
            {/* Animated Loader */}
            <div className="relative w-32 h-32 mx-auto">
              {/* Outer ring */}
              <div className="absolute inset-0 rounded-full border-4 border-blue-500/20" />

              {/* Spinning ring */}
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 animate-spin" />

              {/* Inner pulse */}
              <div className="absolute inset-4 rounded-full bg-blue-500/10 animate-pulse" />

              {/* Center icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <ShieldCheck className="h-10 w-10 text-blue-500 animate-pulse" />
              </div>
            </div>

            {/* Message */}
            <h2 className="text-xl font-bold text-center mt-8 text-blue-600 dark:text-blue-400">
              {message}
            </h2>

            {/* Animated dots */}
            <div className="flex items-center justify-center gap-1.5 mt-4">
              <span className="text-muted-foreground">در حال بررسی تراکنش</span>
              <span className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" />
              </span>
            </div>

            {/* Progress bar */}
            <div className="mt-8 mx-4">
              <div className="h-1.5 bg-blue-500/20 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full animate-progress" />
              </div>
            </div>

            {/* Security note */}
            <p className="text-xs text-muted-foreground text-center mt-6">
              لطفا این صفحه را نبندید
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn(
      'w-full max-w-md mx-auto transition-all duration-500',
      showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
    )}>
      <Card className={cn(
        'overflow-hidden border-0 shadow-xl',
        `bg-gradient-to-b ${config.gradientFrom} ${config.gradientTo}`
      )}>
        {/* Animated Header */}
        <div className="relative pt-10 pb-6 px-6">
          {/* Icon */}
          <div className={cn(
            'relative w-24 h-24 mx-auto rounded-full flex items-center justify-center',
            'ring-4 transition-all duration-500',
            config.bgColor,
            config.ringColor,
            showContent ? 'scale-100' : 'scale-50'
          )}>
            {/* Pulse ring for success */}
            {isSuccess && (
              <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
            )}

            <Icon className={cn(
              'h-12 w-12 transition-all duration-300',
              config.color,
              isSuccess && 'animate-bounce-once'
            )} />
          </div>

          {/* Status Message */}
          <h2 className={cn(
            'text-2xl font-bold text-center mt-6 transition-all duration-500 delay-100',
            config.color,
            showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          )}>
            {message}
          </h2>

          {/* Subtitle */}
          <p className={cn(
            'text-sm text-muted-foreground text-center mt-2 transition-all duration-500 delay-150',
            showContent ? 'opacity-100' : 'opacity-0'
          )}>
            {isSuccess && 'تراکنش شما با موفقیت انجام شد'}
            {isFailed && 'متاسفانه تراکنش انجام نشد'}
          </p>
        </div>

        <CardContent className={cn(
          'space-y-4 transition-all duration-500 delay-200',
          showContent ? 'opacity-100' : 'opacity-0'
        )}>
          {/* Success Details */}
          {isSuccess && (amount || refNumber) && (
            <div className="bg-background/60 backdrop-blur rounded-xl p-4 space-y-4">
              {/* Amount */}
              {amount && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CreditCard className="h-4 w-4" />
                    <span className="text-sm">مبلغ پرداختی</span>
                  </div>
                  <span className="text-lg font-bold text-foreground">
                    {formatAmount(amount, currency)}
                  </span>
                </div>
              )}

              {amount && refNumber && <Separator />}

              {/* Reference Number */}
              {refNumber && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Receipt className="h-4 w-4" />
                    <span className="text-sm">شماره پیگیری</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-muted/50 px-4 py-3 rounded-lg font-mono text-base text-center tracking-wider">
                      {refNumber}
                    </code>
                    <Button
                      variant="outline"
                      size="icon"
                      className="shrink-0 h-11 w-11"
                      onClick={handleCopy}
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Card Number */}
              {cardNumber && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">شماره کارت</span>
                    <span className="font-mono text-sm" dir="ltr">{cardNumber}</span>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Failed Message */}
          {isFailed && (
            <div className="bg-background/60 backdrop-blur rounded-xl p-4 text-center space-y-2">
              <p className="text-muted-foreground text-sm">
                در صورت کسر مبلغ از حساب شما، طی ۷۲ ساعت به حساب شما بازگردانده می‌شود.
              </p>
              <p className="text-xs text-muted-foreground/70">
                در صورت نیاز با پشتیبانی تماس بگیرید
              </p>
            </div>
          )}
        </CardContent>

        <CardFooter className={cn(
          'flex flex-col gap-3 pb-6 transition-all duration-500 delay-300',
          showContent ? 'opacity-100' : 'opacity-0'
        )}>
          {/* Success Button */}
          {isSuccess && onSuccess && (
            <Button onClick={onSuccess} className="w-full h-12 gap-2 text-base">
              ادامه
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}

          {/* Retry Button */}
          {isFailed && onRetry && (
            <Button onClick={onRetry} variant="outline" className="w-full h-12 gap-2 text-base">
              <RefreshCw className="h-5 w-5" />
              تلاش مجدد
            </Button>
          )}

          {/* Home Link for failed */}
          {isFailed && (
            <Button variant="ghost" className="w-full text-muted-foreground" asChild>
              <a href="/">بازگشت به صفحه اصلی</a>
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Security Badge */}
      {isSuccess && (
        <div className={cn(
          'flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground transition-all duration-500 delay-500',
          showContent ? 'opacity-100' : 'opacity-0'
        )}>
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>تراکنش امن با رمزنگاری SSL</span>
        </div>
      )}
    </div>
  );
}

export default PaymentStatus;
