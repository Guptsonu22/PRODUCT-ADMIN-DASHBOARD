'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { Product } from '@/types/product';

// DummyJSON simulates POST/PUT/DELETE but never persists them, so the app
// keeps a small in-memory overlay for the current session:
// - addedProducts: full products created locally (local-only IDs)
// - updatedProducts: server product ID -> locally edited version
// - deletedProductIds: server product IDs hidden from the UI
// A refresh clears this state (documented in README). No state library.
interface ProductMutationState {
  addedProducts: Product[];
  updatedProducts: Record<number, Product>;
  deletedProductIds: number[];
  notice: string | null;
  addLocalProduct: (product: Product) => void;
  updateLocalProduct: (product: Product) => void;
  deleteLocalProduct: (id: number) => void;
  getLocalProduct: (id: number) => Product | undefined;
  isLocalOnly: (id: number) => boolean;
  isDeleted: (id: number) => boolean;
  setNotice: (message: string | null) => void;
}

const ProductMutationContext = createContext<ProductMutationState | null>(null);

export function ProductMutationProvider({ children }: { children: React.ReactNode }) {
  const [addedProducts, setAddedProducts] = useState<Product[]>([]);
  const [updatedProducts, setUpdatedProducts] = useState<Record<number, Product>>({});
  const [deletedProductIds, setDeletedProductIds] = useState<number[]>([]);
  const [notice, setNotice] = useState<string | null>(null);

  const addLocalProduct = useCallback((product: Product) => {
    setAddedProducts((prev) => [product, ...prev]);
  }, []);

  const updateLocalProduct = useCallback(
    (product: Product) => {
      // Local-only products live solely in addedProducts; server products
      // are overlaid via updatedProducts so the server row is replaced.
      if (addedProducts.some((p) => p.id === product.id)) {
        setAddedProducts((prev) => prev.map((p) => (p.id === product.id ? product : p)));
      } else {
        setUpdatedProducts((prev) => ({ ...prev, [product.id]: product }));
      }
    },
    [addedProducts]
  );

  const deleteLocalProduct = useCallback((id: number) => {
    // Added products have no server counterpart, so just drop them.
    setAddedProducts((prev) => prev.filter((p) => p.id !== id));
    setUpdatedProducts((prev) => {
      if (!(id in prev)) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setDeletedProductIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const getLocalProduct = useCallback(
    (id: number): Product | undefined => {
      return addedProducts.find((p) => p.id === id) ?? updatedProducts[id];
    },
    [addedProducts, updatedProducts]
  );

  const isLocalOnly = useCallback(
    (id: number): boolean => addedProducts.some((p) => p.id === id),
    [addedProducts]
  );

  const isDeleted = useCallback(
    (id: number): boolean => deletedProductIds.includes(id),
    [deletedProductIds]
  );

  const value = useMemo(
    () => ({
      addedProducts,
      updatedProducts,
      deletedProductIds,
      notice,
      addLocalProduct,
      updateLocalProduct,
      deleteLocalProduct,
      getLocalProduct,
      isLocalOnly,
      isDeleted,
      setNotice,
    }),
    [addedProducts, updatedProducts, deletedProductIds, notice, addLocalProduct, updateLocalProduct, deleteLocalProduct, getLocalProduct, isLocalOnly, isDeleted]
  );

  return <ProductMutationContext.Provider value={value}>{children}</ProductMutationContext.Provider>;
}

// Single hook for reading/updating local mutations. Pages never manage
// added/updated/deleted state themselves.
export function useProductMutations(): ProductMutationState {
  const ctx = useContext(ProductMutationContext);
  if (!ctx) throw new Error('useProductMutations must be used inside ProductMutationProvider');
  return ctx;
}
