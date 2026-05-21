'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageCircle, Star, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { adminService } from '@/services/admin.service';
import { reviewService } from '@/services/review.service';
import { formatDate } from '@/utils/helpers';
import { toast } from 'sonner';

type AdminReviewRow = Awaited<ReturnType<typeof adminService.getReviews>>[number];

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<AdminReviewRow[]>([]);
  const [analytics, setAnalytics] = useState<
    Awaited<ReturnType<typeof adminService.getBookReviewAnalytics>>
  >([]);
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [bookFilter, setBookFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyReviewId, setReplyReviewId] = useState<number | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [replyAs, setReplyAs] = useState<'Store Team' | 'System Admin' | 'Customer Support'>('Store Team');  const [replying, setReplying] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      setError(null);
      const opts: { rating?: number; bookId?: string } = {};
      if (ratingFilter !== 'all') opts.rating = Number.parseInt(ratingFilter, 10);
      if (bookFilter !== 'all') opts.bookId = bookFilter;
      const [revRows, stats] = await Promise.all([
        adminService.getReviews(Object.keys(opts).length ? opts : undefined),
        adminService.getBookReviewAnalytics(),
      ]);
      setReviews(revRows);
      setAnalytics(stats);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không tải được đánh giá');
    } finally {
      setLoading(false);
    }
  }, [ratingFilter, bookFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDelete = async (reviewId: number) => {
    const token = localStorage.getItem('bookstore-token');
    try {
      await reviewService.delete(String(reviewId), token);
      toast.success('Đã xóa đánh giá');
      loadData();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Xóa thất bại');
    }
  };

  const submitReply = async () => {
    if (!replyReviewId || !replyMessage.trim()) return;
    setReplying(true);
    try {
      await adminService.replyToReview(replyReviewId, {
        message: replyMessage.trim(),
        displayName: replyAs,
      });
      toast.success('Đã gửi phản hồi');
      setReplyOpen(false);
      setReplyMessage('');
      loadData();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Gửi phản hồi thất bại');
    } finally {
      setReplying(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Quản lý đánh giá</h1>
        <p className="text-muted-foreground">
          Xem, lọc và phản hồi đánh giá của khách hàng
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Điểm theo sách</CardTitle>
          <CardDescription>Điểm trung bình và số lượng đánh giá</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-24 w-full" />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sách</TableHead>
                    <TableHead>Trung bình</TableHead>
                    <TableHead>Số đánh giá</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analytics.map((row) => (
                    <TableRow key={row.book_id}>
                      <TableCell className="font-medium">{row.title}</TableCell>
                      <TableCell>
                        {row.review_count > 0
                          ? row.average_rating.toFixed(1)
                          : 'Chưa có đánh giá'}
                      </TableCell>
                      <TableCell>{row.review_count}</TableCell>
                    </TableRow>
                  ))}
                  {!analytics.length && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground">
                        Chưa có sách
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Tất cả đánh giá</CardTitle>
            <CardDescription>Lọc theo sách hoặc số sao, trả lời khách hàng</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={bookFilter} onValueChange={setBookFilter}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Sách" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả sách</SelectItem>
                {analytics.map((b) => (
                  <SelectItem key={b.book_id} value={String(b.book_id)}>
                    {b.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Sao" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Mọi mức sao</SelectItem>
                {[5, 4, 3, 2, 1].map((r) => (
                  <SelectItem key={r} value={String(r)}>
                    {r} sao
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sách</TableHead>
                    <TableHead>Khách</TableHead>
                    <TableHead>Sao</TableHead>
                    <TableHead>Nội dung</TableHead>
                    <TableHead>Ngày</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reviews.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="max-w-[180px] font-medium">
                        {r.book_title || `#${r.book_id}`}
                      </TableCell>
                      <TableCell>{r.user?.name ?? `User ${r.user_id}`}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          {r.rating}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-muted-foreground">
                        {r.comment}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm">
                        {formatDate(r.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setReplyReviewId(r.id);
                              setReplyOpen(true);
                            }}
                          >
                            <MessageCircle className="mr-1 h-4 w-4" />
                            Trả lời
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive"
                            onClick={() => handleDelete(r.id)}
                          >
                            <Trash2 className="mr-1 h-4 w-4" />
                            Xóa
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!reviews.length && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        Không có đánh giá phù hợp
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={replyOpen} onOpenChange={setReplyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Trả lời đánh giá</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Tên hiển thị</Label>
              <Select value={replyAs} onValueChange={(v) => setReplyAs(v as typeof replyAs)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Book Store">Book Store</SelectItem>
                  <SelectItem value="Seller">Seller</SelectItem>
                  <SelectItem value="Shop Admin">Shop Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="reply-msg">Nội dung phản hồi</Label>
              <Textarea
                id="reply-msg"
                className="mt-1"
                rows={4}
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReplyOpen(false)}>Hủy</Button>
            <Button onClick={submitReply} disabled={replying || !replyMessage.trim()}>
              Gửi phản hồi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
