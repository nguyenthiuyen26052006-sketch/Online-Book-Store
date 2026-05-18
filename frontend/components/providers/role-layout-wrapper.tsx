'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';

interface RoleLayoutWrapperProps {
  children: React.ReactNode;
  requiredRole: 'user' | 'admin' | 'super_admin';
}

/**
 * RoleLayoutWrapper ensures that content is only rendered for the appropriate role
 * This is a safety measure against accidental UI leakage
 */
export function RoleLayoutWrapper({
  children,
  requiredRole,
}: RoleLayoutWrapperProps) {
  const router = useRouter();
  const { user, isAuthenticated, isHydrated } = useAuthStore();

  // While hydrating, render nothing to prevent flash
  if (!isHydrated) {
    return null;
  }

  // If not authenticated, let them through to the route handler
  if (!isAuthenticated) {
    return <>{children}</>;
  }

  // If role doesn't match, don't render anything (AuthProvider should redirect)
  if (user?.role !== requiredRole) {
    return null;
  }

  // Role matches, render children
  return <>{children}</>;
}
