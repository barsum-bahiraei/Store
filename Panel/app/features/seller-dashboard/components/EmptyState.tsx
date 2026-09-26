interface EmptyStateProps {
  icon?: string;
  message: string;
}

export function EmptyState({ icon = "inbox", message }: EmptyStateProps) {
  return (
    <div className="border border-dashed border-gray-300 py-12 text-center dark:border-gray-700">
      <span className="material-symbols-outlined text-4xl text-gray-300 dark:text-gray-600">{icon}</span>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{message}</p>
    </div>
  );
}
