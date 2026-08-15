import { useAuth } from "~/contexts/auth-context";

const genderLabels: Record<number, string> = {
  0: "Male",
  1: "Female",
  2: "Not specified",
};

function ProfileField({ icon, label, value }: { icon: string; label: string; value: string | null | undefined }) {
  return (
    <div className="flex min-w-0 gap-3 rounded-xl border border-gray-200 p-4 dark:border-gray-800">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
        <span className="material-symbols-outlined text-xl">{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</p>
        <p className={`mt-1 break-words text-sm ${value ? "font-medium text-gray-900 dark:text-white" : "text-gray-400 dark:text-gray-500"}`}>
          {value || "Not provided"}
        </p>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return (
      <div className="mx-auto max-w-4xl rounded-xl border border-gray-200 bg-white py-16 text-center text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-900">
        Unable to load profile information.
      </div>
    );
  }

  const initials = `${currentUser.firstName[0] ?? ""}${currentUser.lastName[0] ?? ""}`.toUpperCase();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">My profile</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">View your personal account information.</p>
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
                  Verified
                </span>
              )}
            </div>
            <p className="mt-1 truncate text-sm text-gray-500 dark:text-gray-400">{currentUser.email}</p>
          </div>
          <span className="inline-flex self-start rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300 sm:self-center">Read only</span>
        </div>

        <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-6">
          <ProfileField icon="mail" label="Email address" value={currentUser.email} />
          <ProfileField icon="phone" label="Phone number" value={currentUser.phoneNumber} />
          <ProfileField icon="badge" label="National code" value={currentUser.nationalCode} />
          <ProfileField icon="cake" label="Birth date" value={currentUser.birthDate} />
          <ProfileField icon="person" label="Gender" value={genderLabels[currentUser.gender] ?? "Not specified"} />
          <ProfileField icon="location_on" label="Address" value={currentUser.address} />
        </div>
      </section>
    </div>
  );
}
