// Blog Types - matching blog edge function responses

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content?: string;
  excerpt?: string;
  cover_image?: string;
  category?: string;
  tags?: string[];
  status: string;
  author_id?: string;
  views: number;
  reading_time?: number;
  seo_title?: string;
  seo_description?: string;
  meta_keywords?: string[];
  published_at?: string;
  created_at?: string;
}

export interface BlogComment {
  id: string;
  post_id?: string;
  author_name: string;
  content: string;
  parent_id?: string;
  is_approved?: boolean;
  created_at: string;
}

export interface BlogCategory {
  name: string;
  count: number;
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

export interface BlogFilterParams {
  page?: number;
  limit?: number;
  category?: string;
  tag?: string;
  search?: string;
}

export interface BlogHeading {
  id: string;
  text: string;
  level: number;
}
