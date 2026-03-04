// LoginDialog - OTP login modal (phone input → code verification)
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function LoginDialog({ open, onOpenChange, onSuccess }: LoginDialogProps) {
  const { login, verifyOtp, isLoading, error } = useAuth();
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;
    try {
      await login(phone.trim());
      setStep('code');
    } catch {
      // error is set in hook
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    try {
      await verifyOtp(phone.trim(), code.trim());
      onOpenChange(false);
      onSuccess?.();
      // Reset
      setStep('phone');
      setPhone('');
      setCode('');
    } catch {
      // error is set in hook
    }
  };

  const handleClose = (val: boolean) => {
    if (!val) {
      setStep('phone');
      setCode('');
    }
    onOpenChange(val);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-sm" dir="rtl">
        <DialogHeader>
          <DialogTitle>{step === 'phone' ? 'ورود به حساب' : 'کد تأیید'}</DialogTitle>
          <DialogDescription>
            {step === 'phone'
              ? 'شماره موبایل خود را وارد کنید'
              : `کد ارسال شده به ${phone} را وارد کنید`}
          </DialogDescription>
        </DialogHeader>

        {step === 'phone' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <Input
              type="tel"
              dir="ltr"
              placeholder="09123456789"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="text-center text-lg tracking-wider"
              autoFocus
            />
            {error && <p className="text-sm text-destructive text-center">{error}</p>}
            <Button type="submit" className="w-full" disabled={isLoading || !phone.trim()}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : null}
              ارسال کد تأیید
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="space-y-4">
            <Input
              type="text"
              dir="ltr"
              inputMode="numeric"
              placeholder="کد ۶ رقمی"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="text-center text-2xl tracking-[0.5em] font-mono"
              autoFocus
              maxLength={6}
            />
            {error && <p className="text-sm text-destructive text-center">{error}</p>}
            <Button type="submit" className="w-full" disabled={isLoading || code.length < 4}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : null}
              تأیید
            </Button>
            <button
              type="button"
              onClick={() => { setStep('phone'); setCode(''); }}
              className="w-full text-sm text-muted-foreground hover:text-foreground text-center"
            >
              تغییر شماره موبایل
            </button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default LoginDialog;
