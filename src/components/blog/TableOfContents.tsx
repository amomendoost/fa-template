// TableOfContents - sidebar navigation for blog post headings
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { List, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TocHeading } from '@/hooks/use-table-of-contents';

interface TableOfContentsProps {
  headings: TocHeading[];
  activeId: string;
  className?: string;
}

export function TableOfContents({ headings, activeId, className }: TableOfContentsProps) {
  const [isOpen, setIsOpen] = useState(true);

  if (headings.length === 0) return null;

  const handleClick = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <nav className={cn('rounded-lg border bg-card p-4', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-sm font-bold gap-2"
      >
        <span className="flex items-center gap-2">
          <List className="h-4 w-4" />
          فهرست مطالب
        </span>
        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {isOpen && (
        <ul className="mt-3 space-y-1">
          {headings.map((heading) => (
            <li key={heading.id}>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'w-full justify-start text-sm font-normal h-auto py-1.5 px-2',
                  heading.level >= 3 && 'pr-6',
                  heading.level === 4 && 'pr-10',
                  activeId === heading.id
                    ? 'text-primary bg-primary/10 font-medium'
                    : 'text-muted-foreground hover:text-foreground'
                )}
                onClick={() => handleClick(heading.id)}
              >
                {heading.text}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}

export default TableOfContents;
