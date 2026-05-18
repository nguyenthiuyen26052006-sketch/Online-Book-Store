import type { UserProfile } from '@/types';

export type UserRole = 'user' | 'admin' | 'super_admin';

/**
 * Get the appropriate dashboard/home path based on user role
 */
export function getRedirectPathByRole(user: UserProfile | null): string {
  if (!user) return '/';

  switch (user.role) {
    case 'super_admin':
      return '/super-admin';
    case 'admin':
      return '/admin';
    case 'user':
    default:
      return '/';
  }
}

/**
 * Check if user has required role
 */
export function hasRole(user: UserProfile | null, requiredRole: UserRole): boolean {
  return user?.role === requiredRole;
}

/**
 * Check if user has any of the required roles
 */
export function hasAnyRole(user: UserProfile | null, requiredRoles: UserRole[]): boolean {
  return user ? requiredRoles.includes(user.role) : false;
}

/**
 * Check if user is an admin (admin or super_admin)
 */
export function isAdmin(user: UserProfile | null): boolean {
  return hasAnyRole(user, ['admin', 'super_admin']);
}

/**
 * Check if user is a super admin
 */
export function isSuperAdmin(user: UserProfile | null): boolean {
  return hasRole(user, 'super_admin');
}

/**
 * Check if user is a regular user
 */
export function isRegularUser(user: UserProfile | null): boolean {
  return hasRole(user, 'user');
}

/**
 * Get appropriate redirect path for different role access attempts
 * Used by AuthProvider to handle cross-role navigation
 */
export function getRedirectForRoleMismatch(
  currentRole: UserRole | undefined,
  attemptedPath: string
): string | null {
  if (!currentRole) return '/login';

  const isAdminPath = attemptedPath.startsWith('/admin');
  const isSuperAdminPath = attemptedPath.startsWith('/super-admin');

  // Redirect user trying to access admin/super-admin
  if ((isAdminPath || isSuperAdminPath) && currentRole === 'user') {
    return '/';
  }

  // Redirect admin trying to access super-admin
  if (isSuperAdminPath && currentRole === 'admin') {
    return '/admin';
  }

  // Redirect super-admin trying to access regular admin
  if (isAdminPath && currentRole === 'super_admin') {
    return '/super-admin';
  }

  // Redirect admin/super-admin trying to access user storefront
  if (attemptedPath === '/' && (currentRole === 'admin' || currentRole === 'super_admin')) {
    return getRedirectPathByRole({ role: currentRole } as UserProfile);
  }

  return null;
}

/**
 * Check if a path should require authentication
 */
export function requiresAuthentication(pathname: string): boolean {
  // These paths require authentication
  const protectedPaths = ['/admin', '/super-admin', '/profile', '/cart', '/checkout'];
  return protectedPaths.some((path) => pathname.startsWith(path));
}

/**
 * Check if a path is auth-only (login, register)
 */
export function isAuthOnlyPath(pathname: string): boolean {
  return pathname.startsWith('/login') || pathname.startsWith('/register');
}

