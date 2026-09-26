interface PaginationProps {
  page: number;
  pageSize: number;
  totalCount: number;
  loading?: boolean;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, pageSize, totalCount, loading, onPageChange }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  if (totalCount <= pageSize) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalCount);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 px-4 py-3 dark:border-gray-800 sm:px-6">
      <p className="text-xs text-gray-500 dark:text-gray-400">
        نمایش {from} تا {to} از {totalCount} مورد
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1 || loading}
          className="flex min-h-9 items-center gap-1 rounded-lg border border-gray-300 px-3 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          <span className="material-symbols-outlined text-base">chevron_right</span>
          قبلی
        </button>
        <span className="text-xs text-gray-600 dark:text-gray-300">
          صفحه {page} از {totalPages}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages || loading}
          className="flex min-h-9 items-center gap-1 rounded-lg border border-gray-300 px-3 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          بعدی
          <span className="material-symbols-outlined text-base">chevron_left</span>
        </button>
      </div>
    </div>
  );
}
