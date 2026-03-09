// BookingHoldBanner - countdown timer showing hold expiry
import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BookingHoldBannerProps {
  expiresAt: string;
  onExpired?: () => void;
  className?: string;
}

export function BookingHoldBanner({ expiresAt, onExpired, className }: BookingHoldBannerProps) {
  const [remaining, setRemaining] = useState(() => {
    return Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const secs = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
      setRemaining(secs);
      if (secs <= 0) {
        clearInterval(timer);
        onExpired?.();
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [expiresAt, onExpired]);

  if (remaining <= 0) return null;

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  return (
    <div className={cn(
      'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm',
      remaining <= 60 ? 'bg-destructive/10 text-destructive' : 'bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400',
      className
    )}>
      <Clock className="h-4 w-4 shrink-0" />
      <span>
        رزرو شما تا{' '}
        <span className="font-mono font-medium" dir="ltr">
          {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
        </span>
        {' '}دقیقه نگه داشته شده
      </span>
    </div>
  );
}

export default BookingHoldBanner;
