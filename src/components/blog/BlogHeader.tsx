// BlogHeader - shared sticky header for blog pages
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, BookOpen, Store } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BlogHeaderProps {
  showSearch?: boolean;
  onSearch?: (query: string) => void;
  searchValue?: string;
  className?: string;
}

export function BlogHeader({ showSearch = false, onSearch, searchValue = '', className }: BlogHeaderProps) {
  return (
    <header className={cn('sticky top-0 z-40 bg-background/95 backdrop-blur border-b', className)}>
      <div className="mx-auto max-w-7xl px-4 py-2 sm:py-3">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card/60 px-3 py-2">
          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/" className="inline-flex items-center gap-2 rounded-lg px-2.5 py-1.5 font-bold text-base hover:bg-muted transition-colors">
              <Store className="h-4 w-4" />
              <span>فروشگاه</span>
            </Link>
            <Link
              to="/blog"
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <BookOpen className="h-4 w-4" />
              بلاگ
            </Link>
          </div>

          {!showSearch && <div className="text-xs text-muted-foreground px-1">مطالب و آموزش‌ها</div>}

          {showSearch && onSearch && (
            <div className="w-full sm:w-[340px] md:w-[420px] relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                value={searchValue}
                onChange={(e) => onSearch(e.target.value)}
                placeholder="جستجو در مقالات..."
                className="pr-9 h-10 text-sm bg-background"
              />
              {searchValue && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute left-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                  onClick={() => onSearch('')}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default BlogHeader;
