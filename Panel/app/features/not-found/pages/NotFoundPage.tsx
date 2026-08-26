import { Link } from "react-router";

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white p-4 dark:bg-gray-950">
      <div className="text-center">
        <span className="material-symbols-outlined text-5xl text-gray-300 dark:text-gray-600">
          error
        </span>
        <h1 className="mt-4 text-2xl font-semibold text-gray-900 dark:text-white">404</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          The page you are looking for could not be found.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700"
        >
          <span className="material-symbols-outlined text-[18px]">home</span>
          Go to Sign In
        </Link>
      </div>
    </main>
  );
}