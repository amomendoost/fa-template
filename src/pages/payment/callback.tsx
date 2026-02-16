// Payment Callback Page
// Handles payment verification and updates shop order status

import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { verifyPayment, extractTrackIdFromUrl } from '@/lib/payment/service';
import { verifyShopPayment } from '@/lib/shop/service';
import { clearCart } from '@/lib/shop/cart';
import { isValidGateway } from '@/lib/payment';
import type { PaymentGateway } from '@/lib/payment';

// Auto-detect gateway from URL params
function detectGatewayFromParams(params: URLSearchParams): PaymentGateway {
  const explicit = params.get('gateway');
  if (explicit && isValidGateway(explicit)) {
    return explicit;
  }

  if (params.has('Authority')) return 'zarinpal';
  if (params.has('trackId')) return 'zibal';
  if (params.has('id') && params.has('order_id')) return 'idpay';
  if (params.has('trans_id')) return 'nextpay';
  if (params.has('ref_num')) return 'paystar';
  if (params.has('session_id')) return 'stripe';

  return 'zibal';
}

type VerifyStatus = 'verifying' | 'success' | 'failed';

export default function PaymentCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState<VerifyStatus>('verifying');
  const [refNumber, setRefNumber] = useState<string | null>(null);
  const [cardNumber, setCardNumber] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const gateway = detectGatewayFromParams(searchParams);
  const trackId = extractTrackIdFromUrl(gateway, searchParams);
  const orderNumber = searchParams.get('orderNumber');

  useEffect(() => {
    if (!trackId) {
      setStatus('failed');
      setError('کد پیگیری یافت نشد');
      return;
    }

    const verify = async () => {
      try {
        // Step 1: Verify with payment gateway
        const gatewayResult = await verifyPayment(gateway, { trackId });

        if (!gatewayResult.success) {
          setStatus('failed');
          setError(gatewayResult.error || 'پرداخت تأیید نشد');
          return;
        }

        // Step 2: Update shop order status
        const shopResult = await verifyShopPayment({
          track_id: trackId,
          order_number: orderNumber || undefined,
        });

        if (shopResult.success) {
          setStatus('success');
          setRefNumber(shopResult.ref_number || gatewayResult.data?.refNumber || null);
          setCardNumber(shopResult.card_number || gatewayResult.data?.cardNumber || null);
          clearCart(); // Clear cart after successful payment
        } else {
          // Gateway verified but shop update failed - still show success
          // (payment is done, order update is secondary)
          setStatus('success');
          setRefNumber(gatewayResult.data?.refNumber || null);
          setCardNumber(gatewayResult.data?.cardNumber || null);
          clearCart(); // Clear cart anyway since payment was successful
          console.warn('Shop order update failed:', shopResult.error);
        }
      } catch (err) {
        setStatus('failed');
        setError(err instanceof Error ? err.message : 'خطا در تأیید پرداخت');
      }
    };

    verify();
  }, [gateway, trackId, orderNumber]);

  const handleGoToOrder = () => {
    if (orderNumber) {
      navigate(`/order/${orderNumber}`);
    } else {
      navigate('/order'); // Go to order tracking page
    }
  };

  const handleRetry = () => {
    // Reset state and try again
    setStatus('verifying');
    setError(null);
    window.location.reload();
  };

  const handleGoToCheckout = () => {
    navigate('/checkout');
  };

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

      <Card className="w-full max-w-md">
        <CardContent className="pt-8 pb-6">
          {status === 'verifying' && (
            <div className="text-center space-y-4">
              <Loader2 className="w-16 h-16 mx-auto text-primary animate-spin" />
              <h2 className="text-xl font-bold">در حال بررسی پرداخت</h2>
              <p className="text-muted-foreground">لطفاً صبر کنید...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center space-y-4">
              <div className="w-20 h-20 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-green-600">پرداخت موفق</h2>
              <p className="text-muted-foreground">سفارش شما با موفقیت ثبت شد</p>

              {orderNumber && (
                <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                  <p className="text-sm text-muted-foreground">شماره سفارش</p>
                  <p className="text-lg font-bold font-mono" dir="ltr">{orderNumber}</p>
                </div>
              )}

              {refNumber && (
                <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                  <p className="text-sm text-muted-foreground">کد پیگیری</p>
                  <p className="font-mono text-sm" dir="ltr">{refNumber}</p>
                </div>
              )}

              {cardNumber && (
                <p className="text-sm text-muted-foreground">
                  پرداخت از کارت: <span dir="ltr" className="font-mono">{cardNumber}</span>
                </p>
              )}

              <Button onClick={handleGoToOrder} className="w-full mt-4">
                مشاهده سفارش
              </Button>
            </div>
          )}

          {status === 'failed' && (
            <div className="text-center space-y-4">
              <div className="w-20 h-20 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <XCircle className="w-12 h-12 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-red-600">پرداخت ناموفق</h2>
              <p className="text-muted-foreground">{error || 'پرداخت انجام نشد'}</p>

              <div className="space-y-2">
                <Button onClick={handleRetry} variant="outline" className="w-full gap-2">
                  <RefreshCw className="w-4 h-4" />
                  بررسی مجدد
                </Button>
                <Button onClick={handleGoToCheckout} variant="ghost" className="w-full">
                  بازگشت به صفحه پرداخت
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
