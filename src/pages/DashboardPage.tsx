// DashboardPage - user dashboard with tabs: orders, subscriptions, courses, downloads
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Loader2, ShoppingCart, Package, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { SubscriptionList } from '@/components/shop/subscriptions/SubscriptionList';
import { CourseCard } from '@/components/shop/courses/CourseCard';
import { FulfillmentStatusDisplay } from '@/components/shop/fulfillment/FulfillmentStatus';
import { DownloadButton } from '@/components/shop/fulfillment/DownloadButton';
import { LicenseKeyDisplay } from '@/components/shop/fulfillment/LicenseKeyDisplay';
import { PriceTag } from '@/components/shop/PriceTag';
import { useAuth } from '@/hooks/use-auth';
import { useMyOrders } from '@/hooks/use-my-orders';
import { useSubscriptions } from '@/hooks/use-subscriptions';
import { useMyCourses } from '@/hooks/use-courses';
import { useMyEntitlements } from '@/hooks/use-entitlements';
import type { Order, Fulfillment } from '@/lib/shop/types';

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: 'در انتظار', color: 'bg-yellow-100 text-yellow-800' },
  paid: { label: 'پرداخت شده', color: 'bg-green-100 text-green-800' },
  processing: { label: 'پردازش', color: 'bg-blue-100 text-blue-800' },
  shipped: { label: 'ارسال شده', color: 'bg-purple-100 text-purple-800' },
  delivered: { label: 'تحویل', color: 'bg-green-100 text-green-800' },
  partially_fulfilled: { label: 'تحویل جزئی', color: 'bg-blue-100 text-blue-800' },
  fulfilled: { label: 'تکمیل', color: 'bg-green-100 text-green-800' },
  completed: { label: 'انجام شده', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'لغو', color: 'bg-red-100 text-red-800' },
  refunded: { label: 'مرجوع', color: 'bg-gray-100 text-gray-800' },
  expired: { label: 'منقضی', color: 'bg-orange-100 text-orange-800' },
};

function OrderCard({ order }: { order: Order }) {
  const status = STATUS_MAP[order.status] || STATUS_MAP.pending;
  const [expanded, setExpanded] = useState(false);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium" dir="ltr">{order.order_number}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(order.created_at).toLocaleDateString('fa-IR')}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <PriceTag price={order.total_amount} currency={order.currency} className="text-sm" />
            <Badge className={cn('text-[11px]', status.color)}>{status.label}</Badge>
          </div>
        </div>

        {order.items.length > 0 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-muted-foreground hover:text-foreground mt-2"
          >
            {expanded ? 'بستن جزئیات' : `${order.items.length.toLocaleString('fa-IR')} آیتم — مشاهده جزئیات`}
          </button>
        )}

        {expanded && (
          <div className="mt-3 space-y-2">
            <Separator />
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{item.name} × {item.quantity.toLocaleString('fa-IR')}</span>
                <PriceTag price={item.total} currency={order.currency} className="text-sm" />
              </div>
            ))}
            {order.fulfillments && order.fulfillments.length > 0 && (
              <div className="space-y-2 pt-2">
                <Separator />
                <p className="text-xs font-medium">وضعیت تحویل</p>
                {order.fulfillments.map((f) => (
                  <FulfillmentStatusDisplay key={f.id} fulfillment={f} />
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function DigitalFulfillmentsList({ fulfillments, download }: {
  fulfillments: Fulfillment[];
  download: (fulfillmentId: string, fileId: string) => Promise<{ download_url: string }>;
}) {
  if (fulfillments.length === 0) {
    return <p className="text-center py-8 text-sm text-muted-foreground">دانلود یا لایسنسی ندارید</p>;
  }

  return (
    <div className="space-y-3">
      {fulfillments.map((f) => {
        if (f.fulfillment_type === 'license_key' && f.license_key_masked) {
          return <LicenseKeyDisplay key={f.id} licenseKey={f.license_key_masked} />;
        }
        if (f.fulfillment_type === 'auto_download' && f.files) {
          return (
            <div key={f.id} className="space-y-2">
              {f.files.map((file) => (
                <DownloadButton
                  key={file.id}
                  fileName={file.file_name}
                  sizeBytes={file.file_size}
                  onDownload={() => download(f.id, file.id)}
                />
              ))}
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}

function DashboardContent() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { orders, isLoading: ordersLoading } = useMyOrders();
  const { subscriptions, isLoading: subsLoading, cancel, renew } = useSubscriptions();
  const { courses, isLoading: coursesLoading } = useMyCourses();
  const { fulfillments: digitalFulfillments, isLoading: entLoading, download } = useMyEntitlements();

  const tabTriggerClass = 'text-xs sm:text-sm px-3 sm:px-4';

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <title>پنل کاربری</title>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/shop')} className="text-lg font-bold">
                فروشگاه
              </button>
              <span className="text-muted-foreground/30">|</span>
              <span className="text-sm text-muted-foreground">پنل کاربری</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => navigate('/shop')}>
                <ShoppingCart className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" className="gap-2 text-xs" onClick={logout}>
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">خروج</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-3xl">
        {/* User info */}
        {user && (
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
              <Package className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium" dir="ltr">{user.phone || user.email || 'کاربر'}</p>
              <p className="text-xs text-muted-foreground">حساب کاربری</p>
            </div>
          </div>
        )}

        <Tabs defaultValue="orders" dir="rtl">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="orders" className={tabTriggerClass}>سفارشات</TabsTrigger>
            <TabsTrigger value="subscriptions" className={tabTriggerClass}>اشتراک‌ها</TabsTrigger>
            <TabsTrigger value="courses" className={tabTriggerClass}>دوره‌ها</TabsTrigger>
            <TabsTrigger value="downloads" className={tabTriggerClass}>دانلودها</TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders" className="mt-4">
            {ordersLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : !orders?.length ? (
              <div className="text-center py-12 space-y-3">
                <p className="text-sm text-muted-foreground">سفارشی ثبت نشده</p>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/shop">مشاهده محصولات</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => <OrderCard key={order.id} order={order} />)}
              </div>
            )}
          </TabsContent>

          {/* Subscriptions Tab */}
          <TabsContent value="subscriptions" className="mt-4">
            <SubscriptionList
              subscriptions={subscriptions}
              isLoading={subsLoading}
              onCancel={cancel}
              onRenew={renew}
            />
          </TabsContent>

          {/* Courses Tab */}
          <TabsContent value="courses" className="mt-4">
            {coursesLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : !courses.length ? (
              <p className="text-center py-12 text-sm text-muted-foreground">دوره‌ای ثبت‌نام نکرده‌اید</p>
            ) : (
              <div className="space-y-3">
                {courses.map((c) => <CourseCard key={c.id} enrollment={c} />)}
              </div>
            )}
          </TabsContent>

          {/* Downloads/Licenses Tab */}
          <TabsContent value="downloads" className="mt-4">
            {entLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : (
              <DigitalFulfillmentsList fulfillments={digitalFulfillments} download={download} />
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}
