import { useEffect, useState } from "react";
import type { SellerListOutput } from "~/features/sellers/models/seller";
import { sellerApi } from "~/features/sellers/api/seller-api";

const inputClasses =
  "min-h-11 w-full rounded-xl border border-gray-300 bg-white px-3.5 text-sm text-gray-900 outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white";

interface SellerPickerModalProps {
  open: boolean;
  selectedId: number | null;
  onSelect: (id: number) => void;
  onClose: () => void;
}

export function SellerPickerModal({ open, selectedId, onSelect, onClose }: SellerPickerModalProps) {
  const [sellers, setSellers] = useState<SellerListOutput[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!open) return;
    let active = true;
    setLoading(true);
    setError(null);
    setSearch("");
    sellerApi.list()
      .then((list) => { if (active) setSellers(list); })
      .catch((reason) => { if (active) setError(reason instanceof Error ? reason.message : "خطا در بارگذاری فروشندگان."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [open]);

  const filtered = sellers.filter((seller) =>
    seller.name.toLowerCase().includes(search.trim().toLowerCase())
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-gray-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-6" role="dialog" aria-modal="true" onMouseDown={onClose}>
      <div onMouseDown={(event) => event.stopPropagation()} className="flex max-h-[80vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900 sm:max-h-[70vh] sm:rounded-3xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">انتخاب فروشنده</h2>
          <button type="button" onClick={onClose} className="flex size-10 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="border-b border-gray-200 px-5 py-3 dark:border-gray-800">
          <div className="relative">
            <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xl text-gray-400">search</span>
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="جستجوی فروشنده..." className={`${inputClasses} pr-10`} autoFocus />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-sm text-gray-500">
              <span className="material-symbols-outlined animate-spin">progress_activity</span>در حال بارگذاری...
            </div>
          ) : error ? (
            <div className="px-5 py-8 text-center text-sm text-red-600 dark:text-red-400">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-gray-500">فروشنده‌ای یافت نشد</div>
          ) : (
            <ul className="space-y-1">
              {filtered.map((seller) => (
                <li key={seller.id}>
                  <button
                    type="button"
                    onClick={() => { onSelect(seller.id); onClose(); }}
                    className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-right transition-colors ${selectedId === seller.id ? "bg-primary-50 text-primary-700 dark:bg-primary-950/40 dark:text-primary-300" : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"}`}
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
                      {seller.name[0]}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{seller.name}</p>
                    </div>
                    {selectedId === seller.id && <span className="material-symbols-outlined text-xl text-primary-600 dark:text-primary-400">check_circle</span>}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-gray-200 px-5 py-3 dark:border-gray-800">
          <button type="button" onClick={onClose} className="min-h-10 rounded-lg px-4 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800">بستن</button>
        </div>
      </div>
    </div>
  );
}
