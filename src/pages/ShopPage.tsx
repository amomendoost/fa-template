// ShopPage - modern shop listing with sidebar filters
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ShoppingCart, Search, X, SlidersHorizontal } from 'lucide-react';
import { ProductGrid } from '@/components/shop/ProductGrid';
import { CategoryFilter } from '@/components/shop/CategoryFilter';
import { SortSelect } from '@/components/shop/SortSelect';
import { PriceRangeFilter } from '@/components/shop/PriceRangeFilter';
import { CartDrawer } from '@/components/shop/CartDrawer';
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

  const hasActiveFilters = !!category || !!minPrice || !!maxPrice;

  const clearAllFilters = () => {
    setCategory(undefined);
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setSort('default');
  };

  const sidebar = (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="جستجوی محصولات..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pr-9 h-10 rounded-xl bg-muted/50 border-0 focus-visible:ring-1"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">دسته‌بندی</h3>
          <CategoryFilter
            categories={categories}
            selected={category}
            onChange={setCategory}
            layout="vertical"
          />
        </div>
      )}

      <Separator />

      {/* Price */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold">محدوده قیمت</h3>
        <PriceRangeFilter
          minPrice={minPrice}
          maxPrice={maxPrice}
          onChange={({ min, max }) => { setMinPrice(min); setMaxPrice(max); }}
          layout="vertical"
        />
      </div>

      {hasActiveFilters && (
        <>
          <Separator />
          <button
            onClick={clearAllFilters}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            پاک کردن همه فیلترها
          </button>
        </>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <title>فروشگاه</title>
      <meta name="description" content="فروشگاه آنلاین - مشاهده و خرید محصولات" />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <button onClick={() => navigate('/')} className="text-lg font-bold">
              فروشگاه
            </button>
            <Button variant="ghost" size="icon" className="relative" onClick={() => setCartOpen(true)}>
              <ShoppingCart className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 bg-foreground text-background text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {count}
                </span>
              )}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 lg:py-8">
        <div className="flex gap-8">
          {/* Sidebar - desktop */}
          <aside className="hidden lg:block w-60 shrink-0">
            <div className="sticky top-20">{sidebar}</div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0 space-y-5">
            {/* Categories - horizontal (above products) */}
            {categories.length > 0 && (
              <CategoryFilter
                categories={categories}
                selected={category}
                onChange={setCategory}
                layout="horizontal"
              />
            )}

            {/* Toolbar */}
            <div className="flex items-center justify-between gap-3">
              {/* Mobile: filter button + search */}
              <div className="flex items-center gap-2 lg:hidden">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2 rounded-full h-9">
                      <SlidersHorizontal className="h-3.5 w-3.5" />
                      فیلتر
                      {hasActiveFilters && <span className="h-1.5 w-1.5 rounded-full bg-foreground" />}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-72">
                    <SheetHeader>
                      <SheetTitle>فیلتر محصولات</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">{sidebar}</div>
                  </SheetContent>
                </Sheet>
              </div>

              {/* Mobile search */}
              <div className="flex-1 relative lg:hidden">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="جستجو..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pr-9 h-9 rounded-full bg-muted/50 border-0 focus-visible:ring-1 text-sm"
                />
              </div>

              {/* Result info - desktop */}
              <div className="hidden lg:block text-sm text-muted-foreground">
                {search ? <>نتایج جستجوی «{search}»</> : category ? categories.find(c => c.slug === category)?.name : 'همه محصولات'}
              </div>

              <SortSelect value={sort} onChange={setSort} />
            </div>

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
        </div>
      </main>

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
