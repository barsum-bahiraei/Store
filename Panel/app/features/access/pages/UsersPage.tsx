import { useEffect, useState } from "react";
import { accessApi } from "../api/access-api";
import type { Role, UserDetails, UserSummary } from "../models/access";

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "An unexpected error occurred.";
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

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setUsers(await accessApi.listUsers());
    } catch (caughtError) {
      setError(errorMessage(caughtError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

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
            roleName: role?.name ?? "Role",
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
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Users</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Review accounts and manage role assignments when needed.
          </p>
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400">{users.length} users</span>
      </div>

      {error && (
        <div role="alert" className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          <span>{error}</span>
          <button onClick={() => void load()} className="font-semibold">Retry</button>
        </div>
      )}

      {loading ? (
        <div className="rounded-xl border border-gray-200 bg-white py-16 text-center text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-900">
          Loading users...
        </div>
      ) : users.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 py-16 text-center dark:border-gray-700">
          <span className="material-symbols-outlined text-4xl text-gray-300 dark:text-gray-600">group</span>
          <p className="mt-2 text-sm text-gray-500">No users found.</p>
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
                        {user.isEmailVerified && <span className="material-symbols-outlined text-lg text-emerald-600" title="Verified email">verified</span>}
                      </div>
                      <p className="truncate text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => void openRoleManager(user)}
                    disabled={loadingDetails}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                  >
                    <span className="material-symbols-outlined text-xl">manage_accounts</span>
                    Manage roles
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
            Loading user roles...
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
                <h2 id="role-manager-title" className="text-lg font-semibold text-gray-900 dark:text-white">Manage roles</h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{selectedUser.firstName} {selectedUser.lastName} · {selectedUser.email}</p>
              </div>
              <button onClick={closeRoleManager} disabled={saving} className="flex size-11 shrink-0 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800" aria-label="Close role manager">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-6 p-5">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Assigned roles</h3>
                {selectedUser.roles.length === 0 ? (
                  <div className="mt-3 rounded-xl border border-dashed border-gray-300 px-4 py-6 text-center text-sm text-gray-500 dark:border-gray-700">No roles assigned.</div>
                ) : (
                  <ul className="mt-3 divide-y divide-gray-200 rounded-xl border border-gray-200 dark:divide-gray-800 dark:border-gray-700">
                    {selectedUser.roles.map((role) => (
                      <li key={role.id} className="flex min-h-12 items-center justify-between gap-3 px-4">
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{role.roleName}</span>
                        <button onClick={() => void removeRole(role.id)} disabled={saving} className="flex size-10 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-950/30" aria-label={`Remove ${role.roleName}`}>
                          <span className="material-symbols-outlined text-xl">delete</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <label htmlFor="assignRole" className="text-sm font-semibold text-gray-900 dark:text-white">Assign another role</label>
                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <select id="assignRole" value={selectedRoleId} onChange={(event) => setSelectedRoleId(event.target.value ? Number(event.target.value) : "")} disabled={saving || availableRoles.length === 0} className="min-h-11 min-w-0 flex-1 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:opacity-60 dark:border-gray-700 dark:bg-gray-950 dark:text-white">
                    <option value="">{availableRoles.length === 0 ? "All roles are assigned" : "Select a role"}</option>
                    {availableRoles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}
                  </select>
                  <button onClick={() => void assignRole()} disabled={saving || selectedRoleId === ""} className="min-h-11 rounded-lg bg-primary-600 px-5 text-sm font-medium text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50">
                    {saving ? "Saving..." : "Assign"}
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
