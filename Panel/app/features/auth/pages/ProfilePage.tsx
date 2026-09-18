import { useState, type FormEvent } from "react";
import { useAuth } from "~/contexts/auth-context";
import { SellerLocationMap } from "~/features/sellers/components/SellerLocationMap";

const inputClasses =
  "min-h-11 w-full rounded-xl border border-gray-300 bg-white px-3.5 text-sm text-gray-900 outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white";

const genders = [
  { value: 0, label: "مرد" },
  { value: 1, label: "زن" },
  { value: 2, label: "نامشخص" },
];

export default function ProfilePage() {
  const { currentUser, updateProfile } = useAuth();
  const [address, setAddress] = useState(currentUser?.address ?? "");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [gender, setGender] = useState(currentUser?.gender ?? 2);
  const [nationalCode, setNationalCode] = useState(currentUser?.nationalCode ?? "");
  const [birthDate, setBirthDate] = useState(currentUser?.birthDate ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!currentUser) {
    return (
      <div className="mx-auto max-w-4xl rounded-xl border border-gray-200 bg-white py-16 text-center text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-900">
        امکان بارگذاری اطلاعات پروفایل وجود ندارد.
      </div>
    );
  }

  const initials = `${currentUser.firstName[0] ?? ""}${currentUser.lastName[0] ?? ""}`.toUpperCase();

  const latitudeNumber = latitude === "" ? null : Number(latitude);
  const longitudeNumber = longitude === "" ? null : Number(longitude);
  const validLatitude = latitudeNumber !== null && Number.isFinite(latitudeNumber) && latitudeNumber >= -90 && latitudeNumber <= 90;
  const validLongitude = longitudeNumber !== null && Number.isFinite(longitudeNumber) && longitudeNumber >= -180 && longitudeNumber <= 180;

  const save = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);
    try {
      await updateProfile({
        address: address.trim() || null,
        latitude: latitude ? Number(latitude) : null,
        longitude: longitude ? Number(longitude) : null,
        gender,
        nationalCode: nationalCode.trim() || null,
        birthDate: birthDate || null,
      });
      setSuccess(true);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "بروزرسانی پروفایل ناموفق بود.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">پروفایل من</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">اطلاعات شخصی حساب خود را بروزرسانی کنید.</p>
      </div>

      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col gap-4 border-b border-gray-200 p-5 sm:flex-row sm:items-center sm:p-6 dark:border-gray-800">
          <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl font-semibold text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-xl font-semibold text-gray-900 dark:text-white">{currentUser.firstName} {currentUser.lastName}</h2>
              {currentUser.isEmailVerified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                  <span className="material-symbols-outlined text-sm">verified</span>
                  تأیید شده
                </span>
              )}
            </div>
            <p className="mt-1 truncate text-sm text-gray-500 dark:text-gray-400">{currentUser.email}</p>
          </div>
        </div>

        <form onSubmit={save} className="p-5 sm:p-6">
          {error && (
            <div role="alert" className="mb-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
              <span className="material-symbols-outlined text-[20px]">error</span>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-5 flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700 dark:border-green-900/50 dark:bg-green-950/30 dark:text-green-300">
              <span className="material-symbols-outlined text-[20px]">check_circle</span>
              <span>پروفایل با موفقیت بروزرسانی شد.</span>
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">آدرس ایمیل</span>
              <div className="flex min-h-11 items-center rounded-xl border border-gray-200 bg-gray-50 px-3.5 text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-400">
                {currentUser.email}
              </div>
            </div>

            <label>
              <span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">جنسیت</span>
              <select value={gender} onChange={(event) => setGender(Number(event.target.value))} className={inputClasses}>
                {genders.map((g) => (
                  <option key={g.value} value={g.value}>{g.label}</option>
                ))}
              </select>
            </label>

            <label>
              <span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">تاریخ تولد</span>
              <input type="date" value={birthDate} onChange={(event) => setBirthDate(event.target.value)} className={inputClasses} />
            </label>

            <label>
              <span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">کد ملی</span>
              <input value={nationalCode} onChange={(event) => setNationalCode(event.target.value)} className={inputClasses} placeholder="مثلاً 1234567890" />
            </label>

            <label className="sm:col-span-2">
              <span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">آدرس</span>
              <textarea value={address} onChange={(event) => setAddress(event.target.value)} className={`${inputClasses} min-h-20 resize-y`} placeholder="آدرس کامل شما" />
            </label>

            <div className="sm:col-span-2">
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">مکان</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">روی نقشه کلیک کنید تا مختصات تنظیم شود</span>
              </div>
              <div className="overflow-hidden rounded-xl border border-gray-300 dark:border-gray-700">
                <SellerLocationMap
                  latitude={validLatitude ? latitudeNumber : null}
                  longitude={validLongitude ? longitudeNumber : null}
                  onChange={(nextLatitude, nextLongitude) => {
                    setLatitude(nextLatitude.toFixed(6));
                    setLongitude(nextLongitude.toFixed(6));
                  }}
                />
              </div>
            </div>

            <label>
              <span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">عرض جغرافیایی</span>
              <input type="number" min="-90" max="90" step="any" value={latitude} onChange={(event) => setLatitude(event.target.value)} className={inputClasses} placeholder="مثلاً 35.6892" />
            </label>

            <label>
              <span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">طول جغرافیایی</span>
              <input type="number" min="-180" max="180" step="any" value={longitude} onChange={(event) => setLongitude(event.target.value)} className={inputClasses} placeholder="مثلاً 51.3890" />
            </label>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button type="submit" disabled={submitting} className="min-h-11 rounded-xl bg-primary-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-gray-900">
              {submitting ? "در حال ذخیره..." : "ذخیره تغییرات"}
            </button>
            {success && (
              <span className="text-sm text-green-600 dark:text-green-400">ذخیره شد</span>
            )}
          </div>
        </form>
      </section>
    </div>
  );
}
