// Payment Callback Page
// Professional payment verification page

import { useSearchParams } from 'react-router-dom';
import { PaymentCallback } from '@/components/payment';
import { isValidGateway } from '@/lib/payment';
import type { PaymentGateway } from '@/lib/payment';

// Auto-detect gateway from URL params
function detectGatewayFromParams(params: URLSearchParams): PaymentGateway {
  // Explicit gateway param takes priority
  const explicit = params.get('gateway');
  if (explicit && isValidGateway(explicit)) {
    return explicit;
  }

  // Auto-detect from callback params
  if (params.has('Authority')) return 'zarinpal';  // ZarinPal sends Authority
  if (params.has('trackId')) return 'zibal';       // Zibal sends trackId
  if (params.has('id') && params.has('order_id')) return 'idpay';  // IDPay
  if (params.has('trans_id')) return 'nextpay';    // NextPay
  if (params.has('ref_num')) return 'paystar';     // PayStar
  if (params.has('session_id')) return 'stripe';   // Stripe

  // Default fallback
  return 'zibal';
}

export default function PaymentCallbackPage() {
  const [searchParams] = useSearchParams();

  // Auto-detect gateway from URL params
  const gateway = detectGatewayFromParams(searchParams);

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
