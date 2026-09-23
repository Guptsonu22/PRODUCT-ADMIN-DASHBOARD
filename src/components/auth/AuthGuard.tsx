'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authUtils } from '@/lib/auth';
import { Loader } from '@/components/common/Loader';

// Client-side guard for protected routes. URL state stays the source
// of truth for filters; this only handles auth redirects.
// Auth is read during render (localStorage, client-guarded); the effect
// only performs the redirect side effect.
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isAuthenticated = authUtils.isAuthenticated();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return <>{children}</>;
}
