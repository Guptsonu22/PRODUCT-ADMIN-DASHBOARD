'use client';

import { useState } from 'react';

// Simple gallery: selected main image + clickable thumbnails.
// No library, no horizontal overflow (thumbnails wrap on mobile).
export function ProductImageGallery({ images, title }: { images: string[]; title: string }) {
  const [selected, setSelected] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="w-full aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
        <span className="text-sm text-gray-500 dark:text-gray-400">No image available</span>
      </div>
    );
  }

  const safeIndex = Math.min(selected, images.length - 1);
  const current = images[safeIndex];

  return (
    <div>
      <div className="w-full aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
        <img
          src={current}
          alt={title}
          className="w-full h-full object-contain"
          loading="eager"
        />
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Product images">
          {images.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              onClick={() => setSelected(i)}
              aria-label={`Show image ${i + 1} of ${title}`}
              aria-pressed={i === safeIndex}
              className={`w-16 h-16 rounded-lg overflow-hidden border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                i === safeIndex
                  ? 'border-blue-600'
                  : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <img
                src={src}
                alt={`${title} thumbnail ${i + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
