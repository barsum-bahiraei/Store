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
  isEmailVerified: boolean;
};

export type AuthenticatedUser = AccountUser & {
  token: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = LoginInput & {
  firstName: string;
  lastName: string;
  gender: Gender;
};
