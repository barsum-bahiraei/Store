"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { useAuthToken, useUserProfile } from "@/features/auth/hooks/use-account";
import type { AccountUser } from "@/features/auth/types/account";
import { isUserRole } from "@/features/auth/types/account";
import { useCart } from "@/features/cart/hooks/use-cart";
import { DeliveryMethod, PaymentMethod } from "@/features/orders/types/invoice";
import { formatToman, formatVariantLabel, getSalePrice } from "@/features/products/utils/product";
import { useCheckout } from "../hooks/use-checkout";
import { useDiscountValidation } from "../hooks/use-discount-validation";
import { PaymentStatus } from "../types/checkout";
import { CheckoutAddress } from "./checkout-address";

type UserWithAddress = AccountUser & { address: string; postalCode: string };

const paymentStatusLabels: Record<PaymentStatus, string> = {
  [PaymentStatus.New]: "جدید",
  [PaymentStatus.ProcessingPayment]: "در حال پرداخت",
  [PaymentStatus.PaymentCompleted]: "پرداخت‌شده",
  [PaymentStatus.Preparing]: "در حال آماده‌سازی",
  [PaymentStatus.ReadyForShipment]: "آماده ارسال",
  [PaymentStatus.Shipping]: "در حال ارسال",
  [PaymentStatus.Delivered]: "تحویل‌شده",
  [PaymentStatus.Cancelled]: "لغوشده",
  [PaymentStatus.Failed]: "ناموفق",
};

const paymentMethodLabels: Record<PaymentMethod, string> = {
  [PaymentMethod.Cash]: "پرداخت نقدی",
  [PaymentMethod.Online]: "پرداخت آنلاین",
  [PaymentMethod.Check]: "پرداخت با چک",
};

function formatExpirationDate(value: string | null) {
  if (!value) return "بدون تاریخ انقضا";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "تاریخ نامشخص";

  return new Intl.DateTimeFormat("fa-IR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function hasCompleteAddress(user?: AccountUser): user is UserWithAddress {
  return Boolean(user?.address?.trim())
    && Boolean(user?.postalCode?.trim());
}

export function CheckoutContent() {
  const router = useRouter();
  const token = useAuthToken();
  const profile = useUserProfile();
  const cart = useCart();
  const checkout = useCheckout();
  const discountValidation = useDiscountValidation();
  const [deliveryMethod, setDeliveryMethod] = useState(DeliveryMethod.Chapar);
  const [discountCode, setDiscountCode] = useState("");
  const [itemsError, setItemsError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) router.replace("/login");
  }, [router, token]);

  useEffect(() => {
    if (!checkout.data?.refId || !checkout.data.gatewayUrl) return;

    const form = document.createElement("form");
    form.method = "POST";
    form.action = checkout.data.gatewayUrl;
    const refId = document.createElement("input");
    refId.type = "hidden";
    refId.name = "RefId";
    refId.value = checkout.data.refId;
    form.appendChild(refId);
    document.body.appendChild(form);
    form.submit();

    return () => form.remove();
  }, [checkout.data]);

  if (!token || cart.isPending || profile.isLoading) {
    return <div role="status" className="rounded-xl border border-border bg-surface p-10 text-center"><span className="material-symbols-rounded animate-spin text-4xl text-primary motion-reduce:animate-none" aria-hidden="true">progress_activity</span><p className="mt-3 font-bold">در حال آماده‌سازی سفارش…</p></div>;
  }

  if (!isUserRole(profile.data)) {
    return <div className="rounded-xl border border-border bg-surface p-8 text-center"><span className="material-symbols-rounded text-5xl text-muted-foreground" aria-hidden="true">block</span><h1 className="mt-4 text-2xl font-black">امکان خرید فعال نیست</h1><p className="mt-2 text-muted-foreground">فقط کاربران عادی امکان ثبت سفارش دارند.</p><Link href="/" className="mt-5 inline-flex min-h-11 items-center rounded-lg bg-primary px-5 font-black text-primary-foreground">بازگشت به فروشگاه</Link></div>;
  }

  if (cart.isError) {
    return <div role="alert" className="rounded-xl border border-border bg-surface p-8 text-center"><span className="material-symbols-rounded text-4xl text-error" aria-hidden="true">shopping_cart_off</span><h1 className="mt-3 text-xl font-black">سبد خرید بارگذاری نشد</h1><p className="mt-2 text-sm text-muted-foreground">{cart.error.message}</p><button type="button" onClick={() => cart.refetch()} disabled={cart.isFetching} className="mt-5 min-h-11 rounded-lg bg-primary px-5 text-sm font-black text-primary-foreground outline-none hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50">{cart.isFetching ? "در حال تلاش…" : "تلاش دوباره"}</button></div>;
  }

  if (checkout.data) {
    return (
      <section aria-labelledby="gateway-title" className="mx-auto max-w-2xl rounded-xl border border-border bg-surface p-6 text-center sm:p-10">
        <span className="material-symbols-rounded animate-spin text-6xl text-primary motion-reduce:animate-none" aria-hidden="true">progress_activity</span>
        <h1 id="gateway-title" className="mt-4 text-2xl font-black sm:text-3xl">در حال انتقال به درگاه پرداخت</h1>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">برای پرداخت {formatToman(checkout.data.amount)} چند لحظه منتظر بمانید.</p>
        <p className="mt-5 text-xs text-muted-foreground">وضعیت فعلی: {paymentStatusLabels[checkout.data.paymentStatus] ?? "نامشخص"}</p>
      </section>
    );
  }

  const items = cart.data ?? [];
  if (items.length === 0) {
    return <div className="rounded-xl border border-border bg-surface p-8 text-center"><span className="material-symbols-rounded text-5xl text-muted-foreground" aria-hidden="true">remove_shopping_cart</span><h1 className="mt-4 text-2xl font-black">سبد خرید خالی است</h1><p className="mt-2 text-muted-foreground">برای ثبت سفارش ابتدا محصولی به سبد اضافه کنید.</p><Link href="/shop" className="mt-5 inline-flex min-h-11 items-center rounded-lg bg-primary px-5 font-black text-primary-foreground">مشاهده محصولات</Link></div>;
  }

  const estimatedSubtotal = items.reduce((total, item) => total + getSalePrice(item.variant?.price ?? item.product.price, item.product.discount) * item.productCount, 0);
  const normalizedDiscountCode = discountCode.trim();
  const validatedDiscount = discountValidation.data;
  const isValidatedCode = Boolean(validatedDiscount && validatedDiscount.code.toLocaleLowerCase("en-US") === normalizedDiscountCode.toLocaleLowerCase("en-US"));
  const meetsMinimumPurchase = !validatedDiscount || estimatedSubtotal >= validatedDiscount.minimumPurchaseAmount;
  const supportsPaymentMethod = !validatedDiscount || validatedDiscount.paymentMethod === null || validatedDiscount.paymentMethod === PaymentMethod.Online;
  const canApplyDiscount = isValidatedCode && meetsMinimumPurchase && supportsPaymentMethod;
  const discountAmount = canApplyDiscount ? Math.min(validatedDiscount!.discountAmount, estimatedSubtotal) : 0;
  const finalAmount = Math.max(0, estimatedSubtotal - discountAmount);
  const needsAddress = deliveryMethod !== DeliveryMethod.Pickup;
  const userWithAddress = hasCompleteAddress(profile.data) ? profile.data : null;
  const discountNeedsValidation = Boolean(normalizedDiscountCode) && !isValidatedCode;
  const submitDisabled = checkout.isPending || discountValidation.isPending || discountNeedsValidation || (isValidatedCode && !canApplyDiscount) || (needsAddress && !userWithAddress);

  function handleDiscountCodeChange(value: string) {
    setDiscountCode(value);
    setItemsError(null);
    if (discountValidation.data || discountValidation.error) discountValidation.reset();
  }

  function handleDiscountValidation() {
    if (!normalizedDiscountCode || discountValidation.isPending) return;
    setItemsError(null);
    discountValidation.mutate({ discountCode: normalizedDiscountCode });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitDisabled) return;
    if (items.some((item) => !Number.isSafeInteger(item.productVariantId) || item.productVariantId <= 0)) {
      setItemsError("برخی اقلام سبد خرید فاقد تنوع معتبر هستند. لطفاً سبد را بررسی کنید.");
      return;
    }
    setItemsError(null);
    checkout.mutate({
      paymentMethod: PaymentMethod.Online,
      deliveryMethod,
      discountCode: normalizedDiscountCode || null,
    });
  }

  const optionClass = "flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 has-checked:border-primary has-checked:bg-primary/10 has-focus-visible:ring-2 has-focus-visible:ring-ring";

  return (
    <form onSubmit={handleSubmit} className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="space-y-6">
        <header><h1 className="text-3xl font-black sm:text-4xl">ثبت سفارش</h1></header>

        <fieldset className="rounded-xl border border-border bg-surface p-5 sm:p-6">
          <legend className="px-2 text-lg font-black">روش تحویل</legend>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            {([
              { value: DeliveryMethod.Pickup, label: "تحویل حضوری", hint: "دریافت مستقیم از فروشگاه" },
              { value: DeliveryMethod.Chapar, label: "ارسال با چاپار", hint: "تحویل در نشانی پروفایل" },
              { value: DeliveryMethod.Tipax, label: "ارسال با تیپاکس", hint: "تحویل در نشانی پروفایل" },
              { value: DeliveryMethod.Post, label: "ارسال با پست", hint: "تحویل در نشانی پروفایل" },
            ] as const).map((method) => (
              <label key={method.value} className={optionClass}>
                <input type="radio" name="deliveryMethod" value={method.value} checked={deliveryMethod === method.value} onChange={() => setDeliveryMethod(method.value)} className="size-4 accent-primary" />
                <span><span className="block font-black">{method.label}</span><span className="text-xs text-muted-foreground">{method.hint}</span></span>
              </label>
            ))}
          </div>
        </fieldset>

        {needsAddress && (profile.isError ? <div role="alert" className="rounded-xl border border-border bg-surface p-5"><div className="flex gap-3"><span className="material-symbols-rounded text-error" aria-hidden="true">location_off</span><div><h2 className="font-black">اطلاعات نشانی بارگذاری نشد</h2><p className="mt-1 text-sm text-muted-foreground">{profile.error.message}</p><button type="button" onClick={() => profile.refetch()} disabled={profile.isFetching} className="mt-3 min-h-11 rounded-lg px-3 text-sm font-black text-primary outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50">{profile.isFetching ? "در حال تلاش…" : "تلاش دوباره"}</button></div></div></div> : userWithAddress ? <CheckoutAddress user={userWithAddress} /> : <div role="alert" className="rounded-xl border border-warning bg-warning/10 p-5"><div className="flex gap-3"><span className="material-symbols-rounded text-warning" aria-hidden="true">location_off</span><div><h2 className="font-black">نشانی تحویل کامل نیست</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">برای ارسال سفارش، نشانی و کد پستی خود را در پروفایل تکمیل کنید.</p><Link href="/account?tab=profile&returnTo=%2Fcheckout" className="mt-3 inline-flex min-h-11 items-center font-black text-primary outline-none focus-visible:ring-2 focus-visible:ring-ring">تکمیل نشانی</Link></div></div></div>)}

        <fieldset className="rounded-xl border border-border bg-surface p-5 sm:p-6">
          <legend className="px-2 text-lg font-black">روش پرداخت</legend>
          <div className="mt-2">
            <label className={optionClass}><input type="radio" name="paymentMethod" value={PaymentMethod.Online} checked readOnly className="size-4 accent-primary" /><span className="material-symbols-rounded text-primary" aria-hidden="true">credit_card</span><span><span className="block font-black">پرداخت آنلاین</span><span className="text-xs text-muted-foreground">درگاه امن به‌پرداخت ملت</span></span></label>
          </div>
        </fieldset>
      </div>

      <aside className="rounded-xl border border-border bg-surface p-5 lg:sticky lg:top-6">
        <h2 className="text-xl font-black">خلاصه سفارش</h2>
        <ul className="mt-4 divide-y divide-border">
          {items.map((item) => {
            const unitPrice = getSalePrice(item.variant?.price ?? item.product.price, item.product.discount);
            const variantLabel = formatVariantLabel(item.variant?.values ?? []);
            return (
              <li key={item.id} className="flex justify-between gap-4 py-3 text-sm">
                <span className="min-w-0 break-words font-bold">{item.product.name}{variantLabel ? <span className="block text-xs font-normal text-muted-foreground">{variantLabel}</span> : null}<span className="mt-1 block text-xs font-normal text-muted-foreground">تعداد: {item.productCount.toLocaleString("fa-IR")} عدد</span></span>
                <span className="shrink-0 font-black">{formatToman(unitPrice * item.productCount)}</span>
              </li>
            );
          })}
        </ul>
        <div className="mt-4 border-t border-border pt-4">
          <label htmlFor="discount-code" className="text-sm font-black">کد تخفیف</label>
          <div className="mt-2 flex gap-2">
            <input id="discount-code" value={discountCode} onChange={(event) => handleDiscountCodeChange(event.target.value)} disabled={checkout.isPending || discountValidation.isPending} autoComplete="off" dir="ltr" className="min-h-11 min-w-0 flex-1 rounded-lg border border-border bg-background px-3 text-left outline-none focus:border-primary focus:ring-2 focus:ring-ring disabled:opacity-60" placeholder="OFF200" />
            <button type="button" onClick={handleDiscountValidation} disabled={!normalizedDiscountCode || checkout.isPending || discountValidation.isPending} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-primary px-3 text-sm font-black text-primary outline-none transition-colors hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
              {discountValidation.isPending && <span className="material-symbols-rounded animate-spin text-lg motion-reduce:animate-none" aria-hidden="true">progress_activity</span>}
              {discountValidation.isPending ? "در حال اعمال" : "اعمال"}
            </button>
          </div>

          {discountValidation.isError && <p role="alert" className="mt-3 rounded-lg bg-error/10 p-3 text-sm font-bold text-error">{discountValidation.error.message}</p>}
          {isValidatedCode && validatedDiscount && (
            <div className={`mt-3 rounded-lg border p-3 text-sm ${canApplyDiscount ? "border-primary/35 bg-primary/10" : "border-warning bg-warning/10"}`}>
              <p className={`font-black ${canApplyDiscount ? "text-primary" : "text-warning"}`}>{canApplyDiscount ? "کد تخفیف با موفقیت اعمال شد." : "این کد برای سفارش فعلی قابل استفاده نیست."}</p>
              <dl className="mt-2 space-y-1.5 text-xs leading-6 text-muted-foreground">
                <div className="flex justify-between gap-3"><dt>مبلغ تخفیف</dt><dd className="font-bold text-foreground">{formatToman(validatedDiscount.discountAmount)}</dd></div>
                <div className="flex justify-between gap-3"><dt>حداقل خرید</dt><dd className="font-bold text-foreground">{formatToman(validatedDiscount.minimumPurchaseAmount)}</dd></div>
                <div className="flex justify-between gap-3"><dt>روش پرداخت مجاز</dt><dd className="font-bold text-foreground">{validatedDiscount.paymentMethod === null ? "بدون محدودیت" : paymentMethodLabels[validatedDiscount.paymentMethod] ?? "نامشخص"}</dd></div>
                <div className="flex justify-between gap-3"><dt>اعتبار تا</dt><dd className="text-left font-bold text-foreground">{formatExpirationDate(validatedDiscount.expireAt)}</dd></div>
              </dl>
              {!meetsMinimumPurchase && <p className="mt-2 text-xs font-bold text-warning">مبلغ سفارش به حداقل خرید لازم نرسیده است.</p>}
              {!supportsPaymentMethod && <p className="mt-2 text-xs font-bold text-warning">این کد برای پرداخت آنلاین قابل استفاده نیست.</p>}
            </div>
          )}
        </div>
        <dl className="mt-5 space-y-3 border-t border-border pt-4">
          {canApplyDiscount && <><div className="flex items-center justify-between gap-4 text-sm"><dt className="text-muted-foreground">جمع سفارش</dt><dd className="font-bold">{formatToman(estimatedSubtotal)}</dd></div><div className="flex items-center justify-between gap-4 text-sm"><dt className="text-muted-foreground">تخفیف</dt><dd className="font-black text-primary">− {formatToman(discountAmount)}</dd></div></>}
          <div className="flex items-center justify-between gap-4"><dt className="font-bold">مبلغ نهایی</dt><dd className="text-lg font-black text-primary">{formatToman(finalAmount)}</dd></div>
        </dl>
        {(itemsError || checkout.error) && <p role="alert" className="mt-4 rounded-lg bg-error/10 p-3 text-sm font-bold text-error">{itemsError ?? checkout.error?.message}</p>}
        {discountNeedsValidation && <p className="mt-3 text-xs font-bold text-warning">برای استفاده از کد تخفیف، ابتدا آن را بررسی کنید.</p>}
        <button type="submit" disabled={submitDisabled} className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 font-black text-primary-foreground outline-none hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"><span className={`material-symbols-rounded ${checkout.isPending ? "animate-spin motion-reduce:animate-none" : ""}`} aria-hidden="true">{checkout.isPending ? "progress_activity" : "receipt_long"}</span>{checkout.isPending ? "در حال ثبت سفارش…" : "ثبت نهایی سفارش"}</button>
      </aside>
    </form>
  );
}
