// BlogSearch - debounced search input with quick results
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getPosts } from '@/lib/blog/service';
import type { BlogPost } from '@/lib/blog/types';

interface BlogSearchProps {
  onSearch?: (query: string) => void;
  className?: string;
}

export function BlogSearch({ onSearch, className }: BlogSearchProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<BlogPost[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setShowResults(false);
      onSearch?.('');
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await getPosts({ search: query, limit: 5 });
        setResults(res.data);
        setShowResults(true);
      } catch {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
      onSearch?.(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={wrapperRef} className={cn('relative', className)}>
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setShowResults(true)}
          placeholder="جستجو در مطالب..."
          className="pr-9 h-10"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute left-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
            onClick={() => { setQuery(''); setResults([]); setShowResults(false); onSearch?.(''); }}
          >
            {isSearching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
          </Button>
        )}
      </div>

      {showResults && results.length > 0 && (
        <div className="absolute top-full mt-1 w-full bg-card border rounded-lg shadow-lg z-50 max-h-80 overflow-auto">
          {results.map((post) => (
            <button
              key={post.id}
              className="w-full text-right px-4 py-3 hover:bg-muted/50 transition-colors border-b last:border-b-0"
              onClick={() => {
                navigate(`/blog/${post.slug}`);
                setShowResults(false);
                setQuery('');
              }}
            >
              <p className="font-medium text-sm line-clamp-1">{post.title}</p>
              {post.excerpt && (
                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{post.excerpt}</p>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default BlogSearch;
