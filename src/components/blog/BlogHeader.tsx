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
      <div className="container mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg hover:text-primary transition-colors">
            <Store className="h-5 w-5" />
            <span className="hidden sm:inline">فروشگاه</span>
          </Link>
          <Link
            to="/blog"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <BookOpen className="h-4 w-4" />
            بلاگ
          </Link>
        </div>

        {showSearch && onSearch && (
          <div className="flex-1 max-w-sm relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              value={searchValue}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="جستجو..."
              className="pr-9 h-9 text-sm"
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
    </header>
  );
}

export default BlogHeader;
