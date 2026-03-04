// SlotPicker - time slot grid showing available slots with capacity
import { cn } from '@/lib/utils';
import { Clock } from 'lucide-react';
import type { BookingSlot } from '@/lib/shop/types';

interface SlotPickerProps {
  slots: BookingSlot[];
  selectedSlotId?: string;
  onSlotSelect: (slot: BookingSlot) => void;
  className?: string;
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return iso;
  }
}

export function SlotPicker({ slots, selectedSlotId, onSlotSelect, className }: SlotPickerProps) {
  if (slots.length === 0) {
    return (
      <div className={cn('text-center py-8 text-sm text-muted-foreground', className)}>
        زمانی برای رزرو در این تاریخ موجود نیست
      </div>
    );
  }

  return (
    <div className={cn('grid grid-cols-2 sm:grid-cols-3 gap-2', className)}>
      {slots.map((slot) => {
        const full = slot.available <= 0;
        const isSelected = selectedSlotId === slot.id;

        return (
          <button
            key={slot.id}
            onClick={() => !full && onSlotSelect(slot)}
            disabled={full}
            className={cn(
              'flex flex-col items-center gap-1 p-3 rounded-xl border text-sm transition-all',
              full && 'opacity-40 cursor-not-allowed border-dashed',
              isSelected && 'border-foreground bg-foreground/5 font-medium',
              !isSelected && !full && 'hover:border-foreground/50 hover:bg-muted/50'
            )}
          >
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span>{formatTime(slot.start_time)}</span>
            </div>
            {slot.resource_name && (
              <span className="text-[11px] text-muted-foreground">{slot.resource_name}</span>
            )}
            <span className={cn(
              'text-[11px]',
              full ? 'text-destructive' : slot.available <= 2 ? 'text-orange-500' : 'text-muted-foreground'
            )}>
              {full ? 'تکمیل' : `${slot.available.toLocaleString('fa-IR')} ظرفیت`}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default SlotPicker;
