import type { DeliveryMethod, PaymentMethod } from "@/features/orders/types/invoice";

export enum PaymentStatus {
  New = 0,
  Processing = 1,
  Completed = 2,
  Failed = 3,
  Cancelled = 4,
}

export type CheckoutInput = {
  paymentMethod: PaymentMethod;
  deliveryMethod: DeliveryMethod;
  discountCode?: string | null;
};

export type CheckoutOutput = {
  invoiceId: number;
  paymentId: number;
  subtotal: number;
  discountAmount: number;
  amount: number;
  paymentStatus: PaymentStatus;
};
