// PaymentCard Component
// Payment form - gateway is set by agent, user just pays

import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, CreditCard, Wallet } from 'lucide-react';
import { usePayment } from '@/hooks/use-payment';
import { GATEWAYS, formatAmount, tomansToRials } from '@/lib/payment/gateways';
import type { PaymentGateway, PaymentResponse } from '@/lib/payment/types';
import { cn } from '@/lib/utils';

interface PaymentCardProps {
  /** Payment gateway (required - set by agent) */
  gateway: PaymentGateway;
  /** Pre-filled amount (in Tomans for Iranian, USD for international) */
  defaultAmount?: number;
  /** Fixed amount (user cannot change) */
  fixedAmount?: number;
  /** Payment description */
  description?: string;
  /** Order ID */
  orderId?: string;
  /** Called on successful payment creation */
  onPaymentCreated?: (response: PaymentResponse) => void;
  /** Called on error */
  onError?: (error: string) => void;
  /** Card title */
  title?: string;
  /** Show gateway name badge */
  showGateway?: boolean;
  /** Additional className */
  className?: string;
}

export function PaymentCard({
  gateway,
  defaultAmount,
  fixedAmount,
  description = 'پرداخت آنلاین',
  orderId,
  onPaymentCreated,
  onError,
  title = 'پرداخت آنلاین',
  showGateway = false,
  className,
}: PaymentCardProps) {
  const [amount, setAmount] = useState<string>(
    (fixedAmount || defaultAmount || '').toString()
  );

  const { createPayment, isLoading, error } = usePayment({
    gateway,
    autoRedirect: true,
    onSuccess: onPaymentCreated,
    onError,
  });

  const gatewayConfig = GATEWAYS[gateway];
  const isIranian = !gatewayConfig.isInternational;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      onError?.('لطفا مبلغ صحیح وارد کنید');
      return;
    }

    // Convert Tomans to Rials for Iranian gateways
    const finalAmount = isIranian ? tomansToRials(numericAmount) : numericAmount;

    await createPayment({
      amount: finalAmount,
      description,
      orderId,
    });
  };

  const displayAmount = amount
    ? formatAmount(
        isIranian ? tomansToRials(parseFloat(amount) || 0) : parseFloat(amount) || 0,
        gatewayConfig.defaultCurrency
      )
    : '';

  return (
    <Card className={cn('w-full max-w-md', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {/* Gateway Badge (optional) */}
          {showGateway && (
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">
                {gatewayConfig.nameFa}
              </span>
            </div>
          )}

          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount">
              مبلغ ({isIranian ? 'تومان' : gatewayConfig.defaultCurrency})
            </Label>
            <Input
              id="amount"
              type="number"
              placeholder={`حداقل ${
                isIranian
                  ? gatewayConfig.minAmount / 10
                  : gatewayConfig.minAmount
              }`}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isLoading || fixedAmount !== undefined}
              min={
                isIranian
                  ? gatewayConfig.minAmount / 10
                  : gatewayConfig.minAmount
              }
              dir="ltr"
              className="text-left"
            />
            {amount && parseFloat(amount) > 0 && (
              <p className="text-sm text-muted-foreground">{displayAmount}</p>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg">
              {error}
            </div>
          )}
        </CardContent>

        <CardFooter>
          <Button
            type="submit"
            className="w-full gap-2"
            disabled={isLoading || !amount || parseFloat(amount) <= 0}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                در حال انتقال به درگاه...
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4" />
                پرداخت {displayAmount || ''}
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

export default PaymentCard;
