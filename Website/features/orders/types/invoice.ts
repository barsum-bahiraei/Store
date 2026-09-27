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

export type InvoiceListItem = {
  id: number;
  totalPrice: number;
  totalCount: number;
  createdAt: string;
  address: string;
  paymentMethod: PaymentMethod;
  deliveryMethod: DeliveryMethod;
};
