// Payment Callback Page
// Verifies payment after returning from gateway

import { useSearchParams } from 'react-router-dom';
import { PaymentCallback } from '@/components/payment';
import { isValidGateway } from '@/lib/payment';
import type { PaymentGateway } from '@/lib/payment';

export default function PaymentCallbackPage() {
  const [searchParams] = useSearchParams();

  // Get gateway from URL params
  const gatewayParam = searchParams.get('gateway') || 'zibal';
  const gateway: PaymentGateway = isValidGateway(gatewayParam)
    ? gatewayParam
    : 'zibal';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20 p-4">
      <PaymentCallback
        gateway={gateway}
        successRedirect="/"
        failureRedirect="/"
        onSuccess={(data) => {
          console.log('Payment verified:', data);
        }}
        onError={(error) => {
          console.error('Payment verification failed:', error);
        }}
      />
    </div>
  );
}
