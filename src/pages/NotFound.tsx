import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6" dir="rtl">
      <div className="text-center space-y-4">
        <p className="text-8xl font-bold text-muted-foreground/20">۴۰۴</p>
        <h1 className="text-xl font-semibold">صفحه پیدا نشد</h1>
        <p className="text-sm text-muted-foreground">
          صفحه‌ای که دنبالش هستید وجود ندارد یا منتقل شده.
        </p>
        <Button variant="outline" asChild>
          <a href="/">
            <ArrowRight className="h-4 w-4" />
            بازگشت به صفحه اصلی
          </a>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
