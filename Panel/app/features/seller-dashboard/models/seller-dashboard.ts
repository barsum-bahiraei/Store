export interface SellerDateRange {
  from?: string;
  to?: string;
}

export interface SellerPageParams {
  page?: number;
  pageSize?: number;
}

export interface PagedResult<T> {
  totalCount: number;
  items: T[];
}

export interface SellerDashboardStats {
  totalSales: number;
  orderCount: number;
  itemsSoldCount: number;
  averageOrderValue: number;
  completedOrderCount: number;
  cancelledOrderCount: number;
  discountAmount: number;
}

export type SalesChartGroupBy = "Day" | "Week" | "Month";

export interface SalesChartPoint {
  date: string;
  salesAmount: number;
  orderCount: number;
  itemsSoldCount: number;
}

export interface TopProductItem {
  productId: number;
  productName: string;
  unitsSold: number;
  salesAmount: number;
}

export interface VariantValueOutput {
  id: number;
  size: string;
  name: string;
  code: string;
}

export interface TopVariantItem {
  productVariantId: number;
  productId: number;
  productName: string;
  price: number;
  stock: number;
  values: VariantValueOutput[];
  unitsSold: number;
  salesAmount: number;
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

export const paymentStatusLabels: Record<number, string> = {
  [PaymentStatus.New]: "جدید",
  [PaymentStatus.ProcessingPayment]: "در حال پرداخت",
  [PaymentStatus.PaymentCompleted]: "پرداخت انجام شد",
  [PaymentStatus.Preparing]: "در حال آماده‌سازی",
  [PaymentStatus.ReadyForShipment]: "آماده ارسال",
  [PaymentStatus.Shipping]: "در حال ارسال",
  [PaymentStatus.Delivered]: "تحویل شد",
  [PaymentStatus.Cancelled]: "لغو شد",
  [PaymentStatus.Failed]: "ناموفق",
};

export const paymentStatusTransitions: Record<number, PaymentStatus[]> = {
  [PaymentStatus.New]: [PaymentStatus.Cancelled],
  [PaymentStatus.ProcessingPayment]: [PaymentStatus.Cancelled],
  [PaymentStatus.PaymentCompleted]: [PaymentStatus.Preparing, PaymentStatus.Cancelled],
  [PaymentStatus.Preparing]: [PaymentStatus.ReadyForShipment, PaymentStatus.Cancelled],
  [PaymentStatus.ReadyForShipment]: [PaymentStatus.Shipping, PaymentStatus.Cancelled],
  [PaymentStatus.Shipping]: [PaymentStatus.Delivered, PaymentStatus.Cancelled],
  [PaymentStatus.Delivered]: [],
  [PaymentStatus.Cancelled]: [],
  [PaymentStatus.Failed]: [],
};

export function allowedNextStatuses(current: number): PaymentStatus[] {
  return paymentStatusTransitions[current] ?? [];
}

export interface OrderStatusCountItem {
  paymentStatus: number;
  count: number;
}

export interface LowStockItem {
  productVariantId: number;
  productId: number;
  productName: string;
  price: number;
  values: VariantValueOutput[];
  stock: number;
}

export interface ProductWithoutSalesItem {
  productId: number;
  productName: string;
}

export interface CategorySalesItem {
  categoryId: number;
  categoryName: string;
  salesAmount: number;
  unitsSold: number;
  orderCount: number;
}

export interface DiscountStatisticsItem {
  discountCodeId: number;
  code: string;
  usageCount: number;
  discountAmount: number;
  salesAmount: number;
}

export interface OrderAttentionItem {
  id: number;
  totalPrice: number;
  totalCount: number;
  createdAt: string;
  updatedAt: string;
  paymentStatus: number;
  paymentMethod: number;
  deliveryMethod: number;
  address: string;
}

export interface OrderStatusUpdateInput {
  PaymentStatus: PaymentStatus;
}

export interface OrderStatusUpdateOutput {
  id: number;
  paymentStatus: number;
}
