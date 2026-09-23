'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authUtils } from '@/lib/auth';
import { LoginForm } from '@/components/auth/LoginForm';

// If already logged in, go to /products instead of showing login again.
export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    if (authUtils.isAuthenticated()) {
      router.replace('/products');
    }
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-6">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Admin Login</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Use username <code>emilys</code> / password <code>emilyspass</code>
        </p>
        <div className="mt-5">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
