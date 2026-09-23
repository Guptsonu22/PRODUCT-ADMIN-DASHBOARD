'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authUtils } from '@/lib/auth';
import type { LoginResponse } from '@/types/auth';

// Single place for auth state. UI never touches localStorage directly.
// Lazy initializer reads localStorage once (client-only, guarded inside
// authUtils), so no effect is needed.
export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<LoginResponse | null>(() => authUtils.getUser());
  const [isLoading] = useState(false);

  const logout = useCallback(() => {
    authUtils.clearAuth();
    setUser(null);
    router.push('/login');
    router.refresh();
  }, [router]);

  return {
    user,
    isLoading,
    isAuthenticated: !!user && !!authUtils.getToken(),
    logout,
  };
}
