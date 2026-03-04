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
  BookingSlot,
  BookingResource,
  BookingHold,
  Subscription,
  SubscriptionStatus,
  CourseEnrollment,
  CourseModule,
  CourseProgress,
  Fulfillment,
  Entitlement,
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

// Map backend error messages to user-friendly Farsi
const SHOP_ERROR_MAP: Record<string, string> = {
  'Shop is not enabled for this project': 'فروشگاه برای این پروژه فعال نیست. لطفاً از بخش مدیریت، فروشگاه را فعال کنید',
  'Payment integration not enabled': 'درگاه پرداخت فعال نیست. لطفاً از بخش تنظیمات، درگاه پرداخت را پیکربندی کنید',
  'Gateway configuration missing': 'تنظیمات درگاه پرداخت ناقص است. لطفاً از بخش تنظیمات، درگاه پرداخت را پیکربندی کنید',
  'Order not found or already processed': 'سفارش یافت نشد یا قبلاً پردازش شده',
  'Order not found': 'سفارش یافت نشد',
  'Product not found': 'محصول یافت نشد',
  'Product is not active': 'این محصول در حال حاضر فعال نیست',
  'Insufficient stock': 'موجودی کافی نیست',
  'Cart is empty': 'سبد خرید خالی است',
  'Authentication required': 'لطفاً ابتدا وارد حساب کاربری شوید',
  'Invalid project_id format': 'شناسه پروژه نامعتبر است',
  'Each item needs product_id and quantity': 'هر آیتم باید شامل شناسه محصول و تعداد باشد',
  'order_id and integration_id are required': 'لطفاً درگاه پرداخت را انتخاب کنید',
  'Payment verification failed': 'تأیید پرداخت ناموفق بود. لطفاً با پشتیبانی تماس بگیرید',
  'Coupon not found': 'کد تخفیف یافت نشد',
  'Coupon has expired': 'کد تخفیف منقضی شده',
  'Coupon usage limit reached': 'کد تخفیف به حداکثر استفاده رسیده',
  'Coupon is not yet active': 'کد تخفیف هنوز فعال نشده',
  'No available spots': 'ظرفیت این زمان تکمیل شده',
  'Slot not found': 'زمان انتخابی یافت نشد',
  'Order has expired': 'مهلت پرداخت این سفارش به پایان رسیده. لطفاً سفارش جدید ثبت کنید',
  'Subscription product is not available': 'محصول اشتراکی دیگر در دسترس نیست',
  'Request failed': 'خطا در ارتباط با سرور. لطفاً دوباره تلاش کنید',
};

function translateShopError(msg: string): string {
  if (SHOP_ERROR_MAP[msg]) return SHOP_ERROR_MAP[msg];
  if (msg.includes('not enabled') || msg.includes('not configured'))
    return 'این سرویس فعال نیست. لطفاً از بخش مدیریت، آن را فعال کنید';
  if (msg.includes('Rate limit') || msg.includes('Too many'))
    return 'تعداد درخواست‌ها زیاد شد. لطفاً کمی صبر کنید';
  if (msg.includes('not found'))
    return 'مورد درخواستی یافت نشد';
  return msg;
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
  if (!res.ok) throw new Error(translateShopError(data.error || 'Request failed'));
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
    sku_id: item.sku_id,
    variant_choice: item.variant_choice,
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
    sku_id: item.sku_id,
    variant_choice: item.variant_choice,
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

// ========================================
// Booking Endpoints
// ========================================

export async function getBookingSlots(
  productId: string,
  date?: string
): Promise<{ slots: BookingSlot[]; resources: BookingResource[] }> {
  const query = new URLSearchParams();
  query.set('product_id', productId);
  if (date) query.set('date', date);
  return fetchJson(`/booking-slots?${query.toString()}`);
}

export async function holdBookingSlot(
  slotId: string,
  sessionId?: string,
  holdMinutes?: number
): Promise<BookingHold> {
  return fetchJson<BookingHold>('/bookings/hold', {
    method: 'POST',
    body: JSON.stringify({ slot_id: slotId, session_id: sessionId, hold_minutes: holdMinutes }),
  });
}

// ========================================
// Subscription Endpoints
// ========================================

export async function getMySubscriptions(
  status?: SubscriptionStatus,
  authToken?: string
): Promise<Subscription[]> {
  const query = new URLSearchParams();
  if (status) query.set('status', status);
  const qs = query.toString();
  const data = await fetchJson<{ subscriptions: Subscription[] }>(
    `/my-subscriptions${qs ? `?${qs}` : ''}`,
    { requireAuth: true, authToken }
  );
  return data.subscriptions;
}

export async function cancelSubscription(
  id: string,
  immediate?: boolean,
  authToken?: string
): Promise<{ success: boolean }> {
  return fetchJson('/subscriptions/cancel', {
    method: 'POST',
    requireAuth: true,
    authToken,
    body: JSON.stringify({ subscription_id: id, immediate }),
  });
}

export async function renewSubscription(
  id: string,
  authToken?: string
): Promise<{ success: boolean; order?: Order }> {
  return fetchJson('/subscriptions/renew', {
    method: 'POST',
    requireAuth: true,
    authToken,
    body: JSON.stringify({ subscription_id: id }),
  });
}

// ========================================
// Course Endpoints
// ========================================

export async function getMyCourses(
  authToken?: string
): Promise<CourseEnrollment[]> {
  const data = await fetchJson<{ courses: CourseEnrollment[] }>('/my-courses', {
    requireAuth: true,
    authToken,
  });
  return data.courses;
}

export async function getCourseContent(
  courseId: string,
  authToken?: string
): Promise<{ modules: CourseModule[]; progress: CourseProgress[] }> {
  const data = await fetchJson<{ course: { modules: CourseModule[] }; progress: CourseProgress[] }>(`/courses/${encodeURIComponent(courseId)}`, {
    requireAuth: true,
    authToken,
  });
  return { modules: data.course?.modules || [], progress: data.progress || [] };
}

export async function updateCourseProgress(
  courseId: string,
  lessonId: string,
  moduleId: string,
  completed?: boolean,
  seconds?: number,
  authToken?: string
): Promise<{ success: boolean }> {
  return fetchJson(`/courses/${encodeURIComponent(courseId)}/progress`, {
    method: 'POST',
    requireAuth: true,
    authToken,
    body: JSON.stringify({ lesson_id: lessonId, module_id: moduleId, completed, progress_seconds: seconds }),
  });
}

// ========================================
// Fulfillment Endpoints
// ========================================

export async function getOrderFulfillments(
  orderId: string,
  authToken?: string
): Promise<{ fulfillments: Fulfillment[]; entitlements: Entitlement[]; access_token?: string }> {
  return fetchJson(`/orders/${encodeURIComponent(orderId)}/fulfillments`, {
    authToken,
  });
}

export interface DigitalFulfillmentWithToken extends Fulfillment {
  _access_token?: string;
}

export async function getMyDigitalFulfillments(
  authToken?: string
): Promise<DigitalFulfillmentWithToken[]> {
  // No standalone endpoint — aggregate digital fulfillments from user's orders
  const { orders } = await getMyOrders({ limit: 50 }, authToken);
  const paidOrders = orders.filter((o) => o.status === 'paid' || o.status === 'delivered' || o.status === 'fulfilled' || o.status === 'completed');
  const all: DigitalFulfillmentWithToken[] = [];
  for (const order of paidOrders) {
    try {
      const { fulfillments, access_token } = await getOrderFulfillments(order.id, authToken);
      const digital = fulfillments?.filter(f => f.fulfillment_type === 'auto_download' || f.fulfillment_type === 'license_key');
      if (digital?.length) {
        all.push(...digital.map(f => ({ ...f, _access_token: access_token })));
      }
    } catch {
      // skip orders where fulfillment lookup fails
    }
  }
  return all;
}

export async function downloadFile(
  fulfillmentId: string,
  fileId: string,
  accessToken: string
): Promise<{ download_url: string }> {
  // Backend requires order's access_token as ?token= query param (not JWT)
  return fetchJson(`/download/${encodeURIComponent(fulfillmentId)}/${encodeURIComponent(fileId)}?token=${encodeURIComponent(accessToken)}`);
}
