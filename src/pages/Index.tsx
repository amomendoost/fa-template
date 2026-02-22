import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Code, CreditCard, Blocks, Languages } from "lucide-react";

const features = [
  {
    icon: Blocks,
    title: "۴۰+ کامپوننت آماده",
    description: "مجموعه کاملی از کامپوننت‌های shadcn/ui با پشتیبانی RTL",
  },
  {
    icon: Languages,
    title: "فارسی‌سازی کامل",
    description: "تقویم شمسی، اعداد فارسی، فونت وزیرمتن",
  },
  {
    icon: Code,
    title: "توابع کاربردی",
    description: "اعتبارسنجی موبایل و کارت بانکی، فرم‌های آماده با Zod",
  },
  {
    icon: CreditCard,
    title: "زیرساخت پرداخت",
    description: "اتصال به ۷ درگاه ایرانی و بین‌المللی",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <div className="mx-auto flex min-h-screen max-w-2xl flex-col px-6">

        {/* Header */}
        <header className="flex items-center justify-between py-6">
          <span className="text-sm text-muted-foreground">noqte-template</span>
        </header>

        {/* Hero */}
        <main className="flex flex-1 flex-col justify-center py-16">
          <div className="space-y-6">
            <div className="space-y-3">
              <Badge variant="secondary" className="font-normal">نسخه ۲.۰</Badge>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                نقطه
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                این صفحه را ویرایش کنید و پروژه خود را بسازید.
              </p>
            </div>

            <Separator />

            {/* Features */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="group rounded-lg border p-4 transition-colors hover:bg-muted/50"
                >
                  <feature.icon className="mb-3 h-5 w-5 text-muted-foreground transition-colors group-hover:text-foreground" />
                  <h3 className="text-sm font-medium">{feature.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="py-6 text-center text-xs text-muted-foreground">
          ساخته شده با React، TypeScript و shadcn/ui
        </footer>

      </div>
    </div>
  );
};

export default Index;
