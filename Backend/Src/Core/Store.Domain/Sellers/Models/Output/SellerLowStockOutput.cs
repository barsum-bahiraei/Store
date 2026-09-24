namespace Store.Domain.Sellers.Models.Output;

public class SellerLowStockOutput
{
    public int TotalCount { get; set; }
    public List<SellerLowStockItemOutput> Items { get; set; }
}

public class SellerLowStockItemOutput
{
    public int ProductVariantId { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; }
    public decimal Price { get; set; }
    public List<SellerLowStockValueItemOutput> Values { get; set; }
    public int Stock { get; set; }
}

public class SellerLowStockValueItemOutput
{
    public int Id { get; set; }
    public string Size { get; set; }
    public string Name { get; set; }
    public string Code { get; set; }
}
