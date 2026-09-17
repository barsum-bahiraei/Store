export enum PaymentMethod {
  Cash,
  Online,
}

export enum DeliveryMethod {
  Pickup,
  Delivery,
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
