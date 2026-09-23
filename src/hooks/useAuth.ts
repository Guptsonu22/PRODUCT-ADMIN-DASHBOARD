'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authUtils } from '@/lib/auth';
import type { LoginResponse } from '@/types/auth';

// Single place for auth state. UI never touches localStorage directly.
export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<LoginResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setUser(authUtils.getUser());
    setIsLoading(false);
  }, []);

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
