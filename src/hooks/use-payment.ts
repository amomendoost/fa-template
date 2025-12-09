// usePayment Hook
// Easy payment creation for any gateway

import { useState, useCallback } from 'react';
import { createPayment, redirectToPayment } from '@/lib/payment/service';
import type {
  PaymentGateway,
  PaymentRequest,
  PaymentResponse,
  UsePaymentReturn,
} from '@/lib/payment/types';

interface UsePaymentOptions {
  /** Payment gateway to use */
  gateway: PaymentGateway;
  /** Auto-redirect to payment URL on success */
  autoRedirect?: boolean;
  /** Called when payment is created successfully */
  onSuccess?: (response: PaymentResponse) => void;
  /** Called on error */
  onError?: (error: string) => void;
}

export function usePayment(options: UsePaymentOptions): UsePaymentReturn {
  const { gateway, autoRedirect = true, onSuccess, onError } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PaymentResponse | null>(null);

  const createPaymentFn = useCallback(
    async (request: PaymentRequest): Promise<PaymentResponse> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await createPayment(gateway, request);

        if (response.success) {
          setData(response);
          onSuccess?.(response);

          if (autoRedirect && response.data?.payment_url) {
            redirectToPayment(response.data.payment_url);
          }
        } else {
          setError(response.error || 'Payment failed');
          onError?.(response.error || 'Payment failed');
        }

        return response;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        onError?.(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setIsLoading(false);
      }
    },
    [gateway, autoRedirect, onSuccess, onError]
  );

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setData(null);
  }, []);

  return {
    createPayment: createPaymentFn,
    isLoading,
    error,
    data,
    reset,
  };
}

export default usePayment;
