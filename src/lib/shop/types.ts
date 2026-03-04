// Shop Types - matching shop edge function responses

// ─── Product Types ───────────────────────────────────────────

export type ProductKind = 'physical' | 'digital' | 'license_key' | 'booking' | 'course' | 'subscription' | 'manual';
export type BillingModel = 'one_time' | 'recurring';
export type FulfillmentType = 'shipping' | 'auto_download' | 'license_key' | 'booking' | 'course_access' | 'manual' | 'webhook' | 'none';

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compare_price?: number;
  currency: string;
  sku?: string;
  stock: number;
  images: string[];
  variants?: ProductVariant[];
  category?: string;
  tags?: string[];
  is_active: boolean;
  weight?: number;
  dimensions?: Record<string, unknown>;
  seo_title?: string;
  seo_description?: string;
  meta_keywords?: string[];
  sort_order?: number;
  avg_rating?: number | null;
  review_count?: number;
  created_at: string;
  // Extended fields for product kinds
  product_kind?: ProductKind;
  billing_model?: BillingModel;
  fulfillment_type?: FulfillmentType;
  skus?: ProductSku[];
  // Subscription fields
  billing_period?: string;
  trial_days?: number;
  // Booking fields
  booking_duration_minutes?: number;
}

export interface ProductVariant {
  name: string;
  options: string[];
  price_modifier?: number;
}

export interface ProductSku {
  id: string;
  product_id: string;
  sku: string;
  variant_combination: Record<string, string>; // e.g. { "Color": "Red", "Size": "L" }
  price: number;
  compare_price?: number;
  stock: number;
  image_url?: string;
  is_active: boolean;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parent_id?: string;
  sort_order: number;
}

// ─── Cart ────────────────────────────────────────────────────

export interface CartItem {
  product: Product;
  quantity: number;
  variant?: string;
  sku_id?: string;
  variant_choice?: Record<string, string>;
}

// ─── Orders ──────────────────────────────────────────────────

export interface Order {
  id: string;
  order_number: string;
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded' | 'expired';
  total_amount: number;
  currency: string;
  items: OrderItem[];
  customer_info?: CustomerInfo;
  shipping_address?: Record<string, unknown>;
  notes?: string;
  payment_track_id?: string;
  expires_at?: string;
  created_at: string;
  updated_at?: string;
  fulfillments?: Fulfillment[];
}

export interface OrderItem {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
  variant?: string;
  sku_id?: string;
  product_kind?: ProductKind;
  fulfillment_type?: FulfillmentType;
}

export interface CustomerInfo {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
}

// ─── Checkout & Payment ──────────────────────────────────────

export interface CheckoutRequest {
  order_id: string;
  integration_id: string;
  return_url: string;
}

export interface CheckoutResponse {
  success: boolean;
  payment_url?: string;
  track_id?: string;
  order_number?: string;
  error?: string;
}

// ─── Pagination ──────────────────────────────────────────────

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

// ─── Reviews ─────────────────────────────────────────────────

export interface ProductReview {
  id: string;
  author_name: string;
  rating: number;
  title?: string;
  content?: string;
  is_verified_purchase: boolean;
  created_at: string;
}

export interface ProductFilterParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  sort?: string;
  min_price?: number;
  max_price?: number;
}

// ─── Booking ─────────────────────────────────────────────────

export interface BookingResource {
  id: string;
  name: string;
  description?: string;
}

export interface BookingSlot {
  id: string;
  resource_id?: string;
  resource_name?: string;
  start_time: string;
  end_time: string;
  capacity: number;
  booked: number;
  available: number;
  price?: number;
}

export interface BookingHold {
  id: string;
  slot_id: string;
  session_id: string;
  expires_at: string;
}

// ─── Subscriptions ───────────────────────────────────────────

export type SubscriptionStatus = 'active' | 'paused' | 'cancelled' | 'expired' | 'past_due' | 'trialing';

export interface Subscription {
  id: string;
  product_id: string;
  product_name: string;
  product_image?: string;
  status: SubscriptionStatus;
  billing_period: string;
  price: number;
  currency: string;
  current_period_start: string;
  current_period_end: string;
  trial_end?: string;
  cancelled_at?: string;
  cancel_at_period_end?: boolean;
  created_at: string;
}

// ─── Courses ─────────────────────────────────────────────────

export interface CourseModule {
  id: string;
  title: string;
  sort_order: number;
  lessons: CourseLesson[];
}

export interface CourseLesson {
  id: string;
  module_id: string;
  title: string;
  type: 'video' | 'text' | 'quiz';
  duration_seconds?: number;
  sort_order: number;
  is_preview?: boolean;
  // Content only available when enrolled
  content?: string;
  video_url?: string;
}

export interface CourseEnrollment {
  id: string;
  course_id: string;
  course_name: string;
  course_image?: string;
  enrolled_at: string;
  progress_percent: number;
  completed_lessons: number;
  total_lessons: number;
}

export interface CourseProgress {
  lesson_id: string;
  module_id: string;
  completed: boolean;
  watch_seconds?: number;
  updated_at: string;
}

// ─── Fulfillment & Entitlements ──────────────────────────────

export type FulfillmentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface Fulfillment {
  id: string;
  order_id: string;
  order_item_index: number;
  type: FulfillmentType;
  status: FulfillmentStatus;
  product_name?: string;
  // Shipping
  tracking_number?: string;
  tracking_url?: string;
  carrier?: string;
  // Digital
  download_url?: string;
  download_count?: number;
  max_downloads?: number;
  expires_at?: string;
  // License
  license_key?: string;
  // Booking
  booking_slot?: BookingSlot;
  // Course
  enrollment_id?: string;
  created_at: string;
  updated_at?: string;
}

export interface Entitlement {
  id: string;
  type: 'auto_download' | 'license_key' | 'course_access' | 'subscription';
  product_name: string;
  // Download
  files?: EntitlementFile[];
  // License
  license_key?: string;
  // Metadata
  expires_at?: string;
  created_at: string;
}

export interface EntitlementFile {
  id: string;
  name: string;
  size_bytes?: number;
  download_count: number;
  max_downloads?: number;
}
