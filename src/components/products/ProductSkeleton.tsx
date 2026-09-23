export function ProductSkeleton({ isMobile = false }: { isMobile?: boolean }) {
  if (isMobile) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 animate-pulse space-y-3">
        <div className="flex gap-4">
          <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    );
  }

  return (
    <tr className="animate-pulse">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg" />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
      </td>
    </tr>
  );
}