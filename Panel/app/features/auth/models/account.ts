export enum UserRole {
  Owner = "Owner",
  Seller = "Seller",
  User = "User",
}

export interface AccountUser {
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  gender: number;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  birthDate: string | null;
  nationalCode: string | null;
  phoneNumber: string;
  isEmailVerified: boolean;
  isPhoneNumberVerified: boolean;
  roles: UserRole[];
}

export interface UserProfileUpdateInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  gender: number;
  nationalCode: string | null;
  birthDate: string | null;
}

export interface UserProfileUpdateOutput {
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  gender: number;
  nationalCode: string | null;
  birthDate: string | null;
}

export interface AuthenticatedUser extends AccountUser {
  token: string;
}

export interface OtpSendInput {
  phoneNumber: string;
}

export interface OtpSendOutput {
  expiresAt: string;
}

export interface OtpVerifyInput {
  phoneNumber: string;
  code: string;
}

export interface OtpVerifyOutput {
  id: number;
  phoneNumber: string;
  isNewUser: boolean;
  token: string;
}
