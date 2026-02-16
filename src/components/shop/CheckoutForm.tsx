// CheckoutForm - customer info + order creation + payment redirect
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Loader2, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '@/hooks/use-cart';
import { useCheckout } from '@/hooks/use-checkout';
import { PriceTag } from './PriceTag';
import { OrderConfirmation } from './OrderConfirmation';
import { CouponInput } from './CouponInput';
import type { CustomerInfo, Order } from '@/lib/shop/types';

interface CheckoutFormProps {
  onSuccess?: () => void;
  integrationId?: string;
  callbackUrl?: string;
  autoRedirectSeconds?: number;
  className?: string;
}

export function CheckoutForm({
  onSuccess,
  integrationId,
  callbackUrl,
  autoRedirectSeconds = 5,
  className,
}: CheckoutFormProps) {
  const { items, total, currency } = useCart();
  const { placeOrder, startCheckout, isLoading, error } = useCheckout({
    integrationId,
    callbackUrl,
  });
  // Note: Cart is cleared in callback page after successful payment

  const [form, setForm] = useState<CustomerInfo>({
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
  });

  // Two-step flow: order creation, then payment redirect
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const update = (field: keyof CustomerInfo, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Prevent double submission
    if (items.length === 0 || isLoading || createdOrder) return;

    // Step 1: Create order
    const order = await placeOrder(items, form);
    if (order) {
      // Show confirmation, don't redirect yet
      setCreatedOrder(order);
    }
  };

  const handleProceedToPayment = async () => {
    // Prevent double payment
    if (!createdOrder || isRedirecting) return;

    setIsRedirecting(true);
    // Step 2: Start payment (this will redirect)
    await startCheckout(createdOrder.id, createdOrder.order_number);
    // If we get here, something went wrong (didn't redirect)
    setIsRedirecting(false);
  };

  // Empty cart state
  if (items.length === 0 && !createdOrder) {
    return (
      <div className={cn('text-center py-12 text-muted-foreground', className)}>
        سبد خرید شما خالی است
      </div>
    );
  }

  // Step 2: Show order confirmation before payment
  if (createdOrder) {
    return (
      <div className={className}>
        <OrderConfirmation
          order={createdOrder}
          onProceedToPayment={handleProceedToPayment}
          isRedirecting={isRedirecting}
          autoRedirectSeconds={autoRedirectSeconds}
        />
        {error && (
          <p className="text-sm text-destructive text-center mt-4">{error}</p>
        )}
      </div>
    );
  }

  // Step 1: Show checkout form
  return (
    <form onSubmit={handleSubmit} className={cn('space-y-6', className)}>
      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">خلاصه سفارش</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {items.map((item) => (
            <div key={`${item.product.id}-${item.variant || ''}`} className="flex justify-between text-sm">
              <span>
                {item.product.name} x {item.quantity}
                {item.variant && <span className="text-muted-foreground"> ({item.variant})</span>}
              </span>
              <PriceTag price={item.product.price * item.quantity} currency={item.product.currency} />
            </div>
          ))}
          <Separator className="my-2" />
          <div className="flex justify-between font-bold">
            <span>جمع کل</span>
            <PriceTag price={total} currency={currency} />
          </div>
        </CardContent>
      </Card>

      {/* Coupon */}
      <CouponInput className="max-w-sm" />

      {/* Customer Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">اطلاعات خریدار</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">نام و نام خانوادگی</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                placeholder="علی محمدی"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">شماره موبایل *</Label>
              <Input
                id="phone"
                type="tel"
                required
                dir="ltr"
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
                placeholder="09123456789"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">ایمیل</Label>
            <Input
              id="email"
              type="email"
              dir="ltr"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              placeholder="email@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">آدرس</Label>
            <Textarea
              id="address"
              value={form.address}
              onChange={(e) => update('address', e.target.value)}
              placeholder="آدرس پستی"
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">توضیحات</Label>
            <Textarea
              id="notes"
              value={form.notes}
              onChange={(e) => update('notes', e.target.value)}
              placeholder="توضیحات اضافی (اختیاری)"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {error && (
        <p className="text-sm text-destructive text-center">{error}</p>
      )}

      <Button type="submit" className="w-full gap-2" size="lg" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            در حال ثبت سفارش...
          </>
        ) : (
          <>
            <CreditCard className="h-4 w-4" />
            ثبت سفارش و پرداخت
          </>
        )}
      </Button>
    </form>
  );
}

export default CheckoutForm;
