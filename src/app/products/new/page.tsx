'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { productService } from '@/services/product.service';
import { ProductForm } from '@/components/products/ProductForm';
import { useProductMutations } from '@/context/ProductMutationContext';
import type { Product, ProductFormData } from '@/types/product';

// Self-contained placeholder so locally added products always render an image.
const PLACEHOLDER_IMAGE =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="400" height="400" fill="#e5e7eb"/><text x="200" y="210" font-size="24" text-anchor="middle" fill="#9ca3af">No image</text></svg>'
  );

// POST /products/add is simulated: the server answers but never persists,
// so the created product is also stored in the local mutation overlay.
export default function NewProductPage() {
  const router = useRouter();
  const { addLocalProduct, setNotice } = useProductMutations();

  const [categories, setCategories] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    let cancelled = false;
    productService
      .getCategories()
      .then((data) => {
        if (!cancelled) setCategories(data);
      })
      .catch(() => {
        if (!cancelled) setCategories([]); // form still works via free-text category
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (data: ProductFormData) => {
    if (isSubmitting) return; // one request even on rapid Save clicks
    setIsSubmitting(true);
    setServerError('');
    try {
      await productService.addProduct(data);
      // Local ID avoids colliding with DummyJSON's fixed simulated IDs.
      const now = new Date().toISOString();
      const local: Product = {
        id: Date.now(),
        title: data.title,
        description: data.description,
        category: data.category,
        price: data.price,
        discountPercentage: 0,
        rating: data.rating ?? 0,
        stock: data.stock,
        tags: [],
        sku: `LOCAL-${Date.now()}`,
        weight: 0,
        dimensions: { width: 0, height: 0, depth: 0 },
        warrantyInformation: '',
        shippingInformation: '',
        availabilityStatus: data.stock > 0 ? 'In Stock' : 'Out of Stock',
        reviews: [],
        returnPolicy: '',
        minimumOrderQuantity: 1,
        meta: { createdAt: now, updatedAt: now, barcode: '', qrCode: '' },
        images: [PLACEHOLDER_IMAGE],
        thumbnail: PLACEHOLDER_IMAGE,
      };
      addLocalProduct(local);
      setNotice(`"${local.title}" added.`);
      router.push('/products');
      router.refresh();
    } catch {
      setServerError('Unable to create product. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Add Product</h1>
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-5">
        <ProductForm
          categories={categories}
          submitLabel="Save Product"
          isSubmitting={isSubmitting}
          serverError={serverError}
          onSubmit={handleSubmit}
          onCancel={() => router.push('/products')}
        />
      </div>
    </div>
  );
}
