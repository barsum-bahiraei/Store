import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { AttributeType } from "~/features/attributes/models/enums/attribute-type";
import { AttributeUnit, getAttributeUnitLabel } from "~/features/attributes/models/enums/attribute-unit";
import { categoryApi } from "~/features/categories/api/category-api";
import type { CategoryListOutput } from "~/features/categories/models/output/category-list-output";
import { flattenCategories } from "~/features/categories/utils/category-tree";
import { brandApi } from "~/features/brands/api/brand-api";
import type { Brand } from "~/features/brands/models/brand";
import { sellerApi } from "~/features/sellers/api/seller-api";
import type { SellerListOutput } from "~/features/sellers/models/seller";
import { variantApi } from "~/features/variants/api/variant-api";
import type { ProductVariant } from "~/features/variants/models/variant";
import { createClientId } from "~/shared/utils/create-client-id";
import { unescapeHtmlEntities } from "~/shared/utils/unescape-html-entities";
import { RichTextEditor } from "~/components/common/rich-text-editor";
import type {
  ProductAttributeDefinition,
  ProductImage,
  ProductListOutput,
} from "../models/product";
import { useProductStore } from "../store/product-store";
import { resolveProductImageUrl } from "../utils/resolve-product-image-url";

interface ProductWizardProps {
  product?: ProductListOutput;
  onClose: () => void;
  onComplete: () => void;
}

interface SelectedImage {
  id: string;
  file: File;
  previewUrl: string;
}

const steps = [
  { title: "Category", icon: "category" },
  { title: "Details", icon: "tune" },
  { title: "Images", icon: "photo_library" },
];

const inputClasses =
  "block min-h-11 w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white dark:placeholder-gray-500";

interface AttributeValueFieldProps {
  attribute: ProductAttributeDefinition;
  value: string;
  onChange: (value: string) => void;
}

function AttributeValueField({ attribute, value, onChange }: AttributeValueFieldProps) {
  const unit = attribute.attributeUnit === AttributeUnit.None
    ? null
    : getAttributeUnitLabel(attribute.attributeUnit);

  if (attribute.attributeType === AttributeType.Bool) {
    return <select value={value} onChange={(event) => onChange(event.target.value)} className={inputClasses}><option value="">Select</option><option value="true">Yes</option><option value="false">No</option></select>;
  }

  if (attribute.attributeType === AttributeType.LongText || attribute.attributeType === AttributeType.MultiSelect) {
    return (
      <div>
        <textarea value={value} onChange={(event) => onChange(event.target.value)} className={`${inputClasses} min-h-24 resize-y`} placeholder={attribute.attributeType === AttributeType.MultiSelect ? "Separate multiple values with commas" : "Enter a detailed value"} />
        {unit && <span className="mt-1 block text-xs text-gray-400">Unit: {unit}</span>}
      </div>
    );
  }

  const inputProps = (() => {
    switch (attribute.attributeType) {
      case AttributeType.Int:
        return { type: "number", inputMode: "numeric" as const, step: "1" };
      case AttributeType.Date:
        return { type: "date" };
      case AttributeType.DateTime:
        return { type: "datetime-local" };
      case AttributeType.Time:
        return { type: "time" };
      case AttributeType.Url:
        return { type: "url", inputMode: "url" as const, placeholder: "https://example.com" };
      case AttributeType.Email:
        return { type: "email", inputMode: "email" as const, placeholder: "name@example.com" };
      case AttributeType.Phone:
        return { type: "tel", inputMode: "tel" as const, placeholder: "+1 555 000 0000" };
      case AttributeType.Select:
        return { type: "text", placeholder: "Enter the selected value" };
      default:
        return { type: "text" };
    }
  })();

  return (
    <div className="relative">
      <input {...inputProps} value={value} onChange={(event) => onChange(event.target.value)} className={`${inputClasses} ${unit ? "pr-24" : ""}`} />
      {unit && <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-gray-400">{unit}</span>}
    </div>
  );
}

function errorMessage(error: unknown): string {
  return error instanceof Error && error.message ? error.message : "An unexpected error occurred.";
}

export function ProductWizard({ product, onClose, onComplete }: ProductWizardProps) {
  const { createProduct, getProduct, updateProduct, uploadImage, deleteImage, submitting } =
    useProductStore();
  const editingProductId = product?.id;
  const isEditing = editingProductId !== undefined;
  const [step, setStep] = useState(isEditing ? 1 : 0);
  const [categories, setCategories] = useState<CategoryListOutput[]>([]);
  const [sellers, setSellers] = useState<SellerListOutput[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [attributes, setAttributes] = useState<ProductAttributeDefinition[]>([]);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [sellerId, setSellerId] = useState<number | null>(null);
  const [productBrandId, setProductBrandId] = useState<number | null>(null);
  const [productVariantIds, setProductVariantIds] = useState<number[]>([]);
  const [title, setTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [longDescription, setLongDescription] = useState("");
  const [price, setPrice] = useState("");
  const [discount, setDiscount] = useState("0");
  const [attributeValues, setAttributeValues] = useState<Record<number, string>>({});
  const [images, setImages] = useState<SelectedImage[]>([]);
  const [existingImages, setExistingImages] = useState<ProductImage[]>([]);
  const [deletedImageIds, setDeletedImageIds] = useState<number[]>([]);
  const imagesRef = useRef<SelectedImage[]>([]);
  const [mainImageId, setMainImageId] = useState<string | null>(null);
  const [savedProductId, setSavedProductId] = useState<number | null>(product?.id ?? null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const request = isEditing
      ? Promise.all([
          categoryApi.list(),
          sellerApi.list(),
          brandApi.list(),
          variantApi.list(),
          getProduct(editingProductId),
        ]).then(([list, sellerList, brandList, variantList, details]) => {
          if (!active) return;
          setCategories(list);
          setSellers(sellerList);
          setBrands(brandList);
          setVariants(variantList);
          setCategoryId(details.categoryId);
          setSellerId(details.seller.id);
          setProductBrandId(details.brand?.id ?? null);
          setProductVariantIds((details.variants ?? []).map((variant) => variant.id));
          setTitle(details.name);
          setShortDescription(details.shortDescription ?? "");
          setLongDescription(unescapeHtmlEntities(details.longDescription) ?? "");
          setPrice(String(details.price));
          setDiscount(String(details.discount));
          setAttributes(details.attributes ?? []);
          setAttributeValues(
            Object.fromEntries((details.attributes ?? []).map((item) => [item.attributeId, item.value]))
          );
          setExistingImages(details.images ?? []);
        })
      : Promise.all([categoryApi.list(), sellerApi.list(), brandApi.list(), variantApi.list()]).then(
          ([list, sellerList, brandList, variantList]) => {
          if (!active) return;
          setCategories(list);
          setSellers(sellerList);
          setBrands(brandList);
          setVariants(variantList);
          setSellerId(sellerList[0]?.id ?? null);
          setProductBrandId(brandList[0]?.id ?? null);
        }
      );

    request
      .catch((reason: unknown) => active && setError(errorMessage(reason)))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [editingProductId, getProduct, isEditing]);

  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  useEffect(() => {
    return () => imagesRef.current.forEach((image) => URL.revokeObjectURL(image.previewUrl));
  }, []);

  const loadAttributes = async () => {
    if (categoryId === null) return;
    setLoading(true);
    setError(null);
    try {
      const categoryAttributes = await categoryApi.listCategoryAttributes(categoryId);
      setAttributes(categoryAttributes.map((attribute) => ({ ...attribute, value: "" })));
      setAttributeValues({});
      setStep(1);
    } catch (reason) {
      setError(errorMessage(reason));
    } finally {
      setLoading(false);
    }
  };

  const saveDetails = async (event: FormEvent) => {
    event.preventDefault();
    if (categoryId === null || sellerId === null || productBrandId === null || !title.trim() || !price) return;
    setError(null);
    try {
      const input = {
        name: title.trim(),
        shortDescription: shortDescription.trim() || null,
        longDescription: longDescription.trim() || null,
        price: Number(price),
        discount: Number(discount || 0),
        categoryId,
        sellerId,
        productBrandId,
        productVariantIds,
        attributes: attributes.map((attribute) => ({
          attributeId: attribute.attributeId,
          value: attributeValues[attribute.attributeId]?.trim() ?? "",
        })),
      };
      if (editingProductId !== undefined) {
        await updateProduct(editingProductId, input);
      } else {
        const created = await createProduct(input);
        setSavedProductId(created.id);
      }
      setStep(2);
    } catch (reason) {
      setError(errorMessage(reason));
    }
  };

  const selectImages = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);
    const files = selectedFiles.filter(
      (file) => file.type.startsWith("image/") || /\.(avif|gif|jpe?g|png|svg|webp)$/i.test(file.name)
    );

    if (files.length === 0) {
      setError("Please select a JPG, PNG, WebP, GIF, AVIF, or SVG image.");
      event.target.value = "";
      return;
    }

    setError(
      files.length === selectedFiles.length
        ? null
        : "Some unsupported files were ignored."
    );
    const next = files.map((file) => ({
      id: createClientId(),
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    setImages((current) => [...current, ...next]);
    setMainImageId((current) => current ?? next[0]?.id ?? null);
    event.target.value = "";
  };

  const removeImage = (id: string) => {
    setImages((current) => {
      const image = current.find((item) => item.id === id);
      if (image) URL.revokeObjectURL(image.previewUrl);
      const next = current.filter((item) => item.id !== id);
      if (mainImageId === id) setMainImageId(next[0]?.id ?? null);
      return next;
    });
  };

  const finish = async () => {
    if (savedProductId === null) return;
    const hasExistingMain = existingImages.some(
      (image) => image.isMain && !deletedImageIds.includes(image.id)
    );
    if (!hasExistingMain && (images.length === 0 || mainImageId === null)) return;
    setUploading(true);
    setError(null);
    try {
      await Promise.all(
        images.map((image) =>
          uploadImage({
            file: image.file,
            name: `${savedProductId}-${image.id}-${image.file.name.replace(/\.[^/.]+$/, "")}`,
            productId: savedProductId,
            isMain: !hasExistingMain && image.id === mainImageId,
            fileType: image.file.type === "image/svg+xml" ? 3 : 0,
          })
        )
      );
      await Promise.all(deletedImageIds.map((id) => deleteImage(id)));
      onComplete();
    } catch (reason) {
      setError(errorMessage(reason));
    } finally {
      setUploading(false);
    }
  };

  const toggleExistingImageDeletion = (image: ProductImage) => {
    setDeletedImageIds((ids) =>
      ids.includes(image.id) ? ids.filter((id) => id !== image.id) : [...ids, image.id]
    );
    if (image.isMain && !deletedImageIds.includes(image.id) && mainImageId === null) {
      setMainImageId(images[0]?.id ?? null);
    }
  };

  const toggleVariant = (variantId: number) => {
    setProductVariantIds((ids) =>
      ids.includes(variantId) ? ids.filter((id) => id !== variantId) : [...ids, variantId]
    );
  };

  const canSubmitDetails =
    title.trim().length > 0 &&
    sellerId !== null &&
    productBrandId !== null &&
    Number(price) > 0 &&
    Number(discount || 0) >= 0;
  const hasRetainedMainImage = existingImages.some(
    (image) => image.isMain && !deletedImageIds.includes(image.id)
  );
  const canSaveImages = hasRetainedMainImage || (images.length > 0 && mainImageId !== null);
  const categoryOptions = flattenCategories(categories);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-gray-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby="wizard-title">
      <div className="flex max-h-[95vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-3xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900 sm:max-h-[90vh] sm:rounded-3xl">
        <header className="flex items-start justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-800 sm:px-7 sm:py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary-600 dark:text-primary-400">{isEditing ? "Edit product" : "New product"}</p>
             <h2 id="wizard-title" className="mt-1 text-xl font-semibold text-gray-950 dark:text-white">{isEditing ? `Update ${product?.name ?? "product"}` : "Build your product listing"}</h2>
          </div>
          <button type="button" onClick={onClose} className="flex size-11 items-center justify-center rounded-xl text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:hover:bg-gray-800 dark:hover:text-white" aria-label="Close wizard">
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>

        <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800 sm:px-7">
          <ol className="grid grid-cols-3 gap-2" aria-label="Product creation progress">
            {steps.map((item, index) => (
              <li key={item.title} className="flex min-w-0 items-center gap-2">
                <span className={`flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors ${index <= step ? "bg-primary-600 text-white" : "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500"}`} aria-current={index === step ? "step" : undefined}>
                  <span className="material-symbols-outlined text-[19px]">{index < step ? "check" : item.icon}</span>
                </span>
                <span className={`hidden truncate text-sm font-medium sm:block ${index <= step ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-gray-500"}`}>{item.title}</span>
                {index < steps.length - 1 && <span className={`h-px flex-1 ${index < step ? "bg-primary-500" : "bg-gray-200 dark:bg-gray-700"}`} />}
              </li>
            ))}
          </ol>
        </div>

        <div className="overflow-y-auto px-5 py-6 sm:px-7 sm:py-7">
          {error && (
            <div className="mb-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300" role="alert">
              <span className="material-symbols-outlined text-[20px]">error</span><span>{error}</span>
            </div>
          )}

          {step === 0 && (
            <section>
              <h3 className="text-lg font-semibold text-gray-950 dark:text-white">Choose a category</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">The category determines which specifications this product needs.</p>
              {loading ? (
                <div className="mt-8 flex items-center justify-center gap-2 py-12 text-sm text-gray-500"><span className="material-symbols-outlined animate-spin">progress_activity</span>Loading categories...</div>
              ) : categoryOptions.length === 0 ? (
                <div className="mt-8 rounded-2xl border border-dashed border-gray-300 p-10 text-center dark:border-gray-700"><span className="material-symbols-outlined text-4xl text-gray-400">category</span><p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Create a category before adding products.</p></div>
              ) : (
                <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {categoryOptions.map(({ category, path }) => (
                    <button key={category.id} type="button" onClick={() => setCategoryId(category.id)} className={`flex min-h-24 items-center gap-3 rounded-2xl border p-4 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 ${categoryId === category.id ? "border-primary-500 bg-primary-50 text-primary-800 dark:bg-primary-950/40 dark:text-primary-200" : "border-gray-200 bg-white text-gray-800 hover:border-primary-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-primary-700 dark:hover:bg-gray-800"}`}>
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"><span className="material-symbols-outlined">inventory_2</span></span>
                      <span className="min-w-0 text-sm font-medium">{path}</span>
                    </button>
                  ))}
                </div>
              )}
            </section>
          )}

          {step === 1 && (
            <form id="product-details-form" onSubmit={saveDetails}>
              <h3 className="text-lg font-semibold text-gray-950 dark:text-white">Product details</h3>
               <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Add pricing, brand, available colors, and category-specific specifications.</p>
                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <label className="sm:col-span-2"><span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Seller <span className="text-red-500">*</span></span><select value={sellerId ?? ""} onChange={(event) => setSellerId(event.target.value ? Number(event.target.value) : null)} className={inputClasses} required><option value="">Select a seller</option>{sellers.map((seller) => <option key={seller.id} value={seller.id}>{seller.name}</option>)}</select>{sellers.length === 0 && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">Create a seller before saving a product.</p>}</label>
                 <label className="sm:col-span-2"><span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Brand <span className="text-red-500">*</span></span><select value={productBrandId ?? ""} onChange={(event) => setProductBrandId(event.target.value ? Number(event.target.value) : null)} className={inputClasses} required><option value="">Select a brand</option>{brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}</select>{brands.length === 0 && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">Create a brand before saving a product.</p>}</label>
                 <label className="sm:col-span-2"><span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Title <span className="text-red-500">*</span></span><input value={title} onChange={(event) => setTitle(event.target.value)} className={inputClasses} placeholder="e.g. Wireless headphones" required autoFocus /></label>
                <label><span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Price <span className="text-red-500">*</span></span><input type="number" inputMode="decimal" min="0.01" step="0.01" value={price} onChange={(event) => setPrice(event.target.value)} className={inputClasses} placeholder="0.00" required /></label>
                <label><span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Discount</span><input type="number" inputMode="decimal" min="0" step="0.01" value={discount} onChange={(event) => setDiscount(event.target.value)} className={inputClasses} placeholder="0.00" /></label>
                <label className="sm:col-span-2"><span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Short description</span><textarea value={shortDescription} onChange={(event) => setShortDescription(event.target.value)} className={`${inputClasses} min-h-20 resize-y`} placeholder="Brief summary of the product" /></label>
                 <div className="sm:col-span-2">
                  <span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Long description</span>
                  <RichTextEditor
                    data={longDescription}
                    onChange={setLongDescription}
                    placeholder="Detailed product description (supports HTML formatting)"
                   />
                 </div>
                 <fieldset className="sm:col-span-2">
                   <legend className="text-sm font-medium text-gray-700 dark:text-gray-300">Available colors</legend>
                   {variants.length === 0 ? (
                     <p className="mt-2 rounded-xl border border-dashed border-gray-300 px-4 py-3 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">No colors have been created yet. You can save this product without a color.</p>
                   ) : (
                     <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                       {variants.map((variant) => {
                         const selected = productVariantIds.includes(variant.id);
                         return (
                           <label key={variant.id} className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-2.5 transition-colors ${selected ? "border-primary-500 bg-primary-50 text-primary-800 dark:bg-primary-950/40 dark:text-primary-200" : "border-gray-200 text-gray-700 hover:border-primary-300 dark:border-gray-700 dark:text-gray-300 dark:hover:border-primary-700"}`}>
                             <input type="checkbox" checked={selected} onChange={() => toggleVariant(variant.id)} className="size-4 accent-primary-600" />
                             <span className="size-6 shrink-0 rounded-full border border-gray-300 dark:border-gray-600" style={{ backgroundColor: variant.colorCode }} aria-hidden="true" />
                             <span className="min-w-0 truncate text-sm font-medium">{variant.colorName}</span>
                           </label>
                         );
                       })}
                     </div>
                   )}
                 </fieldset>
               </div>
              {attributes.length > 0 && (
                <div className="mt-8 border-t border-gray-200 pt-6 dark:border-gray-800">
                  <div className="flex items-center gap-2"><span className="material-symbols-outlined text-primary-600 dark:text-primary-400">tune</span><h4 className="font-semibold text-gray-900 dark:text-white">Specifications</h4></div>
                  <div className="mt-4 grid gap-5 sm:grid-cols-2">
                     {attributes.map((attribute) => (
                       <label key={attribute.attributeId}><span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">{attribute.attributeTitle ?? `Attribute ${attribute.attributeId}`}</span>
                         <AttributeValueField attribute={attribute} value={attributeValues[attribute.attributeId] ?? ""} onChange={(value) => setAttributeValues((values) => ({ ...values, [attribute.attributeId]: value }))} />
                       </label>
                    ))}
                  </div>
                </div>
              )}
            </form>
          )}

          {step === 2 && (
            <section>
              <div className="flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 dark:border-green-900/50 dark:bg-green-950/30"><span className="material-symbols-outlined text-green-600 dark:text-green-400">check_circle</span><div><h3 className="font-semibold text-green-900 dark:text-green-200">{isEditing ? "Product details updated" : "Product created"}</h3><p className="mt-0.5 text-sm text-green-700 dark:text-green-300">{isEditing ? "Keep or remove current images, and add new ones if needed." : "Now add its gallery and choose one main image."}</p></div></div>
              <label className="mt-6 flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center transition-colors hover:border-primary-400 hover:bg-primary-50/50 focus-within:ring-2 focus-within:ring-primary-500 dark:border-gray-700 dark:bg-gray-950 dark:hover:border-primary-600 dark:hover:bg-primary-950/20">
                <span className="flex size-12 items-center justify-center rounded-full bg-white text-primary-600 shadow-sm dark:bg-gray-800 dark:text-primary-400"><span className="material-symbols-outlined">add_photo_alternate</span></span>
                <span className="mt-3 text-sm font-semibold text-gray-800 dark:text-gray-200">Choose product images</span><span className="mt-1 text-xs text-gray-500 dark:text-gray-400">Select one or multiple image files</span>
                <input type="file" accept=".avif,.gif,.jpeg,.jpg,.png,.svg,.webp,image/*" multiple onChange={selectImages} className="sr-only" />
              </label>
              {existingImages.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Current images</h4>
                  <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {existingImages.map((image) => {
                      const isDeleted = deletedImageIds.includes(image.id);
                      return (
                        <div key={image.id} className={`relative overflow-hidden rounded-2xl border-2 bg-gray-100 dark:bg-gray-800 ${image.isMain ? "border-primary-500" : "border-transparent"} ${isDeleted ? "opacity-50" : ""}`}>
                           <img src={resolveProductImageUrl(image) ?? undefined} alt={image.name} className="aspect-square w-full object-cover" />
                           <button type="button" onClick={() => toggleExistingImageDeletion(image)} className={`absolute right-2 top-2 flex size-9 items-center justify-center rounded-lg text-white backdrop-blur-sm ${isDeleted ? "bg-green-600 hover:bg-green-700" : "bg-gray-950/70 hover:bg-red-600"}`} aria-label={isDeleted ? `Keep ${image.name}` : `Delete ${image.name}`}><span className="material-symbols-outlined text-[19px]">{isDeleted ? "undo" : "delete"}</span></button>
                          <span className="absolute inset-x-2 bottom-2 flex min-h-10 items-center rounded-xl bg-gray-950/75 px-3 text-xs font-medium text-white backdrop-blur-sm">{isDeleted ? "Will be deleted" : image.isMain ? "Main image" : "Current image"}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {images.length > 0 && (
                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {images.map((image) => (
                    <div key={image.id} className={`group relative overflow-hidden rounded-2xl border-2 bg-gray-100 dark:bg-gray-800 ${!hasRetainedMainImage && mainImageId === image.id ? "border-primary-500" : "border-transparent"}`}>
                      <img src={image.previewUrl} alt={image.file.name} className="aspect-square w-full object-cover" />
                      <button type="button" onClick={() => removeImage(image.id)} className="absolute right-2 top-2 flex size-9 items-center justify-center rounded-lg bg-gray-950/70 text-white backdrop-blur-sm hover:bg-red-600" aria-label={`Remove ${image.file.name}`}><span className="material-symbols-outlined text-[19px]">delete</span></button>
                      {hasRetainedMainImage ? (
                        <span className="absolute inset-x-2 bottom-2 flex min-h-10 items-center rounded-xl bg-gray-950/75 px-3 text-xs font-medium text-white backdrop-blur-sm">New image</span>
                      ) : (
                        <label className="absolute inset-x-2 bottom-2 flex min-h-10 cursor-pointer items-center gap-2 rounded-xl bg-gray-950/75 px-3 text-xs font-medium text-white backdrop-blur-sm"><input type="radio" name="main-image" checked={mainImageId === image.id} onChange={() => setMainImageId(image.id)} className="size-4 accent-primary-600" />Main image</label>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>

        <footer className="mt-auto flex items-center justify-between gap-3 border-t border-gray-200 bg-gray-50 px-5 py-4 dark:border-gray-800 dark:bg-gray-900 sm:px-7">
          <button type="button" onClick={step === 0 || step === 2 ? onClose : () => setStep(0)} className="min-h-11 rounded-xl px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-gray-300 dark:hover:bg-gray-800">{step === 0 || step === 2 ? "Cancel" : "Back"}</button>
          <div className="flex items-center gap-2">
            {step === 0 && <button type="button" onClick={() => void loadAttributes()} disabled={categoryId === null || loading} className="flex min-h-11 items-center gap-2 rounded-xl bg-primary-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-gray-900">Continue<span className="material-symbols-outlined text-[19px]">arrow_forward</span></button>}
            {step === 1 && <button type="submit" form="product-details-form" disabled={!canSubmitDetails || submitting || loading} className="flex min-h-11 items-center gap-2 rounded-xl bg-primary-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-gray-900">{(submitting || loading) && <span className="material-symbols-outlined animate-spin text-[19px]">progress_activity</span>}{submitting ? "Saving..." : loading ? "Loading..." : isEditing ? "Save & manage images" : "Create product"}</button>}
            {step === 2 && <button type="button" onClick={() => void finish()} disabled={!canSaveImages || uploading} className="flex min-h-11 items-center gap-2 rounded-xl bg-primary-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-gray-900">{uploading && <span className="material-symbols-outlined animate-spin text-[19px]">progress_activity</span>}{uploading ? "Saving images..." : isEditing ? "Save image changes" : "Upload & finish"}</button>}
          </div>
        </footer>
      </div>
    </div>
  );
}
