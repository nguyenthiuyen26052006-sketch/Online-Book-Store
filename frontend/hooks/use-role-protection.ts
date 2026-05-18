'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import type { UserRole } from '@/lib/auth-utils';

/**
 * Hook to protect routes by role
 * Redirects to login if not authenticated, or to appropriate dashboard if not authorized
 * Only protects after auth state is hydrated
 */
export function useRoleProtection(requiredRole: UserRole | UserRole[]) {
  const router = useRouter();
  const { user, isAuthenticated, isHydrated } = useAuthStore();

  useEffect(() => {
    // Don't run protection logic until auth is hydrated
    if (!isHydrated) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!roles.includes(user?.role as UserRole)) {
      // Redirect to appropriate dashboard based on actual role
      const role = user?.role;
      if (role === 'super_admin') {
        router.push('/super-admin');
      } else if (role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    }
  }, [isHydrated, isAuthenticated, user, requiredRole, router]);

  return {
    isAuthorized:
      isHydrated &&
      isAuthenticated &&
      (Array.isArray(requiredRole)
        ? requiredRole.includes(user?.role as UserRole)
        : requiredRole === user?.role),
    user,
    isAuthenticated,
    isHydrated,
  };
}

/**
 * Hook to check if current user has a specific role
 * Only returns user data after hydration
 */
export function useUserRole() {
  const { user, isHydrated } = useAuthStore();

  return {
    role: user?.role,
    isAdmin: user?.role === 'admin',
    isSuperAdmin: user?.role === 'super_admin',
    isUser: user?.role === 'user',
    user,
    isHydrated,
  };
}

