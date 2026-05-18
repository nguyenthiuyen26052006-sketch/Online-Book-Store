'use client';

import { usePathname } from 'next/navigation';
import { LayoutDashboard, BookText, ShoppingCart, MessageSquare } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { RoleLayoutWrapper } from '@/components/providers/role-layout-wrapper';

const navigation = [
  {
    name: 'Bảng điều khiển',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    name: 'Quản lý sách',
    href: '/admin/books',
    icon: BookText,
  },
  {
    name: 'Quản lý đơn hàng',
    href: '/admin/orders',
    icon: ShoppingCart,
  },
  {
    name: 'Đánh giá',
    href: '/admin/reviews',
    icon: MessageSquare,
  },
];

const getPageTitle = (pathname: string): string => {
  const item = navigation.find((nav) => pathname === nav.href);
  return item?.name || 'Bảng điều khiển';
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);

  return (
    <RoleLayoutWrapper requiredRole="admin">
      <DashboardLayout
        navigation={navigation}
        logo={{
          icon: BookText,
          title: 'Nhà Sách',
        }}
        requiredRole="admin"
        pageTitle={pageTitle}
      >
        {children}
      </DashboardLayout>
    </RoleLayoutWrapper>
  );
}
