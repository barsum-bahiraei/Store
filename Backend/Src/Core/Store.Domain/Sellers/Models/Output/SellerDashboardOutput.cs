namespace Store.Domain.Sellers.Models.Output;

public class SellerDashboardOutput
{
    public decimal TotalSales { get; set; }
    public int OrderCount { get; set; }
    public int ItemsSoldCount { get; set; }
    public decimal AverageOrderValue { get; set; }
    public int CompletedOrderCount { get; set; }
    public int CancelledOrderCount { get; set; }
    public decimal DiscountAmount { get; set; }
}
