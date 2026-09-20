import { useEffect, useState } from "react";
import { ConfirmDialog } from "~/components/common/ConfirmDialog";
import { accessApi } from "~/features/access/api/access-api";
import type { UserSummary } from "~/features/access/models/access";
import { discountCodeApi } from "../api/discount-code-api";
import type {
  DiscountCodeListOutput,
  DiscountCodeUpsertInput,
  PaymentMethod,
} from "../models/discount-code";

const inputClasses =
  "min-h-11 w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white dark:placeholder-gray-500";

const paymentMethods = [
  { value: "", label: "همه" },
  { value: "0", label: "نقدی" },
  { value: "1", label: "آنلاین" },
  { value: "2", label: "چک" },
];

const paymentMethodLabels: Record<number, string> = {
  0: "نقدی",
  1: "آنلاین",
  2: "چک",
};

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "خطای غیرمنتظره‌ای رخ داد.";
}

interface FormState {
  code: string;
  discountPercent: string;
  maxDiscountAmount: string;
  paymentMethod: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

const emptyForm: FormState = {
  code: "",
  discountPercent: "",
  maxDiscountAmount: "",
  paymentMethod: "",
  startDate: "",
  endDate: "",
  isActive: true,
};

function generateRandomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

const wizardSteps = [
  { title: "جزئیات", icon: "tune" },
  { title: "کاربران", icon: "group" },
];

export default function DiscountCodesPage() {
  const [codes, setCodes] = useState<DiscountCodeListOutput[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(0);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [allUsers, setAllUsers] = useState<UserSummary[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<number>>(new Set());
  const [usersLoading, setUsersLoading] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterFirstName, setFilterFirstName] = useState("");
  const [filterLastName, setFilterLastName] = useState("");
  const [filterEmail, setFilterEmail] = useState("");
  const [filterPhoneNumber, setFilterPhoneNumber] = useState("");

  const [confirmData, setConfirmData] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setCodes(await discountCodeApi.list());
    } catch (caughtError) {
      setError(errorMessage(caughtError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const setFormField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const openWizard = (item?: DiscountCodeListOutput) => {
    if (item) {
      setEditingId(item.id);
      void loadDetail(item.id);
    } else {
      setEditingId(null);
      setForm(emptyForm);
    }
    setFormError(null);
    setWizardStep(0);
    setSelectedUserIds(new Set());
    setAllUsers([]);
    setFilterOpen(false);
    setFilterFirstName("");
    setFilterLastName("");
    setFilterEmail("");
    setFilterPhoneNumber("");
    setWizardOpen(true);
  };

  const loadDetail = async (id: number) => {
    try {
      const detail = await discountCodeApi.get(id);
      setForm({
        code: detail.code,
        discountPercent: String(detail.discountPercent),
        maxDiscountAmount: detail.maxDiscountAmount != null ? String(detail.maxDiscountAmount) : "",
        paymentMethod: detail.paymentMethod != null ? String(detail.paymentMethod) : "",
        startDate: detail.startDate ? detail.startDate.slice(0, 16) : "",
        endDate: detail.endDate ? detail.endDate.slice(0, 16) : "",
        isActive: detail.isActive,
      });
      setSelectedUserIds(new Set(detail.users.map((u) => u.userId)));
    } catch (caughtError) {
      setFormError(errorMessage(caughtError));
    }
  };

  const closeWizard = () => {
    if (saving) return;
    setWizardOpen(false);
    setEditingId(null);
    setForm(emptyForm);
    setFormError(null);
    setSelectedUserIds(new Set());
    setAllUsers([]);
  };

  const goToStep2 = async () => {
    const percent = Number(form.discountPercent);
    if (!form.code.trim()) {
      setFormError("کد تخفیف را وارد کنید.");
      return;
    }
    if (!Number.isFinite(percent) || percent <= 0 || percent > 100) {
      setFormError("درصد تخفیف باید بین ۱ تا ۱۰۰ باشد.");
      return;
    }
    setFormError(null);
    setWizardStep(1);
    if (allUsers.length === 0) {
      setUsersLoading(true);
      try {
        setAllUsers(await accessApi.listUsers());
      } catch (caughtError) {
        setFormError(errorMessage(caughtError));
      } finally {
        setUsersLoading(false);
      }
    }
  };

  const buildUserParams = () => {
    const params: Record<string, string> = {};
    if (filterFirstName.trim()) params.firstName = filterFirstName.trim();
    if (filterLastName.trim()) params.lastName = filterLastName.trim();
    if (filterEmail.trim()) params.email = filterEmail.trim();
    if (filterPhoneNumber.trim()) params.phoneNumber = filterPhoneNumber.trim();
    return params;
  };

  const hasActiveUserFilters = filterFirstName || filterLastName || filterEmail || filterPhoneNumber;

  const applyUserFilters = async () => {
    setUsersLoading(true);
    try {
      setAllUsers(await accessApi.listUsers(buildUserParams()));
    } catch (caughtError) {
      setFormError(errorMessage(caughtError));
    } finally {
      setUsersLoading(false);
    }
  };

  const clearUserFilters = () => {
    setFilterFirstName("");
    setFilterLastName("");
    setFilterEmail("");
    setFilterPhoneNumber("");
    void accessApi.listUsers().then(setAllUsers);
  };

  const toggleUser = (userId: number) => {
    setSelectedUserIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const toggleAllUsers = () => {
    if (selectedUserIds.size === allUsers.length) {
      setSelectedUserIds(new Set());
    } else {
      setSelectedUserIds(new Set(allUsers.map((u) => u.id)));
    }
  };

  const handleFinalSubmit = async () => {
    const percent = Number(form.discountPercent);
    const payload: DiscountCodeUpsertInput = {
      code: form.code.trim(),
      discountPercent: percent,
      maxDiscountAmount: form.maxDiscountAmount ? Number(form.maxDiscountAmount) : null,
      paymentMethod: form.paymentMethod !== "" ? (Number(form.paymentMethod) as PaymentMethod) : null,
      startDate: form.startDate || null,
      endDate: form.endDate || null,
      isActive: form.isActive,
      userIds: Array.from(selectedUserIds),
    };
    setSaving(true);
    setFormError(null);
    try {
      if (editingId) {
        await discountCodeApi.update(editingId, payload);
      } else {
        await discountCodeApi.create(payload);
      }
      closeWizard();
      await load();
    } catch (caughtError) {
      setFormError(errorMessage(caughtError));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await discountCodeApi.remove(id);
      await load();
    } catch (caughtError) {
      setError(errorMessage(caughtError));
    }
  };

  const allSelected = allUsers.length > 0 && selectedUserIds.size === allUsers.length;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">کدهای تخفیف</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">ایجاد و مدیریت کدهای تخفیف و اختصاص آن‌ها به کاربران.</p>
        </div>
        <button onClick={() => openWizard()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-700">
          <span className="material-symbols-outlined text-xl">add</span>
          کد تخفیف جدید
        </button>
      </div>

      {error && (
        <div role="alert" className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          <span>{error}</span>
          <button onClick={() => void load()} className="font-semibold">تلاش مجدد</button>
        </div>
      )}

      {loading ? (
        <div className="rounded-xl border border-gray-200 bg-white py-16 text-center text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-900">در حال بارگذاری کدهای تخفیف...</div>
      ) : codes.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white py-16 text-center dark:border-gray-700 dark:bg-gray-900">
          <span className="material-symbols-outlined text-5xl text-gray-300 dark:text-gray-600">local_offer</span>
          <p className="mt-3 text-sm text-gray-500">هنوز کد تخفیفی وجود ندارد.</p>
          <button onClick={() => openWizard()} className="mt-5 min-h-11 rounded-xl bg-primary-600 px-5 text-sm font-semibold text-white hover:bg-primary-700">ایجاد کد تخفیف</button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <div className="hidden border-b border-gray-200 bg-gray-50 px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:border-gray-800 dark:bg-gray-800/50 dark:text-gray-400 sm:grid sm:grid-cols-[1fr_100px_100px_100px_120px_100px] sm:gap-4">
            <span>کد</span>
            <span className="text-center">درصد</span>
            <span className="text-center">تعداد</span>
            <span className="text-center">استفاده</span>
            <span className="text-center">وضعیت</span>
            <span className="text-center">عملیات</span>
          </div>
          <ul className="divide-y divide-gray-200 dark:divide-gray-800">
            {codes.map((item) => (
              <li key={item.id} className="flex flex-col gap-3 p-4 sm:grid sm:grid-cols-[1fr_100px_100px_100px_120px_100px] sm:items-center sm:gap-4 sm:px-6">
                <div className="min-w-0">
                  <p className="truncate font-medium text-gray-900 dark:text-white">{item.code}</p>
                  <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                    {paymentMethodLabels[item.paymentMethod ?? -1] ?? "—"}
                    {item.maxDiscountAmount != null && ` · سقف ${item.maxDiscountAmount.toLocaleString("fa-IR")}`}
                  </p>
                </div>
                <p className="text-center text-sm font-semibold text-primary-600 dark:text-primary-400">{item.discountPercent}%</p>
                <p className="text-center text-sm text-gray-600 dark:text-gray-300">{item.assignedUserCount}</p>
                <p className="text-center text-sm text-gray-600 dark:text-gray-300">{item.usedUserCount}</p>
                <div className="flex justify-center">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${item.isActive ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"}`}>
                    <span className={`size-1.5 rounded-full ${item.isActive ? "bg-emerald-500" : "bg-gray-400"}`} />
                    {item.isActive ? "فعال" : "غیرفعال"}
                  </span>
                </div>
                <div className="flex items-center justify-center gap-1">
                  <button onClick={() => openWizard(item)} className="flex size-10 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-950/40 dark:hover:text-primary-400" title="ویرایش">
                    <span className="material-symbols-outlined text-xl">edit</span>
                  </button>
                  <button onClick={() => setConfirmData({ title: "حذف کد تخفیف", message: `آیا از حذف کد \u00ab${item.code}\u00bb اطمینان دارید؟`, onConfirm: async () => { setConfirmData(null); await handleDelete(item.id); } })} className="flex size-10 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30" title="حذف">
                    <span className="material-symbols-outlined text-xl">delete</span>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {wizardOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-gray-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-6" role="dialog" aria-modal="true" onMouseDown={closeWizard}>
          <div onMouseDown={(e) => e.stopPropagation()} className="flex max-h-[95vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900 sm:max-h-[90vh] sm:rounded-3xl">
            <header className="flex items-start justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-800 sm:px-7 sm:py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary-600 dark:text-primary-400">{editingId ? "ویرایش کد تخفیف" : "کد تخفیف جدید"}</p>
                <h2 className="mt-1 text-xl font-semibold text-gray-950 dark:text-white">{editingId ? `ویرایش ${form.code || "کد تخفیف"}` : "ایجاد کد تخفیف"}</h2>
              </div>
              <button type="button" onClick={closeWizard} className="flex size-11 items-center justify-center rounded-xl text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-white" aria-label="بستن">
                <span className="material-symbols-outlined">close</span>
              </button>
            </header>

            <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800 sm:px-7">
              <ol className="grid grid-cols-2 gap-2" aria-label="پیشرفت">
                {wizardSteps.map((item, index) => (
                  <li key={item.title} className="flex min-w-0 items-center gap-2">
                    <span className={`flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors ${index <= wizardStep ? "bg-primary-600 text-white" : "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500"}`} aria-current={index === wizardStep ? "step" : undefined}>
                      <span className="material-symbols-outlined text-[19px]">{index < wizardStep ? "check" : item.icon}</span>
                    </span>
                    <span className={`hidden truncate text-sm font-medium sm:block ${index <= wizardStep ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-gray-500"}`}>{item.title}</span>
                    {index < wizardSteps.length - 1 && <span className={`h-px flex-1 ${index < wizardStep ? "bg-primary-500" : "bg-gray-200 dark:bg-gray-700"}`} />}
                  </li>
                ))}
              </ol>
            </div>

            <div className="overflow-y-auto px-5 py-6 sm:px-7 sm:py-7">
              {formError && (
                <div className="mb-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300" role="alert">
                  <span className="material-symbols-outlined text-[20px]">error</span><span>{formError}</span>
                </div>
              )}

              {wizardStep === 0 && (
                <form id="discount-form" onSubmit={(e) => { e.preventDefault(); void goToStep2(); }}>
                  <h3 className="text-lg font-semibold text-gray-950 dark:text-white">جزئیات کد تخفیف</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">اطلاعات کد تخفیف را وارد کنید.</p>
                  <div className="mt-6 grid gap-5 sm:grid-cols-2">
                    <label className="sm:col-span-2">
                      <span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">کد تخفیف <span className="text-red-500">*</span></span>
                      <div className="flex gap-2">
                        <input value={form.code} onChange={(e) => setFormField("code", e.target.value)} placeholder="مثال: SUMMER20" dir="ltr" className={inputClasses} required />
                        <button type="button" onClick={() => setFormField("code", generateRandomCode())} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-gray-300 bg-gray-50 px-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700" title="تولید کد تصادفی">
                          <span className="material-symbols-outlined text-xl">casino</span>
                        </button>
                      </div>
                    </label>
                    <label>
                      <span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">درصد تخفیف <span className="text-red-500">*</span></span>
                      <input type="number" min={1} max={100} value={form.discountPercent} onChange={(e) => { const v = e.target.value; if (v === "" || Number(v) <= 100) setFormField("discountPercent", v); }} onInput={(e) => { const v = Number((e.target as HTMLInputElement).value); if (v > 100) setFormField("discountPercent", "100"); }} placeholder="۱ تا ۱۰۰" className={inputClasses} required />
                    </label>
                    <label>
                      <span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">سقف تخفیف (تومان)</span>
                      <input type="number" min={0} value={form.maxDiscountAmount} onChange={(e) => setFormField("maxDiscountAmount", e.target.value)} placeholder="اختیاری" className={inputClasses} />
                    </label>
                    <label>
                      <span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">روش پرداخت</span>
                      <select value={form.paymentMethod} onChange={(e) => setFormField("paymentMethod", e.target.value)} className={inputClasses}>
                        {paymentMethods.map((pm) => (
                          <option key={pm.value} value={pm.value}>{pm.label}</option>
                        ))}
                      </select>
                    </label>
                    <div />
                    <label>
                      <span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">تاریخ شروع</span>
                      <input type="datetime-local" value={form.startDate} onChange={(e) => setFormField("startDate", e.target.value)} className={inputClasses} />
                    </label>
                    <label>
                      <span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">تاریخ پایان</span>
                      <input type="datetime-local" value={form.endDate} onChange={(e) => setFormField("endDate", e.target.value)} className={inputClasses} />
                    </label>
                    <label className="sm:col-span-2 flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={form.isActive} onChange={(e) => setFormField("isActive", e.target.checked)} className="size-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">فعال</span>
                    </label>
                  </div>
                </form>
              )}

              {wizardStep === 1 && (
                <section>
                  <h3 className="text-lg font-semibold text-gray-950 dark:text-white">انتخاب کاربران</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">کاربرانی که می‌توانند از این کد تخفیف استفاده کنند را انتخاب کنید.</p>

                  <div className="mt-4 flex items-center gap-2">
                    <button onClick={() => setFilterOpen((prev) => !prev)} className={`flex min-h-10 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors ${filterOpen || hasActiveUserFilters ? "border-primary-300 bg-primary-50 text-primary-700 dark:border-primary-800 dark:bg-primary-950/40 dark:text-primary-300" : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200 dark:hover:bg-gray-800"}`}>
                      <span className="material-symbols-outlined text-xl">filter_list</span>
                      فیلتر
                      {hasActiveUserFilters && <span className="size-2 rounded-full bg-primary-500" />}
                    </button>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{allUsers.length} کاربر</span>
                  </div>

                  {filterOpen && (
                    <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/50">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <input value={filterFirstName} onChange={(e) => setFilterFirstName(e.target.value)} placeholder="نام" className={inputClasses} />
                        <input value={filterLastName} onChange={(e) => setFilterLastName(e.target.value)} placeholder="نام خانوادگی" className={inputClasses} />
                        <input value={filterEmail} onChange={(e) => setFilterEmail(e.target.value)} placeholder="ایمیل" className={inputClasses} />
                        <input value={filterPhoneNumber} onChange={(e) => setFilterPhoneNumber(e.target.value)} placeholder="شماره تلفن" className={inputClasses} />
                      </div>
                      <div className="mt-3 flex gap-2">
                        <button onClick={() => void applyUserFilters()} className="min-h-10 rounded-lg bg-primary-600 px-4 text-sm font-medium text-white hover:bg-primary-700">اعمال</button>
                        {hasActiveUserFilters && (
                          <button onClick={clearUserFilters} className="min-h-10 rounded-lg px-3 text-sm font-medium text-gray-600 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700">پاک کردن</button>
                        )}
                      </div>
                    </div>
                  )}

                  {usersLoading ? (
                    <div className="py-12 text-center text-sm text-gray-500">
                      <span className="material-symbols-outlined animate-spin">progress_activity</span>
                      <p className="mt-2">در حال بارگذاری کاربران...</p>
                    </div>
                  ) : (
                    <div className="mt-4 rounded-lg border border-gray-200 dark:border-gray-700">
                      <label className="flex items-center gap-3 border-b border-gray-200 px-4 py-3 dark:border-gray-700">
                        <input type="checkbox" checked={allSelected} onChange={toggleAllUsers} className="size-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">انتخاب همه ({allUsers.length})</span>
                        {selectedUserIds.size > 0 && (
                          <span className="text-xs text-primary-600 dark:text-primary-400">{selectedUserIds.size} انتخاب شده</span>
                        )}
                      </label>
                      <ul className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
                        {allUsers.map((user) => (
                          <li key={user.id}>
                            <label className="flex cursor-pointer items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                              <input type="checkbox" checked={selectedUserIds.has(user.id)} onChange={() => toggleUser(user.id)} className="size-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{user.firstName} {user.lastName}</p>
                                <p className="truncate text-xs text-gray-500 dark:text-gray-400">{user.phoneNumber}</p>
                              </div>
                            </label>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </section>
              )}
            </div>

            <footer className="mt-auto flex items-center justify-between gap-3 border-t border-gray-200 bg-gray-50 px-5 py-4 dark:border-gray-800 dark:bg-gray-900 sm:px-7">
              <button type="button" onClick={wizardStep === 0 ? closeWizard : () => setWizardStep(0)} className="min-h-11 rounded-xl px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-gray-300 dark:hover:bg-gray-800">{wizardStep === 0 ? "لغو" : "بازگشت"}</button>
              <div className="flex items-center gap-2">
                {wizardStep === 0 && (
                  <button type="submit" form="discount-form" className="flex min-h-11 items-center gap-2 rounded-xl bg-primary-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-gray-900">
                    ادامه
                    <span className="material-symbols-outlined text-[19px]">arrow_back</span>
                  </button>
                )}
                {wizardStep === 1 && (
                  <button type="button" onClick={() => void handleFinalSubmit()} disabled={saving} className="flex min-h-11 items-center gap-2 rounded-xl bg-primary-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-gray-900">
                    {saving && <span className="material-symbols-outlined animate-spin text-[19px]">progress_activity</span>}
                    {saving ? "در حال ذخیره..." : "ذخیره و پایان"}
                  </button>
                )}
              </div>
            </footer>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmData !== null}
        title={confirmData?.title ?? ""}
        message={confirmData?.message ?? ""}
        onConfirm={() => confirmData?.onConfirm()}
        onCancel={() => setConfirmData(null)}
      />
    </div>
  );
}
