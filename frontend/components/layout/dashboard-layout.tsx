'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, Sun, Moon, ChevronDown, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { DashboardSidebar, type NavItem } from '@/components/layout/dashboard-sidebar';
import { useAuthStore } from '@/store/auth-store';
import { useTheme } from '@/components/providers/theme-provider';

interface DashboardLayoutProps {
  children: React.ReactNode;
  navigation: NavItem[];
  logo: {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
  };
  requiredRole: 'admin' | 'super_admin';
  pageTitle?: string;
}

export function DashboardLayout({
  children,
  navigation,
  logo,
  requiredRole,
  pageTitle,
}: DashboardLayoutProps) {
  const router = useRouter();
  const { user, isAuthenticated, isHydrated, logout } = useAuthStore();
  const { theme, setTheme } = useTheme();

  // Show nothing while hydrating to prevent layout flash
  if (!isHydrated) {
    return null;
  }

  // Double-check auth is correct (should be handled by AuthProvider)
  // but this ensures the layout is never rendered for wrong roles
  if (!isAuthenticated || user?.role !== requiredRole) {
    return null;
  }

  const handleLogout = () => {
    localStorage.removeItem('bookstore-token');
    logout();
    router.push('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-muted/30">
      {/* Desktop Sidebar - Fixed Height */}
      <aside className="hidden w-64 border-r bg-card lg:flex lg:flex-col lg:max-h-screen lg:overflow-y-auto">
        <DashboardSidebar navigation={navigation} logo={logo} />
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-auto">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
          <div className="flex h-16 items-center justify-between px-4 md:px-6">
            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <SheetHeader className="sr-only">
                  <SheetTitle>Menu điều hướng</SheetTitle>
                </SheetHeader>
                <DashboardSidebar navigation={navigation} logo={logo} />
              </SheetContent>
            </Sheet>

            {/* Page Title */}
            {pageTitle && (
              <div className="hidden md:block">
                <h1 className="text-lg font-semibold text-foreground">{pageTitle}</h1>
              </div>
            )}

            {/* Right Actions */}
            <div className="ml-auto flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                title="Chế độ sáng/tối"
              >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>

              <Separator orientation="vertical" className="h-6" />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2">
                    <div className="flex flex-col items-end gap-0.5">
                      <span className="text-sm font-medium">{user.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {requiredRole === 'super_admin' ? 'Super Admin' : 'Quản lý viên'}
                      </span>
                    </div>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem disabled>
                    <span className="text-xs text-muted-foreground">{user.email}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-destructive focus:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 md:p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
