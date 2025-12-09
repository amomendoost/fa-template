// Payment Service Layer
// All API calls to the payment proxy go through here

import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';
import { getGateway } from './gateways';
import type {
  PaymentGateway,
  PaymentRequest,
  PaymentResponse,
  PaymentVerifyRequest,
  PaymentVerifyResponse,
} from './types';

// Get the base URL for API calls
function getBaseUrl(): string {
  const url = import.meta.env.VITE_SUPABASE_URL || '';
  if (!url) {
    console.error('VITE_SUPABASE_URL not configured');
  }
  return url;
}

// Get auth token for API calls
async function getAuthToken(): Promise<string | null> {
  if (!isSupabaseConfigured() || !supabase) {
    return null;
  }
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
}

// ============================================
// Create Payment
// ============================================

export async function createPayment(
  gateway: PaymentGateway,
  request: PaymentRequest
): Promise<PaymentResponse> {
  const baseUrl = getBaseUrl();
  const token = await getAuthToken();
  const config = getGateway(gateway);

  // Build callback URL if not provided
  const callbackUrl = request.callbackUrl ||
    `${window.location.origin}/payment/callback?gateway=${gateway}`;

  // Prepare request body based on gateway
  const body: Record<string, unknown> = {
    amount: request.amount,
    callbackUrl,
    callback: callbackUrl, // IDPay uses 'callback'
    callback_url: callbackUrl, // Some gateways use snake_case
    return_url: callbackUrl, // OxaPay uses return_url
    success_url: `${callbackUrl}&status=success`, // Stripe
    cancel_url: `${callbackUrl}&status=cancelled`, // Stripe
    description: request.description || 'Payment',
    desc: request.description, // IDPay uses 'desc'
    product_name: request.description, // Stripe
    orderId: request.orderId,
    order_id: request.orderId,
    mobile: request.phone,
    phone: request.phone,
    customer_phone: request.phone,
    email: request.email,
    mail: request.email, // IDPay
    name: request.name,
    currency: request.currency || config.defaultCurrency,
    metadata: request.metadata,
  };

  // Remove undefined values
  Object.keys(body).forEach((key) => {
    if (body[key] === undefined) {
      delete body[key];
    }
  });

  try {
    const response = await fetch(
      `${baseUrl}/integrations/${gateway}/${config.createFeature}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      return {
        success: false,
        error: data.error || 'Payment creation failed',
      };
    }

    return {
      success: true,
      data: {
        track_id: data.data?.track_id || data.data?.trackId || data.data?.authority,
        payment_url: data.data?.payment_url || data.data?.paymentUrl || data.data?.link,
        ...data.data,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

// ============================================
// Verify Payment
// ============================================

export async function verifyPayment(
  gateway: PaymentGateway,
  request: PaymentVerifyRequest
): Promise<PaymentVerifyResponse> {
  const baseUrl = getBaseUrl();
  const token = await getAuthToken();
  const config = getGateway(gateway);

  try {
    const response = await fetch(
      `${baseUrl}/integrations/${gateway}/${config.verifyFeature}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          trackId: request.trackId,
          track_id: request.trackId,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Verification failed',
      };
    }

    // Check if payment was successful based on various gateway responses
    const isSuccess =
      data.success && (
        data.data?.result === 100 || // Zibal success
        data.data?.result === 201 || // Zibal already verified
        data.data?.status === 100 || // IDPay
        data.data?.status === 'success' || // ZarinPal
        data.data?.status === 'paid' || // Stripe
        data.data?.status === 'Paid' || // OxaPay
        data.data?.code === 0 // NextPay
      );

    return {
      success: isSuccess,
      data: {
        status: data.data?.status || data.data?.result,
        refNumber: data.data?.refNumber || data.data?.ref_id || data.data?.Shaparak_Ref_Id,
        cardNumber: data.data?.cardNumber || data.data?.card_pan || data.data?.card_number,
        amount: data.data?.amount,
        ...data.data,
      },
      error: isSuccess ? undefined : data.error || 'Payment was not successful',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

// ============================================
// Extract Track ID from URL
// ============================================

export function extractTrackIdFromUrl(
  gateway: PaymentGateway,
  searchParams?: URLSearchParams
): string | null {
  const params = searchParams || new URLSearchParams(window.location.search);
  const config = getGateway(gateway);

  // Try the gateway-specific param first
  let trackId = params.get(config.trackIdParam);

  // Fallback to common param names
  if (!trackId) {
    trackId =
      params.get('trackId') ||
      params.get('track_id') ||
      params.get('Authority') ||
      params.get('id') ||
      params.get('trans_id') ||
      params.get('ref_num') ||
      params.get('session_id') ||
      params.get('token');
  }

  return trackId;
}

// ============================================
// Redirect to Payment
// ============================================

export function redirectToPayment(paymentUrl: string): void {
  window.location.href = paymentUrl;
}

// ============================================
// Create and Redirect (Convenience function)
// ============================================

export async function createAndRedirect(
  gateway: PaymentGateway,
  request: PaymentRequest
): Promise<PaymentResponse> {
  const response = await createPayment(gateway, request);

  if (response.success && response.data?.payment_url) {
    redirectToPayment(response.data.payment_url);
  }

  return response;
}
