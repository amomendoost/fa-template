// AuthGuard - shows login dialog if not authenticated
import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { LoginDialog } from './LoginDialog';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { isAuthenticated } = useAuth();
  const [loginOpen, setLoginOpen] = useState(!isAuthenticated);

  if (!isAuthenticated) {
    return (
      <>
        {fallback || (
          <div className="min-h-[60vh] flex items-center justify-center" dir="rtl">
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">برای دسترسی به این صفحه باید وارد شوید</p>
              <button
                onClick={() => setLoginOpen(true)}
                className="text-sm font-medium underline underline-offset-4 hover:text-foreground"
              >
                ورود به حساب
              </button>
            </div>
          </div>
        )}
        <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} />
      </>
    );
  }

  return <>{children}</>;
}

export default AuthGuard;
