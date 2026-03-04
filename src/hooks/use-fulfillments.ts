// useFulfillments - fetches fulfillments & entitlements for an order
import { useState, useEffect, useCallback } from 'react';
import { getOrderFulfillments, downloadFile } from '@/lib/shop/service';
import type { Fulfillment, Entitlement } from '@/lib/shop/types';

export function useFulfillments(orderId: string | undefined) {
  const [fulfillments, setFulfillments] = useState<Fulfillment[]>([]);
  const [entitlements, setEntitlements] = useState<Entitlement[]>([]);
  const [isLoading, setIsLoading] = useState(!!orderId);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!orderId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await getOrderFulfillments(orderId);
      setFulfillments(data.fulfillments);
      setEntitlements(data.entitlements);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در دریافت اطلاعات تحویل');
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  useEffect(() => { fetch(); }, [fetch]);

  const download = useCallback(async (fulfillmentId: string, fileId: string, accessToken?: string) => {
    return downloadFile(fulfillmentId, fileId, accessToken || '');
  }, []);

  return { fulfillments, entitlements, isLoading, error, download, refresh: fetch };
}

export default useFulfillments;
