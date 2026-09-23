'use client';

import { useAuth } from '@/hooks/useAuth';

// Shared header: title + current user + logout. Uses useAuth so
// logout logic lives in one place.
export function Header() {
  const { user, isLoading, logout } = useAuth();

  return (
    <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-base font-semibold text-gray-900 dark:text-white truncate">
            Product Admin Dashboard
          </p>
        </div>
        <div className="flex items-center gap-3">
          {!isLoading && user && (
            <span className="hidden sm:block text-sm text-gray-600 dark:text-gray-300 truncate max-w-[220px]">
              {user.firstName} {user.lastName} ({user.username})
            </span>
          )}
          <button
            type="button"
            onClick={logout}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
