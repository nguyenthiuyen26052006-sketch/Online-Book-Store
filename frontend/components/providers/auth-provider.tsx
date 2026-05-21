'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { authService } from '@/services/auth.service';
import type { UserRole } from '@/lib/auth-utils';

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * AuthProvider initializes authentication state on app startup.
 * This ensures that:
 * 1. Auth state is properly hydrated from localStorage
 * 2. Route protection runs AFTER auth state is loaded
 * 3. Prevents unnecessary redirects on page refresh
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, token, isAuthenticated, setAuth, logout } = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Initialize auth state from localStorage on first mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get token from localStorage (Zustand persist middleware should handle this)
        const storedToken = localStorage.getItem('bookstore-token');

        if (storedToken && !isAuthenticated) {
          // If we have a token but auth store isn't loaded yet, try to fetch user profile
          try {
            const userProfile = await authService.getProfile(storedToken);
            setAuth({ ...userProfile, id: String(userProfile.id) }, storedToken);
          } catch (error) {
            // Token is invalid, clear it
            localStorage.removeItem('bookstore-token');
            logout();
          }
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        logout();
      } finally {
        setIsInitialized(true);
        setIsInitializing(false);
      }
    };

    initializeAuth();
  }, []);

  // Route protection - only run after auth is initialized
  useEffect(() => {
    if (!isInitialized) return;

    // Protect admin and super-admin routes
    if (pathname?.startsWith('/admin')) {
      if (!isAuthenticated || user?.role !== 'admin') {
        if (isAuthenticated && user?.role === 'super_admin') {
          router.replace('/super-admin');
        } else {
          router.replace('/login?redirect=/admin');
        }
      }
    } else if (pathname?.startsWith('/super-admin')) {
      if (!isAuthenticated || user?.role !== 'super_admin') {
        if (isAuthenticated && user?.role === 'admin') {
          router.replace('/admin');
        } else {
          router.replace('/login?redirect=/super-admin');
        }
      }
    }
    // Root path "/" - redirect non-users to their appropriate dashboard
    else if (pathname === '/') {
      if (isAuthenticated) {
        if (user?.role === 'admin') {
          router.replace('/admin');
        } else if (user?.role === 'super_admin') {
          router.replace('/super-admin');
        }
        // Regular users stay on "/"
      }
    }
  }, [isInitialized, isAuthenticated, user, pathname, router]);

  // Show nothing while initializing to prevent layout shift
  if (isInitializing) {
    return <></>;
  }

  return <>{children}</>;
}
