import { useEffect, useState } from "react";
import { accessApi } from "../api/access-api";
import type { ControllerActions, Role, RoleAccess } from "../models/access";

const inputClasses = "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white";

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "An unexpected error occurred.";
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [actions, setActions] = useState<ControllerActions[]>([]);
  const [accesses, setAccesses] = useState<RoleAccess[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [newRoleName, setNewRoleName] = useState("");
  const [editing, setEditing] = useState(false);
  const [editingName, setEditingName] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingAccess, setLoadingAccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [roleList, actionList] = await Promise.all([
        accessApi.listRoles(),
        accessApi.listControllerActions(),
      ]);
      setRoles(roleList);
      setActions(actionList);
      setSelectedRoleId((current) =>
        current && roleList.some((role) => role.id === current)
          ? current
          : roleList[0]?.id ?? null,
      );
    } catch (caughtError) {
      setError(errorMessage(caughtError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    if (selectedRoleId === null) {
      setAccesses([]);
      return;
    }

    let active = true;
    setLoadingAccess(true);
    setAccesses([]);
    setError(null);
    void accessApi.listRoleAccess(selectedRoleId)
      .then((roleAccesses) => {
        if (active) setAccesses(roleAccesses);
      })
      .catch((caughtError) => {
        if (active) setError(errorMessage(caughtError));
      })
      .finally(() => {
        if (active) setLoadingAccess(false);
      });

    return () => {
      active = false;
    };
  }, [selectedRoleId]);

  const createRole = async () => {
    if (!newRoleName.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const role = await accessApi.createRole(newRoleName.trim());
      setRoles((current) => [...current, role]);
      setSelectedRoleId(role.id);
      setNewRoleName("");
    } catch (caughtError) {
      setError(errorMessage(caughtError));
    } finally {
      setSaving(false);
    }
  };

  const updateRole = async () => {
    if (selectedRoleId === null || !editingName.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await accessApi.updateRole(selectedRoleId, editingName.trim());
      setRoles((current) => current.map((role) => role.id === selectedRoleId ? updated : role));
      setEditing(false);
    } catch (caughtError) {
      setError(errorMessage(caughtError));
    } finally {
      setSaving(false);
    }
  };

  const deleteRole = async () => {
    const role = roles.find((item) => item.id === selectedRoleId);
    if (!role || !window.confirm(`Delete the “${role.name}” role?`)) return;
    setSaving(true);
    setError(null);
    try {
      await accessApi.deleteRole(role.id);
      const remaining = roles.filter((item) => item.id !== role.id);
      setRoles(remaining);
      setSelectedRoleId(remaining[0]?.id ?? null);
    } catch (caughtError) {
      setError(errorMessage(caughtError));
    } finally {
      setSaving(false);
    }
  };

  const toggleAccess = async (controllerName: string, actionName: string) => {
    if (selectedRoleId === null) return;
    const existing = accesses.find(
      (access) => access.controllerName === controllerName && access.actionName === actionName,
    );
    setSaving(true);
    setError(null);
    try {
      if (existing) {
        await accessApi.deleteRoleAccess(existing.id);
        setAccesses((current) => current.filter((access) => access.id !== existing.id));
      } else {
        const created = await accessApi.createRoleAccess(selectedRoleId, controllerName, actionName);
        setAccesses((current) => [...current, created]);
      }
    } catch (caughtError) {
      setError(errorMessage(caughtError));
    } finally {
      setSaving(false);
    }
  };

  const selectedRole = roles.find((role) => role.id === selectedRoleId);
  const totalPermissions = actions.reduce(
    (total, controller) => total + controller.actionsName.length,
    0,
  );

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Roles & permissions</h1>
          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">{roles.length}</span>
        </div>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Choose a role, then enable the actions it can perform.</p>
      </div>

      {error && (
        <div role="alert" className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          <span>{error}</span>
          <button onClick={() => void load()} className="font-semibold">Retry</button>
        </div>
      )}

      <div className="md:hidden">
        <label htmlFor="mobileRole" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Selected role</label>
        <select id="mobileRole" value={selectedRoleId ?? ""} onChange={(event) => setSelectedRoleId(event.target.value ? Number(event.target.value) : null)} disabled={loading} className={inputClasses}>
          {roles.length === 0 && <option value="">No roles available</option>}
          {roles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}
        </select>
      </div>

      <div className="grid items-start gap-5 md:grid-cols-[16rem_minmax(0,1fr)]">
        <aside className="hidden overflow-hidden rounded-xl border border-gray-200 bg-white md:block dark:border-gray-800 dark:bg-gray-900">
          <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-800">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Available roles</p>
          </div>
          {loading ? (
            <div className="px-4 py-8 text-center text-sm text-gray-500">Loading...</div>
          ) : roles.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-gray-500">No roles yet</div>
          ) : (
            <nav className="space-y-1 p-2" aria-label="Roles">
              {roles.map((role) => (
                <button key={role.id} onClick={() => setSelectedRoleId(role.id)} className={`flex min-h-11 w-full items-center justify-between rounded-lg px-3 text-left text-sm font-medium transition-colors ${selectedRoleId === role.id ? "bg-primary-50 text-primary-700 dark:bg-primary-950/40 dark:text-primary-300" : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"}`}>
                  <span className="truncate">{role.name}</span>
                  {selectedRoleId === role.id && <span className="material-symbols-outlined text-lg">chevron_right</span>}
                </button>
              ))}
            </nav>
          )}
          <form onSubmit={(event) => { event.preventDefault(); void createRole(); }} className="border-t border-gray-200 p-3 dark:border-gray-800">
            <label htmlFor="newRoleName" className="sr-only">New role name</label>
            <div className="flex gap-2">
              <input id="newRoleName" value={newRoleName} onChange={(event) => setNewRoleName(event.target.value)} placeholder="New role" className={inputClasses} />
              <button disabled={saving || !newRoleName.trim()} className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50" aria-label="Add role"><span className="material-symbols-outlined text-xl">add</span></button>
            </div>
          </form>
        </aside>

        <main className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <div className="flex flex-col gap-3 border-b border-gray-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-gray-800">
            {editing && selectedRole ? (
              <form onSubmit={(event) => { event.preventDefault(); void updateRole(); }} className="flex w-full max-w-sm gap-2">
                <input autoFocus value={editingName} onChange={(event) => setEditingName(event.target.value)} className={inputClasses} />
                <button disabled={saving || !editingName.trim()} className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-600 text-white disabled:opacity-50" aria-label="Save role"><span className="material-symbols-outlined text-xl">check</span></button>
                <button type="button" onClick={() => setEditing(false)} className="flex size-10 shrink-0 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800" aria-label="Cancel editing"><span className="material-symbols-outlined text-xl">close</span></button>
              </form>
            ) : (
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-white">{selectedRole?.name ?? "Select a role"}</h2>
                {selectedRole && <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{accesses.length} of {totalPermissions} permissions enabled</p>}
              </div>
            )}
            {selectedRole && !editing && (
              <div className="flex gap-1">
                <button onClick={() => { setEditingName(selectedRole.name); setEditing(true); }} className="flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"><span className="material-symbols-outlined text-lg">edit</span>Edit</button>
                <button onClick={() => void deleteRole()} disabled={saving} className="flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-950/30"><span className="material-symbols-outlined text-lg">delete</span>Delete</button>
              </div>
            )}
          </div>

          {!selectedRole ? (
            <div className="px-6 py-16 text-center text-sm text-gray-500">Create or select a role to manage permissions.</div>
          ) : loadingAccess ? (
            <div className="flex items-center justify-center gap-2 px-6 py-16 text-sm text-gray-500"><span className="material-symbols-outlined animate-spin">progress_activity</span>Loading permissions...</div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-800">
              {actions.map((controller) => (
                <section key={controller.controllerName} className="grid gap-3 px-4 py-4 lg:grid-cols-[10rem_minmax(0,1fr)] lg:px-5">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{controller.controllerName}</h3>
                    <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{controller.actionsName.length} actions</p>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                    {controller.actionsName.map((action) => {
                      const checked = accesses.some((access) => access.controllerName === controller.controllerName && access.actionName === action);
                      return (
                        <label key={action} className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border px-3 text-sm transition-colors ${checked ? "border-primary-200 bg-primary-50 text-primary-800 dark:border-primary-800 dark:bg-primary-950/30 dark:text-primary-200" : "border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"}`}>
                          <input type="checkbox" checked={checked} disabled={saving} onChange={() => void toggleAccess(controller.controllerName, action)} className="size-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                          <span className="truncate">{action}</span>
                        </label>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          )}
        </main>
      </div>

      <form onSubmit={(event) => { event.preventDefault(); void createRole(); }} className="flex gap-2 md:hidden">
        <label htmlFor="mobileNewRole" className="sr-only">New role name</label>
        <input id="mobileNewRole" value={newRoleName} onChange={(event) => setNewRoleName(event.target.value)} placeholder="New role name" className={inputClasses} />
        <button disabled={saving || !newRoleName.trim()} className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-lg bg-primary-600 px-4 text-sm font-medium text-white disabled:opacity-50"><span className="material-symbols-outlined text-xl">add</span>Add</button>
      </form>
    </div>
  );
}
