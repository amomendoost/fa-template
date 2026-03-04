// useSubscriptions - fetches user's subscriptions (requires auth)
import { useState, useEffect, useCallback } from 'react';
import { getMySubscriptions, cancelSubscription, renewSubscription } from '@/lib/shop/service';
import type { Subscription } from '@/lib/shop/types';

export function useSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getMySubscriptions();
      setSubscriptions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در دریافت اشتراک‌ها');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const cancel = useCallback(async (id: string) => {
    await cancelSubscription(id);
    await fetch();
  }, [fetch]);

  const renew = useCallback(async (id: string) => {
    const result = await renewSubscription(id);
    // Backend returns a renewal order that needs checkout
    // Refresh subscriptions list to show the pending renewal
    await fetch();
    return result;
  }, [fetch]);

  return { subscriptions, isLoading, error, cancel, renew, refresh: fetch };
}

export default useSubscriptions;
