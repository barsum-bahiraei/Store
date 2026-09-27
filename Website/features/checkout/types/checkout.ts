import { PaymentStatus, type DeliveryMethod, type PaymentMethod } from "@/features/orders/types/invoice";

export { PaymentStatus };

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
  refId: string;
  gatewayUrl: string;
};
