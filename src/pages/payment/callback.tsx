// Payment Callback Page
// Professional payment verification page

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
    <div
      className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted/30"
      dir="rtl"
    >
      {/* Background Pattern */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 -right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <PaymentCallback
        gateway={gateway}
        successRedirect="/"
        failureRedirect="/payment/demo"
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
