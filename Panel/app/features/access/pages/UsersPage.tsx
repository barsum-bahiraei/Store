import { useEffect, useState } from "react";
import { ConfirmDialog } from "~/components/common/ConfirmDialog";
import { accessApi } from "../api/access-api";
import type { Role, UserDetails, UserListParams, UserSummary } from "../models/access";

const inputClasses =
  "min-h-11 w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white dark:placeholder-gray-500";

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "خطای غیرمنتظره‌ای رخ داد.";
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserDetails | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<number | "">("");
  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmData, setConfirmData] = useState<{ title: string; message: string; onConfirm: () => void } | null>(null);

  const [filterOpen, setFilterOpen] = useState(false);
  const [filterFirstName, setFilterFirstName] = useState("");
  const [filterLastName, setFilterLastName] = useState("");
  const [filterEmail, setFilterEmail] = useState("");
  const [filterPhoneNumber, setFilterPhoneNumber] = useState("");
  const [filterBirthDate, setFilterBirthDate] = useState("");
  const [filterGender, setFilterGender] = useState<string>("");

  const buildParams = (): UserListParams => {
    const params: UserListParams = {};
    if (filterFirstName.trim()) params.firstName = filterFirstName.trim();
    if (filterLastName.trim()) params.lastName = filterLastName.trim();
    if (filterEmail.trim()) params.email = filterEmail.trim();
    if (filterPhoneNumber.trim()) params.phoneNumber = filterPhoneNumber.trim();
    if (filterBirthDate.trim()) params.birthDate = filterBirthDate.trim();
    if (filterGender !== "") params.gender = Number(filterGender);
    return params;
  };

  const load = async (params?: UserListParams) => {
    setLoading(true);
    setError(null);
    try {
      setUsers(await accessApi.listUsers(params));
    } catch (caughtError) {
      setError(errorMessage(caughtError));
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    void load(buildParams());
  };

  const clearFilters = () => {
    setFilterFirstName("");
    setFilterLastName("");
    setFilterEmail("");
    setFilterPhoneNumber("");
    setFilterBirthDate("");
    setFilterGender("");
    void load();
  };

  useEffect(() => {
    void load();
  }, []);

  const hasActiveFilters = filterFirstName || filterLastName || filterEmail || filterPhoneNumber || filterBirthDate || filterGender !== "";

  const openRoleManager = async (user: UserSummary) => {
    setLoadingDetails(true);
    setError(null);
    try {
      const [userDetails, roleList] = await Promise.all([
        accessApi.getUser(user.id),
        roles.length > 0 ? Promise.resolve(roles) : accessApi.listRoles(),
      ]);
      setSelectedUser(userDetails);
      setRoles(roleList);
      setSelectedRoleId("");
    } catch (caughtError) {
      setError(errorMessage(caughtError));
    } finally {
      setLoadingDetails(false);
    }
  };

  const closeRoleManager = () => {
    if (saving) return;
    setSelectedUser(null);
    setSelectedRoleId("");
  };

  const assignRole = async () => {
    if (!selectedUser || selectedRoleId === "") return;
    setSaving(true);
    setError(null);
    try {
      const role = roles.find((item) => item.id === selectedRoleId);
      const assignment = await accessApi.assignRole(selectedUser.id, selectedRoleId);
      setSelectedUser({
        ...selectedUser,
        roles: [
          ...selectedUser.roles,
          {
            id: assignment.id,
            roleId: assignment.roleId,
            roleName: role?.name ?? "نقش",
            access: [],
          },
        ],
      });
      setSelectedRoleId("");
    } catch (caughtError) {
      setError(errorMessage(caughtError));
    } finally {
      setSaving(false);
    }
  };

  const removeRole = async (userRoleId: number) => {
    if (!selectedUser) return;
    setSaving(true);
    setError(null);
    try {
      await accessApi.removeUserRole(userRoleId);
      setSelectedUser({
        ...selectedUser,
        roles: selectedUser.roles.filter((role) => role.id !== userRoleId),
      });
    } catch (caughtError) {
      setError(errorMessage(caughtError));
    } finally {
      setSaving(false);
    }
  };

  const availableRoles = selectedUser
    ? roles.filter((role) => !selectedUser.roles.some((assigned) => assigned.roleId === role.id))
    : [];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">کاربران</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            بررسی حساب‌ها و مدیریت اختصاص نقش‌ها در صورت نیاز.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setFilterOpen((prev) => !prev)}
            className={`flex min-h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-medium transition-colors ${filterOpen || hasActiveFilters ? "border-primary-300 bg-primary-50 text-primary-700 dark:border-primary-800 dark:bg-primary-950/40 dark:text-primary-300" : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200 dark:hover:bg-gray-800"}`}
          >
            <span className="material-symbols-outlined text-xl">filter_list</span>
            فیلتر
            {hasActiveFilters && <span className="size-2 rounded-full bg-primary-500"></span>}
          </button>
          <span className="text-sm text-gray-500 dark:text-gray-400">{users.length} کاربر</span>
        </div>
      </div>

      {filterOpen && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label>
              <span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">نام</span>
              <input value={filterFirstName} onChange={(e) => setFilterFirstName(e.target.value)} placeholder="جستجوی نام..." className={inputClasses} />
            </label>
            <label>
              <span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">نام خانوادگی</span>
              <input value={filterLastName} onChange={(e) => setFilterLastName(e.target.value)} placeholder="جستجوی نام خانوادگی..." className={inputClasses} />
            </label>
            <label>
              <span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">ایمیل</span>
              <input value={filterEmail} onChange={(e) => setFilterEmail(e.target.value)} placeholder="جستجوی ایمیل..." className={inputClasses} />
            </label>
            <label>
              <span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">شماره تلفن</span>
              <input value={filterPhoneNumber} onChange={(e) => setFilterPhoneNumber(e.target.value)} placeholder="جستجوی شماره تلفن..." className={inputClasses} />
            </label>
            <label>
              <span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">تاریخ تولد</span>
              <input value={filterBirthDate} onChange={(e) => setFilterBirthDate(e.target.value)} placeholder="مثال: 1370/01/01" className={inputClasses} />
            </label>
            <label>
              <span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">جنسیت</span>
              <select value={filterGender} onChange={(e) => setFilterGender(e.target.value)} className={inputClasses}>
                <option value="">همه</option>
                <option value="0">مرد</option>
                <option value="1">زن</option>
              </select>
            </label>
          </div>
          <div className="mt-4 flex gap-2">
            <button onClick={applyFilters} className="min-h-11 rounded-xl bg-primary-600 px-5 text-sm font-semibold text-white hover:bg-primary-700">
              اعمال فیلتر
            </button>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="min-h-11 rounded-xl px-4 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800">
                پاک کردن
              </button>
            )}
          </div>
        </div>
      )}

      {error && (
        <div role="alert" className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          <span>{error}</span>
          <button onClick={() => void load(buildParams())} className="font-semibold">تلاش مجدد</button>
        </div>
      )}

      {loading ? (
        <div className="rounded-xl border border-gray-200 bg-white py-16 text-center text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-900">
          در حال بارگذاری کاربران...
        </div>
      ) : users.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 py-16 text-center dark:border-gray-700">
          <span className="material-symbols-outlined text-4xl text-gray-300 dark:text-gray-600">group</span>
          <p className="mt-2 text-sm text-gray-500">{hasActiveFilters ? "هیچ کاربری مطابق فیلترها یافت نشد." : "کاربری یافت نشد."}</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <ul className="divide-y divide-gray-200 dark:divide-gray-800">
            {users.map((user) => {
              const initials = `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() || "U";
              return (
                <li key={user.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:px-6">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-medium text-gray-900 dark:text-white">{user.firstName} {user.lastName}</p>
                        {user.isEmailVerified && <span className="material-symbols-outlined text-lg text-emerald-600" title="ایمیل تأیید شده">verified</span>}
                      </div>
                      <p className="truncate text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                      {user.phoneNumber && <p className="truncate text-xs text-gray-400 dark:text-gray-500">{user.phoneNumber}</p>}
                    </div>
                  </div>
                  <button
                    onClick={() => void openRoleManager(user)}
                    disabled={loadingDetails}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                  >
                    <span className="material-symbols-outlined text-xl">manage_accounts</span>
                    مدیریت نقش‌ها
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {loadingDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="status">
          <div className="flex items-center gap-3 rounded-xl bg-white px-5 py-4 text-sm text-gray-700 shadow-xl dark:bg-gray-900 dark:text-gray-200">
            <span className="material-symbols-outlined animate-spin">progress_activity</span>
            در حال بارگذاری نقش‌های کاربر...
          </div>
        </div>
      )}

      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4" onMouseDown={closeRoleManager}>
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="role-manager-title"
            onMouseDown={(event) => event.stopPropagation()}
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white shadow-xl dark:bg-gray-900 sm:rounded-2xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-gray-200 p-5 dark:border-gray-800">
              <div>
                <h2 id="role-manager-title" className="text-lg font-semibold text-gray-900 dark:text-white">مدیریت نقش‌ها</h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{selectedUser.firstName} {selectedUser.lastName} · {selectedUser.email}</p>
              </div>
              <button onClick={closeRoleManager} disabled={saving} className="flex size-11 shrink-0 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800" aria-label="بستن مدیر نقش">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-6 p-5">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">نقش‌های اختصاص یافته</h3>
                {selectedUser.roles.length === 0 ? (
                  <div className="mt-3 rounded-xl border border-dashed border-gray-300 px-4 py-6 text-center text-sm text-gray-500 dark:border-gray-700">هیچ نقشی اختصاص نیافته.</div>
                ) : (
                  <ul className="mt-3 divide-y divide-gray-200 rounded-xl border border-gray-200 dark:divide-gray-800 dark:border-gray-700">
                    {selectedUser.roles.map((role) => (
                      <li key={role.id} className="flex min-h-12 items-center justify-between gap-3 px-4">
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{role.roleName}</span>
                        <button onClick={() => {
                          setConfirmData({
                            title: "حذف نقش از کاربر",
                            message: `آیا از حذف نقش «${role.roleName}» از این کاربر اطمینان دارید؟`,
                            onConfirm: async () => {
                              setConfirmData(null);
                              await removeRole(role.id);
                            },
                          });
                        }} disabled={saving} className="flex size-10 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-950/30" aria-label={`حذف ${role.roleName}`}>
                          <span className="material-symbols-outlined text-xl">delete</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <label htmlFor="assignRole" className="text-sm font-semibold text-gray-900 dark:text-white">اختصاص نقش دیگر</label>
                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <select id="assignRole" value={selectedRoleId} onChange={(event) => setSelectedRoleId(event.target.value ? Number(event.target.value) : "")} disabled={saving || availableRoles.length === 0} className="min-h-11 min-w-0 flex-1 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:opacity-60 dark:border-gray-700 dark:bg-gray-950 dark:text-white">
                    <option value="">{availableRoles.length === 0 ? "همه نقش‌ها اختصاص یافته" : "انتخاب نقش"}</option>
                    {availableRoles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}
                  </select>
                  <button onClick={() => void assignRole()} disabled={saving || selectedRoleId === ""} className="min-h-11 rounded-lg bg-primary-600 px-5 text-sm font-medium text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50">
                    {saving ? "در حال ذخیره..." : "اختصاص"}
                  </button>
                </div>
              </div>
            </div>
          </section>
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
