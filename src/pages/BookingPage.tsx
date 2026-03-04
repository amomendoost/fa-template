// BookingPage - standalone booking page for booking-type products
import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingCart, ChevronRight, Loader2 } from 'lucide-react';
import { BookingCalendar } from '@/components/shop/booking/BookingCalendar';
import { SlotPicker } from '@/components/shop/booking/SlotPicker';
import { BookingHoldBanner } from '@/components/shop/booking/BookingHoldBanner';
import { PriceTag } from '@/components/shop/PriceTag';
import { useProduct } from '@/hooks/use-product';
import { useBookingSlots } from '@/hooks/use-booking';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import { holdBookingSlot } from '@/lib/shop/service';
import type { BookingSlot, BookingHold } from '@/lib/shop/types';

export default function BookingPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { product, isLoading: productLoading } = useProduct(slug);
  const { slots, isLoading: slotsLoading, selectedDate, setSelectedDate } = useBookingSlots(product?.id);
  const { addItem } = useCart();
  const { toast } = useToast();

  const [selectedSlot, setSelectedSlot] = useState<BookingSlot | null>(null);
  const [hold, setHold] = useState<BookingHold | null>(null);
  const [holdLoading, setHoldLoading] = useState(false);

  const handleSlotSelect = useCallback(async (slot: BookingSlot) => {
    setSelectedSlot(slot);
    setHoldLoading(true);
    try {
      const h = await holdBookingSlot(slot.id);
      setHold(h);
    } catch {
      toast({ title: 'خطا در رزرو موقت', description: 'لطفاً دوباره تلاش کنید', variant: 'destructive' });
    } finally {
      setHoldLoading(false);
    }
  }, [toast]);

  const handleAddToCart = () => {
    if (!product || !selectedSlot) return;
    addItem(product, 1, `booking:${selectedSlot.id}`);
    toast({ title: 'رزرو به سبد خرید اضافه شد', description: product.name });
    navigate('/checkout');
  };

  if (productLoading) {
    return (
      <div className="min-h-screen bg-background p-4" dir="rtl">
        <div className="max-w-xl mx-auto space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" dir="rtl">
        <p className="text-muted-foreground">محصول یافت نشد</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <title>رزرو - {product.name}</title>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => navigate(`/shop/${slug}`)}>
              <ChevronRight className="h-4 w-4" />
              بازگشت
            </Button>
            <h1 className="text-sm font-medium line-clamp-1">رزرو {product.name}</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-xl space-y-6">
        {/* Hold banner */}
        {hold && (
          <BookingHoldBanner
            expiresAt={hold.expires_at}
            onExpired={() => { setHold(null); setSelectedSlot(null); }}
          />
        )}

        {/* Calendar */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">انتخاب تاریخ</CardTitle>
          </CardHeader>
          <CardContent>
            <BookingCalendar
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
            />
          </CardContent>
        </Card>

        {/* Slots */}
        {selectedDate && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">انتخاب ساعت</CardTitle>
            </CardHeader>
            <CardContent>
              {slotsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <SlotPicker
                  slots={slots}
                  selectedSlotId={selectedSlot?.id}
                  onSlotSelect={handleSlotSelect}
                />
              )}
            </CardContent>
          </Card>
        )}

        {/* Summary + Add to cart */}
        {selectedSlot && hold && (
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">محصول</span>
                <span className="font-medium">{product.name}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">قیمت</span>
                <PriceTag price={selectedSlot.price || product.price} currency={product.currency} />
              </div>
              <Button className="w-full gap-2" onClick={handleAddToCart} disabled={holdLoading}>
                {holdLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingCart className="h-4 w-4" />}
                افزودن به سبد و ادامه
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
