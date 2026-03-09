// UserMenu - user avatar/dropdown in header, or login button
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { LoginDialog } from './LoginDialog';

export function UserMenu() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);

  if (!isAuthenticated) {
    return (
      <>
        <Button variant="ghost" size="sm" className="gap-2" onClick={() => setLoginOpen(true)}>
          <User className="h-4 w-4" />
          <span className="hidden sm:inline">ورود</span>
        </Button>
        <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} />
      </>
    );
  }

  return (
    <DropdownMenu dir="rtl">
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
            <User className="h-4 w-4" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {user?.phone && (
          <div className="px-2 py-1.5 text-sm text-muted-foreground" dir="ltr">
            {user.phone}
          </div>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate('/dashboard')}>
          <LayoutDashboard className="h-4 w-4 ml-2" />
          پنل کاربری
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout}>
          <LogOut className="h-4 w-4 ml-2" />
          خروج
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default UserMenu;
