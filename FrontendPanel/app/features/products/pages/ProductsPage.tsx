import { useEffect, useState } from "react";
import { ProductWizard } from "../components/ProductWizard";
import type { ProductListOutput } from "../models/product";
import { useProductStore } from "../store/product-store";
import { resolveProductImageUrl } from "../utils/resolve-product-image-url";

function formatPrice(value: number): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(value);
}

export default function ProductsPage() {
  const { products, loading, submitting, error, fetchProducts, deleteProduct } = useProductStore();
  const [wizardOpen, setWizardOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductListOutput | null>(null);

  useEffect(() => {
    void fetchProducts();
  }, [fetchProducts]);

  const completeWizard = () => {
    setWizardOpen(false);
    setEditingProduct(null);
    void fetchProducts();
  };

  const closeWizard = () => {
    setWizardOpen(false);
    setEditingProduct(null);
  };

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary-600 dark:text-primary-400">Catalog</p>
          <h1 className="mt-1 text-2xl font-semibold text-gray-950 dark:text-white">Products</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Build and manage your store catalog.</p>
        </div>
        <button onClick={() => setWizardOpen(true)} className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-950">
          <span className="material-symbols-outlined text-[20px]">add</span>New product
        </button>
      </div>

      {error && (
        <div className="mb-5 flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300" role="alert">
          <span className="flex items-start gap-2"><span className="material-symbols-outlined text-[20px]">error</span>{error}</span>
          <button onClick={() => void fetchProducts()} className="shrink-0 font-semibold hover:underline">Retry</button>
        </div>
      )}

      {loading && products.length === 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-label="Loading products">
          {[1, 2, 3].map((item) => <div key={item} className="h-48 animate-pulse rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900" />)}
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center dark:border-gray-700 dark:bg-gray-900">
          <span className="material-symbols-outlined text-5xl text-gray-300 dark:text-gray-600">inventory_2</span>
          <h2 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">Your catalog is empty</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Create the first product with the guided wizard.</p>
          <button onClick={() => setWizardOpen(true)} className="mt-5 min-h-11 rounded-xl bg-primary-600 px-5 text-sm font-semibold text-white hover:bg-primary-700">Create product</button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <article key={product.id} className="group overflow-hidden rounded-2xl border border-gray-200 bg-white transition-colors hover:border-primary-300 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-primary-800">
              <div className="flex aspect-[16/8] items-center justify-center bg-gray-100 dark:bg-gray-800">
                {resolveProductImageUrl(product.image) ? <img src={resolveProductImageUrl(product.image) ?? undefined} alt={product.title} className="size-full object-cover" /> : <span className="material-symbols-outlined text-5xl text-gray-300 dark:text-gray-600">image</span>}
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0"><p className="text-xs font-medium text-primary-600 dark:text-primary-400">{product.categoryTitle}</p><h2 className="mt-1 truncate font-semibold text-gray-950 dark:text-white">{product.title}</h2></div>
                  <div className="flex shrink-0 items-center">
                    <button onClick={() => { setEditingProduct(product); setWizardOpen(true); }} disabled={submitting} className="flex size-11 items-center justify-center rounded-xl text-gray-400 transition-colors hover:bg-primary-50 hover:text-primary-600 disabled:opacity-50 dark:hover:bg-primary-950/30 dark:hover:text-primary-400" aria-label={`Edit ${product.title}`}><span className="material-symbols-outlined text-[20px]">edit</span></button>
                    <button onClick={() => void deleteProduct(product.id)} disabled={submitting} className="flex size-11 items-center justify-center rounded-xl text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-950/30 dark:hover:text-red-400" aria-label={`Delete ${product.title}`}><span className="material-symbols-outlined text-[20px]">delete</span></button>
                  </div>
                </div>
                <p className="mt-3 line-clamp-2 min-h-10 text-sm leading-5 text-gray-500 dark:text-gray-400">{product.description || "No description"}</p>
                <div className="mt-4 flex items-baseline justify-between border-t border-gray-100 pt-4 dark:border-gray-800"><span className="text-lg font-bold text-gray-950 dark:text-white">{formatPrice(product.price)}</span>{product.discount > 0 && <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700 dark:bg-green-950/40 dark:text-green-400">{formatPrice(product.discount)} discount</span>}</div>
              </div>
            </article>
          ))}
        </div>
      )}

      {wizardOpen && <ProductWizard product={editingProduct ?? undefined} onClose={closeWizard} onComplete={completeWizard} />}
    </div>
  );
}
