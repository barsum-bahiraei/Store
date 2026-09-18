import { useEffect, useRef } from "react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "تایید",
  cancelLabel = "لغو",
  danger = true,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) confirmRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/60 p-4 backdrop-blur-sm"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      aria-describedby="confirm-message"
      onMouseDown={onCancel}
    >
      <div
        onMouseDown={(event) => event.stopPropagation()}
        className="w-full max-w-sm overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900"
      >
        <div className="flex flex-col items-center px-6 pt-6 text-center">
          <div className={`flex size-14 items-center justify-center rounded-full ${danger ? "bg-red-100 dark:bg-red-950/40" : "bg-gray-100 dark:bg-gray-800"}`}>
            <span className={`material-symbols-outlined text-3xl ${danger ? "text-red-600 dark:text-red-400" : "text-gray-600 dark:text-gray-400"}`}>
              {danger ? "delete" : "help"}
            </span>
          </div>
          <h3 id="confirm-title" className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          <p id="confirm-message" className="mt-2 text-sm text-gray-500 dark:text-gray-400">{message}</p>
        </div>
        <div className="flex gap-3 px-6 pb-6 pt-5">
          <button
              ref={confirmRef}
              type="button"
              onClick={onConfirm}
              className={`min-h-11 flex-1 rounded-xl px-4 text-sm font-semibold text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${
                  danger
                      ? "bg-red-600 hover:bg-red-700 focus:ring-red-500"
                      : "bg-primary-600 hover:bg-primary-700 focus:ring-primary-500"
              }`}
          >
            {confirmLabel}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="min-h-11 flex-1 rounded-xl border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
