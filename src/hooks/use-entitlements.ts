// useMyEntitlements - fetches all user entitlements (downloads, licenses, etc.)
import { useState, useEffect, useCallback } from 'react';
import { getMyEntitlements, downloadFile } from '@/lib/shop/service';
import type { Entitlement } from '@/lib/shop/types';

export function useMyEntitlements() {
  const [entitlements, setEntitlements] = useState<Entitlement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getMyEntitlements();
      setEntitlements(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در دریافت دسترسی‌ها');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const download = useCallback(async (entitlementId: string, fileId: string) => {
    return downloadFile(entitlementId, fileId);
  }, []);

  return { entitlements, isLoading, error, download, refresh: fetch };
}

export default useMyEntitlements;
