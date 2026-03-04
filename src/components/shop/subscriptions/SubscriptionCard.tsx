// SubscriptionCard - single subscription display with actions
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, XCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PriceTag } from '../PriceTag';
import type { Subscription, SubscriptionStatus } from '@/lib/shop/types';

const STATUS_MAP: Record<SubscriptionStatus, { label: string; color: string }> = {
  active: { label: 'فعال', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
  trialing: { label: 'دوره آزمایشی', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
  paused: { label: 'متوقف', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
  past_due: { label: 'عقب‌افتاده', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' },
  cancelled: { label: 'لغو شده', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
  expired: { label: 'منقضی', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400' },
};

const PERIOD_LABELS: Record<string, string> = {
  monthly: 'ماهانه',
  yearly: 'سالانه',
  weekly: 'هفتگی',
  quarterly: 'سه‌ماهه',
};

interface SubscriptionCardProps {
  subscription: Subscription;
  onCancel?: (id: string) => Promise<void>;
  onRenew?: (id: string) => Promise<void>;
  className?: string;
}

export function SubscriptionCard({ subscription, onCancel, onRenew, className }: SubscriptionCardProps) {
  const [loading, setLoading] = useState<'cancel' | 'renew' | null>(null);
  const status = STATUS_MAP[subscription.status] || STATUS_MAP.active;
  const periodLabel = PERIOD_LABELS[subscription.billing_period] || subscription.billing_period;
  const canCancel = subscription.status === 'active' || subscription.status === 'trialing';
  const canRenew = subscription.status === 'cancelled' || subscription.status === 'expired';

  const handleCancel = async () => {
    if (!onCancel) return;
    setLoading('cancel');
    try { await onCancel(subscription.id); } finally { setLoading(null); }
  };

  const handleRenew = async () => {
    if (!onRenew) return;
    setLoading('renew');
    try { await onRenew(subscription.id); } finally { setLoading(null); }
  };

  return (
    <Card className={className}>
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start gap-4">
          {subscription.product_image && (
            <img
              src={subscription.product_image}
              alt={subscription.product_name}
              className="h-14 w-14 rounded-xl object-cover shrink-0"
            />
          )}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-medium text-sm line-clamp-1">{subscription.product_name}</h3>
              <Badge className={cn('shrink-0 text-[11px]', status.color)}>{status.label}</Badge>
            </div>

            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <PriceTag price={subscription.price} currency={subscription.currency} className="text-sm" />
              <span>/</span>
              <span>{periodLabel}</span>
            </div>

            {subscription.cancel_at_period_end && subscription.status === 'active' && (
              <p className="text-xs text-orange-600 dark:text-orange-400">
                در پایان دوره فعلی لغو خواهد شد
              </p>
            )}

            <p className="text-xs text-muted-foreground">
              پایان دوره: {new Date(subscription.current_period_end).toLocaleDateString('fa-IR')}
            </p>

            {(canCancel || canRenew) && (
              <div className="flex gap-2 pt-1">
                {canCancel && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs h-8"
                    onClick={handleCancel}
                    disabled={loading !== null}
                  >
                    {loading === 'cancel' ? <Loader2 className="h-3 w-3 animate-spin" /> : <XCircle className="h-3 w-3" />}
                    لغو اشتراک
                  </Button>
                )}
                {canRenew && (
                  <Button
                    size="sm"
                    className="gap-1.5 text-xs h-8"
                    onClick={handleRenew}
                    disabled={loading !== null}
                  >
                    {loading === 'renew' ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                    تمدید اشتراک
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default SubscriptionCard;
