'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { productService } from '@/services/product.service';
import { useDebounce } from '@/hooks/useDebounce';
import { useProductMutations } from '@/context/ProductMutationContext';
import { ProductFilters } from '@/components/products/ProductFilters';
import { ProductTable } from '@/components/products/ProductTable';
import { ProductCard } from '@/components/products/ProductCard';
import { Pagination } from '@/components/products/Pagination';
import { ProductSkeleton } from '@/components/products/ProductSkeleton';
import { DeleteConfirmModal } from '@/components/products/DeleteConfirmModal';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { Loader } from '@/components/common/Loader';
import type { Product } from '@/types/product';

const PAGE_SIZES = [10, 20, 50];
const DEFAULT_PAGE_SIZE = 20;
const ALLOWED_SORTS = ['', 'price-asc', 'price-desc', 'rating-asc', 'rating-desc', 'title-asc', 'title-desc'];

// Pure helpers: easy to explain in an interview, URL stays the source of truth.
function parsePage(raw: string | null): number {
  const n = parseInt(raw ?? '', 10);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
}

function parsePageSize(raw: string | null): number {
  const n = parseInt(raw ?? '', 10);
  return PAGE_SIZES.includes(n) ? n : DEFAULT_PAGE_SIZE;
}

function parseSort(raw: string | null): string {
  return raw && ALLOWED_SORTS.includes(raw) ? raw : '';
}

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL is the single source of truth. Everything is derived from it.
  const urlSearch = searchParams.get('search') ?? '';
  const urlCategory = searchParams.get('category') ?? '';
  const sort = parseSort(searchParams.get('sort'));
  const page = parsePage(searchParams.get('page'));
  const pageSize = parsePageSize(searchParams.get('pageSize'));
  const isSearchActive = urlSearch.trim().length > 0;

  // Immediate input for typing feel; URL + API update only after debounce.
  // Derived-state pattern: if the URL changed externally (back/forward),
  // sync the input during render instead of in an effect.
  const [searchInput, setSearchInput] = useState(urlSearch);
  const [prevUrlSearch, setPrevUrlSearch] = useState(urlSearch);
  if (prevUrlSearch !== urlSearch) {
    setPrevUrlSearch(urlSearch);
    setSearchInput(urlSearch);
  }
  const debouncedSearchInput = useDebounce(searchInput, 450);

  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryKey, setRetryKey] = useState(0);

  const [categories, setCategories] = useState<string[]>([]);
  const [catError, setCatError] = useState('');
  const [catRetryKey, setCatRetryKey] = useState(0);

  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionError, setActionError] = useState('');

  // Local mutation overlay (in-memory; DummyJSON never persists mutations).
  const {
    addedProducts,
    updatedProducts,
    deletedProductIds,
    notice,
    deleteLocalProduct,
    isLocalOnly,
    setNotice,
  } = useProductMutations();

  // Merge server rows with local state: drop deleted, replace updated.
  // Added products appear on top of page 1 of the default view only, since
  // the server owns sorting/searching/filtering and faking local rows into
  // those result sets would be misleading (see README).
  const isDefaultView = !isSearchActive && !urlCategory && !sort;
  const visibleProducts = useMemo(() => {
    const merged = products
      .filter((p) => !deletedProductIds.includes(p.id))
      .map((p) => updatedProducts[p.id] ?? p);
    if (isDefaultView && page === 1 && addedProducts.length > 0) {
      return [...addedProducts, ...merged];
    }
    return merged;
  }, [products, deletedProductIds, updatedProducts, addedProducts, isDefaultView, page]);

  const displayTotal =
    total - (isDefaultView ? deletedProductIds.length : 0) + (isDefaultView && page === 1 ? addedProducts.length : 0);
  const totalPages = Math.ceil(Math.max(displayTotal, 0) / pageSize);

  const updateUrl = useCallback(
    (overrides: Record<string, string | number | undefined>, mode: 'push' | 'replace' = 'push') => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(overrides)) {
        if (value === undefined || value === '') {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      }
      const qs = params.toString();
      const url = qs ? `/products?${qs}` : '/products';
      if (mode === 'replace') {
        router.replace(url);
      } else {
        router.push(url);
      }
    },
    [router, searchParams]
  );

  // Debounced: only push to URL after the user pauses typing.
  // The fetch effect below listens to urlSearch, so no direct API call here.
  useEffect(() => {
    if (debouncedSearchInput !== urlSearch) {
      updateUrl({ search: debouncedSearchInput || undefined, page: 1 });
    }
  }, [debouncedSearchInput, urlSearch, updateUrl]);

  // Categories load once (through service only).
  useEffect(() => {
    let cancelled = false;
    productService
      .getCategories()
      .then((data) => {
        if (!cancelled) {
          setCategories(data);
          setCatError('');
        }
      })
      .catch(() => {
        if (!cancelled) setCatError('Unable to load categories.');
      });
    return () => {
      cancelled = true;
    };
  }, [catRetryKey]);

  // Main fetch: runs on normalized URL values. AbortController cancels
  // the previous request so a slow old search can never overwrite new results.
  useEffect(() => {
    const controller = new AbortController();
    let ignored = false;

    const load = async () => {
      setIsLoading(true);
      setError('');
      try {
        const q = urlSearch.trim() || undefined;
        const [sortBy, order] = sort ? sort.split('-') : [undefined, undefined];
        const data = await productService.getProducts({
          limit: pageSize,
          skip: (page - 1) * pageSize,
          search: q,
          // Search wins: ignore category while searching (dropdown is disabled).
          category: q ? undefined : urlCategory || undefined,
          sortBy: sortBy || undefined,
          order: (order as 'asc' | 'desc') || undefined,
          signal: controller.signal,
        });
        if (ignored) return;
        const nextTotalPages = Math.ceil(data.total / pageSize);
        if (page > nextTotalPages && nextTotalPages > 0) {
          const params = new URLSearchParams(searchParams.toString());
          params.set('page', String(nextTotalPages));
          router.replace(`/products?${params.toString()}`);
          return;
        }
        setProducts(data.products);
        setTotal(data.total);
      } catch (err) {
        if (controller.signal.aborted) return; // cancellation is not an error
        if (axios.isAxiosError(err) && (err.code === 'ERR_CANCELED' || err.name === 'CanceledError')) return;
        if (!ignored) setError('Unable to load products. Please try again.');
      } finally {
        if (!ignored && !controller.signal.aborted) setIsLoading(false);
      }
    };

    load();
    return () => {
      ignored = true;
      controller.abort();
    };
  }, [page, pageSize, urlSearch, urlCategory, sort, retryKey, router, searchParams]);

  const confirmDelete = async () => {
    if (!deleteTarget || isDeleting) return; // block double-click deletes
    setIsDeleting(true);
    setActionError('');
    try {
      if (!isLocalOnly(deleteTarget.id)) {
        // Server rows go through the simulated DELETE API first...
        await productService.deleteProduct(deleteTarget.id);
      }
      // ...but the UI hides the row via local state either way, since
      // DummyJSON never persists the deletion. Local-only rows skip the
      // API call (no server row exists). Failures keep the row visible.
      deleteLocalProduct(deleteTarget.id);
      setNotice(`"${deleteTarget.title}" deleted.`);
      setDeleteTarget(null);
    } catch {
      setActionError('Unable to delete product. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-4">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Products</h1>
        <button
          type="button"
          onClick={() => router.push('/products/new')}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Add Product
        </button>
      </div>

      {actionError && (
        <p role="alert" className="mb-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
          {actionError}
        </p>
      )}

      {notice && (
        <div className="mb-4 flex items-center justify-between gap-3 text-sm text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg px-3 py-2">
          <span role="status">{notice}</span>
          <button
            type="button"
            onClick={() => setNotice(null)}
            aria-label="Dismiss notification"
            className="px-2 py-0.5 font-medium rounded hover:bg-green-100 dark:hover:bg-green-900/40 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            ✕
          </button>
        </div>
      )}

      {catError && (
        <div className="mb-4 flex items-center justify-between gap-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
          <span>{catError}</span>
          <button
            type="button"
            onClick={() => setCatRetryKey((k) => k + 1)}
            className="px-3 py-1 font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Retry
          </button>
        </div>
      )}

      <ProductFilters
        categories={categories}
        searchValue={searchInput}
        category={urlCategory}
        sort={sort}
        pageSize={pageSize}
        isSearchActive={isSearchActive}
        onSearchChange={setSearchInput}
        onCategoryChange={(v) => updateUrl({ category: v || undefined, page: 1 })}
        onSortChange={(v) => updateUrl({ sort: v || undefined, page: 1 })}
        onPageSizeChange={(v) => updateUrl({ pageSize: v, page: 1 })}
      />

      {isLoading ? (
        <div>
          <div className="hidden md:block bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <table className="min-w-full">
              <tbody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <ProductSkeleton key={i} />
                ))}
              </tbody>
            </table>
          </div>
          <div className="grid gap-4 md:hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductSkeleton key={i} isMobile />
            ))}
          </div>
        </div>
      ) : error ? (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
          <ErrorState message={error} onRetry={() => setRetryKey((k) => k + 1)} />
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
          <EmptyState title="No products found." description="Try changing your search or filters." />
        </div>
      ) : (
        <div>
          <div className="hidden md:block bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <ProductTable
              products={products}
              onView={(p) => router.push(`/products/${p.id}`)}
              onEdit={(p) => router.push(`/products/${p.id}/edit`)}
              onDelete={setDeleteTarget}
            />
          </div>
          <div className="grid gap-4 md:hidden">
            {products.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onView={(item) => router.push(`/products/${item.id}`)}
                onEdit={(item) => router.push(`/products/${item.id}/edit`)}
                onDelete={setDeleteTarget}
              />
            ))}
          </div>
        </div>
      )}

      {!isLoading && !error && total > 0 && (
        <div className="mt-4">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={total}
            pageSize={pageSize}
            onPageChange={(next) => updateUrl({ page: next })}
          />
        </div>
      )}

      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        productTitle={deleteTarget?.title ?? ''}
        isLoading={isDeleting}
        onClose={() => {
          if (!isDeleting) setDeleteTarget(null);
        }}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

// Suspense is required because the page reads URL search params.
export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[40vh] flex items-center justify-center">
          <Loader />
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
