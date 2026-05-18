'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { getRedirectPathByRole } from '@/lib/auth-utils';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, user, isHydrated } = useAuthStore();

  useEffect(() => {
    // Only check after auth is hydrated
    if (!isHydrated) return;

    // If user is already authenticated, redirect them to their appropriate dashboard
    if (isAuthenticated && user) {
      router.replace(getRedirectPathByRole(user));
    }
  }, [isHydrated, isAuthenticated, user, router]);

  // Show auth pages during hydration or if not authenticated
  return <>{children}</>;
}
