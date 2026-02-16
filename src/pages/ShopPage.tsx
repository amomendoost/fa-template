// ShopPage - shop page: CategoryFilter + SortSelect + PriceRangeFilter + ProductGrid + CartDrawer
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShoppingCart, Search } from 'lucide-react';
import { ProductGrid } from '@/components/shop/ProductGrid';
import { CategoryFilter } from '@/components/shop/CategoryFilter';
import { SortSelect } from '@/components/shop/SortSelect';
import { PriceRangeFilter } from '@/components/shop/PriceRangeFilter';
import { CartDrawer } from '@/components/shop/CartDrawer';
import { Breadcrumb } from '@/components/blog/Breadcrumb';
import { useCart } from '@/hooks/use-cart';
import { getCategories } from '@/lib/shop/service';
import type { ProductCategory, Product } from '@/lib/shop/types';

export default function ShopPage() {
  const navigate = useNavigate();
  const { count } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const [category, setCategory] = useState<string>();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('default');
  const [minPrice, setMinPrice] = useState<number | undefined>();
  const [maxPrice, setMaxPrice] = useState<number | undefined>();
  const [categories, setCategories] = useState<ProductCategory[]>([]);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
  }, []);

  const handleProductClick = (product: Product) => {
    navigate(`/shop/${product.slug}`);
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Helmet>
        <title>فروشگاه</title>
        <meta name="description" content="فروشگاه آنلاین - مشاهده و خرید محصولات" />
      </Helmet>

      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb items={[{ label: 'خانه', href: '/' }, { label: 'فروشگاه' }]} />

        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">فروشگاه</h1>
          <Button variant="outline" className="gap-2 relative" onClick={() => setCartOpen(true)}>
            <ShoppingCart className="h-4 w-4" />
            سبد خرید
            {count > 0 && (
              <span className="absolute -top-2 -left-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {count}
              </span>
            )}
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="جستجو..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-10"
          />
        </div>

        {/* Filters Row */}
        <div className="flex items-end gap-4 flex-wrap">
          <CategoryFilter
            categories={categories}
            selected={category}
            onChange={setCategory}
          />
          <SortSelect value={sort} onChange={setSort} />
        </div>

        {/* Price Range */}
        <PriceRangeFilter
          minPrice={minPrice}
          maxPrice={maxPrice}
          onChange={({ min, max }) => { setMinPrice(min); setMaxPrice(max); }}
        />

        {/* Products */}
        <ProductGrid
          category={category}
          search={search || undefined}
          sort={sort}
          minPrice={minPrice}
          maxPrice={maxPrice}
          onProductClick={handleProductClick}
        />
      </div>

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={() => {
          setCartOpen(false);
          navigate('/checkout');
        }}
      />
    </div>
  );
}
