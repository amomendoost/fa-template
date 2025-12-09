// usePaymentVerify Hook
// Verify payment status after callback

import { useState, useCallback, useEffect } from 'react';
import { verifyPayment, extractTrackIdFromUrl } from '@/lib/payment/service';
import type {
  PaymentGateway,
  PaymentVerifyResponse,
  UsePaymentVerifyReturn,
} from '@/lib/payment/types';

interface UsePaymentVerifyOptions {
  /** Payment gateway used */
  gateway: PaymentGateway;
  /** Auto-verify on mount using URL params */
  autoVerify?: boolean;
  /** Called on successful verification */
  onSuccess?: (data: PaymentVerifyResponse['data']) => void;
  /** Called on verification failure */
  onError?: (error: string) => void;
}

export function usePaymentVerify(
  options: UsePaymentVerifyOptions
): UsePaymentVerifyReturn {
  const { gateway, autoVerify = true, onSuccess, onError } = options;

  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PaymentVerifyResponse | null>(null);

  const verifyPaymentFn = useCallback(
    async (trackId: string | number): Promise<PaymentVerifyResponse> => {
      setIsVerifying(true);
      setError(null);

      try {
        const response = await verifyPayment(gateway, { trackId });

        setData(response);

        if (response.success) {
          onSuccess?.(response.data);
        } else {
          setError(response.error || 'Verification failed');
          onError?.(response.error || 'Verification failed');
        }

        return response;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        onError?.(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setIsVerifying(false);
      }
    },
    [gateway, onSuccess, onError]
  );

  const reset = useCallback(() => {
    setIsVerifying(false);
    setError(null);
    setData(null);
  }, []);

  // Auto-verify on mount if trackId is in URL
  useEffect(() => {
    if (autoVerify) {
      const trackId = extractTrackIdFromUrl(gateway);
      if (trackId) {
        verifyPaymentFn(trackId);

        // Clean up URL params after reading
        const url = new URL(window.location.href);
        url.search = '';
        window.history.replaceState({}, '', url.toString());
      }
    }
  }, [autoVerify, gateway, verifyPaymentFn]);

  return {
    verifyPayment: verifyPaymentFn,
    isVerifying,
    error,
    data,
    isSuccess: data?.success ?? false,
    reset,
  };
}

export default usePaymentVerify;
