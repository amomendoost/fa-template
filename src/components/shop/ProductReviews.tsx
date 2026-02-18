// ProductReviews - reviews list with rating summary + submit form
import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { getProductReviews, submitReview } from '@/lib/shop/service';
import { StarRating } from './StarRating';
import type { ProductReview } from '@/lib/shop/types';

interface ProductReviewsProps {
  slug: string;
  className?: string;
}

function RatingSummary({ reviews }: { reviews: ProductReview[] }) {
  const stats = useMemo(() => {
    if (reviews.length === 0) return null;
    const counts = [0, 0, 0, 0, 0];
    let sum = 0;
    for (const r of reviews) {
      counts[r.rating - 1]++;
      sum += r.rating;
    }
    return { counts, avg: sum / reviews.length, total: reviews.length };
  }, [reviews]);

  if (!stats) return null;

  return (
    <div className="flex gap-8 items-start pb-6">
      <div className="flex flex-col items-center gap-1 shrink-0">
        <span className="text-4xl font-bold">{stats.avg.toFixed(1).replace('.', '٫')}</span>
        <StarRating value={Math.round(stats.avg)} readonly size="sm" />
        <span className="text-xs text-muted-foreground mt-1">
          از {stats.total.toLocaleString('fa-IR')} نظر
        </span>
      </div>
      <div className="flex-1 space-y-1.5 pt-1">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = stats.counts[star - 1];
          const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
          return (
            <div key={star} className="flex items-center gap-2 text-sm">
              <span className="w-3 text-muted-foreground tabular-nums">{star.toLocaleString('fa-IR')}</span>
              <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-yellow-400 transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="w-6 text-xs text-muted-foreground tabular-nums text-left">
                {count.toLocaleString('fa-IR')}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ReviewAvatar({ name }: { name: string }) {
  const letter = name.charAt(0).toUpperCase();
  return (
    <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center shrink-0 text-sm font-semibold text-muted-foreground">
      {letter}
    </div>
  );
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
      {/* Rating summary + CTA */}
      {!isLoading && (
        <div className="flex items-start justify-between gap-4">
          <RatingSummary reviews={reviews} />
          <Button
            variant={showForm ? 'secondary' : 'outline'}
            size="sm"
            className="rounded-full shrink-0"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'بستن' : 'ثبت نظر'}
          </Button>
        </div>
      )}

      {/* Submit Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4 p-5 rounded-2xl bg-muted/30 border">
          <div className="space-y-2">
            <Label className="text-sm">امتیاز شما</Label>
            <StarRating value={form.rating} onChange={(v) => setForm({ ...form, rating: v })} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm">نام</Label>
              <Input
                className="rounded-xl"
                value={form.author_name}
                onChange={(e) => setForm({ ...form, author_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">ایمیل (اختیاری)</Label>
              <Input
                type="email"
                dir="ltr"
                className="rounded-xl"
                value={form.author_email}
                onChange={(e) => setForm({ ...form, author_email: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm">عنوان (اختیاری)</Label>
            <Input
              className="rounded-xl"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm">متن نظر</Label>
            <Textarea
              rows={3}
              className="rounded-xl resize-none"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
            />
          </div>
          <Button type="submit" disabled={submitting} className="gap-2 rounded-full">
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            ارسال نظر
          </Button>
        </form>
      )}

      {isLoading && (
        <div className="text-center text-sm text-muted-foreground py-8">در حال بارگذاری...</div>
      )}

      {!isLoading && reviews.length === 0 && (
        <div className="text-center text-sm text-muted-foreground py-8">
          هنوز نظری ثبت نشده. اولین نفر باشید!
        </div>
      )}

      {/* Reviews List */}
      {!isLoading && reviews.length > 0 && (
        <div className="space-y-0">
          {reviews.map((review, i) => (
            <div key={review.id}>
              <div className="flex gap-3 py-5">
                <ReviewAvatar name={review.author_name} />
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{review.author_name}</span>
                      {review.is_verified_purchase && (
                        <span className="text-[11px] text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded-full">
                          خریدار
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {new Date(review.created_at).toLocaleDateString('fa-IR')}
                    </span>
                  </div>
                  <StarRating value={review.rating} readonly size="sm" />
                  {review.title && <p className="text-sm font-medium">{review.title}</p>}
                  {review.content && (
                    <p className="text-sm text-muted-foreground leading-6">{review.content}</p>
                  )}
                </div>
              </div>
              {i < reviews.length - 1 && <Separator />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductReviews;
