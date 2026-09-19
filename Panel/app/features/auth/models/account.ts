export interface AccountUser {
  firstName: string;
  lastName: string;
  email: string;
  gender: number;
  address: string | null;
  birthDate: string | null;
  nationalCode: string | null;
  phoneNumber: string | null;
  isEmailVerified: boolean;
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
  firstName: string;
  lastName: string;
  email: string;
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
