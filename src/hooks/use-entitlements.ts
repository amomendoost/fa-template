// useMyDigitalFulfillments - fetches all user's digital fulfillments (downloads, licenses)
import { useState, useEffect, useCallback } from 'react';
import { getMyDigitalFulfillments, downloadFile } from '@/lib/shop/service';
import type { Fulfillment } from '@/lib/shop/types';

export function useMyEntitlements() {
  const [fulfillments, setFulfillments] = useState<Fulfillment[]>([]);
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

  const download = useCallback(async (fulfillmentId: string, fileId: string) => {
    // TODO: need order access_token for download — for now pass empty
    return downloadFile(fulfillmentId, fileId, '');
  }, []);

  return { fulfillments, isLoading, error, download, refresh: fetch };
}

export default useMyEntitlements;
