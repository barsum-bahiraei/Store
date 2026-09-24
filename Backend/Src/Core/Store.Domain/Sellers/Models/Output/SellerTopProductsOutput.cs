namespace Store.Domain.Sellers.Models.Output;

public class SellerTopProductsOutput
{
    public int TotalCount { get; set; }
    public List<SellerTopProductItemOutput> Items { get; set; }
}

public class SellerTopProductItemOutput
{
    public int ProductId { get; set; }
    public string ProductName { get; set; }
    public int UnitsSold { get; set; }
    public decimal SalesAmount { get; set; }
}
