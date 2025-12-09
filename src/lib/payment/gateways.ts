// Gateway Configurations
// Agent can easily add new gateways here

import type { GatewayConfig, PaymentGateway } from './types';

export const GATEWAYS: Record<PaymentGateway, GatewayConfig> = {
  // Iranian Gateways
  zibal: {
    id: 'zibal',
    name: 'Zibal',
    nameFa: 'زیبال',
    createFeature: 'request',
    verifyFeature: 'verify',
    defaultCurrency: 'IRR',
    minAmount: 1000,
    trackIdParam: 'trackId',
    isInternational: false,
  },
  zarinpal: {
    id: 'zarinpal',
    name: 'ZarinPal',
    nameFa: 'زرین‌پال',
    createFeature: 'request',
    verifyFeature: 'verify',
    defaultCurrency: 'IRR',
    minAmount: 1000,
    trackIdParam: 'Authority',
    isInternational: false,
  },
  idpay: {
    id: 'idpay',
    name: 'IDPay',
    nameFa: 'آیدی پی',
    createFeature: 'request',
    verifyFeature: 'verify',
    defaultCurrency: 'IRR',
    minAmount: 1000,
    trackIdParam: 'id',
    isInternational: false,
  },
  paystar: {
    id: 'paystar',
    name: 'PayStar',
    nameFa: 'پی استار',
    createFeature: 'create',
    verifyFeature: 'verify',
    defaultCurrency: 'IRR',
    minAmount: 5000,
    trackIdParam: 'ref_num',
    isInternational: false,
  },
  nextpay: {
    id: 'nextpay',
    name: 'NextPay',
    nameFa: 'نکست پی',
    createFeature: 'request',
    verifyFeature: 'verify',
    defaultCurrency: 'IRR',
    minAmount: 1000,
    trackIdParam: 'trans_id',
    isInternational: false,
  },

  // International Gateways
  oxapay: {
    id: 'oxapay',
    name: 'OxaPay',
    nameFa: 'اکساپی (کریپتو)',
    createFeature: 'create',
    verifyFeature: 'verify',
    defaultCurrency: 'USD',
    minAmount: 1,
    trackIdParam: 'trackId',
    isInternational: true,
  },
  stripe: {
    id: 'stripe',
    name: 'Stripe',
    nameFa: 'استرایپ',
    createFeature: 'checkout',
    verifyFeature: 'verify',
    defaultCurrency: 'USD',
    minAmount: 50, // 50 cents
    trackIdParam: 'session_id',
    isInternational: true,
  },
};

// Get gateway config by ID
export function getGateway(gateway: PaymentGateway): GatewayConfig {
  return GATEWAYS[gateway];
}

// Get all Iranian gateways
export function getIranianGateways(): GatewayConfig[] {
  return Object.values(GATEWAYS).filter((g) => !g.isInternational);
}

// Get all international gateways
export function getInternationalGateways(): GatewayConfig[] {
  return Object.values(GATEWAYS).filter((g) => g.isInternational);
}

// Check if gateway is valid
export function isValidGateway(gateway: string): gateway is PaymentGateway {
  return gateway in GATEWAYS;
}

// Format amount for display
export function formatAmount(
  amount: number,
  currency: string = 'IRR',
  locale: string = 'fa-IR'
): string {
  // Convert Rials to Tomans for display
  if (currency === 'IRR') {
    const tomans = Math.floor(amount / 10);
    return new Intl.NumberFormat(locale).format(tomans) + ' تومان';
  }

  // For international currencies
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: currency === 'USD' ? 2 : 0,
  }).format(amount);
}

// Convert Tomans to Rials
export function tomansToRials(tomans: number): number {
  return tomans * 10;
}

// Convert Rials to Tomans
export function rialsToTomans(rials: number): number {
  return Math.floor(rials / 10);
}
