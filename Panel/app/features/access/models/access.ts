export interface Role {
  id: number;
  name: string;
}

export interface RoleAccess {
  id: number;
  roleId?: number;
  controllerName: string;
  actionName: string;
}

export interface ControllerActions {
  controllerName: string;
  actionsName: string[];
}

export interface UserListParams {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  birthDate?: string;
  gender?: number;
}

export interface UserSummary {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  birthDate: string;
  gender: number;
  isEmailVerified: boolean;
}

export interface UserRole {
  id: number;
  roleId: number;
  roleName: string;
  access: RoleAccess[];
}

export interface UserDetails extends UserSummary {
  roles: UserRole[];
}
