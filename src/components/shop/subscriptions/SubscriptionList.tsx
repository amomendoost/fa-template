// SubscriptionList - list of user subscriptions
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SubscriptionCard } from './SubscriptionCard';
import type { Subscription } from '@/lib/shop/types';

interface SubscriptionListProps {
  subscriptions: Subscription[];
  isLoading?: boolean;
  onCancel?: (id: string) => Promise<unknown>;
  onRenew?: (id: string) => Promise<unknown>;
  className?: string;
}

export function SubscriptionList({ subscriptions, isLoading, onCancel, onRenew, className }: SubscriptionListProps) {
  if (isLoading) {
    return (
      <div className={cn('flex justify-center py-12', className)}>
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (subscriptions.length === 0) {
    return (
      <div className={cn('text-center py-12 text-sm text-muted-foreground', className)}>
        اشتراک فعالی ندارید
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      {subscriptions.map((sub) => (
        <SubscriptionCard
          key={sub.id}
          subscription={sub}
          onCancel={onCancel}
          onRenew={onRenew}
        />
      ))}
    </div>
  );
}

export default SubscriptionList;
