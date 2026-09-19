"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useUpdateUserProfile } from "../hooks/use-account";
import type { AccountUser, Gender } from "../types/account";
import { LocationPicker } from "./location-picker";

type ProfileEditFormProps = {
  user: AccountUser;
  returnTo?: "/checkout";
};

const inputClassName = "mt-2 h-12 w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-60";

export function ProfileEditForm({ user, returnTo }: ProfileEditFormProps) {
  const router = useRouter();
  const updateProfile = useUpdateUserProfile();
  const [form, setForm] = useState({
    email: user.email ?? "",
    address: user.address ?? "",
    latitude: user.latitude?.toString() ?? "",
    longitude: user.longitude?.toString() ?? "",
    gender: user.gender,
    nationalCode: user.nationalCode ?? "",
    birthDate: user.birthDate && /^\d{4}-\d{2}-\d{2}/.test(user.birthDate) ? user.birthDate.slice(0, 10) : "",
  });
  const [error, setError] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const latitude = Number(form.latitude);
  const longitude = Number(form.longitude);
  const hasValidLocation = Number.isFinite(latitude) && Number.isFinite(longitude)
    && latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180
    && form.latitude !== "" && form.longitude !== "";
  const mapLocation = hasValidLocation ? { latitude, longitude } : { latitude: 35.6892, longitude: 51.389 };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSaved(false);

    if (!form.address.trim() || !hasValidLocation) {
      setError("نشانی و موقعیت دقیق آن روی نقشه الزامی است.");
      return;
    }
    if (form.nationalCode && !/^\d{10}$/.test(form.nationalCode)) {
      setError("کد ملی باید ۱۰ رقم باشد.");
      return;
    }

    try {
      await updateProfile.mutateAsync({
        email: form.email.trim() || null,
        address: form.address.trim(),
        latitude,
        longitude,
        gender: form.gender,
        nationalCode: form.nationalCode || null,
        birthDate: form.birthDate || null,
      });
      setIsSaved(true);
      if (returnTo) router.push(returnTo);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "ویرایش پروفایل انجام نشد.");
    }
  }

  return (
    <section aria-labelledby="edit-profile-title" className="rounded-2xl border border-border bg-surface p-5 sm:p-7">
      <div className="mb-6">
        <h2 id="edit-profile-title" className="text-xl font-black">ویرایش اطلاعات تکمیلی</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">نشانی را وارد کنید و نقطه دقیق تحویل را روی نقشه انتخاب کنید.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="profile-email" className="text-sm font-bold">ایمیل</label>
            <input id="profile-email" type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} disabled={updateProfile.isPending} dir="ltr" placeholder="example@email.com" className={inputClassName} />
          </div>
          <div>
            <label htmlFor="profile-gender" className="text-sm font-bold">جنسیت</label>
            <select id="profile-gender" value={form.gender} onChange={(event) => setForm((current) => ({ ...current, gender: Number(event.target.value) as Gender }))} disabled={updateProfile.isPending} className={inputClassName}>
              <option value="2">مشخص نشده</option><option value="0">مرد</option><option value="1">زن</option>
            </select>
          </div>
          <div>
            <label htmlFor="profile-national-code" className="text-sm font-bold">کد ملی</label>
            <input id="profile-national-code" inputMode="numeric" maxLength={10} value={form.nationalCode} onChange={(event) => setForm((current) => ({ ...current, nationalCode: event.target.value.replace(/\D/g, "") }))} disabled={updateProfile.isPending} dir="ltr" className={inputClassName} />
          </div>
          <div>
            <label htmlFor="profile-birth-date" className="text-sm font-bold">تاریخ تولد</label>
            <input id="profile-birth-date" type="date" value={form.birthDate} onChange={(event) => setForm((current) => ({ ...current, birthDate: event.target.value }))} disabled={updateProfile.isPending} className={inputClassName} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="profile-address" className="text-sm font-bold">نشانی کامل</label>
            <textarea id="profile-address" required rows={3} value={form.address} onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))} disabled={updateProfile.isPending} placeholder="استان، شهر، خیابان، کوچه و پلاک" className="mt-2 w-full resize-y rounded-xl border border-border bg-surface px-4 py-3 text-sm leading-7 outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-60" />
          </div>
          <div>
            <label htmlFor="profile-latitude" className="text-sm font-bold">عرض جغرافیایی</label>
            <input id="profile-latitude" type="number" step="any" min="-90" max="90" required value={form.latitude} onChange={(event) => setForm((current) => ({ ...current, latitude: event.target.value }))} disabled={updateProfile.isPending} dir="ltr" className={inputClassName} />
          </div>
          <div>
            <label htmlFor="profile-longitude" className="text-sm font-bold">طول جغرافیایی</label>
            <input id="profile-longitude" type="number" step="any" min="-180" max="180" required value={form.longitude} onChange={(event) => setForm((current) => ({ ...current, longitude: event.target.value }))} disabled={updateProfile.isPending} dir="ltr" className={inputClassName} />
          </div>
        </div>

        <LocationPicker value={mapLocation} onChange={(location) => setForm((current) => ({ ...current, latitude: location.latitude.toFixed(6), longitude: location.longitude.toFixed(6) }))} />

        {error && <p role="alert" className="flex items-start gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-medium text-error"><span className="material-symbols-rounded text-lg" aria-hidden="true">error</span>{error}</p>}
        {isSaved && <p role="status" className="flex items-start gap-2 rounded-xl bg-muted px-4 py-3 text-sm font-bold text-success"><span className="material-symbols-rounded text-lg" aria-hidden="true">check_circle</span>اطلاعات پروفایل ذخیره شد.</p>}

        <button type="submit" disabled={updateProfile.isPending} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 font-black text-primary-foreground outline-none transition-colors hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60">
          {updateProfile.isPending && <span className="material-symbols-rounded animate-spin" aria-hidden="true">progress_activity</span>}
          {updateProfile.isPending ? "در حال ذخیره…" : returnTo ? "ذخیره و ادامه خرید" : "ذخیره تغییرات"}
        </button>
      </form>
    </section>
  );
}
