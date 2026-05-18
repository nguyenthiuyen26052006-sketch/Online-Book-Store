import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { RoleLayoutWrapper } from '@/components/providers/role-layout-wrapper';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleLayoutWrapper requiredRole="user">
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </RoleLayoutWrapper>
  );
}
