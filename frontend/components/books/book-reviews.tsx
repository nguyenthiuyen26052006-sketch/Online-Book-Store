'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2, Pencil, Star, Trash2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { reviewService } from '@/services/review.service';
import { useAuthStore } from '@/store/auth-store';
import type { Review } from '@/types';
import { formatDate } from '@/utils/helpers';
import { toast } from 'sonner';

type Props = {
  bookId: string;
  onReviewsChanged?: () => void | Promise<void>;
};

function StarRating({
  value,
  size = 'md',
}: {
  value: number;
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizeClass = size === 'sm' ? 'h-3.5 w-3.5' : size === 'lg' ? 'h-7 w-7' : 'h-5 w-5';
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`${sizeClass} ${
            i < value ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted'
          }`}
        />
      ))}
    </div>
  );
}

export function BookReviewsSection({ bookId, onReviewsChanged }: Props) {
  const { user, token, isAuthenticated } = useAuthStore();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const computedAverageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    pct:
      reviews.length > 0
        ? (reviews.filter((r) => r.rating === star).length / reviews.length) * 100
        : 0,
  }));

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await reviewService.getByBookId(bookId);
      setReviews(data);
    } catch {
      toast.error('Không tải được đánh giá');
    } finally {
      setLoading(false);
    }
  }, [bookId]);

  useEffect(() => {
    load();
  }, [load]);

  const userId = user ? String(user.id) : null;

  const listReviews = editingId
    ? reviews.filter((r) => r.id !== editingId)
    : reviews;

  const startEdit = (r: Review) => {
    setEditingId(r.id);
    setRating(r.rating);
    setComment(r.comment);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setRating(5);
    setComment('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const authToken = token ?? localStorage.getItem('bookstore-token');
    if (!authToken || !user || !userId) {
      toast.error('Vui lòng đăng nhập để đánh giá');
      return;
    }
    const trimmed = comment.trim();
    if (trimmed.length < 2) {
      toast.error('Vui lòng viết nội dung đánh giá');
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        const updated = await reviewService.update(
          editingId,
          { rating, comment: trimmed },
          authToken
        );
        setReviews((prev) =>
          prev.map((r) => (r.id === updated.id ? updated : r))
        );
        toast.success('Đã cập nhật đánh giá');
      } else {
        const created = await reviewService.create(
          { bookId, rating, comment: trimmed },
          authToken
        );
        setReviews((prev) => [created, ...prev.filter((r) => r.id !== created.id)]);
        toast.success('Đã gửi đánh giá');
      }
      cancelEdit();
      await onReviewsChanged?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Đã có lỗi xảy ra');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    const authToken = token ?? localStorage.getItem('bookstore-token');
    if (!deleteId || !authToken) return;
    setSubmitting(true);
    try {
      await reviewService.delete(deleteId, authToken);
      setReviews((prev) => prev.filter((r) => r.id !== deleteId));
      toast.success('Đã xoá đánh giá');
      setDeleteId(null);
      cancelEdit();
      await onReviewsChanged?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không thể xoá đánh giá');
    } finally {
      setSubmitting(false);
    }
  };

  const ratingLabels = ['', 'Rất tệ', 'Không hay', 'Bình thường', 'Khá hay', 'Tuyệt vời'];

  return (
    <section className="mt-12 border-t pt-10">

      {/* ── Section Header ── */}
      <div className="mb-8 flex items-center gap-3">
        <MessageSquare className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Đánh giá của độc giả</h2>
      </div>

      {/* ── Rating Summary ── */}
      {reviews.length > 0 && (
        <div className="mb-10 grid gap-6 rounded-2xl border bg-muted/30 p-6 sm:grid-cols-[auto_1fr]">
          {/* Average score */}
          <div className="flex flex-col items-center justify-center gap-1 sm:border-r sm:pr-8">
            <span className="text-6xl font-bold tracking-tight text-foreground">
              {computedAverageRating.toFixed(1)}
            </span>
            <StarRating value={Math.round(computedAverageRating)} size="md" />
            <span className="mt-1 text-sm text-muted-foreground">
              {reviews.length} đánh giá
            </span>
          </div>

          {/* Distribution bars */}
          <div className="flex flex-col justify-center gap-2 sm:pl-4">
            {ratingDistribution.map(({ star, count, pct }) => (
              <div key={star} className="flex items-center gap-3">
                <span className="w-4 text-right text-xs font-medium text-muted-foreground">
                  {star}
                </span>
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full rounded-full bg-amber-400 transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-6 text-right text-xs text-muted-foreground">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Write / Edit Review ── */}
      {isAuthenticated ? (
        <div className="mb-10 rounded-2xl border bg-card p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            <h3 className="font-semibold text-foreground">
              {editingId ? 'Chỉnh sửa đánh giá' : 'Viết đánh giá'}
            </h3>
            {!editingId && (
              <p className="text-sm text-muted-foreground">
                Bạn có thể gửi nhiều đánh giá cho cùng một cuốn sách.
              </p>
            )}

            <div>
              <p className="mb-2 text-sm font-medium text-muted-foreground">Xếp hạng</p>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    onMouseEnter={() => setHoverRating(value)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="rounded p-0.5 transition-transform hover:scale-110"
                    aria-label={`${value} sao`}
                  >
                    <Star
                      className={`h-8 w-8 transition-colors ${
                        value <= (hoverRating || rating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-muted text-muted'
                      }`}
                    />
                  </button>
                ))}
                {(hoverRating || rating) > 0 && (
                  <span className="ml-2 text-sm font-medium text-amber-500">
                    {ratingLabels[hoverRating || rating]}
                  </span>
                )}
              </div>
            </div>

            <div>
              <label
                className="mb-2 block text-sm font-medium text-muted-foreground"
                htmlFor="review-comment"
              >
                Nội dung
              </label>
              <Textarea
                id="review-comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Chia sẻ cảm nhận của bạn về cuốn sách này..."
                rows={4}
                disabled={submitting}
                className="resize-none"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={submitting} className="gap-2">
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {editingId ? 'Lưu thay đổi' : 'Gửi đánh giá'}
              </Button>
              {editingId && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={cancelEdit}
                  disabled={submitting}
                >
                  Huỷ
                </Button>
              )}
            </div>
          </form>
        </div>
      ) : (
        <div className="mb-8 flex items-center gap-3 rounded-xl border border-dashed bg-muted/30 px-5 py-4">
          <Star className="h-5 w-5 shrink-0 text-amber-400" />
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Đăng nhập</span> để đánh giá cuốn sách này và chia sẻ cảm nhận của bạn.
          </p>
        </div>
      )}

      {/* ── Review List ── */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
        </div>
      ) : listReviews.length === 0 ? (
        <div className="py-12 text-center">
          <MessageSquare className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
          <p className="text-muted-foreground">
            Chưa có đánh giá. Hãy là người đầu tiên!
          </p>
        </div>
      ) : (
        <ul className="divide-y">
          {listReviews.map((r) => (
            <li key={r.id} className="py-6 first:pt-0">
              {/* Reviewer info */}
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  {/* Avatar placeholder */}
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {r.userName?.charAt(0).toUpperCase() ?? '?'}
                  </div>
                  <div>
                    <p className="text-sm font-semibold leading-none">
                      {r.userName}
                      {userId === r.userId && (
                        <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                          (Bạn)
                        </span>
                      )}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{formatDate(r.createdAt)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <StarRating value={r.rating} size="sm" />
                  <span className="text-xs font-medium text-amber-500">
                    {ratingLabels[r.rating]}
                  </span>
                </div>
              </div>

              {/* Comment */}
              <p className="mt-3 pl-12 text-sm leading-relaxed text-foreground/80">{r.comment}</p>

              {/* Replies */}
              {r.replies && r.replies.length > 0 && (
                <ul className="mt-4 space-y-2 pl-12">
                  {r.replies.map((reply) => (
                    <li
                      key={reply.id}
                      className="rounded-xl border-l-2 border-primary/40 bg-muted/40 px-4 py-3"
                    >
                      <p className="text-xs font-semibold text-primary">{reply.displayName}</p>
                      <p className="mt-1 text-sm text-foreground/80">{reply.message}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{formatDate(reply.createdAt)}</p>
                    </li>
                  ))}
                </ul>
              )}

              {/* Owner actions */}
              {userId === r.userId && (
                <div className="mt-3 flex gap-1 pl-12">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1 text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => startEdit(r)}
                  >
                    <Pencil className="h-3 w-3" />
                    Chỉnh sửa
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1 text-xs text-destructive/70 hover:text-destructive"
                    onClick={() => setDeleteId(r.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                    Xoá
                  </Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* ── Delete Confirm Dialog ── */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xoá đánh giá này?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Đánh giá của bạn sẽ bị xoá khỏi cuốn sách.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Huỷ</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={submitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Xoá
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}