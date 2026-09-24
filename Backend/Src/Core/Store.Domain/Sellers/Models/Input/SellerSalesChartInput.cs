namespace Store.Domain.Sellers.Models.Input;

public class SellerSalesChartInput
{
    public DateTime? From { get; set; }
    public DateTime? To { get; set; }
    public SalesChartGroupByEnum GroupBy { get; set; }
}
