namespace Store.Domain.Sellers.Models.Output;

public class SellerDiscountStatisticsOutput
{
    public int DiscountCodeId { get; set; }
    public string Code { get; set; }
    public int UsageCount { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal SalesAmount { get; set; }
}
