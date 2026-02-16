// CouponInput - discount code input (UI only for now)
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tag, Loader2, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface CouponInputProps {
  onApply?: (code: string) => Promise<{ valid: boolean; discount?: number }>;
  className?: string;
}

export function CouponInput({ onApply, className }: CouponInputProps) {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const { toast } = useToast();

  const handleApply = async () => {
    if (!code.trim()) return;
    setStatus('loading');

    if (onApply) {
      try {
        const result = await onApply(code.trim());
        setStatus(result.valid ? 'success' : 'error');
      } catch {
        setStatus('error');
      }
    } else {
      // Default: feature coming soon
      setTimeout(() => {
        setStatus('idle');
        toast({
          title: 'کد تخفیف',
          description: 'این قابلیت به زودی فعال می‌شود',
        });
      }, 500);
    }
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="relative flex-1">
        <Tag className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="کد تخفیف"
          value={code}
          onChange={(e) => { setCode(e.target.value); setStatus('idle'); }}
          className="pr-10"
          dir="ltr"
        />
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={handleApply}
        disabled={!code.trim() || status === 'loading'}
        className="gap-1 shrink-0"
      >
        {status === 'loading' && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
        {status === 'success' && <Check className="h-3.5 w-3.5 text-green-600" />}
        {status === 'error' && <X className="h-3.5 w-3.5 text-destructive" />}
        اعمال
      </Button>
    </div>
  );
}

export default CouponInput;
