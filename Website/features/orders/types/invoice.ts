export enum PaymentMethod {
  Cash = 0,
  Online = 1,
  Check = 2,
}

export enum DeliveryMethod {
  Pickup = 0,
  Delivery = 1,
}

export type InvoiceListItem = {
  id: number;
  totalPrice: number;
  totalCount: number;
  createdAt: string;
  address: string;
  paymentMethod: PaymentMethod;
  deliveryMethod: DeliveryMethod;
};
