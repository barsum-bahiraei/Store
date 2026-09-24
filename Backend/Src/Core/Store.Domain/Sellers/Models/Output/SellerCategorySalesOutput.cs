namespace Store.Domain.Sellers.Models.Output;

public class SellerCategorySalesOutput
{
    public int CategoryId { get; set; }
    public string CategoryName { get; set; }
    public decimal SalesAmount { get; set; }
    public int UnitsSold { get; set; }
    public int OrderCount { get; set; }
}
