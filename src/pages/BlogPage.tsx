// BlogPage - blog listing with search, categories, and SEO
import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { BlogHeader } from '@/components/blog/BlogHeader';
import { Breadcrumb } from '@/components/blog/Breadcrumb';
import { BlogSearch } from '@/components/blog/BlogSearch';
import { PostGrid } from '@/components/blog/PostGrid';
import { CategoryList } from '@/components/blog/CategoryList';
import { getCategories } from '@/lib/blog/service';
import type { BlogCategory, BlogPost } from '@/lib/blog/types';

export default function BlogPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [search, setSearch] = useState('');

  const category = searchParams.get('category') || undefined;
  const tag = searchParams.get('tag') || undefined;

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
  }, []);

  const handleCategoryChange = (cat: string | undefined) => {
    const params = new URLSearchParams(searchParams);
    if (cat) {
      params.set('category', cat);
    } else {
      params.delete('category');
    }
    params.delete('tag');
    setSearchParams(params);
  };

  const handlePostClick = (post: BlogPost) => {
    navigate(`/blog/${post.slug}`);
  };

  const breadcrumbItems = useMemo(() => {
    const items = [
      { label: 'خانه', href: '/' },
      { label: 'بلاگ', href: '/blog' },
    ];
    if (category) items.push({ label: category });
    if (tag) items.push({ label: `# ${tag}` });
    return items;
  }, [category, tag]);

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <title>بلاگ</title>
      <meta name="description" content="آخرین مطالب و مقالات" />

      <BlogHeader showSearch onSearch={setSearch} searchValue={search} />

      <div className="container mx-auto px-4 py-6 space-y-6">
        <Breadcrumb items={breadcrumbItems} />

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - desktop */}
          <aside className="hidden lg:block w-56 flex-shrink-0 space-y-4">
            <h2 className="font-bold text-sm text-muted-foreground">دسته‌بندی‌ها</h2>
            <CategoryList
              categories={categories}
              selected={category}
              onChange={handleCategoryChange}
              layout="vertical"
            />
          </aside>

          {/* Main content */}
          <div className="flex-1 space-y-6">
            {/* Mobile categories */}
            <div className="lg:hidden">
              <CategoryList
                categories={categories}
                selected={category}
                onChange={handleCategoryChange}
              />
            </div>

            {/* Mobile search */}
            <div className="lg:hidden">
              <BlogSearch onSearch={setSearch} />
            </div>

            <PostGrid
              category={category}
              tag={tag}
              onPostClick={handlePostClick}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
