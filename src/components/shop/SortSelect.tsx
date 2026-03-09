// SortSelect - product sort dropdown
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const SORT_OPTIONS = [
  { value: 'default', label: 'پیش‌فرض' },
  { value: 'newest', label: 'جدیدترین' },
  { value: 'price_asc', label: 'ارزان‌ترین' },
  { value: 'price_desc', label: 'گران‌ترین' },
  { value: 'name_asc', label: 'نام (الفبا)' },
];

interface SortSelectProps {
  value?: string;
  onChange: (value: string) => void;
  className?: string;
}

export function SortSelect({ value = 'default', onChange, className }: SortSelectProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={cn('w-[150px] h-9 rounded-full text-sm border-0 bg-muted/60', className)}>
        <div className="flex items-center gap-1.5">
          <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
          <SelectValue placeholder="مرتب‌سازی" />
        </div>
      </SelectTrigger>
      <SelectContent>
        {SORT_OPTIONS.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default SortSelect;
