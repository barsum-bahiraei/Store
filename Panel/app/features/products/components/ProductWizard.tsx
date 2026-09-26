import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { ConfirmDialog } from "~/components/common/ConfirmDialog";
import { PersianDateTimePicker } from "~/components/common/PersianDateTimePicker";
import { AttributeType } from "~/features/attributes/models/enums/attribute-type";
import { AttributeUnit, getAttributeUnitLabel } from "~/features/attributes/models/enums/attribute-unit";
import { categoryApi } from "~/features/categories/api/category-api";
import type { CategoryListOutput } from "~/features/categories/models/output/category-list-output";
import { brandApi } from "~/features/brands/api/brand-api";
import type { Brand } from "~/features/brands/models/brand";
import { sellerApi } from "~/features/sellers/api/seller-api";
import type { SellerListOutput } from "~/features/sellers/models/seller";
import { createClientId } from "~/shared/utils/create-client-id";
import { unescapeHtmlEntities } from "~/shared/utils/unescape-html-entities";
import { RichTextEditor } from "~/components/common/rich-text-editor";
import type {
  ProductAttributeDefinition,
  ProductCreateInput,
  ProductImage,
  ProductListOutput,
} from "../models/product";
import { useProductStore } from "../store/product-store";
import { resolveProductImageUrl } from "../utils/resolve-product-image-url";
import { SellerPickerModal } from "./SellerPickerModal";

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

interface VariantValueDraft {
  key: string;
  id?: number;
  size: string;
  name: string;
  code: string;
}

interface VariantDraft {
  key: string;
  id?: number | null;
  price: string;
  stock: string;
  values: VariantValueDraft[];
}

interface VariantValueErrors {
  size?: string;
  name?: string;
  code?: string;
}

interface VariantErrors {
  price?: string;
  stock?: string;
  values?: string;
  combo?: string;
  valueErrors: Record<string, VariantValueErrors>;
}

interface WizardValidation {
  discount?: string;
  variants?: string;
  variantErrors: Record<string, VariantErrors>;
}

const steps = [
  { title: "دسته‌بندی", icon: "category" },
  { title: "جزئیات", icon: "tune" },
  { title: "تصاویر", icon: "photo_library" },
];

const inputClasses =
  "block min-h-11 w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white dark:placeholder-gray-500";

const errorTextClasses = "mt-1 block text-xs text-red-600 dark:text-red-400";

function formatPrice(value: number): string {
  return new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 2 }).format(value);
}

function createEmptyValue(): VariantValueDraft {
  return { key: createClientId(), size: "", name: "", code: "" };
}

function createEmptyVariant(): VariantDraft {
  return { key: createClientId(), id: null, price: "", stock: "", values: [createEmptyValue()] };
}

function errorMessage(error: unknown): string {
  return error instanceof Error && error.message ? error.message : "خطای غیرمنتظره‌ای رخ داد.";
}

function parseNonNegative(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === "") return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function variantComboKey(values: VariantValueDraft[]): string {
  return values
    .map((value) =>
      [value.size.trim().toLowerCase(), value.name.trim().toLowerCase(), value.code.trim().toLowerCase()].join("|"),
    )
    .sort()
    .join(";;");
}

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
    return <select value={value} onChange={(event) => onChange(event.target.value)} className={inputClasses}><option value="">انتخاب کنید</option><option value="true">بله</option><option value="false">خیر</option></select>;
  }

  if (attribute.attributeType === AttributeType.LongText) {
    return (
      <div>
        <textarea value={value} onChange={(event) => onChange(event.target.value)} className={`${inputClasses} min-h-24 resize-y`} placeholder="مقدار را وارد کنید" />
        {unit && <span className="mt-1 block text-xs text-gray-400">واحد: {unit}</span>}
      </div>
    );
  }

  const dateMode =
    attribute.attributeType === AttributeType.Date
      ? "date"
      : attribute.attributeType === AttributeType.DateTime
        ? "datetime"
        : attribute.attributeType === AttributeType.Time
          ? "time"
          : null;

  if (dateMode) {
    return (
      <div>
        <PersianDateTimePicker
          mode={dateMode}
          value={value}
          onChange={onChange}
          className={inputClasses}
          ariaLabel={attribute.attributeTitle ?? "مقدار ویژگی"}
        />
        {unit && <span className="mt-1 block text-xs text-gray-400">واحد: {unit}</span>}
      </div>
    );
  }

  const inputProps = (() => {
    switch (attribute.attributeType) {
      case AttributeType.Int:
        return { type: "number", inputMode: "numeric" as const, step: "1" };
      case AttributeType.Url:
        return { type: "url", inputMode: "url" as const, placeholder: "https://example.com" };
      case AttributeType.Email:
        return { type: "email", inputMode: "email" as const, placeholder: "name@example.com" };
      case AttributeType.Phone:
        return { type: "tel", inputMode: "tel" as const, placeholder: "+98 912 000 0000" };
      default:
        return { type: "text" };
    }
  })();

  return (
    <div className="relative">
      <input {...inputProps} value={value} onChange={(event) => onChange(event.target.value)} className={`${inputClasses} ${unit ? "pl-24" : ""}`} />
      {unit && <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-xs text-gray-400">{unit}</span>}
    </div>
  );
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
  const [attributes, setAttributes] = useState<ProductAttributeDefinition[]>([]);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [sellerId, setSellerId] = useState<number | null>(null);
  const [productBrandId, setProductBrandId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [longDescription, setLongDescription] = useState("");
  const [discount, setDiscount] = useState("0");
  const [attributeValues, setAttributeValues] = useState<Record<number, string>>({});
  const [productVariants, setProductVariants] = useState<VariantDraft[]>(() =>
    isEditing ? [] : [createEmptyVariant()],
  );
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [images, setImages] = useState<SelectedImage[]>([]);
  const [existingImages, setExistingImages] = useState<ProductImage[]>([]);
  const [deletedImageIds, setDeletedImageIds] = useState<number[]>([]);
  const imagesRef = useRef<SelectedImage[]>([]);
  const [mainImageId, setMainImageId] = useState<string | null>(null);
  const [savedProductId, setSavedProductId] = useState<number | null>(product?.id ?? null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedCategoryIds, setExpandedCategoryIds] = useState<Set<number>>(new Set());
  const [sellerModalOpen, setSellerModalOpen] = useState(false);
  const [variantConfirmIndex, setVariantConfirmIndex] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    const request = isEditing
      ? Promise.all([
          categoryApi.list(),
          sellerApi.list(),
          brandApi.list(),
          getProduct(editingProductId),
        ]).then(([list, sellerList, brandList, details]) => {
          if (!active) return;
          setCategories(list);
          setSellers(sellerList);
          setBrands(brandList);
          setCategoryId(details.categoryId);
          setSellerId(details.seller.id);
          setProductBrandId(details.brand?.id ?? null);
          setTitle(details.name);
          setShortDescription(details.shortDescription ?? "");
          setLongDescription(unescapeHtmlEntities(details.longDescription) ?? "");
          setDiscount(String(details.discount));
          setAttributes(details.attributes ?? []);
          setAttributeValues(
            Object.fromEntries((details.attributes ?? []).map((item) => [item.attributeId, item.value]))
          );
          setProductVariants(
            (details.variants ?? []).map((variant) => ({
              key: createClientId(),
              id: variant.id,
              price: String(variant.price),
              stock: String(variant.stock),
              values: variant.values.map((value) => ({
                key: createClientId(),
                id: value.id,
                size: value.size,
                name: value.name,
                code: value.code,
              })),
            }))
          );
          setExistingImages(details.images ?? []);
        })
      : Promise.all([categoryApi.list(), sellerApi.list(), brandApi.list()]).then(
          ([list, sellerList, brandList]) => {
          if (!active) return;
          setCategories(list);
          setSellers(sellerList);
          setBrands(brandList);
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

  const validation = useMemo<WizardValidation>(() => {
    const result: WizardValidation = { variantErrors: {} };

    if (productVariants.length === 0) {
      result.variants = "حداقل یک تنوع برای محصول لازم است.";
    }

    const seenCombos = new Map<string, string>();

    productVariants.forEach((variant) => {
      const variantErrors: VariantErrors = { valueErrors: {} };

      const price = parseNonNegative(variant.price);
      if (price === null) {
        variantErrors.price =
          variant.price.trim() === "" ? "قیمت را وارد کنید." : "قیمت نمی‌تواند منفی باشد.";
      }

      const stock = parseNonNegative(variant.stock);
      if (stock === null) {
        variantErrors.stock =
          variant.stock.trim() === "" ? "موجودی را وارد کنید." : "موجودی نمی‌تواند منفی باشد.";
      }

      if (variant.values.length === 0) {
        variantErrors.values = "حداقل یک مقدار برای این تنوع لازم است.";
      }

      const seenSizes = new Set<string>();
      variant.values.forEach((value) => {
        const valueErrors: VariantValueErrors = {};
        const size = value.size.trim();
        const name = value.name.trim();
        const code = value.code.trim();

        if (!size) {
          valueErrors.size = "سایز را وارد کنید.";
        } else {
          const normalizedSize = size.toLowerCase();
          if (seenSizes.has(normalizedSize)) {
            valueErrors.size = "سایز تکراری است.";
          } else {
            seenSizes.add(normalizedSize);
          }
        }
        if (!name) valueErrors.name = "نام را وارد کنید.";
        if (!code) valueErrors.code = "کد را وارد کنید.";

        if (valueErrors.size || valueErrors.name || valueErrors.code) {
          variantErrors.valueErrors[value.key] = valueErrors;
        }
      });

      if (variant.values.length > 0) {
        const comboKey = variantComboKey(variant.values);
        const existingOwner = seenCombos.get(comboKey);
        if (existingOwner !== undefined && existingOwner !== variant.key) {
          variantErrors.combo = "ترکیب مقادیر این تنوع با تنوع دیگر تکراری است.";
        } else {
          seenCombos.set(comboKey, variant.key);
        }
      }

      if (
        variantErrors.price ||
        variantErrors.stock ||
        variantErrors.values ||
        variantErrors.combo ||
        Object.keys(variantErrors.valueErrors).length > 0
      ) {
        result.variantErrors[variant.key] = variantErrors;
      }
    });

    const discountValue = discount.trim() === "" ? 0 : Number(discount);
    if (!Number.isFinite(discountValue)) {
      result.discount = "تخفیف را به درستی وارد کنید.";
    } else if (discountValue < 0) {
      result.discount = "تخفیف نمی‌تواند منفی باشد.";
    } else {
      const variantPrices = productVariants
        .map((variant) => parseNonNegative(variant.price))
        .filter((price): price is number => price !== null);
      if (variantPrices.some((price) => discountValue > price)) {
        result.discount = "تخفیف نمی‌تواند از قیمت هیچ تنوعی بیشتر باشد.";
      }
    }

    return result;
  }, [productVariants, discount]);

  const hasValidationErrors =
    !!validation.discount ||
    !!validation.variants ||
    Object.keys(validation.variantErrors).length > 0;

  const buildVariantsPayload = (): ProductCreateInput["variants"] =>
    productVariants.map((variant) => {
      const base = {
        price: parseNonNegative(variant.price) ?? 0,
        stock: parseNonNegative(variant.stock) ?? 0,
        values: variant.values.map((value) => ({
          size: value.size.trim(),
          name: value.name.trim(),
          code: value.code.trim(),
        })),
      };
      return isEditing ? { id: variant.id ?? null, ...base } : base;
    });

  const saveDetails = async (event: FormEvent) => {
    event.preventDefault();
    setAttemptedSubmit(true);
    if (categoryId === null || sellerId === null || productBrandId === null || !title.trim()) return;
    if (hasValidationErrors) return;
    setError(null);
    try {
      const input: ProductCreateInput = {
        name: title.trim(),
        shortDescription: shortDescription.trim() || null,
        longDescription: longDescription.trim() || null,
        discount: discount.trim() === "" ? 0 : Number(discount),
        categoryId,
        sellerId,
        productBrandId,
        attributes: attributes.map((attribute) => ({
          attributeId: attribute.attributeId,
          value: attributeValues[attribute.attributeId]?.trim() ?? "",
        })),
        variants: buildVariantsPayload(),
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

  const addVariant = () => {
    setProductVariants((current) => [...current, createEmptyVariant()]);
  };

  const requestRemoveVariant = (index: number) => {
    if (productVariants[index]?.id != null) {
      setVariantConfirmIndex(index);
    } else {
      setProductVariants((current) => current.filter((_, i) => i !== index));
    }
  };

  const confirmRemoveVariant = () => {
    if (variantConfirmIndex === null) return;
    const index = variantConfirmIndex;
    setVariantConfirmIndex(null);
    setProductVariants((current) => current.filter((_, i) => i !== index));
  };

  const updateVariantField = (index: number, field: "price" | "stock", value: string) => {
    setProductVariants((current) =>
      current.map((variant, i) => (i === index ? { ...variant, [field]: value } : variant))
    );
  };

  const addVariantValue = (index: number) => {
    setProductVariants((current) =>
      current.map((variant, i) =>
        i === index ? { ...variant, values: [...variant.values, createEmptyValue()] } : variant
      )
    );
  };

  const removeVariantValue = (variantIndex: number, valueKey: string) => {
    setProductVariants((current) =>
      current.map((variant, i) =>
        i === variantIndex
          ? { ...variant, values: variant.values.filter((value) => value.key !== valueKey) }
          : variant
      )
    );
  };

  const updateVariantValue = (
    variantIndex: number,
    valueKey: string,
    field: "size" | "name" | "code",
    value: string
  ) => {
    setProductVariants((current) =>
      current.map((variant, i) =>
        i === variantIndex
          ? {
              ...variant,
              values: variant.values.map((item) =>
                item.key === valueKey ? { ...item, [field]: value } : item
              ),
            }
          : variant
      )
    );
  };

  const selectImages = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);
    const files = selectedFiles.filter(
      (file) => file.type.startsWith("image/") || /\.(avif|gif|jpe?g|png|svg|webp)$/i.test(file.name)
    );

    if (files.length === 0) {
      setError("لطفاً تصویر با فرمت JPG، PNG، WebP، GIF، AVIF یا SVG انتخاب کنید.");
      event.target.value = "";
      return;
    }

    setError(
      files.length === selectedFiles.length
        ? null
        : "برخی فایل‌های پشتیبانی نشده نادیده گرفته شدند."
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

  const toggleCategoryExpand = (id: number) => {
    setExpandedCategoryIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const canSubmitDetails =
    title.trim().length > 0 &&
    sellerId !== null &&
    productBrandId !== null;
  const hasRetainedMainImage = existingImages.some(
    (image) => image.isMain && !deletedImageIds.includes(image.id)
  );
  const canSaveImages = hasRetainedMainImage || (images.length > 0 && mainImageId !== null);

  const selectedSeller = sellers.find((s) => s.id === sellerId);
  const showErrors = attemptedSubmit;
  const discountNumber = discount.trim() === "" ? 0 : Number(discount);

  const renderCategoryTree = (items: CategoryListOutput[], depth = 0) => (
    <ul className={depth > 0 ? "mr-5 border-r border-gray-200 pr-2 dark:border-gray-700" : "space-y-1"}>
      {items.map((category) => {
        const children = category.children ?? [];
        const hasChildren = children.length > 0;
        const expanded = expandedCategoryIds.has(category.id);
        const selected = categoryId === category.id;
        return (
          <li key={category.id}>
            <div className={`flex min-h-10 items-center rounded-lg transition-colors ${selected ? "bg-primary-50 text-primary-700 dark:bg-primary-950/40 dark:text-primary-300" : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"}`}>
              <button type="button" onClick={() => hasChildren && toggleCategoryExpand(category.id)} disabled={!hasChildren} className="flex size-8 shrink-0 items-center justify-center rounded-lg text-gray-400 disabled:opacity-25">
                <span className="material-symbols-outlined text-lg">{hasChildren ? (expanded ? "keyboard_arrow_down" : "keyboard_arrow_left") : "remove"}</span>
              </button>
              <button type="button" onClick={() => setCategoryId(category.id)} className="flex min-w-0 flex-1 items-center gap-2 self-stretch pl-3 text-right">
                <span className="material-symbols-outlined text-lg">{hasChildren ? "folder" : "folder_open"}</span>
                <span className="truncate text-sm font-medium">{category.name}</span>
              </button>
              {selected && <span className="material-symbols-outlined ml-2 text-lg text-primary-600 dark:text-primary-400">check_circle</span>}
            </div>
            {hasChildren && expanded && renderCategoryTree(children, depth + 1)}
          </li>
        );
      })}
    </ul>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-gray-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby="wizard-title">
      <div className="flex max-h-[95vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-3xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900 sm:max-h-[90vh] sm:rounded-3xl">
        <header className="flex items-start justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-800 sm:px-7 sm:py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary-600 dark:text-primary-400">{isEditing ? "ویرایش محصول" : "محصول جدید"}</p>
             <h2 id="wizard-title" className="mt-1 text-xl font-semibold text-gray-950 dark:text-white">{isEditing ? `ویرایش ${product?.name ?? "محصول"}` : "ایجاد فهرست محصول"}</h2>
          </div>
          <button type="button" onClick={onClose} className="flex size-11 items-center justify-center rounded-xl text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:hover:bg-gray-800 dark:hover:text-white" aria-label="بستن جادوگر">
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>

        <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800 sm:px-7">
          <ol className="grid grid-cols-3 gap-2" aria-label="پیشرفت ایجاد محصول">
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
              <h3 className="text-lg font-semibold text-gray-950 dark:text-white">انتخاب دسته‌بندی</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">دسته‌بندی مشخص می‌کند این محصول به چه مشخصاتی نیاز دارد.</p>
              {loading ? (
                <div className="mt-8 flex items-center justify-center gap-2 py-12 text-sm text-gray-500"><span className="material-symbols-outlined animate-spin">progress_activity</span>در حال بارگذاری دسته‌بندی‌ها...</div>
              ) : categories.length === 0 ? (
                <div className="mt-8 rounded-2xl border border-dashed border-gray-300 p-10 text-center dark:border-gray-700"><span className="material-symbols-outlined text-4xl text-gray-400">category</span><p className="mt-2 text-sm text-gray-600 dark:text-gray-300">قبل از افزودن محصول، یک دسته‌بندی ایجاد کنید.</p></div>
              ) : (
                <div className="mt-6 max-h-[50vh] overflow-y-auto rounded-xl border border-gray-200 p-3 dark:border-gray-700">
                  {renderCategoryTree(categories)}
                </div>
              )}
            </section>
          )}

          {step === 1 && (
            <form id="product-details-form" noValidate onSubmit={saveDetails}>
              <h3 className="text-lg font-semibold text-gray-950 dark:text-white">جزئیات محصول</h3>
               <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">توضیحات، برند و تنوع‌های محصول را اضافه کنید.</p>
                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <label className="sm:col-span-2">
                    <span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">فروشنده <span className="text-red-500">*</span></span>
                    <button type="button" onClick={() => setSellerModalOpen(true)} className={`${inputClasses} flex items-center justify-between text-right`}>
                      <span>{selectedSeller?.name ?? "انتخاب فروشنده"}</span>
                      <span className="material-symbols-outlined text-xl text-gray-400">storefront</span>
                    </button>
                    {sellers.length === 0 && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">قبل از ذخیره محصول، یک فروشنده ایجاد کنید.</p>}
                  </label>
                  <label className="sm:col-span-2"><span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">برند <span className="text-red-500">*</span></span><select value={productBrandId ?? ""} onChange={(event) => setProductBrandId(event.target.value ? Number(event.target.value) : null)} className={inputClasses} required><option value="">انتخاب برند</option>{brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}</select>{brands.length === 0 && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">قبل از ذخیره محصول، یک برند ایجاد کنید.</p>}</label>
                  <label className="sm:col-span-2"><span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">عنوان <span className="text-red-500">*</span></span><input value={title} onChange={(event) => setTitle(event.target.value)} className={inputClasses} placeholder="مثلاً هدفون بی‌سیم" required autoFocus /></label>
                <label>
                  <span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">تخفیف</span>
                  <input type="number" inputMode="decimal" min="0" step="0.01" value={discount} onChange={(event) => setDiscount(event.target.value)} className={inputClasses} placeholder="0" />
                  {Number.isFinite(discountNumber) && discountNumber >= 0 && (
                    <span className="mt-1 block text-xs text-gray-400 dark:text-gray-500">{formatPrice(discountNumber)} تومان</span>
                  )}
                  {showErrors && validation.discount && <span className={errorTextClasses}>{validation.discount}</span>}
                </label>
                <div />
                <label className="sm:col-span-2"><span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">توضیحات کوتاه</span><textarea value={shortDescription} onChange={(event) => setShortDescription(event.target.value)} className={`${inputClasses} min-h-20 resize-y`} placeholder="خلاصه کوتاه محصول" /></label>
                 <div className="sm:col-span-2">
                  <span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">توضیحات کامل</span>
                  <RichTextEditor
                    data={longDescription}
                    onChange={setLongDescription}
                    placeholder="توضیحات تفصیلی محصول (پشتیبانی از فرمت HTML)"
                   />
                 </div>

                 <div className="sm:col-span-2 mt-2 border-t border-gray-200 pt-6 dark:border-gray-800">
                   <div className="flex flex-wrap items-center justify-between gap-3">
                     <div className="flex items-center gap-2">
                       <span className="material-symbols-outlined text-primary-600 dark:text-primary-400">tune</span>
                       <h4 className="font-semibold text-gray-900 dark:text-white">تنوع‌های محصول</h4>
                     </div>
                     <button type="button" onClick={addVariant} className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-primary-600 px-4 text-sm font-semibold text-primary-700 transition-colors hover:bg-primary-50 dark:border-primary-500 dark:text-primary-300 dark:hover:bg-primary-950/40">
                       <span className="material-symbols-outlined text-xl">add</span>
                       افزودن تنوع
                     </button>
                   </div>
                   <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">قیمت، موجودی و مقادیر (سایز، نام، کد) هر تنوع را وارد کنید. حداقل یک تنوع با حداقل یک مقدار لازم است.</p>

                   {showErrors && validation.variants && (
                     <p role="alert" className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">{validation.variants}</p>
                   )}

                   <div className="mt-4 space-y-4">
                     {productVariants.length === 0 && !showErrors && (
                       <div className="rounded-xl border border-dashed border-gray-300 px-4 py-8 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">هنوز تنوعی اضافه نشده است.</div>
                     )}

                     {productVariants.map((variant, variantIndex) => {
                       const variantErrors = showErrors ? validation.variantErrors[variant.key] : undefined;
                       const priceNumber = parseNonNegative(variant.price);
                       return (
                         <div key={variant.key} className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 dark:border-gray-700 dark:bg-gray-800/30">
                           <div className="flex items-center justify-between gap-3">
                             <h5 className="text-sm font-semibold text-gray-900 dark:text-white">تنوع {variantIndex + 1}</h5>
                             <button type="button" onClick={() => requestRemoveVariant(variantIndex)} disabled={submitting} className="flex size-9 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-red-950/30" aria-label={`حذف تنوع ${variantIndex + 1}`}>
                               <span className="material-symbols-outlined text-xl">delete</span>
                             </button>
                           </div>

                           <div className="mt-3 grid gap-3 sm:grid-cols-2">
                             <div>
                               <span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">قیمت (تومان) <span className="text-red-500">*</span></span>
                               <input type="number" inputMode="decimal" min="0" step="0.01" value={variant.price} onChange={(event) => updateVariantField(variantIndex, "price", event.target.value)} className={inputClasses} placeholder="مثلاً 2500000" disabled={submitting} />
                               {priceNumber !== null && priceNumber >= 0 && (
                                 <span className="mt-1 block text-xs text-gray-400 dark:text-gray-500">{formatPrice(priceNumber)} تومان</span>
                               )}
                               {variantErrors?.price && <span role="alert" className={errorTextClasses}>{variantErrors.price}</span>}
                             </div>
                             <div>
                               <span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">موجودی <span className="text-red-500">*</span></span>
                               <input type="number" inputMode="numeric" min="0" step="1" value={variant.stock} onChange={(event) => updateVariantField(variantIndex, "stock", event.target.value)} className={inputClasses} placeholder="مثلاً 10" disabled={submitting} />
                               {variantErrors?.stock && <span role="alert" className={errorTextClasses}>{variantErrors.stock}</span>}
                             </div>
                           </div>

                           {variantErrors?.combo && (
                             <p role="alert" className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">{variantErrors.combo}</p>
                           )}

                           <div className="mt-4">
                             <div className="flex flex-wrap items-center justify-between gap-2">
                               <span className="text-sm font-medium text-gray-700 dark:text-gray-300">مقادیر <span className="text-red-500">*</span></span>
                               <button type="button" onClick={() => addVariantValue(variantIndex)} disabled={submitting} className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 text-xs font-semibold text-gray-700 transition-colors hover:border-primary-400 hover:text-primary-600 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-950 dark:text-gray-200">
                                 <span className="material-symbols-outlined text-base">add</span>
                                 افزودن مقدار
                               </button>
                             </div>
                             {variantErrors?.values && <span role="alert" className={errorTextClasses}>{variantErrors.values}</span>}

                             {variant.values.length === 0 ? (
                               <p className="mt-2 rounded-lg border border-dashed border-gray-300 px-3 py-3 text-center text-xs text-gray-500 dark:border-gray-600 dark:text-gray-400">حداقل یک مقدار اضافه کنید.</p>
                             ) : (
                               <div className="mt-2 space-y-2">
                                 {variant.values.map((value, valueIndex) => {
                                   const valueErrors = variantErrors?.valueErrors[value.key];
                                   return (
                                     <div key={value.key} className="grid gap-2 rounded-lg border border-gray-200 bg-white p-2.5 dark:border-gray-700 dark:bg-gray-950 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-start">
                                       <div>
                                         <input value={value.size} onChange={(event) => updateVariantValue(variantIndex, value.key, "size", event.target.value)} className={`${inputClasses} min-h-10 py-2`} placeholder="سایز (مثلاً Size)" aria-label={`سایز مقدار ${valueIndex + 1}`} disabled={submitting} />
                                         {valueErrors?.size && <span role="alert" className={errorTextClasses}>{valueErrors.size}</span>}
                                       </div>
                                       <div>
                                         <input value={value.name} onChange={(event) => updateVariantValue(variantIndex, value.key, "name", event.target.value)} className={`${inputClasses} min-h-10 py-2`} placeholder="نام (مثلاً 40)" aria-label={`نام مقدار ${valueIndex + 1}`} disabled={submitting} />
                                         {valueErrors?.name && <span role="alert" className={errorTextClasses}>{valueErrors.name}</span>}
                                       </div>
                                       <div>
                                         <input value={value.code} onChange={(event) => updateVariantValue(variantIndex, value.key, "code", event.target.value)} className={`${inputClasses} min-h-10 py-2`} placeholder="کد (مثلاً 40)" aria-label={`کد مقدار ${valueIndex + 1}`} disabled={submitting} />
                                         {valueErrors?.code && <span role="alert" className={errorTextClasses}>{valueErrors.code}</span>}
                                       </div>
                                       <button type="button" onClick={() => removeVariantValue(variantIndex, value.key)} disabled={submitting} className="flex size-10 shrink-0 items-center justify-center justify-self-end rounded-lg text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-950/30" aria-label={`حذف مقدار ${valueIndex + 1}`}>
                                         <span className="material-symbols-outlined text-xl">close</span>
                                       </button>
                                     </div>
                                   );
                                 })}
                               </div>
                             )}
                           </div>
                         </div>
                       );
                     })}
                     </div>
                   </div>
                 </div>

               {attributes.length > 0 && (
                 <div className="mt-8 border-t border-gray-200 pt-6 dark:border-gray-800">
                   <div className="flex items-center gap-2"><span className="material-symbols-outlined text-primary-600 dark:text-primary-400">tune</span><h4 className="font-semibold text-gray-900 dark:text-white">مشخصات</h4></div>
                   <div className="mt-4 grid gap-5 sm:grid-cols-2">
                     {attributes.map((attribute) => (
                       <label key={attribute.attributeId}><span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">{attribute.attributeTitle ?? `ویژگی ${attribute.attributeId}`}</span>
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
              <div className="flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 dark:border-green-900/50 dark:bg-green-950/30"><span className="material-symbols-outlined text-green-600 dark:text-green-400">check_circle</span><div><h3 className="font-semibold text-green-900 dark:text-green-200">{isEditing ? "جزئیات محصول به‌روزرسانی شد" : "محصول ایجاد شد"}</h3><p className="mt-0.5 text-sm text-green-700 dark:text-green-300">{isEditing ? "تصاویر فعلی را نگه دارید یا حذف کنید و در صورت نیاز تصاویر جدید اضافه کنید." : "حالا گالری آن را اضافه کنید و یک تصویر اصلی انتخاب کنید."}</p></div></div>
              <label className="mt-6 flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center transition-colors hover:border-primary-400 hover:bg-primary-50/50 focus-within:ring-2 focus-within:ring-primary-500 dark:border-gray-700 dark:bg-gray-950 dark:hover:border-primary-600 dark:hover:bg-primary-950/20">
                <span className="flex size-12 items-center justify-center rounded-full bg-white text-primary-600 shadow-sm dark:bg-gray-800 dark:text-primary-400"><span className="material-symbols-outlined">add_photo_alternate</span></span>
                <span className="mt-3 text-sm font-semibold text-gray-800 dark:text-gray-200">انتخاب تصاویر محصول</span><span className="mt-1 text-xs text-gray-500 dark:text-gray-400">یک یا چند فایل تصویری انتخاب کنید</span>
                <input type="file" accept=".avif,.gif,.jpeg,.jpg,.png,.svg,.webp,image/*" multiple onChange={selectImages} className="sr-only" />
              </label>
              {existingImages.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">تصاویر فعلی</h4>
                  <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {existingImages.map((image) => {
                      const isDeleted = deletedImageIds.includes(image.id);
                      return (
                        <div key={image.id} className={`relative overflow-hidden rounded-2xl border-2 bg-gray-100 dark:bg-gray-800 ${image.isMain ? "border-primary-500" : "border-transparent"} ${isDeleted ? "opacity-50" : ""}`}>
                           <img src={resolveProductImageUrl(image) ?? undefined} alt={image.name} className="aspect-square w-full object-cover" />
                            <button type="button" onClick={() => toggleExistingImageDeletion(image)} className={`absolute left-2 top-2 flex size-9 items-center justify-center rounded-lg text-white backdrop-blur-sm ${isDeleted ? "bg-green-600 hover:bg-green-700" : "bg-gray-950/70 hover:bg-red-600"}`} aria-label={isDeleted ? `نگه‌داشتن ${image.name}` : `حذف ${image.name}`}><span className="material-symbols-outlined text-[19px]">{isDeleted ? "undo" : "delete"}</span></button>
                          <span className="absolute inset-x-2 bottom-2 flex min-h-10 items-center rounded-xl bg-gray-950/75 px-3 text-xs font-medium text-white backdrop-blur-sm">{isDeleted ? "حذف خواهد شد" : image.isMain ? "تصویر اصلی" : "تصویر فعلی"}</span>
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
                      <button type="button" onClick={() => removeImage(image.id)} className="absolute left-2 top-2 flex size-9 items-center justify-center rounded-lg bg-gray-950/70 text-white backdrop-blur-sm hover:bg-red-600" aria-label={`حذف ${image.file.name}`}><span className="material-symbols-outlined text-[19px]">delete</span></button>
                      {hasRetainedMainImage ? (
                        <span className="absolute inset-x-2 bottom-2 flex min-h-10 items-center rounded-xl bg-gray-950/75 px-3 text-xs font-medium text-white backdrop-blur-sm">تصویر جدید</span>
                      ) : (
                        <label className="absolute inset-x-2 bottom-2 flex min-h-10 cursor-pointer items-center gap-2 rounded-xl bg-gray-950/75 px-3 text-xs font-medium text-white backdrop-blur-sm"><input type="radio" name="main-image" checked={mainImageId === image.id} onChange={() => setMainImageId(image.id)} className="size-4 accent-primary-600" />تصویر اصلی</label>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>

        <footer className="mt-auto flex items-center justify-between gap-3 border-t border-gray-200 bg-gray-50 px-5 py-4 dark:border-gray-800 dark:bg-gray-900 sm:px-7">
          <button type="button" onClick={step === 0 || step === 2 ? onClose : () => setStep(0)} className="min-h-11 rounded-xl px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-gray-300 dark:hover:bg-gray-800">{step === 0 || step === 2 ? "لغو" : "بازگشت"}</button>
          <div className="flex items-center gap-2">
            {step === 0 && <button type="button" onClick={() => void loadAttributes()} disabled={categoryId === null || loading} className="flex min-h-11 items-center gap-2 rounded-xl bg-primary-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-gray-900">ادامه<span className="material-symbols-outlined text-[19px]">arrow_back</span></button>}
            {step === 1 && <button type="submit" form="product-details-form" disabled={!canSubmitDetails || submitting || loading} className="flex min-h-11 items-center gap-2 rounded-xl bg-primary-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-gray-900">{(submitting || loading) && <span className="material-symbols-outlined animate-spin text-[19px]">progress_activity</span>}{submitting ? "در حال ذخیره..." : loading ? "در حال بارگذاری..." : isEditing ? "ذخیره و مدیریت تصاویر" : "ایجاد محصول"}</button>}
            {step === 2 && <button type="button" onClick={() => void finish()} disabled={!canSaveImages || uploading} className="flex min-h-11 items-center gap-2 rounded-xl bg-primary-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-gray-900">{uploading && <span className="material-symbols-outlined animate-spin text-[19px]">progress_activity</span>}{uploading ? "در حال ذخیره تصاویر..." : isEditing ? "ذخیره تغییرات تصویر" : "بارگذاری و اتمام"}</button>}
          </div>
        </footer>
      </div>

      <SellerPickerModal open={sellerModalOpen} selectedId={sellerId} onSelect={setSellerId} onClose={() => setSellerModalOpen(false)} />

      <ConfirmDialog
        open={variantConfirmIndex !== null}
        title="حذف تنوع"
        message="آیا از حذف این تنوع اطمینان دارید؟ پس از ذخیره محصول، این تنوع حذف خواهد شد."
        confirmLabel="حذف"
        onConfirm={confirmRemoveVariant}
        onCancel={() => setVariantConfirmIndex(null)}
      />
    </div>
  );
}
