'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authUtils } from '@/lib/auth';
import { useMounted } from '@/hooks/useMounted';
import { Loader } from '@/components/common/Loader';

// Client-side guard for protected routes. URL state stays the source
// of truth for filters; this only handles auth redirects.
// localStorage doesn't exist on the server, so auth is only read after
// mount — otherwise server (logged out) and client (logged in) render
// different trees and React throws a hydration mismatch.
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const mounted = useMounted();
  const isAuthenticated = mounted && authUtils.isAuthenticated();

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.replace('/login');
    }
  }, [mounted, isAuthenticated, router]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return <>{children}</>;
}
