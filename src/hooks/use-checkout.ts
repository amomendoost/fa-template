// useCheckout Hook - order creation + payment flow

import { useState, useCallback } from 'react';
import { createOrder, checkout, getOrder } from '@/lib/shop/service';
import type { CartItem, CustomerInfo, Order } from '@/lib/shop/types';

interface UseCheckoutOptions {
  integrationId?: string;
  callbackUrl?: string;
  onSuccess?: (order: Order) => void;
  onError?: (error: string) => void;
}

export function useCheckout(options?: UseCheckoutOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);

  const placeOrder = useCallback(
    async (items: CartItem[], customerInfo: CustomerInfo): Promise<Order | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await createOrder(items, customerInfo);
        setOrder(result);
        // Don't call onSuccess here - only after payment is complete
        return result;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Order creation failed';
        setError(msg);
        options?.onError?.(msg);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [options]
  );

  const startCheckout = useCallback(
    async (orderId: string, orderNumber?: string): Promise<void> => {
      setIsLoading(true);
      setError(null);
      try {
        const integrationId = options?.integrationId || 'zibal';
        const baseCallbackUrl = options?.callbackUrl || `${window.location.origin}/payment/callback`;
        // Include orderNumber in callback URL so it's available after payment
        const callbackUrl = orderNumber
          ? `${baseCallbackUrl}${baseCallbackUrl.includes('?') ? '&' : '?'}orderNumber=${encodeURIComponent(orderNumber)}`
          : baseCallbackUrl;
        const result = await checkout({ order_id: orderId, integration_id: integrationId, return_url: callbackUrl });
        if (result.success && result.payment_url) {
          window.location.href = result.payment_url;
        } else {
          throw new Error(result.error || 'Checkout failed');
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Checkout failed';
        setError(msg);
        options?.onError?.(msg);
      } finally {
        setIsLoading(false);
      }
    },
    [options]
  );

  const trackOrder = useCallback(async (orderNumber: string): Promise<Order | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getOrder(orderNumber);
      setOrder(result);
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Order not found';
      setError(msg);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { placeOrder, startCheckout, trackOrder, isLoading, error, order };
}

export default useCheckout;
