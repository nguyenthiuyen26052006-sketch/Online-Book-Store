'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BookText,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  Clock,
  Star,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { adminService } from '@/services/admin.service';
import { formatCurrency } from '@/utils/helpers';

interface DashboardData {
  totalBooks: number;
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  averageRating: number;
  totalReviews: number;
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setError(null);
        const overview = await adminService.getOverviewStats();

        setData({
          totalBooks: overview.total_books,
          totalOrders: overview.total_orders,
          completedOrders: overview.completed_orders,
          pendingOrders: overview.pending_orders,
          totalRevenue: overview.total_revenue,
          averageRating: overview.average_rating ?? 0,
          totalReviews: overview.total_reviews ?? 0,
        });
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Không thể tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const metrics = [
    {
      id: 'books',
      title: 'Tổng số sách',
      value: data?.totalBooks || 0,
      icon: BookText,
      color: 'from-blue-500 to-blue-600',
      lightColor: 'bg-blue-50 dark:bg-blue-950/30',
    },
    {
      id: 'revenue',
      title: 'Tổng doanh thu',
      value: formatCurrency(data?.totalRevenue || 0),
      icon: DollarSign,
      color: 'from-emerald-500 to-emerald-600',
      lightColor: 'bg-emerald-50 dark:bg-emerald-950/30',
    },
    {
      id: 'orders',
      title: 'Tổng đơn hàng',
      value: data?.totalOrders || 0,
      icon: ShoppingCart,
      color: 'from-purple-500 to-purple-600',
      lightColor: 'bg-purple-50 dark:bg-purple-950/30',
    },
    {
      id: 'completed',
      title: 'Đơn đã hoàn tất',
      value: data?.completedOrders || 0,
      icon: CheckCircle2,
      color: 'from-green-500 to-green-600',
      lightColor: 'bg-green-50 dark:bg-green-950/30',
    },
    {
      id: 'rating',
      title: 'Điểm trung bình (sao)',
      value:
        data && data.totalReviews > 0
          ? data.averageRating.toFixed(1)
          : 'Chưa có đánh giá',
      icon: Star,
      color: 'from-amber-500 to-amber-600',
      lightColor: 'bg-amber-50 dark:bg-amber-950/30',
    },
  ];

  const operations = [
    {
      title: 'Quản lý sách',
      description: 'Thêm, cập nhật, và quản lý danh sách sách',
      href: '/admin/books',
      icon: BookText,
    },
    {
      title: 'Quản lý đơn hàng',
      description: 'Xem, xử lý và theo dõi trạng thái đơn hàng',
      href: '/admin/orders',
      icon: ShoppingCart,
    },
    {
      title: 'Đánh giá và nhận xét',
      description: 'Quản lý đánh giá từ khách hàng',
      href: '/admin/reviews',
      icon: TrendingUp,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Bảng điều khiển</h1>
        <p className="mt-2 text-base text-muted-foreground">Tổng quan về hoạt động quản lý cửa hàng sách</p>
      </div>

      {error && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-6">
            <p className="text-sm text-destructive">Lỗi: {error}</p>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {metrics.map((metric) => (
          <Card key={metric.id} className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              {loading ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-32" />
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
                    <div className={`${metric.lightColor} rounded-lg p-2.5`}>
                      <metric.icon className={`h-5 w-5 bg-linear-to-br ${metric.color} bg-clip-text text-transparent`} />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{metric.value}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Operations */}
      <div>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-foreground">Các tác vụ chính</h2>
          <p className="mt-1 text-sm text-muted-foreground">Truy cập nhanh các chức năng quản lý</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {operations.map((op) => (
            <Link key={op.href} href={op.href}>
              <Card className="h-full border-0 shadow-sm hover:shadow-md transition-all hover:border-primary/20 cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex flex-col h-full">
                    <div className="rounded-lg p-3 w-fit mb-3 bg-muted">
                      <op.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{op.title}</h3>
                    <p className="text-sm text-muted-foreground flex-1">{op.description}</p>
                    <Button variant="ghost" size="sm" className="w-fit -ml-2 mt-4">
                      Đi tới →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      {!loading && data && (
        <Card className="border-0 shadow-sm bg-linear-to-br from-muted/50 to-muted/30">
          <CardHeader>
            <CardTitle className="text-base">Tình trạng đơn hàng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-green-100 dark:bg-green-950/30 p-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Đã hoàn tất</p>
                  <p className="text-2xl font-bold text-foreground">{data.completedOrders}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-yellow-100 dark:bg-yellow-950/30 p-3">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Đang xử lý</p>
                  <p className="text-2xl font-bold text-foreground">{data.pendingOrders}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
