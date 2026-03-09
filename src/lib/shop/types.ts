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
  meta_keywords?: string;
  sort_order?: number;
  avg_rating?: number | null;
  review_count?: number;
  created_at?: string;
  // Extended fields (returned by detail endpoint)
  product_kind?: ProductKind;
  billing_model?: BillingModel;
  fulfillment_type?: FulfillmentType;
  type_config?: Record<string, unknown>;
  skus?: ProductSku[];
}

export interface ProductVariant {
  name: string;
  options: string[];
  price_modifier?: number;
}

export interface ProductSku {
  id: string;
  sku: string;
  variant_combination: Record<string, string>;
  price: number;
  compare_price?: number;
  stock: number;
  image_url?: string;
  is_active: boolean;
  sort_order?: number;
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

export type OrderStatus =
  | 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered'
  | 'partially_fulfilled' | 'fulfilled' | 'completed'
  | 'cancelled' | 'refunded' | 'expired';

export interface Order {
  id: string;
  order_number: string;
  status: OrderStatus;
  total_amount: number;
  currency: string;
  items: OrderItem[];
  customer_info?: CustomerInfo;
  shipping_address?: Record<string, unknown>;
  notes?: string;
  payment_track_id?: string;
  expires_at?: string;
  created_at?: string;
  updated_at?: string;
  fulfillments?: Fulfillment[];
}

export interface OrderItem {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
  requires_shipping?: boolean;
  sku_id?: string;
  sku_code?: string;
  variant_choice?: Record<string, string>;
  hold_id?: string;
  product_snapshot?: {
    product_kind?: ProductKind;
    fulfillment_type?: FulfillmentType;
    image?: string;
  };
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
  capacity?: number;
  timezone?: string;
  slot_duration_minutes?: number;
}

export interface BookingSlot {
  id: string;
  resource_id?: string;
  start_time: string;
  end_time: string;
  capacity: number;
  booked_count: number;
  available_spots: number;
  status?: string;
}

export interface BookingHold {
  success: boolean;
  hold_id: string;
  held_until: string;
  slot_start: string;
  slot_end: string;
}

// ─── Subscriptions ───────────────────────────────────────────

export type SubscriptionStatus = 'active' | 'paused' | 'cancelled' | 'expired' | 'past_due';

export interface Subscription {
  id: string;
  product_id: string;
  status: SubscriptionStatus;
  billing_interval: string;
  billing_interval_count?: number;
  price_per_period: number;
  currency: string;
  current_period_start?: string;
  current_period_end?: string;
  trial_end?: string;
  cancel_at_period_end?: boolean;
  renewal_count?: number;
  created_at: string;
  product?: {
    id: string;
    name: string;
    slug: string;
    images?: string[] | null;
  };
}

// ─── Courses ─────────────────────────────────────────────────

export interface CourseModule {
  id: string;
  title: string;
  description?: string;
  lessons: CourseLesson[];
}

export interface CourseLesson {
  id: string;
  title: string;
  type: 'video' | 'text' | 'quiz';
  content?: string;
  content_url?: string;
  duration_minutes?: number;
  sort_order?: number;
  is_preview?: boolean;
}

export interface CourseEnrollment {
  id: string;
  course_id: string;
  status?: string;
  progress_percent: number;
  completed_lessons: number;
  enrolled_at: string;
  completed_at?: string;
  last_accessed_at?: string;
  course?: {
    id: string;
    title: string;
    description?: string;
    thumbnail_url?: string;
    total_lessons: number;
    total_duration_minutes?: number;
  };
}

export interface CourseProgress {
  lesson_id: string;
  module_id: string;
  completed: boolean;
  progress_seconds?: number;
  completed_at?: string;
}

// ─── Fulfillment & Entitlements ──────────────────────────────

export type FulfillmentStatus = 'pending' | 'processing' | 'fulfilled' | 'failed' | 'expired' | 'cancelled';

export interface Fulfillment {
  id: string;
  order_id?: string;
  order_item_id?: string;
  product_id?: string;
  fulfillment_type: FulfillmentType;
  status: FulfillmentStatus;
  delivery_data?: Record<string, unknown>;
  delivered_at?: string;
  created_at?: string;
  updated_at?: string;
  // Enriched by backend for auto_download
  files?: FulfillmentFile[];
  // Enriched by backend for license_key
  license_key_masked?: string;
}

export interface FulfillmentFile {
  id: string;
  file_name: string;
  file_size?: number;
  mime_type?: string;
  sort_order?: number;
}

export interface Entitlement {
  id: string;
  entitlement_type: 'download_access' | 'license_access' | 'course_access' | 'service_access' | 'subscription_access';
  status: string;
  expires_at?: string;
  metadata?: Record<string, unknown>;
}

export interface EntitlementFile {
  id: string;
  name: string;
  size_bytes?: number;
  download_count: number;
  max_downloads?: number;
}
