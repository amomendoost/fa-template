// Shop Types - matching shop edge function responses

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
}

export interface ProductVariant {
  name: string;
  options: string[];
  price_modifier?: number;
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

export interface CartItem {
  product: Product;
  quantity: number;
  variant?: string;
}

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
}

export interface OrderItem {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
  variant?: string;
}

export interface CustomerInfo {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
}

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
