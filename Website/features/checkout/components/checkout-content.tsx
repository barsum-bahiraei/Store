"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { useAuthToken, useUserProfile } from "@/features/auth/hooks/use-account";
import type { AccountUser } from "@/features/auth/types/account";
import { isUserRole } from "@/features/auth/types/account";
import { useCart } from "@/features/cart/hooks/use-cart";
import { DeliveryMethod, PaymentMethod } from "@/features/orders/types/invoice";
import { formatToman, getSalePrice } from "@/features/products/utils/product";
import { useCheckout } from "../hooks/use-checkout";
import { PaymentStatus } from "../types/checkout";
import { CheckoutAddress } from "./checkout-address";

type UserWithAddress = AccountUser & { address: string; latitude: number; longitude: number };

const paymentStatusLabels: Record<PaymentStatus, string> = {
  [PaymentStatus.New]: "جدید",
  [PaymentStatus.Processing]: "در حال پردازش",
  [PaymentStatus.Completed]: "تکمیل‌شده",
  [PaymentStatus.Failed]: "ناموفق",
  [PaymentStatus.Cancelled]: "لغوشده",
};

function hasCompleteAddress(user?: AccountUser): user is UserWithAddress {
  return Boolean(user?.address?.trim())
    && Number.isFinite(user?.latitude)
    && Number.isFinite(user?.longitude)
    && user!.latitude! >= -90 && user!.latitude! <= 90
    && user!.longitude! >= -180 && user!.longitude! <= 180;
}

export function CheckoutContent() {
  const router = useRouter();
  const token = useAuthToken();
  const profile = useUserProfile();
  const cart = useCart();
  const checkout = useCheckout();
  const [deliveryMethod, setDeliveryMethod] = useState(DeliveryMethod.Delivery);
  const [paymentMethod, setPaymentMethod] = useState(PaymentMethod.Online);
  const [discountCode, setDiscountCode] = useState("");

  useEffect(() => {
    if (!token) router.replace("/login");
  }, [router, token]);

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
      <section aria-labelledby="checkout-success-title" className="mx-auto max-w-2xl rounded-xl border border-border bg-surface p-6 text-center sm:p-10">
        <span className="material-symbols-rounded text-6xl text-success" aria-hidden="true">check_circle</span>
        <h1 id="checkout-success-title" className="mt-4 text-2xl font-black sm:text-3xl">سفارش ثبت شد</h1>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">سفارش ایجاد شده و پرداخت آن هنوز در وضعیت اولیه است. درگاه پرداخت در حال حاضر فعال نیست.</p>
        <dl className="mt-7 grid gap-4 rounded-xl bg-muted p-5 text-right sm:grid-cols-3">
          <div><dt className="text-xs font-bold text-muted-foreground">شماره سفارش</dt><dd className="mt-1 font-black">{checkout.data.invoiceId.toLocaleString("fa-IR")}</dd></div>
          <div><dt className="text-xs font-bold text-muted-foreground">مبلغ قطعی</dt><dd className="mt-1 font-black text-primary">{formatToman(checkout.data.amount)}</dd></div>
          <div><dt className="text-xs font-bold text-muted-foreground">وضعیت پرداخت</dt><dd className="mt-1 font-black">{paymentStatusLabels[checkout.data.paymentStatus] ?? "نامشخص"}</dd></div>
        </dl>
        <Link href="/account?tab=orders" className="mt-7 inline-flex min-h-11 items-center rounded-lg bg-primary px-5 text-sm font-black text-primary-foreground outline-none hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-ring">مشاهده سفارش‌ها</Link>
      </section>
    );
  }

  const items = cart.data ?? [];
  if (items.length === 0) {
    return <div className="rounded-xl border border-border bg-surface p-8 text-center"><span className="material-symbols-rounded text-5xl text-muted-foreground" aria-hidden="true">remove_shopping_cart</span><h1 className="mt-4 text-2xl font-black">سبد خرید خالی است</h1><p className="mt-2 text-muted-foreground">برای ثبت سفارش ابتدا محصولی به سبد اضافه کنید.</p><Link href="/search" className="mt-5 inline-flex min-h-11 items-center rounded-lg bg-primary px-5 font-black text-primary-foreground">مشاهده محصولات</Link></div>;
  }

  const estimatedSubtotal = items.reduce((total, item) => total + getSalePrice(item.product.price, item.product.discount) * item.productCount, 0);
  const needsAddress = deliveryMethod === DeliveryMethod.Delivery;
  const userWithAddress = hasCompleteAddress(profile.data) ? profile.data : null;
  const submitDisabled = checkout.isPending || (needsAddress && !userWithAddress);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitDisabled) return;
    const normalizedDiscountCode = discountCode.trim();
    checkout.mutate({
      paymentMethod,
      deliveryMethod,
      discountCode: normalizedDiscountCode || null,
    });
  }

  const optionClass = "flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 has-checked:border-primary has-checked:bg-primary/10 has-focus-visible:ring-2 has-focus-visible:ring-ring";

  return (
    <form onSubmit={handleSubmit} className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="space-y-6">
        <header><p className="text-sm font-black text-primary">مرحله نهایی خرید</p><h1 className="mt-2 text-3xl font-black sm:text-4xl">ثبت سفارش</h1><p className="mt-2 text-sm text-muted-foreground">روش تحویل و پرداخت را بررسی کنید؛ مبلغ قطعی پس از ثبت توسط سرور محاسبه می‌شود.</p></header>

        <fieldset className="rounded-xl border border-border bg-surface p-5 sm:p-6">
          <legend className="px-2 text-lg font-black">روش تحویل</legend>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            <label className={optionClass}><input type="radio" name="deliveryMethod" value={DeliveryMethod.Delivery} checked={deliveryMethod === DeliveryMethod.Delivery} onChange={() => setDeliveryMethod(DeliveryMethod.Delivery)} className="size-4 accent-primary" /><span><span className="block font-black">ارسال به نشانی</span><span className="text-xs text-muted-foreground">تحویل در نشانی پروفایل</span></span></label>
            <label className={optionClass}><input type="radio" name="deliveryMethod" value={DeliveryMethod.Pickup} checked={deliveryMethod === DeliveryMethod.Pickup} onChange={() => setDeliveryMethod(DeliveryMethod.Pickup)} className="size-4 accent-primary" /><span><span className="block font-black">تحویل حضوری</span><span className="text-xs text-muted-foreground">دریافت مستقیم از فروشگاه</span></span></label>
          </div>
        </fieldset>

        {needsAddress && (profile.isError ? <div role="alert" className="rounded-xl border border-border bg-surface p-5"><div className="flex gap-3"><span className="material-symbols-rounded text-error" aria-hidden="true">location_off</span><div><h2 className="font-black">اطلاعات نشانی بارگذاری نشد</h2><p className="mt-1 text-sm text-muted-foreground">{profile.error.message}</p><button type="button" onClick={() => profile.refetch()} disabled={profile.isFetching} className="mt-3 min-h-11 rounded-lg px-3 text-sm font-black text-primary outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50">{profile.isFetching ? "در حال تلاش…" : "تلاش دوباره"}</button></div></div></div> : userWithAddress ? <CheckoutAddress user={userWithAddress} /> : <div role="alert" className="rounded-xl border border-warning bg-warning/10 p-5"><div className="flex gap-3"><span className="material-symbols-rounded text-warning" aria-hidden="true">location_off</span><div><h2 className="font-black">نشانی تحویل کامل نیست</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">برای ارسال سفارش، نشانی و موقعیت مکانی خود را در پروفایل تکمیل کنید.</p><Link href="/account?tab=profile&returnTo=%2Fcheckout" className="mt-3 inline-flex min-h-11 items-center font-black text-primary outline-none focus-visible:ring-2 focus-visible:ring-ring">تکمیل نشانی</Link></div></div></div>)}

        <fieldset className="rounded-xl border border-border bg-surface p-5 sm:p-6">
          <legend className="px-2 text-lg font-black">روش پرداخت</legend>
          <div className="mt-2 grid gap-3 sm:grid-cols-3">
            {([{ value: PaymentMethod.Online, label: "آنلاین", icon: "credit_card" }, { value: PaymentMethod.Cash, label: "نقدی", icon: "payments" }, { value: PaymentMethod.Check, label: "چک", icon: "account_balance" }] as const).map((method) => <label key={method.value} className={optionClass}><input type="radio" name="paymentMethod" value={method.value} checked={paymentMethod === method.value} onChange={() => setPaymentMethod(method.value)} className="size-4 accent-primary" /><span className="material-symbols-rounded text-primary" aria-hidden="true">{method.icon}</span><span className="font-black">{method.label}</span></label>)}
          </div>
        </fieldset>
      </div>

      <aside className="rounded-xl border border-border bg-surface p-5 lg:sticky lg:top-6">
        <h2 className="text-xl font-black">خلاصه سفارش</h2>
        <ul className="mt-4 divide-y divide-border">
          {items.map((item) => <li key={item.id} className="flex justify-between gap-4 py-3 text-sm"><span className="min-w-0 break-words font-bold">{item.product.name} <span className="text-muted-foreground">× {item.productCount.toLocaleString("fa-IR")}</span></span><span className="shrink-0 font-black">{formatToman(getSalePrice(item.product.price, item.product.discount) * item.productCount)}</span></li>)}
        </ul>
        <div className="mt-4 border-t border-border pt-4"><label htmlFor="discount-code" className="text-sm font-black">کد تخفیف <span className="font-normal text-muted-foreground">(اختیاری)</span></label><input id="discount-code" value={discountCode} onChange={(event) => setDiscountCode(event.target.value)} disabled={checkout.isPending} autoComplete="off" className="mt-2 min-h-11 w-full rounded-lg border border-border bg-background px-3 outline-none focus:border-primary focus:ring-2 focus:ring-ring disabled:opacity-60" placeholder="کد را وارد کنید" /><p className="mt-2 text-xs leading-5 text-muted-foreground">کد هنگام ثبت نهایی توسط سرور بررسی می‌شود.</p></div>
        <dl className="mt-5 border-t border-border pt-4"><div className="flex items-center justify-between gap-4"><dt className="font-bold">مبلغ تخمینی</dt><dd className="text-lg font-black text-primary">{formatToman(estimatedSubtotal)}</dd></div></dl>
        <p className="mt-2 text-xs leading-5 text-muted-foreground">این مبلغ تخمینی است؛ مبلغ قطعی فقط از پاسخ ثبت سفارش دریافت می‌شود.</p>
        {checkout.error && <p role="alert" className="mt-4 rounded-lg bg-error/10 p-3 text-sm font-bold text-error">{checkout.error.message}</p>}
        <button type="submit" disabled={submitDisabled} className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 font-black text-primary-foreground outline-none hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"><span className={`material-symbols-rounded ${checkout.isPending ? "animate-spin motion-reduce:animate-none" : ""}`} aria-hidden="true">{checkout.isPending ? "progress_activity" : "receipt_long"}</span>{checkout.isPending ? "در حال ثبت سفارش…" : "ثبت نهایی سفارش"}</button>
      </aside>
    </form>
  );
}
