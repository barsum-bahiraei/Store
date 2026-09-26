interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = "در حال بارگذاری..." }: LoadingStateProps) {
  return (
    <div className="flex items-center justify-center gap-2 py-12 text-sm text-gray-500 dark:text-gray-400">
      <span className="material-symbols-outlined animate-spin">progress_activity</span>
      {message}
    </div>
  );
}
