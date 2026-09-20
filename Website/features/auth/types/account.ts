export type Gender = 0 | 1 | 2;

export enum Role {
  Owner = "Owner",
  Seller = "Seller",
  User = "User",
}

export type AccountUser = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
  nationalCode: string | null;
  birthDate: string | null;
  gender: Gender;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  isEmailVerified: boolean;
  roles: string[];
};

export type UpdateUserProfileInput = {
  email: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  gender: Gender;
  nationalCode: string | null;
  birthDate: string | null;
};

export type UpdatedUserProfile = UpdateUserProfileInput;

export type AuthenticatedUser = AccountUser & {
  token: string;
};

export function isUserRole(user?: AccountUser): boolean {
  return Boolean(user?.roles?.includes(Role.User));
}

export type OtpSendInput = {
  phoneNumber: string;
};

export type OtpVerifyInput = {
  phoneNumber: string;
  code: string;
};
