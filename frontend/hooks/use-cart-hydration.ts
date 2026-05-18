'use client';

import { useEffect, useState } from 'react';
import { useCartStore } from '@/store/cart-store';

/**
 * Hook to check if cart store has been hydrated from localStorage
 * Prevents hydration mismatches by ensuring store is ready before rendering
 */
export function useCartHydration(): boolean {
  const [hasHydrated, setHasHydrated] = useState(false);
  const storeHydrated = useCartStore((state) => state._hasHydrated);

  useEffect(() => {
    // Update local state when store hydration changes
    if (storeHydrated) {
      setHasHydrated(true);
    }
  }, [storeHydrated]);

  return hasHydrated;
}
