'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from 'recharts';
import {
  Activity,
  BookText,
  MessageSquare,
  ShoppingCart,
  TrendingUp,
  Users,
  DollarSign,
  ArrowUpRight,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { superAdminService } from '@/services/super-admin.service';
import { formatCurrency, formatShortDate, getOrderStatusText } from '@/utils/helpers';
import type { SuperAdminDashboard } from '@/types';

const STATUS_COLORS: Record<string, string> = {
  pending:   '#f59e0b',
  confirmed: '#0ea5e9',
  shipping:  '#8b5cf6',
  delivered: '#10b981',
  completed: '#06b6d4',
  cancelled: '#ef4444',
};

const BAR_COLORS = ['#0ea5e9', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

// ─── Helpers ────────────────────────────────────────────────

function buildOrderStatusPie(data: SuperAdminDashboard) {
  const map: Record<string, number> = {};
  data.recentOrders.forEach((o) => {
    map[o.status] = (map[o.status] ?? 0) + 1;
  });
  return Object.entries(map).map(([status, value]) => ({
    name: getOrderStatusText(status),
    value,
    color: STATUS_COLORS[status] ?? '#94a3b8',
  }));
}

function getOrderStatusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  const map: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    pending:   'outline',
    confirmed: 'secondary',
    shipping:  'secondary',
    delivered: 'default',
    completed: 'default',
    cancelled: 'destructive',
  };
  return map[status] ?? 'outline';
}

const tooltipStyle = {
  backgroundColor: 'hsl(var(--background))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '8px',
  fontSize: 12,
};

// ─── Page ────────────────────────────────────────────────────

export default function SuperAdminDashboardPage() {
  const [data, setData] = useState<SuperAdminDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    superAdminService
      .getDashboard()
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card className="border-destructive/50 bg-destructive/5">
        <CardContent className="pt-6">
          <p className="text-sm text-destructive">
            Lỗi: {error || 'Không thể tải dữ liệu bảng điều khiển'}
          </p>
        </CardContent>
      </Card>
    );
  }

  const orderStatusPie = buildOrderStatusPie(data);

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bảng điều khiển hệ thống</h1>
        <p className="mt-2 text-base text-muted-foreground">Giám sát hoạt động toàn bộ nền tảng</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Tổng doanh thu"
          value={formatCurrency(data.totalRevenue)}
          icon={DollarSign}
          color="from-blue-500 to-blue-600"
          lightColor="bg-blue-50 dark:bg-blue-950/30"
          trend="+12.5%"
        />
        <StatCard
          label="Tổng đơn hàng"
          value={String(data.totalOrders)}
          icon={ShoppingCart}
          color="from-purple-500 to-purple-600"
          lightColor="bg-purple-50 dark:bg-purple-950/30"
          sub={`${data.deliveredOrders} hoàn tất`}
        />
        <StatCard
          label="Tổng người dùng"
          value={String(data.totalUsers)}
          icon={Users}
          color="from-emerald-500 to-emerald-600"
          lightColor="bg-emerald-50 dark:bg-emerald-950/30"
          sub={`+${data.newUsers30d} trong 30 ngày`}
        />
        <StatCard
          label="Tổng sách"
          value={String(data.totalBooks)}
          icon={BookText}
          color="from-orange-500 to-orange-600"
          lightColor="bg-orange-50 dark:bg-orange-950/30"
        />
      </div>

      {/* Charts row 1 */}
      <div className="grid gap-6 lg:grid-cols-5">

        {/* Area — doanh thu theo ngày (chiếm 3/5) */}
        <Card className="border-0 shadow-sm lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-5 w-5" />
              Doanh thu theo ngày
            </CardTitle>
            <CardDescription>14 ngày gần nhất</CardDescription>
          </CardHeader>
          <CardContent>
            {data.salesByDay.length ? (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={data.salesByDay} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day"     tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}tr`} />
                  <Tooltip formatter={(v: number) => [formatCurrency(v), 'Doanh thu']} contentStyle={tooltipStyle} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fill="url(#gradRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : <EmptyChart />}
          </CardContent>
        </Card>

        {/* Donut — trạng thái đơn hàng (chiếm 2/5) */}
        <Card className="border-0 shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShoppingCart className="h-5 w-5" />
              Trạng thái đơn hàng
            </CardTitle>
            <CardDescription>Phân bổ theo trạng thái</CardDescription>
          </CardHeader>
          <CardContent>
            {orderStatusPie.length ? (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={orderStatusPie}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {orderStatusPie.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v: number, _: string, props: any) => [
                      `${v} đơn`,
                      props.payload.name,
                    ]}
                    contentStyle={tooltipStyle}
                  />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : <EmptyChart />}
          </CardContent>
        </Card>
      </div>

      {/* Charts row 2 */}
      <div className="grid gap-6 lg:grid-cols-2">

        {/* Bar — đơn hàng theo tháng */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShoppingCart className="h-5 w-5" />
              Đơn hàng theo tháng
            </CardTitle>
            <CardDescription>12 tháng gần nhất</CardDescription>
          </CardHeader>
          <CardContent>
            {data.salesByMonth.length ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={data.salesByMonth} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(v: number) => [`${v} đơn`, 'Số đơn']}
                    contentStyle={tooltipStyle}
                  />
                  <Bar dataKey="orders" radius={[6, 6, 0, 0]}>
                    {data.salesByMonth.map((_, i) => (
                      <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : <EmptyChart />}
          </CardContent>
        </Card>

        {/* Bar ngang — top sách bán chạy */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-5 w-5" />
              Top sách bán chạy
            </CardTitle>
            <CardDescription>Theo số lượng bán ra</CardDescription>
          </CardHeader>
          <CardContent>
            {data.topSellingBooks.length ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={data.topSellingBooks.slice(0, 6).map((b) => ({
                    name: b.title.length > 18 ? b.title.slice(0, 18) + '…' : b.title,
                    sold: b.sold,
                  }))}
                  layout="vertical"
                  margin={{ top: 4, right: 24, left: 8, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={120} />
                  <Tooltip
                    formatter={(v: number) => [`${v} quyển`, 'Đã bán']}
                    contentStyle={tooltipStyle}
                  />
                  <Bar dataKey="sold" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <EmptyChart />}
          </CardContent>
        </Card>
      </div>

      {/* Top Books list & Most Reviewed */}
      <div className="grid gap-6 lg:grid-cols-2">

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-5 w-5" />
              Sách bán chạy nhất
            </CardTitle>
            <CardDescription>Top 8 sách theo số bán</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.topSellingBooks.length ? data.topSellingBooks.map((book, idx) => (
                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary shrink-0">
                        {idx + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{book.title}</p>
                        <p className="text-xs text-muted-foreground">{formatCurrency(book.price)}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="ml-2 shrink-0">-- quyển</Badge>
                  </div>
              )) : <EmptyText />}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageSquare className="h-5 w-5" />
              Sách được đánh giá nhiều
            </CardTitle>
            <CardDescription>Top 8 sách theo số đánh giá</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.mostReviewedBooks.length ? data.mostReviewedBooks.map((book, idx) => (
                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-pink-100 dark:bg-pink-950/30 text-xs font-semibold text-pink-600 dark:text-pink-400 shrink-0">
                        {idx + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{book.title}</p>
                        <p className="text-xs text-muted-foreground">{book.reviewCount} đánh giá</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="ml-2 shrink-0">★ {book.reviewCount}</Badge>
                  </div>
              )) : <EmptyText />}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShoppingCart className="h-5 w-5" />
              Đơn hàng gần đây
            </CardTitle>
            <CardDescription>10 đơn hàng mới nhất</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.recentOrders.length ? data.recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors">
                  <div className="flex-1">
                    <p className="text-sm font-medium">Đơn #{order.id}</p>
                    <p className="text-xs text-muted-foreground">
                      {order.itemCount} sản phẩm • {formatShortDate(order.createdAt || '')}
                    </p>
                  </div>
                  <div className="text-right ml-2 space-y-1">
                    <Badge variant={getOrderStatusVariant(order.status)}>
                      {getOrderStatusText(order.status)}
                    </Badge>
                    <p className="text-xs font-medium">{formatCurrency(order.totalAmount)}</p>
                  </div>
                </div>
              )) : <EmptyText />}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-5 w-5" />
              Hoạt động gần đây
            </CardTitle>
            <CardDescription>Sự kiện hệ thống</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.recentActivities.length ? data.recentActivities.map((activity) => (
                <div
                  key={`${activity.type}-${activity.id}`}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="mt-0.5 shrink-0">
                    {activity.type === 'order'  && <ShoppingCart className="h-4 w-4 text-blue-500" />}
                    {activity.type === 'review' && <MessageSquare className="h-4 w-4 text-pink-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.label}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">{activity.detail}</p>
                  </div>
                  {activity.at && (
                    <span className="text-xs text-muted-foreground shrink-0">
                      {formatShortDate(activity.at)}
                    </span>
                  )}
                </div>
              )) : <EmptyText />}
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
  lightColor: string;
  trend?: string;
  sub?: string;
}

function StatCard({ label, value, icon: Icon, color, lightColor, trend, sub }: StatCardProps) {
  return (
    <Card className="border-0 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-3">{label}</p>
            <p className="text-2xl font-bold mb-2">{value}</p>
            {sub   && <p className="text-xs text-muted-foreground">{sub}</p>}
            {trend && (
              <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 mt-2">
                <ArrowUpRight className="h-3 w-3" />
                <span>{trend}</span>
              </div>
            )}
          </div>
          <div className={`rounded-lg p-3 ${lightColor}`}>
            <Icon className={`h-6 w-6 bg-linear-to-br ${color} bg-clip-text text-transparent`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyChart() {
  return (
    <div className="flex items-center justify-center h-65 text-muted-foreground">
      <p className="text-sm">Chưa có dữ liệu</p>
    </div>
  );
}

function EmptyText() {
  return <p className="text-sm text-muted-foreground text-center py-8">Chưa có dữ liệu</p>;
}