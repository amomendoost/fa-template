// Shop Service Layer
// API calls to shop edge function — follows payment/service.ts pattern
// Supports dual-mode: Guest + Authenticated users

import type {
  Product,
  ProductCategory,
  ProductFilterParams,
  PaginatedResponse,
  Pagination,
  Order,
  CartItem,
  CustomerInfo,
  CheckoutRequest,
  CheckoutResponse,
  ProductReview,
} from './types';

type ApiProductImage = string | { url?: string | null } | null;
type ApiProduct = Omit<Product, 'images'> & {
  images?: ApiProductImage[] | null;
};

function normalizeProductImages(images: ApiProduct['images']): string[] {
  if (!Array.isArray(images)) return [];

  return images
    .map((image) => {
      if (typeof image === 'string') return image;
      if (image && typeof image === 'object' && typeof image.url === 'string') return image.url;
      return null;
    })
    .filter((image): image is string => Boolean(image));
}

function normalizeProduct(product: ApiProduct): Product {
  return {
    ...product,
    images: normalizeProductImages(product.images),
  };
}

function getBaseUrl(): string {
  const url = import.meta.env.VITE_API_URL || '';
  const projectId = import.meta.env.VITE_PROJECT_ID || '';
  if (!url || !projectId) {
    console.error('VITE_API_URL and VITE_PROJECT_ID must be configured');
  }
  return `${url}/functions/v1/shop/${projectId}`;
}

// Get auth token from storage (if user is logged in)
function getAuthToken(): string | null {
  // Check multiple possible storage locations
  const token = localStorage.getItem('auth_token') ||
                localStorage.getItem('supabase.auth.token') ||
                sessionStorage.getItem('auth_token');
  return token;
}

interface FetchOptions extends RequestInit {
  requireAuth?: boolean;
  authToken?: string;
}

async function fetchJson<T>(path: string, options?: FetchOptions): Promise<T> {
  const { requireAuth, authToken, ...fetchOptions } = options || {};

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string> || {}),
  };

  // Add auth header if available
  const token = authToken || getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else if (requireAuth) {
    throw new Error('Authentication required');
  }

  const res = await fetch(`${getBaseUrl()}${path}`, {
    ...fetchOptions,
    headers,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export async function getProducts(
  params?: ProductFilterParams
): Promise<PaginatedResponse<Product>> {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.category) query.set('category', params.category);
  if (params?.search) query.set('search', params.search);
  if (params?.sort && params.sort !== 'default') query.set('sort', params.sort);
  if (params?.min_price) query.set('min_price', String(params.min_price));
  if (params?.max_price) query.set('max_price', String(params.max_price));

  const qs = query.toString();
  const data = await fetchJson<{ products: ApiProduct[]; pagination: Pagination }>(
    `/products${qs ? `?${qs}` : ''}`
  );
  return { data: data.products.map(normalizeProduct), pagination: data.pagination };
}

export async function getProduct(slug: string): Promise<Product> {
  const data = await fetchJson<{ product: ApiProduct }>(`/products/${encodeURIComponent(slug)}`);
  return normalizeProduct(data.product);
}

export async function getRelatedProducts(slug: string): Promise<Product[]> {
  const data = await fetchJson<{ products: ApiProduct[] }>(
    `/products/${encodeURIComponent(slug)}/related`
  );
  return data.products.map(normalizeProduct);
}

export async function getProductReviews(slug: string): Promise<ProductReview[]> {
  const data = await fetchJson<{ reviews: ProductReview[] }>(
    `/products/${encodeURIComponent(slug)}/reviews`
  );
  return data.reviews;
}

export async function submitReview(
  slug: string,
  review: { author_name: string; author_email?: string; rating: number; title?: string; content?: string }
): Promise<void> {
  await fetchJson(`/products/${encodeURIComponent(slug)}/reviews`, {
    method: 'POST',
    body: JSON.stringify(review),
  });
}

export async function getCategories(): Promise<ProductCategory[]> {
  const data = await fetchJson<{ categories: ProductCategory[] }>('/categories');
  return data.categories;
}

export async function createOrder(
  items: CartItem[],
  customerInfo: CustomerInfo,
  currency?: string
): Promise<Order> {
  const orderItems = items.map((item) => ({
    product_id: item.product.id,
    quantity: item.quantity,
    variant: item.variant,
  }));

  const data = await fetchJson<{ success: boolean; order: Order }>('/orders', {
    method: 'POST',
    body: JSON.stringify({
      items: orderItems,
      customer_info: customerInfo,
      currency,
    }),
  });
  return data.order;
}

export async function getOrder(orderNumber: string): Promise<Order> {
  const data = await fetchJson<{ order: Order }>(`/orders/${encodeURIComponent(orderNumber)}`);
  return data.order;
}

export async function checkout(request: CheckoutRequest): Promise<CheckoutResponse> {
  return fetchJson<CheckoutResponse>('/checkout', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export interface VerifyPaymentRequest {
  track_id: string | number;
  order_number?: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  order_number?: string;
  status?: string;
  ref_number?: string;
  card_number?: string;
  already_paid?: boolean;
  error?: string;
}

export async function verifyShopPayment(request: VerifyPaymentRequest): Promise<VerifyPaymentResponse> {
  return fetchJson<VerifyPaymentResponse>('/verify-payment', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

// ========================================
// Authenticated User Endpoints
// ========================================

export interface MyOrdersResponse {
  orders: Order[];
  pagination: Pagination;
}

/**
 * Get current user's order history (requires authentication)
 */
export async function getMyOrders(
  params?: { page?: number; limit?: number },
  authToken?: string
): Promise<MyOrdersResponse> {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));

  const qs = query.toString();
  return fetchJson<MyOrdersResponse>(`/my-orders${qs ? `?${qs}` : ''}`, {
    requireAuth: true,
    authToken,
  });
}

/**
 * Link a guest order to current user's account (requires authentication)
 * Optionally verify phone number matches the order
 */
export async function linkOrderToAccount(
  orderNumber: string,
  verifyPhone?: string,
  authToken?: string
): Promise<{ success: boolean; message?: string }> {
  return fetchJson('/link-order', {
    method: 'POST',
    requireAuth: true,
    authToken,
    body: JSON.stringify({
      order_number: orderNumber,
      verify_phone: verifyPhone,
    }),
  });
}

/**
 * Create order with optional authentication
 * If authToken provided, order will be linked to user account
 */
export async function createOrderWithAuth(
  items: CartItem[],
  customerInfo: CustomerInfo,
  authToken?: string,
  currency?: string
): Promise<Order> {
  const orderItems = items.map((item) => ({
    product_id: item.product.id,
    quantity: item.quantity,
    variant: item.variant,
  }));

  const data = await fetchJson<{ success: boolean; order: Order }>('/orders', {
    method: 'POST',
    authToken,
    body: JSON.stringify({
      items: orderItems,
      customer_info: customerInfo,
      currency,
    }),
  });
  return data.order;
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return getAuthToken() !== null;
}
