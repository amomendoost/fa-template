// CommentSection - nested comment list + new comment form with optional auth
import { useState, createContext, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Loader2, MessageCircle, CheckCircle2, Reply, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { submitComment } from '@/lib/blog/service';
import type { BlogComment } from '@/lib/blog/types';

interface CommentSectionProps {
  postId: string;
  comments?: BlogComment[];
  userName?: string;
  className?: string;
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function getInitial(name: string): string {
  return name.charAt(0).toUpperCase();
}

function CommentItem({
  comment,
  replies,
  onReply,
}: {
  comment: BlogComment;
  replies: BlogComment[];
  onReply: (commentId: string) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="border rounded-lg p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
              {getInitial(comment.author_name)}
            </div>
            <span className="font-medium text-sm">{comment.author_name}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{formatDate(comment.created_at)}</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs gap-1"
              onClick={() => onReply(comment.id)}
            >
              <Reply className="h-3 w-3" />
              پاسخ
            </Button>
          </div>
        </div>
        <p className="text-sm leading-6 text-muted-foreground">{comment.content}</p>
      </div>
      {/* Nested replies */}
      {replies.length > 0 && (
        <div className="pr-6 space-y-3">
          {replies.map((reply) => (
            <div key={reply.id} className="border rounded-lg p-4 space-y-2 bg-muted/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                    {getInitial(reply.author_name)}
                  </div>
                  <span className="font-medium text-sm">{reply.author_name}</span>
                </div>
                <span className="text-xs text-muted-foreground">{formatDate(reply.created_at)}</span>
              </div>
              <p className="text-sm leading-6 text-muted-foreground">{reply.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function CommentSection({ postId, comments = [], userName, className }: CommentSectionProps) {
  const [authorName, setAuthorName] = useState(userName || '');
  const [content, setContent] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Separate top-level comments and replies
  const topLevel = comments.filter((c) => !c.parent_id);
  const repliesMap = new Map<string, BlogComment[]>();
  for (const c of comments) {
    if (c.parent_id) {
      const arr = repliesMap.get(c.parent_id) || [];
      arr.push(c);
      repliesMap.set(c.parent_id, arr);
    }
  }

  const handleReply = (commentId: string) => {
    setReplyTo(commentId);
    setSubmitted(false);
    document.getElementById('comment-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    setError(null);
    try {
      await submitComment(postId, authorName || 'ناشناس', content, replyTo || undefined);
      setSubmitted(true);
      setContent('');
      setReplyTo(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در ارسال نظر');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Comment List */}
      {comments.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            نظرات ({comments.length})
          </h3>
          {topLevel.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              replies={repliesMap.get(comment.id) || []}
              onReply={handleReply}
            />
          ))}
        </div>
      )}

      <Separator />

      {/* New Comment Form */}
      <Card id="comment-form">
        <CardHeader>
          <CardTitle className="text-lg">
            {replyTo ? 'ارسال پاسخ' : 'ارسال نظر'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {replyTo && (
            <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
              <Reply className="h-4 w-4" />
              <span>در حال پاسخ به نظر</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => setReplyTo(null)}
              >
                لغو
              </Button>
            </div>
          )}

          {submitted ? (
            <div className="flex items-center gap-2 text-green-700 py-4">
              <CheckCircle2 className="h-5 w-5" />
              <span>نظر شما ثبت شد و پس از تایید نمایش داده می‌شود.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="author">نام</Label>
                <div className="relative">
                  <User className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="author"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder={userName || 'نام شما (اختیاری)'}
                    className="pr-9"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="comment">نظر *</Label>
                <Textarea
                  id="comment"
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="نظر خود را بنویسید..."
                  rows={4}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" disabled={isSubmitting} className="gap-2">
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <MessageCircle className="h-4 w-4" />
                )}
                {replyTo ? 'ارسال پاسخ' : 'ارسال نظر'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default CommentSection;
