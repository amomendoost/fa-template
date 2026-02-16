// Blog Service Layer
// API calls to blog edge function

import type {
  BlogPost,
  BlogComment,
  BlogCategory,
  BlogFilterParams,
  PaginatedResponse,
  Pagination,
} from './types';

function getBaseUrl(): string {
  const url = import.meta.env.VITE_API_URL || '';
  const projectId = import.meta.env.VITE_PROJECT_ID || '';
  if (!url || !projectId) {
    console.error('VITE_API_URL and VITE_PROJECT_ID must be configured');
  }
  return `${url}/functions/v1/blog/${projectId}`;
}

async function fetchJson<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${getBaseUrl()}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export async function getPosts(
  params?: BlogFilterParams
): Promise<PaginatedResponse<BlogPost>> {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.category) query.set('category', params.category);
  if (params?.tag) query.set('tag', params.tag);
  if (params?.search) query.set('search', params.search);

  const qs = query.toString();
  const data = await fetchJson<{ posts: BlogPost[]; pagination: Pagination }>(
    `/posts${qs ? `?${qs}` : ''}`
  );
  return { data: data.posts, pagination: data.pagination };
}

export async function getPost(
  slug: string
): Promise<{ post: BlogPost; comments: BlogComment[] }> {
  return fetchJson<{ post: BlogPost; comments: BlogComment[] }>(
    `/posts/${encodeURIComponent(slug)}`
  );
}

export async function getCategories(): Promise<BlogCategory[]> {
  const data = await fetchJson<{ categories: BlogCategory[] }>('/categories');
  return data.categories;
}

export async function getRelatedPosts(slug: string): Promise<BlogPost[]> {
  const data = await fetchJson<{ posts: BlogPost[] }>(
    `/posts/${encodeURIComponent(slug)}/related`
  );
  return data.posts;
}

export async function submitComment(
  postId: string,
  authorName: string,
  content: string,
  parentId?: string
): Promise<BlogComment> {
  const data = await fetchJson<{ success: boolean; comment: BlogComment }>(
    '/comments',
    {
      method: 'POST',
      body: JSON.stringify({
        post_id: postId,
        author_name: authorName,
        content,
        parent_id: parentId,
      }),
    }
  );
  return data.comment;
}
