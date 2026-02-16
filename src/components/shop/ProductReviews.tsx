// ProductReviews - reviews list + submit form
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Loader2, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { getProductReviews, submitReview } from '@/lib/shop/service';
import { StarRating } from './StarRating';
import type { ProductReview } from '@/lib/shop/types';

interface ProductReviewsProps {
  slug: string;
  className?: string;
}

export function ProductReviews({ slug, className }: ProductReviewsProps) {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ author_name: '', author_email: '', rating: 0, title: '', content: '' });

  useEffect(() => {
    setIsLoading(true);
    getProductReviews(slug)
      .then(setReviews)
      .catch(() => setReviews([]))
      .finally(() => setIsLoading(false));
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.author_name || !form.rating) {
      toast({ title: 'خطا', description: 'نام و امتیاز الزامی است', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      await submitReview(slug, form);
      toast({ title: 'با تشکر', description: 'نظر شما پس از تأیید نمایش داده می‌شود' });
      setForm({ author_name: '', author_email: '', rating: 0, title: '', content: '' });
      setShowForm(false);
    } catch {
      toast({ title: 'خطا', description: 'ارسال نظر با مشکل مواجه شد', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          نظرات ({reviews.length})
        </h2>
        <Button variant="outline" size="sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'بستن' : 'ثبت نظر'}
        </Button>
      </div>

      {/* Submit Form */}
      {showForm && (
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>امتیاز *</Label>
                <StarRating value={form.rating} onChange={(v) => setForm({ ...form, rating: v })} />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>نام *</Label>
                  <Input value={form.author_name} onChange={(e) => setForm({ ...form, author_name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>ایمیل</Label>
                  <Input type="email" dir="ltr" value={form.author_email} onChange={(e) => setForm({ ...form, author_email: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>عنوان</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>متن نظر</Label>
                <Textarea rows={3} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
              </div>
              <Button type="submit" disabled={submitting} className="gap-2">
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                ارسال نظر
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      {isLoading ? (
        <div className="text-center text-muted-foreground py-8">در حال بارگذاری...</div>
      ) : reviews.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">
          هنوز نظری ثبت نشده. اولین نفر باشید!
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="pt-4 pb-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{review.author_name}</span>
                    {review.is_verified_purchase && (
                      <span className="text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded">خریدار</span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(review.created_at).toLocaleDateString('fa-IR')}
                  </span>
                </div>
                <StarRating value={review.rating} readonly size="sm" />
                {review.title && <p className="font-medium text-sm">{review.title}</p>}
                {review.content && <p className="text-sm text-muted-foreground leading-6">{review.content}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductReviews;
