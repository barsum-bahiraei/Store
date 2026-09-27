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
  page?: number;
  pageSize?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  birthDate?: string;
  gender?: number;
}

export interface UserSummary {
  id: number;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phoneNumber: string;
  nationalCode: string | null;
  birthDate: string | null;
  gender: number;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  isEmailVerified: boolean;
  isPhoneNumberVerified: boolean;
  roles: string[];
}

export interface UserListPage {
  totalCount: number;
  items: UserSummary[];
}

export interface UserRole {
  id: number;
  roleId: number;
  roleName: string;
  access: RoleAccess[];
}

export interface UserDetails extends Omit<UserSummary, "roles"> {
  roles: UserRole[];
}
