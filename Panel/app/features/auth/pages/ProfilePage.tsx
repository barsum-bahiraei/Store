import { useState, type FormEvent } from "react";
import { PersianDateTimePicker } from "~/components/common/PersianDateTimePicker";
import { useAuth } from "~/contexts/auth-context";
import { SellerLocationMap } from "~/features/sellers/components/SellerLocationMap";
import { formatLocalDate } from "~/shared/utils/date-time";

const inputClasses =
  "min-h-11 w-full rounded-xl border border-gray-300 bg-white px-3.5 text-sm text-gray-900 outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white";

const genders = [
  { value: 0, label: "مرد" },
  { value: 1, label: "زن" },
  { value: 2, label: "نامشخص" },
];

function RequiredMark() {
  return <span className="mr-1 text-red-500" aria-label="اجباری">*</span>;
}

export default function ProfilePage() {
  const { currentUser, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState(currentUser?.firstName ?? "");
  const [lastName, setLastName] = useState(currentUser?.lastName ?? "");
  const [email, setEmail] = useState(currentUser?.email ?? "");
  const [address, setAddress] = useState(currentUser?.address ?? "");
  const [postalCode, setPostalCode] = useState(currentUser?.postalCode ?? "");
  const [latitude, setLatitude] = useState<number | null>(currentUser?.latitude ?? null);
  const [longitude, setLongitude] = useState<number | null>(currentUser?.longitude ?? null);
  const [gender, setGender] = useState(currentUser?.gender ?? 2);
  const [nationalCode, setNationalCode] = useState(currentUser?.nationalCode ?? "");
  const [birthDate, setBirthDate] = useState(currentUser?.birthDate ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [locating, setLocating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  if (!currentUser) {
    return (
      <div className="mx-auto max-w-4xl rounded-xl border border-gray-200 bg-white py-16 text-center text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-900">
        امکان بارگذاری اطلاعات پروفایل وجود ندارد.
      </div>
    );
  }

  const resetForm = () => {
    setFirstName(currentUser.firstName ?? "");
    setLastName(currentUser.lastName ?? "");
    setEmail(currentUser.email ?? "");
    setAddress(currentUser.address ?? "");
    setPostalCode(currentUser.postalCode ?? "");
    setLatitude(currentUser.latitude);
    setLongitude(currentUser.longitude);
    setGender(currentUser.gender);
    setNationalCode(currentUser.nationalCode ?? "");
    setBirthDate(currentUser.birthDate ?? "");
    setError(null);
    setLocationError(null);
  };

  const save = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(false);

    if (!firstName.trim() || !lastName.trim() || !address.trim() || !postalCode.trim()) {
      setError("لطفاً همه فیلدهای اجباری را تکمیل کنید.");
      return;
    }
    if (!/^\d{10}$/.test(postalCode)) {
      setError("کد پستی باید ۱۰ رقم باشد.");
      return;
    }
    if (nationalCode && !/^\d{10}$/.test(nationalCode)) {
      setError("کد ملی باید ۱۰ رقم باشد.");
      return;
    }

    setSubmitting(true);
    try {
      await updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim() || undefined,
        address: address.trim() || null,
        postalCode: postalCode.trim() || null,
        latitude,
        longitude,
        gender,
        nationalCode: nationalCode.trim() || null,
        birthDate: birthDate || null,
      });
      setSuccess(true);
      setIsEditing(false);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "بروزرسانی پروفایل ناموفق بود.");
    } finally {
      setSubmitting(false);
    }
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("مرورگر شما دریافت موقعیت فعلی را پشتیبانی نمی‌کند.");
      return;
    }

    setLocating(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLatitude(coords.latitude);
        setLongitude(coords.longitude);
        setLocating(false);
      },
      () => {
        setLocationError("دسترسی به موقعیت فعلی ممکن نشد. دسترسی Location مرورگر را فعال کنید.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15_000 },
    );
  };

  const initials = `${currentUser.firstName?.[0] ?? ""}${currentUser.lastName?.[0] ?? ""}`.toUpperCase();
  const genderLabel = genders.find((item) => item.value === currentUser.gender)?.label ?? "نامشخص";
  const displayValue = (value: string | null | undefined) => value?.trim() || "ثبت نشده";

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">پروفایل من</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">اطلاعات شخصی و نشانی حساب شما</p>
        </div>
        {!isEditing && (
          <button
            type="button"
            onClick={() => {
              resetForm();
              setSuccess(false);
              setIsEditing(true);
            }}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
          >
            <span className="material-symbols-outlined text-xl">edit</span>
            ویرایش پروفایل
          </button>
        )}
      </div>

      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col gap-4 border-b border-gray-200 bg-gray-50/70 p-5 sm:flex-row sm:items-center sm:p-6 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl font-semibold text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
            {initials || <span className="material-symbols-outlined">person</span>}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-xl font-semibold text-gray-900 dark:text-white">{displayValue(`${currentUser.firstName ?? ""} ${currentUser.lastName ?? ""}`)}</h2>
              {currentUser.isEmailVerified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                  <span className="material-symbols-outlined text-sm">verified</span>
                  تأیید شده
                </span>
              )}
            </div>
            <p dir="ltr" className="mt-1 text-right text-sm text-gray-500 dark:text-gray-400">{currentUser.phoneNumber}</p>
          </div>
        </div>

        {success && !isEditing && (
          <div className="mx-5 mt-5 flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700 sm:mx-6 dark:border-green-900/50 dark:bg-green-950/30 dark:text-green-300">
            <span className="material-symbols-outlined text-[20px]">check_circle</span>
            پروفایل با موفقیت بروزرسانی شد.
          </div>
        )}

        {isEditing ? (
          <form onSubmit={save} className="p-5 sm:p-6">
            {error && (
              <div role="alert" className="mb-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
                <span className="material-symbols-outlined text-[20px]">error</span>
                <span>{error}</span>
              </div>
            )}

            <div className="grid gap-5 sm:grid-cols-2">
              <label>
                <span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">نام<RequiredMark /></span>
                <input required value={firstName} onChange={(event) => setFirstName(event.target.value)} className={inputClasses} placeholder="نام خود را وارد کنید" />
              </label>

              <label>
                <span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">نام خانوادگی<RequiredMark /></span>
                <input required value={lastName} onChange={(event) => setLastName(event.target.value)} className={inputClasses} placeholder="نام خانوادگی خود را وارد کنید" />
              </label>

              <label className="sm:col-span-2">
                <span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">آدرس ایمیل</span>
                <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className={inputClasses} placeholder="you@example.com" dir="ltr" />
              </label>

              <label>
                <span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">جنسیت</span>
                <select value={gender} onChange={(event) => setGender(Number(event.target.value))} className={inputClasses}>
                  {genders.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </select>
              </label>

              <label>
                <span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">تاریخ تولد</span>
                <PersianDateTimePicker mode="date" value={birthDate} onChange={setBirthDate} className={inputClasses} ariaLabel="تاریخ تولد" />
              </label>

              <label>
                <span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">کد ملی</span>
                <input value={nationalCode} onChange={(event) => setNationalCode(event.target.value.replace(/\D/g, ""))} className={inputClasses} placeholder="مثلاً 1234567890" inputMode="numeric" maxLength={10} />
              </label>

              <label>
                <span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">کد پستی<RequiredMark /></span>
                <input required value={postalCode} onChange={(event) => setPostalCode(event.target.value.replace(/\D/g, ""))} className={inputClasses} placeholder="کد پستی ۱۰ رقمی" inputMode="numeric" maxLength={10} />
              </label>

              <label className="sm:col-span-2">
                <span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">نشانی کامل<RequiredMark /></span>
                <textarea required value={address} onChange={(event) => setAddress(event.target.value)} className={`${inputClasses} min-h-24 resize-y py-3`} placeholder="استان، شهر، خیابان، کوچه و پلاک" />
              </label>

              <div className="sm:col-span-2">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">موقعیت روی نقشه <span className="font-normal text-gray-400">(اختیاری)</span></p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">روی نقشه کلیک کنید یا موقعیت فعلی را انتخاب کنید.</p>
                  </div>
                  <button type="button" onClick={useCurrentLocation} disabled={locating} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-primary-200 bg-primary-50 px-3 text-xs font-semibold text-primary-700 transition-colors hover:bg-primary-100 disabled:opacity-50 dark:border-primary-800 dark:bg-primary-950/40 dark:text-primary-300">
                    <span className={`material-symbols-outlined text-lg ${locating ? "animate-spin" : ""}`}>{locating ? "progress_activity" : "my_location"}</span>
                    {locating ? "در حال دریافت..." : "موقعیت فعلی من"}
                  </button>
                </div>
                {locationError && <p role="alert" className="mb-2 text-xs text-red-600 dark:text-red-400">{locationError}</p>}
                <div className="overflow-hidden rounded-xl border border-gray-300 dark:border-gray-700">
                  <SellerLocationMap latitude={latitude} longitude={longitude} onChange={(nextLatitude, nextLongitude) => {
                    setLatitude(nextLatitude);
                    setLongitude(nextLongitude);
                  }} />
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button type="submit" disabled={submitting} className="min-h-11 rounded-xl bg-primary-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50">
                {submitting ? "در حال ذخیره..." : "ذخیره تغییرات"}
              </button>
              <button type="button" disabled={submitting} onClick={() => {
                resetForm();
                setIsEditing(false);
              }} className="min-h-11 rounded-xl border border-gray-300 px-5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
                انصراف
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6 p-5 sm:p-6">
            <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                ["نام", currentUser.firstName],
                ["نام خانوادگی", currentUser.lastName],
                ["شماره موبایل", currentUser.phoneNumber],
                ["ایمیل", currentUser.email],
                ["جنسیت", genderLabel],
                ["تاریخ تولد", currentUser.birthDate ? formatLocalDate(currentUser.birthDate) : null],
                ["کد ملی", currentUser.nationalCode],
                ["کد پستی", currentUser.postalCode],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl bg-gray-50 p-4 dark:bg-gray-950">
                  <dt className="text-xs text-gray-500 dark:text-gray-400">{label}</dt>
                  <dd className="mt-1.5 break-words text-sm font-semibold text-gray-900 dark:text-white">{displayValue(value)}</dd>
                </div>
              ))}
              <div className="rounded-xl bg-gray-50 p-4 sm:col-span-2 lg:col-span-3 dark:bg-gray-950">
                <dt className="text-xs text-gray-500 dark:text-gray-400">آدرس</dt>
                <dd className="mt-1.5 text-sm font-semibold leading-7 text-gray-900 dark:text-white">{displayValue(currentUser.address)}</dd>
              </div>
            </dl>

            <div>
              <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">موقعیت ثبت‌شده</h3>
              {currentUser.latitude !== null && currentUser.longitude !== null ? (
                <div className="overflow-hidden rounded-xl border border-gray-300 dark:border-gray-700">
                  <SellerLocationMap latitude={currentUser.latitude} longitude={currentUser.longitude} onChange={() => undefined} readOnly />
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-gray-300 py-8 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">موقعیتی ثبت نشده است.</div>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
