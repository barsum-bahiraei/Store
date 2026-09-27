export enum PaymentMethod {
  Cash = 0,
  Online = 1,
  Check = 2,
}

export enum DeliveryMethod {
  Pickup = 0,
  Chapar = 1,
  Tipax = 2,
  Post = 3,
}

export enum PaymentStatus {
  New = 0,
  ProcessingPayment = 1,
  PaymentCompleted = 2,
  Preparing = 3,
  ReadyForShipment = 4,
  Shipping = 5,
  Delivered = 6,
  Cancelled = 7,
  Failed = 8,
}

export type InvoiceListItem = {
  id: number;
  totalPrice: number;
  totalCount: number;
  createdAt: string;
  address: string;
  paymentMethod: PaymentMethod;
  deliveryMethod: DeliveryMethod;
  paymentStatus: PaymentStatus;
};
