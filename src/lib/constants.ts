export const APP_NAME = "نوقطه";
export const APP_VERSION = "2.0.0";

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1400,
} as const;

export const ROUTES = {
  HOME: "/",
  PAYMENT_CALLBACK: "/payment/callback",
} as const;

export const PAGE_SIZES = [10, 20, 50, 100] as const;
