"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LocationPicker } from "@/features/auth/components/location-picker";
import { useAuthToken, useUserProfile } from "@/features/auth/hooks/use-account";
import type { AccountUser } from "@/features/auth/types/account";

type UserWithAddress = AccountUser & { address: string; latitude: number; longitude: number };

function hasCompleteAddress(user?: AccountUser): user is UserWithAddress {
  return Boolean(user?.address?.trim()) && user?.latitude != null && user.longitude != null;
}

export function CheckoutAddress() {
  const router = useRouter();
  const token = useAuthToken();
  const { data: user, isLoading, isError, error, refetch, isFetching } = useUserProfile();
  const isAddressComplete = hasCompleteAddress(user);

  useEffect(() => {
    if (!token) {
      router.replace("/login");
    } else if (!isLoading && user && !isAddressComplete) {
      router.replace("/account?tab=profile&returnTo=%2Fcheckout");
    }
  }, [isAddressComplete, isLoading, router, token, user]);

  if (!token || isLoading || (user && !isAddressComplete)) {
    return (
      <div role="status" className="rounded-2xl border border-border bg-surface p-8 text-center">
        <span className="material-symbols-rounded animate-spin text-4xl text-primary motion-reduce:animate-none" aria-hidden="true">progress_activity</span>
        <p className="mt-3 font-bold">در حال آماده‌سازی اطلاعات تحویل…</p>
      </div>
    );
  }

  if (isError || !hasCompleteAddress(user)) {
    return (
      <div role="alert" className="rounded-2xl border border-border bg-surface p-8 text-center">
        <span className="material-symbols-rounded text-4xl text-error" aria-hidden="true">location_off</span>
        <p className="mt-3 font-black">اطلاعات نشانی بارگذاری نشد</p>
        <p className="mt-2 text-sm text-muted-foreground">{error?.message ?? "لطفاً دوباره تلاش کنید."}</p>
        <button type="button" onClick={() => refetch()} disabled={isFetching} className="mt-5 min-h-11 rounded-lg bg-primary px-5 text-sm font-black text-primary-foreground outline-none hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50">
          {isFetching ? "در حال تلاش…" : "تلاش دوباره"}
        </button>
      </div>
    );
  }

  return (
    <section aria-labelledby="delivery-address-title" className="overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border p-5 sm:p-7">
        <div>
          <p className="text-xs font-black tracking-wider text-primary">اطلاعات تحویل</p>
          <h1 id="delivery-address-title" className="mt-2 text-2xl font-black sm:text-3xl">نشانی سفارش</h1>
        </div>
        <Link href="/account?tab=profile&returnTo=%2Fcheckout" className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border px-4 text-sm font-bold outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring">
          <span className="material-symbols-rounded text-xl text-primary" aria-hidden="true">edit_location_alt</span>
          ویرایش نشانی
        </Link>
      </div>
      <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-start">
        <div>
          <div className="flex gap-3">
            <span className="material-symbols-rounded mt-0.5 text-primary" aria-hidden="true">location_on</span>
            <div>
              <h2 className="text-sm font-black">نشانی ثبت‌شده</h2>
              <p className="mt-2 text-sm font-bold leading-7 text-muted-foreground">{user.address}</p>
            </div>
          </div>
          <dl className="mt-6 grid grid-cols-2 gap-3 border-t border-border pt-5 text-xs">
            <div><dt className="font-bold text-muted-foreground">عرض جغرافیایی</dt><dd className="mt-1 font-black" dir="ltr">{user.latitude}</dd></div>
            <div><dt className="font-bold text-muted-foreground">طول جغرافیایی</dt><dd className="mt-1 font-black" dir="ltr">{user.longitude}</dd></div>
          </dl>
        </div>
        <LocationPicker value={{ latitude: user.latitude, longitude: user.longitude }} />
      </div>
    </section>
  );
}
