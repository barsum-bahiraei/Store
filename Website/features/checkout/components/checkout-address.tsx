"use client";

import Link from "next/link";
import { LocationPicker } from "@/features/auth/components/location-picker";
import type { AccountUser } from "@/features/auth/types/account";

type UserWithAddress = AccountUser & { address: string; latitude: number; longitude: number };

export function CheckoutAddress({ user }: { user: UserWithAddress }) {
  return (
    <section aria-labelledby="delivery-address-title" className="overflow-hidden rounded-xl border border-border bg-surface">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border p-5 sm:p-7">
        <div>
          <p className="text-xs font-black tracking-wider text-primary">اطلاعات تحویل</p>
          <h2 id="delivery-address-title" className="mt-2 text-xl font-black sm:text-2xl">نشانی سفارش</h2>
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
