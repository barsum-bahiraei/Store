namespace Store.Domain.Sellers.Models.Output;

public class SellerSalesChartOutput
{
    public DateTime Date { get; set; }
    public decimal SalesAmount { get; set; }
    public int OrderCount { get; set; }
    public int ItemsSoldCount { get; set; }
}
