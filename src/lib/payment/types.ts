// Payment Types - Gateway Agnostic
// Agent can use these types for any payment gateway

export type PaymentGateway =
  | 'zibal'
  | 'zarinpal'
  | 'idpay'
  | 'oxapay'
  | 'stripe'
  | 'paystar'
  | 'nextpay';

export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'paid'
  | 'failed'
  | 'expired'
  | 'refunded';

export type Currency = 'IRR' | 'IRT' | 'USD' | 'EUR' | 'USDT' | 'BTC' | 'ETH';

// ============================================
// Request Types
// ============================================

export interface PaymentRequest {
  /** Amount to charge (in smallest unit - Rials for IRR, cents for USD) */
  amount: number;
  /** Currency code */
  currency?: Currency;
  /** Where to redirect after payment */
  callbackUrl?: string;
  /** Payment description shown to user */
  description?: string;
  /** Your internal order ID for tracking */
  orderId?: string;
  /** Customer phone number (optional, for some gateways) */
  phone?: string;
  /** Customer email (optional) */
  email?: string;
  /** Customer name (optional) */
  name?: string;
  /** Custom metadata (will be returned in callback) */
  metadata?: Record<string, unknown>;
}

export interface PaymentVerifyRequest {
  /** Track ID returned from payment creation */
  trackId: string | number;
}

// ============================================
// Response Types
// ============================================

export interface PaymentResponse {
  success: boolean;
  data?: {
    /** Unique track ID for this payment */
    track_id: string;
    /** URL to redirect user to complete payment */
    payment_url: string;
    /** Original gateway-specific data */
    [key: string]: unknown;
  };
  error?: string;
}

export interface PaymentVerifyResponse {
  success: boolean;
  data?: {
    /** Payment status */
    status: string | number;
    /** Reference number from bank */
    refNumber?: string;
    ref_id?: string;
    /** Masked card number */
    cardNumber?: string;
    card_pan?: string;
    /** Amount paid */
    amount?: number;
    /** Original gateway-specific data */
    [key: string]: unknown;
  };
  error?: string;
}

// ============================================
// Component Props Types
// ============================================

export interface PaymentButtonProps {
  /** Payment gateway to use (required - set by agent) */
  gateway: PaymentGateway;
  /** Amount to charge */
  amount: number;
  /** Currency (default: IRR for Iranian gateways, USD for international) */
  currency?: Currency;
  /** Payment description */
  description?: string;
  /** Your order ID */
  orderId?: string;
  /** Custom callback URL (default: current page + /callback) */
  callbackUrl?: string;
  /** Called when payment URL is ready (before redirect) */
  onPaymentCreated?: (response: PaymentResponse) => void;
  /** Called on error */
  onError?: (error: string) => void;
  /** Button text (default: "Pay {amount}") */
  children?: React.ReactNode;
  /** Additional button className */
  className?: string;
  /** Disable the button */
  disabled?: boolean;
  /** Show loading state */
  loading?: boolean;
}

export interface PaymentCardProps {
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

export interface PaymentStatusProps {
  /** Current payment status */
  status: PaymentStatus | 'loading' | 'verifying';
  /** Reference number to display */
  refNumber?: string;
  /** Amount paid */
  amount?: number;
  /** Currency */
  currency?: Currency;
  /** Called when user clicks "Try Again" on failed payment */
  onRetry?: () => void;
  /** Called when user clicks "Continue" on success */
  onSuccess?: () => void;
  /** Custom messages */
  messages?: {
    loading?: string;
    verifying?: string;
    success?: string;
    failed?: string;
    expired?: string;
  };
}

export interface PaymentCallbackProps {
  /** Payment gateway that was used */
  gateway: PaymentGateway;
  /** Called after successful verification */
  onSuccess?: (data: PaymentVerifyResponse['data']) => void;
  /** Called on verification failure */
  onError?: (error: string) => void;
  /** Where to redirect after success (optional) */
  successRedirect?: string;
  /** Where to redirect after failure (optional) */
  failureRedirect?: string;
}

// ============================================
// Hook Return Types
// ============================================

export interface UsePaymentReturn {
  /** Create a new payment and get redirect URL */
  createPayment: (request: PaymentRequest) => Promise<PaymentResponse>;
  /** Currently creating payment */
  isLoading: boolean;
  /** Last error message */
  error: string | null;
  /** Last successful response */
  data: PaymentResponse | null;
  /** Reset state */
  reset: () => void;
}

export interface UsePaymentVerifyReturn {
  /** Verify a payment by track ID */
  verifyPayment: (trackId: string | number) => Promise<PaymentVerifyResponse>;
  /** Currently verifying */
  isVerifying: boolean;
  /** Verification error */
  error: string | null;
  /** Verification result */
  data: PaymentVerifyResponse | null;
  /** Is payment successful */
  isSuccess: boolean;
  /** Reset state */
  reset: () => void;
}

// ============================================
// Gateway Configuration
// ============================================

export interface GatewayConfig {
  id: PaymentGateway;
  name: string;
  nameFa: string;
  /** Feature ID for creating payment */
  createFeature: string;
  /** Feature ID for verifying payment */
  verifyFeature: string;
  /** Default currency for this gateway */
  defaultCurrency: Currency;
  /** Minimum amount in default currency */
  minAmount: number;
  /** URL parameter name for track ID in callback */
  trackIdParam: string;
  /** Is this an international gateway */
  isInternational: boolean;
}
