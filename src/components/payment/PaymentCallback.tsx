// PaymentCallback Component
// Handles payment verification after returning from gateway

import { useNavigate } from 'react-router-dom';
import { usePaymentVerify } from '@/hooks/use-payment-verify';
import { PaymentStatus } from './PaymentStatus';
import type { PaymentCallbackProps, PaymentStatus as PaymentStatusType } from '@/lib/payment/types';

export function PaymentCallback({
  gateway,
  onSuccess,
  onError,
  successRedirect,
  failureRedirect,
}: PaymentCallbackProps) {
  const navigate = useNavigate();

  const { isVerifying, data, isSuccess, error } = usePaymentVerify({
    gateway,
    autoVerify: true,
    onSuccess: (verifyData) => {
      onSuccess?.(verifyData);
    },
    onError: (err) => {
      onError?.(err);
    },
  });

  // Determine the status to show
  let status: PaymentStatusType | 'loading' | 'verifying' = 'verifying';
  if (!isVerifying && data) {
    status = isSuccess ? 'paid' : 'failed';
  }

  const handleRetry = () => {
    if (failureRedirect) {
      navigate(failureRedirect);
    } else {
      navigate(-1); // Go back
    }
  };

  const handleSuccess = () => {
    if (successRedirect) {
      navigate(successRedirect);
    }
  };

  return (
    <div className="min-h-[400px] flex items-center justify-center p-4">
      <PaymentStatus
        status={status}
        refNumber={data?.data?.refNumber || data?.data?.ref_id}
        amount={data?.data?.amount}
        onRetry={handleRetry}
        onSuccess={successRedirect ? handleSuccess : undefined}
      />
    </div>
  );
}

export default PaymentCallback;
