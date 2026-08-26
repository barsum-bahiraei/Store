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

export interface AuthenticatedUser extends AccountUser {
  token: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput extends LoginInput {
  firstName: string;
  lastName: string;
  gender: number;
}
