// LoginPage - full-page OTP login
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { toEnDigits } from '@/lib/utils';

export default function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, login, verifyOtp, isLoading, error } = useAuth();
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');

  // If already logged in, redirect to dashboard
  if (isAuthenticated) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;
    try {
      await login(phone.trim());
      setStep('code');
    } catch {
      // error set in hook
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    try {
      await verifyOtp(phone.trim(), code.trim());
      navigate('/dashboard', { replace: true });
    } catch {
      // error set in hook
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4" dir="rtl">
      <title>ورود به حساب</title>
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle>{step === 'phone' ? 'ورود به حساب' : 'کد تأیید'}</CardTitle>
          <CardDescription>
            {step === 'phone'
              ? 'شماره موبایل خود را وارد کنید'
              : `کد ارسال شده به ${phone} را وارد کنید`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'phone' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <Input
                type="tel"
                dir="ltr"
                placeholder="09123456789"
                value={phone}
                onChange={(e) => setPhone(toEnDigits(e.target.value))}
                className="text-center text-lg tracking-wider"
                autoFocus
              />
              {error && <p className="text-sm text-destructive text-center">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading || !phone.trim()}>
                {isLoading && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
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
                onChange={(e) => setCode(toEnDigits(e.target.value).replace(/\D/g, '').slice(0, 6))}
                className="text-center text-2xl tracking-[0.5em] font-mono"
                autoFocus
                maxLength={6}
              />
              {error && <p className="text-sm text-destructive text-center">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading || code.length !== 6}>
                {isLoading && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
                تأیید و ورود
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

          <div className="mt-4 text-center">
            <button
              onClick={() => navigate('/shop')}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              بازگشت به فروشگاه
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
