// OrderTrackingPage - order status tracking
import { useParams } from 'react-router-dom';
import { OrderStatus } from '@/components/shop/OrderStatus';

export default function OrderTrackingPage() {
  const { orderNumber } = useParams<{ orderNumber: string }>();

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <div className="container mx-auto px-4 py-8 max-w-xl">
        <h1 className="text-2xl font-bold mb-6">پیگیری سفارش</h1>
        <OrderStatus orderNumber={orderNumber} />
      </div>
    </div>
  );
}
