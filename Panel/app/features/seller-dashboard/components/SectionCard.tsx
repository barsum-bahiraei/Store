import type { ReactNode } from "react";

interface SectionCardProps {
  title: string;
  icon: string;
  action?: ReactNode;
  children: ReactNode;
}

export function SectionCard({ title, icon, action, children }: SectionCardProps) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-4 py-3 dark:border-gray-800 sm:px-6">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-primary-600 dark:text-primary-400">{icon}</span>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
