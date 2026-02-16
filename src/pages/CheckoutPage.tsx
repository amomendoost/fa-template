// CheckoutPage - checkout form
import { useNavigate } from 'react-router-dom';
import { CheckoutForm } from '@/components/shop/CheckoutForm';

export default function CheckoutPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-2xl font-bold mb-6">تکمیل خرید</h1>
        <CheckoutForm onSuccess={() => navigate('/')} />
      </div>
    </div>
  );
}
