// useMyDigitalFulfillments - fetches all user's digital fulfillments (downloads, licenses)
import { useState, useEffect, useCallback } from 'react';
import { getMyDigitalFulfillments, downloadFile } from '@/lib/shop/service';
import type { DigitalFulfillmentWithToken } from '@/lib/shop/service';

export function useMyEntitlements() {
  const [fulfillments, setFulfillments] = useState<DigitalFulfillmentWithToken[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getMyDigitalFulfillments();
      setFulfillments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در دریافت دسترسی‌ها');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const download = useCallback(async (fulfillmentId: string, fileId: string, accessToken?: string) => {
    return downloadFile(fulfillmentId, fileId, accessToken || '');
  }, []);

  return { fulfillments, isLoading, error, download, refresh: fetch };
}

export default useMyEntitlements;
