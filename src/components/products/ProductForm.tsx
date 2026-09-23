'use client';

import { useState } from 'react';
import type { ProductFormData, ProductFormErrors } from '@/types/product';

interface ProductFormProps {
  initialValues?: ProductFormData;
  categories: string[];
  submitLabel: string;
  isSubmitting: boolean;
  serverError?: string;
  onSubmit: (data: ProductFormData) => void;
  onCancel: () => void;
}

const EMPTY: ProductFormData = {
  title: '',
  description: '',
  price: 0,
  category: '',
  stock: 0,
  rating: undefined,
};

const inputClass =
  'mt-1 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60';

// One form for both add and edit. Fields are strings until submit so empty
// numeric inputs stay empty (instead of forcing a 0). Validation runs on
// submit and messages render next to each field.
export function ProductForm({
  initialValues = EMPTY,
  categories,
  submitLabel,
  isSubmitting,
  serverError,
  onSubmit,
  onCancel,
}: ProductFormProps) {
  const [title, setTitle] = useState(initialValues.title);
  const [description, setDescription] = useState(initialValues.description);
  const [price, setPrice] = useState(initialValues.price ? String(initialValues.price) : '');
  const [category, setCategory] = useState(initialValues.category);
  const [stock, setStock] = useState(initialValues.stock ? String(initialValues.stock) : '0');
  const [rating, setRating] = useState(
    initialValues.rating !== undefined ? String(initialValues.rating) : ''
  );
  const [errors, setErrors] = useState<ProductFormErrors>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // block double-click submits (button is also disabled)

    const next: ProductFormErrors = {};
    if (title.trim().length < 3) next.title = 'Title is required (min 3 characters).';
    if (description.trim().length === 0) next.description = 'Description is required.';

    const priceNum = Number(price);
    if (price.trim() === '' || !Number.isFinite(priceNum)) next.price = 'Price is required and must be a number.';
    else if (priceNum <= 0) next.price = 'Price must be greater than 0.';

    if (category.trim().length === 0) next.category = 'Category is required.';

    const stockNum = Number(stock);
    if (stock.trim() === '' || !Number.isFinite(stockNum)) next.stock = 'Stock is required and must be a number.';
    else if (!Number.isInteger(stockNum)) next.stock = 'Stock must be a whole number.';
    else if (stockNum < 0) next.stock = 'Stock cannot be negative.';

    let ratingNum: number | undefined;
    if (rating.trim() !== '') {
      ratingNum = Number(rating);
      if (!Number.isFinite(ratingNum)) next.rating = 'Rating must be a number.';
      else if (ratingNum < 0 || ratingNum > 5) next.rating = 'Rating must be between 0 and 5.';
    }

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      price: Number(price),
      category: category.trim(),
      stock: Number(stock),
      rating: ratingNum,
    });
  };

  const fieldError = (message?: string) =>
    message ? (
      <p role="alert" className="mt-1 text-sm text-red-600">
        {message}
      </p>
    ) : null;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div>
        <label htmlFor="product-title" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          Title
        </label>
        <input
          id="product-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isSubmitting}
          aria-invalid={!!errors.title}
          className={inputClass}
        />
        {fieldError(errors.title)}
      </div>

      <div>
        <label htmlFor="product-description" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          Description
        </label>
        <textarea
          id="product-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isSubmitting}
          rows={4}
          aria-invalid={!!errors.description}
          className={inputClass}
        />
        {fieldError(errors.description)}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="product-price" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Price
          </label>
          <input
            id="product-price"
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            disabled={isSubmitting}
            aria-invalid={!!errors.price}
            className={inputClass}
          />
          {fieldError(errors.price)}
        </div>

        <div>
          <label htmlFor="product-category" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Category
          </label>
          <input
            id="product-category"
            type="text"
            list="product-categories"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={isSubmitting}
            placeholder="e.g. beauty"
            aria-invalid={!!errors.category}
            className={inputClass}
          />
          <datalist id="product-categories">
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
          {fieldError(errors.category)}
        </div>

        <div>
          <label htmlFor="product-stock" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Stock
          </label>
          <input
            id="product-stock"
            type="number"
            min="0"
            step="1"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            disabled={isSubmitting}
            aria-invalid={!!errors.stock}
            className={inputClass}
          />
          {fieldError(errors.stock)}
        </div>

        <div>
          <label htmlFor="product-rating" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Rating <span className="font-normal text-gray-500">(optional, 0–5)</span>
          </label>
          <input
            id="product-rating"
            type="number"
            min="0"
            max="5"
            step="0.1"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            disabled={isSubmitting}
            aria-invalid={!!errors.rating}
            className={inputClass}
          />
          {fieldError(errors.rating)}
        </div>
      </div>

      {serverError && (
        <p role="alert" className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
          {serverError}
        </p>
      )}

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  );
}
