export enum PaymentMethod {
  Cash = 0,
  Online = 1,
  Check = 2,
}

export interface DiscountCodeUpsertInput {
  code: string;
  discountPercent: number;
  maxDiscountAmount?: number | null;
  paymentMethod?: PaymentMethod | null;
  startDate?: string | null;
  endDate?: string | null;
  isActive: boolean;
  userIds?: number[] | null;
}

export interface DiscountCodeListOutput {
  id: number;
  code: string;
  discountPercent: number;
  maxDiscountAmount: number | null;
  paymentMethod: PaymentMethod | null;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
  assignedUserCount: number;
  usedUserCount: number;
}

export interface DiscountCodeUserOutput {
  id: number;
  userId: number;
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string;
  isUsed: boolean;
  usedAt: string | null;
}

export interface DiscountCodeOutput {
  id: number;
  code: string;
  discountPercent: number;
  maxDiscountAmount: number | null;
  paymentMethod: PaymentMethod | null;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
  users: DiscountCodeUserOutput[];
}
