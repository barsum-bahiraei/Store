export type Gender = 0 | 1 | 2;

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

export type OtpSendInput = {
  phoneNumber: string;
};

export type OtpVerifyInput = {
  phoneNumber: string;
  code: string;
};
