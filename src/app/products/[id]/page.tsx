'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { productService } from '@/services/product.service';
import { ProductImageGallery } from '@/components/products/ProductImageGallery';
import { ProductReviews } from '@/components/products/ProductReviews';
import { DeleteConfirmModal } from '@/components/products/DeleteConfirmModal';
import { ErrorState } from '@/components/common/ErrorState';
import { useProductMutations } from '@/context/ProductMutationContext';
import type { Product } from '@/types/product';

type Status = 'loading' | 'ready' | 'error' | 'not-found';

// Page owns route params + fetch state. API lives in productService only.
// Auth is already handled by the products layout guard. Local mutations
// overlay the server data: deleted IDs show not-found, added/updated
// versions render without a server round-trip.
export default function ProductDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const rawId = Array.isArray(params.id) ? params.id[0] : params.id;

  // Validate before fetching: no API call for abc, -1, 0, 1.5, ...
  const numericId = Number(rawId);
  const isValidId = Number.isInteger(numericId) && numericId >= 1;

  const { getLocalProduct, isLocalOnly, isDeleted, deleteLocalProduct, setNotice } = useProductMutations();
  const wasDeleted = isValidId && isDeleted(numericId);
  const localProduct = !wasDeleted && isValidId ? getLocalProduct(numericId) : undefined;
  const hasLocal = !!localProduct;

  const [status, setStatus] = useState<Status>(() => {
    if (!isValidId || wasDeleted) return 'not-found';
    return localProduct ? 'ready' : 'loading';
  });
  const [product, setProduct] = useState<Product | null>(() => localProduct ?? null);
  const [retryKey, setRetryKey] = useState(0);

  const [showDelete, setShowDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    // Invalid, deleted, or already-local products never reach the API.
    if (!isValidId || wasDeleted || hasLocal) return;
    const controller = new AbortController();
    let ignored = false;

    const load = async () => {
      setStatus('loading');
      try {
        const data = await productService.getProductById(numericId, controller.signal);
        if (!ignored) {
          setProduct(data);
          setStatus('ready');
        }
      } catch (err) {
        if (controller.signal.aborted) return; // cancellation is not an error
        if (axios.isAxiosError(err) && (err.code === 'ERR_CANCELED' || err.name === 'CanceledError')) return;
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          if (!ignored) setStatus('not-found');
          return;
        }
        if (!ignored) setStatus('error');
      }
    };

    load();
    return () => {
      ignored = true;
      controller.abort();
    };
  }, [isValidId, numericId, retryKey, wasDeleted, hasLocal]);

  const confirmDelete = async () => {
    if (!product || isDeleting) return; // block double-click deletes
    setIsDeleting(true);
    setActionError('');
    try {
      if (!isLocalOnly(product.id)) {
        await productService.deleteProduct(product.id);
      }
      // Local-only rows skip the API call (no server row exists).
      // Either way the overlay hides the product from list + details.
      deleteLocalProduct(product.id);
      setNotice(`"${product.title}" deleted.`);
      router.push('/products');
      router.refresh();
    } catch {
      setActionError('Unable to delete product. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (status === 'loading') {
    return (
      <div>
        <div className="h-9 w-36 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mb-4" />
        <div className="grid gap-6 md:grid-cols-2">
          <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          <div className="space-y-3">
            <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 animate-pulse" />
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (status === 'not-found') {
    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-6 py-12 text-center">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Product Not Found</h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          The product you&apos;re looking for doesn&apos;t exist or may have been removed.
        </p>
        <button
          type="button"
          onClick={() => router.push('/products')}
          className="mt-5 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Back to Products
        </button>
      </div>
    );
  }

  if (status === 'error' || !product) {
    return (
      <div>
        <button
          type="button"
          onClick={() => router.push('/products')}
          className="mb-4 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
        >
          ← Back to Products
        </button>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
          <ErrorState message="Unable to load this product." onRetry={() => setRetryKey((k) => k + 1)} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => router.push('/products')}
        className="mb-4 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
      >
        ← Back to Products
      </button>

      {actionError && (
        <p role="alert" className="mb-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
          {actionError}
        </p>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <ProductImageGallery images={product.images?.length ? product.images : [product.thumbnail]} title={product.title} />

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-5">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
            {product.category}
          </span>
          <h1 className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">{product.title}</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{product.description}</p>

          <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Price</p>
              <p className="font-semibold text-gray-900 dark:text-white">${product.price.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Rating</p>
              <p className="font-semibold text-gray-900 dark:text-white">{product.rating.toFixed(1)} / 5</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Stock</p>
              <p className={`font-semibold ${product.stock > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {product.stock > 0 ? product.stock : 'Out of stock'}
              </p>
            </div>
          </div>

          <dl className="mt-4 space-y-1 text-sm">
            {product.brand && (
              <div className="flex gap-2">
                <dt className="text-gray-500 dark:text-gray-400">Brand:</dt>
                <dd className="text-gray-900 dark:text-white">{product.brand}</dd>
              </div>
            )}
            {product.sku && (
              <div className="flex gap-2">
                <dt className="text-gray-500 dark:text-gray-400">SKU:</dt>
                <dd className="text-gray-900 dark:text-white">{product.sku}</dd>
              </div>
            )}
          </dl>

          <div className="mt-5 flex gap-2">
            <button
              type="button"
              onClick={() => router.push(`/products/${product.id}/edit`)}
              className="flex-1 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Edit Product
            </button>
            <button
              type="button"
              onClick={() => setShowDelete(true)}
              className="flex-1 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Delete Product
            </button>
          </div>
        </div>
      </div>

      <section className="mt-6" aria-labelledby="reviews-heading">
        <h2 id="reviews-heading" className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
          Reviews ({product.reviews?.length ?? 0})
        </h2>
        <ProductReviews reviews={product.reviews ?? []} />
      </section>

      <DeleteConfirmModal
        isOpen={showDelete}
        productTitle={product.title}
        isLoading={isDeleting}
        onClose={() => {
          if (!isDeleting) setShowDelete(false);
        }}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
