namespace Store.Domain.Sellers.Models.Output;

public class SellerProductsWithoutSalesOutput
{
    public int TotalCount { get; set; }
    public List<SellerProductsWithoutSalesItemOutput> Items { get; set; }
}

public class SellerProductsWithoutSalesItemOutput
{
    public int ProductId { get; set; }
    public string ProductName { get; set; }
}
