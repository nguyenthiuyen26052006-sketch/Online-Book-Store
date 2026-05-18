'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/store/auth-store';
import { orderService } from '@/services/order.service';
import {
  formatCurrency,
  formatDate,
  getOrderStatusColor,
  getOrderStatusText,
} from '@/utils/helpers';
import type { Order, OrderTracking } from '@/types';
import { toast } from 'sonner';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { isAuthenticated } = useAuthStore();

  const [order, setOrder] = useState<Order | null>(null);
  const [tracking, setTracking] = useState<OrderTracking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/profile/orders/${id}`);
      return;
    }

    const load = async () => {
      setLoading(true);
      try {
        const [o, t] = await Promise.all([
          orderService.getById(id),
          orderService.getTracking(id),
        ]);
        setOrder(o);
        setTracking(t);
        if (!o) {
          toast.error('Không tìm thấy đơn hàng');
          router.push('/profile/orders');
        }
      } catch {
        toast.error('Không thể tải thông tin đơn hàng');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="mb-6 h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/profile/orders"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại danh sách đơn hàng
      </Link>

      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Đơn hàng #{order.id}</h1>
          <p className="mt-1 text-muted-foreground">
            Đặt ngày {formatDate(order.createdAt)}
          </p>
        </div>
        <Badge className={getOrderStatusColor(order.status)}>
          {getOrderStatusText(order.status)}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Sản phẩm
            </CardTitle>
            <CardDescription>Sách trong đơn hàng này</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {order.items.map((item, index) => (
              <div key={index} className="flex gap-4">
                <div className="relative h-24 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
                <div className="flex flex-1 flex-col justify-center">
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(item.price)} × {item.quantity}
                  </p>
                </div>
                <div className="text-right font-semibold">
                  {formatCurrency(item.price * item.quantity)}
                </div>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Tổng cộng</span>
              <span className="text-primary">{formatCurrency(order.totalAmount)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Thông tin giao hàng</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="text-muted-foreground">Địa chỉ</p>
              <p>{order.shippingAddress}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Số điện thoại</p>
              <p>{order.phone}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Thanh toán</p>
              <p>{order.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng' : 'Chuyển khoản ngân hàng'}</p>
            </div>
            {order.note ? (
              <div>
                <p className="text-muted-foreground">Ghi chú</p>
                <p>{order.note}</p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Lịch sử vận chuyển</CardTitle>
          <CardDescription>Lịch sử trạng thái của đơn hàng</CardDescription>
        </CardHeader>
        <CardContent>
          {!tracking ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang tải lịch sử…
            </div>
          ) : tracking.history.length === 0 ? (
            <p className="text-sm text-muted-foreground">Chưa có lịch sử nào được ghi nhận.</p>
          ) : (
            <ol className="relative space-y-6 border-l border-border pl-6">
              {tracking.history.map((entry, idx) => (
                <li key={entry.id} className="relative">
                  <span
                    className={`absolute -left-7.25 mt-1 flex h-4 w-4 items-center justify-center rounded-full border-2 bg-background ${
                      idx === tracking.history.length - 1 ? 'border-primary' : 'border-muted-foreground/40'
                    }`}
                  >
                    <span className="h-2 w-2 rounded-full bg-primary" />
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{getOrderStatusText(entry.status)}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(entry.changedAt)}
                    </span>
                  </div>
                  {entry.note ? (
                    <p className="mt-1 text-sm text-muted-foreground">{entry.note}</p>
                  ) : null}
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>
    </div>
  );
}