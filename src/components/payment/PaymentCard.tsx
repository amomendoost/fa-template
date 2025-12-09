// PaymentCard Component
// Complete payment form with amount input and gateway selection

import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, CreditCard, Wallet } from 'lucide-react';
import { usePayment } from '@/hooks/use-payment';
import {
  GATEWAYS,
  getIranianGateways,
  getInternationalGateways,
  formatAmount,
  tomansToRials,
} from '@/lib/payment/gateways';
import type { PaymentGateway, PaymentResponse } from '@/lib/payment/types';
import { cn } from '@/lib/utils';

interface PaymentCardProps {
  /** Pre-selected gateway */
  defaultGateway?: PaymentGateway;
  /** Pre-filled amount (in Tomans for Iranian, USD for international) */
  defaultAmount?: number;
  /** Fixed amount (user cannot change) */
  fixedAmount?: number;
  /** Fixed gateway (user cannot change) */
  fixedGateway?: PaymentGateway;
  /** Show only Iranian or international gateways */
  gatewayType?: 'iranian' | 'international' | 'all';
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
  /** Additional className */
  className?: string;
}

export function PaymentCard({
  defaultGateway = 'zibal',
  defaultAmount,
  fixedAmount,
  fixedGateway,
  gatewayType = 'all',
  description = 'پرداخت آنلاین',
  orderId,
  onPaymentCreated,
  onError,
  title = 'پرداخت آنلاین',
  className,
}: PaymentCardProps) {
  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway>(
    fixedGateway || defaultGateway
  );
  const [amount, setAmount] = useState<string>(
    (fixedAmount || defaultAmount || '').toString()
  );

  const { createPayment, isLoading, error } = usePayment({
    gateway: selectedGateway,
    autoRedirect: true,
    onSuccess: onPaymentCreated,
    onError,
  });

  // Get available gateways based on type
  const availableGateways =
    gatewayType === 'iranian'
      ? getIranianGateways()
      : gatewayType === 'international'
      ? getInternationalGateways()
      : Object.values(GATEWAYS);

  const currentGatewayConfig = GATEWAYS[selectedGateway];
  const isIranian = !currentGatewayConfig.isInternational;

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
        currentGatewayConfig.defaultCurrency
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
          {/* Gateway Selection */}
          {!fixedGateway && availableGateways.length > 1 && (
            <div className="space-y-2">
              <Label htmlFor="gateway">درگاه پرداخت</Label>
              <Select
                value={selectedGateway}
                onValueChange={(v) => setSelectedGateway(v as PaymentGateway)}
                disabled={isLoading}
              >
                <SelectTrigger id="gateway">
                  <SelectValue placeholder="انتخاب درگاه" />
                </SelectTrigger>
                <SelectContent>
                  {availableGateways.map((gw) => (
                    <SelectItem key={gw.id} value={gw.id}>
                      {gw.nameFa} ({gw.name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Fixed Gateway Display */}
          {fixedGateway && (
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">
                {currentGatewayConfig.nameFa} ({currentGatewayConfig.name})
              </span>
            </div>
          )}

          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount">
              مبلغ ({isIranian ? 'تومان' : currentGatewayConfig.defaultCurrency})
            </Label>
            <Input
              id="amount"
              type="number"
              placeholder={`حداقل ${
                isIranian
                  ? currentGatewayConfig.minAmount / 10
                  : currentGatewayConfig.minAmount
              }`}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isLoading || fixedAmount !== undefined}
              min={
                isIranian
                  ? currentGatewayConfig.minAmount / 10
                  : currentGatewayConfig.minAmount
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
