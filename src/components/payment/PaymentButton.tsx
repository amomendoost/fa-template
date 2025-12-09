// PaymentButton Component
// Simple button to create and redirect to payment

import { Button } from '@/components/ui/button';
import { Loader2, CreditCard } from 'lucide-react';
import { usePayment } from '@/hooks/use-payment';
import { formatAmount, getGateway } from '@/lib/payment/gateways';
import type { PaymentButtonProps } from '@/lib/payment/types';
import { cn } from '@/lib/utils';

export function PaymentButton({
  gateway,
  amount,
  currency,
  description,
  orderId,
  callbackUrl,
  onPaymentCreated,
  onError,
  children,
  className,
  disabled,
  loading: externalLoading,
}: PaymentButtonProps) {
  const config = getGateway(gateway);
  const effectiveCurrency = currency || config.defaultCurrency;

  const { createPayment, isLoading } = usePayment({
    gateway,
    autoRedirect: true,
    onSuccess: onPaymentCreated,
    onError,
  });

  const handleClick = async () => {
    await createPayment({
      amount,
      currency: effectiveCurrency,
      description,
      orderId,
      callbackUrl,
    });
  };

  const isDisabled = disabled || isLoading || externalLoading;
  const showLoading = isLoading || externalLoading;

  return (
    <Button
      onClick={handleClick}
      disabled={isDisabled}
      className={cn('gap-2', className)}
    >
      {showLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>در حال انتقال...</span>
        </>
      ) : (
        <>
          <CreditCard className="h-4 w-4" />
          <span>
            {children || `پرداخت ${formatAmount(amount, effectiveCurrency)}`}
          </span>
        </>
      )}
    </Button>
  );
}

export default PaymentButton;
