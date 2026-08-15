import { httpClient } from "~/shared/http/http-client";
import { resolveResult } from "~/shared/http/resolve-result";
import type { ApiResult } from "~/shared/models/api-result";
import type {
  ControllerActions,
  Role,
  RoleAccess,
  UserDetails,
  UserSummary,
} from "../models/access";

const pendingRequests = new Map<string, Promise<unknown>>();

function dedupe<T>(key: string, request: () => Promise<T>): Promise<T> {
  const pending = pendingRequests.get(key) as Promise<T> | undefined;
  if (pending) return pending;

  const next = request().finally(() => {
    if (pendingRequests.get(key) === next) pendingRequests.delete(key);
  });
  pendingRequests.set(key, next);
  return next;
}

export const accessApi = {
  async listRoles(): Promise<Role[]> {
    return dedupe("roles", async () => {
      const { data } = await httpClient.get<ApiResult<Role[]>>("/api/Account/Role");
      return resolveResult(data, "Unable to load roles");
    });
  },

  async createRole(name: string): Promise<Role> {
    const { data } = await httpClient.post<ApiResult<Role>>("/api/Account/Role", { name });
    return resolveResult(data, "Unable to create role");
  },

  async updateRole(id: number, name: string): Promise<Role> {
    const { data } = await httpClient.put<ApiResult<Role>>(`/api/Account/Role/${id}`, { name });
    return resolveResult(data, "Unable to update role");
  },

  async deleteRole(id: number): Promise<void> {
    const { data } = await httpClient.delete<ApiResult<boolean>>(`/api/Account/Role/${id}`);
    resolveResult(data, "Unable to delete role");
  },

  async listControllerActions(): Promise<ControllerActions[]> {
    return dedupe("controller-actions", async () => {
      const { data } = await httpClient.get<ApiResult<ControllerActions[]>>(
        "/api/Account/ControllerActions",
      );
      return resolveResult(data, "Unable to load available permissions");
    });
  },

  async listRoleAccess(roleId: number): Promise<RoleAccess[]> {
    return dedupe(`role-access-${roleId}`, async () => {
      const { data } = await httpClient.get<ApiResult<RoleAccess[]>>(
        `/api/Account/RoleAccess/${roleId}`,
      );
      return resolveResult(data, "Unable to load role permissions");
    });
  },

  async createRoleAccess(
    roleId: number,
    controllerName: string,
    actionName: string,
  ): Promise<RoleAccess> {
    const { data } = await httpClient.post<ApiResult<RoleAccess>>("/api/Account/RoleAccess", {
      roleId,
      controllerName,
      actionName,
    });
    return resolveResult(data, "Unable to grant permission");
  },

  async deleteRoleAccess(id: number): Promise<void> {
    const { data } = await httpClient.delete<ApiResult<boolean>>(
      `/api/Account/RoleAccess/${id}`,
    );
    resolveResult(data, "Unable to revoke permission");
  },

  async listUsers(): Promise<UserSummary[]> {
    return dedupe("users", async () => {
      const { data } = await httpClient.get<ApiResult<UserSummary[]>>("/api/Account/User");
      return resolveResult(data, "Unable to load users");
    });
  },

  async getUser(id: number): Promise<UserDetails> {
    return dedupe(`user-${id}`, async () => {
      const { data } = await httpClient.get<ApiResult<UserDetails>>(`/api/Account/User/${id}`);
      return resolveResult(data, "Unable to load user roles");
    });
  },

  async listUsersWithRoles(): Promise<UserDetails[]> {
    const users = await this.listUsers();
    return Promise.all(users.map((user) => this.getUser(user.id)));
  },

  async assignRole(userId: number, roleId: number): Promise<{ id: number; userId: number; roleId: number }> {
    const { data } = await httpClient.post<ApiResult<{ id: number; userId: number; roleId: number }>>("/api/Account/UserRole", {
      userId,
      roleId,
    });
    return resolveResult(data, "Unable to assign role");
  },

  async removeUserRole(id: number): Promise<void> {
    const { data } = await httpClient.delete<ApiResult<boolean>>(`/api/Account/UserRole/${id}`);
    resolveResult(data, "Unable to remove role");
  },
};
