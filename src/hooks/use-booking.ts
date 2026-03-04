// useBookingSlots - fetches available booking slots for a product
import { useState, useEffect, useCallback } from 'react';
import { getBookingSlots } from '@/lib/shop/service';
import type { BookingSlot, BookingResource } from '@/lib/shop/types';

export function useBookingSlots(productId: string | undefined) {
  const [slots, setSlots] = useState<BookingSlot[]>([]);
  const [resources, setResources] = useState<BookingResource[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | undefined>();

  const fetch = useCallback(async () => {
    if (!productId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await getBookingSlots(productId, selectedDate);
      setSlots(data.slots);
      setResources(data.resources);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در دریافت زمان‌ها');
    } finally {
      setIsLoading(false);
    }
  }, [productId, selectedDate]);

  useEffect(() => { fetch(); }, [fetch]);

  return { slots, resources, isLoading, error, selectedDate, setSelectedDate, refresh: fetch };
}

export default useBookingSlots;
