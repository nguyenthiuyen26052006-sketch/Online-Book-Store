'use client';

import { usePathname } from 'next/navigation';
import { Shield, LayoutDashboard, BookText, ShoppingCart, Users } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { RoleLayoutWrapper } from '@/components/providers/role-layout-wrapper';

const navigation = [
  {
    name: 'Bảng điều khiển',
    href: '/super-admin',
    icon: LayoutDashboard,
  },
  {
    name: 'Quản lý danh mục',
    href: '/super-admin/categories',
    icon: BookText,
  },
  {
    name: 'Quản lý người dùng',
    href: '/super-admin/users',
    icon: Users,
  },
  {
    name: 'Quản lý đơn hàng',
    href: '/super-admin/orders',
    icon: ShoppingCart,
  },
];

const getPageTitle = (pathname: string): string => {
  const item = navigation.find((nav) => pathname === nav.href);
  return item?.name || 'Bảng điều khiển';
};

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);

  return (
    <RoleLayoutWrapper requiredRole="super_admin">
      <DashboardLayout
        navigation={navigation}
        logo={{
          icon: Shield,
          title: 'Quản Trị Hệ Thống',
        }}
        requiredRole="super_admin"
        pageTitle={pageTitle}
      >
        {children}
      </DashboardLayout>
    </RoleLayoutWrapper>
  );
}
