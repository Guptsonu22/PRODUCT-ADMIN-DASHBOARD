'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { productService } from '@/services/product.service';
import { ProductForm } from '@/components/products/ProductForm';
import { ErrorState } from '@/components/common/ErrorState';
import { useProductMutations } from '@/context/ProductMutationContext';
import type { Product, ProductFormData } from '@/types/product';

type Status = 'loading' | 'ready' | 'error' | 'not-found';

// Reuses ProductForm. Prefers the local version when one exists (it is
// fresher than the server), otherwise fetches the server product first.
export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const rawId = Array.isArray(params.id) ? params.id[0] : params.id;

  const numericId = Number(rawId);
  const isValidId = Number.isInteger(numericId) && numericId >= 1;

  const { getLocalProduct, isLocalOnly, isDeleted, updateLocalProduct, setNotice } = useProductMutations();
  const localProduct = isValidId && !isDeleted(numericId) ? getLocalProduct(numericId) : undefined;
  const hasLocal = !!localProduct;

  const [status, setStatus] = useState<Status>(() => {
    if (!isValidId || isDeleted(numericId)) return 'not-found';
    return localProduct ? 'ready' : 'loading';
  });
  const [product, setProduct] = useState<Product | null>(() => localProduct ?? null);
  const [retryKey, setRetryKey] = useState(0);

  const [categories, setCategories] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    // Invalid, deleted, or already-local products never reach the API.
    if (!isValidId || isDeleted(numericId) || hasLocal) return;
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
        if (controller.signal.aborted) return;
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
  }, [isValidId, numericId, retryKey, hasLocal, isDeleted]);

  useEffect(() => {
    let cancelled = false;
    productService
      .getCategories()
      .then((data) => {
        if (!cancelled) setCategories(data);
      })
      .catch(() => {
        if (!cancelled) setCategories([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (data: ProductFormData) => {
    if (!product || isSubmitting) return; // one request even on rapid Save clicks
    setIsSubmitting(true);
    setServerError('');
    const merged: Product = {
      ...product,
      title: data.title,
      description: data.description,
      price: data.price,
      category: data.category,
      stock: data.stock,
      rating: data.rating ?? product.rating,
      availabilityStatus: data.stock > 0 ? 'In Stock' : 'Out of Stock',
    };
    try {
      if (!isLocalOnly(product.id)) {
        // Server products go through the simulated PUT API first...
        await productService.updateProduct(product.id, data);
      }
      // ...but the UI always reflects the local version, since DummyJSON
      // never persists the change. Local-only products skip the API call
      // entirely (no server row exists for them).
      updateLocalProduct(merged);
      setNotice(`"${merged.title}" updated.`);
      router.push(`/products/${product.id}`);
      router.refresh();
    } catch {
      setServerError('Unable to update product. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Edit Product</h1>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-5 space-y-4 animate-pulse">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (status === 'not-found' || !product) {
    if (status === 'error') {
      return (
        <div className="mx-auto max-w-2xl">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
            <ErrorState message="Unable to load this product." onRetry={() => setRetryKey((k) => k + 1)} />
          </div>
        </div>
      );
    }
    return (
      <div className="mx-auto max-w-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-6 py-12 text-center">
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

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Edit Product</h1>
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-5">
        <ProductForm
          initialValues={{
            title: product.title,
            description: product.description,
            price: product.price,
            category: product.category,
            stock: product.stock,
            rating: product.rating,
          }}
          categories={categories}
          submitLabel="Save Changes"
          isSubmitting={isSubmitting}
          serverError={serverError}
          onSubmit={handleSubmit}
          onCancel={() => router.push(`/products/${product.id}`)}
        />
      </div>
    </div>
  );
}
