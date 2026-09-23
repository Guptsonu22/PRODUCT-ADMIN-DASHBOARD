'use client';

import { EmptyState } from '@/components/common/EmptyState';
import type { ProductReview } from '@/types/product';

function formatDate(raw: string): string {
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? raw : d.toLocaleDateString();
}

// Renders DummyJSON reviews; shows an empty state when there are none.
export function ProductReviews({ reviews }: { reviews: ProductReview[] }) {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
        <EmptyState title="No reviews yet." description="This product has no customer reviews." />
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {reviews.map((review) => (
        <li
          key={review.id ?? `${review.reviewerName}-${review.date}`}
          className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-gray-900 dark:text-white">{review.reviewerName}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1">
              <svg className="w-3.5 h-3.5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span>{review.rating} / 5</span>
            </p>
          </div>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">{review.comment}</p>
          {review.date && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{formatDate(review.date)}</p>
          )}
        </li>
      ))}
    </ul>
  );
}
