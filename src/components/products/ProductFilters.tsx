'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import type { SortField, SortOrder } from '@/types/product';

interface ProductFiltersProps {
  categories: string[];
  currentCategory: string;
  currentSearch: string;
  currentSort: string;
  currentPageSize: number;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onSortChange: (value: string) => void;
  onPageSizeChange: (value: number) => void;
  isSearchActive: boolean;
}

export function ProductFilters({
  categories,
  currentCategory,
  currentSearch,
  currentSort,
  currentPageSize,
  onSearchChange,
  onCategoryChange,
  onSortChange,
  onPageSizeChange,
  isSearchActive,
}: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateUrl = (newParams: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === undefined || value === '' || value === 0) {
        params.delete(key);
      } else {
        params.set(key, value.toString());
      }
    });
    router.push(`/products?${params.toString()}`);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onSearchChange(value);
    updateUrl({ search: value || undefined, page: 1 });
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onCategoryChange(value);
    updateUrl({ category: value || undefined, page: 1 });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onSortChange(value);
    updateUrl({ sort: value || undefined, page: 1 });
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = parseInt(e.target.value, 10);
    onPageSizeChange(value);
    updateUrl({ pageSize: value, page: 1 });
  };

  const sortOptions: { value: string; label: string }[] = [
    { value: '', label: 'Default' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'rating-asc', label: 'Rating: Low to High' },
    { value: 'rating-desc', label: 'Rating: High to Low' },
    { value: 'title-asc', label: 'Title: A-Z' },
    { value: 'title-desc', label: 'Title: Z-A' },
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex-1 min-w-[200px]">
        <label htmlFor="search" className="sr-only">Search products</label>
        <input
          type="text"
          id="search"
          value={currentSearch}
          onChange={handleSearchChange}
          placeholder="Search products..."
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          aria-label="Search products"
        />
      </div>

      <div className="flex-1 min-w-[180px]">
        <label htmlFor="category" className="sr-only">Filter by category</label>
        <select
          id="category"
          value={currentCategory}
          onChange={handleCategoryChange}
          disabled={isSearchActive}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Filter by category"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>
        {isSearchActive && (
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Category filtering disabled during search</p>
        )}
      </div>

      <div className="min-w-[180px]">
        <label htmlFor="sort" className="sr-only">Sort by</label>
        <select
          id="sort"
          value={currentSort}
          onChange={handleSortChange}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          aria-label="Sort products"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="min-w-[140px]">
        <label htmlFor="pageSize" className="sr-only">Items per page</label>
        <select
          id="pageSize"
          value={currentPageSize}
          onChange={handlePageSizeChange}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          aria-label="Items per page"
        >
          <option value={10}>10 per page</option>
          <option value={20}>20 per page</option>
          <option value={50}>50 per page</option>
        </select>
      </div>
    </div>
  );
}