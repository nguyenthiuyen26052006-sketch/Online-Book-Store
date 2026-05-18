'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Package, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/store/auth-store';
import { orderService } from '@/services/order.service';
import { formatCurrency, formatDate, getOrderStatusText, getOrderStatusColor } from '@/utils/helpers';
import type { Order } from '@/types';

export default function OrdersPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/profile/orders');
      return;
    }

    const loadOrders = async () => {
      try {
        if (user) {
          const data = await orderService.getByUserId(user.id);
          setOrders(data);
        }
      } catch (error) {
        console.error('Không thể tải danh sách đơn hàng:', error);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Đơn hàng của tôi</h1>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Package className="mb-4 h-16 w-16 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-medium">Chưa có đơn hàng nào</h3>
            <p className="mb-6 text-sm text-muted-foreground">
              Bạn chưa đặt đơn hàng nào
            </p>
            <Link href="/products">
              <Button>Mua sắm ngay</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-base">
                      Đơn hàng #{order.id}
                    </CardTitle>
                    <CardDescription>
                      Đặt ngày {formatDate(order.createdAt)}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center">
                    <Badge className={getOrderStatusColor(order.status)}>
                      {getOrderStatusText(order.status)}
                    </Badge>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/profile/orders/${order.id}`}>Chi tiết</Link>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Sản phẩm */}
                <div className="space-y-3">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="relative h-16 w-12 flex-shrink-0 overflow-hidden rounded bg-muted">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </div>
                      <div className="flex-1 text-sm">
                        <p className="font-medium">{item.title}</p>
                        <p className="text-muted-foreground">
                          {formatCurrency(item.price)} x {item.quantity}
                        </p>
                      </div>
                      <p className="font-medium">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Thông tin đơn hàng */}
                <div className="grid gap-2 text-sm sm:grid-cols-2">
                  <div>
                    <span className="text-muted-foreground">Địa chỉ: </span>
                    <span>{order.shippingAddress}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Số điện thoại: </span>
                    <span>{order.phone}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Thanh toán: </span>
                    <span>
                      {order.paymentMethod === 'cod'
                        ? 'Thanh toán khi nhận hàng'
                        : 'Chuyển khoản ngân hàng'}
                    </span>
                  </div>
                </div>

                <Separator />

                {/* Tổng cộng */}
                <div className="flex items-center justify-between">
                  <span className="font-medium">Tổng cộng</span>
                  <span className="text-lg font-bold text-primary">
                    {formatCurrency(order.totalAmount)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}