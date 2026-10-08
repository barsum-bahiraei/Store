"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useUpdateUserProfile } from "../hooks/use-account";
import type { AccountUser, Gender } from "../types/account";
import { LocationPicker } from "./location-picker";

type ProfileEditFormProps = {
  user: AccountUser;
  returnTo?: "/checkout";
  onSaved?: () => void;
};

const inputClassName = "mt-2 h-12 w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-60";

export function ProfileEditForm({ user, returnTo, onSaved }: ProfileEditFormProps) {
  const router = useRouter();
  const updateProfile = useUpdateUserProfile();
  const [form, setForm] = useState({
    firstName: user.firstName ?? "",
    lastName: user.lastName ?? "",
    email: user.email ?? "",
    address: user.address ?? "",
    postalCode: user.postalCode ?? "",
    latitude: user.latitude?.toString() ?? "",
    longitude: user.longitude?.toString() ?? "",
    gender: user.gender,
    nationalCode: user.nationalCode ?? "",
    birthDate: user.birthDate && /^\d{4}-\d{2}-\d{2}/.test(user.birthDate) ? user.birthDate.slice(0, 10) : "",
  });
  const [error, setError] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const latitude = Number(form.latitude);
  const longitude = Number(form.longitude);
  const hasValidLocation = Number.isFinite(latitude) && Number.isFinite(longitude)
    && latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180
    && form.latitude !== "" && form.longitude !== "";
  const mapLocation = hasValidLocation ? { latitude, longitude } : { latitude: 35.6892, longitude: 51.389 };

  function showError(message: string) {
    setError(message);
    requestAnimationFrame(() => {
      errorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      errorRef.current?.focus({ preventScroll: true });
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSaved(false);

    if (!form.firstName.trim() || !form.lastName.trim() || !form.address.trim() || !form.postalCode.trim()) {
      showError("لطفاً موارد اجباری را تکمیل کنید.");
      return;
    }
    if (!hasValidLocation) {
      showError("لطفاً موقعیت دقیق تحویل را روی نقشه انتخاب کنید.");
      return;
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      showError("ایمیل واردشده معتبر نیست.");
      return;
    }
    if (form.nationalCode && !/^\d{10}$/.test(form.nationalCode)) {
      showError("کد ملی باید ۱۰ رقم باشد.");
      return;
    }
    if (!/^\d{10}$/.test(form.postalCode)) {
      showError("کد پستی باید ۱۰ رقم باشد.");
      return;
    }

    try {
      await updateProfile.mutateAsync({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim() || null,
        address: form.address.trim(),
        postalCode: form.postalCode,
        latitude,
        longitude,
        gender: form.gender,
        nationalCode: form.nationalCode || null,
        birthDate: form.birthDate || null,
      });
      setIsSaved(true);
      if (returnTo) {
        router.push(returnTo);
      } else {
        onSaved?.();
      }
    } catch (caughtError) {
      showError(caughtError instanceof Error ? caughtError.message : "ویرایش پروفایل انجام نشد.");
    }
  }

  return (
    <div className="p-5 sm:p-7">
      <div className="mb-6">
        <h2 id="edit-profile-title" className="text-xl font-black">ویرایش اطلاعات پروفایل</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">نام، نشانی و کد پستی خود را ویرایش کنید و نقطه دقیق تحویل را روی نقشه انتخاب کنید.</p>
      </div>
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {error && <p ref={errorRef} tabIndex={-1} role="alert" className="scroll-mt-40 flex items-start gap-2 rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm font-bold text-error outline-none focus-visible:ring-2 focus-visible:ring-error"><span className="material-symbols-rounded text-lg" aria-hidden="true">error</span>{error}</p>}
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="profile-first-name" className="inline-flex items-center gap-1 text-sm font-bold">نام <span className="text-error" aria-hidden="true">*</span><span className="sr-only">(الزامی)</span></label>
            <input id="profile-first-name" required value={form.firstName} onChange={(event) => setForm((current) => ({ ...current, firstName: event.target.value }))} disabled={updateProfile.isPending} maxLength={100} autoComplete="given-name" placeholder="نام خود را وارد کنید" className={inputClassName} />
          </div>
          <div>
            <label htmlFor="profile-last-name" className="inline-flex items-center gap-1 text-sm font-bold">نام خانوادگی <span className="text-error" aria-hidden="true">*</span><span className="sr-only">(الزامی)</span></label>
            <input id="profile-last-name" required value={form.lastName} onChange={(event) => setForm((current) => ({ ...current, lastName: event.target.value }))} disabled={updateProfile.isPending} maxLength={100} autoComplete="family-name" placeholder="نام خانوادگی خود را وارد کنید" className={inputClassName} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="profile-email" className="text-sm font-bold">ایمیل</label>
            <input id="profile-email" type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} disabled={updateProfile.isPending} dir="ltr" placeholder="example@email.com" className={inputClassName} />
          </div>
          <fieldset>
            <legend className="text-sm font-bold">جنسیت</legend>
            <div className="mt-2 grid grid-cols-2 gap-3">
              {([0, 1] as const satisfies readonly Gender[]).map((gender) => (
                <label key={gender} className={`flex min-h-12 cursor-pointer items-center gap-2 rounded-xl border px-4 text-sm font-bold transition-colors ${form.gender === gender ? "border-primary bg-primary/10 text-primary" : "border-border bg-surface hover:bg-muted"}`}>
                  <input type="radio" name="profile-gender" value={gender} checked={form.gender === gender} onChange={() => setForm((current) => ({ ...current, gender }))} disabled={updateProfile.isPending} className="size-4 accent-primary" />
                  {gender === 0 ? "مرد" : "زن"}
                </label>
              ))}
            </div>
          </fieldset>
          <div>
            <label htmlFor="profile-national-code" className="text-sm font-bold">کد ملی</label>
            <input id="profile-national-code" inputMode="numeric" maxLength={10} value={form.nationalCode} onChange={(event) => setForm((current) => ({ ...current, nationalCode: event.target.value.replace(/\D/g, "") }))} disabled={updateProfile.isPending} dir="ltr" className={inputClassName} />
          </div>
          <div>
            <label htmlFor="profile-birth-date" className="text-sm font-bold">تاریخ تولد</label>
            <input id="profile-birth-date" type="date" value={form.birthDate} onChange={(event) => setForm((current) => ({ ...current, birthDate: event.target.value }))} disabled={updateProfile.isPending} className={inputClassName} />
          </div>
          <div>
            <label htmlFor="profile-postal-code" className="inline-flex items-center gap-1 text-sm font-bold">کد پستی <span className="text-error" aria-hidden="true">*</span><span className="sr-only">(الزامی)</span></label>
            <input id="profile-postal-code" required inputMode="numeric" maxLength={10} autoComplete="postal-code" value={form.postalCode} onChange={(event) => setForm((current) => ({ ...current, postalCode: event.target.value.replace(/\D/g, "") }))} disabled={updateProfile.isPending} dir="ltr" placeholder="کد پستی ۱۰ رقمی" className={inputClassName} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="profile-address" className="inline-flex items-center gap-1 text-sm font-bold">نشانی کامل <span className="text-error" aria-hidden="true">*</span><span className="sr-only">(الزامی)</span></label>
            <textarea id="profile-address" required rows={3} value={form.address} onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))} disabled={updateProfile.isPending} placeholder="استان، شهر، خیابان، کوچه و پلاک" className="mt-2 w-full resize-y rounded-xl border border-border bg-surface px-4 py-3 text-sm leading-7 outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-60" />
          </div>
        </div>

        <LocationPicker value={mapLocation} onChange={(location) => setForm((current) => ({ ...current, latitude: location.latitude.toFixed(6), longitude: location.longitude.toFixed(6) }))} />

        {isSaved && <p role="status" className="flex items-start gap-2 rounded-xl bg-muted px-4 py-3 text-sm font-bold text-success"><span className="material-symbols-rounded text-lg" aria-hidden="true">check_circle</span>اطلاعات پروفایل ذخیره شد.</p>}

        <button type="submit" disabled={updateProfile.isPending} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 font-black text-primary-foreground outline-none transition-colors hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60">
          {updateProfile.isPending && <span className="material-symbols-rounded animate-spin" aria-hidden="true">progress_activity</span>}
          {updateProfile.isPending ? "در حال ذخیره…" : returnTo ? "ذخیره و ادامه خرید" : "ذخیره تغییرات"}
        </button>
      </form>
    </div>
  );
}
