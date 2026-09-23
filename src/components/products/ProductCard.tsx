'use client';

import type { Product } from '@/types/product';

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onView: (product: Product) => void;
}

export function ProductCard({ product, onEdit, onDelete, onView }: ProductCardProps) {
  return (
    <article className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 flex flex-col gap-3">
      <div className="flex gap-4">
        <img
          src={product.thumbnail}
          alt={product.title}
          className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
          loading="lazy"
        />
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-medium text-gray-900 dark:text-white truncate">{product.title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">{product.category}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-2 text-sm pt-2 border-t border-gray-100 dark:border-gray-700">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Price</p>
          <p className="font-medium text-gray-900 dark:text-white">${product.price.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Rating</p>
          <p className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
            <svg className="w-3.5 h-3.5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            {product.rating.toFixed(1)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Stock</p>
          <p className={`font-medium ${product.stock > 10 ? 'text-green-600 dark:text-green-400' : product.stock > 0 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
            {product.stock > 0 ? product.stock : 'Out'}
          </p>
        </div>
      </div>

      <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
        <button
          type="button"
          onClick={() => onView(product)}
          className="flex-1 px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label={`View ${product.title}`}
        >
          View
        </button>
        <button
          type="button"
          onClick={() => onEdit(product)}
          className="flex-1 px-3 py-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/30 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label={`Edit ${product.title}`}
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => onDelete(product)}
          className="flex-1 px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 focus:outline-none focus:ring-2 focus:ring-red-500"
          aria-label={`Delete ${product.title}`}
        >
          Delete
        </button>
      </div>
    </article>
  );
}