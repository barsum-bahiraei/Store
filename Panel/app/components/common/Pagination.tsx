import { useEffect, useId, useState } from "react";

interface PaginationProps {
  page: number;
  pageSize: number;
  totalCount: number;
  loading?: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  pageSizeOptions?: number[];
}

const navButtonClasses =
  "inline-flex size-9 shrink-0 items-center justify-center text-gray-500 transition-colors hover:bg-gray-50 hover:text-primary-600 disabled:cursor-not-allowed disabled:bg-transparent disabled:text-gray-300 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-primary-300 dark:disabled:text-gray-700";

export function Pagination({
  page,
  pageSize,
  totalCount,
  loading,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const [jumpPage, setJumpPage] = useState(String(currentPage));
  const jumpInputId = useId();

  useEffect(() => {
    setJumpPage(String(currentPage));
  }, [currentPage]);

  useEffect(() => {
    if (jumpPage === "") return;
    const targetPage = Number(jumpPage);
    if (!Number.isInteger(targetPage) || targetPage === currentPage) return;

    const timeout = window.setTimeout(() => onPageChange(targetPage), 700);
    return () => window.clearTimeout(timeout);
  }, [currentPage, jumpPage, onPageChange]);

  if (totalCount === 0) return null;

  const from = (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, totalCount);
  const options = pageSizeOptions.includes(pageSize)
    ? pageSizeOptions
    : [...pageSizeOptions, pageSize].sort((a, b) => a - b);

  const goToPage = (targetPage: number) => {
    const safePage = Math.min(Math.max(targetPage, 1), totalPages);
    if (safePage !== currentPage) onPageChange(safePage);
  };

  const changeJumpPage = (value: string) => {
    if (value === "") {
      setJumpPage("");
      return;
    }

    const targetPage = Number(value);
    if (!Number.isFinite(targetPage)) return;
    const safePage = Math.min(Math.max(Math.trunc(targetPage), 1), totalPages);
    setJumpPage(String(safePage));
  };

  return (
    <div className="border-t border-gray-200 bg-white px-3 py-3 dark:border-gray-800 dark:bg-gray-900 sm:px-5">
      <div className="grid gap-3 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
        <div className="flex items-center justify-between gap-3 lg:justify-start">
          <p className="whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
            نمایش <span className="font-semibold text-gray-800 dark:text-gray-200">{from}–{to}</span> از {totalCount}
          </p>
          <span className="text-[11px] text-gray-400 lg:hidden">صفحه {currentPage} از {totalPages}</span>
        </div>

        <nav className="mx-auto flex w-full max-w-sm items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900 sm:w-auto" aria-label="صفحه‌بندی">
          <button type="button" onClick={() => goToPage(1)} disabled={currentPage === 1 || loading} className={navButtonClasses} aria-label="اولین صفحه" title="اولین صفحه">
            <span className="material-symbols-outlined text-xl">keyboard_double_arrow_right</span>
          </button>
          <button type="button" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1 || loading} className={`${navButtonClasses} border-r border-gray-200 dark:border-gray-700`} aria-label="صفحه قبل" title="صفحه قبل">
            <span className="material-symbols-outlined text-xl">chevron_right</span>
          </button>

          <div className="flex h-9 min-w-28 items-center justify-center gap-1.5 border-x border-gray-200 bg-gray-50 px-2 text-xs dark:border-gray-700 dark:bg-gray-800/70">
            <input
              id={jumpInputId}
              type="number"
              inputMode="numeric"
              min="1"
              max={totalPages}
              value={jumpPage}
              onChange={(event) => changeJumpPage(event.target.value)}
              onBlur={() => {
                if (jumpPage === "") setJumpPage(String(currentPage));
              }}
              onKeyDown={(event) => {
                if (["-", "+", "e", "E", "."].includes(event.key)) event.preventDefault();
              }}
              disabled={loading}
              aria-label="شماره صفحه"
              className="h-7 w-10 appearance-none rounded-md border border-gray-200 bg-white px-1 text-center text-xs font-semibold text-primary-600 outline-none transition-colors [appearance:textfield] focus:border-primary-500 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-900 dark:text-primary-300 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <span className="text-gray-400">از</span>
            <span className="font-medium text-gray-700 dark:text-gray-200">{totalPages}</span>
          </div>

          <button type="button" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages || loading} className={`${navButtonClasses} border-l border-gray-200 dark:border-gray-700`} aria-label="صفحه بعد" title="صفحه بعد">
            <span className="material-symbols-outlined text-xl">chevron_left</span>
          </button>
          <button type="button" onClick={() => goToPage(totalPages)} disabled={currentPage === totalPages || loading} className={navButtonClasses} aria-label="آخرین صفحه" title="آخرین صفحه">
            <span className="material-symbols-outlined text-xl">keyboard_double_arrow_left</span>
          </button>
        </nav>

        <div className="flex items-center justify-end gap-2 lg:justify-self-end">
          <label className="flex min-w-0 items-center gap-2 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
            <span>نمایش</span>
            <select
              value={pageSize}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
              disabled={loading}
              aria-label="تعداد نمایش در صفحه"
              className="h-9 rounded-lg border border-gray-200 bg-white px-2 text-xs font-medium text-gray-800 outline-none transition-colors hover:border-gray-300 focus:border-primary-500 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200"
            >
              {options.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
        </div>
      </div>
    </div>
  );
}
