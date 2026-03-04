// BookingCalendar - date picker for selecting booking date
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BookingCalendarProps {
  selectedDate?: string;
  onDateSelect: (date: string) => void;
  className?: string;
}

const FA_WEEKDAYS = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];
const FA_MONTHS = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند',
];

function toISODate(d: Date): string {
  return d.toISOString().split('T')[0];
}

export function BookingCalendar({ selectedDate, onDateSelect, className }: BookingCalendarProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());

  const days = useMemo(() => {
    const first = new Date(viewYear, viewMonth, 1);
    const startDay = (first.getDay() + 1) % 7; // Adjust to Saturday start
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells: (Date | null)[] = [];

    for (let i = 0; i < startDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(viewYear, viewMonth, d));

    return cells;
  }, [viewMonth, viewYear]);

  const monthLabel = useMemo(() => {
    try {
      const d = new Date(viewYear, viewMonth, 15);
      const parts = new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: 'long' }).formatToParts(d);
      const month = parts.find(p => p.type === 'month')?.value || '';
      const year = parts.find(p => p.type === 'year')?.value || '';
      return `${month} ${year}`;
    } catch {
      return `${FA_MONTHS[viewMonth]} ${viewYear}`;
    }
  }, [viewMonth, viewYear]);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  };

  return (
    <div className={cn('space-y-3', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={nextMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium">{monthLabel}</span>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={prevMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {FA_WEEKDAYS.map((d) => (
          <span key={d} className="text-[11px] text-muted-foreground py-1">{d}</span>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => {
          if (!day) return <span key={`empty-${i}`} />;
          const iso = toISODate(day);
          const isPast = day < today;
          const isSelected = selectedDate === iso;
          const isToday = toISODate(day) === toISODate(today);

          return (
            <button
              key={iso}
              onClick={() => !isPast && onDateSelect(iso)}
              disabled={isPast}
              className={cn(
                'h-9 w-full rounded-lg text-sm transition-all',
                isPast && 'text-muted-foreground/30 cursor-not-allowed',
                isSelected && 'bg-foreground text-background font-medium',
                !isSelected && !isPast && 'hover:bg-muted',
                isToday && !isSelected && 'ring-1 ring-foreground/20'
              )}
            >
              {day.getDate().toLocaleString('fa-IR')}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default BookingCalendar;
