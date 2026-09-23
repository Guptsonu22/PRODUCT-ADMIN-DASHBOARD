'use client';

// Presentational only: no router here. The parent page owns the URL
// (single source of truth) and passes values + callbacks down.
interface ProductFiltersProps {
  categories: string[];
  searchValue: string;
  category: string;
  sort: string;
  pageSize: number;
  isSearchActive: boolean;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onSortChange: (value: string) => void;
  onPageSizeChange: (value: number) => void;
}

export function ProductFilters({
  categories,
  searchValue,
  category,
  sort,
  pageSize,
  onSearchChange,
  onCategoryChange,
  onSortChange,
  onPageSizeChange,
  isSearchActive,
}: ProductFiltersProps) {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onCategoryChange(e.target.value);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onSortChange(e.target.value);
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onPageSizeChange(parseInt(e.target.value, 10));
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
          value={searchValue}
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
          value={category}
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
          value={sort}
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
          value={pageSize}
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