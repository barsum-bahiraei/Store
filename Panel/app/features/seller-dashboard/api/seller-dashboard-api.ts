import { httpClient } from "~/shared/http/http-client";
import { dedupe } from "~/shared/http/dedupe";
import { resolveResult } from "~/shared/http/resolve-result";
import type { ApiResult } from "~/shared/models/api-result";
import type {
  CategorySalesItem,
  DiscountStatisticsItem,
  OrderAttentionItem,
  OrderStatusCountItem,
  OrderStatusUpdateInput,
  OrderStatusUpdateOutput,
  PagedResult,
  SalesChartGroupBy,
  SalesChartPoint,
  SellerDashboardStats,
  SellerDateRange,
  TopProductItem,
  TopVariantItem,
  LowStockItem,
  ProductWithoutSalesItem,
} from "../models/seller-dashboard";

function rangeQuery(range?: SellerDateRange): Record<string, string> {
  const query: Record<string, string> = {};
  if (range?.from) query.From = range.from;
  if (range?.to) query.To = range.to;
  return query;
}

function pageQuery(page?: number, pageSize?: number): Record<string, string> {
  return {
    Page: String(page ?? 1),
    PageSize: String(pageSize ?? 10),
  };
}

function listKey(path: string, query: Record<string, string>): string {
  const search = new URLSearchParams(query).toString();
  return `seller-dashboard:${path}:${search}`;
}

export const sellerDashboardApi = {
  async getDashboard(range?: SellerDateRange): Promise<SellerDashboardStats> {
    const query = rangeQuery(range);
    return dedupe(listKey("Dashboard", query), async () => {
      const { data } = await httpClient.get<ApiResult<SellerDashboardStats>>(
        "/api/Seller/Dashboard",
        { params: query },
      );
      return resolveResult(data, "Unable to load dashboard stats");
    });
  },

  async getSalesChart(
    range: SellerDateRange & { groupBy: SalesChartGroupBy },
  ): Promise<SalesChartPoint[]> {
    const query = { ...rangeQuery(range), GroupBy: range.groupBy };
    return dedupe(listKey("SalesChart", query), async () => {
      const { data } = await httpClient.get<ApiResult<SalesChartPoint[]>>(
        "/api/Seller/SalesChart",
        { params: query },
      );
      return resolveResult(data, "Unable to load sales chart");
    });
  },

  async getTopProducts(
    range?: SellerDateRange,
    page?: number,
    pageSize?: number,
  ): Promise<PagedResult<TopProductItem>> {
    const query = { ...rangeQuery(range), ...pageQuery(page, pageSize) };
    return dedupe(listKey("TopProducts", query), async () => {
      const { data } = await httpClient.get<ApiResult<PagedResult<TopProductItem>>>(
        "/api/Seller/TopProducts",
        { params: query },
      );
      return resolveResult(data, "Unable to load top products");
    });
  },

  async getTopVariants(
    range?: SellerDateRange,
    page?: number,
    pageSize?: number,
  ): Promise<PagedResult<TopVariantItem>> {
    const query = { ...rangeQuery(range), ...pageQuery(page, pageSize) };
    return dedupe(listKey("TopVariants", query), async () => {
      const { data } = await httpClient.get<ApiResult<PagedResult<TopVariantItem>>>(
        "/api/Seller/TopVariants",
        { params: query },
      );
      return resolveResult(data, "Unable to load top variants");
    });
  },

  async getOrderStatuses(range?: SellerDateRange): Promise<OrderStatusCountItem[]> {
    const query = rangeQuery(range);
    return dedupe(listKey("OrderStatuses", query), async () => {
      const { data } = await httpClient.get<ApiResult<OrderStatusCountItem[]>>(
        "/api/Seller/OrderStatuses",
        { params: query },
      );
      return resolveResult(data, "Unable to load order statuses");
    });
  },

  async getLowStock(
    threshold?: number,
    page?: number,
    pageSize?: number,
  ): Promise<PagedResult<LowStockItem>> {
    const query: Record<string, string> = {
      ...pageQuery(page, pageSize),
      Threshold: String(threshold ?? 5),
    };
    return dedupe(listKey("LowStock", query), async () => {
      const { data } = await httpClient.get<ApiResult<PagedResult<LowStockItem>>>(
        "/api/Seller/LowStock",
        { params: query },
      );
      return resolveResult(data, "Unable to load low stock items");
    });
  },

  async getProductsWithoutSales(
    range?: SellerDateRange,
    page?: number,
    pageSize?: number,
  ): Promise<PagedResult<ProductWithoutSalesItem>> {
    const query = { ...rangeQuery(range), ...pageQuery(page, pageSize) };
    return dedupe(listKey("ProductsWithoutSales", query), async () => {
      const { data } = await httpClient.get<ApiResult<PagedResult<ProductWithoutSalesItem>>>(
        "/api/Seller/ProductsWithoutSales",
        { params: query },
      );
      return resolveResult(data, "Unable to load products without sales");
    });
  },

  async getCategorySales(range?: SellerDateRange): Promise<CategorySalesItem[]> {
    const query = rangeQuery(range);
    return dedupe(listKey("CategorySales", query), async () => {
      const { data } = await httpClient.get<ApiResult<CategorySalesItem[]>>(
        "/api/Seller/CategorySales",
        { params: query },
      );
      return resolveResult(data, "Unable to load category sales");
    });
  },

  async getDiscountStatistics(range?: SellerDateRange): Promise<DiscountStatisticsItem[]> {
    const query = rangeQuery(range);
    return dedupe(listKey("DiscountStatistics", query), async () => {
      const { data } = await httpClient.get<ApiResult<DiscountStatisticsItem[]>>(
        "/api/Seller/DiscountStatistics",
        { params: query },
      );
      return resolveResult(data, "Unable to load discount statistics");
    });
  },

  async getOrdersAttention(
    range?: SellerDateRange,
    stuckDays?: number,
  ): Promise<OrderAttentionItem[]> {
    const query = {
      ...rangeQuery(range),
      StuckDays: String(stuckDays ?? 3),
    };
    return dedupe(listKey("OrdersAttention", query), async () => {
      const { data } = await httpClient.get<ApiResult<OrderAttentionItem[]>>(
        "/api/Seller/Orders/Attention",
        { params: query },
      );
      return resolveResult(data, "Unable to load orders needing attention");
    });
  },

  async updateOrderStatus(
    id: number,
    input: OrderStatusUpdateInput,
  ): Promise<OrderStatusUpdateOutput> {
    const { data } = await httpClient.put<ApiResult<OrderStatusUpdateOutput>>(
      `/api/Seller/Order/${id}/Status`,
      input,
    );
    return resolveResult(data, "Unable to update order status");
  },
};
